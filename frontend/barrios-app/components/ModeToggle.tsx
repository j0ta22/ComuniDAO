'use client';

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // 👈 evita renderizar hasta estar en cliente

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative p-2"
    >
      <Sun
        className={`h-5 w-5 transition-transform ${
          theme === 'dark' ? 'transform -rotate-90 scale-0' : 'translate-x-0 scale-100'
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-transform ${
          theme === 'dark' ? 'translate-x-0 scale-100' : 'transform rotate-90 scale-0'
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
