import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchoolLogo } from "@/components/SchoolMark";
import { SCHOOL, studentEmail } from "@/lib/school";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SRSV Class 10 Portal" },
      { name: "description", content: "Students sign in with their Student ID. Teachers and parents sign in with email." },
      { property: "og:title", content: "Sign in — SRSV Class 10 Portal" },
      { property: "og:description", content: "Access assignments, resources and progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function signIn(email: string, password: string) {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message.includes("banned") ? "This account has been deactivated. Please contact your teacher." : "Incorrect ID/email or password.");
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  async function signUp(email: string, password: string, fullName: string) {
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your email to confirm your account, then sign in.");
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-hero p-12 text-navy-foreground lg:flex">
        <div className="pointer-events-none absolute -right-24 top-20 size-96 rounded-full bg-teal/30 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-3">
          <SchoolLogo className="size-12" />
          <span className="text-sm font-semibold">{SCHOOL.sub}</span>
        </Link>
        <div className="relative">
          <h1 className="text-4xl font-semibold leading-tight">{SCHOOL.name}</h1>
          <p className="mt-4 text-lg opacity-85">{SCHOOL.tagline}</p>
        </div>
        <p className="relative text-xs opacity-70">Kalludi, Gowribidanur</p>
      </div>
      <div className="flex items-center justify-center bg-soft p-6">
        <div className="w-full max-w-md card-surface p-8 animate-fade-up">
          <div className="mb-6 flex flex-col items-center text-center lg:hidden">
            <SchoolLogo className="size-20" />
            <p className="mt-3 text-xs font-semibold tracking-widest text-muted-foreground">{SCHOOL.sub}</p>
          </div>
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="mb-6 text-sm text-muted-foreground">Sign in to continue learning.</p>
          <Tabs defaultValue="student">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="staff">Teacher / Parent</TabsTrigger>
              <TabsTrigger value="setup">First setup</TabsTrigger>
            </TabsList>
            <TabsContent value="student">
              <form
                className="mt-4 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  signIn(studentEmail(String(f.get("sid"))), String(f.get("password")));
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="sid">Student ID</Label>
                  <Input id="sid" name="sid" required placeholder="e.g. SRSV10A01" autoComplete="username" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sp">Password</Label>
                  <Input id="sp" name="password" type="password" required autoComplete="current-password" />
                </div>
                <Button className="w-full" disabled={busy}>Sign in</Button>
                <p className="text-center text-xs text-muted-foreground">Forgot your password? Ask your teacher to reset it.</p>
              </form>
            </TabsContent>
            <TabsContent value="staff">
              <form
                className="mt-4 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  signIn(String(f.get("email")), String(f.get("password")));
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="em">Email</Label>
                  <Input id="em" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tp">Password</Label>
                  <Input id="tp" name="password" type="password" required autoComplete="current-password" />
                </div>
                <Button className="w-full" disabled={busy}>Sign in</Button>
              </form>
            </TabsContent>
            <TabsContent value="setup">
              <p className="mt-4 rounded-lg bg-accent p-3 text-xs text-accent-foreground">
                The very first account created becomes the school administrator. Later sign-ups get no access until an administrator grants it.
              </p>
              <form
                className="mt-4 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  signUp(String(f.get("email")), String(f.get("password")), String(f.get("name")));
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="nm">Full name</Label>
                  <Input id="nm" name="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="se">Email</Label>
                  <Input id="se" name="email" type="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="spw">Password</Label>
                  <Input id="spw" name="password" type="password" minLength={8} required />
                </div>
                <Button variant="teal" className="w-full" disabled={busy}>Create account</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
