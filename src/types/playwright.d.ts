declare module 'playwright' {
  export interface Page {
    content(): Promise<string>;
    evaluate<T>(pageFunction: Function | string, ...args: any[]): Promise<T>;
    goto(url: string, options?: any): Promise<any>;
    title(): Promise<string>;
    close(): Promise<void>;
  }
  
  export interface BrowserContext {
    newPage(): Promise<Page>;
    newContext(options?: any): Promise<BrowserContext>;
  }
  
  export interface Browser {
    newContext(options?: any): Promise<BrowserContext>;
    close(): Promise<void>;
  }
  
  export const chromium: {
    launch(options?: any): Promise<Browser>;
  };
} 