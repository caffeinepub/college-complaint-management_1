import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Result_2 = {
    __kind__: "ok";
    ok: Array<Complaint>;
} | {
    __kind__: "err";
    err: Variant_alreadyExists_invalidInput_notFound_internalError_unauthorized;
};
export type Result_5 = {
    __kind__: "ok";
    ok: Complaint;
} | {
    __kind__: "err";
    err: Variant_alreadyExists_invalidInput_notFound_internalError_unauthorized;
};
export type Result_1 = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: Variant_alreadyExists_invalidInput_notFound_internalError_unauthorized;
};
export type Result_4 = {
    __kind__: "ok";
    ok: ComplaintStats;
} | {
    __kind__: "err";
    err: Variant_alreadyExists_invalidInput_notFound_internalError_unauthorized;
};
export type Result = {
    __kind__: "ok";
    ok: {
    };
} | {
    __kind__: "err";
    err: Variant_alreadyExists_invalidInput_notFound_internalError_unauthorized;
};
export type Result_3 = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: Variant_alreadyExists_invalidInput_notFound_internalError_unauthorized;
};
export interface Complaint {
    id: bigint;
    status: Type;
    title: string;
    submitterName: string;
    submitterType: Type__1;
    referenceNumber: string;
    assignedTo?: string;
    createdAt: bigint;
    submittedBy: Principal;
    description: string;
    updatedAt: bigint;
    category: Type__2;
    submittedByUserId: string;
    priority: Type__3;
    adminResponse?: string;
}
export interface ComplaintStats {
    resolved: bigint;
    closed: bigint;
    total: bigint;
    open: bigint;
    inProgress: bigint;
}
export interface UserProfile {
    userId: string;
    name: string;
    role: Type__1;
}
export enum Type {
    resolved = "resolved",
    closed = "closed",
    open = "open",
    inProgress = "inProgress"
}
export enum Type__1 {
    admin = "admin",
    staff = "staff",
    student = "student"
}
export enum Type__2 {
    itTechnical = "itTechnical",
    other = "other",
    administrative = "administrative",
    academic = "academic",
    hostelCanteen = "hostelCanteen",
    infrastructure = "infrastructure",
    facultyConduct = "facultyConduct"
}
export enum Type__3 {
    low = "low",
    high = "high",
    urgent = "urgent",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_alreadyExists_invalidInput_notFound_internalError_unauthorized {
    alreadyExists = "alreadyExists",
    invalidInput = "invalidInput",
    notFound = "notFound",
    internalError = "internalError",
    unauthorized = "unauthorized"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllComplaints(): Promise<Result_2>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComplaintById(id: bigint): Promise<Result_5>;
    getComplaintStats(): Promise<Result_4>;
    getMyComplaintCount(): Promise<Result_3>;
    getMyComplaints(): Promise<Result_2>;
    getUserInfo(): Promise<UserProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isFirstTimeUser(userId: string): Promise<boolean>;
    registerUser(userId: string, name: string, userType: Type__1): Promise<Result_1>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitComplaint(submitterName: string, submitterType: Type__1, category: Type__2, title: string, description: string, priority: Type__3): Promise<Result_1>;
    updateComplaintStatus(complaintId: bigint, newStatus: Type, adminResponse: string | null, assignedTo: string | null): Promise<Result>;
}
