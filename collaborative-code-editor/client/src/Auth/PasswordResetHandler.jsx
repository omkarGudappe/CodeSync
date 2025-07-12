import { useEffect, useState } from "react";
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function PasswordResetHandler() {
  const [status, setStatus] = useState("⏳ Processing password reset...");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [oobCode, setOobCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    const code = urlParams.get("oobCode");

    if (mode === "resetPassword" && code) {
      setOobCode(code);
      const auth = getAuth();
      verifyPasswordResetCode(auth, code)
        .then((email) => {
          setEmail(email);
          setStatus("✅ Please enter your new password");
        })
        .catch((error) => {
          console.error("Password reset error:", error);
          setStatus("❌ Password reset link is invalid or has expired.");
        });
    } else {
      setStatus("❌ Invalid password reset link.");
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus("❌ Passwords do not match.");
      return;
    }

    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("✅ Password reset successfully! You can now log in with your new password.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      setStatus("❌ Failed to reset password. Please try again.");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Password Reset</h2>
      {status.includes("✅ Please enter") ? (
        <form onSubmit={handleResetPassword}>
          <p>Reset password for: {email}</p>
          <div>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <button type="submit">Reset Password</button>
        </form>
      ) : (
        <p>{status}</p>
      )}
    </div>
  );
}