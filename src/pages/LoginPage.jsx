import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserShield, FaLock } from "react-icons/fa";

const LoginPage = ({ setIsLoggedIn }) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (login === "Boss123" && password === "Bigboss123") {
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      navigate("/");
    } else {
      setError("❌ Login yoki parol noto‘g‘ri");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 p-4 sm:p-6 md:p-8">
      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[400px] sm:max-w-[420px] md:max-w-[450px] 
                   bg-white/10 sm:bg-white/15 md:bg-white/10 
                   backdrop-blur-2xl border border-white/20 
                   shadow-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 
                   text-center"
      >
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl shadow-lg mb-3">
            <FaUserShield size={28} className="sm:text-[32px]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
            Admin Login
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm mt-2">
            Tizimga kirish uchun ma’lumotlarni kiriting
          </p>
        </div>

        {/* INPUTLAR */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative">
            <FaUserShield className="absolute top-3.5 left-3 text-blue-400 text-lg sm:text-xl" />
            <input
              type="text"
              placeholder="Login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full pl-10 pr-3 py-2 sm:py-2.5 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-sm sm:text-base"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute top-3.5 left-3 text-blue-400 text-lg sm:text-xl" />
            <input
              type="password"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 sm:py-2.5 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-sm sm:text-base"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs sm:text-sm mt-1"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="mt-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white py-2.5 rounded-lg font-semibold shadow-md transition-all duration-300 text-sm sm:text-base"
          >
            Tizimga kirish
          </motion.button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-gray-300 text-[10px] sm:text-xs">
          © 2025{" "}
          <span className="text-white font-semibold">AdminPanel.uz</span>
          <br />
          Maxfiylik saqlanadi 🔒
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
