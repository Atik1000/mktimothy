"use client";
import Link from "next/link";
import { useState } from "react";

const ForgotPassword = () => {
  const [error, setError] = useState(false);
  const [mail, setMail] = useState("");

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: "url(/images/bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "grid",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
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
            backgroundColor: "white",
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
        {error ? (
          <div
            style={{
              padding: "8px",
              borderRadius: "5px",
              margin: "20px 0",
              marginTop: "75px",
              backgroundColor: "black",
            }}
          >
            <h3
              style={{ color: "white", textAlign: "center", marginTop: "20px" }}
            >
              Email sent! <br />
              Please check your inbox.
            </h3>
            <ul
              style={{
                color: "white",
                fontSize: "14px",
                padding: "0 5%",
                textAlign: "center",
              }}
            >
              <li style={{ marginTop: "20px" }}>
                if your account is valid you will recieve an email to {mail}
              </li>
              <li style={{ marginTop: "20px", marginBottom: "10px" }}>
                The password enclosed in mail is valid for{" "}
                <span style={{ color: "red" }}>30 minutes</span> only, so please
                act quickly.
              </li>
            </ul>
          </div>
        ) : (
          <>
            <h3
              style={{ color: "white", textAlign: "center", marginTop: "75px" }}
            >
              Reset Password
            </h3>
            <p
              style={{ color: "white", textAlign: "center", marginTop: "10px" }}
            >
              Input you email address and we'll send you the email with
              instructions
            </p>
            <input
              type="email"
              style={{ padding: "8px", borderRadius: "5px", margin: "20px 0" }}
              placeholder="Email Address"
              className="w-full"
              onChange={(e) => {
                setMail(e.target.value);
              }}
            />

            <div
              onClick={() => {
                setError(true);
              }}
              style={{
                backgroundColor: "#00A372",
                cursor: "pointer",
                color: "white",
                padding: "20px 30px",
                borderRadius: "10px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Send
            </div>
          </>
        )}

        <Link href="/investors/login">
          <p
            style={{
              color: "white",
              textAlign: "center",
              marginTop: "40px",
              cursor: "pointer",
            }}
          >
            Return to login page
          </p>
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
