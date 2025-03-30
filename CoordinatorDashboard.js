import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")); // Retrieve user from localStorage

  // Check role on component mount
  useEffect(() => {
    if (!user || user.role !== "coordinator") {
      navigate("/"); // Redirect to home if not a student
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-900 to-orange-900 text-white">
      <div className="w-96 bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg text-center">
        <h1 className="text-3xl font-bold">Welcome, Coordinator!</h1>
        <p className="text-gray-300 mt-2">Manage and monitor bus operations here.</p>

        <div className="mt-6 space-y-4">
          <Link to="/bus-status" className="block w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            Monitor Bus Status
          </Link>
          <Link to="/view-complaints" className="block w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg">
            View Complaints
          </Link>
        </div>

        <button onClick={handleLogout} className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">
          Logout
        </button>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;