// src/pages/AdminPage.jsx
import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaUserShield,
  FaChalkboardTeacher,
  FaEye,
  FaEyeSlash,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const AdminPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [roleType, setRoleType] = useState("admin");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    login: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const userRole = localStorage.getItem("role");

  // Ma'lumotlarni olish
  const fetchProfiles = async () => {
    setLoading(true);
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
      console.error("❌ Ma'lumotlarni olishda xatolik:", error);
      alert("⚠️ Ma'lumotlarni yuklashda xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "manager") fetchProfiles();
  }, [userRole]);

  // Modal ochish (yangi profil)
  const openAddModal = () => {
    setEditingProfile(null);
    setFormData({ name: "", phone: "", login: "", password: "" });
    setRoleType("admin");
    setPasswordVisible(false);
    setShowModal(true);
  };

  // Modal ochish (tahrirlash)
  const openEditModal = (profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      phone: profile.phone,
      login: profile.login,
      password: profile.password,
    });
    setRoleType(profile.role);
    setPasswordVisible(false);
    setShowModal(true);
  };

  // Modal yopish
  const closeModal = () => {
    setShowModal(false);
    setEditingProfile(null);
    setFormData({ name: "", phone: "", login: "", password: "" });
    setPasswordVisible(false);
  };

  // Form validatsiya
  const validateForm = () => {
    const { name, phone, login, password } = formData;
    
    if (!name.trim()) {
      alert("❌ Ism familyani kiriting!");
      return false;
    }
    if (!phone.trim()) {
      alert("❌ Telefon raqamni kiriting!");
      return false;
    }
    if (!login.trim()) {
      alert("❌ Login kiriting!");
      return false;
    }
    if (!password.trim()) {
      alert("❌ Parol kiriting!");
      return false;
    }
    if (password.length < 4) {
      alert("❌ Parol kamida 4 ta belgidan iborat bo'lishi kerak!");
      return false;
    }
    return true;
  };

  // Yangi profil qo'shish
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const collectionName = roleType === "admin" ? "admins" : "teachers";
      await addDoc(collection(db, collectionName), {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        login: formData.login.trim(),
        password: formData.password,
      });
      alert("✅ Profil muvaffaqiyatli qo'shildi!");
      closeModal();
      fetchProfiles();
    } catch (error) {
      console.error("❌ Profilni saqlashda xatolik:", error);
      alert("⚠️ Profilni saqlashda xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  // Profilni tahrirlash
  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const collectionName = roleType === "admin" ? "admins" : "teachers";
      const docRef = doc(db, collectionName, editingProfile.id);
      await updateDoc(docRef, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        login: formData.login.trim(),
        password: formData.password,
      });
      alert("✅ Profil muvaffaqiyatli yangilandi!");
      closeModal();
      fetchProfiles();
    } catch (error) {
      console.error("❌ Profilni yangilashda xatolik:", error);
      alert("⚠️ Profilni yangilashda xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  // Saqlash tugmasi
  const handleSubmit = () => {
    if (editingProfile) {
      handleUpdate();
    } else {
      handleSave();
    }
  };

  // Qidiruv
  const filteredProfiles = profiles.filter((profile) =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.phone.includes(searchQuery) ||
    profile.login.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ruxsat tekshirish
  if (userRole !== "manager") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center bg-white p-10 rounded-3xl shadow-2xl max-w-md"
        >
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Kirish taqiqlangan
          </h2>
          <p className="text-gray-600">
            Bu sahifa faqat menejerlar uchun mo'ljallangan.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-0 sm:p-0 lg:p-0">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <FaUserShield className="text-blue-600" />
              Profil boshqaruvi
            </h1>
            <p className="text-gray-600 mt-2">
              Adminlar va o'qituvchilarni boshqaring
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 w-full lg:w-auto justify-center font-medium"
          >
            <FaPlus className="text-lg" />
            Yangi profil qo'shish
          </button>
        </div>

        {/* Qidiruv */}
        <div className="relative">
          <input
            type="text"
            placeholder="Ism, telefon yoki login bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 mt-3">Yuklanmoqda...</p>
        </div>
      )}

      {/* Profillar */}
      {!loading && (
        <div className="grid gap-8">
          {/* Adminlar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaUserShield className="text-blue-600" />
                Adminlar
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({filteredProfiles.filter((p) => p.role === "admin").length})
                </span>
              </h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProfiles.filter((p) => p.role === "admin").length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-gray-500 italic">Adminlar topilmadi</p>
                </div>
              ) : (
                filteredProfiles
                  .filter((p) => p.role === "admin")
                  .map((prof) => (
                    <motion.div
                      key={prof.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === prof.id ? null : prof.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                            {prof.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">
                              {prof.name}
                            </h3>
                            <p className="text-sm text-gray-500">{prof.phone}</p>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedId === prof.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Login:</span>
                                <span className="text-gray-800 font-semibold">{prof.login}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Parol:</span>
                                <span className="text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded">
                                  {prof.password}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(prof);
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        <FaEdit />
                        Tahrirlash
                      </button>
                    </motion.div>
                  ))
              )}
            </div>
          </motion.div>

          {/* O'qituvchilar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-700 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaChalkboardTeacher className="text-green-600" />
                O'qituvchilar
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({filteredProfiles.filter((p) => p.role === "teacher").length})
                </span>
              </h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProfiles.filter((p) => p.role === "teacher").length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-gray-500 italic">O'qituvchilar topilmadi</p>
                </div>
              ) : (
                filteredProfiles
                  .filter((p) => p.role === "teacher")
                  .map((prof) => (
                    <motion.div
                      key={prof.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-green-500 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === prof.id ? null : prof.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                            {prof.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">
                              {prof.name}
                            </h3>
                            <p className="text-sm text-gray-500">{prof.phone}</p>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedId === prof.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Login:</span>
                                <span className="text-gray-800 font-semibold">{prof.login}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Parol:</span>
                                <span className="text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded">
                                  {prof.password}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(prof);
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium"
                      >
                        <FaEdit />
                        Tahrirlash
                      </button>
                    </motion.div>
                  ))
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 p-4 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingProfile ? "Profilni tahrirlash" : "Yangi profil qo'shish"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-white hover:bg-white/20 p-2 rounded-full transition"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Rol tanlash */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Rol tanlang
                  </label>
                  <div className="flex gap-3">
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl font-medium transition-all ${
                        roleType === "admin"
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        value="admin"
                        checked={roleType === "admin"}
                        onChange={() => setRoleType("admin")}
                        className="hidden"
                        disabled={editingProfile !== null}
                      />
                      <FaUserShield />
                      Admin
                    </label>
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl font-medium transition-all ${
                        roleType === "teacher"
                          ? "bg-green-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        value="teacher"
                        checked={roleType === "teacher"}
                        onChange={() => setRoleType("teacher")}
                        className="hidden"
                        disabled={editingProfile !== null}
                      />
                      <FaChalkboardTeacher />
                      Teacher
                    </label>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ism Familya *
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Alisher Navoiy"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefon raqam *
                    </label>
                    <input
                      type="text"
                      placeholder="+998 90 123 45 67"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Login *
                    </label>
                    <input
                      type="text"
                      placeholder="Foydalanuvchi nomi"
                      value={formData.login}
                      onChange={(e) =>
                        setFormData({ ...formData, login: e.target.value })
                      }
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Parol *
                    </label>
                    <div className="relative">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Kamida 4 ta belgi"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 rounded-xl p-3 pr-12 focus:border-blue-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                      >
                        {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;