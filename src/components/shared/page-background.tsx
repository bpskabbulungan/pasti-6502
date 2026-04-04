"use client";

import { useEffect, useId } from "react";

type PageBackgroundProps = {
  className?: string;
};

export default function PageBackground({ className }: PageBackgroundProps) {
  const instanceId = useId();

  useEffect(() => {
    const body = document.body;
    const nextClasses =
      className?.split(/\s+/).filter((value) => value.length > 0) ?? [];
    const prevClasses =
      body.dataset.pageBackgroundClasses
        ?.split(/\s+/)
        .filter((value) => value.length > 0) ?? [];

    if (prevClasses.length > 0) {
      body.classList.remove(...prevClasses);
    }

    if (nextClasses.length > 0) {
      body.classList.add(...nextClasses);
      body.dataset.pageBackgroundClasses = nextClasses.join(" ");
      body.dataset.pageBackgroundOwner = instanceId;
    } else {
      delete body.dataset.pageBackgroundClasses;
      delete body.dataset.pageBackgroundOwner;
    }

    return () => {
      if (body.dataset.pageBackgroundOwner !== instanceId) {
        return;
      }

      const currentClasses =
        body.dataset.pageBackgroundClasses
          ?.split(/\s+/)
          .filter((value) => value.length > 0) ?? [];
      if (currentClasses.length > 0) {
        body.classList.remove(...currentClasses);
      }
      delete body.dataset.pageBackgroundClasses;
      delete body.dataset.pageBackgroundOwner;
    };
  }, [className, instanceId]);

  return null;
}
