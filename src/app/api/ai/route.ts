import { NextRequest, NextResponse } from 'next/server';
import aiService from '@/lib/ai-service';
import { AiRequest, ApiError } from '@/types/ai';

// Simple in-memory rate limiter (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Clean up expired rate limit entries
    cleanupRateLimitStore();

    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      const error: ApiError = {
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        details: {
          limit: RATE_LIMIT_MAX_REQUESTS,
          windowMs: RATE_LIMIT_WINDOW,
        },
      };
      return NextResponse.json(error, { status: 429 });
    }

    // Parse request body
    let body: AiRequest;
    try {
      body = await request.json();
    } catch {
      const error: ApiError = {
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Validate request
    if (!aiService.validateRequest(body)) {
      const error: ApiError = {
        error: 'Invalid request format',
        code: 'INVALID_REQUEST',
        details: {
          required: ['mode (chat|analyze|summarize)', 'question (string)'],
          optional: ['context (string)', 'userSettings (object)'],
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Check if streaming is requested
    const stream = request.headers.get('accept') === 'text/event-stream';

    if (stream) {
      // Streaming response
      const encoder = new TextEncoder();
      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of aiService.generateStreamingResponse(body)) {
              const data = `data: ${JSON.stringify(chunk)}\n\n`;
              controller.enqueue(encoder.encode(data));

              if (chunk.done) {
                break;
              }
            }
          } catch (error) {
            const errorChunk = {
              error: `Streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              done: true,
            };
            const data = `data: ${JSON.stringify(errorChunk)}\n\n`;
            controller.enqueue(encoder.encode(data));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const response = await aiService.generateResponse(body);
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('API Route Error:', error);
    const errorResponse: ApiError = {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : 'Unknown error',
      } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET() {
  const error: ApiError = {
    error: 'Method not allowed',
    code: 'METHOD_NOT_ALLOWED',
  };
  return NextResponse.json(error, { status: 405 });
}