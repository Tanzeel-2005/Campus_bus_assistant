import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const LoginPage = ({ setUser }) => { // ✅ Accept setUser as a prop
  const { role } = useParams(); // Get role from URL
  const navigate = useNavigate(); // Initialize navigation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      console.log("🚀 Login response from backend:", data);
  
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
  
      // ✅ Store user in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
  
      // ✅ Update global user state
      setUser(data.user);
  
      console.log("✅ Updated user state:", data.user);
  
      // ✅ Redirect based on role
      if (data.user?.role === "student") navigate("/student-dashboard");
      else if (data.user?.role === "driver") navigate("/driver-dashboard");
      else if (data.user?.role === "coordinator") navigate("/coordinator-dashboard");
      else navigate("/");
      
    } catch (error) {
      console.error("❌ Login error:", error.message);
      setError(error.message);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 text-white">
      <div className="relative z-10 w-96 p-8 bg-gradient-to-r shadow-xl rounded-3xl flex flex-col items-center from-black/30 to-black/50 backdrop-blur-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-200 drop-shadow-lg">{role.toUpperCase()} Login</h2>

        <input 
          type="text" 
          id="email" 
          name="email" 
          placeholder="Email or Phone" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-black/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />

        <input 
          type="password" 
          id="password" 
          name="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 bg-black/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        
        {error && <p className="text-red-500">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginPage;