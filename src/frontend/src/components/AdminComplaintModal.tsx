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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Hash, Loader2, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Complaint, Type } from "../backend.d";
import { useUpdateComplaintStatusAdmin } from "../hooks/useQueries";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
  formatDate,
} from "../lib/formatters";
import { PriorityBadge, StatusBadge } from "./StatusBadge";

interface AdminComplaintModalProps {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
}

export function AdminComplaintModal({
  complaint,
  open,
  onClose,
}: AdminComplaintModalProps) {
  const [status, setStatus] = useState<Type>(Type.open);
  const [assignedTo, setAssignedTo] = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [saved, setSaved] = useState(false);

  const updateMutation = useUpdateComplaintStatusAdmin();

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status as Type);
      setAssignedTo(complaint.assignedTo ?? "");
      setAdminResponse(complaint.adminResponse ?? "");
      setSaved(false);
    }
  }, [complaint]);

  if (!complaint) return null;

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: complaint.id,
        newStatus: status,
        assignedTo: assignedTo.trim() || undefined,
        adminResponse: adminResponse.trim() || undefined,
      });
      setSaved(true);
      toast.success("Complaint updated successfully.");
    } catch {
      toast.error("Failed to update complaint.");
    }
  };

  const handleClose = () => {
    setSaved(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        data-ocid="admin_complaint.modal"
        className="max-w-xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-md px-2.5 py-1">
                  <Hash className="w-3 h-3 text-primary" />
                  <span className="text-xs font-mono font-bold text-primary">
                    {complaint.referenceNumber}
                  </span>
                </div>
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>
              <DialogTitle className="font-display text-base leading-snug">
                {complaint.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 font-ui">
                Submitted by {complaint.submitterName} (
                {ROLE_LABELS[complaint.submitterType]}) on{" "}
                {formatDate(complaint.createdAt)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-1">
          {/* Read-only complaint details */}
          <div className="bg-muted/40 rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs font-ui">
              <div>
                <span className="text-muted-foreground">Category: </span>
                <span className="font-medium">
                  {CATEGORY_LABELS[complaint.category]}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Priority: </span>
                <span className="font-medium">
                  {PRIORITY_LABELS[complaint.priority]}
                </span>
              </div>
            </div>
            <p className="text-xs font-ui text-muted-foreground leading-relaxed line-clamp-3">
              {complaint.description}
            </p>
          </div>

          <Separator />

          {/* Admin editable fields */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold font-ui text-muted-foreground uppercase tracking-wide">
              Admin Actions
            </h4>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="font-ui font-semibold text-sm">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as unknown as Type)}
              >
                <SelectTrigger
                  data-ocid="admin_complaint.select"
                  className="font-ui"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as Type[]).map((k) => (
                    <SelectItem key={k} value={k} className="font-ui">
                      {STATUS_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assigned To */}
            <div className="space-y-1.5">
              <Label
                htmlFor="assigned-to"
                className="font-ui font-semibold text-sm"
              >
                Assigned To{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="assigned-to"
                data-ocid="admin_complaint.input"
                placeholder="e.g. Dr. Ramesh Kumar, HOD"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="font-ui"
              />
            </div>

            {/* Admin Response */}
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-response"
                className="font-ui font-semibold text-sm"
              >
                Admin Response{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="admin-response"
                data-ocid="admin_complaint.textarea"
                placeholder="Provide a response or resolution details..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={3}
                className="font-ui resize-none"
              />
            </div>
          </div>

          {/* Loading/Success states */}
          {updateMutation.isPending && (
            <div
              data-ocid="admin_complaint.loading_state"
              className="flex items-center gap-2 text-sm text-muted-foreground font-ui"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving changes...
            </div>
          )}

          {saved && (
            <div
              data-ocid="admin_complaint.success_state"
              className="flex items-center gap-2 text-sm text-green-600 font-ui"
            >
              <CheckCircle2 className="w-4 h-4" />
              Changes saved successfully
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            data-ocid="admin_complaint.close_button"
            onClick={handleClose}
            className="font-ui"
          >
            <X className="w-4 h-4 mr-1" />
            Close
          </Button>
          <Button
            data-ocid="admin_complaint.save_button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="font-ui font-semibold"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
