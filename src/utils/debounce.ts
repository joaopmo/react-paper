export function debounce<F extends (...args: any[]) => any>(
  cb: F,
  ms: number,
  immediate: boolean,
): F {
  let timeout: null | ReturnType<typeof setTimeout> = null;

  return function (this: any, ...args: Parameters<F>) {
    const callNow = immediate && timeout === null;
    if (timeout !== null) clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) cb.apply(this, args);
    }, ms);

    // immediate mode and no wait timer? Execute the function immediately
    if (callNow) cb.apply(this, args);
  } as F;
}
