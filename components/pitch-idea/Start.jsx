import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

const Start = () => {
  return (
    <section
      className="undefined visible with-avatar"
      style={{
        background: "transparent",
        position: "relative",
      }}
    >
      {/* FOR FOUNDERS Badge */}
      <div
        style={{
          textAlign: "center",
          paddingTop: "2rem",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(228, 194, 115, 0.1)",
            border: "1px solid rgba(228, 194, 115, 0.3)",
            borderRadius: "20px",
            padding: "0.5rem 1rem",
            fontSize: "0.75rem",
            color: "#00A372",
            fontWeight: "600",
            letterSpacing: "0.05em",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          FOR FOUNDERS
        </div>
      </div>

      <div
        className="block"
        data-blocktype="rich-text"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div className="block-content text-block align-center inner-mid">
          <div style={{ paddingTop: 20, paddingBottom: 20 }}>
            <h2
              className="font-helvetica"
              style={{
                color: "#fff",
                fontSize: "2.5rem",
                marginBottom: "2rem",
                fontWeight: "400",
              }}
            >
              Welcome to an{" "}
              <span style={{ color: "#00A372", fontWeight: "500" }}>
                Interactive Session
              </span>
              <br />
              with Mk Timothy
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
              You're about to start a short, guided session that helps Mk Timothy
              understand
              <br />
              your venture, your goals, and your funding needs.
            </p>

            <h3
              className="font-helvetica"
              style={{
                color: "#fff",
                marginTop: "3rem",
                marginBottom: "2rem",
                fontSize: "1.5rem",
              }}
            >
              Let's Get Your Venture Investor-Ready
            </h3>
          </div>
        </div>
      </div>

      {/* //////////////////////////////////////////////////////////////// */}

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
          href="/pitch-idea/form"
          variant="gradient"
          size="large"
          className="w-full"
        >
          YES, START MY FUNDING MATCH
          <ArrowRight size={20} className="ml-2" />
        </Button>

        <Button
          as="link"
          href="/pitch-idea/form?direct=true"
          variant="gradient"
          size="large"
          className="w-full"
        >
          TAKE ME TO FOUNDER SIGN-UP
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </div>

      {/* Three benefits section */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "700px",
          margin: "2rem auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
            padding: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#fff",
              fontSize: "1rem",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00A372"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Takes under 2 minutes
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#fff",
              fontSize: "1rem",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00A372"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Private & confidential
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#fff",
              fontSize: "1rem",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00A372"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            No upfront fees
          </div>
        </div>
      </div>

      {/* Three step process section */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1000px",
          margin: "3rem auto",
          padding: "0 2rem",
        }}
      ></div>

      {/* ////////////////////////////////////////////////////// */}

      <div
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, #333, transparent)",
          margin: "3rem auto",
          maxWidth: "400px",
          position: "relative",
          zIndex: 2,
        }}
      ></div>

      {/* /////////////////////////////////////////////////////////////////////// */}
      <div
        className="block"
        data-blocktype="rich-text"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div className="block-content text-block align-center inner-mid">
          <div style={{ paddingTop: 20, paddingBottom: 20 }}>
            <p style={{ color: "#ccc", marginBottom: "1rem" }}>
              <em>
                <strong style={{ color: "#fff" }}>
                  Your next investor could be one match away.
                </strong>
              </em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Start;

