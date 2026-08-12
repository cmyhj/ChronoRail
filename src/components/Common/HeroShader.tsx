import { MeshGradient } from "@paper-design/shaders-react";

export function ShaderBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-10">
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#0d1428", "#16224e", "#232a6e", "#3a2578", "#552070", "#6e1f58", "#7a2430", "#1a3a3a"]}
        speed={0.5}
        distortion={0.6}
        swirl={0.25}
        grainOverlay={0.06}
      />
    </div>
  );
}
