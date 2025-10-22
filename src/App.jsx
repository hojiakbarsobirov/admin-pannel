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
import StudentsPage from "./pages/CreateGroup";
import SingleStudentsPage from "./pages/SingleStudentsPage"; // 🔹 Yangi sahifa import qilindi

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

        <Route
          path="/admin-page"
          element={
            isLoggedIn ? (
              <AdminPage />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

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

        {/* 🔹 O‘qituvchi sahifasi */}
        <Route
          path="/teachers"
          element={
            isLoggedIn && role === "teacher" ? (
              <TeacherPage />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

        {/* 🔹 Guruh yaratish sahifasi */}
        <Route
          path="/create-group"
          element={
            isLoggedIn && (role === "admin" || role === "manager") ? (
              <CreateGroupPage />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

        {/* ✅ O‘qituvchi uchun guruhlar sahifasi */}
        <Route
          path="/teacher/:teacherId"
          element={
            isLoggedIn && (role === "admin" || role === "manager") ? (
              <StudentsPage />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

        {/* ✅ O‘qituvchining guruh ichidagi o‘quvchilari sahifasi */}
        <Route
          path="/teacher/:teacherId/group/:groupId"
          element={
            isLoggedIn && role === "teacher" ? (
              <SingleStudentsPage />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

        {/* ✅ Guruh ichidagi o‘quvchilar sahifasi (admin/manager uchun) */}
        <Route
          path="/groups/:teacherId/:groupId"
          element={
            isLoggedIn && (role === "admin" || role === "manager") ? (
              <SingleStudentsPage />
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
