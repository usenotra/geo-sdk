export interface NotraScriptOptions {
  /** The project's public web key, `nwk.…`. */
  webKey: string;
  /** Load `notra.plus.js`, which also reports JavaScript errors. */
  errors?: boolean;
  /** Count `#hash` route changes as page views. */
  hash?: boolean;
  /** Beacon endpoint. Defaults to `/api/collect` on the script's origin. */
  api?: string;
  /** Load the build this SDK release pins, with its integrity hash. Defaults to true. */
  pinned?: boolean;
  /** Origin the script loads from. Defaults to `https://ingest.usenotra.com`. */
  endpoint?: string;
  /** Full script URL, for self-hosting. Overrides `endpoint`, `errors` and `pinned`. */
  src?: string;
  /** Subresource Integrity value, `sha384-…`. Overrides the pinned build's value. */
  integrity?: string;
}

export interface NotraScriptAttributes {
  src: string;
  integrity?: string;
  crossOrigin?: "anonymous";
  defer: true;
  "data-key": string;
  "data-api"?: string;
  "data-hash"?: "";
}

export interface NotraScriptRelease {
  /** `notra.<version>.js` or `notra.plus.<version>.js`. */
  file: string;
  /** Subresource Integrity value, `sha384-<base64>`. */
  integrity: string;
}

export interface NotraAnalyticsProps extends NotraScriptOptions {
  /** Render nothing, for example outside production. */
  disabled?: boolean;
}
