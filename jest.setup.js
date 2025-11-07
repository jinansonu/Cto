import '@testing-library/jest-dom'

// Polyfill TextEncoder/TextDecoder for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill fetch for OpenAI
global.fetch = require('jest-fetch-mock');

// Mock Web APIs
global.Request = jest.fn();
global.Response = jest.fn();
global.Headers = jest.fn();