import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, Timestamp, query, orderBy, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CreateGroupPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const currentUserLogin = localStorage.getItem("role") === "teacher" ? localStorage.getItem("login") : null;

  const fetchGroups = async () => {
    const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Agar teacher bo‘lsa, faqat o‘z guruhini ko‘rsatish
    if (userRole === "teacher" && currentUserLogin) {
      list = list.filter(g => g.teacherId === currentUserLogin);
    }

    setGroups(list);
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🔹 Teacher tekshirish
      const teachers = JSON.parse(localStorage.getItem("teachers")) || [];
      const matchedTeacher = teachers.find(
        (t) => t.name.trim().toLowerCase() === teacherName.trim().toLowerCase()
      );

      await addDoc(collection(db, "groups"), {
        groupName,
        teacherName,
        startDate: Timestamp.fromDate(new Date(startDate)),
        createdAt: Timestamp.now(),
        students: [],
        teacherId: matchedTeacher ? matchedTeacher.login : null // teacher bilan bog‘lanadi
      });

      setGroupName(""); setTeacherName(""); setStartDate(""); setModalOpen(false);
      fetchGroups();
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "groups", selectedGroup.id), {
        groupName,
        teacherName,
        startDate: Timestamp.fromDate(new Date(startDate))
      });
      setEditModalOpen(false);
      setSelectedGroup(null);
      setGroupName(""); setTeacherName(""); setStartDate("");
      fetchGroups();
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    try {
      await deleteDoc(doc(db, "groups", selectedGroup.id));
      setDeleteModalOpen(false);
      setSelectedGroup(null);
      fetchGroups();
    } catch (error) { console.error(error); }
  };

  const formatDate = (timestamp) => timestamp ? timestamp.toDate().toISOString().split("T")[0] : "";

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      <h1 className="text-3xl font-bold text-center text-blue-500 mb-6">Guruhlar Boshqaruvi</h1>

      {userRole !== "teacher" && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            <FaPlus /> Guruh yaratish
          </button>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Guruh nomi</th>
              <th className="px-4 py-2">O‘qituvchi</th>
              <th className="px-4 py-2">Ochilgan sana</th>
              <th className="px-4 py-2 text-center">Ja’mi o‘quvchilar</th>
              {userRole !== "teacher" && <th className="px-4 py-2 text-center">Harakat</th>}
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-4">Hozircha guruhlar mavjud emas</td>
              </tr>
            )}
            {groups.map((group, index) => (
              <tr key={group.id} className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}>
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2 font-semibold cursor-pointer" onClick={() => navigate(`/students/${group.id}`)}>{group.groupName}</td>
                <td className="px-4 py-2">{group.teacherName}</td>
                <td className="px-4 py-2">{formatDate(group.startDate)}</td>
                <td className="px-4 py-2 text-center">{(group.students || []).length}</td>
                {userRole !== "teacher" && (
                  <td className="px-4 py-2 text-center flex justify-center gap-2">
                    <button
                      className="text-black hover:text-gray-700"
                      onClick={() => {
                        setSelectedGroup(group);
                        setGroupName(group.groupName);
                        setTeacherName(group.teacherName);
                        setStartDate(formatDate(group.startDate));
                        setEditModalOpen(true);
                      }}
                    ><FaEdit /></button>
                    <button
                      className="text-black hover:text-gray-700"
                      onClick={() => { setSelectedGroup(group); setDeleteModalOpen(true); }}
                    ><FaTrash /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Create */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">✖</button>
            <h2 className="text-2xl font-bold mb-4">Yangi Guruh Yaratish</h2>
            <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
              <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Guruh nomi" required className="border p-2 rounded"/>
              <input type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="O‘qituvchi Ism Familiyasi" required className="border p-2 rounded"/>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="border p-2 rounded"/>
              <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">{loading ? "Saqlanmoqda..." : "Guruhni yaratish"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">✖</button>
            <h2 className="text-2xl font-bold mb-4">Guruhni Tahrirlash</h2>
            <form onSubmit={handleEditGroup} className="flex flex-col gap-4">
              <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Guruh nomi" required className="border p-2 rounded"/>
              <input type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="O‘qituvchi Ism Familiyasi" required className="border p-2 rounded"/>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="border p-2 rounded"/>
              <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">{loading ? "Saqlanmoqda..." : "Saqlash"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-lg text-center">
            <h3 className="text-xl font-semibold text-red-600 mb-3">🗑 {selectedGroup?.groupName} ni o‘chirmoqchimisiz?</h3>
            <p className="text-gray-700 mb-5">Bu harakatni tasdiqlaysizmi?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Bekor qilish</button>
              <button onClick={handleDeleteGroup} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Ha, o‘chirilsin</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreateGroupPage;
