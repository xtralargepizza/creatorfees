"use client";

import dynamic from "next/dynamic";

const UnicornScene = dynamic(() => import("unicornstudio-react/next"), {
  ssr: false,
});

export default function UnicornBg() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.08 }}>
      <UnicornScene
        projectId="WUpODMJZ947UV6HIQcyS"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.5/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        scale={0.5}
        dpi={1}
        fps={30}
        lazyLoad={true}
      />
    </div>
  );
}
