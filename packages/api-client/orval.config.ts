import { defineConfig } from "orval";

const input = "./openapi/stokmate.openapi.json";

export default defineConfig({
  client: {
    input: { target: input },
    output: {
      target: "./src/generated/endpoints.ts",
      schemas: {
        path: "./src/generated/models",
        type: "zod"
      },
      client: "fetch",
      mode: "single",
      clean: true,
      override: {
        fetch: {
          forceSuccessResponse: true,
          includeHttpResponseReturnType: true,
          runtimeValidation: true,
          useRuntimeFetcher: true
        }
      }
    }
  }
});
