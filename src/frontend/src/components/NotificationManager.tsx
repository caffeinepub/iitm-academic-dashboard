import { useEffect, useRef } from "react";
import type { AttendanceRecord, Course, Task } from "../types";
import { calcAttendance } from "../utils/attendance";
import { SLOT_OCCURRENCES } from "../utils/slots";

interface Props {
  courses: Course[];
  attendance: AttendanceRecord[];
  tasks: Task[];
}

export function NotificationManager({ courses, attendance, tasks }: Props) {
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (typeof Notification === "undefined") return;

    const check = () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const today = now.toISOString().split("T")[0];
      const todayDay = now.getDay(); // 0=Sun, 1=Mon...
      const iitmDay = todayDay - 1; // 0=Mon...4=Fri

      // 7am class reminders
      if (h === 7 && m < 5) {
        const todayCourses = courses.filter((c) => {
          const occs = SLOT_OCCURRENCES[c.slot] ?? [];
          return occs.some((o) => o.day === iitmDay);
        });
        for (const c of todayCourses) {
          const key = `class-${today}-${c.id}`;
          if (!firedRef.current.has(key)) {
            firedRef.current.add(key);
            new Notification("InstiFlow — Class Today 📚", {
              body: `${c.name} (Slot ${c.slot})${
                c.venue ? `· ${c.venue}` : ""
              }`,
              icon: "/favicon.ico",
            });
          }
        }

        // Attendance warnings
        for (const c of courses) {
          const stats = calcAttendance(attendance, c.id);
          if (stats.percentage < 75 && stats.total > 0) {
            const key = `attn-warn-${today}-${c.id}`;
            if (!firedRef.current.has(key)) {
              firedRef.current.add(key);
              new Notification("InstiFlow — Attendance Warning ⚠️", {
                body: `${c.name}: ${stats.percentage}% (need ${stats.toReach75} more classes)`,
              });
            }
          }
        }

        // Task alerts
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        for (const t of tasks) {
          if (t.completed) continue;
          if (t.date === today || t.date === tomorrowStr) {
            const key = `task-${today}-${t.id}`;
            if (!firedRef.current.has(key)) {
              firedRef.current.add(key);
              const label = t.date === today ? "Due Today" : "Due Tomorrow";
              new Notification(`InstiFlow — Task ${label} 📋`, {
                body: t.title,
              });
            }
          }
        }
      }
    };

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [courses, attendance, tasks]);

  return null;
}
