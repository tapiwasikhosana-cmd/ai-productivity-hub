import { useEffect, useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/** Minimal markdown view: headings, bullets, tables and paragraphs. */
export function MarkdownView({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let table: string[][] = [];

  const flush = (key: string) => {
    if (list.length) {
      blocks.push(
        <ul key={`ul-${key}`} className="ml-5 list-disc space-y-1.5 text-sm text-muted-foreground">
          {list.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
    if (table.length) {
      const [head, ...rows] = table;
      blocks.push(
        <div key={`tb-${key}`} className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/70">
              <tr>
                {head.map((cell, i) => (
                  <th key={i} scope="col" className="px-3 py-2 font-semibold">
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-muted-foreground">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      table = [];
    }
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();
    const key = String(index);

    if (!line) {
      flush(key);
      return;
    }
    if (/^\|?\s*-{3,}/.test(line) && line.includes("|")) return;
    if (line.startsWith("|") && line.endsWith("|")) {
      if (list.length) flush(key);
      table.push(
        line
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim()),
      );
      return;
    }
    flush(key);
    if (line.startsWith("### ")) {
      blocks.push(
        <h4 key={key} className="pt-2 text-sm font-semibold uppercase tracking-wide text-cyan">
          {line.slice(4)}
        </h4>,
      );
      return;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h3 key={key} className="pt-3 text-lg font-semibold">
          {line.slice(3)}
        </h3>,
      );
      return;
    }
    if (line.startsWith("# ")) {
      blocks.push(
        <h2 key={key} className="pt-3 text-xl font-semibold">
          {line.slice(2)}
        </h2>,
      );
      return;
    }
    if (/^([-*•]|\d+\.)\s+/.test(line)) {
      list.push(line.replace(/^([-*•]|\d+\.)\s+/, ""));
      return;
    }
    blocks.push(
      <p key={key} className="text-sm leading-relaxed text-muted-foreground">
        {renderInline(line)}
      </p>,
    );
  });
  flush("end");

  return <div className="space-y-2">{blocks}</div>;
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied to clipboard");
        } catch {
          toast.error("Your browser blocked copying. Select the text and copy manually.");
        }
      }}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span>{copied ? "Copied" : label}</span>
    </Button>
  );
}

export function RegenerateButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} disabled={disabled}>
      <RefreshCw aria-hidden="true" className={disabled ? "animate-spin" : undefined} />
      <span>Regenerate</span>
    </Button>
  );
}

export function EditableOutput({
  id,
  label,
  value,
  onChange,
  rows = 16,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Textarea
        id={id}
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="resize-y font-body text-sm leading-relaxed"
      />
    </div>
  );
}
