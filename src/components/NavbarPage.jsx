import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NavbarPage = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-blue-500 w-full h-16 flex justify-between items-center px-4 sm:px-8">
        {/* Logo */}
        <h3 className="text-white font-semibold text-lg sm:text-xl">
          RuSpeak.uz
        </h3>

        {/* Markazdagi matn */}
        <h2 className="hidden sm:block font-medium text-white text-base">
          Admin Panel
        </h2>

        {/* Tugmalar */}
        <div className="flex items-center gap-2">
          {/* Yangilash tugmasi */}
          <button
            onClick={handleRefresh}
            className="border border-white text-white text-sm rounded-md px-3 py-1 hover:bg-white hover:text-blue-600 transition ease-in-out duration-200"
          >
            Yangilash
          </button>

          {/* Chiqish tugmasi */}
          <button
            onClick={() => setShowModal(true)}
            className="border border-white text-white text-sm rounded-md px-3 py-1 hover:bg-white hover:text-blue-600 transition ease-in-out duration-200"
          >
            Chiqish
          </button>
        </div>
      </nav>

      {/* Mobil uchun pastdagi matn */}
      <div className="sm:hidden w-full bg-blue-500 text-center py-2 border-t border-white/30">
        <h2 className="text-white text-sm font-medium">Admin Panel</h2>
      </div>

      {/* Modal oyna */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-sm rounded-xl shadow-lg p-5 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Chiqmoqchimisiz?
            </h3>
            <p className="text-gray-600 mb-5 text-sm">
              Siz tizimdan chiqmoqchisiz. Tasdiqlaysizmi?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
              >
                Ha, chiqaman
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="border border-gray-400 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarPage;
