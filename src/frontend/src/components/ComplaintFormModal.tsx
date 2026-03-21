import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Hash, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Type__1, Type__2, Type__3 } from "../backend.d";
import { useSubmitComplaint } from "../hooks/useQueries";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "../lib/formatters";

interface ComplaintFormModalProps {
  open: boolean;
  onClose: () => void;
  submitterName: string;
  submitterRole: Type__1;
}

export function ComplaintFormModal({
  open,
  onClose,
  submitterName,
  submitterRole,
}: ComplaintFormModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Type__2 | "">("");
  const [priority, setPriority] = useState<Type__3 | "">("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const submitMutation = useSubmitComplaint();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!category) newErrors.category = "Category is required";
    if (!priority) newErrors.priority = "Priority is required";
    if (!description.trim()) newErrors.description = "Description is required";
    else if (description.trim().length < 20)
      newErrors.description = "Description must be at least 20 characters";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const referenceNumber = await submitMutation.mutateAsync({
        title: title.trim(),
        category: category as Type__2,
        priority: priority as Type__3,
        description: description.trim(),
        submitterName,
        submitterType: submitterRole,
      });
      setSubmittedRef(referenceNumber);
      toast.success(`Complaint submitted! Reference: ${referenceNumber}`);
    } catch {
      toast.error("Failed to submit complaint. Please try again.");
    }
  };

  const handleClose = () => {
    setTitle("");
    setCategory("");
    setPriority("");
    setDescription("");
    setErrors({});
    setSubmittedRef(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        data-ocid="complaint_form.modal"
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {submittedRef ? (
          <div
            data-ocid="complaint_form.success_state"
            className="flex flex-col items-center gap-4 py-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold">
                Complaint Submitted!
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Your complaint has been received and will be reviewed by the
                administration.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
                <Hash className="w-4 h-4 text-primary" />
                <span className="font-mono font-bold text-primary text-base">
                  {submittedRef}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Save this reference number for future tracking
              </p>
            </div>
            <Button
              data-ocid="complaint_form.close_button"
              onClick={handleClose}
              className="font-ui font-semibold"
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-lg">
                Submit New Complaint
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Provide details about your complaint. All fields marked * are
                required.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="c-title"
                  className="font-ui font-semibold text-sm"
                >
                  Title *
                </Label>
                <Input
                  id="c-title"
                  data-ocid="complaint_form.input"
                  placeholder="Brief summary of the issue"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((p) => ({ ...p, title: "" }));
                  }}
                  className="font-ui"
                />
                {errors.title && (
                  <p
                    data-ocid="complaint_form.error_state"
                    className="text-destructive text-xs"
                  >
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="font-ui font-semibold text-sm">
                  Category *
                </Label>
                <Select
                  value={category}
                  onValueChange={(v) => {
                    setCategory(v as Type__2);
                    if (errors.category)
                      setErrors((p) => ({ ...p, category: "" }));
                  }}
                >
                  <SelectTrigger
                    data-ocid="complaint_form.select"
                    className="font-ui"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_LABELS) as Type__2[]).map((k) => (
                      <SelectItem key={k} value={k} className="font-ui">
                        {CATEGORY_LABELS[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-destructive text-xs">{errors.category}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="font-ui font-semibold text-sm">
                  Priority *
                </Label>
                <Select
                  value={priority}
                  onValueChange={(v) => {
                    setPriority(v as Type__3);
                    if (errors.priority)
                      setErrors((p) => ({ ...p, priority: "" }));
                  }}
                >
                  <SelectTrigger
                    data-ocid="complaint_form.select"
                    className="font-ui"
                  >
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PRIORITY_LABELS) as Type__3[]).map((k) => (
                      <SelectItem key={k} value={k} className="font-ui">
                        {PRIORITY_LABELS[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-destructive text-xs">{errors.priority}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="c-description"
                  className="font-ui font-semibold text-sm"
                >
                  Description *
                </Label>
                <Textarea
                  id="c-description"
                  data-ocid="complaint_form.textarea"
                  placeholder="Describe the issue in detail (minimum 20 characters)..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description)
                      setErrors((p) => ({ ...p, description: "" }));
                  }}
                  rows={4}
                  className="font-ui resize-none"
                />
                <div className="flex justify-between items-center">
                  {errors.description ? (
                    <p className="text-destructive text-xs">
                      {errors.description}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`text-xs ${description.length < 20 ? "text-muted-foreground" : "text-green-600"}`}
                  >
                    {description.length}/20 min
                  </span>
                </div>
              </div>

              {submitMutation.isPending && (
                <div
                  data-ocid="complaint_form.loading_state"
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting your complaint...
                </div>
              )}

              <DialogFooter className="gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="complaint_form.cancel_button"
                  onClick={handleClose}
                  disabled={submitMutation.isPending}
                  className="font-ui"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-ocid="complaint_form.submit_button"
                  disabled={submitMutation.isPending}
                  className="font-ui font-semibold"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Complaint"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
