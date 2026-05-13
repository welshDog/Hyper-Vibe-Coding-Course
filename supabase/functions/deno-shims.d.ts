declare const Deno: any;

declare module "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare module "jsr:@supabase/supabase-js@2" {
  export const createClient: any;
}

declare module "npm:viem@2.21.0/accounts" {
  export const privateKeyToAccount: any;
}

declare module "npm:viem@2.21.0" {
  export const concatHex: any;
  export const createPublicClient: any;
  export const createWalletClient: any;
  export const decodeEventLog: any;
  export const encodeFunctionData: any;
  export const http: any;
  export const parseAbi: any;
}

declare module "npm:viem@2.21.0/chains" {
  export const base: any;
  export const baseSepolia: any;
}

declare module "npm:ox@0.14.20/erc8021" {
  export const Attribution: any;
}
