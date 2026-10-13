import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import LightRays from "./LightRays";

const Start = () => {
  return (
    <section
      className="undefined visible with-avatar"
      style={{ background: "#000", position: "relative" }}
    >
      <div
        style={{
          zIndex: 0,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
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
      <div
        className="block"
        data-blocktype="rich-text"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div className="block-content text-block align-center inner-mid">
          <div style={{ paddingTop: 20, paddingBottom: 20 }}>
            <div
              style={{
                display: "inline-block",
                border: "1px solid rgba(228, 194, 115, 0.5)",
                borderRadius: "50px",
                padding: "0.5rem 1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <span
                className="font-helvetica"
                style={{
                  color: "#00A372",
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                }}
              >
                By Invitation
              </span>
            </div>
            <h2
              className="font-helvetica"
              style={{
                color: "#fff",
                fontSize: "2.5rem",
                marginBottom: "2rem",
              }}
            >
              Mk Timothy Investor Circle
            </h2>
            <p
              className="font-helvetica"
              style={{
                color: "#fff",
                maxWidth: "700px",
                margin: "0 auto 1.5rem auto",
                display: "block",
                fontSize: "1.25rem",
                lineHeight: "1.6",
              }}
            >
              Mk Timothy works with a select group of accredited investors and
              venture capital partners seeking credible private-market
              opportunities.
            </p>
            <p
              className="font-helvetica"
              style={{
                color: "#fff",
                maxWidth: "700px",
                margin: "0 auto 1.5rem auto",
                display: "block",
                fontSize: "1.25rem",
                lineHeight: "1.6",
              }}
            >
              Access to our investor circle is limited and reviewed to maintain
              the quality and relevance of introductions.
            </p>

            <div
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, #333, transparent)",
                margin: "3rem auto",
              }}
            ></div>

            <h3
              className="font-helvetica"
              style={{
                color: "#00A372",
                marginBottom: "2.5rem",
                fontSize: "0.75rem",
                fontWeight: "500",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Why Join
            </h3>

            {/* Premium Why Join List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.25rem",
                maxWidth: "500px",
                margin: "0 auto 3rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00A372, #00805A, #006648)",
                    flexShrink: 0,
                  }}
                />
                <span
                  className="font-helvetica"
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "1.05rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  Curated, quality-first opportunities
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00A372, #00805A, #006648)",
                    flexShrink: 0,
                  }}
                />
                <span
                  className="font-helvetica"
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "1.05rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  Mandate-aligned introductions
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00A372, #00805A, #006648)",
                    flexShrink: 0,
                  }}
                />
                <span
                  className="font-helvetica"
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "1.05rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  Cross-border private-market visibility
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00A372, #00805A, #006648)",
                    flexShrink: 0,
                  }}
                />
                <span
                  className="font-helvetica"
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "1.05rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  A discreet, professional network
                </span>
              </div>
            </div>

            <div
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(228, 194, 115, 0.3), transparent)",
                margin: "3rem auto",
                maxWidth: "600px",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Premium Benefits Section */}
      <div className="block" style={{ position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "3rem",
              flexWrap: "wrap",
            }}
          >
            {/* Benefit 1 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                maxWidth: "220px",
              }}
            >
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  border: "1px solid rgba(228, 194, 115, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00A372"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p
                className="font-helvetica"
                style={{
                  color: "#fff",
                  fontSize: "1rem",
                  fontWeight: "400",
                  margin: 0,
                  lineHeight: "1.6",
                }}
              >
                Takes under 2 minutes
              </p>
            </div>

            {/* Benefit 2 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                maxWidth: "220px",
              }}
            >
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  border: "1px solid rgba(228, 194, 115, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00A372"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p
                className="font-helvetica"
                style={{
                  color: "#fff",
                  fontSize: "1rem",
                  fontWeight: "400",
                  margin: 0,
                  lineHeight: "1.6",
                }}
              >
                Strictly confidential
              </p>
            </div>

            {/* Benefit 3 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                maxWidth: "220px",
              }}
            >
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  border: "1px solid rgba(228, 194, 115, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00A372"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p
                className="font-helvetica"
                style={{
                  color: "#fff",
                  fontSize: "1rem",
                  fontWeight: "400",
                  margin: 0,
                  lineHeight: "1.6",
                }}
              >
                Admission by review
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* ///////////////////////////////////////////////////////////////// */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          margin: "auto",
          maxWidth: "450px",
          position: "relative",
          zIndex: 2,
          marginBottom: "1rem",
        }}
      >
        <Button
          as="link"
          href="/investors/form"
          variant="gradient"
          size="large"
          className="w-full"
        >
          YES, I AM IN!
          <ArrowRight size={20} className="ml-2" />
        </Button>

        <Button
          as="link"
          href="/investors/login"
          variant="gradient"
          size="large"
          className="w-full"
        >
          INVESTOR PANEL
          <ArrowRight size={20} className="ml-2" />
        </Button>

        <Button
          as="link"
          href="https://mktimothy.com/pitch-idea"
          variant="gradient"
          size="large"
          className="w-full"
          external
        >
          PITCH YOUR IDEA
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </div>
      {/* /////////////////////////////////////////////////////////////////////// */}
      <div
        className="block"
        data-blocktype="rich-text"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div className="block-content text-block align-center inner-mid">
          <div style={{ paddingTop: 20, paddingBottom: 20 }}>
            <p style={{ color: "#fff" }}>
              <em>
                <strong>Request Consideration</strong>
              </em>
              <p style={{ color: "#fff", marginTop: "10px" }}>
                <em>Reserved for accredited and professional investors.</em>
                &nbsp;
              </p>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Start;

