"use client";

import { useRef, useEffect } from "react";

export default function VideoBg() {
  const vid = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    v.loop = false;
    const onEnded = () => { v.currentTime = 1.1; v.play(); };
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, []);

  return (
    <div data-video-bg className="fixed inset-0 z-0 pointer-events-none" style={{ mixBlendMode: "screen" }}>
      <video
        ref={vid}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="/bg-video.webm" type="video/webm" />
      </video>
    </div>
  );
}
