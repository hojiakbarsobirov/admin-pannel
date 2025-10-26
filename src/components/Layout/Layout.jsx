import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import NavbarPage from "../NavbarPage";
import Pages from "../Pages";

const Layout = ({ setIsLoggedIn }) => {
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(true); // 🔹 Sidebar holati (Pages bilan sinxron)

  return (
    <section className="h-auto flex flex-col bg-gray-50">
      {/* --- Navbar --- */}
      <NavbarPage setIsLoggedIn={setIsLoggedIn} />

      {/* --- Asosiy tarkib --- */}
      <div className="flex flex-1">
        {/* Chapdagi sidebar (faqat katta ekranlarda) */}
        <aside
          className={`hidden sm:block h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 w-auto`}
        >
          <Pages
            desktopMenuOpen={desktopMenuOpen}
            setDesktopMenuOpen={setDesktopMenuOpen}
          />
        </aside>

        {/* O‘ngdagi asosiy kontent */}
        <main className="flex-1 bg-gray-50 h-[calc(100vh-4rem)] overflow-y-auto p-4 transition-all duration-300">
          <Outlet />
        </main>
      </div>

      {/* Pastki menyu (faqat mobil qurilmalarda) */}
      <div className="sm:hidden border-t border-gray-200">
        <Pages />
      </div>
    </section>
  );
};

export default Layout;
