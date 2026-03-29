import { motion, useScroll, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const splineOpacity = useTransform(scrollY, [0, 600], [1, 0.3]);

  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const splineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = splineContainerRef.current;
    if (!el) return;
    const viewer = document.createElement("spline-viewer");
    viewer.setAttribute(
      "url",
      "https://prod.spline.design/atbUfD8ybgiIefp4/scene.splinecode",
    );
    viewer.setAttribute("loading", "lazy");
    viewer.style.width = "100%";
    viewer.style.height = "100%";
    viewer.style.display = "block";
    el.appendChild(viewer);
    return () => {
      el.removeChild(viewer);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dx = (e.clientX / vw - 0.5) * 60;
    const dy = (e.clientY / vh - 0.5) * 40;
    if (orb1Ref.current) {
      orb1Ref.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    if (orb2Ref.current) {
      orb2Ref.current.style.transform = `translate(${-dx * 0.6}px, ${-dy * 0.6}px)`;
    }
  }, []);

  const stagger = (i: number) => ({ delay: 0.05 + i * 0.08 });

  return (
    <div
      className="landing-root"
      onMouseMove={handleMouseMove}
      style={{ position: "relative" }}
    >
      {/* Dark base */}
      <div className="landing-bg" />

      {/* Spline 3D Robot — fullscreen background */}
      <motion.div
        style={{
          opacity: splineOpacity,
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* Hide Spline watermark */}
        <style>{`
          spline-viewer::part(logo) { display: none !important; }
          spline-viewer::part(watermark) { display: none !important; }
        `}</style>
        <div
          ref={splineContainerRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
        {/* Cover any visible Spline watermark at bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "220px",
            height: "48px",
            background: "#06080f",
            zIndex: 10,
          }}
        />
      </motion.div>

      <div ref={orb1Ref} className="landing-orb landing-orb-1" />
      <div ref={orb2Ref} className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      {/* Dark overlay for text readability */}
      <div className="landing-spline-overlay" />

      {/* Bottom fade to features */}
      <div className="landing-spline-bottom-fade" />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={`landing-nav ${scrolled ? "landing-nav-scrolled" : ""}`}
        data-ocid="landing.nav"
      >
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <span className="landing-brand-dot" />
            <span className="landing-brand-name">InstiFlow</span>
          </div>
          <div className="landing-nav-links">
            <a
              href="#features"
              className="landing-nav-link"
              data-ocid="landing.features.link"
            >
              Features
            </a>
            <button
              type="button"
              className="landing-nav-link"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              onClick={onEnter}
              data-ocid="landing.dashboard.link"
            >
              Dashboard
            </button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="glass-btn-accent glow-btn"
              style={{ padding: "8px 22px", fontSize: "14px" }}
              onClick={onEnter}
              data-ocid="landing.nav.primary_button"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="landing-hero-fullscreen"
        style={{ position: "relative", zIndex: 10 }}
      >
        <div className="landing-hero-text">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(0)}
            className="landing-badge"
          >
            <span className="landing-badge-dot" />
            Smart Academic Planner for IIT Madras
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(1)}
            className="landing-h1"
          >
            InstiFlow
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(1.5)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 14px",
              borderRadius: "100px",
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
              fontSize: "12px",
              fontWeight: 500,
              color: "rgba(180,190,255,0.8)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              letterSpacing: "0.04em",
            }}
          >
            Powered by{" "}
            <span style={{ color: "#a78bfa", fontWeight: 700 }}>
              IITM BAZAAR
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(2)}
            className="landing-tagline"
          >
            Plan smarter.{" "}
            <span style={{ color: "rgba(168,139,250,0.9)" }}>Live better.</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(3)}
            className="landing-subtitle"
            style={{
              textShadow:
                "0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7)",
            }}
          >
            Your complete academic companion — timetables, attendance, exams,
            tasks, all in one premium dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(4)}
            className="landing-ctas"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="landing-cta-primary glow-btn"
              onClick={onEnter}
              data-ocid="landing.get_started.primary_button"
            >
              Get Started →
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="landing-cta-outline"
              onClick={onEnter}
              data-ocid="landing.view_demo.secondary_button"
            >
              View Demo
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="landing-stats"
          >
            {[
              { label: "Modules", value: "6+" },
              { label: "Slots mapped", value: "25+" },
              { label: "100% Local", value: "Private" },
            ].map((s) => (
              <div key={s.label} className="landing-stat">
                <span className="landing-stat-value">{s.value}</span>
                <span className="landing-stat-label">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="landing-features"
        style={{ position: "relative", zIndex: 1 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="landing-section-title"
        >
          Everything you need
        </motion.h2>
        <div className="landing-features-grid">
          {[
            {
              icon: "⏱",
              title: "Smart Timetable",
              desc: "Auto-map IITM slots to your weekly schedule with color-coded cards.",
            },
            {
              icon: "📅",
              title: "Academic Calendar",
              desc: "Full semester view with holidays, Saarang, and exam periods pre-marked.",
            },
            {
              icon: "✅",
              title: "Attendance Tracker",
              desc: "Track attendance per course with circular progress and skip predictions.",
            },
            {
              icon: "📝",
              title: "Exam Scheduler",
              desc: "Quiz 1, Quiz 2, End Sem dates auto-generated from slot data.",
            },
            {
              icon: "🗂",
              title: "Task Manager",
              desc: "Notion-style cards with drag-and-drop, reminders, and priority labels.",
            },
            {
              icon: "🔔",
              title: "Smart Notifications",
              desc: "7am class alerts, attendance warnings, and upcoming exam countdowns.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="landing-feature-card glass-card shimmer-card"
            >
              <div className="landing-feature-icon">{f.icon}</div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="landing-final-cta"
        style={{ position: "relative", zIndex: 1 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="landing-final-card glass-card"
        >
          <h2 className="landing-final-title">Ready to take control?</h2>
          <p className="landing-final-subtitle">
            No sign-up required. Your data stays private, on your device.
          </p>
          <motion.button
            type="button"
            whileHover={{ scale: 1.06, y: -4 }}
            whileTap={{ scale: 0.95 }}
            className="landing-cta-primary glow-btn"
            onClick={onEnter}
            data-ocid="landing.final.primary_button"
          >
            Launch Dashboard →
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span style={{ opacity: 0.4, fontSize: "13px", color: "#a9b8d0" }}>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#a78bfa", textDecoration: "none" }}
          >
            caffeine.ai
          </a>
        </span>
      </footer>
    </div>
  );
}
