import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage";
import AllUsersPage from "./pages/AllUsersPage";
import DeletedUsersPage from "./pages/DeletedUsersPage";
import FeedBackPage from "./pages/FeedBackPage";
import StatistikaPage from "./pages/StatistikaPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";

const App = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Routes>
      {/* Login sahifasi */}
      <Route
        path="/login"
        element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
      />

      {/* Admin panel uchun Layout */}
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
            isLoggedIn ? (
              <StatistikaPage />
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
      </Route>
    </Routes>
  );
};

export default App;
