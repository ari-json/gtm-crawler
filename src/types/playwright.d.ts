declare module 'playwright' {
  export interface Page {
    content(): Promise<string>;
    evaluate<T>(pageFunction: Function | string, ...args: any[]): Promise<T>;
    goto(url: string, options?: any): Promise<any>;
  }
  
  export interface BrowserContext {
    newPage(): Promise<Page>;
  }
  
  export interface Browser {
    newContext(): Promise<BrowserContext>;
    close(): Promise<void>;
  }
  
  export const chromium: {
    launch(options?: any): Promise<Browser>;
  };
} 