import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type {
  AttendanceRecord,
  Course,
  ExamEntry,
  SemSettings,
  Task,
} from "../types";

export interface FirestoreData {
  courses: Course[];
  attendance: AttendanceRecord[];
  tasks: Task[];
  semSettings: SemSettings | null;
  studentName: string;
  examEntries: ExamEntry[];
}

export async function saveToFirestore(
  userId: string,
  data: FirestoreData,
): Promise<void> {
  const ref = doc(db, "users", userId);
  await setDoc(ref, data, { merge: true });
}

export async function loadFromFirestore(
  userId: string,
): Promise<FirestoreData | null> {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as FirestoreData;
}
