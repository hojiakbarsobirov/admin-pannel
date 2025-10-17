import React from "react";
import { Outlet } from "react-router-dom";
import NavbarPage from "../NavbarPage";
import Pages from "../Pages";

const Layout = () => {
  return (
    <section className="w-full min-h-screen flex flex-col bg-gray-50">
      {/* --- Navbar --- */}
      <NavbarPage />

      {/* --- Asosiy tarkib --- */}
      <div className="flex flex-1">
        {/* Chapdagi sidebar (faqat katta ekranlarda) */}
        <aside className="hidden sm:block w-[20%] bg-gray-100 h-[calc(100vh-4rem)] overflow-y-auto">
          <Pages />
        </aside>

        {/* O‘ngdagi asosiy kontent */}
        <main className="flex-1 bg-gray-50 h-[calc(100vh-4rem)] overflow-y-auto p-3">
          <Outlet />
        </main>
      </div>

      {/* Pastki menyu (faqat mobil qurilmalarda) */}
      <div className="sm:hidden">
        <Pages />
      </div>
    </section>
  );
};

export default Layout;
