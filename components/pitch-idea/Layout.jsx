import Link from "next/link";
import LightRays from "../investors/LightRays";

const Layout = ({ children }) => {
  return (
    <div
      className="App h-screen overflow-y-auto pb-8 font-helvetica"
      style={{
        background: "#000",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="custom-rays"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>
      <header
        className="z-50"
        style={{ background: "transparent", position: "relative" }}
      >
        <div
          style={{
            display: "block",
            borderBottom: "none",
            padding: "1.5rem 2rem",
          }}
          id="template-header"
        >
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="block" data-blocktype="image">
                <div className="block-content image-block">
                  <Link href={"/"}>
                    <img
                      src="/images/logo.png"
                      alt="Mk Timothy Logo"
                      style={{
                        width: "100px",
                        height: "auto",
                        display: "block",
                      }}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      <div
        className="block"
        data-blocktype="rich-text"
        style={{ background: "#000", position: "relative", zIndex: 1 }}
      >
        <div className="block-content text-block align-center inner-mid">
          <div
            style={{
              margin: "auto",
            }}
          >
            <p style={{ color: "#fff" }}>
              <em>
                <strong
                  style={{
                    background:
                      "linear-gradient(180deg, #00A372, #00805A, #006648)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Turn ambition into backing with Mk Timothy
                </strong>
              </em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;

