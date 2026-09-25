import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type A11yContextValue = {
  accessibilityMode: boolean;
  setAccessibilityMode: (value: boolean) => void;
};

const A11yContext = createContext<A11yContextValue>({
  accessibilityMode: false,
  setAccessibilityMode: () => {},
});

const STORAGE_KEY = "awpa:accessibility-mode";

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [accessibilityMode, setMode] = useState(false);

  useEffect(() => {
    try {
      setMode(window.localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("a11y-mode", accessibilityMode);
  }, [accessibilityMode]);

  const setAccessibilityMode = useCallback((value: boolean) => {
    setMode(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo(
    () => ({ accessibilityMode, setAccessibilityMode }),
    [accessibilityMode, setAccessibilityMode],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

export function useAccessibility() {
  return useContext(A11yContext);
}

export function AccessibilityToggle({ className }: { className?: string }) {
  const { accessibilityMode, setAccessibilityMode } = useAccessibility();

  return (
    <div className={className}>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/60 px-3 py-2">
        <Eye aria-hidden="true" className="size-4 text-cyan" />
        <Label htmlFor="accessibility-mode" className="flex-1 text-sm">
          Accessibility Mode
        </Label>
        <Switch
          id="accessibility-mode"
          checked={accessibilityMode}
          onCheckedChange={setAccessibilityMode}
          aria-describedby="accessibility-mode-hint"
        />
      </div>
      <p id="accessibility-mode-hint" className="mt-2 px-1 text-xs text-muted-foreground">
        Larger text, stronger contrast and reduced visual effects.
      </p>
    </div>
  );
}
