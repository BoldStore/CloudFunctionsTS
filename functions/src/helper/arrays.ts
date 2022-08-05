/* eslint-disable @typescript-eslint/no-explicit-any */
export const chunkArray: (arr: any[], size: number) => any[] = (arr, size) =>
  arr.length > size
    ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
    : [arr];
