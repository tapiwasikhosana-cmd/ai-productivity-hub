import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AI_DISCLAIMER, PageHeader } from "@/components/app-shell";
import { AccessibilityToggle } from "@/components/accessibility";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | AI Workplace" },
      {
        name: "description",
        content:
          "Manage accessibility mode, locally saved drafts and responsible-AI guidance for your workspace assistants.",
      },
      { property: "og:title", content: "Settings | AI Workplace" },
      {
        property: "og:description",
        content: "Accessibility mode, locally saved drafts and responsible-AI guidance.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [cleared, setCleared] = useState(false);

  const clearDrafts = () => {
    try {
      ["awpa:email-draft", "awpa:research-draft", "awpa:planner-draft"].forEach((key) =>
        window.localStorage.removeItem(key),
      );
      setCleared(true);
      toast.success("Saved drafts cleared. Reload a tool to see it empty.");
    } catch {
      toast.error("Your browser blocked local storage, so nothing was saved to clear.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Preferences are stored in this browser only. There is no account and no server-side data."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accessibility</CardTitle>
          <CardDescription>
            Accessibility Mode increases text size and contrast, strengthens focus outlines and removes
            gradients and animation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccessibilityToggle className="max-w-md" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saved drafts</CardTitle>
          <CardDescription>
            Your email, research and planner inputs and outputs are kept locally so you can pick up
            where you left off.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={clearDrafts} className="min-h-11">
            <Trash2 aria-hidden="true" />
            <span>{cleared ? "Drafts cleared" : "Clear all saved drafts"}</span>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Responsible AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{AI_DISCLAIMER}</p>
          <Separator />
          <ul className="ml-5 list-disc space-y-1.5">
            <li>The assistant cannot browse the web, so links are analysed from prior knowledge.</li>
            <li>Facts, names and figures are never invented for emails — supply them yourself.</li>
            <li>Always review generated content before sending it to a colleague or client.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
