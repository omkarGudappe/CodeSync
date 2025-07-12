import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import EditorPage from "./Room/Pages/EditorPage";
import HomePage from "./Room/Pages/HomePage";
import { SignInProvider } from './Room/Pages/SignInContext'
import EmailVerificationHandler from './Auth/EmailVerificationHandler'
import PasswordResetHandler from './Auth/PasswordResetHandler'
import LandingPage from './Room/LandingPage/LandingPage'

function App() {
  return (
    <Router>
      <SignInProvider>
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/HomePage" element={<HomePage />} />
          <Route path="/editor/:roomId" element={<EditorPage/>} />
          <Route path='/verify' element={<EmailVerificationHandler/>} />
          <Route path="/reset-password" element={<PasswordResetHandler />} />
        </Routes>
      </SignInProvider>
    </Router>
  );
}

export default App;