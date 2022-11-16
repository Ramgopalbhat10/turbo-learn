import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [`${process.env.HASURA_PROJECT_ENDPOINT}`]: {
        headers: {
          "x-hasura-admin-secret": `${process.env.HASURA_ADMIN_SECRET}`,
        },
      },
    },
  ],
  documents: "graphql/**/*.graphql",
  generates: {
    "graphql/generated/": {
      // preset: "client",
      config: {
        withHooks: true,
      },
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-document-nodes",
        "urql-introspection",
        "typescript-urql",
      ],
    },
    "./graphql.schema.json": {
      plugins: ["introspection"],
    },
  },
};

export default config;
