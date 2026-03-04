import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Filter,
  Hash,
  InboxIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  School,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Complaint, Type, Type__2, Type__3 } from "../backend.d";
import { AdminComplaintModal } from "../components/AdminComplaintModal";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { useGetAllComplaints, useGetComplaintStats } from "../hooks/useQueries";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
  formatDate,
} from "../lib/formatters";

type NavTab = "dashboard" | "complaints";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { data: complaints = [], isLoading: complaintsLoading } =
    useGetAllComplaints();
  const { data: stats, isLoading: statsLoading } = useGetComplaintStats();

  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  );
  const [filterStatus, setFilterStatus] = useState<Type | "all">("all");
  const [filterCategory, setFilterCategory] = useState<Type__2 | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Type__3 | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterCategory !== "all" && c.category !== filterCategory)
        return false;
      if (filterPriority !== "all" && c.priority !== filterPriority)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !c.title.toLowerCase().includes(q) &&
          !c.submitterName.toLowerCase().includes(q) &&
          !c.referenceNumber.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [complaints, filterStatus, filterCategory, filterPriority, searchQuery]);

  const statCards = [
    {
      label: "Total",
      value: stats ? Number(stats.total) : 0,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
      ocid: "admin_stats.total_card",
    },
    {
      label: "Open",
      value: stats ? Number(stats.open) : 0,
      icon: InboxIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
      ocid: "admin_stats.open_card",
    },
    {
      label: "In Progress",
      value: stats ? Number(stats.inProgress) : 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      ocid: "admin_stats.inprogress_card",
    },
    {
      label: "Resolved",
      value: stats ? Number(stats.resolved) : 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      ocid: "admin_stats.resolved_card",
    },
    {
      label: "Closed",
      value: stats ? Number(stats.closed) : 0,
      icon: XCircle,
      color: "text-slate-500",
      bg: "bg-slate-50",
      ocid: "admin_stats.closed_card",
    },
  ];

  const SidebarContent = () => (
    <nav className="flex flex-col h-full py-6 px-3">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <School className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-display font-bold text-sm text-sidebar-foreground tracking-tight leading-tight block">
            Aditya University
          </span>
          <span className="text-[10px] text-sidebar-foreground/50 font-ui leading-tight block">
            CMS
          </span>
        </div>
      </div>

      {/* Admin badge */}
      <div className="px-3 mb-6">
        <Badge className="bg-sidebar-primary/20 text-sidebar-primary border border-sidebar-primary/30 font-ui text-xs">
          Administrator
        </Badge>
      </div>

      {/* Nav items */}
      <div className="space-y-1">
        <button
          type="button"
          data-ocid="admin_dashboard.tab"
          onClick={() => {
            setActiveTab("dashboard");
            setSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-ui font-medium transition-colors ${
            activeTab === "dashboard"
              ? "bg-sidebar-accent text-sidebar-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          type="button"
          data-ocid="admin_dashboard.tab"
          onClick={() => {
            setActiveTab("complaints");
            setSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-ui font-medium transition-colors ${
            activeTab === "complaints"
              ? "bg-sidebar-accent text-sidebar-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          All Complaints
          {complaints.length > 0 && (
            <span className="ml-auto bg-sidebar-primary/20 text-sidebar-primary text-xs font-semibold px-1.5 py-0.5 rounded-full">
              {complaints.length}
            </span>
          )}
        </button>
      </div>

      {/* Logout at bottom */}
      <div className="mt-auto pt-4 border-t border-sidebar-border px-3">
        <button
          type="button"
          data-ocid="admin_dashboard.button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-ui font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </nav>
  );

  return (
    <div
      data-ocid="admin_dashboard.page"
      className="flex h-screen bg-background overflow-hidden"
    >
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-56 bg-sidebar border-r border-sidebar-border flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 w-full h-full cursor-default"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <div className="relative w-56 bg-sidebar border-r border-sidebar-border h-full z-10">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-card border-b border-border h-14 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="admin_dashboard.button"
              className="md:hidden p-1.5 rounded-md hover:bg-accent"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-lg">
              {activeTab === "dashboard" ? "Dashboard" : "All Complaints"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary font-ui">
              A
            </div>
            <span className="hidden sm:block text-sm font-ui font-medium">
              Admin
            </span>
            <Button
              data-ocid="admin_dashboard.button"
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="font-ui text-muted-foreground hover:text-foreground md:hidden"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Overview
                </h2>
                <p className="text-sm text-muted-foreground font-ui">
                  System-wide complaint statistics
                </p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {statCards.map((s) => (
                  <div
                    key={s.label}
                    data-ocid={s.ocid}
                    className="bg-card border border-border rounded-xl p-4 shadow-card"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}
                    >
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <p className="text-2xl font-display font-bold text-foreground">
                      {statsLoading ? "—" : s.value}
                    </p>
                    <p className="text-xs text-muted-foreground font-ui mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent complaints preview */}
              <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="font-display font-semibold text-sm">
                    Recent Complaints
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("complaints")}
                    className="font-ui text-xs text-primary"
                  >
                    View all
                  </Button>
                </div>
                {complaintsLoading ? (
                  <div className="p-4 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : complaints.length === 0 ? (
                  <div
                    data-ocid="admin_dashboard.empty_state"
                    className="py-10 text-center"
                  >
                    <p className="text-sm text-muted-foreground font-ui">
                      No complaints yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {complaints.slice(0, 5).map((c) => (
                      <button
                        key={Number(c.id)}
                        type="button"
                        className="w-full flex items-center justify-between px-5 py-3 hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedComplaint(c)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 shrink-0">
                            <Hash className="w-2.5 h-2.5 text-primary" />
                            <span className="text-xs font-mono font-bold text-primary">
                              {c.referenceNumber}
                            </span>
                          </div>
                          <p className="text-sm font-ui font-medium truncate">
                            {c.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={c.status} />
                          <span className="text-xs text-muted-foreground font-ui hidden sm:block">
                            {formatDate(c.createdAt)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "complaints" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Filters */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-ui font-semibold">Filters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Search */}
                  <div className="relative sm:col-span-2 lg:col-span-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      data-ocid="complaints_table.search_input"
                      placeholder="Search title, name or reference..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 font-ui text-sm"
                    />
                  </div>

                  {/* Status filter */}
                  <Select
                    value={filterStatus}
                    onValueChange={(v) => setFilterStatus(v as Type | "all")}
                  >
                    <SelectTrigger
                      data-ocid="complaints_table.select"
                      className="font-ui text-sm"
                    >
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-ui">
                        All Statuses
                      </SelectItem>
                      {(Object.keys(STATUS_LABELS) as Type[]).map((k) => (
                        <SelectItem key={k} value={k} className="font-ui">
                          {STATUS_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Category filter */}
                  <Select
                    value={filterCategory}
                    onValueChange={(v) =>
                      setFilterCategory(v as Type__2 | "all")
                    }
                  >
                    <SelectTrigger
                      data-ocid="complaints_table.select"
                      className="font-ui text-sm"
                    >
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-ui">
                        All Categories
                      </SelectItem>
                      {(Object.keys(CATEGORY_LABELS) as Type__2[]).map((k) => (
                        <SelectItem key={k} value={k} className="font-ui">
                          {CATEGORY_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Priority filter */}
                  <Select
                    value={filterPriority}
                    onValueChange={(v) =>
                      setFilterPriority(v as Type__3 | "all")
                    }
                  >
                    <SelectTrigger
                      data-ocid="complaints_table.select"
                      className="font-ui text-sm"
                    >
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-ui">
                        All Priorities
                      </SelectItem>
                      {(Object.keys(PRIORITY_LABELS) as Type__3[]).map((k) => (
                        <SelectItem key={k} value={k} className="font-ui">
                          {PRIORITY_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(filterStatus !== "all" ||
                  filterCategory !== "all" ||
                  filterPriority !== "all" ||
                  searchQuery) && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-muted-foreground font-ui">
                      {filteredComplaints.length} of {complaints.length}{" "}
                      complaints
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs font-ui h-7 px-2"
                      onClick={() => {
                        setFilterStatus("all");
                        setFilterCategory("all");
                        setFilterPriority("all");
                        setSearchQuery("");
                      }}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                {complaintsLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton
                        key={i}
                        data-ocid="complaints_table.loading_state"
                        className="h-14 w-full"
                      />
                    ))}
                  </div>
                ) : filteredComplaints.length === 0 ? (
                  <div
                    data-ocid="complaints_table.empty_state"
                    className="py-16 text-center"
                  >
                    <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm font-ui text-muted-foreground">
                      No complaints match your filters
                    </p>
                  </div>
                ) : (
                  <div data-ocid="complaints_table.table">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-ui font-semibold text-xs uppercase tracking-wide">
                            Reference
                          </TableHead>
                          <TableHead className="font-ui font-semibold text-xs uppercase tracking-wide">
                            Submitter
                          </TableHead>
                          <TableHead className="font-ui font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">
                            Title
                          </TableHead>
                          <TableHead className="font-ui font-semibold text-xs uppercase tracking-wide hidden md:table-cell">
                            Category
                          </TableHead>
                          <TableHead className="font-ui font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">
                            Priority
                          </TableHead>
                          <TableHead className="font-ui font-semibold text-xs uppercase tracking-wide">
                            Status
                          </TableHead>
                          <TableHead className="font-ui font-semibold text-xs uppercase tracking-wide hidden xl:table-cell">
                            Date
                          </TableHead>
                          <TableHead className="font-ui font-semibold text-xs uppercase tracking-wide text-right">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredComplaints.map((complaint, idx) => (
                          <TableRow
                            key={Number(complaint.id)}
                            data-ocid={`complaints_table.item.${idx + 1}`}
                            className="hover:bg-accent/40 cursor-pointer"
                          >
                            <TableCell>
                              <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded px-2 py-0.5 w-fit">
                                <Hash className="w-2.5 h-2.5 text-primary shrink-0" />
                                <span className="text-xs font-mono font-bold text-primary">
                                  {complaint.referenceNumber}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-ui font-medium text-sm text-foreground leading-tight">
                                  {complaint.submitterName}
                                </p>
                                <p className="text-xs text-muted-foreground font-ui capitalize">
                                  {ROLE_LABELS[complaint.submitterType]}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell max-w-[200px]">
                              <p className="font-ui text-sm text-foreground truncate">
                                {complaint.title}
                              </p>
                            </TableCell>
                            <TableCell className="hidden md:table-cell font-ui text-xs text-muted-foreground whitespace-nowrap">
                              {CATEGORY_LABELS[complaint.category]}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <PriorityBadge priority={complaint.priority} />
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={complaint.status} />
                            </TableCell>
                            <TableCell className="hidden xl:table-cell font-ui text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(complaint.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                data-ocid={`complaints_table.edit_button.${idx + 1}`}
                                onClick={() => setSelectedComplaint(complaint)}
                                className="font-ui text-xs h-8 px-3"
                              >
                                <Pencil className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-3 px-6 text-center shrink-0">
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
      </div>

      {/* Admin complaint modal */}
      <AdminComplaintModal
        complaint={selectedComplaint}
        open={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </div>
  );
}
