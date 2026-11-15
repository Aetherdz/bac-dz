import type { Block } from "@/content/types";
import { IconAlert, IconInfo } from "./icons";

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function Blocks({ blocks, locale }: { blocks: Block[]; locale: string }) {
  return (
    <div className="space-y-5 text-[15.5px] leading-8 text-ink/90">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "lead":
            return (
              <p key={index} className="text-lg leading-9 text-ink">
                {block.text}
              </p>
            );
          case "p":
            return <p key={index}>{block.text}</p>;
          case "h2":
            return (
              <h2
                key={index}
                id={block.id ?? slugifyHeading(block.text)}
                className="scroll-mt-28 pt-4 text-[1.4rem] font-semibold leading-snug tracking-tight text-ink sm:text-2xl"
              >
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={index}
                id={block.id ?? slugifyHeading(block.text)}
                className="scroll-mt-28 pt-2 text-lg font-semibold text-ink"
              >
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={index} className="space-y-2 ps-5">
                {block.items.map((item, i) => (
                  <li key={i} className="list-disc marker:text-brand">
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={index} className="space-y-2 ps-5">
                {block.items.map((item, i) => (
                  <li key={i} className="list-decimal marker:text-brand">
                    {item}
                  </li>
                ))}
              </ol>
            );
          case "table":
            return (
              <figure key={index} className="my-6">
                <div className="table-wrap">
                  <table className="data">
                    <thead>
                      <tr>
                        {block.head.map((cell, i) => (
                          <th key={i} scope="col" className={i === 0 ? "" : "n"}>
                            {cell}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, r) => (
                        <tr key={r}>
                          {row.map((cell, c) => (
                            <td key={c} className={c === 0 ? "" : "n"}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {block.caption && <figcaption className="mt-2 text-xs text-muted">{block.caption}</figcaption>}
              </figure>
            );
          case "callout": {
            const tone =
              block.tone === "warn"
                ? "border-accent/40 bg-accent/[0.06]"
                : block.tone === "official"
                  ? "border-gold/40 bg-gold/[0.07]"
                  : block.tone === "calc"
                    ? "border-brand/40 bg-brand/[0.05]"
                    : "border-line bg-raised";
            return (
              <aside key={index} className={`rounded-card border p-4 sm:p-5 ${tone}`}>
                <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-ink">
                  {block.tone === "warn" ? <IconAlert size={16} /> : <IconInfo size={16} />}
                  {block.title ?? (block.tone === "official" ? "معلومة رسمية" : "ملاحظة")}
                </div>
                <p className="text-[14.5px] leading-7 text-ink/80">{block.text}</p>
              </aside>
            );
          }
          case "formula":
            return (
              <div key={index} className="rounded-card border border-line bg-raised p-4 text-center">
                <div dir="ltr" className="num overflow-x-auto whitespace-nowrap font-mono text-[15px] text-ink">
                  {block.expression}
                </div>
                {block.note && <p className="mt-2 text-xs text-muted">{block.note}</p>}
              </div>
            );
          case "steps":
            return (
              <ol key={index} className="space-y-4">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="num mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-raised text-xs font-semibold text-brand">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-ink">{item.title}</div>
                      <p className="text-[14.5px] leading-7 text-ink/80">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={index}
                className="border-s-2 border-brand/40 ps-4 text-[15px] italic text-ink/80"
              >
                {block.text}
                {block.cite && <footer className="mt-1 text-xs not-italic text-muted">— {block.cite}</footer>}
              </blockquote>
            );
          case "kv":
            return (
              <dl key={index} className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {block.items.map((item, i) => (
                  <div key={i} className="border-b border-line pb-2">
                    <dt className="text-xs uppercase tracking-wide text-muted">{item.label}</dt>
                    <dd className="mt-0.5 text-[15px] font-medium text-ink">{item.value}</dd>
                  </div>
                ))}
              </dl>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
