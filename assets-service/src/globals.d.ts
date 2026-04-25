declare function require(moduleName: string): any;
declare const module: { exports: any };
declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
};
declare const Buffer: {
  from(value: string): any;
};
