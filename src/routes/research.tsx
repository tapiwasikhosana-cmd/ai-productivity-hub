import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { CopyButton, MarkdownView, RegenerateButton } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalDraft } from "@/hooks/use-local-draft";
import { runResearch } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant | AI Workplace" },
      {
        name: "description",
        content:
          "Summarise a topic, pasted article or link into key insights, important points and practical recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant | AI Workplace" },
      {
        property: "og:description",
        content: "Turn a topic, article or link into insights and practical recommendations.",
      },
    ],
  }),
  component: ResearchAssistant,
});

type Mode = "topic" | "text" | "url";

const modeCopy: Record<Mode, { label: string; placeholder: string }> = {
  topic: {
    label: "Topic or question",
    placeholder: "How are mid-sized logistics firms using AI for route planning?",
  },
  text: { label: "Article or document text", placeholder: "Paste the content you want analysed…" },
  url: { label: "Website URL", placeholder: "https://example.com/article" },
};

function ResearchAssistant() {
  const run = useServerFn(runResearch);
  const [draft, setDraft] = useLocalDraft("awpa:research-draft", {
    mode: "topic" as Mode,
    query: "",
    output: "",
    usedMode: "topic" as Mode,
    usedQuery: "",
  });
  const [loading, setLoading] = useState(false);

  const analyse = async () => {
    if (draft.query.trim().length < 5) {
      toast.error("Add a bit more detail to analyse.");
      return;
    }
    setLoading(true);
    try {
      const result = await run({ data: { query: draft.query, mode: draft.mode } });
      setDraft((prev) => ({
        ...prev,
        output: result.text,
        usedMode: prev.mode,
        usedQuery: prev.query,
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not complete the research.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Research Assistant"
        description="Analyse a topic, a pasted article or a link. The assistant separates your source material from its own analysis."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen aria-hidden="true" className="size-4 text-cyan" /> What should I look at?
          </CardTitle>
          <CardDescription>
            Links are analysed from the assistant's existing knowledge — it cannot open pages live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Tabs
            value={draft.mode}
            onValueChange={(value) => setDraft((p) => ({ ...p, mode: value as Mode }))}
          >
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="topic" className="min-h-10">
                Topic
              </TabsTrigger>
              <TabsTrigger value="text" className="min-h-10">
                Article text
              </TabsTrigger>
              <TabsTrigger value="url" className="min-h-10">
                URL
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="research-input">{modeCopy[draft.mode].label}</Label>
            <Textarea
              id="research-input"
              rows={draft.mode === "text" ? 10 : 3}
              placeholder={modeCopy[draft.mode].placeholder}
              value={draft.query}
              onChange={(e) => setDraft((p) => ({ ...p, query: e.target.value }))}
            />
          </div>

          <Button onClick={analyse} disabled={loading} className="min-h-11 w-full sm:w-auto">
            {loading ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
            {loading ? "Researching…" : "Analyse"}
          </Button>
        </CardContent>
      </Card>

      {draft.output ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                Your source input ({draft.usedMode})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-secondary/50 p-3 text-sm text-muted-foreground">
                {draft.usedQuery}
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/40">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">AI-generated analysis</CardTitle>
                <CardDescription>
                  Written by AI, not quoted from your source unless stated.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <CopyButton value={draft.output} />
                <RegenerateButton onClick={analyse} disabled={loading} />
              </div>
            </CardHeader>
            <CardContent>
              <MarkdownView content={draft.output} />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
