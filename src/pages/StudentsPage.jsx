// src/pages/StudentsPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlus, FaTimes, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";

const StudentsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(null);

  const fetchGroup = async () => {
    const docRef = doc(db, "groups", groupId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) setGroup({ id: docSnap.id, ...docSnap.data() });
    setLoading(false);
  };

  useEffect(() => { fetchGroup(); }, [groupId]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!group) return;
    const groupRef = doc(db, "groups", group.id);
    const updatedStudents = [...(group.students || []), { name: studentName, phone: studentPhone, birthDate }];
    await updateDoc(groupRef, { students: updatedStudents });
    setStudentModalOpen(false);
    setStudentName(""); setStudentPhone(""); setBirthDate("");
    fetchGroup();
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    if (!group || selectedStudentIndex === null) return;
    const updatedStudents = [...group.students];
    updatedStudents[selectedStudentIndex] = { name: studentName, phone: studentPhone, birthDate };
    await updateDoc(doc(db, "groups", group.id), { students: updatedStudents });
    setEditModalOpen(false);
    setSelectedStudentIndex(null);
    setStudentName(""); setStudentPhone(""); setBirthDate("");
    fetchGroup();
  };

  const handleDeleteStudent = async () => {
    if (!group || selectedStudentIndex === null) return;
    const updatedStudents = [...group.students];
    updatedStudents.splice(selectedStudentIndex, 1);
    await updateDoc(doc(db, "groups", group.id), { students: updatedStudents });
    setDeleteModalOpen(false);
    setSelectedStudentIndex(null);
    fetchGroup();
  };

  if (loading) return <p className="text-center mt-10">Yuklanmoqda...</p>;

  return (
    <div className="min-h-screen p-0 bg-gray-50">
      {/* Header: Ortga va Qo‘shish tugmalari */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
        {/* Ortga qaytish */}
        <button onClick={() => navigate("/create-group")} className="text-gray-600 hover:text-gray-800 self-start sm:self-auto">
          <FaArrowLeft size={24} />
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-blue-500 text-center flex-1">
          {group?.groupName} - O‘quvchilar
        </h1>

        {/* O‘quvchi qo‘shish */}
        <button
          onClick={() => setStudentModalOpen(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg shadow-md"
        >
          <FaPlus /> O‘quvchi qo‘shish
        </button>
      </div>

      {(!group.students || group.students.length === 0) ? (
        <p className="text-center text-gray-500">Hozircha o‘quvchilar mavjud emas</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-left text-sm sm:text-base">
            <thead className="bg-blue-500 text-white text-xs sm:text-sm">
              <tr>
                <th className="px-2 sm:px-4 py-2">#</th>
                <th className="px-2 sm:px-4 py-2">Ism</th>
                <th className="px-2 sm:px-4 py-2">Telefon</th>
                <th className="px-2 sm:px-4 py-2">Tug‘ilgan sana</th>
                <th className="px-2 sm:px-4 py-2 text-center">Harakat</th>
              </tr>
            </thead>
            <tbody>
              {group.students.map((student, index) => (
                <tr key={index} className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}>
                  <td className="px-2 sm:px-4 py-2">{index + 1}</td>
                  <td className="px-2 sm:px-4 py-2">{student.name}</td>
                  <td className="px-2 sm:px-4 py-2">{student.phone}</td>
                  <td className="px-2 sm:px-4 py-2">{student.birthDate}</td>
                  <td className="px-2 sm:px-4 py-2 text-center flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedStudentIndex(index);
                        setStudentName(student.name);
                        setStudentPhone(student.phone);
                        setBirthDate(student.birthDate);
                        setEditModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudentIndex(index);
                        setDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: O‘quvchi qo‘shish */}
      {studentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-2">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => setStudentModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><FaTimes size={20}/></button>
            <h2 className="text-2xl font-bold mb-4">O‘quvchi qo‘shish</h2>
            <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
              <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Ism Familiya" required className="border p-2 sm:p-3 rounded text-sm sm:text-base"/>
              <input type="text" value={studentPhone} onChange={e => setStudentPhone(e.target.value)} placeholder="Telefon raqami" required className="border p-2 sm:p-3 rounded text-sm sm:text-base"/>
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required className="border p-2 sm:p-3 rounded text-sm sm:text-base"/>
              <button type="submit" className="bg-green-500 hover:bg-green-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base">
                Saqlash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Student */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-2">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><FaTimes size={20}/></button>
            <h2 className="text-2xl font-bold mb-4">O‘quvchini tahrirlash</h2>
            <form onSubmit={handleEditStudent} className="flex flex-col gap-4">
              <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Ism Familiya" required className="border p-2 sm:p-3 rounded text-sm sm:text-base"/>
              <input type="text" value={studentPhone} onChange={e => setStudentPhone(e.target.value)} placeholder="Telefon raqami" required className="border p-2 sm:p-3 rounded text-sm sm:text-base"/>
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required className="border p-2 sm:p-3 rounded text-sm sm:text-base"/>
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base">
                Saqlash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Student */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-2">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-lg text-center">
            <h3 className="text-xl font-semibold text-red-600 mb-3">
              🗑 {group.students[selectedStudentIndex]?.name} ni o‘chirmoqchimisiz?
            </h3>
            <p className="text-gray-700 mb-5">Bu harakatni tasdiqlaysizmi?</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Bekor qilish
              </button>
              <button onClick={handleDeleteStudent} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Ha, o‘chirilsin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
