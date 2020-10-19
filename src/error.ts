import { Lookup } from './types';

export function error(
  type: Lookup.ErrorType,
  message?: string,
  originalError?: any
): Lookup.Error {
  const err = new Error(message);
  (err as any).type = type;
  (err as any).originalError = originalError;
  return (err as unknown) as Lookup.Error;
}
