import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Loader2,
  LogIn,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { SemesterConfig } from "../backend.d";
import { GlassCard } from "../components/GlassCard";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const IITM_SLOTS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "M",
  "P",
  "Q",
  "R",
  "S",
  "T",
];

type FormData = Omit<SemesterConfig, "id" | "isActive">;

function emptyForm(): FormData {
  return {
    semName: "",
    year: BigInt(new Date().getFullYear()),
    semType: "even",
    classStart: "",
    classEnd: "",
    quiz1Start: "",
    quiz1End: "",
    quiz2Start: "",
    quiz2End: "",
    endSemStart: "",
    endSemEnd: "",
    holidays: [],
    events: [],
    slotExamDates: IITM_SLOTS.map((s) => [
      s,
      { quiz1: "", quiz2: "", endSem: "" },
    ]),
  };
}

const IS: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#e2e8f0",
  padding: "8px 12px",
  fontSize: 13,
  outline: "none",
  width: "100%",
};

function inputStyle(extra?: React.CSSProperties): React.CSSProperties {
  return { ...IS, ...extra };
}

function SectionToggle({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(99,102,241,0.1)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 8,
          padding: "8px 14px",
          color: "#a5b4fc",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <span>{label}</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div style={{ marginTop: 10 }}>{children}</div>}
    </div>
  );
}

const gradBtn: React.CSSProperties = {
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  padding: "9px 18px",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  boxShadow: "0 0 16px rgba(99,102,241,0.4)",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const outlineBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#94a3b8",
  padding: "7px 14px",
  fontWeight: 500,
  fontSize: 12,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 5,
};

const dangerBtn: React.CSSProperties = {
  ...outlineBtn,
  border: "1px solid rgba(239,68,68,0.3)",
  color: "rgba(239,68,68,0.8)",
};

export function AdminPanel() {
  const { actor, isFetching } = useActor();
  const { login, isLoggingIn, isInitializing, identity } =
    useInternetIdentity();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [semesters, setSemesters] = useState<SemesterConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );
  const [editMode, setEditMode] = useState<"none" | "add" | "edit">("none");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());

  useEffect(() => {
    if (!actor || isFetching) return;
    if (!identity) {
      setIsAdmin(false);
      return;
    }
    setCheckingAdmin(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (actor as any)
      .isCallerAdmin()
      .then((v) => {
        setIsAdmin(v);
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setCheckingAdmin(false));
  }, [actor, isFetching, identity]);

  useEffect(() => {
    if (!isAdmin || !actor) return;
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (actor as any)
      .getSemesterConfigs()
      .then(setSemesters)
      .catch(() => setMsg({ type: "err", text: "Failed to load semesters" }))
      .finally(() => setLoading(false));
  }, [isAdmin, actor]);

  const showMsg = (type: "ok" | "err", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const openAdd = () => {
    setForm(emptyForm());
    setEditId(null);
    setEditMode("add");
  };

  const openEdit = (cfg: SemesterConfig) => {
    setForm({
      semName: cfg.semName,
      year: cfg.year,
      semType: cfg.semType,
      classStart: cfg.classStart,
      classEnd: cfg.classEnd,
      quiz1Start: cfg.quiz1Start,
      quiz1End: cfg.quiz1End,
      quiz2Start: cfg.quiz2Start,
      quiz2End: cfg.quiz2End,
      endSemStart: cfg.endSemStart,
      endSemEnd: cfg.endSemEnd,
      holidays: [...cfg.holidays],
      events: [...cfg.events],
      slotExamDates: IITM_SLOTS.map((s) => {
        const existing = cfg.slotExamDates.find(([k]) => k === s);
        return [
          s,
          existing ? { ...existing[1] } : { quiz1: "", quiz2: "", endSem: "" },
        ];
      }),
    });
    setEditId(cfg.id);
    setEditMode("edit");
  };

  const handleSave = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      const config: SemesterConfig = {
        id: editId ?? crypto.randomUUID(),
        ...form,
        isActive:
          editMode === "edit"
            ? (semesters.find((s) => s.id === editId)?.isActive ?? false)
            : false,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).saveSemesterConfig(config);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await (actor as any).getSemesterConfigs();
      setSemesters(updated);
      setEditMode("none");
      showMsg("ok", "Semester saved successfully!");
    } catch (e) {
      showMsg(
        "err",
        `Save failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (id: string) => {
    if (!actor) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).setActiveSemester(id);
      setSemesters((prev) =>
        prev.map((s) => ({ ...s, isActive: s.id === id })),
      );
      showMsg("ok", "Active semester updated!");
    } catch (_) {
      showMsg("err", "Failed to set active semester");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!actor) return;
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).deleteSemesterConfig(id);
      setSemesters((prev) => prev.filter((s) => s.id !== id));
      showMsg("ok", "Semester deleted.");
    } catch (_) {
      showMsg("err", "Delete failed");
    }
  };

  const setField = (key: keyof FormData, val: unknown) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const setHoliday = (i: number, field: "date" | "name", val: string) =>
    setForm((prev) => ({
      ...prev,
      holidays: prev.holidays.map((h, j) =>
        j === i ? { ...h, [field]: val } : h,
      ),
    }));

  const addHoliday = () =>
    setForm((prev) => ({
      ...prev,
      holidays: [
        ...prev.holidays,
        { date: "", name: "", _id: crypto.randomUUID() },
      ],
    }));

  const removeHoliday = (i: number) =>
    setForm((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((_, j) => j !== i),
    }));

  const setEvent = (
    i: number,
    field: "date" | "name" | "eventType",
    val: string,
  ) =>
    setForm((prev) => ({
      ...prev,
      events: prev.events.map((e, j) => (j === i ? { ...e, [field]: val } : e)),
    }));

  const addEvent = () =>
    setForm((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        { date: "", name: "", eventType: "festival", _id: crypto.randomUUID() },
      ],
    }));

  const removeEvent = (i: number) =>
    setForm((prev) => ({
      ...prev,
      events: prev.events.filter((_, j) => j !== i),
    }));

  const setSlotDate = (
    slot: string,
    field: "quiz1" | "quiz2" | "endSem",
    val: string,
  ) =>
    setForm((prev) => ({
      ...prev,
      slotExamDates: prev.slotExamDates.map(([s, d]) =>
        s === slot ? [s, { ...d, [field]: val }] : [s, d],
      ),
    }));

  if (isInitializing || checkingAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "#6366f1" }}
        />
      </motion.div>
    );
  }

  if (!identity) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <GlassCard
          style={{ maxWidth: 440, textAlign: "center", padding: "48px 40px" }}
        >
          <ShieldCheck
            size={48}
            style={{ color: "#6366f1", margin: "0 auto 20px" }}
          />
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 10,
            }}
          >
            Admin Access Required
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: 14,
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            Login with Internet Identity to access the semester calendar admin
            panel.
          </p>
          <button
            data-ocid="admin.login_button"
            type="button"
            onClick={login}
            disabled={isLoggingIn}
            style={gradBtn}
          >
            {isLoggingIn ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            {isLoggingIn ? "Connecting..." : "Login with Internet Identity"}
          </button>
        </GlassCard>
      </motion.div>
    );
  }

  if (isAdmin === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <GlassCard
          style={{ maxWidth: 440, textAlign: "center", padding: "48px 40px" }}
        >
          <ShieldCheck
            size={48}
            style={{ color: "rgba(239,68,68,0.7)", margin: "0 auto 20px" }}
          />
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 10,
            }}
          >
            Not Authorized
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
            Your account does not have admin privileges.
          </p>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ padding: "32px 28px", maxWidth: 960, margin: "0 auto" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <h2
            className="page-heading-gradient"
            style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}
          >
            Admin Panel
          </h2>
          <p style={{ color: "#64748b", fontSize: 13 }}>
            Manage IITM semester calendars — no code changes required
          </p>
        </div>
        <button
          data-ocid="admin.add_button"
          type="button"
          onClick={openAdd}
          style={gradBtn}
        >
          <Plus size={16} /> Add Semester
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            data-ocid="admin.toast"
            style={{
              marginBottom: 18,
              padding: "12px 18px",
              borderRadius: 10,
              background:
                msg.type === "ok"
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(239,68,68,0.12)",
              border: `1px solid ${
                msg.type === "ok"
                  ? "rgba(34,197,94,0.3)"
                  : "rgba(239,68,68,0.3)"
              }`,
              color: msg.type === "ok" ? "#4ade80" : "#f87171",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Semester List */}
      {loading ? (
        <div
          data-ocid="admin.loading_state"
          style={{ textAlign: "center", padding: 48 }}
        >
          <Loader2
            size={28}
            className="animate-spin"
            style={{ color: "#6366f1" }}
          />
        </div>
      ) : (
        <div
          data-ocid="admin.list"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {semesters.length === 0 && (
            <div
              data-ocid="admin.empty_state"
              style={{
                color: "#475569",
                textAlign: "center",
                padding: "40px 0",
                fontSize: 14,
              }}
            >
              No semesters configured yet. Click &ldquo;Add Semester&rdquo; to
              get started.
            </div>
          )}
          {semesters.map((sem, idx) => (
            <motion.div
              key={sem.id}
              data-ocid={`admin.item.${idx + 1}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GlassCard
                style={{
                  padding: "16px 20px",
                  border: sem.isActive
                    ? "1px solid rgba(99,102,241,0.5)"
                    : undefined,
                  boxShadow: sem.isActive
                    ? "0 0 20px rgba(99,102,241,0.2)"
                    : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <CalendarDays
                      size={18}
                      style={{
                        color: sem.isActive ? "#818cf8" : "#475569",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 15,
                          color: sem.isActive ? "#c7d2fe" : "#e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {sem.semName}
                        {sem.isActive && (
                          <span
                            style={{
                              background:
                                "linear-gradient(135deg,#6366f1,#8b5cf6)",
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontSize: 11,
                              color: "#fff",
                              fontWeight: 700,
                            }}
                          >
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#475569",
                          marginTop: 2,
                        }}
                      >
                        {sem.semType === "even" ? "Even Sem" : "Odd Sem"}{" "}
                        &middot; {sem.classStart} → {sem.classEnd} &middot;{" "}
                        {sem.holidays.length} holidays
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!sem.isActive && (
                      <button
                        data-ocid={`admin.item.${idx + 1}.primary_button`}
                        type="button"
                        onClick={() => handleSetActive(sem.id)}
                        style={{
                          ...outlineBtn,
                          color: "#818cf8",
                          border: "1px solid rgba(99,102,241,0.3)",
                        }}
                      >
                        <CheckCircle2 size={14} /> Set Active
                      </button>
                    )}
                    <button
                      data-ocid={`admin.item.${idx + 1}.edit_button`}
                      type="button"
                      onClick={() => openEdit(sem)}
                      style={outlineBtn}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      data-ocid={`admin.item.${idx + 1}.delete_button`}
                      type="button"
                      onClick={() => handleDelete(sem.id, sem.semName)}
                      style={dangerBtn}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit / Add Form */}
      <AnimatePresence>
        {editMode !== "none" && (
          <motion.div
            data-ocid="admin.dialog"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard style={{ padding: 24 }}>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  marginBottom: 20,
                }}
              >
                {editMode === "add" ? "Add New Semester" : "Edit Semester"}
              </h3>

              {/* Basic Info */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label
                    htmlFor="f-semName"
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Semester Name
                  </label>
                  <input
                    id="f-semName"
                    data-ocid="admin.input"
                    style={inputStyle()}
                    value={form.semName}
                    onChange={(e) => setField("semName", e.target.value)}
                    placeholder="e.g. Even Sem 2026 (Jan–May)"
                  />
                </div>
                <div>
                  <label
                    htmlFor="f-year"
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Year
                  </label>
                  <input
                    id="f-year"
                    style={inputStyle()}
                    type="number"
                    value={Number(form.year)}
                    onChange={(e) =>
                      setField("year", BigInt(e.target.value || 0))
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="f-semType"
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    Semester Type
                  </label>
                  <select
                    id="f-semType"
                    data-ocid="admin.select"
                    style={inputStyle()}
                    value={form.semType}
                    onChange={(e) => setField("semType", e.target.value)}
                  >
                    <option value="even">Even Semester (Jan–May)</option>
                    <option value="odd">Odd Semester (Jul–Nov)</option>
                  </select>
                </div>
              </div>

              {/* Date Ranges */}
              <SectionToggle
                label="&#128197; Class &amp; Exam Dates"
                defaultOpen
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {(
                    [
                      ["classStart", "Classes Start"],
                      ["classEnd", "Classes End"],
                      ["quiz1Start", "Quiz 1 Start"],
                      ["quiz1End", "Quiz 1 End"],
                      ["quiz2Start", "Quiz 2 Start"],
                      ["quiz2End", "Quiz 2 End"],
                      ["endSemStart", "End Sem Start"],
                      ["endSemEnd", "End Sem End"],
                    ] as [keyof FormData, string][]
                  ).map(([key, label]) => (
                    <div key={key}>
                      <label
                        htmlFor={`f-${key}`}
                        style={{
                          fontSize: 11,
                          color: "#64748b",
                          marginBottom: 3,
                          display: "block",
                        }}
                      >
                        {label}
                      </label>
                      <input
                        id={`f-${key}`}
                        style={inputStyle()}
                        type="date"
                        value={form[key] as string}
                        onChange={(e) => setField(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </SectionToggle>

              {/* Holidays */}
              <SectionToggle label={`Holidays (${form.holidays.length})`}>
                {form.holidays.map((h, i) => (
                  <div
                    key={
                      (h as unknown as Record<string, string>)._id ?? `h-${i}`
                    }
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 8,
                      alignItems: "center",
                    }}
                  >
                    <input
                      aria-label="Holiday date"
                      style={inputStyle({ flex: "0 0 160px" })}
                      type="date"
                      value={h.date}
                      onChange={(e) => setHoliday(i, "date", e.target.value)}
                    />
                    <input
                      aria-label="Holiday name"
                      style={inputStyle()}
                      placeholder="Holiday name"
                      value={h.name}
                      onChange={(e) => setHoliday(i, "name", e.target.value)}
                    />
                    <button
                      type="button"
                      aria-label="Remove holiday"
                      onClick={() => removeHoliday(i)}
                      style={{
                        ...dangerBtn,
                        padding: "8px 10px",
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addHoliday}
                  style={{ ...outlineBtn, marginTop: 4 }}
                >
                  <Plus size={13} /> Add Holiday
                </button>
              </SectionToggle>

              {/* Events */}
              <SectionToggle label={`Events (${form.events.length})`}>
                {form.events.map((ev, i) => (
                  <div
                    key={
                      (ev as unknown as Record<string, string>)._id ?? `ev-${i}`
                    }
                    style={{
                      display: "grid",
                      gridTemplateColumns: "160px 1fr 120px 36px",
                      gap: 8,
                      marginBottom: 8,
                      alignItems: "center",
                    }}
                  >
                    <input
                      aria-label="Event date"
                      style={inputStyle()}
                      type="date"
                      value={ev.date}
                      onChange={(e) => setEvent(i, "date", e.target.value)}
                    />
                    <input
                      aria-label="Event name"
                      style={inputStyle()}
                      placeholder="Event name"
                      value={ev.name}
                      onChange={(e) => setEvent(i, "name", e.target.value)}
                    />
                    <input
                      aria-label="Event type"
                      style={inputStyle()}
                      placeholder="Type (e.g. festival)"
                      value={ev.eventType}
                      onChange={(e) => setEvent(i, "eventType", e.target.value)}
                    />
                    <button
                      type="button"
                      aria-label="Remove event"
                      onClick={() => removeEvent(i)}
                      style={{ ...dangerBtn, padding: "8px 10px" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEvent}
                  style={{ ...outlineBtn, marginTop: 4 }}
                >
                  <Plus size={13} /> Add Event
                </button>
              </SectionToggle>

              {/* Slot Exam Dates */}
              <SectionToggle label="Slot Exam Dates">
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 12,
                    }}
                  >
                    <thead>
                      <tr style={{ color: "#64748b" }}>
                        <th style={{ padding: "6px 8px", textAlign: "left" }}>
                          Slot
                        </th>
                        <th style={{ padding: "6px 8px", textAlign: "left" }}>
                          Quiz 1
                        </th>
                        <th style={{ padding: "6px 8px", textAlign: "left" }}>
                          Quiz 2
                        </th>
                        <th style={{ padding: "6px 8px", textAlign: "left" }}>
                          End Sem
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.slotExamDates.map(([slot, dates]) => (
                        <tr
                          key={slot}
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <td
                            style={{
                              padding: "5px 8px",
                              color: "#a5b4fc",
                              fontWeight: 700,
                            }}
                          >
                            {slot}
                          </td>
                          {(["quiz1", "quiz2", "endSem"] as const).map(
                            (field) => (
                              <td key={field} style={{ padding: "5px 8px" }}>
                                <input
                                  aria-label={`Slot ${slot} ${field}`}
                                  style={inputStyle({
                                    padding: "5px 8px",
                                    fontSize: 12,
                                  })}
                                  type="date"
                                  value={dates[field]}
                                  onChange={(e) =>
                                    setSlotDate(slot, field, e.target.value)
                                  }
                                />
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionToggle>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <button
                  data-ocid="admin.cancel_button"
                  type="button"
                  onClick={() => setEditMode("none")}
                  style={outlineBtn}
                >
                  Cancel
                </button>
                <button
                  data-ocid="admin.save_button"
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={gradBtn}
                >
                  {saving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : null}
                  {saving ? "Saving..." : "Save Semester"}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <p
        style={{
          textAlign: "center",
          color: "#334155",
          fontSize: 12,
          marginTop: 32,
        }}
      >
        Changes take effect immediately for all students viewing the calendar.
      </p>
    </motion.div>
  );
}
