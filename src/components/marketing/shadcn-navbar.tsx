import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, Moon, Sun, X, Zap } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { CostfyLogo } from "@/components/brand/costfy-mark";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function ShadcnNavbar() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Recursos", href: "#features" },
    { name: "Métricas & DRE", href: "#stats" },
    { name: "Brain Copilot", href: "#brain" },
    { name: "Preços", href: "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <CostfyLogo markSize={26} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema claro e escuro"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <Link
            to="/login"
            className={buttonClass("ghost", "sm", "text-[13px] font-medium text-foreground")}
          >
            Entrar
          </Link>

          <Link
            to="/dashboard"
            className={buttonClass("primary", "sm", "gap-1.5 shadow-sm text-[13px] px-4 font-semibold")}
          >
            <span>Cockpit Executivo</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema claro e escuro"
            className="rounded-lg p-2 text-muted-foreground"
          >
            {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-5 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[14px] font-medium text-muted-foreground hover:text-foreground"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-border flex flex-col gap-2.5">
            <Link
              to="/login"
              className={buttonClass("outline", "md", "w-full justify-center")}
            >
              Entrar
            </Link>
            <Link
              to="/dashboard"
              className={buttonClass("primary", "md", "w-full justify-center gap-2 font-semibold")}
            >
              <Zap className="size-4" />
              <span>Abrir Cockpit Executivo</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
