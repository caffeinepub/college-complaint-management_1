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
import { Eye, EyeOff, Loader2, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Type__1 } from "../backend.d";
import { useRegisterUser } from "../hooks/useQueries";

interface FirstTimeSetupModalProps {
  open: boolean;
  userId: string;
  userType: Type__1;
  onComplete: (name: string) => void;
  onCancel: () => void;
}

export function FirstTimeSetupModal({
  open,
  userId,
  userType,
  onComplete,
  onCancel,
}: FirstTimeSetupModalProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = useRegisterUser();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    else if (name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const result = await registerMutation.mutateAsync({
        userId,
        name: name.trim(),
        userType,
      });
      // Store password locally (UI layer only — backend uses ICP principal)
      const passwordKey = `aditya_pwd_${userId}`;
      localStorage.setItem(passwordKey, password);
      toast.success(
        "Account set up successfully! Welcome to Aditya University CMS.",
      );
      onComplete(name.trim());
      // Reset form
      setName("");
      setPassword("");
      setConfirmPassword("");
      setErrors({});
      return result;
    } catch {
      toast.error("Failed to complete setup. Please try again.");
    }
  };

  const roleLabel =
    userType === "student"
      ? "Student"
      : userType === "staff"
        ? "Staff"
        : "Admin";

  return (
    <Dialog open={open}>
      <DialogContent
        data-ocid="setup.modal"
        className="max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">
                Set Up Your Account
              </DialogTitle>
              <p className="text-xs text-muted-foreground font-ui mt-0.5">
                {roleLabel} · ID: {userId}
              </p>
            </div>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            First time here! Set your full name and create a password for future
            logins.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="setup-name"
              className="font-ui font-semibold text-sm"
            >
              Full Name *
            </Label>
            <Input
              id="setup-name"
              data-ocid="setup.input"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className="font-ui"
              autoFocus
            />
            {errors.name && (
              <p
                data-ocid="setup.error_state"
                className="text-destructive text-xs"
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="setup-password"
              className="font-ui font-semibold text-sm"
            >
              Create Password *
            </Label>
            <div className="relative">
              <Input
                id="setup-password"
                data-ocid="setup.input"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className="font-ui pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="setup-confirm"
              className="font-ui font-semibold text-sm"
            >
              Confirm Password *
            </Label>
            <div className="relative">
              <Input
                id="setup-confirm"
                data-ocid="setup.input"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                className="font-ui pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-xs">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              data-ocid="setup.cancel_button"
              className="flex-1 font-ui"
              onClick={onCancel}
              disabled={registerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="setup.submit_button"
              className="flex-1 font-ui font-semibold"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
