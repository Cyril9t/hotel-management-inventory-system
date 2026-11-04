import { Moon, Sun } from "lucide-react";
import { UseMetricCards } from "~/Context/Context";
import { Button } from "~/components/ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = UseMetricCards();
    const isDark = theme === "dark";

    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}
