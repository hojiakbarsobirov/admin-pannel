// src/pages/AttendancePage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { FaCheck, FaTimes, FaExclamationTriangle, FaCalendarAlt, FaTrash } from "react-icons/fa";

const AttendancePage = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [groupsMap, setGroupsMap] = useState({});
  const [teachersMap, setTeachersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const groupsSnap = await getDocs(collection(db, "groups"));
      const groups = {};
      groupsSnap.docs.forEach((doc) => {
        groups[doc.id] = { id: doc.id, ...doc.data() };
      });
      setGroupsMap(groups);

      const teachersSnap = await getDocs(collection(db, "teachers"));
      const teachers = {};
      teachersSnap.docs.forEach((doc) => {
        teachers[doc.id] = { id: doc.id, ...doc.data() };
      });
      setTeachersMap(teachers);

      const attendanceQ = query(collection(db, "attendance"), orderBy("date", "desc"));
      const attendanceSnap = await getDocs(attendanceQ);
      const attendanceList = attendanceSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendanceRecords(attendanceList);
    } catch (error) {
      console.error("❌ Ma'lumotlarni yuklashda xato:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records) => {
    const stats = { keldi: 0, kelmadi: 0, sababli: 0 };
    if (records) {
      Object.values(records).forEach((value) => {
        const status = typeof value === "object" ? value.status : value;
        if (stats[status] !== undefined) stats[status]++;
      });
    }
    return stats;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatDateInput = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  };

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchGroup = selectedGroup === "all" || record.groupId === selectedGroup;
    const matchDate = selectedDate === "all" || formatDateInput(record.date) === selectedDate;
    return matchGroup && matchDate;
  });

  const uniqueDates = [...new Set(attendanceRecords.map((r) => formatDateInput(r.date)))].sort().reverse();

  // 🔹 O'chirish modalini ochish
  const openDeleteModal = (attendanceId) => {
    setAttendanceToDelete(attendanceId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!attendanceToDelete) return;
    try {
      await deleteDoc(doc(db, "attendance", attendanceToDelete));
      setAttendanceRecords((prev) => prev.filter((record) => record.id !== attendanceToDelete));
      setDeleteModalOpen(false);
      setAttendanceToDelete(null);
      alert("✅ Davomat o'chirildi!");
    } catch (error) {
      console.error("❌ Davomatni o'chirishda xato:", error);
      alert("❌ Xato yuz berdi!");
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setAttendanceToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Ma'lumotlar yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Davomatlar tarixi</h1>
        <p className="text-gray-600">Barcha saqlangan davomatlar ro'yxati</p>
      </div>

      {/* Filterlar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guruh bo'yicha filtr:
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Barcha guruhlar</option>
              {Object.values(groupsMap).map((group) => (
                <option key={group.id} value={group.id}>
                  {group.groupName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kun bo'yicha filtr:
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Barcha kunlar</option>
              {uniqueDates.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-4 text-sm">
          <div className="text-gray-600">
            Jami davomatlar: <span className="font-bold">{filteredRecords.length}</span>
          </div>
        </div>
      </div>

      {/* Davomatlar ro'yxati */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 italic">
            Davomatlar topilmadi
          </div>
        ) : (
          filteredRecords.map((attendance) => {
            const group = groupsMap[attendance.groupId];
            const teacher = teachersMap[attendance.teacherId];
            const stats = calculateStats(attendance.records);
            const totalStudents = Object.keys(attendance.records || {}).length;

            // 🔹 Sababli o'quvchilar ro'yxatini tayyorlash
            const sababliStudents = Object.entries(attendance.records)
              .filter(([_, val]) => {
                const status = typeof val === "object" ? val.status : val;
                return status === "sababli";
              })
              .map(([studentId, val]) => {
                const sabab = typeof val === "object" ? val.reason || "Sabab ko‘rsatilmagan" : "Sabab yo‘q";
                return { studentId, sabab };
              });

            return (
              <div
                key={attendance.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCalendarAlt className="text-blue-500" />
                      <h3 className="text-xl font-bold text-gray-800">
                        {formatDate(attendance.date)}
                      </h3>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">Guruh:</span> {group?.groupName || "Noma'lum"}
                      </p>
                      <p>
                        <span className="font-semibold">O'qituvchi:</span> {teacher ? teacher.name : "Noma'lum"}
                      </p>
                      <p>
                        <span className="font-semibold">Jami o'quvchilar:</span> {totalStudents} ta
                      </p>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        <span>Keldi: {stats.keldi} ta</span>
                        <span>Kelmadi: {stats.kelmadi} ta</span>
                        <span>Sababli: {stats.sababli} ta</span>
                      </div>

                      {/* 🔹 Sababli o'quvchilar sabablari */}
                      {sababliStudents.length > 0 && (
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <h4 className="font-semibold text-yellow-700 mb-2">Sababli o'quvchilar:</h4>
                          <ul className="text-yellow-800 text-sm list-disc list-inside space-y-1">
                            {sababliStudents.map((s, i) => (
                              <li key={i}>{s.sabab}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                      <FaCheck className="text-green-600 mx-auto" size={24} />
                      <div className="text-green-600 font-bold mt-1">{stats.keldi}</div>
                    </div>

                    <div className="text-center px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                      <FaTimes className="text-red-600 mx-auto" size={24} />
                      <div className="text-red-600 font-bold mt-1">{stats.kelmadi}</div>
                    </div>

                    <div className="text-center px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
                      <FaExclamationTriangle className="text-yellow-600 mx-auto" size={24} />
                      <div className="text-yellow-600 font-bold mt-1">{stats.sababli}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${(stats.keldi / totalStudents) * 100}%`,
                    }}
                  />
                </div>

                {/* 🔹 O'chirish tugmasi */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => openDeleteModal(attendance.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <FaTrash /> O'chirish
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 🔹 O'chirish modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg">
            <h2 className="text-lg font-bold mb-4">Davomatni o'chirish</h2>
            <p className="mb-4">Siz ushbu kunlik davomatni o'chirmoqchimisiz?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
