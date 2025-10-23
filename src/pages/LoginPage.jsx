// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserShield, FaLock } from "react-icons/fa";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const LoginPage = ({ setIsLoggedIn }) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🔹 Menejer
      if (login === "Boss123" && password === "Bigboss123") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", "manager");
        if (setIsLoggedIn) setIsLoggedIn(true);
        navigate("/admin-page");
        return;
      }

      // 🔹 Firestore’dagi adminlarni tekshirish
      const adminsSnap = await getDocs(collection(db, "admins"));
      const admins = adminsSnap.docs.map((d) => d.data());
      const admin = admins.find(
        (a) => a.login === login && a.password === password
      );

      if (admin) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", "admin");
        localStorage.setItem("currentAdmin", login);
        navigate("/");
        return;
      }

      // 🔹 Firestore’dagi teacherlarni tekshirish
      const teachersSnap = await getDocs(collection(db, "teachers"));
      const teachers = teachersSnap.docs.map((d) => d.data());
      const teacher = teachers.find(
        (t) => t.login === login && t.password === password
      );

      if (teacher) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", "teacher");
        localStorage.setItem("currentTeacher", login);
        navigate("/teachers");
        return;
      }

      setError("❌ Login yoki parol noto‘g‘ri");
    } catch (err) {
      console.error("❌ Kirishda xatolik:", err);
      setError("Server bilan bog‘lanishda xatolik yuz berdi.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 p-4">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[400px] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-6 text-center"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg mb-3">
            <FaUserShield size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Tizimga kirish
          </h2>
          <p className="text-gray-300 text-sm mt-2">
            Login va parolni kiriting
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative">
            <FaUserShield className="absolute top-3.5 left-3 text-blue-400 text-lg" />
            <input
              type="text"
              placeholder="Login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute top-3.5 left-3 text-blue-400 text-lg" />
            <input
              type="password"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="mt-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg font-semibold shadow-md transition-all duration-300"
          >
            Tizimga kirish
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
