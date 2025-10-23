// src/pages/SingleStudentsPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaTimes, FaTrash } from "react-icons/fa";

const SingleStudentsPage = () => {
  const { teacherId, groupId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [groupName, setGroupName] = useState(""); // ✅ Guruh nomini saqlaymiz
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    surname: "",
    phone: "",
    joinedAt: "",
  });

  // 🔹 Qarzdorlar uchun state
  const [showDebtorModal, setShowDebtorModal] = useState(false);
  const [allGroups, setAllGroups] = useState([]);
  const [debtorForm, setDebtorForm] = useState({
    name: "",
    surname: "",
    phone: "",
    groupId: "",
    debtAmount: "",
  });

  // 🔹 Guruh nomini olish
  const fetchGroupName = async () => {
    try {
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        setGroupName(groupSnap.data().groupName);
      } else {
        setGroupName("Noma'lum guruh");
      }
    } catch (error) {
      console.error("Guruh nomini olishda xato:", error);
    }
  };

  // 🔹 Guruhlar ro‘yxatini olish (qarzdor modali uchun)
  const fetchAllGroups = async () => {
    try {
      const groupsSnap = await getDocs(collection(db, "groups"));
      const groupsList = groupsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setAllGroups(groupsList);
    } catch (error) {
      console.error("❌ Guruhlarni olishda xato:", error);
    }
  };

  // 🔹 O‘quvchilarni olish (faqat shu groupId bo‘yicha)
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "students"), where("groupId", "==", groupId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error("O‘quvchilarni olishda xato:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupName();
    fetchStudents();
    fetchAllGroups();
  }, []);

  // 🔹 O‘quvchi qo‘shish
  const handleAddStudent = async () => {
    const { name, surname, phone, joinedAt } = newStudent;
    if (!name.trim() || !surname.trim() || !phone.trim() || !joinedAt.trim()) {
      alert("Iltimos, barcha maydonlarni to‘ldiring!");
      return;
    }

    try {
      await addDoc(collection(db, "students"), {
        groupId,
        name,
        surname,
        phone,
        joinedAt,
      });

      alert("O‘quvchi muvaffaqiyatli qo‘shildi ✅");
      setShowModal(false);
      setNewStudent({ name: "", surname: "", phone: "", joinedAt: "" });
      fetchStudents();
    } catch (error) {
      console.error("O‘quvchi qo‘shishda xato:", error);
      alert("Xatolik yuz berdi ❌");
    }
  };

  // 🔹 O‘quvchini o‘chirish
  const handleDeleteStudent = async (id) => {
    if (window.confirm("Bu o‘quvchini o‘chirmoqchimisiz?")) {
      try {
        await deleteDoc(doc(db, "students", id));
        fetchStudents();
      } catch (error) {
        console.error("O‘quvchini o‘chirishda xato:", error);
      }
    }
  };

  // 🔹 Qarzdorlik formati
  const formatNumberWithDots = (value) => {
    const numStr = value.replace(/\D/g, "");
    if (!numStr) return "";
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleDebtAmountChange = (e) => {
    const formatted = formatNumberWithDots(e.target.value);
    setDebtorForm({ ...debtorForm, debtAmount: formatted });
  };

  // 🔹 Qarzdor qo‘shish funksiyasi
  const handleDebtorSubmit = async (e) => {
    e.preventDefault();

    if (
      !debtorForm.name ||
      !debtorForm.surname ||
      !debtorForm.groupId ||
      !debtorForm.debtAmount
    ) {
      alert("❌ Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    try {
      const debtorData = {
        ...debtorForm,
        debtAmount: parseFloat(debtorForm.debtAmount.replace(/\./g, "")),
        createdAt: new Date().toISOString(),
        teacherId,
      };

      await addDoc(collection(db, "debtors"), debtorData);
      alert("✅ Qarzdor muvaffaqiyatli qo'shildi!");
      setShowDebtorModal(false);
      setDebtorForm({
        name: "",
        surname: "",
        phone: "",
        groupId: "",
        debtAmount: "",
      });
    } catch (error) {
      console.error("❌ Qarzdorni qo‘shishda xato:", error);
      alert("❌ Xatolik yuz berdi!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      {/* Orqaga tugmasi */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-black mb-4"
      >
        <FaArrowLeft className="mr-2" />
      </button>

      {/* Sarlavha va tugmalar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-500">
          {groupName ? `${groupName} guruh o‘quvchilari` : "Guruh o‘quvchilari"}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDebtorModal(true)}
            className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-sm"
          >
            💰 Qarzdor qo‘shish
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm"
          >
            <FaPlus className="mr-2" /> O‘quvchi qo‘shish
          </button>
        </div>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded overflow-x-auto shadow">
        {loading ? (
          <div className="text-center py-6 text-gray-500 text-lg">
            Yuklanmoqda...
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-6 text-gray-500 italic">
            Hozircha o‘quvchilar mavjud emas.
          </div>
        ) : (
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Ism</th>
                <th className="px-4 py-3">Familya</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Qo‘shilgan sana</th>
                <th className="px-4 py-3 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr
                  key={student.id}
                  className={`border-b hover:bg-gray-100 ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.surname}</td>
                  <td className="px-4 py-2">{student.phone}</td>
                  <td className="px-4 py-2">{student.joinedAt}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="text-red-500 hover:text-red-700 transition-all"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* O‘quvchi qo‘shish Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <FaTimes />
            </button>

            <h3 className="text-lg font-semibold mb-4">
              Yangi o‘quvchi qo‘shish
            </h3>

            <input
              type="text"
              placeholder="Ism"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
              className="w-full border p-2 rounded mb-3"
            />
            <input
              type="text"
              placeholder="Familya"
              value={newStudent.surname}
              onChange={(e) =>
                setNewStudent({ ...newStudent, surname: e.target.value })
              }
              className="w-full border p-2 rounded mb-3"
            />
            <input
              type="text"
              placeholder="Telefon raqami"
              value={newStudent.phone}
              onChange={(e) =>
                setNewStudent({ ...newStudent, phone: e.target.value })
              }
              className="w-full border p-2 rounded mb-3"
            />
            <input
              type="date"
              value={newStudent.joinedAt}
              onChange={(e) =>
                setNewStudent({ ...newStudent, joinedAt: e.target.value })
              }
              className="w-full border p-2 rounded mb-3"
            />

            <div className="flex justify-between gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="w-1/2 bg-gray-300 hover:bg-gray-400 text-black py-2 rounded-md"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleAddStudent}
                className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Qarzdor qo‘shish Modal */}
      {showDebtorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Qarzdor qo‘shish
            </h2>
            <form onSubmit={handleDebtorSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ism *
                  </label>
                  <input
                    type="text"
                    value={debtorForm.name}
                    onChange={(e) =>
                      setDebtorForm({ ...debtorForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Familiya *
                  </label>
                  <input
                    type="text"
                    value={debtorForm.surname}
                    onChange={(e) =>
                      setDebtorForm({ ...debtorForm, surname: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={debtorForm.phone}
                    onChange={(e) =>
                      setDebtorForm({ ...debtorForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guruh *
                  </label>
                  <select
                    value={debtorForm.groupId}
                    onChange={(e) =>
                      setDebtorForm({ ...debtorForm, groupId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Guruhni tanlang</option>
                    {allGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.groupName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qarzdorlik miqdori (so‘m) *
                  </label>
                  <input
                    type="text"
                    value={debtorForm.debtAmount}
                    onChange={handleDebtAmountChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Misol: 200.000"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDebtorModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleStudentsPage;
