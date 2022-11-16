import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import { Provider } from "urql";
import prepass from "react-ssr-prepass";
import { ssr, client } from "~/utils/urql-client";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const App = (
    <Provider value={client}>
      <RemixServer context={remixContext} url={request.url} />
    </Provider>
  );
  await prepass(App);
  const data = JSON.stringify(ssr.extractData());
  const markup = renderToString(
    <>
      {App}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__URQL_DATA__=${JSON.stringify(data).replace(
            /</g,
            "\\u003c"
          )}`,
        }}
      />
    </>
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
