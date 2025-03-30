import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";

// ✅ Function to get user from localStorage
const getUserFromStorage = () => {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

function App() {
  const [user, setUser] = useState(getUserFromStorage());

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getUserFromStorage());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/:role" element={<LoginPage setUser={setUser} />} />

        {/* ✅ Protected Routes */}
        <Route
          path="/student-dashboard"
          element={user && user.role === "student" ? <StudentDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/driver-dashboard"
          element={user && user.role === "driver" ? <DriverDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/coordinator-dashboard"
          element={user && user.role === "coordinator" ? <CoordinatorDashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
