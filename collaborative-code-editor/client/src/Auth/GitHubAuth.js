import React , { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth , gitHubAuthProvider } from './FireBaseAuth';
import { FaGithub } from "react-icons/fa";
import './SignInAuth.css'
import Loading from '../Room/Loading/Loading'

export default function GitHubAuth({onSuccess , onError }) {

    const [GLoading , setGLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleGitHubSignIn = async() => {
        setMessage("");
        setError("");
        try{
            setGLoading(true)
            const result = await signInWithPopup(auth , gitHubAuthProvider);
            const user = result.user;
            console.log("✅ Signed in with GitHub:", user);

            if(onSuccess){
                setMessage("Successfully Sign In");
                setError("");
                onSuccess(user)
            }
        }catch(err){
            switch (err.code) {
                case "auth/popup-closed-by-user":
                setError("⚠️ You closed the sign-in popup.");
                break;
                case "auth/cancelled-popup-request":
                setError("⚠️ Another popup was already open.");
                break;
                case "auth/account-exists-with-different-credential":
                setError("⚠️ This email is already registered with another provider. Please sign in using that.");
                break;
                case "auth/operation-not-allowed":
                setError("⚠️ This sign-in method is not enabled.");
                break;
                case "auth/unauthorized-domain":
                setError("⚠️ Your app's domain is not authorized in Firebase settings.");
                break;
                case "auth/network-request-failed":
                setError("❌ Network error. Please check your internet connection.");
                break;
                case "auth/internal-error":
                case "auth/unknown":
                setError("⚠️ Something went wrong. Please try again.");
                break;
                default:
                setError("⚠️ Sign-in failed: " + error.message);
            }
        }finally{
            setGLoading(false)
        }
    }

  return (
    <div className='GitHubSign'>
        <div className='d-flex justify-content-center align-items-center'>
            <div className=''>
                <div className='p-1'>
                    <button onClick={handleGitHubSignIn} className='signin-button my-1'>
                    {GLoading ? (
                        <Loading/>
                        ) : (
                        <>
                            <FaGithub style={{ marginRight: '10px', fontSize: '20px' }} />
                            Sign in with GitHub
                        </>
                        )}
                    </button>
                </div>
            </div>
        </div>
        {message && (
            <div className="auth-message success bg-dark">
            {message}
            </div>
        )}

        {error && (
            <div className="auth-message error bg-dark">
            {error}
            {setTimeout(() => setError("") , 7000)}
            </div>
        )}
    </div>
  )
}
