declare module "data-store" {
  interface BasePathOptions {
    debounce?: number;
    indent?: number | null;
  }
  interface FullPathOptions extends BasePathOptions {
    path: string;
  }
  interface CompoundPathOptions extends BasePathOptions {
    name: string;
    home: string;
    base: string;
  }
  type Options = FullPathOptions | CompoundPathOptions;
  export default class DataStore {
    constructor(name: string, options?: Options, defaults?: any);
    constructor(options?: Options);
    public set(key: string, val: any): this;
    public union(key: string, val: any): this;
    public get(key?: string): any;
    public has(key: string): boolean;
    public hasOwn(key: string): boolean;
    public del(key: string | string[]): void;
    public clone(): any;
    public clear(): void;
    public json(): string;
  }
}
