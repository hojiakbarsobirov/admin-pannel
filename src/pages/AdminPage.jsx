import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaUserShield,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { motion } from "framer-motion";

const AdminPage = () => {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    phone: "",
    login: "",
    password: "",
  });
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLogin, setEditLogin] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordVisible, setEditPasswordVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    const savedAdmins = JSON.parse(localStorage.getItem("admins")) || [];
    setAdmins(savedAdmins);
  }, []);

  const saveToLocalStorage = (updated) => {
    setAdmins(updated);
    localStorage.setItem("admins", JSON.stringify(updated));
  };

  const handleSave = () => {
    if (!newAdmin.name || !newAdmin.phone || !newAdmin.login || !newAdmin.password) {
      alert("Barcha maydonlarni to‘ldiring!");
      return;
    }

    let updatedAdmins = [...admins, newAdmin];
    saveToLocalStorage(updatedAdmins);
    setNewAdmin({ name: "", phone: "", login: "", password: "" });
    setShowModal(false);
  };

  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = () => {
    if (deleteIndex === null) {
      setShowDeleteModal(false);
      return;
    }
    const updated = admins.filter((_, i) => i !== deleteIndex);
    saveToLocalStorage(updated);
    setDeleteIndex(null);
    setShowDeleteModal(false);
  };

  const handleEdit = (index) => {
    const admin = admins[index];
    let first = "";
    let last = "";
    if (admin.name) {
      const parts = String(admin.name).trim().split(" ");
      first = parts.shift() || "";
      last = parts.join(" ") || "";
    } else {
      first = admin.firstName || "";
      last = admin.lastName || "";
    }

    setEditFirstName(first);
    setEditLastName(last);
    setEditPhone(admin.phone || "");
    setEditLogin(admin.login || "");
    setEditPassword(admin.password || "");
    setEditPasswordVisible(false);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleSaveEdit = () => {
    if (!editFirstName || !editLastName || !editPhone || !editLogin || !editPassword) {
      alert("Barcha maydonlarni to‘ldiring!");
      return;
    }

    const combinedName = `${editFirstName.trim()} ${editLastName.trim()}`.trim();

    const updatedAdmins = [...admins];
    updatedAdmins[editIndex] = {
      name: combinedName,
      phone: editPhone,
      login: editLogin,
      password: editPassword,
    };

    saveToLocalStorage(updatedAdmins);
    setEditIndex(null);
    setShowModal(false);
  };

  const onModalSave = () => {
    if (editIndex !== null) {
      handleSaveEdit();
    } else {
      handleSave();
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 flex items-center gap-2">
          <FaUserShield className="text-blue-500" /> Admin profillari
        </h1>

        {userRole === "manager" && (
          <button
            onClick={() => {
              setEditIndex(null);
              setNewAdmin({ name: "", phone: "", login: "", password: "" });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition w-full sm:w-auto justify-center"
          >
            <FaPlus /> Yangi admin
          </button>
        )}
      </div>

      {/* Profil kartalar */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {admins.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center text-lg">
            Hozircha hech qanday admin yo‘q
          </p>
        ) : (
          admins.map((admin, index) => (
            <motion.div
              key={index}
              layout
              className="bg-white rounded p-5 lg:w-[300px] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold">
                  {admin.name
                    ? admin.name.charAt(0).toUpperCase()
                    : admin.login.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    {admin.name || "No name"}
                  </h3>
                  <p className="text-sm text-gray-500">{admin.phone}</p>
                </div>
              </div>

              {expandedIndex === index && (
                <div className="mt-3 sm:mt-4 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                  <p>
                    <strong>Login:</strong> {admin.login}
                  </p>
                  <p className="mt-1">
                    <strong>Parol:</strong> {admin.password}
                  </p>
                </div>
              )}

              {userRole === "manager" && (
                <div className="mt-4 sm:mt-5 flex justify-end gap-2 sm:gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(index);
                    }}
                    className="p-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(index);
                    }}
                    className="p-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4"
        >
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {editIndex !== null ? "Adminni tahrirlash" : "Yangi admin qo‘shish"}
            </h2>

            <div className="flex flex-col gap-3">
              {editIndex !== null ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Ism"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="border rounded-lg p-2"
                    />
                    <input
                      type="text"
                      placeholder="Familiya"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="border rounded-lg p-2"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Telefon raqam"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="border rounded-lg p-2"
                  />

                  <input
                    type="text"
                    placeholder="Login"
                    value={editLogin}
                    onChange={(e) => setEditLogin(e.target.value)}
                    className="border rounded-lg p-2"
                  />

                  <div className="relative">
                    <input
                      type={editPasswordVisible ? "text" : "password"}
                      placeholder="Parol"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="border rounded-lg p-2 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setEditPasswordVisible((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {editPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Ism Familya"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    className="border rounded-lg p-2"
                  />
                  <input
                    type="text"
                    placeholder="Telefon raqam"
                    value={newAdmin.phone}
                    onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                    className="border rounded-lg p-2"
                  />
                  <input
                    type="text"
                    placeholder="Login"
                    value={newAdmin.login}
                    onChange={(e) => setNewAdmin({ ...newAdmin, login: e.target.value })}
                    className="border rounded-lg p-2"
                  />
                  <input
                    type="password"
                    placeholder="Parol"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="border rounded-lg p-2"
                  />
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditIndex(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 transition w-full sm:w-auto"
              >
                Bekor qilish
              </button>
              <button
                onClick={onModalSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition w-full sm:w-auto"
              >
                Saqlash
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-3 text-red-600">🗑 Adminni o‘chirish</h3>
            <p className="text-gray-700 mb-5">
              Rostdan ham ushbu adminni o‘chirmoqchimisiz? Bu amal qaytarib bo‘lmaydi.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteIndex(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition w-full sm:w-auto"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition w-full sm:w-auto"
              >
                Ha, o‘chirilsin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
