import React , { useState } from 'react'
import { googleAuthProvider , auth } from './FireBaseAuth';
import { GoogleAuthProvider , signInWithPopup } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import Loading from '../Room/Loading/Loading'
import './SignInAuth.css';


export default function GoogleAuth({onSuccess , onError }) {

    const [GLoading , setGLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleGoogleSignIn = async() => {
        try{
            setGLoading(true)
            const result = await signInWithPopup(auth , googleAuthProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user

            if(onSuccess) {
              onSuccess({
                user,
                token,
                provider: 'google'
              })
              setMessage("Successfully Sign In");
              setError("");
            }
        }catch(error){
          console.error("Google sign-in error:", error);
            switch (error.code) {
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
          if(onError) {
            onError({
              code:error.code,
              message:error.message,
              email:error.customData?.email,
              credential: GoogleAuthProvider.credentialFromError(error)
            })
          }
        }finally{
          setGLoading(false)
        }
    }

  return (
    <div className='GoogleSign'>
      <div className='d-flex justify-content-center align-items-center'>
        <div className=''>
            <div className='p-1'>
                <button onClick={handleGoogleSignIn} className='signin-button my-1'>
                  {GLoading ? (
                    <Loading/>
                    ) : (
                      <>
                        <FcGoogle style={{ marginRight: '10px', fontSize: '20px' }} />
                        Sign in with Google
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
