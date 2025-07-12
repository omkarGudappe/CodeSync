// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider , getAuth , GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQTXFIqaYc_Cj-ak4Wa6CFL1TMx3lPBHU",
  authDomain: "cce-2800.firebaseapp.com",
  projectId: "cce-2800",
  storageBucket: "cce-2800.firebasestorage.app",
  messagingSenderId: "957223625099",
  appId: "1:957223625099:web:52a9d8460c38d9bd064f8e",
  measurementId: "G-V4SXGYBLHF"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider();
const gitHubAuthProvider = new GithubAuthProvider();
const db = getFirestore(app);
googleAuthProvider.addScope('profile');

export { auth , googleAuthProvider , db , gitHubAuthProvider };