/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_URL?: string;
}

declare module '*.jsx' {
  import type { ComponentType } from 'react';
  const component: ComponentType;
  export default component;
}
