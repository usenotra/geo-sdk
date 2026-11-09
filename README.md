# @usenotra/geo (deprecated)

`@usenotra/geo` moved into [`@usenotra/sdk`](https://github.com/usenotra/typescript-sdk), together with the Notra API client. Same code, same options, same subpaths:

```bash
npm uninstall @usenotra/geo
npm install @usenotra/sdk
```

| Before | After |
| --- | --- |
| `@usenotra/geo` | `@usenotra/sdk/geo` |
| `@usenotra/geo/next`, `/nuxt`, `/netlify`, `/tanstack`, `/astro`, `/sveltekit`, `/react-router` | `@usenotra/sdk/next`, `/nuxt`, `/netlify`, `/tanstack`, `/astro`, `/sveltekit`, `/react-router` |
| `@usenotra/geo/react`, `/script`, `/mcp`, `/feedback` | `@usenotra/sdk/react`, `/script`, `/mcp`, `/feedback` |
| `@usenotra/geo/markdown`, `/html`, `/classify`, `/signatures` | `@usenotra/sdk/markdown`, `/html`, `/classify`, `/signatures` |

This last version forwards every import to `@usenotra/sdk`, so nothing breaks before you switch. See the [migration guide](https://github.com/usenotra/typescript-sdk/blob/main/MIGRATION.md#from-usenotrageo).

## License

MIT. Copyright (c) 2026 Notra, Inc. See [LICENSE](./LICENSE).
