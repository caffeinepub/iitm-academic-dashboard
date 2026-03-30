import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { GlassCard } from "../components/GlassCard";
import type { SemSettings } from "../types";
import { autoDetectSem } from "../utils/semester";

interface Props {
  semSettings: SemSettings;
  onUpdateSem: (s: SemSettings) => void;
  studentName: string;
  onUpdateName: (n: string) => void;
}

export function SettingsView({
  semSettings,
  onUpdateSem,
  studentName,
  onUpdateName,
}: Props) {
  interface NotifPrefs {
    dailySummaryTime: string;
    examAlerts: boolean;
    taskAlerts: boolean;
    customReminders: { id: string; label: string; datetime: string }[];
  }

  const defaultPrefs: NotifPrefs = {
    dailySummaryTime: "07:00",
    examAlerts: true,
    taskAlerts: true,
    customReminders: [],
  };

  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(() => {
    try {
      return {
        ...defaultPrefs,
        ...JSON.parse(localStorage.getItem("notifPrefs") || "{}"),
      };
    } catch {
      return defaultPrefs;
    }
  });
  const [newReminderLabel, setNewReminderLabel] = useState("");
  const [newReminderDatetime, setNewReminderDatetime] = useState("");

  useEffect(() => {
    localStorage.setItem("notifPrefs", JSON.stringify(notifPrefs));
  }, [notifPrefs]);

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
      {/* Notification Preferences */}
      <GlassCard style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            color: "#6B7590",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 14,
            fontWeight: 600,
          }}
        >
          Notification Preferences
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              htmlFor="daily-summary-time"
              style={{
                fontSize: 12,
                color: "#8B9AC0",
                display: "block",
                marginBottom: 4,
              }}
            >
              Daily summary time
            </label>
            <input
              id="daily-summary-time"
              data-ocid="settings.notif.input"
              type="time"
              value={notifPrefs.dailySummaryTime}
              onChange={(e) =>
                setNotifPrefs((prev) => ({
                  ...prev,
                  dailySummaryTime: e.target.value,
                }))
              }
              className="glass-input"
              style={{ fontSize: 13, width: "auto" }}
            />
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <input
              data-ocid="settings.notif.exam.checkbox"
              type="checkbox"
              checked={notifPrefs.examAlerts}
              onChange={(e) =>
                setNotifPrefs((prev) => ({
                  ...prev,
                  examAlerts: e.target.checked,
                }))
              }
              style={{ width: 16, height: 16, accentColor: "#8B5CF6" }}
            />
            <span style={{ fontSize: 13, color: "#B0BAD0" }}>
              Exam reminders (1 week, 3 days, 1 day before)
            </span>
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <input
              data-ocid="settings.notif.task.checkbox"
              type="checkbox"
              checked={notifPrefs.taskAlerts}
              onChange={(e) =>
                setNotifPrefs((prev) => ({
                  ...prev,
                  taskAlerts: e.target.checked,
                }))
              }
              style={{ width: 16, height: 16, accentColor: "#8B5CF6" }}
            />
            <span style={{ fontSize: 13, color: "#B0BAD0" }}>
              Task deadline reminders
            </span>
          </label>
          <div>
            <div style={{ fontSize: 12, color: "#8B9AC0", marginBottom: 8 }}>
              Custom Reminders
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <input
                data-ocid="settings.notif.reminder.input"
                type="text"
                placeholder="Reminder label (optional)"
                value={newReminderLabel}
                onChange={(e) => setNewReminderLabel(e.target.value)}
                className="glass-input"
                style={{ fontSize: 12, flex: 1, minWidth: 120 }}
              />
              <input
                data-ocid="settings.notif.reminder_datetime.input"
                type="datetime-local"
                value={newReminderDatetime}
                onChange={(e) => setNewReminderDatetime(e.target.value)}
                className="glass-input"
                style={{ fontSize: 12, flex: 1, minWidth: 160 }}
              />
              <motion.button
                data-ocid="settings.notif.reminder.button"
                whileTap={{ scale: 0.97 }}
                className="btn-gradient"
                style={{
                  padding: "8px 16px",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                }}
                onClick={() => {
                  if (!newReminderDatetime) return;
                  const reminder = {
                    id: Date.now().toString(),
                    label: newReminderLabel.trim() || "Custom Reminder",
                    datetime: newReminderDatetime,
                  };
                  setNotifPrefs((prev) => ({
                    ...prev,
                    customReminders: [...prev.customReminders, reminder],
                  }));
                  setNewReminderLabel("");
                  setNewReminderDatetime("");
                }}
              >
                + Add
              </motion.button>
            </div>
            {notifPrefs.customReminders.length === 0 ? (
              <div
                data-ocid="settings.notif.reminder.empty_state"
                style={{ color: "#3D4460", fontSize: 12 }}
              >
                No custom reminders set.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {notifPrefs.customReminders.map((r, idx) => (
                  <div
                    key={r.id}
                    data-ocid={`settings.notif.reminder.item.${idx + 1}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: "rgba(139,92,246,0.1)",
                      borderRadius: 8,
                      border: "1px solid rgba(139,92,246,0.2)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#E0E6FF",
                          fontWeight: 600,
                        }}
                      >
                        {r.label}
                      </div>
                      <div style={{ fontSize: 11, color: "#6B7590" }}>
                        {new Date(r.datetime).toLocaleString()}
                      </div>
                    </div>
                    <motion.button
                      data-ocid={`settings.notif.reminder.delete_button.${idx + 1}`}
                      whileTap={{ scale: 0.95 }}
                      className="glass-btn glass-btn-red"
                      style={{ padding: "4px 10px", fontSize: 11 }}
                      onClick={() =>
                        setNotifPrefs((prev) => ({
                          ...prev,
                          customReminders: prev.customReminders.filter(
                            (x) => x.id !== r.id,
                          ),
                        }))
                      }
                    >
                      Remove
                    </motion.button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
      <div
        style={{
          marginTop: 32,
          textAlign: "center",
          color: "rgba(169,176,199,0.6)",
          fontSize: 12,
          letterSpacing: "0.05em",
        }}
      >
        <span style={{ color: "rgba(139,92,246,0.9)", fontWeight: 600 }}>
          Created by BHARATH
        </span>
        {" · "}
        <span style={{ color: "rgba(169,176,199,0.8)" }}>BE24</span>
        {"  ·  "}
        <span style={{ color: "rgba(99,179,237,0.9)", fontWeight: 600 }}>
          Powered by IITM BAZAAR
        </span>
      </div>
    </motion.div>
  );
}
