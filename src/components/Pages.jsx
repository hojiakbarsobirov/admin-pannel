import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaSearch, FaUserAlt, FaChartPie, FaTrash, FaComments } from "react-icons/fa";

const Pages = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <section
        className={`hidden sm:flex flex-col justify-start items-start py-5 px-2 w-60`}
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `w-full h-10 flex items-center px-2 rounded-md border-b transition ${
              isActive
                ? "bg-blue-500 text-white"
                : "hover:bg-blue-500 hover:text-white"
            }`
          }
        >
          <h4 className="text-sm">Barcha Mijozlar</h4>
        </NavLink>

        <NavLink
          to="/feedback"
          className={({ isActive }) =>
            `w-full h-10 flex items-center px-2 rounded-md border-b transition ${
              isActive
                ? "bg-blue-500 text-white"
                : "hover:bg-blue-500 hover:text-white"
            }`
          }
        >
          <h4 className="text-sm">Qayta A'loqa</h4>
        </NavLink>

        <NavLink
          to="/deleted-users"
          className={({ isActive }) =>
            `w-full h-10 flex items-center px-2 rounded-md border-b transition ${
              isActive
                ? "bg-blue-500 text-white"
                : "hover:bg-blue-500 hover:text-white"
            }`
          }
        >
          <h4 className="text-sm">O'chirilgan mijozlar</h4>
        </NavLink>

        <NavLink
          to="/statistika"
          className={({ isActive }) =>
            `w-full h-10 flex items-center px-2 rounded-md border-b transition ${
              isActive
                ? "bg-blue-500 text-white"
                : "hover:bg-blue-500 hover:text-white"
            }`
          }
        >
          <h4 className="text-sm">Statistika</h4>
        </NavLink>

        <NavLink
          to="/admin-page"
          className={({ isActive }) =>
            `w-full h-10 flex items-center px-2 rounded-md border-b transition ${
              isActive
                ? "bg-blue-500 text-white"
                : "hover:bg-blue-500 hover:text-white"
            }`
          }
        >
          <h4 className="text-sm">Admin</h4>
        </NavLink>
      </section>

      {/* --- MOBIL PASTKI MENYU (Instagram uslubi) --- */}
      <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around items-center py-2 z-50">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-blue-500" : "text-gray-500"
            }`
          }
        >
          <FaHome size={20} />
          <span className="text-[10px]">Home</span>
        </NavLink>

        <NavLink
          to="/feedback"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-blue-500" : "text-gray-500"
            }`
          }
        >
          <FaComments size={20} />
          <span className="text-[10px]">Feedback</span>
        </NavLink>

        <NavLink
          to="/deleted-users"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-blue-500" : "text-gray-500"
            }`
          }
        >
          <FaTrash size={20} />
          <span className="text-[10px]">Deleted</span>
        </NavLink>

        <NavLink
          to="/statistika"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-blue-500" : "text-gray-500"
            }`
          }
        >
          <FaChartPie size={20} />
          <span className="text-[10px]">Stats</span>
        </NavLink>

        <NavLink
          to="/admin-page"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-blue-500" : "text-gray-500"
            }`
          }
        >
          <FaUserAlt size={20} />
          <span className="text-[10px]">Admin</span>
        </NavLink>
      </nav>
    </>
  );
};

export default Pages;
