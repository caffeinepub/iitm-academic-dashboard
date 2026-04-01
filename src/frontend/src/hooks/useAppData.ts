import { useEffect, useRef, useState } from "react";
import type {
  AttendanceRecord,
  Course,
  ExamEntry,
  SemSettings,
  Task,
} from "../types";
import {
  type FirestoreData,
  loadFromFirestore,
  saveToFirestore,
  subscribeToFirestore,
} from "../utils/firestoreSync";
import { autoDetectSem } from "../utils/semester";
import { getItem, setItem } from "../utils/storage";

// ── Sample data (only shown to brand-new LOCAL users) ─────────────────────
const SAMPLE_COURSES: Course[] = [
  {
    id: "1",
    name: "Mathematics III",
    code: "MA3201",
    slot: "A",
    venue: "CLT",
    color: "#A8D5BA",
    hoursPerWeek: 4,
  },
  {
    id: "2",
    name: "Physics",
    code: "PH2201",
    slot: "B",
    venue: "ESB 244",
    color: "#B8C9F0",
    hoursPerWeek: 3,
  },
  {
    id: "3",
    name: "Chemistry",
    code: "CY2101",
    slot: "C",
    venue: "HSB 315",
    color: "#F5C6D0",
    hoursPerWeek: 3,
  },
  {
    id: "4",
    name: "Introduction to Programming",
    code: "CS1100",
    slot: "D",
    venue: "CS Lab",
    color: "#FFE4A8",
    hoursPerWeek: 4,
  },
];

function genSampleAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const courseIds = ["1", "2", "3", "4"];
  const statuses: Array<"attended" | "absent"> = [
    "attended",
    "attended",
    "attended",
    "attended",
    "attended",
    "absent",
  ];
  let id = 1;
  for (const cid of courseIds) {
    for (let i = 20; i >= 1; i--) {
      const d = new Date(2026, 0, 6 + i * 2);
      if (d.getDay() === 0) continue;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      records.push({
        id: String(id++),
        courseId: cid,
        date: d.toISOString().split("T")[0],
        status,
      });
    }
  }
  return records;
}

interface UseAppDataOptions {
  userId?: string;
  storageMode?: "local" | "sync";
  migrateLocal?: boolean;
}

export function useAppData({
  userId,
  storageMode = "local",
  migrateLocal = false,
}: UseAppDataOptions = {}) {
  const isSync = storageMode === "sync" && !!userId;
  const [isCloudLoading, setIsCloudLoading] = useState(isSync);

  // Ref to suppress Firestore writes during initial cloud load
  const suppressSaveUntil = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track if we're receiving updates from onSnapshot (to avoid echo-back saves)
  const receivingSnapshot = useRef(false);

  // ── Initial state ────────────────────────────────────────────────────────
  // For SYNC users: start from localStorage (may be empty) — Firestore will
  // overwrite immediately. Never show sample data to sync users.
  // For LOCAL users: show sample data only if localStorage is also empty.
  const [courses, setCourses] = useState<Course[]>(() => {
    const stored = getItem<Course[]>("courses", []);
    if (stored.length === 0 && !isSync) return SAMPLE_COURSES;
    return stored;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const stored = getItem<AttendanceRecord[]>("attendance", []);
    if (stored.length === 0 && !isSync) return genSampleAttendance();
    return stored;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = getItem<Task[]>("tasks", []);
    if (stored.length > 0 || isSync) return stored;
    return [
      {
        id: "t1",
        title: "Submit MA3201 Assignment",
        date: "2026-02-10",
        completed: false,
      },
      {
        id: "t2",
        title: "Physics Lab Report",
        date: "2026-02-12",
        time: "17:00",
        completed: false,
      },
      {
        id: "t3",
        title: "Chemistry Quiz Prep",
        date: "2026-02-15",
        completed: false,
      },
    ];
  });

  const [semSettings, setSemSettings] = useState<SemSettings>(() =>
    getItem<SemSettings>("semSettings", {
      year: new Date().getFullYear(),
      semType: autoDetectSem(),
      overridden: false,
    }),
  );

  const [studentName, setStudentName] = useState<string>(() =>
    getItem<string>("studentName", "Scholar"),
  );

  const [examEntries, setExamEntries] = useState<ExamEntry[]>(() =>
    getItem<ExamEntry[]>("examEntries", []),
  );

  // ── Cloud load on mount (sync mode only) ──────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
  useEffect(() => {
    if (!isSync) return;

    let unsubscribe: (() => void) | null = null;

    const initCloud = async () => {
      try {
        const cloudData = await loadFromFirestore(userId!);
        if (cloudData) {
          // Suppress any save that might be triggered by these state updates
          suppressSaveUntil.current = Date.now() + 5000;
          // Always apply cloud data (even empty arrays — user may have cleared them)
          setCourses(cloudData.courses ?? []);
          setAttendance(cloudData.attendance ?? []);
          setTasks(cloudData.tasks ?? []);
          if (cloudData.semSettings) setSemSettings(cloudData.semSettings);
          if (cloudData.studentName) setStudentName(cloudData.studentName);
          setExamEntries(cloudData.examEntries ?? []);
        } else if (migrateLocal) {
          // New sync user — push existing local data to Firestore
          const localData: FirestoreData = {
            courses: getItem<Course[]>("courses", SAMPLE_COURSES),
            attendance: getItem<AttendanceRecord[]>("attendance", []),
            tasks: getItem<Task[]>("tasks", []),
            semSettings: getItem<SemSettings>("semSettings", {
              year: new Date().getFullYear(),
              semType: autoDetectSem(),
              overridden: false,
            }),
            studentName: getItem<string>("studentName", "Scholar"),
            examEntries: getItem<ExamEntry[]>("examEntries", []),
          };
          await saveToFirestore(userId!, localData);
          // Apply local data to state (it's already there, but ensure consistency)
          setCourses(localData.courses);
          setAttendance(localData.attendance);
          setTasks(localData.tasks);
          setSemSettings(
            localData.semSettings ?? {
              year: new Date().getFullYear(),
              semType: autoDetectSem(),
              overridden: false,
            },
          );
          setStudentName(localData.studentName);
          setExamEntries(localData.examEntries);
        }
        // else: brand new sync user with no data — start with empty state
      } catch (e) {
        console.warn("Firestore load failed, using local data:", e);
      } finally {
        setIsCloudLoading(false);
      }

      // Subscribe to real-time updates from other devices
      try {
        unsubscribe = subscribeToFirestore(userId!, (data) => {
          if (receivingSnapshot.current) return;
          receivingSnapshot.current = true;
          suppressSaveUntil.current = Date.now() + 3000;
          // Always update state from snapshot, even empty arrays
          setCourses(data.courses ?? []);
          setAttendance(data.attendance ?? []);
          setTasks(data.tasks ?? []);
          if (data.semSettings) setSemSettings(data.semSettings);
          if (data.studentName) setStudentName(data.studentName);
          setExamEntries(data.examEntries ?? []);
          setTimeout(() => {
            receivingSnapshot.current = false;
          }, 200);
        });
      } catch (e) {
        console.warn("Firestore onSnapshot failed:", e);
      }
    };

    initCloud();

    return () => {
      unsubscribe?.();
    };
  }, []);

  // ── localStorage persistence (always, for offline resilience) ──────────────
  useEffect(() => {
    setItem("courses", courses);
  }, [courses]);
  useEffect(() => {
    setItem("attendance", attendance);
  }, [attendance]);
  useEffect(() => {
    setItem("tasks", tasks);
  }, [tasks]);
  useEffect(() => {
    setItem("semSettings", semSettings);
  }, [semSettings]);
  useEffect(() => {
    setItem("studentName", studentName);
  }, [studentName]);
  useEffect(() => {
    setItem("examEntries", examEntries);
  }, [examEntries]);

  // ── Firestore sync (debounced, only in sync mode) ─────────────────────────
  useEffect(() => {
    if (!isSync) return;
    if (receivingSnapshot.current) return;
    if (Date.now() < suppressSaveUntil.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      // Double-check guards inside the timeout (timing can shift)
      if (receivingSnapshot.current) return;
      if (Date.now() < suppressSaveUntil.current) return;
      saveToFirestore(userId!, {
        courses,
        attendance,
        tasks,
        semSettings,
        studentName,
        examEntries,
      }).catch((e) => console.warn("Firestore save failed:", e));
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    courses,
    attendance,
    tasks,
    semSettings,
    studentName,
    examEntries,
    isSync,
    userId,
  ]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const addCourse = (c: Course) => setCourses((prev) => [...prev, c]);
  const deleteCourse = (id: string) =>
    setCourses((prev) => prev.filter((c) => c.id !== id));

  const addAttendance = (r: AttendanceRecord) =>
    setAttendance((prev) => [...prev, r]);
  const deleteAttendance = (id: string) =>
    setAttendance((prev) => prev.filter((r) => r.id !== id));
  const updateAttendance = (id: string, status: AttendanceRecord["status"]) =>
    setAttendance((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );

  const addTask = (t: Task) => setTasks((prev) => [...prev, t]);
  const deleteTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));
  const toggleTask = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );

  const addExamEntry = (e: ExamEntry) => setExamEntries((prev) => [...prev, e]);
  const deleteExamEntry = (id: string) =>
    setExamEntries((prev) => prev.filter((e) => e.id !== id));

  const setExamOverride = (
    courseId: string,
    examType: "quiz1" | "quiz2" | "endSem",
    date: string,
  ) => {
    setExamEntries((prev) => {
      const filtered = prev.filter(
        (e) => !(e.courseId === courseId && e.examType === examType),
      );
      return [
        ...filtered,
        {
          id: `${courseId}-${examType}`,
          courseId,
          examType,
          date,
          custom: true,
        },
      ];
    });
  };

  const clearExamOverride = (
    courseId: string,
    examType: "quiz1" | "quiz2" | "endSem",
  ) => {
    setExamEntries((prev) =>
      prev.filter((e) => !(e.courseId === courseId && e.examType === examType)),
    );
  };

  return {
    isCloudLoading,
    courses,
    addCourse,
    deleteCourse,
    attendance,
    addAttendance,
    deleteAttendance,
    updateAttendance,
    tasks,
    addTask,
    deleteTask,
    toggleTask,
    semSettings,
    setSemSettings,
    studentName,
    setStudentName,
    examEntries,
    addExamEntry,
    deleteExamEntry,
    setExamOverride,
    clearExamOverride,
  };
}
