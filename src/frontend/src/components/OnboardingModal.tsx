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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GraduationCap, Loader2, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Type__1, Type__3 } from "../backend.d";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface OnboardingModalProps {
  open: boolean;
  onComplete: (name: string, role: Type__3) => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "staff">("student");
  const [nameError, setNameError] = useState("");

  const saveMutation = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");

    if (!name.trim()) {
      setNameError("Full name is required");
      return;
    }
    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return;
    }

    try {
      await saveMutation.mutateAsync({
        userId: "anonymous",
        name: name.trim(),
        role: role as unknown as Type__1,
      });
      onComplete(name.trim(), role as Type__3);
      toast.success("Profile saved! Welcome to GrievanceHub.");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open={open} data-ocid="onboarding.modal">
      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-display">
              Complete your profile
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Tell us a bit about yourself to get started with GrievanceHub.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-ui font-semibold text-sm">
              Full Name
            </Label>
            <Input
              id="name"
              data-ocid="onboarding.name_input"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              className="font-ui"
            />
            {nameError && (
              <p className="text-destructive text-xs mt-1">{nameError}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="font-ui font-semibold text-sm">I am a...</Label>
            <RadioGroup
              value={role}
              onValueChange={(v) => setRole(v as "student" | "staff")}
              data-ocid="onboarding.role_select"
              className="grid grid-cols-2 gap-3"
            >
              <label
                htmlFor="role-student"
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  role === "student"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-accent"
                }`}
              >
                <RadioGroupItem
                  value="student"
                  id="role-student"
                  className="sr-only"
                />
                <GraduationCap
                  className={`w-6 h-6 ${role === "student" ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={`font-ui font-semibold text-sm ${role === "student" ? "text-primary" : "text-foreground"}`}
                >
                  Student
                </span>
              </label>
              <label
                htmlFor="role-staff"
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  role === "staff"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-accent"
                }`}
              >
                <RadioGroupItem
                  value="staff"
                  id="role-staff"
                  className="sr-only"
                />
                <UserCheck
                  className={`w-6 h-6 ${role === "staff" ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={`font-ui font-semibold text-sm ${role === "staff" ? "text-primary" : "text-foreground"}`}
                >
                  Staff
                </span>
              </label>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            data-ocid="onboarding.submit_button"
            className="w-full font-ui font-semibold"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
