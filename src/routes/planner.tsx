import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { CopyButton, EditableOutput, MarkdownView, RegenerateButton } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalDraft } from "@/hooks/use-local-draft";
import { buildPlan } from "@/lib/ai.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | AI Workplace" },
      {
        name: "description",
        content:
          "Turn your tasks, deadlines and available hours into a prioritised, time-blocked daily or weekly schedule.",
      },
      { property: "og:title", content: "AI Task Planner | AI Workplace" },
      {
        property: "og:description",
        content: "Prioritise tasks and get a realistic time-blocked schedule you can edit.",
      },
    ],
  }),
  component: TaskPlanner,
});

type Horizon = "daily" | "weekly";

function TaskPlanner() {
  const run = useServerFn(buildPlan);
  const [draft, setDraft] = useLocalDraft("awpa:planner-draft", {
    tasks: "",
    notes: "",
    hoursPerDay: 6,
    horizon: "daily" as Horizon,
    output: "",
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const plan = async () => {
    if (draft.tasks.trim().length < 3) {
      toast.error("List at least one task with its deadline and priority.");
      return;
    }
    setLoading(true);
    try {
      const result = await run({
        data: {
          tasks: draft.tasks,
          notes: draft.notes,
          hoursPerDay: draft.hoursPerDay,
          horizon: draft.horizon,
        },
      });
      setDraft((prev) => ({ ...prev, output: result.text }));
      setEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build the plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Task Planner"
        description="Add your tasks with deadlines and priorities, set your working hours, and get a schedule you can adjust."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock aria-hidden="true" className="size-4 text-amber" /> Your workload
          </CardTitle>
          <CardDescription>One task per line works best.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="tasks">Tasks, deadlines and priorities</Label>
            <Textarea
              id="tasks"
              rows={7}
              placeholder={
                "Finish Q3 board deck — due Thursday — high\nReview supplier contract — due Friday — medium\nOnboard new intern — this week — low"
              }
              value={draft.tasks}
              onChange={(e) => setDraft((p) => ({ ...p, tasks: e.target.value }))}
            />
          </div>

          <Tabs
            value={draft.horizon}
            onValueChange={(value) => setDraft((p) => ({ ...p, horizon: value as Horizon }))}
          >
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="daily" className="min-h-10">
                Daily plan
              </TabsTrigger>
              <TabsTrigger value="weekly" className="min-h-10">
                Weekly plan
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-3">
            <Label htmlFor="hours">
              Available working hours per day:{" "}
              <span className="font-semibold text-cyan">{draft.hoursPerDay}</span>
            </Label>
            <Slider
              id="hours"
              min={1}
              max={12}
              step={1}
              value={[draft.hoursPerDay]}
              onValueChange={([value]) => setDraft((p) => ({ ...p, hoursPerDay: value }))}
              aria-label="Available working hours per day"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Constraints or preferences (optional)</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Deep work in the morning. Standing meetings 14:00–15:00 daily."
              value={draft.notes}
              onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>

          <Button onClick={plan} disabled={loading} className="min-h-11 w-full sm:w-auto">
            {loading ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
            {loading ? "Building your schedule…" : "Generate plan"}
          </Button>
        </CardContent>
      </Card>

      {draft.output ? (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Your plan</CardTitle>
              <CardDescription>Edit it to match how your day actually runs.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
                {editing ? "Preview" : "Edit plan"}
              </Button>
              <CopyButton value={draft.output} />
              <RegenerateButton onClick={plan} disabled={loading} />
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <EditableOutput
                id="plan-output"
                label="Generated plan"
                value={draft.output}
                onChange={(value) => setDraft((p) => ({ ...p, output: value }))}
                rows={20}
              />
            ) : (
              <MarkdownView content={draft.output} />
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
