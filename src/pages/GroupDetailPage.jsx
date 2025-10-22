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
import { FaArrowLeft } from "react-icons/fa";

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

      // Guruh ma'lumotlarini olish
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (groupDoc.exists()) {
        setGroup({ id: groupDoc.id, ...groupDoc.data() });
      }

      // O'quvchilarni olish
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

      // Boshlang'ich davomat holatini o'rnatish
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
      // Tanlangan sana uchun mavjud davomatni tekshirish
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
        // Agar davomat mavjud bo'lmasa, default holatga o'rnatish
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

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
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
        // Mavjud davomatni yangilash
        await updateDoc(doc(db, "attendance", existingAttendance.id), {
          records: attendance,
          updatedAt: new Date().toISOString(),
        });
        alert("✅ Davomat muvaffaqiyatli yangilandi!");
      } else {
        // Yangi davomat yaratish
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
    switch (status) {
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
    switch (status) {
      case "keldi":
        return "✓ Keldi";
      case "kelmadi":
        return "✗ Kelmadi";
      case "sababli":
        return "⚠ Sababli";
      default:
        return status;
    }
  };

  const calculateStats = () => {
    const stats = { keldi: 0, kelmadi: 0, sababli: 0 };
    Object.values(attendance).forEach((status) => {
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
      onClick={() => navigate("/teachers")}
      className="mb-4 px-4 py-2  transition"
    >
      <FaArrowLeft size={20} /> {/* Icon o'zi tugmaga qo'yildi */}
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

      {/* Sana tanlash va statistika */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
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

          {/* Statistika */}
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

      {/* Davomat jadvali */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                              attendance[student.id] === status
                                ? getStatusColor(status)
                                : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {getStatusLabel(status)}
                          </button>
                        ))}
                      </div>
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
    </div>
  );
};

export default GroupDetailPage;