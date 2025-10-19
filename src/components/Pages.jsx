import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaComments,
  FaTrash,
  FaChartPie,
  FaUserTie,
  FaBars,
  FaMoneyBillWave,
} from "react-icons/fa";

const Pages = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const userRole = localStorage.getItem("role"); // "admin" yoki "manager"

  // 🔹 Umumiy menyular (barchada bo‘ladi)
  const commonLinks = [
    { to: "/", label: "Leads" },
    { to: "/feedback", label: "Qayta A'loqa" },
    { to: "/deleted-users", label: "O‘chirilgan mijozlar" },
    { to: "/finance", label: "Moliyaviy boshqaruv" },
    { to: "/admin-page", label: "Admin Panel" },
  ];

  // 🔹 Faqat menejerda ko‘rinadigan sahifalar
  const managerOnlyLinks = [
    { to: "/statistika", label: "Statistika" },
    { to: "/manager-page", label: "Menejer Sahifasi" },
  ];

  // 🔹 Agar menejer bo‘lsa — hammasini qo‘shamiz
  // 🔹 Agar admin bo‘lsa — menejerga xoslarini qo‘shmaymiz
  const links =
    userRole === "manager"
      ? [...commonLinks, ...managerOnlyLinks]
      : commonLinks;

  return (
    <>
      {/* --- CHAP SIDEBAR (desktop uchun) --- */}
      <section className="hidden sm:flex flex-col justify-start items-start py-5 px-2 w-60">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `w-full h-10 flex items-center px-2 rounded-md border-b transition ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "hover:bg-blue-500 hover:text-white"
              }`
            }
          >
            <h4 className="text-sm">{item.label}</h4>
          </NavLink>
        ))}
      </section>

      {/* --- MOBIL PASTKI MENYU --- */}
      <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around items-center py-2 z-50">
        {/* Home */}
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

        {/* Feedback */}
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

        {/* Deleted */}
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

        {/* Finance */}
        <NavLink
          to="/finance"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-blue-500" : "text-gray-500"
            }`
          }
        >
          <FaMoneyBillWave size={20} />
          <span className="text-[10px]">Finance</span>
        </NavLink>

        {/* --- Faqat manager uchun --- */}
        {userRole === "manager" && (
          <>
            <NavLink
              to="/statistika"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive ? "text-blue-500" : "text-gray-500"
                }`
              }
            >
              <FaChartPie size={20} />
              <span className="text-[10px]">Statistika</span>
            </NavLink>

            <NavLink
              to="/manager-page"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive ? "text-blue-500" : "text-gray-500"
                }`
              }
            >
              <FaUserTie size={20} />
              <span className="text-[10px]">Manager</span>
            </NavLink>
          </>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col items-center text-xs text-gray-500"
        >
          <FaBars size={20} />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>
    </>
  );
};

export default Pages;
