declare function require(moduleName: string): any;
declare const process: {
  env: Record<string, string | undefined>;
};
declare const __dirname: string;
declare interface Window {
  __ASSETFLOW_CONFIG__?: {
    gatewayBaseUrl?: string;
    authBaseUrl?: string;
  };
}
