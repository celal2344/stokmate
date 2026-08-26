import { defineConfig } from "orval";

const input = "./openapi/stokmate.openapi.json";

export default defineConfig({
  client: {
    input: { target: input },
    output: {
      target: "./src/generated/endpoints.ts",
      schemas: "./src/generated/models",
      client: "fetch",
      mode: "single",
      clean: true,
      override: {
        fetch: {
          forceSuccessResponse: true,
          includeHttpResponseReturnType: true
        }
      }
    }
  },
  zod: {
    input: { target: input },
    output: {
      target: "./src/generated/zod.ts",
      client: "zod",
      mode: "single",
      override: {
        zod: {
          variant: "classic",
          version: 4,
          generateReusableSchemas: true
        }
      }
    }
  }
});
