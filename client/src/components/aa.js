// aa.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleForgetSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.resetLink) setResetLink(data.resetLink);
      alert(data.message);
    } catch {
      alert("Network error");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleForgetSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button type="submit">Send Reset Link</button>
      </form>

      {resetLink && (
        <div style={{ marginTop: "20px" }}>
          <p>Reset link (for testing):</p>
          <a href={resetLink} target="_blank" rel="noopener noreferrer">
            {resetLink}
          </a>
        </div>
      )}
    </div>
  );
};

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8080/api/user/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      alert(data.message);
      if (res.ok) navigate("/"); // go to login
    } catch {
      alert("Network error");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleResetSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};
