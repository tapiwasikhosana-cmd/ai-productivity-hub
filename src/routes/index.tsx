import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, Mail, Search, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Your AI workspace for professional emails, research briefs and realistic task schedules.",
      },
      { property: "og:title", content: "Dashboard | AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Your AI workspace for professional emails, research briefs and task schedules.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    to: "/email",
    title: "Smart Email Generator",
    description: "Turn a purpose and a few key points into a polished, ready-to-send email.",
    icon: Mail,
    accent: "text-magenta",
  },
  {
    to: "/research",
    title: "AI Research Assistant",
    description: "Summarise a topic, an article or a link into insights and recommendations.",
    icon: Search,
    accent: "text-cyan",
  },
  {
    to: "/planner",
    title: "AI Task Planner",
    description: "Prioritise your tasks and get a time-blocked daily or weekly schedule.",
    icon: CalendarClock,
    accent: "text-amber",
  },
] as const;

function Dashboard() {
  return (
    <div className="space-y-8">
      <section className="surface-panel overflow-hidden rounded-3xl p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
          Workplace productivity
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
          Do your best work faster with{" "}
          <span className="text-gradient-brand">AI that uses your own inputs</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Three focused assistants for the writing, reading and planning that fills your day. Nothing
          is stored on a server — your drafts stay in this browser.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/email"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-brand px-5 text-sm font-semibold text-primary-foreground"
          >
            Write an email <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            to="/planner"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-5 text-sm font-semibold hover:bg-accent"
          >
            Plan my week
          </Link>
        </div>
      </section>

      <PageHeader
        title="Your assistants"
        description="Each tool builds a structured prompt from what you type, so the output is specific to your situation."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(({ to, title, description, icon: Icon, accent }) => (
          <Link key={to} to={to} className="group rounded-2xl">
            <Card className="h-full transition-colors group-hover:border-primary/60">
              <CardHeader>
                <Icon aria-hidden="true" className={`size-6 ${accent}`} />
                <CardTitle className="mt-3 text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open <ArrowRight aria-hidden="true" className="size-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <Zap aria-hidden="true" className="size-5 text-amber" />
            <CardTitle className="mt-2 text-base">Built around your input</CardTitle>
            <CardDescription>
              Every result is generated live from the details you provide — never canned demo text.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <ShieldCheck aria-hidden="true" className="size-5 text-cyan" />
            <CardTitle className="mt-2 text-base">Review before you send</CardTitle>
            <CardDescription>
              Outputs are editable, and the assistant flags where it is inferring rather than quoting.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
