import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { AlertTriangle, CalendarClock, LayoutDashboard, Mail, Menu, Search, Settings, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AccessibilityToggle } from "@/components/accessibility";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/planner", label: "Task Planner", icon: CalendarClock },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export const AI_DISCLAIMER =
  "AI-generated content may contain errors. Review important information before using or sharing it.";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 rounded-lg px-1 py-1" aria-label="AI Workplace home">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-brand">
        <Sparkle aria-hidden="true" className="size-5 text-primary-foreground" />
      </span>
      <span className="leading-tight">
        <span className="block font-sans text-sm font-semibold">AI Workplace</span>
        <span className="block text-xs text-muted-foreground">Productivity Assistant</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      {navItems.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
        >
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <p
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 text-xs text-foreground",
        className,
      )}
    >
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber" />
      <span>{AI_DISCLAIMER}</span>
    </p>
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="space-y-2">
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <div className="space-y-6">
          <Brand />
          <NavLinks />
        </div>
        <AccessibilityToggle />
      </aside>

      <div className="lg:pl-64">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-sidebar/80 px-4 py-3 backdrop-blur lg:hidden">
          <Brand />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation menu" className="min-h-11 min-w-11">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-4">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="mt-6 space-y-6">
                <NavLinks onNavigate={() => setOpen(false)} />
                <AccessibilityToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <main id="main-content" className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:py-10">
          {children}
          <AiDisclaimer className="mt-8" />
        </main>
      </div>
    </div>
  );
}
