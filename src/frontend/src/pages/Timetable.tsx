import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { GlassCard } from "../components/GlassCard";
import type { Course } from "../types";
import {
  PASTEL_COLORS,
  SLOT_GRID,
  SLOT_OCCURRENCES,
  TIME_COLUMNS,
  getSlotColor,
  getSlotScheduleDesc,
} from "../utils/slots";

interface Props {
  courses: Course[];
  onAddCourse: (c: Course) => void;
  onDeleteCourse: (id: string) => void;
}

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI"];
const ALL_SLOTS = Object.keys(SLOT_OCCURRENCES).sort();

// ─── IITM Course Database (for Populate) ───────────────────────────────────
const IITM_COURSE_DB: Record<string, { name: string; venue: string }> = {
  MA1101: { name: "Calculus", venue: "CLT" },
  MA1102: { name: "Linear Algebra", venue: "CLT" },
  MA2040: {
    name: "Probability, Statistics and Stochastic Processes",
    venue: "CLT",
  },
  MA3201: { name: "Mathematics III", venue: "CLT" },
  MA4230: { name: "Real Analysis", venue: "HSB 315" },
  MA3100: { name: "Numerical Methods", venue: "CLT" },
  PH1010: { name: "Physics I", venue: "ESB 244" },
  PH1020: { name: "Physics II", venue: "ESB 244" },
  PH2100: { name: "Quantum Physics", venue: "ESB 244" },
  PH2201: { name: "Physics for Engineers", venue: "ESB 244" },
  PH3100: { name: "Statistical Mechanics", venue: "ESB 244" },
  CH1010: { name: "Chemistry I", venue: "HSB 315" },
  CH1020: { name: "Chemistry II", venue: "HSB 315" },
  CH2100: { name: "Physical Chemistry", venue: "HSB 315" },
  CY2101: { name: "Chemistry for Engineers", venue: "HSB 315" },
  CS1100: { name: "Introduction to Programming", venue: "CS Lab" },
  CS1200: { name: "Data Structures and Algorithms", venue: "CS Lab" },
  CS2700: { name: "Computer Organization", venue: "CS 215" },
  CS3200: { name: "Operating Systems", venue: "CS 215" },
  CS3300: { name: "Compiler Design", venue: "CS 215" },
  EE2703: { name: "Applied Programming Lab", venue: "ESB 244" },
  EE3200: { name: "Signals and Systems", venue: "ESB 244" },
  EE3310: { name: "Digital Signal Processing", venue: "ESB 244" },
  ME2300: { name: "Engineering Mechanics", venue: "MED 115" },
  ME2700: { name: "Fluid Mechanics", venue: "MED 115" },
  CE2100: { name: "Structural Analysis", venue: "CED 101" },
  CE3100: { name: "Concrete Structures", venue: "CED 101" },
  HS1010: { name: "Technical English", venue: "HSS 101" },
  HS2100: { name: "Economics", venue: "HSS 101" },
  ES2100: { name: "Environmental Science", venue: "CLT" },
  GE1010: { name: "Engineering Graphics", venue: "GE Lab" },
  GE2100: { name: "Engineering Design", venue: "GE Lab" },
  BT2100: { name: "Biochemistry", venue: "BT Lab" },
  MS2100: { name: "Materials Science", venue: "MED 115" },
};

// ─── Override type ──────────────────────────────────────────────────────────
interface DayOverride {
  id: string;
  day: string;
  slot: string;
  name: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface SlotCellProps {
  slotLetter: string | null;
  course: Course | null | undefined;
  cellKey: string;
  dayIdx: number;
  colIdx: number;
  mini?: boolean;
  overrideName?: string | null;
}

function SlotCell({
  slotLetter,
  course,
  cellKey,
  dayIdx,
  colIdx,
  mini,
  overrideName,
}: SlotCellProps) {
  const bg = course?.color ?? null;
  const height = mini ? 26 : 54;
  const isEmpty = !bg && !overrideName;
  const displayName =
    overrideName || (course ? course.code || course.name.slice(0, 7) : null);

  return (
    <motion.div
      key={cellKey}
      className={`tt-cell ${isEmpty ? "tt-cell-empty" : "tt-cell-filled"}`}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: (dayIdx * 10 + colIdx) * 0.012,
        duration: 0.28,
        ease: "easeOut",
      }}
      whileHover={{ scale: 1.06, zIndex: 2 }}
      style={{
        height,
        borderRadius: mini ? 5 : 7,
        background: overrideName
          ? "rgba(167,139,250,0.18)"
          : bg
            ? `${bg}cc`
            : "rgba(255,255,255,0.06)",
        border: overrideName
          ? "1px solid rgba(167,139,250,0.4)"
          : bg
            ? `1px solid ${bg}`
            : "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2px 3px",
        overflow: "hidden",
        WebkitPrintColorAdjust: "exact",
        // @ts-ignore
        printColorAdjust: "exact",
      }}
    >
      {slotLetter && (
        <>
          <span
            className="tt-slot-letter"
            style={{
              fontSize: mini ? 9 : 12,
              fontWeight: 800,
              color:
                bg || overrideName
                  ? "rgba(0,0,0,0.7)"
                  : "rgba(255,255,255,0.35)",
              lineHeight: 1,
            }}
          >
            {slotLetter}
          </span>
          {displayName && !mini && (
            <span
              className="tt-course-label"
              style={{
                fontSize: 8,
                color: "rgba(0,0,0,0.55)",
                textAlign: "center",
                marginTop: 3,
                lineHeight: 1.2,
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                paddingInline: 2,
              }}
            >
              {displayName}
            </span>
          )}
          {displayName && mini && (
            <span
              className="tt-course-label"
              style={{
                fontSize: 7,
                color: "rgba(0,0,0,0.5)",
                textAlign: "center",
                lineHeight: 1,
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                paddingInline: 2,
              }}
            >
              {displayName}
            </span>
          )}
        </>
      )}
    </motion.div>
  );
}

export function Timetable({ courses, onAddCourse, onDeleteCourse }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [slot, setSlot] = useState("A");
  const [venue, setVenue] = useState("");
  const [selectedColor, setSelectedColor] = useState(PASTEL_COLORS[0]);
  const [hoursPerWeek, setHoursPerWeek] = useState(3);
  const [populateMsg, setPopulateMsg] = useState("");

  // Manual Overrides
  const [overrides, setOverrides] = useState<DayOverride[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("instiflow_overrides") ?? "[]");
    } catch {
      return [];
    }
  });
  const [showOverrideSection, setShowOverrideSection] = useState(false);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [ovDay, setOvDay] = useState(DAYS[0]);
  const [ovSlot, setOvSlot] = useState("A");
  const [ovName, setOvName] = useState("");

  // Save/Load
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveOverrides = (list: DayOverride[]) => {
    setOverrides(list);
    localStorage.setItem("instiflow_overrides", JSON.stringify(list));
  };

  const slotToCourse = useMemo(() => {
    const map = new Map<string, Course>();
    for (const c of courses) {
      map.set(c.slot, c);
    }
    return map;
  }, [courses]);

  // Build override lookup: dayLabel -> slotLetter -> name
  const overrideLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const ov of overrides) {
      // day is full name like "Monday", convert to 3-letter
      const dayShort = ov.day.slice(0, 3).toUpperCase();
      map.set(`${dayShort}__${ov.slot}`, ov.name);
    }
    return map;
  }, [overrides]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAddCourse({
      id: Date.now().toString(),
      name: name.trim(),
      code: code.trim(),
      slot,
      venue: venue.trim() || undefined,
      color: selectedColor,
      hoursPerWeek,
    });
    setName("");
    setCode("");
    setVenue("");
    setSlot("A");
    setSelectedColor(PASTEL_COLORS[0]);
    setHoursPerWeek(3);
    setShowForm(false);
    setPopulateMsg("");
  };

  const handlePopulate = () => {
    const key = code.trim().toUpperCase();
    if (!key) {
      setPopulateMsg("Enter a course code first.");
      return;
    }
    const found = IITM_COURSE_DB[key];
    if (found) {
      setName(found.name);
      setVenue(found.venue);
      setPopulateMsg(`✓ Populated from database: ${key}`);
    } else {
      setPopulateMsg(`Course "${key}" not found in database.`);
    }
  };

  const handleAddOverride = () => {
    if (!ovSlot) return;
    const newOv: DayOverride = {
      id: Date.now().toString(),
      day: ovDay,
      slot: ovSlot,
      name: ovName.trim(),
    };
    const updated = [
      ...overrides.filter((o) => !(o.day === ovDay && o.slot === ovSlot)),
      newOv,
    ];
    saveOverrides(
      ovName.trim()
        ? updated
        : overrides.filter((o) => !(o.day === ovDay && o.slot === ovSlot)),
    );
    setOvName("");
    setShowOverrideForm(false);
  };

  const handleSaveData = () => {
    const data = { courses, overrides };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "instiflow-timetable.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.courses && Array.isArray(parsed.courses)) {
          for (const c of parsed.courses) {
            onAddCourse(c);
          }
        }
        if (parsed.overrides && Array.isArray(parsed.overrides)) {
          saveOverrides(parsed.overrides);
        }
      } catch {
        // silently fail
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ padding: "32px 28px" }}
    >
      {/* Page header */}
      <div
        className="print-hide"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            className="page-heading-gradient"
            style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.3px" }}
          >
            Timetable
          </h2>
          <p style={{ fontSize: 13, color: "#6B7590", marginTop: 4 }}>
            IITM slot-based weekly schedule
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <motion.button
            data-ocid="timetable.secondary_button"
            className="glass-btn print-hide"
            whileTap={{ scale: 0.97 }}
            onClick={() => window.print()}
            style={{ fontSize: 13, padding: "8px 16px" }}
          >
            🖨️ Print
          </motion.button>
          <motion.button
            data-ocid="timetable.primary_button"
            className="btn-gradient print-hide"
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(!showForm)}
            style={{ fontSize: 13, padding: "8px 18px" }}
          >
            {showForm ? "✕ Cancel" : "+ Add Course"}
          </motion.button>
        </div>
      </div>

      {/* ─── Section B: Manual Override ──────────────────────────────────── */}
      <div style={{ marginBottom: 16 }} className="print-hide">
        <GlassCard style={{ padding: 0, overflow: "hidden" }}>
          <button
            type="button"
            onClick={() => setShowOverrideSection(!showOverrideSection)}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: "inherit",
            }}
            data-ocid="timetable.override.toggle"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "#F0F4FF" }}>
                Manual Override
              </span>
              <span style={{ fontSize: 12, color: "#6B7590" }}>
                Add an override for a particular day-slot.
              </span>
            </div>
            <span
              style={{
                color: "#6B7590",
                fontSize: 18,
                transition: "transform 0.2s",
                transform: showOverrideSection
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
            >
              ▾
            </span>
          </button>

          <AnimatePresence initial={false}>
            {showOverrideSection && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ padding: "0 20px 20px" }}>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#4A5270",
                      fontStyle: "italic",
                      marginBottom: 14,
                    }}
                  >
                    Leave the name field blank to delete the particular day-slot
                    override.
                  </p>

                  {/* Override list */}
                  {overrides.length > 0 && (
                    <div
                      style={{
                        marginBottom: 14,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {overrides.map((ov, i) => (
                        <div
                          key={ov.id}
                          data-ocid={`timetable.item.${i + 1}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 12px",
                            background: "rgba(167,139,250,0.08)",
                            border: "1px solid rgba(167,139,250,0.2)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        >
                          <span style={{ color: "#a78bfa", fontWeight: 700 }}>
                            {ov.day}
                          </span>
                          <span style={{ color: "#6B7590" }}>Slot</span>
                          <span style={{ color: "#818cf8", fontWeight: 700 }}>
                            {ov.slot}
                          </span>
                          <span style={{ color: "#6B7590" }}>→</span>
                          <span style={{ color: "#F0F4FF", flex: 1 }}>
                            {ov.name || (
                              <em style={{ color: "#4A5270" }}>deleted</em>
                            )}
                          </span>
                          <motion.button
                            data-ocid={`timetable.delete_button.${i + 1}`}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              saveOverrides(
                                overrides.filter((o) => o.id !== ov.id),
                              )
                            }
                            style={{
                              background: "none",
                              border: "none",
                              color: "#FF7A59",
                              cursor: "pointer",
                              fontSize: 14,
                              opacity: 0.7,
                            }}
                          >
                            ×
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Override form */}
                  <AnimatePresence>
                    {showOverrideForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: "hidden", marginBottom: 12 }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            padding: "12px",
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: 10,
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <select
                            className="glass-input"
                            style={{ flex: "1 1 130px", fontSize: 12 }}
                            value={ovDay}
                            onChange={(e) => setOvDay(e.target.value)}
                          >
                            {DAYS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                          <select
                            className="glass-input"
                            style={{ flex: "1 1 100px", fontSize: 12 }}
                            value={ovSlot}
                            onChange={(e) => setOvSlot(e.target.value)}
                          >
                            {ALL_SLOTS.map((s) => (
                              <option key={s} value={s}>
                                Slot {s}
                              </option>
                            ))}
                          </select>
                          <input
                            className="glass-input"
                            style={{ flex: "2 1 180px", fontSize: 12 }}
                            placeholder="Override name (blank = delete slot)"
                            value={ovName}
                            onChange={(e) => setOvName(e.target.value)}
                          />
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="btn-gradient"
                            style={{ fontSize: 12, padding: "8px 16px" }}
                            onClick={handleAddOverride}
                          >
                            Save Override
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div style={{ display: "flex", gap: 10 }}>
                    <motion.button
                      data-ocid="timetable.override.primary_button"
                      whileTap={{ scale: 0.97 }}
                      className="glass-btn-accent"
                      style={{ fontSize: 12, padding: "8px 16px" }}
                      onClick={() => setShowOverrideForm(!showOverrideForm)}
                    >
                      {showOverrideForm ? "✕ Cancel" : "+ Add Override"}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="glass-btn"
                      style={{
                        fontSize: 12,
                        padding: "8px 16px",
                        color: "rgba(255,122,89,0.85)",
                      }}
                      onClick={() => saveOverrides([])}
                    >
                      Clear Overrides
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>

      {/* ─── Section C: Save / Load ──────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }} className="print-hide">
        <GlassCard style={{ padding: 0, overflow: "hidden" }}>
          <button
            type="button"
            onClick={() => setShowSaveLoad(!showSaveLoad)}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: "inherit",
            }}
            data-ocid="timetable.saveload.toggle"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "#F0F4FF" }}>
                Save / Load Previously Generated Data
              </span>
              <span style={{ fontSize: 12, color: "#6B7590" }}>
                Save your current calendar or load a previously saved calendar.
              </span>
            </div>
            <span
              style={{
                color: "#6B7590",
                fontSize: 18,
                transition: "transform 0.2s",
                transform: showSaveLoad ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▾
            </span>
          </button>

          <AnimatePresence initial={false}>
            {showSaveLoad && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ padding: "0 20px 20px" }}>
                  <p
                    style={{
                      fontSize: 11,
                      color: "rgba(255,122,89,0.7)",
                      fontStyle: "italic",
                      marginBottom: 16,
                    }}
                  >
                    ⚠️ Warning: Making modifications to the downloaded file might
                    lead to unpredictable results!
                  </p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <motion.button
                      data-ocid="timetable.save.primary_button"
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.03 }}
                      className="glass-btn-accent"
                      style={{
                        fontSize: 13,
                        padding: "10px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                      onClick={handleSaveData}
                    >
                      💾 Save Data
                    </motion.button>
                    <motion.button
                      data-ocid="timetable.load.secondary_button"
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.03 }}
                      className="glass-btn"
                      style={{
                        fontSize: 13,
                        padding: "10px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      📂 Load Data
                    </motion.button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      style={{ display: "none" }}
                      onChange={handleLoadData}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: "#4A5270", marginTop: 12 }}>
                    Saved file includes all your courses and slot overrides.
                    Load it on any device running InstiFlow.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
      {/* ─── Section A: Add Slot ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }} className="print-hide">
        <GlassCard style={{ padding: 0, overflow: "hidden" }}>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: "inherit",
            }}
            data-ocid="timetable.open_modal_button"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "#F0F4FF" }}>
                Add Slot
              </span>
              <span style={{ fontSize: 12, color: "#6B7590" }}>
                Add your courses here with the corresponding slot, course
                number, name and venue.
              </span>
            </div>
            <span
              style={{
                color: "#6B7590",
                fontSize: 18,
                transition: "transform 0.2s",
                transform: showForm ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▾
            </span>
          </button>

          <AnimatePresence initial={false}>
            {showForm && (
              <motion.div
                key="add-slot-form"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ padding: "0 20px 20px" }}>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#4A5270",
                      fontStyle: "italic",
                      marginBottom: 14,
                    }}
                  >
                    The <strong style={{ color: "#818cf8" }}>Populate</strong>{" "}
                    button attempts to fetch unfilled information from the
                    course database using the course number.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 14,
                    }}
                  >
                    <input
                      data-ocid="timetable.input"
                      className="glass-input"
                      style={{ flex: "2 1 180px" }}
                      placeholder="Course Name *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                    <div style={{ flex: "1 1 130px", display: "flex", gap: 6 }}>
                      <input
                        className="glass-input"
                        style={{ flex: 1 }}
                        placeholder="Course Code (e.g. MA3201)"
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value);
                          setPopulateMsg("");
                        }}
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.04 }}
                        className="glass-btn"
                        style={{
                          padding: "0 12px",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                        onClick={handlePopulate}
                        title="Auto-fill name & venue from IITM course database"
                      >
                        ✨ Populate
                      </motion.button>
                    </div>
                    <input
                      className="glass-input"
                      style={{ flex: "1 1 130px" }}
                      placeholder="Venue (e.g. CLT, ESB 244)"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                    />
                    <select
                      data-ocid="timetable.select"
                      className="glass-input"
                      style={{ flex: "2 1 220px" }}
                      value={slot}
                      onChange={(e) => setSlot(e.target.value)}
                    >
                      {ALL_SLOTS.map((s) => (
                        <option key={s} value={s}>
                          Slot {s} — {getSlotScheduleDesc(s)}
                        </option>
                      ))}
                    </select>
                    <select
                      className="glass-input"
                      style={{ flex: "1 1 130px" }}
                      value={hoursPerWeek}
                      onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map((h) => (
                        <option key={h} value={h}>
                          {h} hr{h > 1 ? "s" : ""}/week
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Populate message */}
                  {populateMsg && (
                    <div
                      style={{
                        fontSize: 11,
                        color: populateMsg.startsWith("✓")
                          ? "#22d3ee"
                          : "rgba(255,122,89,0.85)",
                        marginBottom: 10,
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: populateMsg.startsWith("✓")
                          ? "rgba(34,211,238,0.06)"
                          : "rgba(255,122,89,0.06)",
                        border: `1px solid ${populateMsg.startsWith("✓") ? "rgba(34,211,238,0.2)" : "rgba(255,122,89,0.2)"}`,
                      }}
                    >
                      {populateMsg}
                    </div>
                  )}

                  {/* Enhanced Color Picker */}
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6B7590",
                        marginBottom: 10,
                        fontWeight: 500,
                      }}
                    >
                      Course Color
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 8,
                      }}
                    >
                      {PASTEL_COLORS.map((c) => (
                        <motion.button
                          key={c}
                          whileTap={{ scale: 0.88 }}
                          whileHover={{ scale: 1.12 }}
                          onClick={() => setSelectedColor(c)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: c,
                            border:
                              selectedColor === c
                                ? "3px solid rgba(255,255,255,0.95)"
                                : "2px solid rgba(255,255,255,0.15)",
                            cursor: "pointer",
                            boxShadow:
                              selectedColor === c
                                ? `0 0 0 3px ${c}88, 0 0 12px ${c}66`
                                : "none",
                            transition: "border 0.15s, box-shadow 0.15s",
                            flexShrink: 0,
                          }}
                        />
                      ))}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 8,
                      }}
                    >
                      <label
                        htmlFor="color-picker"
                        style={{ fontSize: 12, color: "#6B7590" }}
                      >
                        Custom:
                      </label>
                      <input
                        type="color"
                        id="color-picker"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        style={{
                          width: 36,
                          height: 36,
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: "none",
                          padding: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          color: "#6B7590",
                          fontFamily: "monospace",
                        }}
                      >
                        {selectedColor}
                      </span>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          background: selectedColor,
                          border: "1px solid rgba(255,255,255,0.2)",
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <motion.button
                      data-ocid="timetable.submit_button"
                      className="glass-btn-accent"
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAdd}
                      style={{ padding: "9px 28px" }}
                    >
                      + Add Slot
                    </motion.button>
                    <motion.button
                      className="glass-btn"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        for (const c of courses) onDeleteCourse(c.id);
                      }}
                      style={{
                        padding: "9px 18px",
                        color: "rgba(255,122,89,0.85)",
                        fontSize: 12,
                      }}
                    >
                      Clear Slots
                    </motion.button>
                    <motion.button
                      className="glass-btn"
                      whileTap={{ scale: 0.97 }}
                      onClick={handlePopulate}
                      style={{ padding: "9px 18px", fontSize: 12 }}
                    >
                      ✨ Populate
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>

      {/* Timetable Grid */}
      <GlassCard style={{ marginBottom: 16, overflowX: "auto" }}>
        <div
          style={{
            fontSize: 11,
            color: "#6B7590",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
            marginBottom: 16,
          }}
          className="print-hide"
        >
          Weekly Schedule
        </div>

        {/* Print header */}
        <div
          style={{ display: "none", marginBottom: 12 }}
          className="print-only"
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#1a1a2e",
              marginBottom: 2,
            }}
          >
            InstiFlow — IITM Weekly Timetable
          </div>
          <div style={{ fontSize: 11, color: "#555" }}>
            Jan–May 2026 · Even Semester
          </div>
        </div>

        <div
          className="tt-grid-wrapper"
          style={{
            minWidth: 760,
            WebkitPrintColorAdjust: "exact",
            // @ts-ignore
            printColorAdjust: "exact",
          }}
        >
          {/* Column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "64px repeat(9, 1fr)",
              gap: 3,
              marginBottom: 4,
            }}
          >
            <div
              className="tt-day-label"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                color: "#3D4460",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              DAYS
            </div>
            {TIME_COLUMNS.map((col, ci) => (
              <div
                key={col.label}
                className="tt-time-header"
                style={{
                  padding: "6px 3px",
                  textAlign: "center",
                  fontSize: 9,
                  color: ci === 4 ? "#2D3450" : "#6B7590",
                  fontWeight: 600,
                  background:
                    ci === 4 ? "rgba(255,255,255,0.015)" : "transparent",
                  borderRadius: 6,
                  letterSpacing: "0.01em",
                  lineHeight: 1.4,
                }}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAY_LABELS.map((dayLabel, dayIdx) => (
            <div
              key={dayLabel}
              style={{
                display: "grid",
                gridTemplateColumns: "64px repeat(9, 1fr)",
                gap: 3,
                marginBottom: 3,
              }}
            >
              <div
                className="tt-day-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#6B7590",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {dayLabel}
              </div>

              {SLOT_GRID[dayIdx].map((cell, colIdx) => {
                const cellKey = `${dayLabel}-${TIME_COLUMNS[colIdx].label}`;

                if (colIdx === 4) {
                  return (
                    <div
                      key={cellKey}
                      className="tt-lunch-cell"
                      style={{
                        height: 54,
                        borderRadius: 7,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <span style={{ fontSize: 11 }}>🍽️</span>
                      <span
                        style={{
                          fontSize: 7,
                          color: "#4D5880",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                        }}
                      >
                        LUNCH
                      </span>
                    </div>
                  );
                }

                if (Array.isArray(cell)) {
                  const [topSlot, bottomSlot] = cell;
                  const topCourse = topSlot ? slotToCourse.get(topSlot) : null;
                  const bottomCourse = bottomSlot
                    ? slotToCourse.get(bottomSlot)
                    : null;
                  const topOverride = topSlot
                    ? (overrideLookup.get(`${dayLabel}__${topSlot}`) ?? null)
                    : null;
                  const botOverride = bottomSlot
                    ? (overrideLookup.get(`${dayLabel}__${bottomSlot}`) ?? null)
                    : null;
                  return (
                    <div
                      key={cellKey}
                      style={{
                        height: 54,
                        borderRadius: 7,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <SlotCell
                        slotLetter={topSlot}
                        course={topCourse}
                        cellKey={`${cellKey}-top`}
                        dayIdx={dayIdx}
                        colIdx={colIdx}
                        mini
                        overrideName={topOverride}
                      />
                      <SlotCell
                        slotLetter={bottomSlot}
                        course={bottomCourse}
                        cellKey={`${cellKey}-bot`}
                        dayIdx={dayIdx}
                        colIdx={colIdx + 0.5}
                        mini
                        overrideName={botOverride}
                      />
                    </div>
                  );
                }

                const slotLetter = cell as string | null;
                const course = slotLetter ? slotToCourse.get(slotLetter) : null;
                const overrideName = slotLetter
                  ? (overrideLookup.get(`${dayLabel}__${slotLetter}`) ?? null)
                  : null;
                const bg = course?.color ?? null;
                const isEmpty = !bg && !overrideName;

                return (
                  <motion.div
                    key={cellKey}
                    className={`tt-cell ${isEmpty ? "tt-cell-empty" : "tt-cell-filled"}`}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: (dayIdx * 10 + colIdx) * 0.012,
                      duration: 0.28,
                      ease: "easeOut",
                    }}
                    whileHover={{ scale: 1.06, zIndex: 2 }}
                    style={{
                      height: 54,
                      borderRadius: 7,
                      background: overrideName
                        ? "rgba(167,139,250,0.18)"
                        : bg
                          ? `${bg}cc`
                          : "rgba(255,255,255,0.06)",
                      border: overrideName
                        ? "1px solid rgba(167,139,250,0.4)"
                        : bg
                          ? `1px solid ${bg}`
                          : "1px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "3px 4px",
                      overflow: "hidden",
                      WebkitPrintColorAdjust: "exact",
                      // @ts-ignore
                      printColorAdjust: "exact",
                    }}
                  >
                    {slotLetter && (
                      <>
                        <span
                          className="tt-slot-letter"
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color:
                              bg || overrideName
                                ? "rgba(0,0,0,0.7)"
                                : "rgba(255,255,255,0.35)",
                            lineHeight: 1,
                          }}
                        >
                          {slotLetter}
                        </span>
                        {(course || overrideName) && (
                          <span
                            className="tt-course-label"
                            style={{
                              fontSize: 8,
                              color: "rgba(0,0,0,0.55)",
                              textAlign: "center",
                              marginTop: 3,
                              lineHeight: 1.2,
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              paddingInline: 2,
                            }}
                          >
                            {overrideName ||
                              course?.code ||
                              course?.name.slice(0, 7)}
                          </span>
                        )}
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          {courses.length > 0 && (
            <div
              className="tt-legend"
              style={{
                marginTop: 14,
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                paddingTop: 6,
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {courses.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "#8B95B0",
                  }}
                >
                  <div
                    className="tt-legend-dot"
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: c.color ?? getSlotColor(c.slot),
                      border: `1px solid ${c.color ?? getSlotColor(c.slot)}`,
                      WebkitPrintColorAdjust: "exact",
                      // @ts-ignore
                      printColorAdjust: "exact",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 700, color: "#B0BAD0" }}>
                    Slot {c.slot}
                  </span>
                  <span style={{ color: "#4A5270" }}>—</span>
                  <span style={{ color: "#8B95B0" }}>{c.code || c.name}</span>
                  {c.venue && (
                    <span style={{ color: "#4A5270", fontSize: 10 }}>
                      · {c.venue}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Course Cards */}
      <GlassCard className="print-hide" style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            color: "#6B7590",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          Your Courses ({courses.length})
        </div>
        {courses.length === 0 ? (
          <div style={{ color: "#3D4460", fontSize: 13 }}>
            No courses added yet. Use &ldquo;Add Slot&rdquo; above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {courses.map((c, idx) => (
              <motion.div
                key={c.id}
                data-ocid={`timetable.item.${idx + 1}`}
                whileHover={{ scale: 1.02 }}
                style={{
                  padding: "14px 16px",
                  background: c.color
                    ? `${c.color}1A`
                    : "rgba(255,255,255,0.04)",
                  borderRadius: 12,
                  border: `1px solid ${c.color ? `${c.color}55` : "rgba(255,255,255,0.08)"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: c.color ?? getSlotColor(c.slot),
                        flexShrink: 0,
                        boxShadow: c.color ? `0 0 6px ${c.color}88` : "none",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#F0F4FF",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.name}
                    </span>
                  </div>
                  {c.code && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6B7590",
                        marginLeft: 18,
                        marginBottom: 2,
                      }}
                    >
                      {c.code}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 12,
                      marginLeft: 18,
                      color: c.color ?? "#8B95B0",
                      fontWeight: 500,
                    }}
                  >
                    Slot {c.slot}
                    {c.venue && (
                      <span style={{ color: "#6B7590", fontWeight: 400 }}>
                        {" "}
                        &middot; {c.venue}
                      </span>
                    )}
                    {c.hoursPerWeek && (
                      <span style={{ fontSize: 10, color: "#4A5270" }}>
                        {" "}
                        &middot; {c.hoursPerWeek} hrs/wk
                      </span>
                    )}
                  </div>
                </div>
                <motion.button
                  data-ocid={`timetable.delete_button.${idx + 1}`}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDeleteCourse(c.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#FF7A59",
                    cursor: "pointer",
                    fontSize: 18,
                    marginLeft: 8,
                    flexShrink: 0,
                    lineHeight: 1,
                    opacity: 0.7,
                  }}
                >
                  ×
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
