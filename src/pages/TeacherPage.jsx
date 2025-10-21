// src/pages/TeacherPage.jsx
import React, { useEffect, useState } from "react";
import { FaUserGraduate, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { motion } from "framer-motion";

const TeacherPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    phone: "",
    login: "",
    password: "",
    role: "teacher",
  });

  const userRole = localStorage.getItem("role");
  const currentUser = localStorage.getItem("currentTeacher");

  // 🔹 LocalStorage dan o‘qituvchilarni olish
  useEffect(() => {
    const savedTeachers = JSON.parse(localStorage.getItem("teachers")) || [];
    setTeachers(savedTeachers);
  }, []);

  const saveToLocalStorage = (updated) => {
    setTeachers(updated);
    localStorage.setItem("teachers", JSON.stringify(updated));
  };

  const handleSave = () => {
    if (
      !newTeacher.name ||
      !newTeacher.phone ||
      !newTeacher.login ||
      !newTeacher.password
    ) {
      alert("Barcha maydonlarni to‘ldiring!");
      return;
    }

    const updatedTeachers = [...teachers, newTeacher];
    saveToLocalStorage(updatedTeachers);
    setNewTeacher({
      name: "",
      phone: "",
      login: "",
      password: "",
      role: "teacher",
    });
    setShowModal(false);
  };

  const handleDelete = (index) => {
    const updated = teachers.filter((_, i) => i !== index);
    saveToLocalStorage(updated);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setNewTeacher(teachers[index]);
    setShowModal(true);
  };

  const handleEditSave = () => {
    const updated = [...teachers];
    updated[editIndex] = newTeacher;
    saveToLocalStorage(updated);
    setEditIndex(null);
    setNewTeacher({
      name: "",
      phone: "",
      login: "",
      password: "",
      role: "teacher",
    });
    setShowModal(false);
  };

  // 🔹 Faqat manager hamma o‘qituvchilarni ko‘radi, teacher esa faqat o‘zini
  const visibleTeachers =
    userRole === "manager"
      ? teachers
      : teachers.filter((t) => {
          const currentTeacherProfile = JSON.parse(localStorage.getItem("teachers"))?.find(
            (teacher) => teacher.login === currentUser
          );
          if (!currentTeacherProfile) return false;
          // Name va familya bir xil bo‘lsa ko‘rsatadi
          return t.name === currentTeacherProfile.name;
        });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-5 sm:p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-2">
          <FaUserGraduate />{" "}
          {userRole === "manager"
            ? "O‘qituvchilar ro‘yxati"
            : "Sizning profilingiz"}
        </h1>

        {userRole === "manager" && (
          <button
            onClick={() => {
              setNewTeacher({
                name: "",
                phone: "",
                login: "",
                password: "",
                role: "teacher",
              });
              setEditIndex(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
          >
            <FaPlus /> Qo‘shish
          </button>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleTeachers.length === 0 ? (
          <p className="text-gray-500">Hozircha o‘qituvchi yo‘q</p>
        ) : (
          visibleTeachers.map((teacher, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow p-5 relative"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {teacher.name}
              </h3>
              <p className="text-gray-600 text-sm mt-1">{teacher.phone}</p>
              <p className="text-gray-600 text-sm mt-1">
                <strong>Login:</strong> {teacher.login}
              </p>
              <p className="text-gray-600 text-sm">
                <strong>Parol:</strong> {teacher.password}
              </p>

              {userRole === "manager" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
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
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editIndex !== null
                ? "O‘qituvchini tahrirlash"
                : "Yangi o‘qituvchi qo‘shish"}
            </h2>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Ism Familya"
                value={newTeacher.name}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, name: e.target.value })
                }
                className="border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Telefon raqam"
                value={newTeacher.phone}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, phone: e.target.value })
                }
                className="border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Login"
                value={newTeacher.login}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, login: e.target.value })
                }
                className="border rounded-lg p-2"
              />
              <input
                type="password"
                placeholder="Parol"
                value={newTeacher.password}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, password: e.target.value })
                }
                className="border rounded-lg p-2"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Bekor qilish
              </button>
              <button
                onClick={editIndex !== null ? handleEditSave : handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPage;
