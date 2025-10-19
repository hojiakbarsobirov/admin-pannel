// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage";
import AllUsersPage from "./pages/AllUsersPage";
import DeletedUsersPage from "./pages/DeletedUsersPage";
import FeedBackPage from "./pages/FeedBackPage";
import StatistikaPage from "./pages/StatistikaPage";
import AdminPage from "./pages/AdminPage";
import ManagerPage from "./pages/ManagerPage";
import FinancePage from "./pages/FinancePage";
import LoginPage from "./pages/LoginPage";

const App = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("role");

    if (loggedIn === "true") {
      setIsLoggedIn(true);
      setRole(userRole);
    } else {
      setIsLoggedIn(false);
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Routes>
      {/* 🔐 Login sahifasi */}
      <Route
        path="/login"
        element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
      />

      {/* 🔧 Asosiy Layout */}
      <Route element={<Layout setIsLoggedIn={setIsLoggedIn} />}>
        {/* 🏠 Barcha foydalanuvchilar uchun (admin & manager) */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <HomePage />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

        <Route
          path="/all-users"
          element={
            isLoggedIn ? (
              <AllUsersPage />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

        <Route
          path="/deleted-users"
          element={
            isLoggedIn ? (
              <DeletedUsersPage />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

        <Route
          path="/feedback"
          element={
            isLoggedIn ? (
              <FeedBackPage />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

        {/* 📊 Statistika — FAQAT menejer uchun */}
        <Route
          path="/statistika"
          element={
            isLoggedIn && role === "manager" ? (
              <StatistikaPage />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

        {/* 💰 Finance — admin va menejer uchun */}
        <Route
          path="/finance"
          element={
            isLoggedIn && (role === "admin" || role === "manager") ? (
              <FinancePage />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

        {/* 👑 Admin sahifasi — faqat admin uchun */}
        <Route
          path="/admin-page"
          element={<AdminPage/>}
        />

        {/* 🧑‍💼 Menejer sahifasi — faqat menejer uchun */}
        <Route
          path="/manager-page"
          element={
            isLoggedIn && role === "manager" ? (
              <ManagerPage />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />
      </Route>
    </Routes>
  );
};

export default App;
