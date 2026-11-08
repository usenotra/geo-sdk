import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";

import { NotraAnalytics } from "../src/react";
import { NOTRA_SCRIPT_RELEASE } from "../src/script";

const webKey = "nwk.org.project.0000";

describe("NotraAnalytics", () => {
  test("renders the pinned async script", () => {
    expect(
      renderToStaticMarkup(createElement(NotraAnalytics, { webKey }))
    ).toBe(
      `<script src="https://ingest.usenotra.com/api/notra.b726f8942f7a.js" data-key="${webKey}" integrity="${NOTRA_SCRIPT_RELEASE.integrity}" crossorigin="anonymous" async=""></script>`
    );
  });

  test("renders the options as data attributes", () => {
    expect(
      renderToStaticMarkup(
        createElement(NotraAnalytics, {
          webKey,
          pinned: false,
          errors: true,
          hash: true,
          api: "/notra/collect",
        })
      )
    ).toBe(
      `<script src="https://ingest.usenotra.com/api/notra.plus.js" data-key="${webKey}" data-api="/notra/collect" data-hash="" async=""></script>`
    );
  });

  test("renders nothing when disabled, without checking the key", () => {
    expect(
      renderToStaticMarkup(
        createElement(NotraAnalytics, { webKey: "", disabled: true })
      )
    ).toBe("");
  });

  test("moves into head when rendered in body", () => {
    const html = renderToString(
      createElement(
        "html",
        null,
        createElement("head", null, createElement("title", null, "Docs")),
        createElement("body", null, createElement(NotraAnalytics, { webKey }))
      )
    );
    const head = html.slice(html.indexOf("<head>"), html.indexOf("</head>"));
    expect(head).toContain(`data-key="${webKey}"`);
    expect(html.match(/<script /g)).toHaveLength(1);
  });

  test("renders one script when it appears twice", () => {
    const html = renderToString(
      createElement(
        "html",
        null,
        createElement("head"),
        createElement(
          "body",
          null,
          createElement(NotraAnalytics, { webKey }),
          createElement(NotraAnalytics, { webKey })
        )
      )
    );
    expect(html.match(/<script /g)).toHaveLength(1);
  });
});
