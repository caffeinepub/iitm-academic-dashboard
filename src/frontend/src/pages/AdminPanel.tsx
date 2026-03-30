import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { Holiday, SemesterConfig, SlotExamDate } from "../backend.d";
import { GlassCard } from "../components/GlassCard";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const SLOTS = [
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

const DEFAULT_SLOT_EXAM_DATES: Record<
  string,
  { quiz1: string; quiz2: string; endSem: string }
> = {
  A: { quiz1: "2026-02-16", quiz2: "2026-03-23", endSem: "2026-05-04" },
  B: { quiz1: "2026-02-16", quiz2: "2026-03-23", endSem: "2026-05-05" },
  C: { quiz1: "2026-02-17", quiz2: "2026-03-24", endSem: "2026-05-05" },
  D: { quiz1: "2026-02-17", quiz2: "2026-03-24", endSem: "2026-05-06" },
  E: { quiz1: "2026-02-18", quiz2: "2026-03-25", endSem: "2026-05-06" },
  F: { quiz1: "2026-02-18", quiz2: "2026-03-25", endSem: "2026-05-07" },
  G: { quiz1: "2026-02-19", quiz2: "2026-03-26", endSem: "2026-05-07" },
  H: { quiz1: "2026-02-19", quiz2: "2026-03-26", endSem: "2026-05-08" },
  J: { quiz1: "2026-02-20", quiz2: "2026-03-27", endSem: "2026-05-09" },
  K: { quiz1: "2026-02-20", quiz2: "2026-03-27", endSem: "2026-05-11" },
  L: { quiz1: "2026-02-16", quiz2: "2026-03-23", endSem: "2026-05-12" },
  M: { quiz1: "2026-02-17", quiz2: "2026-03-24", endSem: "2026-05-13" },
  P: { quiz1: "2026-02-18", quiz2: "2026-03-25", endSem: "2026-05-14" },
  Q: { quiz1: "2026-02-19", quiz2: "2026-03-26", endSem: "2026-05-14" },
  R: { quiz1: "2026-02-20", quiz2: "2026-03-27", endSem: "2026-05-15" },
  S: { quiz1: "2026-02-16", quiz2: "2026-03-28", endSem: "2026-05-15" },
  T: { quiz1: "2026-02-17", quiz2: "2026-03-28", endSem: "2026-05-16" },
};

function emptyForm(): Omit<SemesterConfig, "id" | "year" | "isActive"> & {
  year: string;
} {
  return {
    name: "",
    year: "2026",
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
    slotExamDates: SLOTS.map((slot) => ({
      slot,
      ...DEFAULT_SLOT_EXAM_DATES[slot],
    })),
  };
}

export function AdminPanel({ onBack }: { onBack?: () => void }) {
  const { login, clear, loginStatus, identity, isLoggingIn } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [configs, setConfigs] = useState<SemesterConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  const [adminToken, setAdminToken] = useState("");
  const [initError, setInitError] = useState("");
  const [initLoading, setInitLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const isLoggedIn = loginStatus === "success" && !!identity;

  const checkAdmin = useCallback(async () => {
    if (!actor || isFetching) return;
    setCheckingAdmin(true);
    try {
      const result = await actor.isCallerAdmin();
      setIsAdmin(result);
    } catch {
      setIsAdmin(false);
    }
    setCheckingAdmin(false);
  }, [actor, isFetching]);

  const loadConfigs = useCallback(async () => {
    if (!actor || !isAdmin) return;
    setLoadingConfigs(true);
    try {
      const list = await actor.listSemesterConfigs();
      setConfigs(list);
    } catch {
      // ignore
    }
    setLoadingConfigs(false);
  }, [actor, isAdmin]);

  useEffect(() => {
    if (isLoggedIn && actor && !isFetching) {
      checkAdmin();
    }
  }, [isLoggedIn, actor, isFetching, checkAdmin]);

  useEffect(() => {
    if (isAdmin) loadConfigs();
  }, [isAdmin, loadConfigs]);

  const handleInitAdmin = async () => {
    if (!actor || !adminToken.trim()) return;
    setInitLoading(true);
    setInitError("");
    try {
      await (actor as any)._initializeAccessControlWithSecret(
        adminToken.trim(),
      );
      await checkAdmin();
    } catch (e: any) {
      setInitError(e?.message || "Failed to initialize. Check token.");
    }
    setInitLoading(false);
  };

  const handleSetActive = async (id: string) => {
    if (!actor) return;
    await actor.setActiveSemester(id);
    await loadConfigs();
  };

  const handleDelete = async (id: string) => {
    if (!actor) return;
    if (!confirm("Delete this semester config?")) return;
    await actor.deleteSemesterConfig(id);
    await loadConfigs();
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setSaveError("");
    setShowForm(true);
  };

  const openEdit = (cfg: SemesterConfig) => {
    setEditingId(cfg.id);
    setForm({
      name: cfg.name,
      year: String(Number(cfg.year)),
      semType: cfg.semType,
      classStart: cfg.classStart,
      classEnd: cfg.classEnd,
      quiz1Start: cfg.quiz1Start,
      quiz1End: cfg.quiz1End,
      quiz2Start: cfg.quiz2Start,
      quiz2End: cfg.quiz2End,
      endSemStart: cfg.endSemStart,
      endSemEnd: cfg.endSemEnd,
      holidays: cfg.holidays,
      events: cfg.events,
      slotExamDates:
        cfg.slotExamDates.length > 0
          ? cfg.slotExamDates
          : SLOTS.map((slot) => ({ slot, ...DEFAULT_SLOT_EXAM_DATES[slot] })),
    });
    setSaveError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!actor) return;
    if (!form.name.trim()) {
      setSaveError("Semester name is required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const id = editingId || `${form.semType}-${form.year}-${Date.now()}`;
      const config: SemesterConfig = {
        id,
        name: form.name,
        year: BigInt(form.year || "2026"),
        semType: form.semType,
        classStart: form.classStart,
        classEnd: form.classEnd,
        quiz1Start: form.quiz1Start,
        quiz1End: form.quiz1End,
        quiz2Start: form.quiz2Start,
        quiz2End: form.quiz2End,
        endSemStart: form.endSemStart,
        endSemEnd: form.endSemEnd,
        holidays: form.holidays,
        events: form.events,
        slotExamDates: form.slotExamDates,
        isActive: false,
      };
      await actor.saveSemesterConfig(config);
      await loadConfigs();
      setShowForm(false);
    } catch (e: any) {
      setSaveError(e?.message || "Save failed.");
    }
    setSaving(false);
  };

  const updateSlotDate = (
    slot: string,
    field: keyof SlotExamDate,
    value: string,
  ) => {
    setForm((f) => ({
      ...f,
      slotExamDates: f.slotExamDates.map((s) =>
        s.slot === slot ? { ...s, [field]: value } : s,
      ),
    }));
  };

  const addHoliday = (type: "holidays" | "events") => {
    setForm((f) => ({ ...f, [type]: [...f[type], { date: "", name: "" }] }));
  };

  const updateHoliday = (
    type: "holidays" | "events",
    idx: number,
    field: keyof Holiday,
    value: string,
  ) => {
    setForm((f) => ({
      ...f,
      [type]: f[type].map((h, i) => (i === idx ? { ...h, [field]: value } : h)),
    }));
  };

  const removeHoliday = (type: "holidays" | "events", idx: number) => {
    setForm((f) => ({ ...f, [type]: f[type].filter((_, i) => i !== idx) }));
  };

  // — render states —

  if (!isLoggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a14 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 420 }}
        >
          <GlassCard>
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div
                style={{
                  fontSize: 36,
                  marginBottom: 16,
                  filter: "drop-shadow(0 0 16px rgba(99,102,241,0.5))",
                }}
              >
                🛡️
              </div>
              <h1
                className="page-heading-gradient"
                style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}
              >
                Admin Panel
              </h1>
              <p
                style={{
                  color: "#6B7590",
                  fontSize: 14,
                  marginBottom: 28,
                  lineHeight: 1.6,
                }}
              >
                Manage semester calendar data, holidays, exam windows, and slot
                schedules for InstiFlow.
              </p>
              <motion.button
                data-ocid="admin.login_button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-gradient"
                onClick={login}
                disabled={isLoggingIn}
                style={{ width: "100%", padding: "12px 24px", fontSize: 15 }}
              >
                {isLoggingIn ? "Connecting…" : "Login with Internet Identity"}
              </motion.button>
              <div style={{ marginTop: 16 }}>
                <button
                  type="button"
                  onClick={onBack}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#4A5270",
                    fontSize: 12,
                    padding: 0,
                  }}
                >
                  ← Back to InstiFlow
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  if (checkingAdmin || isFetching || isAdmin === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a14 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1,
            ease: "linear",
          }}
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(99,102,241,0.2)",
            borderTop: "3px solid #6366f1",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a14 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: "100%", maxWidth: 480 }}
        >
          <GlassCard>
            <h2
              className="page-heading-gradient"
              style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}
            >
              Admin Setup
            </h2>
            <p style={{ color: "#6B7590", fontSize: 13, marginBottom: 24 }}>
              Logged in as{" "}
              <span style={{ color: "#8b5cf6" }}>
                {identity?.getPrincipal().toString().slice(0, 20)}…
              </span>
            </p>

            <div
              style={{
                padding: "20px",
                background: "rgba(99,102,241,0.05)",
                border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: "#C8D0E8",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                First Time Setup
              </div>
              <p
                style={{
                  color: "#6B7590",
                  fontSize: 12,
                  marginBottom: 12,
                  lineHeight: 1.5,
                }}
              >
                Enter the admin token provided in your deployment settings.
              </p>
              <input
                data-ocid="admin.input"
                type="password"
                className="glass-input"
                placeholder="Admin token"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                style={{ width: "100%", marginBottom: 10, fontSize: 13 }}
              />
              {initError && (
                <div
                  data-ocid="admin.error_state"
                  style={{ color: "#f87171", fontSize: 12, marginBottom: 8 }}
                >
                  {initError}
                </div>
              )}
              <motion.button
                data-ocid="admin.submit_button"
                whileTap={{ scale: 0.97 }}
                className="btn-gradient"
                onClick={handleInitAdmin}
                disabled={initLoading || !adminToken.trim()}
                style={{ fontSize: 13, padding: "8px 20px" }}
              >
                {initLoading ? "Initializing…" : "Initialize as Admin"}
              </motion.button>
            </div>

            <div
              style={{
                padding: "16px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 13, color: "#6B7590" }}>
                Already have an admin? Ask the current admin to grant you access
                via the admin panel.
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="glass-btn"
                onClick={clear}
                style={{ fontSize: 12, padding: "6px 16px" }}
              >
                Log Out
              </motion.button>
              <a
                href="/"
                style={{
                  color: "#4A5270",
                  fontSize: 12,
                  textDecoration: "none",
                }}
              >
                ← Back to InstiFlow
              </a>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Full admin UI
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a14 100%)",
        padding: "32px 28px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              className="page-heading-gradient"
              style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}
            >
              Admin Panel — Semester Manager
            </h1>
            <p style={{ color: "#6B7590", fontSize: 13 }}>
              Logged in as{" "}
              <span style={{ color: "#8b5cf6" }}>
                {identity?.getPrincipal().toString().slice(0, 24)}…
              </span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <motion.button
              data-ocid="admin.primary_button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-gradient"
              onClick={openNew}
              style={{ fontSize: 13, padding: "9px 20px" }}
            >
              + Add New Semester
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="glass-btn"
              onClick={clear}
              style={{ fontSize: 13, padding: "9px 16px" }}
            >
              Log Out
            </motion.button>
            <a
              href="/"
              style={{
                color: "#4A5270",
                fontSize: 12,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              ← App
            </a>
          </div>
        </motion.div>

        {/* Config list */}
        {loadingConfigs ? (
          <GlassCard>
            <div
              data-ocid="admin.loading_state"
              style={{ color: "#6B7590", fontSize: 13 }}
            >
              Loading semester configs…
            </div>
          </GlassCard>
        ) : configs.length === 0 ? (
          <GlassCard>
            <div
              data-ocid="admin.empty_state"
              style={{ color: "#4A5270", fontSize: 14 }}
            >
              No semester configs yet. Add one using the button above.
            </div>
          </GlassCard>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {configs.map((cfg, i) => (
              <motion.div
                key={cfg.id}
                data-ocid={`admin.item.${i + 1}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard
                  style={{
                    borderColor: cfg.isActive
                      ? "rgba(34,197,94,0.4)"
                      : "rgba(255,255,255,0.06)",
                    boxShadow: cfg.isActive
                      ? "0 0 24px rgba(34,197,94,0.12), 0 8px 24px rgba(0,0,0,0.4)"
                      : undefined,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#F0F4FF",
                          }}
                        >
                          {cfg.name}
                        </span>
                        {cfg.isActive && (
                          <span
                            style={{
                              fontSize: 10,
                              background: "rgba(34,197,94,0.15)",
                              border: "1px solid rgba(34,197,94,0.4)",
                              color: "#4ade80",
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontWeight: 700,
                              boxShadow: "0 0 10px rgba(34,197,94,0.2)",
                            }}
                          >
                            ● ACTIVE
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          color: "#6B7590",
                          fontSize: 12,
                          display: "flex",
                          gap: 10,
                        }}
                      >
                        <span>
                          {cfg.semType === "even" ? "Even" : "Odd"} Sem{" "}
                          {String(Number(cfg.year))}
                        </span>
                        <span>·</span>
                        <span>{cfg.holidays.length} holidays</span>
                        <span>·</span>
                        <span>{cfg.events.length} events</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {!cfg.isActive && (
                        <motion.button
                          data-ocid={`admin.toggle.${i + 1}`}
                          whileTap={{ scale: 0.95 }}
                          className="glass-btn"
                          onClick={() => handleSetActive(cfg.id)}
                          style={{
                            fontSize: 12,
                            padding: "6px 14px",
                            color: "#4ade80",
                            borderColor: "rgba(34,197,94,0.3)",
                          }}
                        >
                          Set Active
                        </motion.button>
                      )}
                      <motion.button
                        data-ocid={`admin.edit_button.${i + 1}`}
                        whileTap={{ scale: 0.95 }}
                        className="glass-btn"
                        onClick={() => openEdit(cfg)}
                        style={{ fontSize: 12, padding: "6px 14px" }}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        data-ocid={`admin.delete_button.${i + 1}`}
                        whileTap={{ scale: 0.95 }}
                        className="glass-btn"
                        onClick={() => handleDelete(cfg.id)}
                        style={{
                          fontSize: 12,
                          padding: "6px 14px",
                          color: "#f87171",
                          borderColor: "rgba(248,113,113,0.3)",
                        }}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              data-ocid="admin.modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <GlassCard
                style={{
                  borderColor: "rgba(99,102,241,0.25)",
                  boxShadow:
                    "0 0 40px rgba(99,102,241,0.12), 0 16px 48px rgba(0,0,0,0.6)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <h3
                    className="page-heading-gradient"
                    style={{ fontSize: 18, fontWeight: 700 }}
                  >
                    {editingId ? "Edit Semester" : "Add New Semester"}
                  </h3>
                  <motion.button
                    data-ocid="admin.close_button"
                    whileTap={{ scale: 0.9 }}
                    className="glass-btn"
                    onClick={() => setShowForm(false)}
                    style={{ fontSize: 12, padding: "5px 12px" }}
                  >
                    ✕ Cancel
                  </motion.button>
                </div>

                {/* Basic fields */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 14,
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <div style={fieldLabelStyle}>Semester Name</div>
                    <input
                      data-ocid="admin.input"
                      className="glass-input"
                      placeholder="e.g. Even Sem 2026"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      style={fieldInputStyle}
                    />
                  </div>
                  <div>
                    <div style={fieldLabelStyle}>Year</div>
                    <input
                      className="glass-input"
                      type="number"
                      placeholder="2026"
                      value={form.year}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, year: e.target.value }))
                      }
                      style={fieldInputStyle}
                    />
                  </div>
                  <div>
                    <div style={fieldLabelStyle}>Sem Type</div>
                    <select
                      data-ocid="admin.select"
                      className="glass-input"
                      value={form.semType}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, semType: e.target.value }))
                      }
                      style={fieldInputStyle}
                    >
                      <option value="even">Even</option>
                      <option value="odd">Odd</option>
                    </select>
                  </div>
                </div>

                {/* Date ranges */}
                <div style={{ marginBottom: 20 }}>
                  <div style={sectionLabel}>Class Dates</div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={fieldLabelStyle}>Class Start</div>
                      <input
                        type="date"
                        className="glass-input"
                        value={form.classStart}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, classStart: e.target.value }))
                        }
                        style={fieldInputStyle}
                      />
                    </div>
                    <div>
                      <div style={fieldLabelStyle}>Class End</div>
                      <input
                        type="date"
                        className="glass-input"
                        value={form.classEnd}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, classEnd: e.target.value }))
                        }
                        style={fieldInputStyle}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={sectionLabel}>Quiz 1 Window</div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={fieldLabelStyle}>Start</div>
                      <input
                        type="date"
                        className="glass-input"
                        value={form.quiz1Start}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, quiz1Start: e.target.value }))
                        }
                        style={fieldInputStyle}
                      />
                    </div>
                    <div>
                      <div style={fieldLabelStyle}>End</div>
                      <input
                        type="date"
                        className="glass-input"
                        value={form.quiz1End}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, quiz1End: e.target.value }))
                        }
                        style={fieldInputStyle}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={sectionLabel}>Quiz 2 Window</div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={fieldLabelStyle}>Start</div>
                      <input
                        type="date"
                        className="glass-input"
                        value={form.quiz2Start}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, quiz2Start: e.target.value }))
                        }
                        style={fieldInputStyle}
                      />
                    </div>
                    <div>
                      <div style={fieldLabelStyle}>End</div>
                      <input
                        type="date"
                        className="glass-input"
                        value={form.quiz2End}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, quiz2End: e.target.value }))
                        }
                        style={fieldInputStyle}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={sectionLabel}>End Semester Window</div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={fieldLabelStyle}>Start</div>
                      <input
                        type="date"
                        className="glass-input"
                        value={form.endSemStart}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            endSemStart: e.target.value,
                          }))
                        }
                        style={fieldInputStyle}
                      />
                    </div>
                    <div>
                      <div style={fieldLabelStyle}>End</div>
                      <input
                        type="date"
                        className="glass-input"
                        value={form.endSemEnd}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, endSemEnd: e.target.value }))
                        }
                        style={fieldInputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Holidays */}
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      ...sectionLabel,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Holidays ({form.holidays.length})</span>
                    <motion.button
                      data-ocid="admin.secondary_button"
                      whileTap={{ scale: 0.95 }}
                      className="glass-btn"
                      onClick={() => addHoliday("holidays")}
                      style={{ fontSize: 11, padding: "3px 10px" }}
                    >
                      + Add
                    </motion.button>
                  </div>
                  {form.holidays.map((h, idx) => (
                    <div
                      key={`entry-${idx}-${h.date}`}
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 6,
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="date"
                        className="glass-input"
                        value={h.date}
                        onChange={(e) =>
                          updateHoliday("holidays", idx, "date", e.target.value)
                        }
                        style={{ flex: "0 0 140px", fontSize: 12 }}
                      />
                      <input
                        className="glass-input"
                        placeholder="Holiday name"
                        value={h.name}
                        onChange={(e) =>
                          updateHoliday("holidays", idx, "name", e.target.value)
                        }
                        style={{ flex: 1, fontSize: 12 }}
                      />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="glass-btn"
                        onClick={() => removeHoliday("holidays", idx)}
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          color: "#f87171",
                          flexShrink: 0,
                        }}
                      >
                        ✕
                      </motion.button>
                    </div>
                  ))}
                </div>

                {/* Events */}
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      ...sectionLabel,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Key Events ({form.events.length})</span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="glass-btn"
                      onClick={() => addHoliday("events")}
                      style={{ fontSize: 11, padding: "3px 10px" }}
                    >
                      + Add
                    </motion.button>
                  </div>
                  {form.events.map((h, idx) => (
                    <div
                      key={`entry-${idx}-${h.date}`}
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 6,
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="date"
                        className="glass-input"
                        value={h.date}
                        onChange={(e) =>
                          updateHoliday("events", idx, "date", e.target.value)
                        }
                        style={{ flex: "0 0 140px", fontSize: 12 }}
                      />
                      <input
                        className="glass-input"
                        placeholder="Event name"
                        value={h.name}
                        onChange={(e) =>
                          updateHoliday("events", idx, "name", e.target.value)
                        }
                        style={{ flex: 1, fontSize: 12 }}
                      />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="glass-btn"
                        onClick={() => removeHoliday("events", idx)}
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          color: "#f87171",
                          flexShrink: 0,
                        }}
                      >
                        ✕
                      </motion.button>
                    </div>
                  ))}
                </div>

                {/* Slot exam dates */}
                <div style={{ marginBottom: 24 }}>
                  <div style={sectionLabel}>Slot Exam Dates</div>
                  <div
                    style={{
                      overflowX: "auto",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 10,
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: 480,
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <th style={thStyle}>Slot</th>
                          <th style={thStyle}>Quiz 1</th>
                          <th style={thStyle}>Quiz 2</th>
                          <th style={thStyle}>End Sem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.slotExamDates.map((s, i) => (
                          <tr
                            key={s.slot}
                            style={{
                              borderBottom:
                                i < form.slotExamDates.length - 1
                                  ? "1px solid rgba(255,255,255,0.04)"
                                  : "none",
                            }}
                          >
                            <td
                              style={{
                                ...tdStyle,
                                fontWeight: 700,
                                color: "#a78bfa",
                              }}
                            >
                              {s.slot}
                            </td>
                            <td style={tdStyle}>
                              <input
                                type="date"
                                className="glass-input"
                                value={s.quiz1}
                                onChange={(e) =>
                                  updateSlotDate(
                                    s.slot,
                                    "quiz1",
                                    e.target.value,
                                  )
                                }
                                style={{ fontSize: 11, width: "100%" }}
                              />
                            </td>
                            <td style={tdStyle}>
                              <input
                                type="date"
                                className="glass-input"
                                value={s.quiz2}
                                onChange={(e) =>
                                  updateSlotDate(
                                    s.slot,
                                    "quiz2",
                                    e.target.value,
                                  )
                                }
                                style={{ fontSize: 11, width: "100%" }}
                              />
                            </td>
                            <td style={tdStyle}>
                              <input
                                type="date"
                                className="glass-input"
                                value={s.endSem}
                                onChange={(e) =>
                                  updateSlotDate(
                                    s.slot,
                                    "endSem",
                                    e.target.value,
                                  )
                                }
                                style={{ fontSize: 11, width: "100%" }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Save */}
                {saveError && (
                  <div
                    data-ocid="admin.error_state"
                    style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}
                  >
                    {saveError}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <motion.button
                    data-ocid="admin.save_button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-gradient"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ fontSize: 14, padding: "10px 28px" }}
                  >
                    {saving ? "Saving…" : "Save Semester"}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="glass-btn"
                    onClick={() => setShowForm(false)}
                    style={{ fontSize: 13, padding: "10px 20px" }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "#6B7590",
  marginBottom: 4,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const fieldInputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 13,
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  color: "#6366f1",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontWeight: 700,
  marginBottom: 10,
};

const thStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#606880",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  padding: "10px 12px",
  textAlign: "left",
};

const tdStyle: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: 13,
  color: "#C8D0E8",
  verticalAlign: "middle",
};
