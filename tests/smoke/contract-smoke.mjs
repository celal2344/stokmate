import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { writeFile } from "node:fs/promises";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const baseUrl = (
  process.env.STOKMATE_API_BASE_URL ?? "http://localhost:5080"
).replace(/\/$/, "");
const swaggerPath = "packages/api-client/openapi/stokmate.openapi.json";
const generatedPath = "packages/api-client/src/generated";
const pnpmCli = resolve(root, "node_modules/pnpm/bin/pnpm.cjs");

class ContractSmokeError extends Error {
  constructor(message) {
    super(message);
    this.name = "ContractSmokeError";
  }
}

function run(command, args) {
  try {
    execFileSync(command, args, { cwd: root, stdio: "inherit" });
  } catch (error) {
    throw new ContractSmokeError(
      `${command} ${args.join(" ")} failed: ${error.message}`,
    );
  }
}

function runPnpm(args) {
  run(process.execPath, [pnpmCli, ...args]);
}

function contractArtifactsAreDirty() {
  const output = execFileSync(
    "git",
    [
      "status",
      "--porcelain",
      "--untracked-files=all",
      "--",
      swaggerPath,
      generatedPath,
    ],
    { cwd: root, encoding: "utf8" },
  );
  return output.trim();
}

async function main() {
  const beforeGeneration = contractArtifactsAreDirty();
  const swaggerResponse = await fetch(
    `${baseUrl}/swagger/v1/swagger.json`,
  ).catch((error) => {
    throw new ContractSmokeError(
      `Swagger request to ${baseUrl} failed: ${error.message}`,
    );
  });
  if (swaggerResponse.status !== 200) {
    throw new ContractSmokeError(
      `Swagger request: expected HTTP 200, received ${swaggerResponse.status}: ${await swaggerResponse.text()}`,
    );
  }

  await writeFile(
    resolve(root, swaggerPath),
    new Uint8Array(await swaggerResponse.arrayBuffer()),
  );
  runPnpm(["--filter", "@stokmate/api-client", "generate"]);
  runPnpm(["--filter", "@stokmate/api-client", "build"]);
  runPnpm(["--filter", "@stokmate/domain", "build"]);
  runPnpm(["--filter", "@stokmate/i18n", "build"]);
  runPnpm(["--filter", "@stokmate/api-client", "typecheck"]);
  runPnpm(["--filter", "@stokmate/domain", "typecheck"]);
  runPnpm(["--filter", "@stokmate/i18n", "typecheck"]);
  runPnpm(["--filter", "@stokmate/web", "typecheck"]);
  runPnpm(["--filter", "@stokmate/mobile", "typecheck"]);

  const afterGeneration = contractArtifactsAreDirty();
  if (beforeGeneration || afterGeneration) {
    const state = [
      beforeGeneration ? `stale before generation:\n${beforeGeneration}` : "",
      afterGeneration ? `stale after generation:\n${afterGeneration}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    throw new ContractSmokeError(
      `Committed contract artifacts are stale.\n${state}`,
    );
  }

  console.log(
    "Contract smoke passed: Swagger, generated artifacts, and consumer typechecks are current.",
  );
}

main().catch((error) => {
  console.error(`Contract smoke failed: ${error.message}`);
  process.exitCode = 1;
});
