import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Type__1 } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type LoginPanel = "student" | "staff";

interface Session {
  userId: string;
  userType: Type__1;
  name: string;
}

interface LandingPageProps {
  onLogin: (session: Session) => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const { actor, isFetching } = useActor();
  const { login, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();

  const [pendingPanel, setPendingPanel] = useState<LoginPanel | null>(null);

  // II Setup modal state (first-time registration)
  const [showSetup, setShowSetup] = useState(false);
  const [setupRole, setSetupRole] = useState<LoginPanel>("student");
  const [setupUserId, setSetupUserId] = useState("");
  const [setupName, setSetupName] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState("");

  // Admin modal
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminLogging, setAdminLogging] = useState(false);

  // Track if we already handled this identity to avoid duplicate calls
  const handledIdentityRef = useRef<string | null>(null);

  // When identity becomes available after II login, check profile
  useEffect(() => {
    if (!identity || !actor || isFetching) return;
    const principalStr = identity.getPrincipal().toString();
    if (identity.getPrincipal().isAnonymous()) return;
    if (handledIdentityRef.current === principalStr) return;

    handledIdentityRef.current = principalStr;

    void (async () => {
      try {
        const profile = await actor.getCallerUserProfile();
        if (profile) {
          // Returning user - log them in
          const session: Session = {
            userId: profile.userId,
            userType: profile.role,
            name: profile.name,
          };
          localStorage.setItem("aditya_session", JSON.stringify(session));
          onLogin(session);
        } else {
          // First time - show setup modal
          setSetupRole(pendingPanel ?? "student");
          setShowSetup(true);
        }
      } catch {
        toast.error("Failed to check profile. Please try again.");
        handledIdentityRef.current = null;
      }
    })();
  }, [identity, actor, isFetching, onLogin, pendingPanel]);

  const handleIILogin = (panel: LoginPanel) => {
    setPendingPanel(panel);
    handledIdentityRef.current = null;
    login();
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError("");
    if (!setupUserId.trim()) {
      setSetupError(
        setupRole === "student"
          ? "Roll number is required"
          : "Employee ID is required",
      );
      return;
    }
    if (!setupName.trim() || setupName.trim().length < 2) {
      setSetupError("Name must be at least 2 characters");
      return;
    }
    if (!actor) {
      setSetupError("Connection error. Please refresh and try again.");
      return;
    }

    setSetupLoading(true);
    try {
      const userType =
        setupRole === "student" ? Type__1.student : Type__1.staff;
      const result = await actor.registerUser(
        setupUserId.trim(),
        setupName.trim(),
        userType,
      );
      if (result.__kind__ === "err") {
        if (result.err === "alreadyExists") {
          setSetupError("This ID is already registered with another account.");
        } else {
          setSetupError(
            "Registration failed. Please check your details and try again.",
          );
        }
        setSetupLoading(false);
        return;
      }
      const session: Session = {
        userId: setupUserId.trim(),
        userType,
        name: setupName.trim(),
      };
      localStorage.setItem("aditya_session", JSON.stringify(session));
      setShowSetup(false);
      onLogin(session);
    } catch {
      setSetupError("Registration failed. Please try again.");
    } finally {
      setSetupLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    if (adminUser !== "admin" || adminPass !== "admin123") {
      setAdminError("Invalid admin credentials");
      return;
    }
    setAdminLogging(true);
    try {
      const session: Session = {
        userId: "admin",
        userType: Type__1.admin,
        name: "Administrator",
      };
      localStorage.setItem("aditya_session", JSON.stringify(session));
      onLogin(session);
    } catch {
      setAdminError("Login failed. Please try again.");
    } finally {
      setAdminLogging(false);
    }
  };

  const isActorLoading = !actor && isFetching;

  return (
    <div
      data-ocid="landing.page"
      className="min-h-screen relative flex flex-col"
    >
      {/* Full-page background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/uploads/aditya-1-1-1.jpeg"
          alt="College campus"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight drop-shadow-sm">
            College complaint management system
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white drop-shadow-lg mb-3">
              complaint management system
            </h1>
          </div>

          {/* Login panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-blue-500/30 border border-blue-400/40 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <h2 className="text-white font-display font-bold text-lg">
                    Student Login
                  </h2>
                  <p className="text-white/60 text-xs font-ui">
                    Login with Internet Identity
                  </p>
                </div>
              </div>
              <p className="text-white/70 text-sm font-ui mb-6">
                Use your Internet Identity to securely access the student
                complaint portal.
              </p>
              <Button
                data-ocid="landing.student_ii_button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-ui font-semibold h-11"
                onClick={() => handleIILogin("student")}
                disabled={isLoggingIn || isActorLoading || isInitializing}
              >
                {isLoggingIn && pendingPanel === "student" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>Login with Internet Identity</>
                )}
              </Button>
            </motion.div>

            {/* Staff Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-amber-500/30 border border-amber-400/40 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h2 className="text-white font-display font-bold text-lg">
                    Staff Login
                  </h2>
                  <p className="text-white/60 text-xs font-ui">
                    Login with Internet Identity
                  </p>
                </div>
              </div>
              <p className="text-white/70 text-sm font-ui mb-6">
                Use your Internet Identity to securely access the staff
                complaint portal.
              </p>
              <Button
                data-ocid="landing.staff_ii_button"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-ui font-semibold h-11"
                onClick={() => handleIILogin("staff")}
                disabled={isLoggingIn || isActorLoading || isInitializing}
              >
                {isLoggingIn && pendingPanel === "staff" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>Login with Internet Identity</>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Admin link */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setAdminOpen(true)}
              className="text-white/50 hover:text-white/80 text-xs font-ui transition-colors underline underline-offset-2"
            >
              Admin Login
            </button>
          </div>
        </motion.div>
      </main>

      {/* II First-time Setup Modal */}
      <Dialog open={showSetup} onOpenChange={(o) => !o && setShowSetup(false)}>
        <DialogContent
          className="max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {setupRole === "student" ? (
                  <GraduationCap className="w-5 h-5 text-primary" />
                ) : (
                  <UserCheck className="w-5 h-5 text-primary" />
                )}
              </div>
              <DialogTitle className="text-xl font-display">
                Complete your profile
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              You're logged in with Internet Identity. Please provide your
              details to finish setup.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSetupSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="font-ui font-semibold text-sm">
                {setupRole === "student" ? "Roll Number" : "Employee ID"}
              </Label>
              <Input
                placeholder={
                  setupRole === "student" ? "e.g. 22B01A0501" : "e.g. EMP1234"
                }
                value={setupUserId}
                onChange={(e) => {
                  setSetupUserId(e.target.value);
                  setSetupError("");
                }}
                className="font-ui"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-ui font-semibold text-sm">Full Name</Label>
              <Input
                placeholder="e.g. Priya Sharma"
                value={setupName}
                onChange={(e) => {
                  setSetupName(e.target.value);
                  setSetupError("");
                }}
                className="font-ui"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-ui font-semibold text-sm">Role</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["student", "staff"] as LoginPanel[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSetupRole(r)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all font-ui font-semibold text-sm capitalize ${
                      setupRole === r
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {r === "student" ? (
                      <GraduationCap className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {setupError && (
              <p className="text-destructive text-sm">{setupError}</p>
            )}
            <Button
              type="submit"
              className="w-full font-ui font-semibold"
              disabled={setupLoading}
            >
              {setupLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Login Modal */}
      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle className="font-display text-lg">
                Admin Login
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter your admin credentials to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminLogin} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="font-ui font-semibold text-sm">Username</Label>
              <Input
                placeholder="admin"
                value={adminUser}
                onChange={(e) => {
                  setAdminUser(e.target.value);
                  setAdminError("");
                }}
                className="font-ui"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-ui font-semibold text-sm">Password</Label>
              <div className="relative">
                <Input
                  type={showAdminPass ? "text" : "password"}
                  placeholder="Password"
                  value={adminPass}
                  onChange={(e) => {
                    setAdminPass(e.target.value);
                    setAdminError("");
                  }}
                  className="font-ui pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showAdminPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {adminError && (
              <p className="text-destructive text-sm">{adminError}</p>
            )}
            <Button
              type="submit"
              className="w-full font-ui font-semibold"
              disabled={adminLogging}
            >
              {adminLogging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login as Admin"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
