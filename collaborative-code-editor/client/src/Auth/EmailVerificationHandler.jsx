import { useEffect, useState } from "react";
import { getAuth, applyActionCode } from "firebase/auth";

export default function EmailVerificationHandler() {
  const [status, setStatus] = useState("⏳ Verifying email...");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode");

    if (!oobCode) {
      setStatus("❌ Invalid or missing verification code.");
      return;
    }

    console.log("Verification link:", window.location.href);

    const auth = getAuth();
    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus("✅ Email verified successfully! You can now log in.");
      })
      .catch((error) => {
        console.error("Verification error:", error);
        setStatus("❌ Verification failed. The link may be expired or already used.");
      });
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Email Verification</h2>
      <p>{status}</p>
    </div>
  );
}



// import { useEffect, useState } from "react";
// import { getAuth, applyActionCode } from "firebase/auth";

// export default function EmailVerificationHandler() {
//   const [status, setStatus] = useState("⏳ Verifying email...");

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const mode = urlParams.get("mode");
//     const oobCode = urlParams.get("oobCode");

//     if (!mode || !oobCode) {
//       setStatus("❌ Invalid verification link.");
//       return;
//     }

//     const auth = getAuth();
    
//     if (mode === "verifyEmail") {
//       applyActionCode(auth, oobCode)
//         .then(() => {
//           setStatus("✅ Email verified successfully! You can now log in.");
//         })
//         .catch((error) => {
//           console.error("Verification error:", error);
//           setStatus("❌ Verification failed. The link may be expired or already used.");
//         });
//     } else {
//       setStatus("❌ Invalid verification link.");
//     }
//   }, []);

//   return (
//     <div style={{ padding: "2rem", textAlign: "center" }}>
//       <h2>Email Verification</h2>
//       <p>{status}</p>
//     </div>
//   );
// }
