import React from "react";
import "@google/model-viewer";

export function ModelViewer3D({ src }) {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !src) return;

    const el = document.createElement("model-viewer");
    el.setAttribute("src", src);
    el.setAttribute("auto-rotate", "");
    el.setAttribute("camera-controls", "");
    el.setAttribute("shadow-intensity", "1");
    el.setAttribute("environment-image", "neutral");
    el.style.width = "100%";
    el.style.height = "280px";
    el.style.borderRadius = "12px";
    el.style.background = "transparent";

    container.appendChild(el);
    return () => {
      if (container.contains(el)) container.removeChild(el);
    };
  }, [src]);

  return <div ref={containerRef} style={{ width: "100%", height: "280px" }} />;
}
