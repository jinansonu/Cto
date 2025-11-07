import { cookies } from 'next/headers';
import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export const createServerClient = () => {
  return createServerComponentClient<Database>({
    cookies
  });
};

export const createRouteClient = () => {
  return createRouteHandlerClient<Database>({
    cookies
  });
};
