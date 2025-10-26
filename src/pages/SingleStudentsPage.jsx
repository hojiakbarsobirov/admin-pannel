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
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    surname: "",
    phone: "",
    joinedAt: "",
  });

  // Guruh nomini olish
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

  // O'quvchilarni olish
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "students"), where("groupId", "==", groupId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      data.sort((a, b) => {
        const dateA = new Date(a.addedAt || a.joinedAt || a.createdAt);
        const dateB = new Date(b.addedAt || b.joinedAt || b.createdAt);
        return dateB - dateA;
      });

      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error("O'quvchilarni olishda xato:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupName();
    fetchStudents();
  }, [groupId]);

  // O'quvchi qo'shish
  const handleAddStudent = async () => {
    const { name, surname, phone, joinedAt } = newStudent;
    if (!name.trim() || !surname.trim() || !phone.trim() || !joinedAt.trim()) {
      alert("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    try {
      await addDoc(collection(db, "students"), {
        groupId,
        name,
        surname,
        phone,
        joinedAt,
        addedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      alert("O'quvchi muvaffaqiyatli qo'shildi ✅");
      setShowModal(false);
      setNewStudent({ name: "", surname: "", phone: "", joinedAt: "" });
      fetchStudents();
    } catch (error) {
      console.error("O'quvchi qo'shishda xato:", error);
      alert("Xatolik yuz berdi ❌");
    }
  };

  // O'quvchini o'chirish
  const handleDeleteStudent = async (id) => {
    if (window.confirm("Bu o'quvchini o'chirmoqchimisiz?")) {
      try {
        await deleteDoc(doc(db, "students", id));
        fetchStudents();
        alert("O'quvchi o'chirildi ✅");
      } catch (error) {
        console.error("O'quvchini o'chirishda xato:", error);
        alert("O'chirishda xatolik yuz berdi ❌");
      }
    }
  };

  // Sana va vaqtni formatlash
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  };

  // Qisqa sana formati (faqat kun.oy.yil)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      {/* Orqaga tugmasi */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-black mb-4 transition"
      >
        <FaArrowLeft className="mr-2" />
      </button>

      {/* Sarlavha va tugma */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-500">
          {groupName ? `${groupName} guruh o'quvchilari` : "Guruh o'quvchilari"}
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm transition"
        >
          <FaPlus className="mr-2" /> O'quvchi qo'shish
        </button>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded overflow-x-auto shadow">
        {loading ? (
          <div className="text-center py-10 text-gray-500 text-lg">
            Yuklanmoqda...
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-10 text-gray-500 italic">
            Bu guruhda hozircha o'quvchilar yo'q
          </div>
        ) : (
          <table className="min-w-full text-left border-collapse text-sm">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Ism</th>
                <th className="px-4 py-3">Familya</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Tg | WhatsApp</th>
                <th className="px-4 py-3">Qo'shilgan sana</th>
                <th className="px-4 py-3 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr
                  key={student.id}
                  className={`border-b hover:bg-blue-50 transition ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 font-medium">{student.name}</td>
                  <td className="px-4 py-2">{student.surname || "-"}</td>
                  <td className="px-4 py-2">{student.phone}</td>
                  <td className="px-4 py-2">{student.extraPhone || "-"}</td>
                  <td className="px-4 py-2 font-medium text-blue-600 text-xs">
                    {student.addedAt ? formatDateTime(student.addedAt) : formatDate(student.joinedAt)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="text-red-500 hover:text-red-700 transition-all"
                      title="O'chirish"
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

      {/* O'quvchi qo'shish Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <FaTimes />
            </button>

            <h3 className="text-lg font-semibold mb-4">
              Yangi o'quvchi qo'shish
            </h3>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Ism"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Familya"
                value={newStudent.surname}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, surname: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Telefon raqami"
                value={newStudent.phone}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, phone: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              <input
                type="date"
                value={newStudent.joinedAt}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, joinedAt: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="flex justify-between gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="w-1/2 bg-gray-300 hover:bg-gray-400 text-black py-2 rounded-md transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleAddStudent}
                className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition"
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

export default SingleStudentsPage;