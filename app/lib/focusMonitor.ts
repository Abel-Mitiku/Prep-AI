"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type FocusEvent = {
  type: "blur" | "visibilitychange" | "inactivity" | "copy" | "paste";
  timestamp: number;
  details?: string;
};

export type FocusMonitorConfig = {
  enabled: boolean;
  warningThreshold: number;
  suspiciousThreshold: number;
  inactivityTimeout: number;
};

export function useFocusMonitor(config: FocusMonitorConfig) {
  const [cheatCount, setCheatCount] = useState(0);
  const [focusScore, setFocusScore] = useState(100);
  const [suspicious, setSuspicious] = useState(false);
  const [events, setEvents] = useState<FocusEvent[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const eventCountRef = useRef(0);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      handleSuspiciousEvent("inactivity", "User inactive for extended period");
    }, config.inactivityTimeout);
  }, [config.inactivityTimeout]);

  const handleSuspiciousEvent = useCallback(
    (type: FocusEvent["type"], details?: string) => {
      if (!config.enabled) return;

      const newEvent: FocusEvent = {
        type,
        timestamp: Date.now(),
        details,
      };

      setEvents((prev) => [...prev, newEvent]);
      eventCountRef.current += 1;

      setCheatCount((prev) => {
        const newCount = prev + 1;

        if (newCount === config.warningThreshold) {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        }

        if (newCount >= config.suspiciousThreshold) {
          setSuspicious(true);
        }

        return newCount;
      });

      setFocusScore((prev) => Math.max(0, prev - 15));
    },
    [config.enabled, config.warningThreshold, config.suspiciousThreshold],
  );

  useEffect(() => {
    if (!config.enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleSuspiciousEvent(
          "visibilitychange",
          "User switched tabs or minimized window",
        );
      }
    };

    const handleBlur = () => {
      handleSuspiciousEvent("blur", "Interview window lost focus");
    };

    const handleCopy = (e: ClipboardEvent) => {
      handleSuspiciousEvent("copy", "Copy attempt detected");
    };

    const handlePaste = (e: ClipboardEvent) => {
      handleSuspiciousEvent("paste", "Paste attempt detected");
    };

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("click", handleUserActivity);

    resetInactivityTimer();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [config.enabled, handleSuspiciousEvent, resetInactivityTimer]);

  return {
    cheatCount,
    focusScore,
    suspicious,
    events,
    showWarning,

    triggerEvent: handleSuspiciousEvent,
  };
}
