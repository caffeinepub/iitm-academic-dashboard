import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginPageProps {
  onLogin: () => void;
  onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const { login, isLoggingIn, isLoginSuccess, identity } =
    useInternetIdentity();
  const [syncStarted, setSyncStarted] = useState(false);

  const handleLocal = () => {
    localStorage.setItem("instiflow_storage_choice", "local");
    onLogin();
  };

  const handleSync = () => {
    setSyncStarted(true);
    login();
  };

  useEffect(() => {
    if (syncStarted && (isLoginSuccess || identity)) {
      localStorage.setItem("instiflow_storage_choice", "sync");
      onLogin();
    }
  }, [syncStarted, isLoginSuccess, identity, onLogin]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #060810 0%, #0c0e1a 50%, #090b16 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "24px",
      }}
      data-ocid="login.page"
    >
      {/* Ambient orbs */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          top: "-200px",
          left: "-100px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          bottom: "-150px",
          right: "-100px",
          pointerEvents: "none",
        }}
      />

      {/* Back button */}
      <motion.button
        type="button"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onBack}
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "10px",
          padding: "8px 14px",
          color: "rgba(180,190,255,0.7)",
          cursor: "pointer",
          fontSize: "14px",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.08)" }}
        whileTap={{ scale: 0.97 }}
        data-ocid="login.back.button"
      >
        <ArrowLeft size={15} />
        Back
      </motion.button>

      <div
        style={{
          width: "100%",
          maxWidth: 680,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 36 }}
        >
          {/* Brand dot */}
          <div
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #a78bfa)",
              boxShadow: "0 0 16px rgba(99,102,241,0.7)",
              marginBottom: 14,
            }}
          />
          <h1
            style={{
              fontSize: "clamp(22px, 4vw, 30px)",
              fontWeight: 800,
              background:
                "linear-gradient(135deg, #fff 0%, #a78bfa 50%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 10,
              lineHeight: 1.2,
            }}
          >
            How would you like to use InstiFlow?
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(160,170,200,0.7)",
              maxWidth: 440,
              margin: "0 auto",
            }}
          >
            Choose where your data is stored. You can change this later in
            Settings.
          </p>
        </motion.div>

        {/* Option cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {/* Card 1 — Stay Local */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            data-ocid="login.local.card"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
            whileHover={{
              y: -4,
              boxShadow: "0 20px 60px rgba(99,102,241,0.15)",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              💻
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{ fontSize: 18, fontWeight: 700, color: "#F0F4FF" }}
                >
                  Stay Local
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 100,
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    color: "#818cf8",
                    letterSpacing: "0.03em",
                  }}
                >
                  Works immediately
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(150,165,200,0.75)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                No login needed. Your data lives{" "}
                <strong style={{ color: "#a78bfa" }}>
                  only on this device
                </strong>
                . Works offline. Perfect for single-device use.
              </p>
            </div>

            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {[
                "No account required",
                "Works offline",
                "100% private",
                "Instant setup",
              ].map((f) => (
                <li
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: "rgba(160,175,210,0.7)",
                  }}
                >
                  <span
                    style={{
                      color: "#6366f1",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    ✓
                  </span>{" "}
                  {f}
                </li>
              ))}
            </ul>

            <motion.button
              type="button"
              data-ocid="login.local.primary_button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLocal}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.35)",
                color: "#a5b4fc",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Use This Device
            </motion.button>
          </motion.div>

          {/* Card 2 — Sync */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            data-ocid="login.sync.card"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 100%)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: 20,
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              position: "relative",
              overflow: "hidden",
            }}
            whileHover={{
              y: -4,
              boxShadow: "0 20px 60px rgba(139,92,246,0.2)",
            }}
          >
            {/* Recommended badge */}
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 100,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Recommended
            </div>

            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              ☁️
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 6 }}>
                <span
                  style={{ fontSize: 18, fontWeight: 700, color: "#F0F4FF" }}
                >
                  Sync Across Devices
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(150,165,200,0.75)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Login with{" "}
                <strong style={{ color: "#a78bfa" }}>Internet Identity</strong>{" "}
                to back up and sync your timetable, attendance, and tasks across
                all devices.
              </p>
            </div>

            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {[
                "Syncs across all devices",
                "Automatic cloud backup",
                "Never lose your data",
                "Secure & private",
              ].map((f) => (
                <li
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: "rgba(160,175,210,0.7)",
                  }}
                >
                  <span
                    style={{
                      color: "#a78bfa",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    ✓
                  </span>{" "}
                  {f}
                </li>
              ))}
            </ul>

            <motion.button
              type="button"
              data-ocid="login.sync.primary_button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSync}
              disabled={isLoggingIn || syncStarted}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                background:
                  isLoggingIn || syncStarted
                    ? "rgba(99,102,241,0.3)"
                    : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                border: "none",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoggingIn || syncStarted ? "wait" : "pointer",
                fontFamily: "inherit",
                boxShadow:
                  isLoggingIn || syncStarted
                    ? "none"
                    : "0 4px 20px rgba(99,102,241,0.4)",
              }}
            >
              {isLoggingIn || syncStarted ? "Connecting..." : "Login & Sync"}
            </motion.button>
          </motion.div>
        </div>

        {/* Skip link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          style={{ textAlign: "center", marginTop: 24 }}
        >
          <button
            type="button"
            data-ocid="login.skip.button"
            onClick={handleLocal}
            style={{
              background: "none",
              border: "none",
              color: "rgba(140,155,190,0.5)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Skip for now — decide later
          </button>
        </motion.div>
      </div>
    </div>
  );
}
