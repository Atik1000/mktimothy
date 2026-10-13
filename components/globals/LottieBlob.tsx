"use client";

import dynamic from "next/dynamic";

// Load the dotLottie player only on the client (it relies on canvas / WASM),
// so it never runs during server-side rendering.
const DotLottieReact = dynamic(
  () =>
    import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact),
  { ssr: false },
);

const LOTTIE_SRC =
  "https://lottie.host/4ff38b75-1ff8-48fe-8119-d0b49b710e6f/mem8Xa1T7y.lottie";

interface LottieBlobProps {
  /** Use the on-light treatment when the menu background is a light colour. */
  isLightBg?: boolean;
}

/**
 * Hosted Lottie "flow" animation used as the menu blob.
 *
 * The animation strokes are a fixed purple/blue, so we adapt it to the menu's
 * changing background:
 *  - Dark background  → "screen" blend + extra brightness so the strokes glow.
 *  - Light background → normal blend so the lines stay readable.
 * A diagonal "tail" bar keeps the brand Q silhouette.
 */
const LottieBlob = ({ isLightBg = false }: LottieBlobProps) => {
  return (
    <div className="relative w-full h-full">
      <div
        className="w-full h-full"
        style={{
          mixBlendMode: isLightBg ? "normal" : "screen",
          filter: isLightBg ? "saturate(1.1)" : "brightness(1.35)",
          transition: "filter 0.35s ease",
        }}
      >
        <DotLottieReact
          src={LOTTIE_SRC}
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Q tail */}
      <div
        className="absolute"
        style={{
          width: "30%",
          height: "44%",
          bottom: "2%",
          right: "6%",
          transform: "rotate(-45deg)",
          borderRadius: "6px",
          background: isLightBg
            ? "rgba(39,12,65,0.16)"
            : "rgba(255,255,255,0.14)",
          transition: "background 0.35s ease",
        }}
      />
    </div>
  );
};

export default LottieBlob;


