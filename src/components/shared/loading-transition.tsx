"use client";

import NextTopLoader from "nextjs-toploader";

export default function LoadingTransition({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NextTopLoader 
        color="hsl(var(--primary))"
        showSpinner={false}
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        easing="ease"
        speed={200}
        shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
      />
      {children}
    </>
  );
}
