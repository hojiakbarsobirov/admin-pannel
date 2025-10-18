import React from "react";
import { useNavigate } from "react-router-dom";

const NavbarPage = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <>
      <nav className="bg-blue-500 w-full h-16 flex justify-between items-center px-4 sm:px-8">
        {/* Logo */}
        <h3 className="text-white font-semibold text-lg sm:text-xl">
          RuSpeak.uz
        </h3>

        {/* Markazdagi matn */}
        <h2 className="hidden sm:block font-medium text-white text-base">
          Admin Panel
        </h2>

        {/* Log-Out tugmasi */}
        <button
          onClick={handleLogout}
          className="border border-white text-white text-sm rounded-md px-3 py-1 hover:bg-white hover:text-blue-600 transition ease-in-out duration-200"
        >
          Log-Out
        </button>
      </nav>

      {/* Mobil uchun */}
      <div className="sm:hidden w-full bg-blue-500 text-center py-2 border-t border-white/30">
        <h2 className="text-white text-sm font-medium">Admin Panel</h2>
      </div>
    </>
  );
};

export default NavbarPage;
