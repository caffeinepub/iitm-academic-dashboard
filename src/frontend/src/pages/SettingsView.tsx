import { motion } from "motion/react";
import { GlassCard } from "../components/GlassCard";
import type { NotificationPrefs } from "../types";
import type { SemSettings } from "../types";
import { autoDetectSem } from "../utils/semester";

interface Props {
  semSettings: SemSettings;
  onUpdateSem: (s: SemSettings) => void;
  studentName: string;
  onUpdateName: (n: string) => void;
  notificationPrefs: NotificationPrefs;
  onUpdateNotifPrefs: (p: NotificationPrefs) => void;
}

export function SettingsView({
  semSettings,
  onUpdateSem,
  studentName,
  onUpdateName,
  notificationPrefs,
  onUpdateNotifPrefs,
}: Props) {
  const clearAll = () => {
    if (
      confirm(
        "Are you sure? This will delete ALL your courses, attendance, tasks, and settings.",
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const resetToAutoDetect = () => {
    onUpdateSem({
      year: new Date().getFullYear(),
      semType: autoDetectSem(),
      overridden: false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ padding: "32px 28px", maxWidth: 500 }}
    >
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 24,
          color: "#F2F4FF",
        }}
      >
        Settings
      </h2>
      <GlassCard style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            color: "#606880",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 14,
            fontWeight: 600,
          }}
        >
          Profile
        </div>
        <label
          htmlFor="student-name"
          style={{
            fontSize: 13,
            color: "#A9B0C7",
            display: "block",
            marginBottom: 6,
          }}
        >
          Your Name
        </label>
        <input
          id="student-name"
          data-ocid="settings.input"
          className="glass-input"
          value={studentName}
          onChange={(e) => onUpdateName(e.target.value)}
          placeholder="Your name"
        />
      </GlassCard>
      <GlassCard style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            color: "#606880",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 14,
            fontWeight: 600,
          }}
        >
          Semester Settings
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1 }}>
            <label
              htmlFor="sem-type"
              style={{
                fontSize: 13,
                color: "#A9B0C7",
                display: "block",
                marginBottom: 6,
              }}
            >
              Semester Type
            </label>
            <select
              id="sem-type"
              data-ocid="settings.select"
              className="glass-input"
              value={semSettings.semType}
              onChange={(e) =>
                onUpdateSem({
                  ...semSettings,
                  semType: e.target.value as "even" | "odd",
                  overridden: true,
                })
              }
            >
              <option value="even">Even (Jan–May)</option>
              <option value="odd">Odd (Jul–Nov)</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="sem-year"
              style={{
                fontSize: 13,
                color: "#A9B0C7",
                display: "block",
                marginBottom: 6,
              }}
            >
              Year
            </label>
            <input
              id="sem-year"
              className="glass-input"
              type="number"
              value={semSettings.year}
              onChange={(e) =>
                onUpdateSem({
                  ...semSettings,
                  year:
                    Number.parseInt(e.target.value) || new Date().getFullYear(),
                  overridden: true,
                })
              }
            />
          </div>
        </div>
        {semSettings.overridden && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={resetToAutoDetect}
            style={{
              background: "none",
              border: "none",
              color: "#6366f1",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            ↺ Reset to auto-detect
          </motion.button>
        )}
      </GlassCard>
      <GlassCard style={{ borderColor: "rgba(255,122,89,0.3)" }}>
        <div
          style={{
            fontSize: 11,
            color: "#FF7A59",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 14,
            fontWeight: 600,
          }}
        >
          Danger Zone
        </div>
        <motion.button
          data-ocid="settings.delete_button"
          whileTap={{ scale: 0.97 }}
          className="glass-btn glass-btn-red"
          onClick={clearAll}
        >
          Clear All Data
        </motion.button>
      </GlassCard>

      {/* Notification Preferences */}
      <GlassCard style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            color: "#606880",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 14,
            fontWeight: 600,
          }}
        >
          Notifications
        </div>
        {(
          [
            {
              key: "morningClassSummary",
              label: "Morning Class Summary",
              desc: "7 AM daily class rundown",
            },
            {
              key: "examAlerts",
              label: "Exam Alerts",
              desc: "1 week, 3 days, 1 day before exams",
            },
            {
              key: "taskAlerts",
              label: "Task Alerts",
              desc: "Reminders for due & upcoming tasks",
            },
            {
              key: "attendanceAlerts",
              label: "Attendance Warnings",
              desc: "Alert when below 75%",
            },
          ] as Array<{
            key: keyof NotificationPrefs;
            label: string;
            desc: string;
          }>
        ).map(({ key, label, desc }) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: "#D0D5F0", fontWeight: 600 }}>
                {label}
              </div>
              <div style={{ fontSize: 11, color: "#606880", marginTop: 2 }}>
                {desc}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateNotifPrefs({
                  ...notificationPrefs,
                  [key]: !notificationPrefs[key],
                })
              }
              style={{
                position: "relative",
                width: 44,
                height: 24,
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: notificationPrefs[key]
                  ? "linear-gradient(90deg, #8b5cf6, #3b82f6)"
                  : "rgba(255,255,255,0.1)",
                transition: "background 0.3s",
                flexShrink: 0,
              }}
              aria-label={`Toggle ${label}`}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: notificationPrefs[key] ? 22 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  transition: "left 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
                  display: "block",
                }}
              />
            </button>
          </div>
        ))}
      </GlassCard>

      {/* Footer credit */}
      <div
        style={{
          textAlign: "center",
          padding: "20px 0 8px",
          fontSize: 12,
          color: "rgba(160,170,220,0.55)",
          letterSpacing: "0.04em",
          lineHeight: 1.6,
        }}
      >
        <span
          style={{
            background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          Created by Bharath · BE24
        </span>
        <br />
        <span style={{ opacity: 0.7 }}>Powered by </span>
        <span
          style={{
            background: "linear-gradient(90deg, #f59e0b, #ef4444)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          IITM BAZAAR
        </span>
      </div>
    </motion.div>
  );
}
