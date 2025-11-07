export type APIResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};
