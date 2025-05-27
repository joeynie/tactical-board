import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import TacticalBoard from "./pages/TacticalBoard";
import Schedule from "./pages/Schedule";
import Live from "./pages/Live";
import Data from "./pages/Data";


function App() {
  return (
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<TacticalBoard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/live" element={<Live />} />
          <Route path="/data" element={<Data />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;