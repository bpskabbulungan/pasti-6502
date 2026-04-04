"use client";

export const NAVIGATION_PENDING_EVENT = "pasti:navigation-pending";

export const markNavigationPending = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(NAVIGATION_PENDING_EVENT));
};
