"use client";
import { logger } from "@/lib/logger";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslations } from 'next-intl';
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

// Deterministic pseudo-random for SSR/client hydration match
function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Video already buffered (cached by browser)
    if (video.readyState >= 2) {
      setVideoLoaded(true);
      video.play().catch(() => {});
      return;
    }

    const onCanPlay = () => {
      setVideoLoaded(true);
      video.play().catch(() => {});
    };
    const onError = () => {
      logger.warn("Hero video failed to load");
      setVideoError(true);
    };

    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);
    video.load();

    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
    };
  }, []);

  // Generate deterministic particle data to avoid hydration mismatch
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      left: `${seededRandom(i * 3 + 1) * 100}%`,
      top: `${seededRandom(i * 3 + 2) * 100}%`,
      duration: 3 + seededRandom(i * 3 + 3) * 2,
      delay: seededRandom(i * 3 + 4) * 2,
      color: i % 3 === 0 ? "#fc4c02" : i % 3 === 1 ? "#ef2cc1" : "#bdbbff",
    }));
  }, []);

  const handleScrollDown = useCallback(() => {
    const el = document.getElementById("market-overview");
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  }, [prefersReducedMotion]);

  const t = useTranslations('hero');

  return (
    <section className="relative min-h-[100dvh] -mt-[80px] pt-[80px] flex flex-col items-center justify-center overflow-hidden bg-canvas">
      {/* Video background — extends up behind the transparent header */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className={`absolute -top-[80px] left-0 right-0 bottom-0 w-full h-[calc(100%+80px)] object-cover transition-opacity duration-1000 ${
          videoLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ filter: "brightness(0.5) saturate(1.1)" }}
        aria-hidden="true"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4"
          type="video/mp4"
        />
      </video>

      {/* Static fallback when video fails */}
      {videoError && (
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#010120] via-[#010120] to-[#010120]"
          aria-hidden="true"
        />
      )}

      {/* Subtle vignette — keeps edges dark for text readability */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#010120/60_100%)]"
        aria-hidden="true"
      />

      {/* Bottom fade for smooth transition to next section */}
      <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-[#010120] to-transparent" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />

      {/* Decorative gradient ribbon — right half */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, transparent 0%, rgba(252, 76, 2, 0.15) 30%, rgba(239, 44, 193, 0.15) 60%, rgba(189, 187, 255, 0.15) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Floating particles effect — respect reduced motion */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: p.left,
                top: p.top,
                backgroundColor: p.color,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center">
        {/* Eyebrow — mono-caps label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-mono-caps text-secondary mb-4"
        >
          {t("eyebrow")}
        </motion.div>

        {/* Badge */}
        <motion.a
          href="#markets"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="inline-flex items-center gap-2 border border-surface backdrop-blur-sm bg-card/40 rounded-sm p-1 pr-4 mb-8 hover:bg-card/60 transition-colors group"
        >
          <span className="bg-accent text-inverse text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-wide font-mono">
            {t("badge")}
          </span>
          <span className="text-xs text-secondary group-hover:text-primary transition-colors">
            {t("badgeText")}
          </span>
          <ArrowRight className="w-3 h-3 text-secondary group-hover:text-primary transition-colors" />
        </motion.a>

        {/* Headline — display-xxl, sentence case */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="display-xxl text-primary mb-6"
        >
          <h1>
            {t("title")}
            <br />
            {t("titleLine2")}
            <br />
            {t.rich("titleLine3", { clarity: (chunks) => <span className="text-[#bdbbff]">{chunks}</span>, clarityValue: t("clarity") })}
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-secondary text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t("subtitle")}
        </motion.p>

        {/* CTAs — black primary + mint secondary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4 w-full sm:w-auto"
        >
          <button className="w-full sm:w-auto bg-black text-primary font-mono text-sm uppercase tracking-wider px-8 py-2.5 rounded-sm hover:bg-raised transition-colors flex items-center justify-center gap-2">
            {t("ctaPrimary")}
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href="/markets"
            className="w-full sm:w-auto bg-accent text-inverse font-mono text-sm uppercase tracking-wider px-8 py-2.5 rounded-sm hover:bg-[#a8e6e9] transition-colors"
          >
            {t("ctaSecondary")}
          </Link>
        </motion.div>

        {/* Scroll spacer */}
        <div className="h-16" />
      </div>

      {/* Scroll indicator — clickable, positioned higher */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
        onClick={handleScrollDown}
        role="button"
        aria-label="Scroll down to market overview"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-secondary hover:text-primary transition-colors"
        >
          <span className="font-mono-caps">{t("scroll")}</span>
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}
