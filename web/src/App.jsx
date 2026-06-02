import { Routes, Route, Navigate } from "react-router-dom";
import Menu from "./components/Menu.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Reportar from "./pages/Reportar.jsx"; // Dry e Ale
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <Menu />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reportar" element={<Reportar />} /> 
        </Routes>
      </div>
    </div>
  );
}

export default App;