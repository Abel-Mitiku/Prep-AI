"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type FocusEvent = {
  type: "blur" | "visibilitychange" | "inactivity" | "copy" | "paste";
  timestamp: number;
  details?: string;
};

export type FocusMonitorConfig = {
  enabled: boolean;
  warningThreshold: number; // Show warning after N events
  suspiciousThreshold: number; // Mark suspicious after N events
  inactivityTimeout: number; // ms before marking inactivity
};

export function useFocusMonitor(config: FocusMonitorConfig) {
  const [cheatCount, setCheatCount] = useState(0);
  const [focusScore, setFocusScore] = useState(100);
  const [suspicious, setSuspicious] = useState(false);
  const [events, setEvents] = useState<FocusEvent[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const eventCountRef = useRef(0);

  // Reset inactivity timer on user activity
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      handleSuspiciousEvent("inactivity", "User inactive for extended period");
    }, config.inactivityTimeout);
  }, [config.inactivityTimeout]);

  // Handle a suspicious event
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

      // Update cheat count
      setCheatCount((prev) => {
        const newCount = prev + 1;

        // Show progressive warnings
        if (newCount === config.warningThreshold) {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        }

        // Mark as suspicious if threshold exceeded
        if (newCount >= config.suspiciousThreshold) {
          setSuspicious(true);
        }

        return newCount;
      });

      // Reduce focus score progressively (min 0)
      setFocusScore((prev) => Math.max(0, prev - 15));
    },
    [config.enabled, config.warningThreshold, config.suspiciousThreshold],
  );

  // Event listeners setup
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

    // Add listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    // Activity listeners for inactivity detection
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("click", handleUserActivity);

    // Start inactivity timer
    resetInactivityTimer();

    return () => {
      // Cleanup listeners
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

  // Return monitoring state and controls
  return {
    cheatCount,
    focusScore,
    suspicious,
    events,
    showWarning,
    // Expose manual trigger for testing/debugging
    triggerEvent: handleSuspiciousEvent,
  };
}
