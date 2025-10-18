import React from "react";

const NavbarPage = () => {
  return (
    <>
      <nav className="bg-blue-500 w-full h-16 flex justify-between items-center px-4 sm:px-8">
        {/* Chap tarafdagi logo */}
        {/* <h3 className="text-white font-semibold text-lg sm:text-xl">
          RuSpeak.uz
        </h3> */}

        {/* O‘rta qism (faqat o‘rta va katta ekranlarda ko‘rinadi) */}
        <h2 className="hidden sm:block font-medium text-white text-base">
          Admin Panel
        </h2>

        {/* O‘ng tarafdagi log-out tugma */}
        <button className="border border-white text-white text-sm rounded-md px-3 py-1 hover:bg-white hover:text-blue-600 transition ease-in-out duration-200">
          Log-Out
        </button>
      </nav>

      {/* Mobil ekranlarda Admin Panel yozuvi alohida chiqadi */}
      <div className="sm:hidden w-full bg-blue-500 text-center py-2 border-t border-white/30">
        <h2 className="text-white text-sm font-medium">Admin Panel</h2>
      </div>
    </>
  );
};

export default NavbarPage;
