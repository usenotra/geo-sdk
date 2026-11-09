import { expect, test } from "bun:test";

const ENTRIES: Record<string, string> = {
  index: "geo",
  next: "next",
  nuxt: "nuxt",
  netlify: "netlify",
  tanstack: "tanstack",
  astro: "astro",
  sveltekit: "sveltekit",
  "react-router": "react-router",
  signatures: "signatures",
  classify: "classify",
  markdown: "markdown",
  html: "html",
  feedback: "feedback",
  mcp: "mcp",
  script: "script",
  react: "react",
};

test.each(Object.entries(ENTRIES))("%s forwards every export of @usenotra/sdk/%s", async (entry, target) => {
  const shim = await import(`../src/${entry}.ts`);
  const sdk = await import(`@usenotra/sdk/${target}`);
  expect(Object.keys(shim).sort()).toEqual(Object.keys(sdk).sort());
  for (const name of Object.keys(sdk)) {
    expect(shim[name]).toBe(sdk[name]);
  }
});
