// src/pages/GroupDetailPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTimes } from "react-icons/fa";

const GroupDetailPage = () => {
  const { teacherId, groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [existingAttendance, setExistingAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Yangi qo‘shilgan: sabab modal state
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reasonText, setReasonText] = useState("");

  useEffect(() => {
    fetchGroupAndStudents();
  }, [groupId]);

  useEffect(() => {
    if (students.length > 0) {
      loadAttendance();
    }
  }, [selectedDate, students]);

  const fetchGroupAndStudents = async () => {
    try {
      setLoading(true);

      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (groupDoc.exists()) {
        setGroup({ id: groupDoc.id, ...groupDoc.data() });
      }

      const studentsQ = query(
        collection(db, "students"),
        where("groupId", "==", groupId)
      );
      const studentsSnap = await getDocs(studentsQ);
      const studentsList = studentsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setStudents(studentsList);

      const initialAttendance = {};
      studentsList.forEach((student) => {
        initialAttendance[student.id] = "keldi";
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error("❌ Ma'lumotlarni olishda xato:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      const attendanceQ = query(
        collection(db, "attendance"),
        where("groupId", "==", groupId),
        where("date", "==", selectedDate)
      );
      const attendanceSnap = await getDocs(attendanceQ);

      if (!attendanceSnap.empty) {
        const attendanceDoc = attendanceSnap.docs[0];
        const attendanceData = attendanceDoc.data();
        setExistingAttendance({ id: attendanceDoc.id, ...attendanceData });
        setAttendance(attendanceData.records || {});
      } else {
        setExistingAttendance(null);
        const defaultAttendance = {};
        students.forEach((student) => {
          defaultAttendance[student.id] = "keldi";
        });
        setAttendance(defaultAttendance);
      }
    } catch (error) {
      console.error("❌ Davomatni yuklashda xato:", error);
    }
  };

  // 🔹 Agar sababli bosilsa, modal ochiladi
  const handleAttendanceChange = (studentId, status) => {
    if (status === "sababli") {
      setSelectedStudent(studentId);
      setShowReasonModal(true);
      setReasonText("");
    } else {
      setAttendance((prev) => ({
        ...prev,
        [studentId]: status,
      }));
    }
  };

  // 🔹 Sababni saqlash
  const handleSaveReason = () => {
    if (!reasonText.trim()) {
      alert("Iltimos, sababni kiriting!");
      return;
    }
    setAttendance((prev) => ({
      ...prev,
      [selectedStudent]: { status: "sababli", reason: reasonText },
    }));
    setShowReasonModal(false);
    setSelectedStudent(null);
    setReasonText("");
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);

      const attendanceData = {
        groupId,
        teacherId,
        date: selectedDate,
        records: attendance,
        createdAt: new Date().toISOString(),
      };

      if (existingAttendance) {
        await updateDoc(doc(db, "attendance", existingAttendance.id), {
          records: attendance,
          updatedAt: new Date().toISOString(),
        });
        alert("✅ Davomat muvaffaqiyatli yangilandi!");
      } else {
        await addDoc(collection(db, "attendance"), attendanceData);
        alert("✅ Davomat muvaffaqiyatli saqlandi!");
      }

      loadAttendance();
    } catch (error) {
      console.error("❌ Davomatni saqlashda xato:", error);
      alert("❌ Xatolik yuz berdi!");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    const s = typeof status === "object" ? status.status : status;
    switch (s) {
      case "keldi":
        return "bg-green-100 text-green-800 border-green-300";
      case "kelmadi":
        return "bg-red-100 text-red-800 border-red-300";
      case "sababli":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status) => {
    const s = typeof status === "object" ? status.status : status;
    switch (s) {
      case "keldi":
        return "✓ Keldi";
      case "kelmadi":
        return "✗ Kelmadi";
      case "sababli":
        return "⚠ Sababli";
      default:
        return s;
    }
  };

  const calculateStats = () => {
    const stats = { keldi: 0, kelmadi: 0, sababli: 0 };
    Object.values(attendance).forEach((s) => {
      const status = typeof s === "object" ? s.status : s;
      if (stats[status] !== undefined) stats[status]++;
    });
    return stats;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Ma'lumotlar yuklanmoqda...
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      <div className="mb-6">
        <button
          onClick={() => navigate("/teachers")}
          className="mb-4 px-4 py-2 transition"
        >
          <FaArrowLeft size={20} />
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">
              {group?.groupName || "Guruh"}
            </h1>
            <p className="text-gray-600 mt-1">
              Jami o'quvchilar: {students.length} ta
            </p>
          </div>
        </div>
      </div>

      {/* Sana va statistikalar */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sana tanlang:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {stats.keldi}
              </div>
              <div className="text-xs text-green-700">Keldi</div>
            </div>
            <div className="text-center px-4 py-2 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {stats.kelmadi}
              </div>
              <div className="text-xs text-red-700">Kelmadi</div>
            </div>
            <div className="text-center px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.sababli}
              </div>
              <div className="text-xs text-yellow-700">Sababli</div>
            </div>
          </div>
        </div>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded shadow overflow-hidden">
        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-500 italic">
            Bu guruhda o'quvchilar mavjud emas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Ism Familiya</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3 text-center">Holati</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr
                    key={student.id}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      {student.name} {student.surname}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.phone || "–"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        {["keldi", "kelmadi", "sababli"].map((status) => (
                          <button
                            key={status}
                            onClick={() =>
                              handleAttendanceChange(student.id, status)
                            }
                            className={`px-3 py-1 rounded-lg border-2 text-sm font-medium transition ${
                              (typeof attendance[student.id] === "object"
                                ? attendance[student.id].status
                                : attendance[student.id]) === status
                                ? getStatusColor(attendance[student.id])
                                : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {getStatusLabel(status)}
                          </button>
                        ))}
                      </div>
                      {attendance[student.id]?.reason && (
                        <p className="text-xs text-yellow-600 mt-1 italic">
                          Sabab: {attendance[student.id].reason}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Saqlash tugmasi */}
      {students.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveAttendance}
            disabled={saving}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving
              ? "Saqlanmoqda..."
              : existingAttendance
              ? "Davomatni yangilash"
              : "Davomatni saqlash"}
          </button>
        </div>
      )}

      {/* 🔹 Sabab modal oynasi */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <button
              onClick={() => setShowReasonModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <FaTimes />
            </button>
            <h3 className="text-lg font-semibold mb-3">Sababni kiriting</h3>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              rows="4"
              placeholder="Masalan: Kasal bo‘ldi"
              className="w-full border p-2 rounded mb-4 resize-none"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReasonModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSaveReason}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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

export default GroupDetailPage;
