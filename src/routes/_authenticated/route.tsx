import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, Sparkles, LogOut, Menu, Moon, Sun, PanelLeftClose, PanelLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/me";
import { SchoolLogo } from "@/components/SchoolMark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Loading } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Shell,
});

type NavItem = { to: "/dashboard" | "/math-explainer" | "/students"; label: string; icon: typeof Users; staff?: boolean; hideParent?: boolean };
const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/math-explainer", label: "Maths AI Explainer", icon: Sparkles, hideParent: true },
  { to: "/students", label: "Students", icon: Users, staff: true },
];

function Shell() {
  const { data: me, isLoading } = useMe();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading || !me) return <Loading />;
  const items = NAV.filter((n) => (n.staff ? me.isStaff : true) && !(n.hideParent && me.isParent && !me.isStaff && !me.isStudent));
  const roleLabel = me.isAdmin ? "Administrator" : me.isStaff ? "Teacher" : me.isStudent ? "Student" : me.isParent ? "Parent" : "No access yet";

  const nav = (mini: boolean) => (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((n) => {
        const active = path === n.to || path.startsWith(n.to + "/");
        return (
          <Link
            key={n.to}
            to={n.to}
            title={n.label}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-elegant" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              mini && "justify-center px-0",
            )}
          >
            <n.icon className="size-4 shrink-0" />
            {!mini && <span>{n.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (mini: boolean) => (
    <div className={cn("flex items-center gap-3 px-4 py-5", mini && "justify-center px-0")}>
      <SchoolLogo className="size-10 shrink-0" />
      {!mini && (
        <div className="leading-tight">
          <p className="text-xs font-bold tracking-wide text-sidebar-accent-foreground">SRSV VIDYAMANDIRA</p>
          <p className="text-[10px] tracking-widest text-sidebar-primary">CLASS 10 · ICSE</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className={cn("no-print sticky top-0 hidden h-screen flex-col bg-sidebar transition-all md:flex", collapsed ? "w-[72px]" : "w-64")}>
        {brand(collapsed)}
        {nav(collapsed)}
        <div className={cn("border-t border-sidebar-border p-3", collapsed && "px-2")}>
          <button onClick={signOut} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent", collapsed && "justify-center px-0")}>
            <LogOut className="size-4" /> {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0">
              {brand(false)}
              {nav(false)}
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar">
            {collapsed ? <PanelLeft /> : <PanelLeftClose />}
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {dark ? <Sun /> : <Moon />}
          </Button>
          <div className="text-right leading-tight">
            <p className="text-sm font-semibold">{me.fullName}</p>
            <p className="text-xs text-muted-foreground">{roleLabel}{me.studentCode ? ` · ${me.studentCode}` : ""}</p>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={signOut} aria-label="Sign out">
            <LogOut />
          </Button>
        </header>
        <main className="flex-1 bg-soft p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
