import { MeshGradient } from "@paper-design/shaders-react";

export function ShaderBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#0a0a0f", "#1e1b3b", "#0f0f23", "#1a1040", "#0d0d1a"]}
        speed={0.12}
        distortion={0.5}
        swirl={0.15}
        grainOverlay={0.08}
      />
    </div>
  );
}
