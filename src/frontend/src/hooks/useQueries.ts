import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Complaint,
  ComplaintStats,
  Type,
  Type__1,
  Type__2,
  Type__3,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserInfo() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ["userInfo"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserInfo();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useIsFirstTimeUser(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isFirstTimeUser", userId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isFirstTimeUser(userId);
    },
    enabled: !!actor && !actorFetching && userId.length > 0,
    retry: false,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      name,
      userType,
    }: {
      userId: string;
      name: string;
      userType: Type__1;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.registerUser(userId, name, userType);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      void queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Admin check ─────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Complaints (userId-based, no II required) ────────────────────────────────

export function useGetComplaintsByUserId(userId: string, password: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Complaint[]>({
    queryKey: ["complaintsByUserId", userId],
    queryFn: async () => {
      if (!actor) return [];
      const result = (await (actor as any).getComplaintsByUserId(
        userId,
        password,
      )) as
        | { __kind__: "ok"; ok: Complaint[] }
        | { __kind__: "err"; err: string };
      if (result.__kind__ === "ok") return result.ok;
      return [];
    },
    enabled: !!actor && !actorFetching && !!userId && !!password,
    refetchOnMount: true,
  });
}

export function useSubmitComplaintPublic(userId: string, password: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submitterName,
      submitterType,
      category,
      title,
      description,
      priority,
    }: {
      submitterName: string;
      submitterType: Type__1;
      category: Type__2;
      title: string;
      description: string;
      priority: Type__3;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = (await (actor as any).submitComplaintPublic(
        userId,
        password,
        submitterName,
        submitterType,
        category,
        title,
        description,
        priority,
      )) as { __kind__: "ok"; ok: string } | { __kind__: "err"; err: string };
      if (result.__kind__ === "ok") return result.ok;
      throw new Error("Failed to submit complaint");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["complaintsByUserId", userId],
      });
      void queryClient.invalidateQueries({ queryKey: ["adminComplaints"] });
      void queryClient.invalidateQueries({ queryKey: ["adminComplaintStats"] });
    },
  });
}

// ─── Complaints (II-based) ─────────────────────────────────────────────────────

export function useGetMyComplaints() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Complaint[]>({
    queryKey: ["myComplaints"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getMyComplaints();
      if (result.__kind__ === "ok") return result.ok;
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetMyComplaintCount() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ["myComplaintCount"],
    queryFn: async () => {
      if (!actor) return 0;
      const result = await actor.getMyComplaintCount();
      if (result.__kind__ === "ok") return Number(result.ok);
      return 0;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllComplaints() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Complaint[]>({
    queryKey: ["allComplaints"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllComplaints();
      if (result.__kind__ === "ok") return result.ok;
      throw new Error(`Failed to fetch complaints: ${result.__kind__}`);
    },
    enabled: !!actor && !actorFetching,
    retry: 3,
    retryDelay: 1500,
    refetchOnMount: "always",
  });
}

export function useGetComplaintStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ComplaintStats>({
    queryKey: ["complaintStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.getComplaintStats();
      if (result.__kind__ === "ok") return result.ok;
      throw new Error("Failed to fetch stats");
    },
    enabled: !!actor && !actorFetching,
    retry: 3,
    retryDelay: 1500,
    refetchOnMount: "always",
  });
}

export function useSubmitComplaint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submitterName,
      submitterType,
      category,
      title,
      description,
      priority,
    }: {
      submitterName: string;
      submitterType: Type__1;
      category: Type__2;
      title: string;
      description: string;
      priority: Type__3;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.submitComplaint(
        submitterName,
        submitterType,
        category,
        title,
        description,
        priority,
      );
      if (result.__kind__ === "ok") return result.ok;
      throw new Error(`Failed to submit complaint: ${result.__kind__}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myComplaints"] });
      void queryClient.invalidateQueries({ queryKey: ["adminComplaints"] });
      void queryClient.invalidateQueries({ queryKey: ["adminComplaintStats"] });
      void queryClient.invalidateQueries({ queryKey: ["myComplaintCount"] });
    },
  });
}

export function useUpdateComplaintStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      newStatus,
      assignedTo,
      adminResponse,
    }: {
      id: bigint;
      newStatus: Type;
      assignedTo?: string;
      adminResponse?: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.updateComplaintStatus(
        id,
        newStatus,
        adminResponse ?? null,
        assignedTo ?? null,
      );
      if (result.__kind__ === "ok") return result.ok;
      throw new Error("Failed to update complaint");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
      void queryClient.invalidateQueries({ queryKey: ["complaintStats"] });
      void queryClient.invalidateQueries({ queryKey: ["myComplaints"] });
    },
  });
}

// ─── Admin password-based APIs ───────────────────────────────────────────────
// Use separate query keys to avoid conflicts with II-based queries

export function useGetAllComplaintsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Complaint[]>({
    queryKey: ["adminComplaints"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = (await (actor as any).getAllComplaintsAdmin("admin123")) as
        | { __kind__: "ok"; ok: Complaint[] }
        | { __kind__: "err"; err: string };
      if (result.__kind__ === "ok") return result.ok;
      throw new Error(`Failed to load complaints: ${result.__kind__}`);
    },
    enabled: !!actor && !actorFetching,
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    refetchOnMount: "always",
    refetchInterval: 30000, // auto-refresh every 30 seconds
  });
}

export function useGetComplaintStatsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<ComplaintStats>({
    queryKey: ["adminComplaintStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = (await (actor as any).getComplaintStatsAdmin(
        "admin123",
      )) as
        | { __kind__: "ok"; ok: ComplaintStats }
        | { __kind__: "err"; err: string };
      if (result.__kind__ === "ok") return result.ok;
      throw new Error(`Failed to fetch stats: ${result.__kind__}`);
    },
    enabled: !!actor && !actorFetching,
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    refetchOnMount: "always",
    refetchInterval: 30000,
  });
}

export function useUpdateComplaintStatusAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      newStatus,
      assignedTo,
      adminResponse,
    }: {
      id: bigint;
      newStatus: Type;
      assignedTo?: string;
      adminResponse?: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = (await (actor as any).updateComplaintStatusAdmin(
        "admin123",
        id,
        newStatus,
        adminResponse ?? null,
        assignedTo ?? null,
      )) as
        | { __kind__: "ok"; ok: Record<string, never> }
        | { __kind__: "err"; err: string };
      if (result.__kind__ === "ok") return result.ok;
      throw new Error("Failed to update complaint");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminComplaints"] });
      void queryClient.invalidateQueries({ queryKey: ["adminComplaintStats"] });
    },
  });
}
