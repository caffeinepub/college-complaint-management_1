import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Type__1 } from "./backend.d";
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

export default function App() {
  const { isInitializing, clear } = useInternetIdentity();
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("aditya_session");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Session;
        setSession(parsed);
      } catch {
        localStorage.removeItem("aditya_session");
      }
    }
    setIsSessionLoaded(true);
  }, []);

  const handleLogin = (newSession: Session) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    localStorage.removeItem("aditya_session");
    setSession(null);
    // Also clear II identity
    clear();
  };

  // Wait for II initialization and session loading
  if (isInitializing || !isSessionLoaded) {
    return <LoadingScreen />;
  }

  // No session → show landing page
  if (!session) {
    return (
      <>
        <LandingPage onLogin={handleLogin} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  // Admin session → admin dashboard
  if (session.userType === "admin") {
    return (
      <>
        <AdminDashboard onLogout={handleLogout} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  // Student/Staff session → student dashboard
  return (
    <>
      <StudentDashboard
        userName={session.name}
        userRole={session.userType}
        onLogout={handleLogout}
      />
      <Toaster position="top-right" richColors />
    </>
  );
}
