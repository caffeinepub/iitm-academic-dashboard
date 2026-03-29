import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export type AcademicData = string;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface HolidayEntry {
    date: string;
    name: string;
}
export interface EventEntry {
    date: string;
    name: string;
    eventType: string;
}
export interface SlotExamDates {
    quiz1: string;
    quiz2: string;
    endSem: string;
}
export interface SemesterConfig {
    id: string;
    semName: string;
    year: bigint;
    semType: string;
    classStart: string;
    classEnd: string;
    quiz1Start: string;
    quiz1End: string;
    quiz2Start: string;
    quiz2End: string;
    endSemStart: string;
    endSemEnd: string;
    holidays: HolidayEntry[];
    events: EventEntry[];
    slotExamDates: [string, SlotExamDates][];
    isActive: boolean;
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerSnapshot(): Promise<AcademicData | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerSnapshot(snapshot: AcademicData): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveSemesterConfig(config: SemesterConfig): Promise<void>;
    getSemesterConfigs(): Promise<SemesterConfig[]>;
    getActiveSemesterConfig(): Promise<SemesterConfig | null>;
    setActiveSemester(id: string): Promise<void>;
    deleteSemesterConfig(id: string): Promise<void>;
}
