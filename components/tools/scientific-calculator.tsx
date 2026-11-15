"use client";

import { useMemo, useState } from "react";

type Token = { type: "num"; value: number } | { type: "op"; value: string } | { type: "func"; value: string } | { type: "paren"; value: "(" | ")" };

const FUNCTIONS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sqrt: Math.sqrt,
  abs: Math.abs,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
};

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = input.replace(/\s+/g, "").toLowerCase().replace(/π/g, "pi").replace(/×/g, "*").replace(/÷/g, "/").replace(/,/g, ".");
  while (i < s.length) {
    const char = s[i];
    if (/[0-9.]/.test(char)) {
      let num = "";
      while (i < s.length && /[0-9.]/.test(s[i])) num += s[i++];
      if ((num.match(/\./g) || []).length > 1) throw new Error("bad number");
      tokens.push({ type: "num", value: Number(num) });
      continue;
    }
    if (/[a-z]/.test(char)) {
      let name = "";
      while (i < s.length && /[a-z]/.test(s[i])) name += s[i++];
      if (name === "pi") tokens.push({ type: "num", value: Math.PI });
      else if (name === "e") tokens.push({ type: "num", value: Math.E });
      else if (FUNCTIONS[name]) tokens.push({ type: "func", value: name });
      else throw new Error("unknown function");
      continue;
    }
    if ("+-*/^%".includes(char)) {
      tokens.push({ type: "op", value: char });
      i++;
      continue;
    }
    if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char });
      i++;
      continue;
    }
    throw new Error("unexpected character");
  }
  return tokens;
}

/**
 * Recursive-descent evaluator. Deliberately does not use eval/Function so that
 * pasted or shared expressions can never execute code.
 */
function evaluate(input: string, degrees: boolean): number {
  const tokens = tokenize(input);
  let pos = 0;

  const peek = (): Token | undefined => tokens[pos];

  function parseExpression(): number {
    let value = parseTerm();
    while (peek()?.type === "op" && ["+", "-"].includes((peek() as { value: string }).value)) {
      const op = (tokens[pos++] as { value: string }).value;
      const rhs = parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  function parseTerm(): number {
    let value = parseUnary();
    while (peek()?.type === "op" && ["*", "/", "%"].includes((peek() as { value: string }).value)) {
      const op = (tokens[pos++] as { value: string }).value;
      const rhs = parseUnary();
      if (op === "*") value *= rhs;
      else if (op === "/") {
        if (rhs === 0) throw new Error("division by zero");
        value /= rhs;
      } else value %= rhs;
    }
    return value;
  }

  function parseUnary(): number {
    if (peek()?.type === "op" && ["+", "-"].includes((peek() as { value: string }).value)) {
      const op = (tokens[pos++] as { value: string }).value;
      const value = parseUnary();
      return op === "-" ? -value : value;
    }
    return parsePower();
  }

  function parsePower(): number {
    const base = parsePrimary();
    if (peek()?.type === "op" && (peek() as { value: string }).value === "^") {
      pos++;
      const exponent = parseUnary();
      return Math.pow(base, exponent);
    }
    return base;
  }

  function parsePrimary(): number {
    const token = tokens[pos];
    if (!token) throw new Error("unexpected end");
    if (token.type === "num") {
      pos++;
      return token.value;
    }
    if (token.type === "func") {
      pos++;
      const arg = parsePrimary();
      const fn = FUNCTIONS[token.value];
      const radians = degrees && ["sin", "cos", "tan"].includes(token.value) ? (arg * Math.PI) / 180 : arg;
      const result = fn(radians);
      if (degrees && ["asin", "acos", "atan"].includes(token.value)) return (result * 180) / Math.PI;
      return result;
    }
    if (token.type === "paren" && token.value === "(") {
      pos++;
      const value = parseExpression();
      const closing = tokens[pos];
      if (!closing || closing.type !== "paren" || closing.value !== ")") throw new Error("missing parenthesis");
      pos++;
      return value;
    }
    throw new Error("unexpected token");
  }

  const result = parseExpression();
  if (pos !== tokens.length) throw new Error("trailing tokens");
  if (!Number.isFinite(result)) throw new Error("not finite");
  return result;
}

const KEYS = [
  ["sin", "cos", "tan", "^"],
  ["sqrt", "ln", "log", "("],
  [")", "%", "π", "e"],
  ["7", "8", "9", "÷"],
  ["4", "5", "6", "×"],
  ["1", "2", "3", "−"],
  ["0", ".", "⌫", "+"],
];

export function ScientificCalculator({
  labels,
}: {
  labels: {
    expression: string;
    result: string;
    clear: string;
    equal: string;
    degrees: string;
    radians: string;
    error: string;
    history: string;
  };
}) {
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState<{ expression: string; result: string }[]>([]);
  const [degrees, setDegrees] = useState(true);

  const preview = useMemo(() => {
    if (!expression.trim()) return { value: "", error: false };
    try {
      const value = evaluate(expression, degrees);
      return { value: Number(value.toPrecision(12)).toString(), error: false };
    } catch {
      return { value: "", error: true };
    }
  }, [expression, degrees]);

  function press(key: string) {
    if (key === "⌫") {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }
    if (key === "×") return setExpression((prev) => `${prev}*`);
    if (key === "÷") return setExpression((prev) => `${prev}/`);
    if (key === "−") return setExpression((prev) => `${prev}-`);
    if (["sin", "cos", "tan", "sqrt", "ln", "log"].includes(key)) return setExpression((prev) => `${prev}${key}(`);
    setExpression((prev) => `${prev}${key}`);
  }

  function equal() {
    if (!expression.trim()) return;
    try {
      const value = evaluate(expression, degrees);
      const formatted = Number(value.toPrecision(12)).toString();
      setHistory((prev) => [{ expression, result: formatted }, ...prev].slice(0, 6));
      setExpression(formatted);
    } catch {
      setExpression(expression);
    }
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.12em] text-muted">{labels.expression}</span>
        <div className="flex gap-1 rounded-full border border-line p-0.5 text-[10.5px]">
          <button type="button" onClick={() => setDegrees(true)} className={`rounded-full px-2 py-1 ${degrees ? "bg-brand text-brand-ink" : "text-muted"}`}>
            {labels.degrees}
          </button>
          <button type="button" onClick={() => setDegrees(false)} className={`rounded-full px-2 py-1 ${!degrees ? "bg-brand text-brand-ink" : "text-muted"}`}>
            {labels.radians}
          </button>
        </div>
      </div>

      <input
        aria-label={labels.expression}
        dir="ltr"
        value={expression}
        onChange={(event) => setExpression(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") equal();
        }}
        placeholder="2+2*sin(30)"
        className="num input font-mono text-[15px]"
        spellCheck={false}
        autoComplete="off"
      />
      <div dir="ltr" className="num mt-2 min-h-9 truncate text-end font-mono text-xl text-ink" aria-live="polite">
        {preview.error ? <span className="text-accent text-sm">{labels.error}</span> : preview.value ? `= ${preview.value}` : "—"}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {KEYS.flat().map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            className={`h-11 rounded-lg border text-[14px] font-medium transition-colors ${
              /[0-9.]/.test(key)
                ? "border-line bg-surface text-ink hover:border-brand"
                : "border-line bg-raised text-ink/80 hover:border-brand hover:text-brand"
            }`}
          >
            {key}
          </button>
        ))}
        <button type="button" onClick={() => setExpression("")} className="col-span-2 h-11 rounded-lg border border-accent/30 bg-accent/[0.06] text-[13px] font-semibold text-accent">
          {labels.clear}
        </button>
        <button type="button" onClick={equal} className="col-span-2 h-11 rounded-lg bg-brand text-[13px] font-semibold text-brand-ink">
          {labels.equal}
        </button>
      </div>

      {history.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <div className="mb-1 text-[10.5px] uppercase tracking-wide text-muted">{labels.history}</div>
          <ul className="space-y-1">
            {history.map((item, index) => (
              <li key={`${item.expression}-${index}`} dir="ltr" className="num truncate font-mono text-[12px] text-muted">
                {item.expression} = <span className="text-ink">{item.result}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
