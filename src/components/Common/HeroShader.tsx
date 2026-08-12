import { MeshGradient } from "@paper-design/shaders-react";

export function ShaderBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#14142e", "#2d2a5e", "#1a1a40", "#2f2360", "#1c1c3a"]}
        speed={0.5}
        distortion={0.6}
        swirl={0.25}
        grainOverlay={0.06}
      />
    </div>
  );
}
