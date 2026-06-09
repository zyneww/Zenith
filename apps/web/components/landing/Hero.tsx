"use client";

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
      console.warn("Hero video failed to load");
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
    <section className="relative min-h-[100dvh] -mt-[80px] pt-[80px] flex flex-col items-center justify-center overflow-hidden">
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
        style={{ filter: "brightness(0.65) saturate(1.1)" }}
        aria-hidden="true"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4"
          type="video/mp4"
        />
      </video>

      {/* Subtle vignette — keeps edges dark for text readability */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0b0e14/60_100%)]"
        aria-hidden="true"
      />

      {/* Bottom fade for smooth transition to next section */}
      <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-[#0b0e14] to-transparent" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Floating particles effect — respect reduced motion */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-brand-cyan/40 rounded-full"
              style={{
                left: p.left,
                top: p.top,
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
        {/* Badge */}
        <motion.a
          href="#markets"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="inline-flex items-center gap-2 border border-gray-600/50 backdrop-blur-sm bg-gray-900/40 rounded-full p-1 pr-4 mb-8 hover:bg-gray-800/50 transition-colors group"
        >
          <span className="bg-brand-cyan text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            {t("badge")}
          </span>
          <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
            {t("badgeText")}
          </span>
          <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-gray-300 transition-colors" />
        </motion.a>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-[0.95]"
        >
          <h1>
            {t("title")}
            <br />
            {t("titleLine2")}
            <br />
            {t.rich("titleLine3", { clarity: (chunks) => <span className="text-[#F0B90B]">{chunks}</span>, clarityValue: t("clarity") })}
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t("subtitle")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4 w-full sm:w-auto"
        >
          <button className="w-full sm:w-auto bg-white text-black font-semibold px-8 py-3.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10">
            {t("ctaPrimary")}
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href="/markets"
            className="w-full sm:w-auto bg-transparent border border-gray-600 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-white/5 transition-colors backdrop-blur-sm"
          >
            {t("ctaSecondary")}
          </Link>
        </motion.div>

        {/* Sub-CTA text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="text-xs text-gray-500 mb-16"
        >
          $0 forever, no credit card needed
        </motion.p>

        {/* Keyboard shortcut tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="text-xs text-gray-500 mb-8"
        >
          {t("keyboardHint")}
        </motion.div>

        {/* Powered by */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[10px] text-gray-600 font-semibold uppercase tracking-wider"
        >
          <span className="text-gray-700">{t("poweredBy")}</span>
          <span className="hover:text-gray-400 transition-colors cursor-default">Binance</span>
          <span className="hover:text-gray-400 transition-colors cursor-default">CoinGecko</span>
          <span className="hover:text-gray-400 transition-colors cursor-default">QuestDB</span>
          <span className="hover:text-gray-400 transition-colors cursor-default">Dragonfly</span>
        </motion.div>
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
          className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <span className="text-[10px] uppercase tracking-widest">{t("scroll")}</span>
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}
