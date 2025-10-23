// src/pages/AdminPage.jsx
import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaUserShield,
  FaChalkboardTeacher,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const AdminPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [roleType, setRoleType] = useState("admin");
  const [newProfile, setNewProfile] = useState({
    name: "",
    phone: "",
    login: "",
    password: "",
  });
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    phone: "",
    login: "",
    password: "",
  });
  const [editPasswordVisible, setEditPasswordVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const userRole = localStorage.getItem("role");

  // 🔹 Firestore’dan ma’lumotlarni olish
  const fetchProfiles = async () => {
    try {
      const adminsSnap = await getDocs(collection(db, "admins"));
      const teachersSnap = await getDocs(collection(db, "teachers"));
      const admins = adminsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        role: "admin",
      }));
      const teachers = teachersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        role: "teacher",
      }));
      setProfiles([...admins, ...teachers]);
    } catch (error) {
      console.error("❌ Ma’lumotlarni olishda xatolik:", error);
    }
  };

  useEffect(() => {
    if (userRole === "manager") fetchProfiles();
  }, [userRole]);

  // 🔹 Yangi profil qo‘shish
  const handleSave = async () => {
    const { name, phone, login, password } = newProfile;
    if (!name || !phone || !login || !password) {
      alert("Barcha maydonlarni to‘ldiring!");
      return;
    }
    try {
      const collectionName = roleType === "admin" ? "admins" : "teachers";
      await addDoc(collection(db, collectionName), {
        name,
        phone,
        login,
        password,
      });
      setShowModal(false);
      setNewProfile({ name: "", phone: "", login: "", password: "" });
      fetchProfiles();
    } catch (error) {
      console.error("❌ Profilni saqlashda xatolik:", error);
    }
  };

  // 🔹 Profilni tahrirlash uchun ochish
  const handleEdit = (index) => {
    const prof = profiles[index];
    setEditData({
      id: prof.id,
      name: prof.name,
      phone: prof.phone,
      login: prof.login,
      password: prof.password,
    });
    setRoleType(prof.role);
    setEditIndex(index);
    setEditPasswordVisible(false);
    setShowModal(true);
  };

  // 🔹 Tahrirlangan profilni saqlash
  const handleSaveEdit = async () => {
    const { id, name, phone, login, password } = editData;
    if (!name || !phone || !login || !password) {
      alert("Barcha maydonlarni to‘ldiring!");
      return;
    }
    try {
      const collectionName = roleType === "admin" ? "admins" : "teachers";
      const ref = doc(db, collectionName, id);
      await updateDoc(ref, { name, phone, login, password });
      setShowModal(false);
      setEditIndex(null);
      fetchProfiles();
    } catch (error) {
      console.error("❌ Profilni yangilashda xatolik:", error);
    }
  };

  // 🔹 Profilni o‘chirish
  const confirmDelete = (id) => {
    setDeleteDocId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const profile = profiles.find((p) => p.id === deleteDocId);
      const collectionName = profile.role === "admin" ? "admins" : "teachers";
      await deleteDoc(doc(db, collectionName, deleteDocId));
      setShowDeleteModal(false);
      fetchProfiles();
    } catch (error) {
      console.error("❌ Profilni o‘chirishda xatolik:", error);
    }
  };

  const onModalSave = () => {
    if (editIndex !== null) handleSaveEdit();
    else handleSave();
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (userRole !== "manager") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700">
            Sizda bu sahifani ko‘rish huquqi yo‘q 🚫
          </h2>
          <p className="text-gray-500 mt-2">
            Faqat menejerlar uchun ruxsat berilgan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 flex items-center gap-2">
          <FaUserShield className="text-blue-500" /> Profil boshqaruvi
        </h1>
        <button
          onClick={() => {
            setEditIndex(null);
            setNewProfile({ name: "", phone: "", login: "", password: "" });
            setRoleType("admin");
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition w-full sm:w-auto justify-center"
        >
          <FaPlus /> Yangi profil
        </button>
      </div>

      {/* 🔹 Adminlar */}
      <div className="grid gap-6">
        <div>
          <h2 className="text-xl font-semibold text-blue-600 mb-3 flex items-center gap-2">
            <FaUserShield /> Adminlar
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.filter((p) => p.role === "admin").length === 0 ? (
              <p className="text-gray-500 text-sm italic">Adminlar yo‘q</p>
            ) : (
              profiles
                .filter((p) => p.role === "admin")
                .map((prof, index) => (
                  <motion.div
                    key={prof.id}
                    layout
                    className="bg-white rounded-xl p-4 border-l-4 border-blue-400 shadow hover:shadow-md cursor-pointer"
                    onClick={() => toggleExpand(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 text-white flex items-center justify-center text-lg font-bold">
                        {prof.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {prof.name}
                        </h3>
                        <p className="text-sm text-gray-500">{prof.phone}</p>
                      </div>
                    </div>
                    {expandedIndex === index && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                        <p>
                          <strong>Login:</strong> {prof.login}
                        </p>
                        <p>
                          <strong>Parol:</strong> {prof.password}
                        </p>
                      </div>
                    )}
                    <div className="mt-3 flex justify-end gap-2">
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
                          confirmDelete(prof.id);
                        }}
                        className="p-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </div>

        {/* 🔹 Teacherlar */}
        <div>
          <h2 className="text-xl font-semibold text-green-600 mb-3 flex items-center gap-2">
            <FaChalkboardTeacher /> O‘qituvchilar
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.filter((p) => p.role === "teacher").length === 0 ? (
              <p className="text-gray-500 text-sm italic">O‘qituvchilar yo‘q</p>
            ) : (
              profiles
                .filter((p) => p.role === "teacher")
                .map((prof, index) => (
                  <motion.div
                    key={prof.id}
                    layout
                    className="bg-white rounded-xl p-4 border-l-4 border-green-400 shadow hover:shadow-md cursor-pointer"
                    onClick={() => toggleExpand(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-green-400 to-green-600 text-white flex items-center justify-center text-lg font-bold">
                        {prof.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {prof.name}
                        </h3>
                        <p className="text-sm text-gray-500">{prof.phone}</p>
                      </div>
                    </div>
                    {expandedIndex === index && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                        <p>
                          <strong>Login:</strong> {prof.login}
                        </p>
                        <p>
                          <strong>Parol:</strong> {prof.password}
                        </p>
                      </div>
                    )}
                    <div className="mt-3 flex justify-end gap-2">
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
                          confirmDelete(prof.id);
                        }}
                        className="p-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4"
        >
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editIndex !== null
                ? "Profilni tahrirlash"
                : "Yangi profil qo‘shish"}
            </h2>

            {/* Rol tanlash */}
            <div className="flex gap-3 mb-4">
              <label
                className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded-xl ${
                  roleType === "admin"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <input
                  type="radio"
                  value="admin"
                  checked={roleType === "admin"}
                  onChange={() => setRoleType("admin")}
                />
                Admin
              </label>
              <label
                className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded-xl ${
                  roleType === "teacher"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <input
                  type="radio"
                  value="teacher"
                  checked={roleType === "teacher"}
                  onChange={() => setRoleType("teacher")}
                />
                Teacher
              </label>
            </div>

            {/* Forma */}
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Ism Familya"
                value={
                  editIndex !== null ? editData.name : newProfile.name
                }
                onChange={(e) =>
                  editIndex !== null
                    ? setEditData({ ...editData, name: e.target.value })
                    : setNewProfile({ ...newProfile, name: e.target.value })
                }
                className="border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Telefon raqam"
                value={
                  editIndex !== null ? editData.phone : newProfile.phone
                }
                onChange={(e) =>
                  editIndex !== null
                    ? setEditData({ ...editData, phone: e.target.value })
                    : setNewProfile({ ...newProfile, phone: e.target.value })
                }
                className="border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Login"
                value={
                  editIndex !== null ? editData.login : newProfile.login
                }
                onChange={(e) =>
                  editIndex !== null
                    ? setEditData({ ...editData, login: e.target.value })
                    : setNewProfile({ ...newProfile, login: e.target.value })
                }
                className="border rounded-lg p-2"
              />
              <div className="relative">
                <input
                  type={editPasswordVisible ? "text" : "password"}
                  placeholder="Parol"
                  value={
                    editIndex !== null
                      ? editData.password
                      : newProfile.password
                  }
                  onChange={(e) =>
                    editIndex !== null
                      ? setEditData({ ...editData, password: e.target.value })
                      : setNewProfile({
                          ...newProfile,
                          password: e.target.value,
                        })
                  }
                  className="border rounded-lg p-2 w-full"
                />
                <button
                  type="button"
                  onClick={() =>
                    setEditPasswordVisible((v) => !v)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {editPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
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

      {/* 🔹 Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-3 text-red-600">
              🗑 Profilni o‘chirish
            </h3>
            <p className="text-gray-700 mb-5">
              Rostdan ham ushbu profilni o‘chirmoqchimisiz?
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
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
