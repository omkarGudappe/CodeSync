// import React, { useState, useEffect } from "react";
// import {
//   auth
// } from "./FireBaseAuth";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   sendEmailVerification,
//   signOut,
//   onAuthStateChanged
// } from "firebase/auth";
// import { FiMail, FiLock, FiUser, FiLogIn, FiUserPlus } from "react-icons/fi";
// import "./SignInAuth.css"; 

// const EmailAuth = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLogin, setIsLogin] = useState(true);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [confirmPassword , setConfirmPassword] = useState("");
//   const [formVisible , setFormVisible] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setMessage("");
//     setIsLoading(true);
    
//     if(!isLogin){
//       if(password !== confirmPassword){
//         setError("❌ Passwords do not match.");
//         setIsLoading(false);
//         return;
//       }
//     }
//     try {

//       if (isLogin) {
//         const result = await signInWithEmailAndPassword(auth, email, password);
//         const user = result.user;

//         await user.reload(); // Ensure emailVerified is up-to-date

//         if (user.emailVerified) {
//           setMessage("✅ Logged in successfully!");
//         } else {
//           setError("❌ Please verify your email before logging in.");
//           await signOut(auth);
//         }
//       } else {
//         const result = await createUserWithEmailAndPassword(auth, email, password);
//         const user = result.user;

//         // await sendEmailVerification(user);
//         await sendEmailVerification(user, {
//           url: 'http://localhost:3000/verify',
//           handleCodeInApp: true
//         });
//         setMessage("Verification email sent. Please Verify Your Email First.");
//       }
//     } catch (err) {
//       console.error("❌ Auth error:", err);
//        switch (err.code) {
//         case 'auth/invalid-email':
//           setError("❌ Invalid email format.");
//           break;
//         case 'auth/user-not-found':
//           setError("❌ No account found with this email.");
//           break;
//         case 'auth/wrong-password':
//           setError("❌ Incorrect password.");
//           break;
//         case 'auth/email-already-in-use':
//           setError("⚠️ This email is already registered.");
//           break;
//         case 'auth/weak-password':
//           setError("⚠️ Password must be at least 6 characters.");
//           break;
//         case 'auth/too-many-requests':
//           setError("⚠️ Too many login attempts. Please try again later.");
//           break;
//         default:
//           setError("⚠️ Something went wrong. Please try again.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         await user.reload(); // Always reload to get latest status
//         if (user.emailVerified) {
//           console.log("✅ User is logged in and verified:", user.email);
//         } else {
//           console.warn("⚠️ User is logged in but not verified.");
//         }
//       } else {
//         console.log("🔓 No user logged in.");
//       }
//     });

//     return () => unsubscribe(); // Cleanup
//   }, []);

//   return (
//      <div className="">
//       <div className="d-flex justify-content-center align-items-center p-1">
//         <button className="signin-button my-1" onClick={() => setFormVisible(formVisible ? false : true )}><FiMail style={{ marginRight: '10px', fontSize: '20px' }}/> Sign In With Email</button>
//       </div>
//         {formVisible && <div className='d-flex justify-content-center align-items-center'>
//           <div className="auth-container">
//             <div className="auth-card ">
//               <div className="auth-header">
//                 <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
//                 <p>{isLogin ? "Login to continue" : "Join us today"}</p>
//               </div>
//               <form onSubmit={handleSubmit} className="auth-form">
//                 <div className="input-group">
//                   <div className="input-icon">
//                     <FiMail />
//                   </div>
//                   <input
//                     type="email"
//                     placeholder="Email Address"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div className="input-group">
//                   <div className="input-icon">
//                     <FiLock />
//                   </div>
//                   <input
//                     type="password"
//                     placeholder="Password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                 </div>

//                 {!isLogin && (
//                   <div className="input-group">
//                     <div className="input-icon">
//                       <FiLock />
//                     </div>
//                     <input
//                       type="password"
//                       placeholder="Re-Enter Password"
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       required
//                     />
//                 </div>
//                 )}

//                 <button 
//                   type="submit" 
//                   className="auth-button"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? (
//                     <span className="spinner"></span>
//                   ) : (
//                     <>
//                       {isLogin ? (
//                         <>
//                           <FiLogIn className="button-icon" />
//                           Login
//                         </>
//                       ) : (
//                         <>
//                           <FiUserPlus className="button-icon" />
//                           Register
//                         </>
//                       )}
//                     </>
//                   )}
//                 </button>
//               </form>

//               {message && (
//                 <div className="auth-message success bg-dark">
//                   {message}
//                 </div>
//               )}

//               {error && (
//                 <div className="auth-message error bg-dark">
//                   {error}
//                   {setTimeout(() => setError("") , 7000)}
//                 </div>
//               )}

//               <div className="auth-footer">
//                 {isLogin ? (
//                   <p>
//                     Don't have an account?{" "}
//                     <button 
//                       className="auth-toggle" 
//                       onClick={() => setIsLogin(false)}
//                     >
//                       Sign up
//                     </button>
//                   </p>
//                 ) : (
//                   <p>
//                     Already have an account?{" "}
//                     <button 
//                       className="auth-toggle" 
//                       onClick={() => setIsLogin(true)}
//                     >
//                       Sign in
//                     </button>
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>}
//      </div>
//   );
// };

// export default EmailAuth;











import React, { useState, useEffect } from "react";
import {
  auth
} from "./FireBaseAuth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail  // Add this import
} from "firebase/auth";
import { FiMail, FiLock, FiUser, FiLogIn, FiUserPlus } from "react-icons/fi";
import "./SignInAuth.css"; 

const EmailAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);  // New state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
    
    if(!isLogin){
      if(password !== confirmPassword){
        setError("❌ Passwords do not match.");
        setIsLoading(false);
        return;
      }
    }
    try {
      if (isLogin && !showForgotPassword) {  // Modified this condition
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;

        await user.reload();

        if (user.emailVerified) {
          setMessage("Logged in successfully!");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setError("Please verify your email before logging in.");
          await signOut(auth);
        }
      } else if (showForgotPassword) {
        await sendPasswordResetEmail(auth, email, {
          url: 'http://localhost:3000/reset-password', 
          handleCodeInApp: false 
        });
        setMessage("Password reset email sent. Please check your inbox. If you don't see it, check your spam folder.");
        setShowForgotPassword(false);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        await sendEmailVerification(user, {
          url: 'http://localhost:3000/verify',
          handleCodeInApp: true
        });
        setMessage("Verification email sent. Please check your inbox. If you don't see it, check your spam folder. Please Verify Your Email First.");
      }
    } catch (err) {
      console.error("❌ Auth error:", err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError("❌ Invalid email format.");
          break;
        case 'auth/user-not-found':
          setError("❌ No account found with this email.");
          break;
        case 'auth/wrong-password':
          setError("❌ Incorrect password.");
          break;
        case 'auth/email-already-in-use':
          setError("⚠️ This email is already registered.");
          break;
        case 'auth/weak-password':
          setError("⚠️ Password must be at least 6 characters.");
          break;
        case 'auth/too-many-requests':
          setError("⚠️ Too many login attempts. Please try again later.");
          break;
        default:
          setError("⚠️ Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <div className="d-flex justify-content-center align-items-center p-1">
        <button className="signin-button my-1" onClick={() => setFormVisible(formVisible ? false : true)}>
          <FiMail style={{ marginRight: '10px', fontSize: '20px' }}/> Sign In With Email
        </button>
      </div>
      {formVisible && <div className='d-flex justify-content-center align-items-center'>
        <div className="auth-container">
          <div className="auth-card ">
            <div className="auth-header">
              <h2>
                {showForgotPassword ? "Reset Password" : 
                 isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p>
                {showForgotPassword ? "Enter your email to receive a reset link" : 
                 isLogin ? "Login to continue" : "Join us today"}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <div className="input-icon">
                  <FiMail />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {!showForgotPassword && (
                <>
                  <div className="input-group">
                    <div className="input-icon">
                      <FiLock />
                    </div>
                    <input
                      type="password"
                      placeholder={isLogin ? "Password" : "Create Password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {!isLogin && (
                    <div className="input-group">
                      <div className="input-icon">
                        <FiLock />
                      </div>
                      <input
                        type="password"
                        placeholder="Re-Enter Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </>
              )}

              <button 
                type="submit" 
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    {showForgotPassword ? (
                      "Send Reset Link"
                    ) : isLogin ? (
                      <>
                        <FiLogIn className="button-icon" />
                        Login
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="button-icon" />
                        Register
                      </>
                    )}
                  </>
                )}
              </button>
            </form>

            {isLogin && !showForgotPassword && (
              <div className="auth-footer">
                <button 
                  className="auth-toggle" 
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {showForgotPassword ? (
              <div className="auth-footer">
                <button 
                  className="auth-toggle" 
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to login
                </button>
              </div>
            ) : (
              <div className="auth-footer">
                {isLogin ? (
                  <p>
                    Don't have an account?{" "}
                    <button 
                      className="auth-toggle" 
                      onClick={() => setIsLogin(false)}
                    >
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button 
                      className="auth-toggle" 
                      onClick={() => setIsLogin(true)}
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            )}

            {message && (
              <div className="auth-message success">
                {message}
              </div>
            )}

            {error && (
              <div className="auth-message error">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>}
    </div>
  );
};

export default EmailAuth;