import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ReceiptPage from "./components/ReceiptPage";
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/receipts/:yearMonth" element={<ReceiptPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;