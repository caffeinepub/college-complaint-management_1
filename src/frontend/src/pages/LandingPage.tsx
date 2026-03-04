import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Clock,
  Loader2,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: MessageSquare,
    title: "Easy Submission",
    desc: "Submit complaints in minutes with a structured, guided form.",
  },
  {
    icon: Clock,
    title: "Real-time Tracking",
    desc: "Monitor the status of every complaint with live updates.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    desc: "Your identity is protected with Internet Identity authentication.",
  },
  {
    icon: BarChart3,
    title: "Admin Analytics",
    desc: "College administration gets full visibility into grievance trends.",
  },
];

export function LandingPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isLoggingIn = loginStatus === "logging-in";
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      return;
    }
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === "User is already authenticated") {
        queryClient.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  return (
    <div
      data-ocid="landing.page"
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground tracking-tight">
            Aditya University
          </span>
        </div>
        <Button
          data-ocid="landing.login_button"
          onClick={handleAuth}
          disabled={isLoggingIn}
          className="font-ui font-semibold px-6"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Background image with overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/uploads/aditya-1--1.jpeg"
              alt="Aditya University campus aerial view"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-background" />
          </div>

          {/* Hero content */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-28 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-ui font-semibold px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Powered by Internet Computer
              </span>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-3">
                Aditya University
              </h1>
              <p
                className="text-white/90 text-xl md:text-2xl font-ui font-semibold max-w-2xl mx-auto mb-4 tracking-wide uppercase"
                style={{ letterSpacing: "0.08em" }}
              >
                Grievance Management System
              </p>
              <p className="text-white/70 text-base md:text-lg font-ui max-w-2xl mx-auto mb-3">
                Centralized Grievance Handling for Students &amp; Staff
              </p>
              <p className="text-white/60 text-sm font-ui max-w-xl mx-auto mb-10">
                A transparent, secure platform to submit, track, and resolve
                academic grievances efficiently.
              </p>
              <Button
                size="lg"
                data-ocid="landing.login_button"
                onClick={handleAuth}
                disabled={isLoggingIn}
                className="font-ui font-semibold px-8 py-6 text-base shadow-lg"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Get Started — Sign In"
                )}
              </Button>
              <p className="text-white/40 text-xs font-ui mt-3">
                Secure login via Internet Identity
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Why Aditya University GMS?
            </h2>
            <p className="text-muted-foreground font-ui max-w-md mx-auto">
              A modern approach to college grievance management — transparent,
              efficient, and student-first.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i + 0.3 }}
                className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground mb-1.5">
                  {f.title}
                </h3>
                <p className="text-xs text-muted-foreground font-ui leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-card border-y border-border py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="font-display text-2xl font-bold text-center mb-10">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "Log In Securely",
                  desc: "Use Internet Identity for anonymous, secure authentication. No passwords.",
                },
                {
                  step: "02",
                  title: "Submit a Complaint",
                  desc: "Describe your grievance with category, priority, and supporting details.",
                },
                {
                  step: "03",
                  title: "Track Resolution",
                  desc: "Monitor progress and receive admin responses — all in one place.",
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <span className="font-display font-bold text-4xl text-primary/20 leading-none shrink-0">
                    {s.step}
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                      {s.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-ui leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 text-center">
        <p className="text-xs text-muted-foreground font-ui">
          © {new Date().getFullYear()} Aditya University. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
