import {
  subscriptionExchange,
  defaultExchanges,
  ExchangeInput,
  createClient,
  ssrExchange,
  ExchangeIO,
} from "@urql/core";
import { createClient as createWSClient } from "graphql-ws";
import { SSRData } from "@urql/core/dist/types/exchanges/ssr";

declare global {
  interface Window {
    __URQL_DATA__: SSRData;
  }
}

const isServerSide = typeof window === "undefined";

const wsClient = () =>
  createWSClient({
    url: (process.env.HASURA_PROJECT_ENDPOINT as string).replace("http", "ws"),
    connectionParams: () => {
      return isServerSide
        ? {
            headers: {
              "x-hasura-admin-secret": process.env
                .HASURA_ADMIN_SECRET as string,
            },
          }
        : {};
    },
  });

const noopExchange = ({ forward }: ExchangeInput): ExchangeIO => {
  return (operations$) => {
    const operationResult$ = forward(operations$);
    return operationResult$;
  };
};

const subscriptOrNoopExchange = () =>
  isServerSide
    ? noopExchange
    : subscriptionExchange({
        forwardSubscription: (operation) => {
          return {
            subscribe: (sink) => ({
              unsubscribe: wsClient().subscribe(operation, sink),
            }),
          };
        },
      });

const clientConfig = {
  suspense: true,
  url: process.env.HASURA_PROJECT_ENDPOINT as string,
  fetchOptions: () => {
    return isServerSide
      ? {
          headers: {
            "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET as string,
          },
        }
      : {};
  },
  exchanges: [...defaultExchanges, subscriptOrNoopExchange()],
};

export const ssr = ssrExchange({
  isClient: !isServerSide,
  initialState: !isServerSide ? window.__URQL_DATA__ : undefined,
});

export const client = createClient(clientConfig);
