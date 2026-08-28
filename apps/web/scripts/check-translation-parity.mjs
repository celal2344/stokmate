import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const workspaceRoot = resolve(import.meta.dirname, "../../..");
const resourcePath = (language, namespace) =>
  resolve(
    workspaceRoot,
    `packages/i18n/src/locales/${language}/${namespace}.ts`,
  );

function keysFor(language, namespace) {
  return [
    ...readFileSync(resourcePath(language, namespace), "utf8").matchAll(
      /^\s{2}(?:"([^"]+)"|(\w+)):/gm,
    ),
  ]
    .map((match) => match[1] ?? match[2])
    .sort();
}

for (const namespace of ["web", "mobile"]) {
  const turkishKeys = keysFor("tr", namespace);
  const englishKeys = keysFor("en", namespace);
  const onlyTurkish = turkishKeys.filter((key) => !englishKeys.includes(key));
  const onlyEnglish = englishKeys.filter((key) => !turkishKeys.includes(key));

  if (onlyTurkish.length || onlyEnglish.length) {
    console.error(
      `${namespace} translation resources have different key structures.`,
    );
    if (onlyTurkish.length)
      console.error(`Only Turkish: ${onlyTurkish.join(", ")}`);
    if (onlyEnglish.length)
      console.error(`Only English: ${onlyEnglish.join(", ")}`);
    process.exit(1);
  }

  console.log(
    `${namespace} translation parity passed (${turkishKeys.length} keys).`,
  );
}
