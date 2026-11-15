export type Block =
  | { type: "p"; text: string }
  | { type: "lead"; text: string }
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string; id?: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  | { type: "callout"; tone: "info" | "warn" | "official" | "calc"; title?: string; text: string }
  | { type: "formula"; expression: string; note?: string }
  | { type: "steps"; items: { title: string; text: string }[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "kv"; items: { label: string; value: string }[] };

export type SourceRef = {
  label: string;
  url: string;
  kind: "official" | "secondary" | "editorial";
  checkedOn?: string;
  note?: string;
};

export type FaqItem = { q: string; a: string };

export type LocalizedText = { ar: string; fr: string; en: string };
