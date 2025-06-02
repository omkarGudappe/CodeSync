import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EditorPage from "./Room/EditorPage";
import HomePage from "./Room/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor/:roomId" element={<EditorPage/>} />
      </Routes>
    </Router>
  );
}

export default App;