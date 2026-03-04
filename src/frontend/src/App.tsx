import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { Type__3 } from "./backend.d";
import { OnboardingModal } from "./components/OnboardingModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile, useIsCallerAdmin } from "./hooks/useQueries";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LandingPage } from "./pages/LandingPage";
import { StudentDashboard } from "./pages/StudentDashboard";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center animate-pulse">
        <ShieldCheck className="w-6 h-6 text-primary-foreground" />
      </div>
      <div className="space-y-2 text-center">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-3 w-24 mx-auto" />
      </div>
      <p className="text-xs text-muted-foreground font-ui">
        Loading GrievanceHub...
      </p>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const profileQuery = useGetCallerUserProfile();
  const adminQuery = useIsCallerAdmin();

  // Local state for role (since backend Type__3 student/staff/admin is separate from UserRole)
  const [localRole, setLocalRole] = useState<Type__3 | null>(() => {
    const stored = localStorage.getItem("grievance_user_role");
    return stored as Type__3 | null;
  });

  // Sync local role from stored profile name
  useEffect(() => {
    const stored = localStorage.getItem("grievance_user_role");
    if (stored) {
      setLocalRole(stored as Type__3);
    }
  }, []);

  const handleOnboardingComplete = (_name: string, role: Type__3) => {
    setLocalRole(role);
    localStorage.setItem("grievance_user_role", role);
  };

  // Show loading while auth is initializing
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Not logged in → show landing
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  // Logged in but profile is still loading → show loading screen to prevent flash
  if (profileQuery.isLoading || !profileQuery.isFetched) {
    return <LoadingScreen />;
  }

  // Determine if we need to show onboarding
  const showOnboarding =
    isAuthenticated &&
    !profileQuery.isLoading &&
    profileQuery.isFetched &&
    profileQuery.data === null;

  // Determine admin status
  const isAdmin = adminQuery.data === true;

  // Admin users go to admin dashboard
  if (isAdmin && profileQuery.data) {
    return (
      <>
        <AdminDashboard />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  // Regular users with profiles go to student/staff dashboard
  if (profileQuery.data && localRole) {
    return (
      <>
        <StudentDashboard
          userName={profileQuery.data.name}
          userRole={localRole}
        />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  // Profile exists but local role not set (e.g. after page refresh)
  // Default to student if we have a profile but no stored role
  if (profileQuery.data && !localRole) {
    const storedRole =
      (localStorage.getItem("grievance_user_role") as Type__3) || "student";
    return (
      <>
        <StudentDashboard
          userName={profileQuery.data.name}
          userRole={storedRole}
        />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  // Show onboarding modal over a blank/loading background
  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-ui">
            Welcome to GrievanceHub
          </p>
        </div>
      </div>
      <OnboardingModal
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
      <Toaster position="top-right" richColors />
    </>
  );
}
