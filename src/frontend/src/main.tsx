import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, type ErrorInfo, type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// ── Global Error Boundary ─────────────────────────────────────────────────
// Catches any render-time crash and shows a recovery UI instead of blank screen.
interface EBState {
  hasError: boolean;
  message: string;
}

class GlobalErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, message: error?.message ?? String(error) };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "[InstiFlow] Fatal render error:",
      error,
      info.componentStack,
    );
  }

  handleReset = () => {
    // Clear potentially corrupt localStorage and reload
    try {
      const keysToKeep = ["instiflow_storage_choice", "instiflow_user"];
      const saved: Record<string, string | null> = {};
      for (const k of keysToKeep) saved[k] = localStorage.getItem(k);
      localStorage.clear();
      for (const [k, v] of Object.entries(saved)) {
        if (v !== null) localStorage.setItem(k, v);
      }
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#06080f",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            padding: 24,
            color: "#e2e8f0",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
              filter: "drop-shadow(0 0 20px rgba(167,139,250,0.5))",
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 8,
              background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            InstiFlow hit an unexpected error
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "rgba(180,190,255,0.6)",
              maxWidth: 400,
              marginBottom: 8,
              lineHeight: 1.6,
            }}
          >
            {this.state.message ||
              "Something went wrong while rendering the app."}
          </p>
          <p
            style={{
              fontSize: 12,
              color: "rgba(180,190,255,0.4)",
              maxWidth: 400,
              marginBottom: 24,
              lineHeight: 1.5,
            }}
          >
            Your data is safe. Clicking Reload will clear temporary cache and
            restart the app.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.02em",
              boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Service Worker registration (PWA + background notifications) ──────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("[SW] Registered:", reg.scope))
      .catch((err) => console.warn("[SW] Registration failed:", err));
  });
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <App />
      </InternetIdentityProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>,
);
