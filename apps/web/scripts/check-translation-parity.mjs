import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const workspaceRoot = resolve(import.meta.dirname, "../../..");
const resourcePath = (language) =>
  resolve(workspaceRoot, `packages/i18n/src/locales/${language}/web.ts`);

function keysFor(language) {
  return [
    ...readFileSync(resourcePath(language), "utf8").matchAll(/^\s{2}(\w+):/gm),
  ]
    .map((match) => match[1])
    .sort();
}

const turkishKeys = keysFor("tr");
const englishKeys = keysFor("en");
const onlyTurkish = turkishKeys.filter((key) => !englishKeys.includes(key));
const onlyEnglish = englishKeys.filter((key) => !turkishKeys.includes(key));

if (onlyTurkish.length || onlyEnglish.length) {
  console.error("Web translation resources have different key structures.");
  if (onlyTurkish.length)
    console.error(`Only Turkish: ${onlyTurkish.join(", ")}`);
  if (onlyEnglish.length)
    console.error(`Only English: ${onlyEnglish.join(", ")}`);
  process.exit(1);
}

console.log(`Web translation parity passed (${turkishKeys.length} keys).`);
