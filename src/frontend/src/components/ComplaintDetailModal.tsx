import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Calendar, Hash, MessageSquare, Tag, UserCheck, X } from "lucide-react";
import type { Complaint } from "../backend.d";
import {
  CATEGORY_LABELS,
  ROLE_LABELS,
  formatDate,
  formatDateTime,
} from "../lib/formatters";
import { PriorityBadge, StatusBadge } from "./StatusBadge";

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
}

export function ComplaintDetailModal({
  complaint,
  open,
  onClose,
}: ComplaintDetailModalProps) {
  if (!complaint) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="complaint_detail.modal"
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
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
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-ui">
                  Submitted
                </p>
                <p className="font-ui font-medium text-xs">
                  {formatDate(complaint.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-ui">
                  Category
                </p>
                <p className="font-ui font-medium text-xs">
                  {CATEGORY_LABELS[complaint.category]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm col-span-2">
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-[8px] font-bold text-primary">
                  {complaint.submitterName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-ui">
                  Submitted by
                </p>
                <p className="font-ui font-medium text-xs">
                  {complaint.submitterName}{" "}
                  <span className="text-muted-foreground">
                    ({ROLE_LABELS[complaint.submitterType]})
                  </span>
                </p>
              </div>
            </div>
            {complaint.assignedTo && (
              <div className="flex items-center gap-2 text-sm col-span-2">
                <UserCheck className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-ui">
                    Assigned to
                  </p>
                  <p className="font-ui font-medium text-xs">
                    {complaint.assignedTo}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold font-ui text-muted-foreground uppercase tracking-wide">
              Description
            </p>
            <p className="text-sm font-ui leading-relaxed bg-muted/50 p-3 rounded-md">
              {complaint.description}
            </p>
          </div>

          {/* Admin Response */}
          {complaint.adminResponse && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold font-ui text-primary uppercase tracking-wide">
                    Admin Response
                  </p>
                </div>
                <div className="bg-primary/5 border border-primary/20 p-3 rounded-md">
                  <p className="text-sm font-ui leading-relaxed">
                    {complaint.adminResponse}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 font-ui">
                    Updated {formatDateTime(complaint.updatedAt)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            data-ocid="complaint_detail.close_button"
            onClick={onClose}
            className="font-ui"
          >
            <X className="w-4 h-4 mr-1" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
