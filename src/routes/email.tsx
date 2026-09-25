import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { CopyButton, EditableOutput, RegenerateButton } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLocalDraft } from "@/hooks/use-local-draft";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator | AI Workplace" },
      {
        name: "description",
        content:
          "Generate professional emails from your purpose, recipient context and key points, in a formal, friendly or persuasive tone.",
      },
      { property: "og:title", content: "Smart Email Generator | AI Workplace" },
      {
        property: "og:description",
        content: "Generate professional emails from your own purpose, context and key points.",
      },
    ],
  }),
  component: EmailGenerator,
});

type Tone = "Formal" | "Friendly" | "Persuasive";

function EmailGenerator() {
  const run = useServerFn(generateEmail);
  const [draft, setDraft] = useLocalDraft("awpa:email-draft", {
    purpose: "",
    context: "",
    keyPoints: "",
    tone: "Formal" as Tone,
    output: "",
  });
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (draft.purpose.trim().length < 3 || draft.context.trim().length < 2) {
      toast.error("Add the purpose and the recipient context first.");
      return;
    }
    setLoading(true);
    try {
      const result = await run({
        data: {
          purpose: draft.purpose,
          context: draft.context,
          keyPoints: draft.keyPoints,
          tone: draft.tone,
        },
      });
      setDraft((prev) => ({ ...prev, output: result.text }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate the email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Email Generator"
        description="Describe the situation and the assistant writes a complete email you can edit before sending."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail aria-hidden="true" className="size-4 text-magenta" /> Email brief
          </CardTitle>
          <CardDescription>All fields are used directly in the prompt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of the email</Label>
            <Input
              id="purpose"
              placeholder="Ask a client for a two-week deadline extension"
              value={draft.purpose}
              onChange={(e) => setDraft((p) => ({ ...p, purpose: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Recipient and context</Label>
            <Textarea
              id="context"
              rows={3}
              placeholder="Thandi Mokoena, procurement lead at Northbridge. We've worked together for a year; the delay is due to a supplier issue."
              value={draft.context}
              onChange={(e) => setDraft((p) => ({ ...p, context: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key-points">Key points (optional)</Label>
            <Textarea
              id="key-points"
              rows={3}
              placeholder="New delivery date 14 March. Offer a progress call on Friday. Apologise briefly."
              value={draft.keyPoints}
              onChange={(e) => setDraft((p) => ({ ...p, keyPoints: e.target.value }))}
            />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Tone</legend>
            <ToggleGroup
              type="single"
              value={draft.tone}
              onValueChange={(value) => value && setDraft((p) => ({ ...p, tone: value as Tone }))}
              className="flex-wrap justify-start gap-2"
            >
              {(["Formal", "Friendly", "Persuasive"] as Tone[]).map((tone) => (
                <ToggleGroupItem
                  key={tone}
                  value={tone}
                  aria-label={`${tone} tone`}
                  className="min-h-11 rounded-xl border border-border px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {tone}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </fieldset>

          <Button onClick={generate} disabled={loading} className="min-h-11 w-full sm:w-auto">
            {loading ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
            {loading ? "Writing your email…" : "Generate email"}
          </Button>
        </CardContent>
      </Card>

      {draft.output ? (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Your email</CardTitle>
              <CardDescription>Edit it freely — changes are saved in this browser.</CardDescription>
            </div>
            <div className="flex gap-2">
              <CopyButton value={draft.output} />
              <RegenerateButton onClick={generate} disabled={loading} />
            </div>
          </CardHeader>
          <CardContent>
            <EditableOutput
              id="email-output"
              label="Generated email"
              value={draft.output}
              onChange={(value) => setDraft((p) => ({ ...p, output: value }))}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
