import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  FileText,
  Hash,
  InboxIcon,
  LogOut,
  PlusCircle,
  School,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Complaint, Type__1 } from "../backend.d";
import { ComplaintDetailModal } from "../components/ComplaintDetailModal";
import { ComplaintFormModal } from "../components/ComplaintFormModal";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { useGetMyComplaints } from "../hooks/useQueries";
import { CATEGORY_LABELS, formatDate } from "../lib/formatters";

interface StudentDashboardProps {
  userName: string;
  userRole: Type__1;
  onLogout: () => void;
}

export function StudentDashboard({
  userName,
  userRole,
  onLogout,
}: StudentDashboardProps) {
  const { data: complaints = [], isLoading } = useGetMyComplaints();
  const [showForm, setShowForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  );

  const openCount = complaints.filter((c) => c.status === "open").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const inProgress = complaints.filter((c) => c.status === "inProgress").length;

  const roleLabel =
    userRole === "student"
      ? "Student"
      : userRole === "staff"
        ? "Staff"
        : "Admin";

  return (
    <div
      data-ocid="student_dashboard.page"
      className="min-h-screen bg-background"
    >
      {/* Top Nav */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <School className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm tracking-tight leading-tight">
                Aditya University
              </span>
              <span className="text-[10px] text-muted-foreground font-ui leading-tight hidden sm:block">
                Complaint Management System
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary font-ui">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-ui font-medium">{userName}</span>
              <Badge variant="secondary" className="font-ui text-xs capitalize">
                {roleLabel}
              </Badge>
            </div>
            <Button
              data-ocid="student_dashboard.button"
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="font-ui text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              My Complaints
            </h1>
            <p className="text-sm text-muted-foreground font-ui mt-0.5">
              Track and manage your submitted complaints
            </p>
          </div>
          <Button
            data-ocid="student_dashboard.primary_button"
            onClick={() => setShowForm(true)}
            className="font-ui font-semibold"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Submit New Complaint
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          {[
            {
              label: "Total",
              value: complaints.length,
              icon: FileText,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Open",
              value: openCount,
              icon: InboxIcon,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "In Progress",
              value: inProgress,
              icon: Clock,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Resolved",
              value: resolved,
              icon: CheckCircle2,
              color: "text-green-600",
              bg: "bg-green-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-xl p-4 shadow-card"
            >
              <div
                className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}
              >
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">
                {isLoading ? "—" : s.value}
              </p>
              <p className="text-xs text-muted-foreground font-ui mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Complaints List */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    data-ocid="student_dashboard.loading_state"
                    className="h-16 w-full rounded-lg"
                  />
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <div
                data-ocid="student_dashboard.empty_state"
                className="flex flex-col items-center justify-center py-16 px-6 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  No complaints yet
                </h3>
                <p className="text-sm text-muted-foreground font-ui mb-5 max-w-xs">
                  When you submit a complaint, it will appear here with a unique
                  reference number.
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowForm(true)}
                  className="font-ui font-semibold"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Submit Your First Complaint
                </Button>
              </div>
            ) : (
              <div data-ocid="student_dashboard.list">
                {/* Table header */}
                <div className="hidden md:grid grid-cols-[160px_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-muted/40 border-b border-border text-xs font-semibold font-ui text-muted-foreground uppercase tracking-wide">
                  <span>Reference</span>
                  <span>Title</span>
                  <span>Category</span>
                  <span>Priority</span>
                  <span>Status</span>
                  <span>Date</span>
                </div>
                <div className="divide-y divide-border">
                  {complaints.map((complaint, idx) => (
                    <button
                      key={Number(complaint.id)}
                      type="button"
                      data-ocid={`student_dashboard.item.${idx + 1}`}
                      className="w-full text-left px-5 py-4 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      {/* Mobile layout */}
                      <div className="md:hidden space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">
                                <Hash className="w-2.5 h-2.5 text-primary" />
                                <span className="text-xs font-mono font-bold text-primary">
                                  {complaint.referenceNumber}
                                </span>
                              </div>
                              <StatusBadge status={complaint.status} />
                            </div>
                            <p className="font-ui font-semibold text-sm text-foreground truncate">
                              {complaint.title}
                            </p>
                          </div>
                          <PriorityBadge priority={complaint.priority} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-ui">
                          <span>{CATEGORY_LABELS[complaint.category]}</span>
                          <span>·</span>
                          <span>{formatDate(complaint.createdAt)}</span>
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div className="hidden md:grid grid-cols-[160px_1fr_auto_auto_auto_auto] gap-4 items-center">
                        <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded px-2 py-1 w-fit">
                          <Hash className="w-2.5 h-2.5 text-primary shrink-0" />
                          <span className="text-xs font-mono font-bold text-primary truncate">
                            {complaint.referenceNumber}
                          </span>
                        </div>
                        <p className="font-ui font-medium text-sm text-foreground truncate">
                          {complaint.title}
                        </p>
                        <span className="text-xs font-ui text-muted-foreground whitespace-nowrap">
                          {CATEGORY_LABELS[complaint.category]}
                        </span>
                        <PriorityBadge priority={complaint.priority} />
                        <StatusBadge status={complaint.status} />
                        <span className="text-xs font-ui text-muted-foreground whitespace-nowrap">
                          {formatDate(complaint.createdAt)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-5 px-6 text-center mt-auto">
        <p className="text-xs text-muted-foreground font-ui">
          © {new Date().getFullYear()} Aditya University. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Modals */}
      <ComplaintFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        submitterName={userName}
        submitterRole={userRole}
      />
      <ComplaintDetailModal
        complaint={selectedComplaint}
        open={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </div>
  );
}
