const DEV = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: unknown[]) => {
    if (DEV) console.log("[zenith]", ...args);
  },
  warn: (...args: unknown[]) => {
    if (DEV) console.warn("[zenith]", ...args);
  },
  error: (...args: unknown[]) => {
    console.error("[zenith]", ...args);
  },
  info: (...args: unknown[]) => {
    if (DEV) console.info("[zenith]", ...args);
  },
};
