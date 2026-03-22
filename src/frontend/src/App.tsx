import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Type__1 } from "./backend.d";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LandingPage } from "./pages/LandingPage";
import { StudentDashboard } from "./pages/StudentDashboard";

interface Session {
  userId: string;
  userType: Type__1;
  name: string;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground font-ui">Loading...</p>
    </div>
  );
}

function AppInner() {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const isLoggingOutRef = useRef(false);
  const { actor, isFetching } = useActor();
  const { identity, clear: clearII } = useInternetIdentity();

  // Load session from localStorage on mount, or restore from II profile
  useEffect(() => {
    const stored = localStorage.getItem("aditya_session");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Session;
        setSession(parsed);
        setIsSessionLoaded(true);
        return;
      } catch {
        localStorage.removeItem("aditya_session");
      }
    }
    setIsSessionLoaded(true);
  }, []);

  // If II identity is present but no session, try to restore from profile
  useEffect(() => {
    if (!isSessionLoaded) return;
    if (session) return;
    if (isLoggingOutRef.current) return;
    if (!identity || identity.getPrincipal().isAnonymous()) return;
    if (!actor || isFetching) return;

    void (async () => {
      try {
        const profile = await actor.getCallerUserProfile();
        if (profile && !isLoggingOutRef.current) {
          const restored: Session = {
            userId: profile.userId,
            userType: profile.role,
            name: profile.name,
          };
          localStorage.setItem("aditya_session", JSON.stringify(restored));
          setSession(restored);
        }
      } catch {
        // ignore - user will need to log in again
      }
    })();
  }, [isSessionLoaded, session, identity, actor, isFetching]);

  const handleLogin = (newSession: Session) => {
    isLoggingOutRef.current = false;
    setSession(newSession);
  };

  const handleLogout = () => {
    isLoggingOutRef.current = true;
    localStorage.removeItem("aditya_session");
    setSession(null);
    // Also clear Internet Identity so the auto-restore doesn't kick in
    clearII();
  };

  if (!isSessionLoaded) {
    return <LoadingScreen />;
  }

  if (!session) {
    return (
      <>
        <LandingPage onLogin={handleLogin} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  if (session.userType === "admin") {
    return (
      <>
        <AdminDashboard onLogout={handleLogout} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <>
      <StudentDashboard
        userName={session.name}
        userRole={session.userType}
        userId={session.userId}
        onLogout={handleLogout}
      />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default function App() {
  return <AppInner />;
}
