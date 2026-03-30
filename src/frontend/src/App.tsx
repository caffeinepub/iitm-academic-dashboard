import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useCallback, useState } from "react";
import { NotificationManager } from "./components/NotificationManager";
import { Sidebar, type TabId } from "./components/Sidebar";
import { TAB_THEMES, TabThemeContext } from "./contexts/TabTheme";
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
  const data = useAppData();
  const theme = TAB_THEMES[activeTab];

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

  // Hash-based routing for admin panel
  const isAdminRoute = window.location.hash === "#admin";
  if (isAdminRoute) {
    return <AdminPanel />;
  }

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
      {showLanding ? (
        <motion.div
          key="landing"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
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
          exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
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
                  background: `radial-gradient(circle 300px at center, ${theme.accent}0d, transparent 70%)`,
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
                </main>
              </div>
            </motion.div>
          </TabThemeContext.Provider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
