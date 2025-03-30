import { Link } from "react-router-dom";
import NavBar from "../components/NavBar"; // Importing the Navbar

const LandingPage = () => {
  return (
    <div 
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 text-white"
    >
      {/* Navbar */}
      <NavBar />

      {/* Decorative Glow */}
      <div className="absolute w-96 h-96 bg-purple-400 opacity-20 rounded-full blur-3xl top-10 left-20"></div>
      <div className="absolute w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-3xl bottom-10 right-20"></div>

      {/* Main Content */}
      <div className="relative z-10 text-center mt-20"> {/* Adjusted margin for navbar */}
        <h1 className="text-5xl font-extrabold tracking-wide mb-6 text-gray-200 drop-shadow-lg">
          Campus Bus Assistant
        </h1>

        <p className="text-lg text-gray-300 max-w-xl mx-auto mb-12">
          A seamless and intelligent bus management system for students, drivers, and coordinators.
        </p>
        
        {/* Login Cards */}
        <nav aria-label="Login options">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { role: "Student", color: "from-blue-500 to-purple-500" },
              { role: "Driver", color: "from-green-500 to-teal-500" },
              { role: "Coordinator", color: "from-yellow-500 to-orange-500" },
            ].map(({ role, color }, index) => (
              <Link 
                key={index}
                to={`/login/${role.toLowerCase()}`} 
                className={`relative w-64 h-40 bg-gradient-to-r ${color} p-1 rounded-2xl shadow-lg transition-transform transform hover:scale-105 hover:rotate-1`}
              >
                {/* Glass Effect */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-100 font-semibold text-xl transition-all duration-300 hover:bg-black/20">
                  {role} Login
                </div>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default LandingPage;