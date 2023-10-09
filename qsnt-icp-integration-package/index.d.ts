/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}

declare module 'ic-stoic-identity';

export declare global {
  interface Window {
    injectedWeb3: any;
    ic: any;
  }
}

export declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean;
  }
}
