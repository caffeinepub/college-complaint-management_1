import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Complaint,
  ComplaintStats,
  SubmitComplaintRequest,
  UpdateStatusRequest,
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

// ─── Complaints ───────────────────────────────────────────────────────────────

export function useGetMyComplaints() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Complaint[]>({
    queryKey: ["myComplaints"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyComplaints();
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
      return actor.getAllComplaints();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetComplaintStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ComplaintStats>({
    queryKey: ["complaintStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getComplaintStats();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSubmitComplaint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SubmitComplaintRequest) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitComplaint(request);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myComplaints"] });
      void queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
      void queryClient.invalidateQueries({ queryKey: ["complaintStats"] });
    },
  });
}

export function useUpdateComplaintStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateStatusRequest) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateComplaintStatus(request);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
      void queryClient.invalidateQueries({ queryKey: ["complaintStats"] });
      void queryClient.invalidateQueries({ queryKey: ["myComplaints"] });
    },
  });
}
