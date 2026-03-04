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
  Lock,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Type__1 } from "../backend.d";
import { FirstTimeSetupModal } from "../components/FirstTimeSetupModal";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type LoginPanel = "student" | "staff" | "admin";
type LoginStep = "id" | "password" | "ii_pending" | "first_time_check";

interface Session {
  userId: string;
  userType: Type__1;
  name: string;
}

interface LandingPageProps {
  onLogin: (session: Session) => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const { actor } = useActor();

  const [activePanel, setActivePanel] = useState<LoginPanel>("student");
  const [studentId, setStudentId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<LoginStep>("id");
  const [isChecking, setIsChecking] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [pendingUserId, setPendingUserId] = useState("");
  const [pendingUserType, setPendingUserType] = useState<Type__1>(
    Type__1.student,
  );
  const [passwordError, setPasswordError] = useState("");

  // Admin modal
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminLogging, setAdminLogging] = useState(false);

  const isLoggingIn = loginStatus === "logging-in";

  const currentId = activePanel === "student" ? studentId : staffId;

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentId.trim()) {
      toast.error(
        `Please enter your ${activePanel === "student" ? "roll number" : "employee ID"}`,
      );
      return;
    }
    // Move to II login + check
    setStep("ii_pending");
    try {
      await login();
    } catch {
      setStep("id");
      toast.error("Login failed. Please try again.");
    }
  };

  // After II login is done and actor is ready — proceed with password check
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!password) {
      setPasswordError("Please enter your password");
      return;
    }

    setIsChecking(true);
    try {
      // Verify password from local storage (UI layer)
      const passwordKey = `aditya_pwd_${currentId.trim()}`;
      const storedPassword = localStorage.getItem(passwordKey);

      if (!storedPassword) {
        // Password not set — shouldn't reach here normally, but handle it
        toast.error("Account not found. Please register first.");
        setStep("id");
        setIsChecking(false);
        return;
      }

      if (password !== storedPassword) {
        setPasswordError("Incorrect password. Please try again.");
        setIsChecking(false);
        return;
      }

      // Get user info from backend
      if (!actor) {
        toast.error("Connection error. Please try again.");
        setIsChecking(false);
        return;
      }

      const userInfo = await actor.getUserInfo();
      if (!userInfo) {
        toast.error("User profile not found. Please contact admin.");
        setIsChecking(false);
        return;
      }

      // Successful login
      const session: Session = {
        userId: currentId.trim(),
        userType: userInfo.role,
        name: userInfo.name,
      };
      localStorage.setItem("aditya_session", JSON.stringify(session));
      onLogin(session);
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  // After II login resolves and actor is available — check if first time
  const handlePostIILogin = async () => {
    if (!actor || !identity) return;
    setIsChecking(true);
    try {
      const userId = currentId.trim();
      const isFirst = await actor.isFirstTimeUser(userId);
      if (isFirst) {
        setPendingUserId(userId);
        setPendingUserType(
          activePanel === "student" ? Type__1.student : Type__1.staff,
        );
        setIsFirstTime(true);
      } else {
        // Existing user — ask for password
        setStep("password");
      }
    } catch {
      toast.error("Failed to verify account. Please try again.");
      setStep("id");
    } finally {
      setIsChecking(false);
    }
  };

  // Watch for II login completion to trigger the flow
  const hasIdentity = !!identity;
  const [lastHandled, setLastHandled] = useState(false);

  if (
    hasIdentity &&
    step === "ii_pending" &&
    !isChecking &&
    !isFirstTime &&
    !lastHandled
  ) {
    setLastHandled(true);
    void handlePostIILogin();
  }

  if (!hasIdentity && lastHandled) {
    setLastHandled(false);
    setStep("id");
  }

  const handleFirstTimeComplete = (name: string) => {
    const session: Session = {
      userId: pendingUserId,
      userType: pendingUserType,
      name,
    };
    localStorage.setItem("aditya_session", JSON.stringify(session));
    setIsFirstTime(false);
    onLogin(session);
  };

  const handleFirstTimeCancel = () => {
    setIsFirstTime(false);
    setStep("id");
    setLastHandled(false);
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
      await login();
      // Admin session will be set after II login
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

  const handleBack = () => {
    setStep("id");
    setPassword("");
    setPasswordError("");
  };

  return (
    <div
      data-ocid="landing.page"
      className="min-h-screen relative flex flex-col"
    >
      {/* Full-page background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/uploads/aditya-1--1.jpeg"
          alt="Aditya University campus"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        {/* Subtle gradient from bottom for footer readability */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight drop-shadow-sm">
            Aditya University
          </span>
        </div>
        <span className="hidden sm:block text-white/70 text-sm font-ui tracking-wide">
          Complaint Management System
        </span>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg mb-2">
            Aditya University
          </h1>
          <p className="text-white/90 text-xl md:text-2xl font-ui font-semibold tracking-widest uppercase drop-shadow-md">
            Complaint Management System
          </p>
          <p className="text-white/65 text-sm font-ui mt-2 drop-shadow-sm">
            Centralized Platform for Student &amp; Staff Grievance Handling
          </p>
        </motion.div>

        {/* Login panels */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Login Panel */}
            <div
              className={`rounded-2xl border backdrop-blur-md p-6 transition-all duration-300 ${
                activePanel === "student"
                  ? "bg-white/15 border-white/40 shadow-2xl shadow-black/30"
                  : "bg-white/8 border-white/20 opacity-80 hover:opacity-100 hover:bg-white/12"
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-white text-lg leading-tight">
                    Student Login
                  </h2>
                  <p className="text-white/60 text-xs font-ui">
                    Use your roll number
                  </p>
                </div>
              </div>

              {activePanel === "student" && step === "password" ? (
                <form onSubmit={handlePasswordLogin} className="space-y-3">
                  <p className="text-white/80 text-xs font-ui">
                    Welcome back,{" "}
                    <span className="font-semibold text-white">
                      {studentId}
                    </span>
                    . Enter your password.
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-white/80 font-ui text-sm">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                      <Input
                        data-ocid="student_login.input"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordError("");
                        }}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/40 pl-9 pr-10 focus:border-white/60 focus:ring-white/30 font-ui"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p
                        data-ocid="student_login.error_state"
                        className="text-red-300 text-xs font-ui"
                      >
                        {passwordError}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      data-ocid="student_login.cancel_button"
                      onClick={handleBack}
                      className="flex-none font-ui bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                      size="sm"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      data-ocid="student_login.submit_button"
                      disabled={isChecking}
                      className="flex-1 font-ui font-semibold bg-white text-slate-900 hover:bg-white/90"
                    >
                      {isChecking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    setActivePanel("student");
                    handleContinue(e);
                  }}
                  className="space-y-3"
                >
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="student-roll"
                      className="text-white/80 font-ui text-sm"
                    >
                      Roll Number
                    </Label>
                    <Input
                      id="student-roll"
                      data-ocid="student_login.input"
                      placeholder="e.g. 22CSE1001"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/40 focus:border-white/60 focus:ring-white/30 font-ui"
                      onFocus={() => setActivePanel("student")}
                    />
                  </div>
                  <Button
                    type="submit"
                    data-ocid="student_login.primary_button"
                    disabled={
                      isLoggingIn ||
                      isChecking ||
                      (activePanel === "student" && step === "ii_pending")
                    }
                    className="w-full font-ui font-semibold bg-white text-slate-900 hover:bg-white/90"
                  >
                    {activePanel === "student" &&
                    (isLoggingIn || isChecking || step === "ii_pending") ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Staff Login Panel */}
            <div
              className={`rounded-2xl border backdrop-blur-md p-6 transition-all duration-300 ${
                activePanel === "staff"
                  ? "bg-white/15 border-white/40 shadow-2xl shadow-black/30"
                  : "bg-white/8 border-white/20 opacity-80 hover:opacity-100 hover:bg-white/12"
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-white text-lg leading-tight">
                    Staff Login
                  </h2>
                  <p className="text-white/60 text-xs font-ui">
                    Use your employee ID
                  </p>
                </div>
              </div>

              {activePanel === "staff" && step === "password" ? (
                <form onSubmit={handlePasswordLogin} className="space-y-3">
                  <p className="text-white/80 text-xs font-ui">
                    Welcome back,{" "}
                    <span className="font-semibold text-white">{staffId}</span>.
                    Enter your password.
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-white/80 font-ui text-sm">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                      <Input
                        data-ocid="staff_login.input"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordError("");
                        }}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/40 pl-9 pr-10 focus:border-white/60 focus:ring-white/30 font-ui"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p
                        data-ocid="staff_login.error_state"
                        className="text-red-300 text-xs font-ui"
                      >
                        {passwordError}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      data-ocid="staff_login.cancel_button"
                      onClick={handleBack}
                      className="flex-none font-ui bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                      size="sm"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      data-ocid="staff_login.submit_button"
                      disabled={isChecking}
                      className="flex-1 font-ui font-semibold bg-white text-slate-900 hover:bg-white/90"
                    >
                      {isChecking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    setActivePanel("staff");
                    handleContinue(e);
                  }}
                  className="space-y-3"
                >
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="staff-id"
                      className="text-white/80 font-ui text-sm"
                    >
                      Employee ID
                    </Label>
                    <Input
                      id="staff-id"
                      data-ocid="staff_login.input"
                      placeholder="e.g. EMP2024001"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/40 focus:border-white/60 focus:ring-white/30 font-ui"
                      onFocus={() => setActivePanel("staff")}
                    />
                  </div>
                  <Button
                    type="submit"
                    data-ocid="staff_login.primary_button"
                    disabled={
                      isLoggingIn ||
                      isChecking ||
                      (activePanel === "staff" && step === "ii_pending")
                    }
                    className="w-full font-ui font-semibold bg-white text-slate-900 hover:bg-white/90"
                  >
                    {activePanel === "staff" &&
                    (isLoggingIn || isChecking || step === "ii_pending") ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Admin login link */}
          <div className="mt-5 text-center">
            <button
              type="button"
              data-ocid="landing.admin_link"
              onClick={() => setAdminOpen(true)}
              className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-xs font-ui transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrator Login
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 px-6 text-center">
        <p className="text-white/40 text-xs font-ui">
          © {new Date().getFullYear()} Aditya University. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white/80 underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Admin Login Modal */}
      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent data-ocid="admin_login.modal" className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="font-display text-lg">
                Administrator Login
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter your admin credentials to access the management dashboard.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdminLogin} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-user"
                className="font-ui font-semibold text-sm"
              >
                Username
              </Label>
              <Input
                id="admin-user"
                data-ocid="admin_login.input"
                placeholder="Admin username"
                value={adminUser}
                onChange={(e) => {
                  setAdminUser(e.target.value);
                  setAdminError("");
                }}
                className="font-ui"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-pass"
                className="font-ui font-semibold text-sm"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-pass"
                  data-ocid="admin_login.input"
                  type={showAdminPass ? "text" : "password"}
                  placeholder="Admin password"
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
              <p
                data-ocid="admin_login.error_state"
                className="text-destructive text-sm font-ui"
              >
                {adminError}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                data-ocid="admin_login.cancel_button"
                className="flex-1 font-ui"
                onClick={() => {
                  setAdminOpen(false);
                  setAdminUser("");
                  setAdminPass("");
                  setAdminError("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="admin_login.submit_button"
                className="flex-1 font-ui font-semibold"
                disabled={adminLogging || isLoggingIn}
              >
                {adminLogging || isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login as Admin"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* First time setup modal */}
      <FirstTimeSetupModal
        open={isFirstTime}
        userId={pendingUserId}
        userType={pendingUserType}
        onComplete={handleFirstTimeComplete}
        onCancel={handleFirstTimeCancel}
      />
    </div>
  );
}
