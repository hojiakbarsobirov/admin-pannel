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
import TeacherPage from "./pages/TeacherPage";
import CreateGroupPage from "./pages/CreateGroupPage";
import StudentsPage from "./pages/StudentsPage"; // 🔹 Import qilindi

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
        {/* 🏠 HomePage */}
        <Route
          path="/"
          element={isLoggedIn ? <HomePage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* All users */}
        <Route
          path="/all-users"
          element={isLoggedIn ? <AllUsersPage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Deleted users */}
        <Route
          path="/deleted-users"
          element={isLoggedIn ? <DeletedUsersPage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Feedback */}
        <Route
          path="/feedback"
          element={isLoggedIn ? <FeedBackPage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Statistika — faqat manager */}
        <Route
          path="/statistika"
          element={isLoggedIn && role === "manager" ? <StatistikaPage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Finance — admin va manager */}
        <Route
          path="/finance"
          element={isLoggedIn && (role === "admin" || role === "manager") ? <FinancePage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Admin Page */}
        <Route
          path="/admin-page"
          element={isLoggedIn ? <AdminPage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Manager Page */}
        <Route
          path="/manager-page"
          element={isLoggedIn && role === "manager" ? <ManagerPage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Teachers Page */}
        <Route
          path="/teachers"
          element={isLoggedIn ? <TeacherPage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* 🔹 CreateGroupPage — faqat admin va manager */}
        <Route
          path="/create-group"
          element={isLoggedIn && (role === "admin" || role === "manager") ? <CreateGroupPage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* 🔹 StudentsPage — faqat admin va manager */}
        <Route
          path="/students/:groupId"
          element={isLoggedIn && (role === "admin" || role === "manager") ? <StudentsPage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />
      </Route>
    </Routes>
  );
};

export default App;
