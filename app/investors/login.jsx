"use client";
import Link from "next/link";
import { useState } from "react";
import LightRays from "../../components/investors/LightRays";

const Login = () => {
  const [error, setError] = useState(false);
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000",
        position: "relative",
        overflow: "hidden",
        display: "grid",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
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
      <div
        style={{
          position: "relative",
          zIndex: 2,
          backgroundColor: "rgba(0,0,0,0.6)",
          maxWidth: "400px",
          margin: "auto",
          padding: "2%",
          borderRadius: "10px",
        }}
      >
        <div
          style={{
            width: "150px",
            height: "150px",
            backgroundColor: "#000",
            top: "-70px",
            left: "0",
            right: "0",
            position: "absolute",
            margin: "auto",
            borderRadius: "5px",
            display: "grid",
            alignItems: "center",
          }}
        >
          {" "}
          <img
            style={{ width: "100%", objectFit: "contain" }}
            src="/images/logo.png"
            className="p-2"
            alt=""
          />
        </div>
        <input
          type="text"
          style={{ padding: "8px", borderRadius: "5px", marginTop: "75px" }}
          placeholder="Email or User ID"
          className="w-full text-black-900"
        />
        <input
          type="password"
          style={{ padding: "8px", borderRadius: "5px", margin: "20px 0" }}
          placeholder="Password"
          className="w-full text-black-900"
        />
        {error && (
          <div
            style={{
              padding: "8px",
              borderRadius: "5px",
              margin: "20px 0",
              backgroundColor: "black",
            }}
          >
            <p
              style={{
                color: "red",
                fontSize: "15px",
                textAlign: "center",
                padding: "0 10%",
              }}
            >
              Your account or password is incorrect
            </p>
            <ul style={{ color: "white", fontSize: "14px", padding: "0 5%" }}>
              <li style={{ marginTop: "20px" }}>
                1. if you do not remember your password. click here to reset.
              </li>
              <li style={{ marginTop: "20px" }}>
                2. If you received a temporary password, it is valid for{" "}
                <span style={{ color: "red" }}>30 minutes</span> only. Click{" "}
                <Link href="forgotpassword">here</Link> to request a new
                temporary password.
              </li>
              <li style={{ marginTop: "20px", marginBottom: "20px" }}>
                3. If you tried to log in multiple times with incorrect
                credentials, we may have locked your account to protect it.
                Contact our{" "}
                <a target="_blank" href="mailto:info@mktimothy.com">
                  support
                </a>{" "}
                to unlock it.
              </li>
            </ul>
          </div>
        )}

        <div
          onClick={() => {
            setError(true);
          }}
          style={{
            background: "linear-gradient(135deg, #00805A 0%, #00A372 50%, #006648 100%)",
            cursor: "pointer",
            color: "white",
            padding: "10px 10px",
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: "bold",
            boxShadow: "0 4px 15px rgba(200, 159, 74, 0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(200, 159, 74, 0.5)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(200, 159, 74, 0.3)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Sign in
        </div>

        <Link href="/investors/forgotpassword">
          <p
            style={{
              color: "#00805A",
              textAlign: "center",
              marginTop: "30px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Forgot Password?
          </p>
        </Link>

      
      </div>
    </div>
  );
};

export default Login;
