import React from "react";
import { Routes, Route } from "react-router-dom";
import NavbarPage from "./components/NavbarPage";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage";
import AllUsersPage from "./pages/AllUsersPage";
import DeletedUsersPage from "./pages/DeletedUsersPage";
import RegisterPage from "./pages/RegisterPage";
import FeedBackPage from "./pages/FeedBackPage";
import StatistikaPage from "./pages/StatistikaPage";
import AdminPage from "./pages/AdminPage";

const App = () => {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/all-users" element={<AllUsersPage />} />
          <Route path="/deleted-users" element={<DeletedUsersPage />} />
          <Route path="/feedback" element={<FeedBackPage />} />
          <Route path="/statistika" element={<StatistikaPage/>} />
          <Route path="/admin-page" element={<AdminPage/>} />
        </Route>
      </Routes>
      <div></div>
    </>
  );
};

export default App;
