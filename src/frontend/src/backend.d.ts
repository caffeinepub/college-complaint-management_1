import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ComplaintStats {
    resolved: bigint;
    closed: bigint;
    total: bigint;
    open: bigint;
    inProgress: bigint;
}
export interface UpdateStatusRequest {
    id: bigint;
    assignedTo?: string;
    newStatus: Type;
    adminResponse?: string;
}
export interface Complaint {
    id: bigint;
    status: Type;
    title: string;
    submitterName: string;
    submitterRole: Type__3;
    assignedTo?: string;
    createdAt: bigint;
    submittedBy: Principal;
    description: string;
    updatedAt: bigint;
    category: Type__1;
    priority: Type__2;
    adminResponse?: string;
}
export interface SubmitComplaintRequest {
    title: string;
    submitterName: string;
    submitterRole: Type__3;
    description: string;
    category: Type__1;
    priority: Type__2;
}
export interface UserProfile {
    name: string;
}
export enum Type {
    resolved = "resolved",
    closed = "closed",
    open = "open",
    inProgress = "inProgress"
}
export enum Type__1 {
    itTechnical = "itTechnical",
    other = "other",
    administrative = "administrative",
    academic = "academic",
    hostelCanteen = "hostelCanteen",
    infrastructure = "infrastructure",
    facultyConduct = "facultyConduct"
}
export enum Type__2 {
    low = "low",
    high = "high",
    urgent = "urgent",
    medium = "medium"
}
export enum Type__3 {
    admin = "admin",
    staff = "staff",
    student = "student"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllComplaints(): Promise<Array<Complaint>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComplaintById(id: bigint): Promise<Complaint | null>;
    getComplaintStats(): Promise<ComplaintStats>;
    getMyComplaints(): Promise<Array<Complaint>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitComplaint(request: SubmitComplaintRequest): Promise<bigint>;
    updateComplaintStatus(request: UpdateStatusRequest): Promise<void>;
}
