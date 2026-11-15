/**
 * Transpile the pure-TypeScript modules used by the tests into `.test-build/`.
 *
 * The site runs through Next.js, but the calculation and study engines must be
 * testable with plain `node --test`. This script keeps a single source of truth:
 * it compiles the real modules instead of duplicating their arithmetic inside
 * the test files.
 *
 * Optional modules (study engine, majors, universities) may be created by other
 * work in progress, so they are only built when the source file exists.
 */
import ts from "typescript";
import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, ".test-build");

/** Modules the existing calculation tests depend on. */
const required = ["content/types.ts", "content/bac.ts", "lib/bac.ts"];

/** Modules that are built when present (the study surface ships incrementally). */
const optional = [
  "content/exam-dates.ts",
  "content/orientation.ts",
  "content/guides.ts",
  "content/exams.ts",
  "content/updates.ts",
  "content/tools.ts",
  "content/universities.ts",
  "lib/study/time.ts",
  "lib/study/pomodoro.ts",
  "lib/study/tasks.ts",
  "lib/study/planner.ts",
  "lib/study/store.ts",
];

/** Every `*.ts` file directly inside a directory, or [] when it does not exist. */
function expandDir(relativeDir) {
  const absolute = path.join(root, relativeDir);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute)
    .filter((name) => name.endsWith(".ts"))
    .sort()
    .map((name) => `${relativeDir}/${name}`);
}

const sources = [...required, ...optional, ...expandDir("lib/majors"), ...expandDir("content/majors")].filter(
  (source, index, all) => all.indexOf(source) === index && existsSync(path.join(root, source)),
);

const toTarget = (source) => source.replace(/\.ts$/, ".mjs");

/**
 * Point every module specifier at the compiled `.mjs` file.
 *
 * `@/x/y` resolves from the project root, `./y` from the importing file, and
 * any bare package specifier is left untouched.
 */
function rewriteSpecifiers(code, source) {
  const sourceDir = path.posix.dirname(source);
  const targetDir = path.posix.dirname(toTarget(source));

  const resolve = (specifier) => {
    let base;
    if (specifier.startsWith("@/")) {
      base = specifier.slice(2);
    } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
      base = path.posix.normalize(path.posix.join(sourceDir, specifier));
    } else {
      return null;
    }

    if (base.endsWith(".ts")) base = base.slice(0, -3);
    const compiled = base.endsWith(".mjs") ? base : `${base}.mjs`;
    const relative = path.posix.relative(targetDir, compiled);
    return relative.startsWith(".") ? relative : `./${relative}`;
  };

  return code.replace(/(\bfrom\s*|\bimport\s*\(\s*)(["'])([^"']+)\2/g, (match, prefix, quote, specifier) => {
    const resolved = resolve(specifier);
    return resolved ? `${prefix}${quote}${resolved}${quote}` : match;
  });
}

await rm(outDir, { recursive: true, force: true });

for (const source of sources) {
  const sourcePath = path.join(root, source);
  const targetPath = path.join(outDir, toTarget(source));
  const code = await readFile(sourcePath, "utf8");
  const { outputText } = ts.transpileModule(code, {
    fileName: source,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: false,
    },
  });

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, rewriteSpecifiers(outputText, source), "utf8");
}

console.log(`test modules written to ${path.relative(root, outDir)}/ (${sources.length} modules)`);
