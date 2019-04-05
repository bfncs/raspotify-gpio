export type Procedure = (...args: any[]) => void;

export function debounce<F extends Procedure>(fn: F, waitMs = 50): F {
  let timeoutId: NodeJS.Timeout | undefined;

  return function(this: any, ...args: any[]) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      fn(args);
    }, waitMs);
  } as F;
}
