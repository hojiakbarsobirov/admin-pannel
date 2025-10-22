import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaTimes, FaTrash } from "react-icons/fa";

const StudentsPage = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ groupName: "", createdAt: "" });
  const [loading, setLoading] = useState(true);

  // 🔹 Guruhlarni olish
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "groups"), where("teacherId", "==", teacherId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGroups(data);
      setLoading(false);

      // 🔹 Har bir guruh uchun o‘quvchilar sonini hisoblash
      data.forEach(async (group) => {
        const studentsQ = query(
          collection(db, "students"),
          where("groupId", "==", group.id)
        );
        const studentSnap = await getDocs(studentsQ);
        setStudentCounts((prev) => ({
          ...prev,
          [group.id]: studentSnap.size,
        }));
      });
    } catch (err) {
      console.error("Guruhlarni olishda xato:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // 🔹 Guruh yaratish
  const handleAddGroup = async () => {
    if (!newGroup.groupName.trim() || !newGroup.createdAt.trim()) {
      alert("Iltimos, barcha maydonlarni to‘ldiring!");
      return;
    }

    try {
      await addDoc(collection(db, "groups"), {
        teacherId,
        groupName: newGroup.groupName,
        createdAt: newGroup.createdAt,
      });

      alert("Guruh muvaffaqiyatli yaratildi ✅");
      setShowModal(false);
      setNewGroup({ groupName: "", createdAt: "" });
      fetchGroups();
    } catch (error) {
      console.error("Guruh yaratishda xato:", error);
      alert("Xatolik yuz berdi! Guruh saqlanmadi ❌");
    }
  };

  // 🔹 Guruhni o‘chirish
  const handleDeleteGroup = async (id) => {
    if (window.confirm("Bu guruhni o‘chirmoqchimisiz?")) {
      try {
        await deleteDoc(doc(db, "groups", id));
        fetchGroups();
      } catch (error) {
        console.error("Guruh o‘chirishda xato:", error);
      }
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

      {/* Sarlavha va tugma */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-500">
          O‘qituvchining guruhlari
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm"
        >
          <FaPlus className="mr-2" /> Guruh yaratish
        </button>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded overflow-x-auto shadow">
        {loading ? (
          <div className="text-center py-6 text-gray-500 text-lg">
            Yuklanmoqda...
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-6 text-gray-500 italic">
            Hozircha guruh mavjud emas.
          </div>
        ) : (
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Guruh nomi</th>
                <th className="px-4 py-3">Yaratilgan sana</th>
                <th className="px-4 py-3">O‘quvchilar soni</th>
                <th className="px-4 py-3 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, index) => (
                <tr
                  key={group.id}
                  className={`border-b hover:bg-gray-100 ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td
                    className="px-4 py-2 text-blue-600 font-medium cursor-pointer"
                    onClick={() => navigate(`/groups/${teacherId}/${group.id}`)}
                  >
                    {group.groupName}
                  </td>
                  <td className="px-4 py-2">{group.createdAt}</td>
                  <td className="px-4 py-2 text-center font-semibold">
                    {studentCounts[group.id] ?? 0}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <FaTimes />
            </button>

            <h3 className="text-lg font-semibold mb-4">Yangi guruh yaratish</h3>

            <input
              type="text"
              placeholder="Guruh nomi"
              value={newGroup.groupName}
              onChange={(e) =>
                setNewGroup({ ...newGroup, groupName: e.target.value })
              }
              className="w-full border p-2 rounded mb-3"
            />
            <input
              type="date"
              value={newGroup.createdAt}
              onChange={(e) =>
                setNewGroup({ ...newGroup, createdAt: e.target.value })
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
                onClick={handleAddGroup}
                className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
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

export default StudentsPage;
