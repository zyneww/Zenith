"use client";
import { logger } from "@/lib/logger";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from 'next-intl';
import { ChevronDown } from "lucide-react";
import HeroCTA from "./Hero/HeroCTA";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
    };

    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);
    video.load();

    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
    };
  }, []);

  const handleScrollDown = useCallback(() => {
    const el = document.getElementById("market-overview");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const t = useTranslations('hero');

  return (
    <section className="relative min-h-[100dvh] -mt-[96px] pt-[96px] flex flex-col items-center justify-center overflow-hidden bg-canvas">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className={`absolute -top-[96px] left-0 right-0 bottom-0 w-full h-[calc(100%+96px)] object-cover transition-opacity duration-1000 ${
          videoLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ filter: "brightness(0.5) saturate(1.1)" }}
        aria-hidden="true"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4"
          type="video/mp4"
        />
      </video>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center">
        <div className="display-1 text-primary mb-6">
          <h1>
            {t("title")}
            <br />
            {t("titleLine2")}
            <br />
            {t.rich("titleLine3", { clarity: (chunks) => <span className="text-sticker-purple">{chunks}</span>, clarityValue: t("clarity") })}
          </h1>
        </div>

        <p className="text-primary/85 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("subtitle")}
        </p>

        <HeroCTA />

        <div className="h-16" />
      </div>

      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
        onClick={handleScrollDown}
        role="button"
        aria-label="Scroll down to market overview"
      >
        <div className="flex flex-col items-center gap-2 text-secondary hover:text-primary transition-colors">
          <span className="font-mono-caps">{t("scroll")}</span>
          <ChevronDown className="w-6 h-6" />
        </div>
      </div>
    </section>
  );
}
