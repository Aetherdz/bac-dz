/**
 * Transpile the pure-TypeScript modules used by the tests into `.test-build/`.
 *
 * The site runs through Next.js, but the calculation engine must be testable
 * with plain `node --test`. This script keeps a single source of truth: it
 * compiles `lib/bac.ts` and its data dependency instead of duplicating the
 * arithmetic inside the test file.
 */
import ts from "typescript";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, ".test-build");

const files = [
  ["content/types.ts", "content/types.mjs"],
  ["content/bac.ts", "content/bac.mjs"],
  ["lib/bac.ts", "lib/bac.mjs"],
];

await rm(outDir, { recursive: true, force: true });

for (const [source, target] of files) {
  const sourcePath = path.join(root, source);
  const targetPath = path.join(outDir, target);
  const code = await readFile(sourcePath, "utf8");
  const { outputText } = ts.transpileModule(code, {
    fileName: source,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: false,
    },
  });

  const rewritten = outputText
    .replace(/from\s+"@\/content\/bac"/g, 'from "../content/bac.mjs"')
    .replace(/from\s+"@\/lib\/i18n"/g, 'from "../lib/i18n.mjs"')
    .replace(/from\s+"\.\/types"/g, 'from "./types.mjs"');

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, rewritten, "utf8");
}

console.log(`test modules written to ${path.relative(root, outDir)}/`);
