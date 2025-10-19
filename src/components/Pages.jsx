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
    { to: "/", label: "Leads", icon: <FaHome size={20} /> },
    { to: "/feedback", label: "Qayta A'loqa", icon: <FaComments size={20} /> },
    { to: "/deleted-users", label: "O‘chirilgan mijozlar", icon: <FaTrash size={20} /> },
    { to: "/finance", label: "Moliyaviy boshqaruv", icon: <FaMoneyBillWave size={20} /> },
  ];

  // 🔹 Faqat menejer/admin uchun sahifalar
  const roleLinks = [
    { to: "/admin-page", label: "Admin", icon: <FaUserTie size={20} /> },
    ...(userRole === "manager"
      ? [
          { to: "/statistika", label: "Statistika", icon: <FaChartPie size={20} /> },
          { to: "/manager-page", label: "Menejer Sahifasi", icon: <FaUserTie size={20} /> },
        ]
      : []),
  ];

  return (
    <>
      {/* --- CHAP SIDEBAR (desktop uchun) --- */}
      <section className="hidden sm:flex flex-col justify-start items-start py-5 px-2 w-60">
        {[...commonLinks, ...roleLinks].map((item) => (
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
        {/* Asosiy sahifalar */}
        {commonLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs min-w-[50px] ${
                isActive ? "text-blue-500" : "text-gray-500"
              }`
            }
          >
            {item.icon}
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}

        {/* Menu tugmasi */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col items-center text-xs text-gray-500 min-w-[50px]"
          >
            <FaBars size={20} />
            <span className="text-[10px]">Menu</span>
          </button>

          {/* Drop-down menyu (faqat manager/admin sahifalari) */}
          {menuOpen && (
            <div className="absolute bottom-12 right-0 bg-white border rounded shadow-lg w-44 py-2 z-50">
              {roleLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-sm transition hover:bg-blue-500 hover:text-white ${
                      isActive ? "bg-blue-500 text-white" : "text-gray-700"
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Pages;
