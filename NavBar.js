import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-white/10 backdrop-blur-md shadow-md text-white z-50">
      {/* Logo */}
      <h1 className="text-2xl font-extrabold tracking-wide text-gray-200">
        Campus Bus Assistant
      </h1>

      {/* Navigation Links */}
      <div className="flex space-x-6 text-lg font-medium">
        <Link to="/" className="hover:text-blue-300 transition">Home</Link>
        <Link to="/about" className="hover:text-blue-300 transition">About</Link>
        <Link to="/contact" className="hover:text-blue-300 transition">Contact</Link>
      </div>
    </nav>
  );
};

export default NavBar;