import type * as YMaps3 from "ymaps3";

declare global {
  const ymaps3: typeof YMaps3;

  interface Window {
    ymaps3: typeof YMaps3;
  }
}

export {};