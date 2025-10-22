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
  FaChalkboardTeacher,
  FaUsers,
  FaLayerGroup,
} from "react-icons/fa";

const Pages = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(true);
  const userRole = localStorage.getItem("role"); // "admin", "manager", yoki "teacher"

  // 🔹 Barcha foydalanuvchilar uchun umumiy sahifalar
  const commonLinks = [
    { to: "/", label: "Leads", labelEn: "Leads", icon: <FaHome size={20} /> },
    {
      to: "/feedback",
      label: "Qayta A'loqa",
      labelEn: "Feedback",
      icon: <FaComments size={20} />,
    },
    {
      to: "/deleted-users",
      label: "O'chirilgan mijozlar",
      labelEn: "Deleted",
      icon: <FaTrash size={20} />,
    },
    {
      to: "/finance",
      label: "Moliyaviy boshqaruv",
      labelEn: "Finance",
      icon: <FaMoneyBillWave size={20} />,
    },
  ];

  // 🔹 Foydalanuvchi roliga qarab qo‘shimcha sahifalar
  let roleLinks = [];

  if (userRole === "manager") {
    roleLinks = [
      {
        to: "/admin-page",
        label: "Admin",
        labelEn: "Admin",
        icon: <FaUserTie size={20} />, // faqat menejerga ko'rinadi
      },
      {
        to: "/statistika",
        label: "Statistika",
        labelEn: "Statistics",
        icon: <FaChartPie size={20} />,
      },
      {
        to: "/manager-page",
        label: "Menejer Sahifasi",
        labelEn: "Manager Page",
        icon: <FaUsers size={20} />,
      },
      {
        to: "/create-group",
        label: "Guruh yaratish",
        labelEn: "Create Group",
        icon: <FaLayerGroup size={20} />,
      },
    ];
  } else if (userRole === "admin") {
    // 🔸 Adminlar endi admin sahifasini KO‘RISHMAYDI
    // 🔸 Teachers sahifasi ham yo‘q
    roleLinks = [
      {
        to: "/create-group",
        label: "Guruh yaratish",
        labelEn: "Create Group",
        icon: <FaLayerGroup size={20} />,
      },
      {
        to: "/statistika",
        label: "Statistika",
        labelEn: "Statistics",
        icon: <FaChartPie size={20} />,
      },
    ];
  } else if (userRole === "teacher") {
    // 🔸 Teacher uchun faqat o‘qituvchilar sahifasi
    roleLinks = [
      {
        to: "/teachers",
        label: "O‘qituvchilar",
        labelEn: "Teachers",
        icon: <FaChalkboardTeacher size={20} />,
      },
    ];
  }

  return (
    <>
      {/* --- CHAP SIDEBAR (desktop uchun) --- */}
      <section
        className={`hidden sm:flex flex-col justify-start py-5 px-2 bg-white border-r transition-all duration-300 ${
          desktopMenuOpen ? "w-60" : "w-16"
        }`}
      >
        {/* 🔘 Menyu tugmasi */}
        <button
          onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
          className="flex items-center gap-2 mb-4 px-2 text-gray-700 hover:text-blue-500 transition"
        >
          <FaBars size={20} />
          {desktopMenuOpen && <span className="text-sm font-medium">Menyu</span>}
        </button>

        {/* 🔹 Teacher uchun faqat o‘zining sahifasi */}
        {userRole === "teacher"
          ? roleLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `w-full h-10 flex items-center gap-3 px-2 rounded-md border-b transition ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "hover:bg-blue-500 hover:text-white"
                  }`
                }
              >
                {item.icon}
                {desktopMenuOpen && <h4 className="text-sm">{item.label}</h4>}
              </NavLink>
            ))
          : [...commonLinks, ...roleLinks].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `w-full h-10 flex items-center gap-3 px-2 rounded-md border-b transition ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "hover:bg-blue-500 hover:text-white"
                  }`
                }
              >
                {item.icon}
                {desktopMenuOpen && <h4 className="text-sm">{item.label}</h4>}
              </NavLink>
            ))}
      </section>

      {/* --- MOBIL PASTKI MENYU --- */}
      <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around items-center py-2 z-50">
        {/* Teacher uchun faqat Teachers sahifasi */}
        {userRole === "teacher"
          ? roleLinks.map((item) => (
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
                <span className="text-[10px]">{item.labelEn}</span>
              </NavLink>
            ))
          : commonLinks.map((item) => (
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
                <span className="text-[10px]">{item.labelEn}</span>
              </NavLink>
            ))}

        {/* Menu tugmasi */}
        {userRole !== "teacher" && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col items-center text-xs text-gray-500 min-w-[50px]"
            >
              <FaBars size={20} />
              <span className="text-[10px]">Menu</span>
            </button>

            {/* Drop-down menyu */}
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
                    {item.labelEn}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Pages;
