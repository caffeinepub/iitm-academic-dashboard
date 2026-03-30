import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { SemesterConfig } from "./backend.d";
import { NotificationManager } from "./components/NotificationManager";
import { Sidebar, type TabId } from "./components/Sidebar";
import { TAB_THEMES, TabThemeContext } from "./contexts/TabTheme";
import { useActor } from "./hooks/useActor";
import { useAppData } from "./hooks/useAppData";
import { AdminPanel } from "./pages/AdminPanel";
import { AttendanceTracker } from "./pages/AttendanceTracker";
import { CalendarView } from "./pages/CalendarView";
import { ExamsView } from "./pages/ExamsView";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SettingsView } from "./pages/SettingsView";
import { TasksView } from "./pages/TasksView";
import { Timetable } from "./pages/Timetable";
import { TodayDashboard } from "./pages/TodayDashboard";

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [activeSemConfig, setActiveSemConfig] = useState<SemesterConfig | null>(
    null,
  );
  const data = useAppData();
  const theme = TAB_THEMES[activeTab];
  const { actor, isFetching } = useActor();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const orb1X = useTransform(mouseX, [0, 1440], [-30, 30]);
  const orb1Y = useTransform(mouseY, [0, 900], [-20, 20]);
  const orb2X = useTransform(mouseX, [0, 1440], [20, -20]);
  const orb2Y = useTransform(mouseY, [0, 900], [30, -30]);
  const orb3X = useTransform(mouseX, [0, 1440], [15, -15]);
  const orb3Y = useTransform(mouseY, [0, 900], [-15, 15]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    },
    [mouseX, mouseY],
  );

  useEffect(() => {
    if (!actor || isFetching) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (actor as any)
      .getActiveSemesterConfig()
      .then((cfg) => {
        if (cfg) setActiveSemConfig(cfg);
      })
      .catch(() => {
        // silently fall back to hardcoded
      });
  }, [actor, isFetching]);

  const isAdminRoute =
    typeof window !== "undefined" && window.location.hash === "#admin";

  const renderContent = () => {
    switch (activeTab) {
      case "today":
        return (
          <TodayDashboard
            courses={data.courses}
            attendance={data.attendance}
            tasks={data.tasks}
            semSettings={data.semSettings}
            studentName={data.studentName}
            onTabChange={(t) => setActiveTab(t as TabId)}
          />
        );
      case "timetable":
        return (
          <Timetable
            courses={data.courses}
            onAddCourse={data.addCourse}
            onDeleteCourse={data.deleteCourse}
          />
        );
      case "attendance":
        return (
          <AttendanceTracker
            courses={data.courses}
            attendance={data.attendance}
            onAddAttendance={data.addAttendance}
            onUpdateAttendance={data.updateAttendance}
            onDeleteAttendance={data.deleteAttendance}
          />
        );
      case "calendar":
        return (
          <CalendarView
            courses={data.courses}
            tasks={data.tasks}
            semSettings={data.semSettings}
            activeSemConfig={activeSemConfig}
          />
        );
      case "exams":
        return (
          <ExamsView
            courses={data.courses}
            semSettings={data.semSettings}
            examEntries={data.examEntries}
            onSetExamOverride={data.setExamOverride}
            onClearExamOverride={data.clearExamOverride}
            activeSemConfig={activeSemConfig}
          />
        );
      case "tasks":
        return (
          <TasksView
            tasks={data.tasks}
            onAddTask={data.addTask}
            onDeleteTask={data.deleteTask}
            onToggleTask={data.toggleTask}
          />
        );
      case "settings":
        return (
          <SettingsView
            semSettings={data.semSettings}
            onUpdateSem={data.setSemSettings}
            studentName={data.studentName}
            onUpdateName={data.setStudentName}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isAdminRoute ? (
        <motion.div
          key="admin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ minHeight: "100vh", background: "#0a0a0f" }}
        >
          <div
            style={{
              padding: "20px 28px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <button
              type="button"
              className="page-heading-gradient"
              style={{
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
              }}
              onClick={() => {
                window.location.hash = "";
                window.location.reload();
              }}
            >
              InstiFlow
            </button>
          </div>
          <AdminPanel />
        </motion.div>
      ) : showLanding ? (
        <motion.div
          key="landing"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0 }}
        >
          <LandingPage
            onEnter={() => {
              setShowLanding(false);
              setShowLogin(true);
            }}
          />
        </motion.div>
      ) : showLogin ? (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoginPage
            onLogin={() => setShowLogin(false)}
            onBack={() => {
              setShowLogin(false);
              setShowLanding(true);
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <TabThemeContext.Provider value={theme}>
            <NotificationManager
              courses={data.courses}
              attendance={data.attendance}
              tasks={data.tasks}
            />
            <motion.div
              onMouseMove={handleMouseMove}
              animate={{ backgroundColor: theme.bg }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{
                display: "flex",
                minHeight: "100vh",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Cursor spotlight */}
              <motion.div
                className="cursor-spotlight"
                style={{
                  left: mouseX,
                  top: mouseY,
                  background: `radial-gradient(circle 300px at center, ${
                    theme.accent
                  }0d, transparent 70%)`,
                }}
              />

              {/* Floating background orbs with mouse parallax */}
              <motion.div
                className="bg-orb bg-orb-1"
                animate={{ backgroundColor: theme.accent }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{ x: orb1X, y: orb1Y }}
              />
              <motion.div
                className="bg-orb bg-orb-2"
                animate={{ backgroundColor: theme.accent }}
                transition={{ duration: 1.4, ease: "easeInOut", delay: 0.1 }}
                style={{ x: orb2X, y: orb2Y }}
              />
              <motion.div
                className="bg-orb bg-orb-3"
                animate={{ backgroundColor: theme.glow2 }}
                transition={{ duration: 1.6, ease: "easeInOut", delay: 0.2 }}
                style={{ x: orb3X, y: orb3Y }}
              />

              {/* Animated gradient overlay that shifts per tab */}
              <motion.div
                animate={{ opacity: 1 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: theme.gradient,
                  pointerEvents: "none",
                  zIndex: 0,
                  transition: "background 0.6s ease",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  width: "100%",
                }}
              >
                <Sidebar
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  accentColor={theme.accent}
                />
                <main
                  style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
                >
                  <AnimatePresence mode="wait">
                    <div key={activeTab}>{renderContent()}</div>
                  </AnimatePresence>
                  {/* Footer */}
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px 0 8px",
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                      marginTop: 24,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <button
                      type="button"
                      data-ocid="admin.link"
                      onClick={() => {
                        window.location.hash = "admin";
                        window.location.reload();
                      }}
                      style={{
                        fontSize: 11,
                        color: "#334155",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Admin Panel
                    </button>
                    <span style={{ color: "#1e293b" }}>&middot;</span>
                    <span style={{ fontSize: 11, color: "#1e293b" }}>
                      &copy; {new Date().getFullYear()}. Built with love using{" "}
                      <a
                        href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                          typeof window !== "undefined"
                            ? window.location.hostname
                            : "",
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#334155" }}
                      >
                        caffeine.ai
                      </a>
                    </span>
                  </div>
                </main>
              </div>
            </motion.div>
          </TabThemeContext.Provider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
