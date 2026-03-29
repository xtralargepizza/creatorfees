"use client";

import { useRef, useEffect } from "react";

export default function VideoBg() {
  const vid1 = useRef<HTMLVideoElement>(null);
  const vid2 = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v1 = vid1.current;
    const v2 = vid2.current;
    if (!v1 || !v2) return;

    // Both play from start initially
    // On loop: seek to 1.1s instead of 0
    const handleLoop = (v: HTMLVideoElement) => {
      const onEnded = () => {
        v.currentTime = 1.1;
        v.play();
      };
      v.addEventListener("ended", onEnded);
      return () => v.removeEventListener("ended", onEnded);
    };

    // Don't use native loop — handle manually
    v1.loop = false;
    v2.loop = false;

    const c1 = handleLoop(v1);
    const c2 = handleLoop(v2);

    return () => { c1(); c2(); };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Base layer — normal */}
      <video
        ref={vid1}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/bg-video.webm" type="video/webm" />
      </video>
      {/* Top layer — multiply blend */}
      <video
        ref={vid2}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ mixBlendMode: "multiply" }}
      >
        <source src="/bg-video.webm" type="video/webm" />
      </video>
    </div>
  );
}
