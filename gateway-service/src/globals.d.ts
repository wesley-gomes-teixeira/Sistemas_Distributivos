declare function require(moduleName: string): any;
declare const module: { exports: any };
declare const process: {
  env: Record<string, string | undefined>;
};
declare function fetch(input: string, init?: any): Promise<any>;
