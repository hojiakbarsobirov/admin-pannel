// src/pages/TeacherPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const TeacherPage = () => {
  const [teacher, setTeacher] = useState(null);
  const [groups, setGroups] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentTeacherLogin = localStorage.getItem("currentTeacher");

  useEffect(() => {
    const fetchTeacherAndGroups = async () => {
      try {
        if (!currentTeacherLogin) {
          console.error("O‘qituvchi login topilmadi!");
          setLoading(false);
          return;
        }

        // 🔹 O‘qituvchini olish
        const teachersSnap = await getDocs(collection(db, "teachers"));
        const teachers = teachersSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        const foundTeacher = teachers.find(
          (t) => t.login === currentTeacherLogin
        );

        if (!foundTeacher) {
          console.warn("O‘qituvchi topilmadi!");
          setLoading(false);
          return;
        }

        setTeacher(foundTeacher);

        // 🔹 O‘qituvchining guruhlarini olish
        const groupsQ = query(
          collection(db, "groups"),
          where("teacherId", "==", foundTeacher.id)
        );
        const groupSnap = await getDocs(groupsQ);
        const groupData = groupSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setGroups(groupData);

        // 🔹 Har bir guruh uchun o‘quvchilar soni
        for (const group of groupData) {
          const studentsQ = query(
            collection(db, "students"),
            where("groupId", "==", group.id)
          );
          const studentsSnap = await getDocs(studentsQ);
          setStudentCounts((prev) => ({
            ...prev,
            [group.id]: studentsSnap.size,
          }));
        }
      } catch (error) {
        console.error("❌ Ma’lumotlarni olishda xato:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherAndGroups();
  }, [currentTeacherLogin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Ma’lumotlar yuklanmoqda...
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        O‘qituvchi ma’lumotlari topilmadi.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      {/* 🔹 Sarlavha va o‘qituvchi ismi */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-500">Guruhlar ro‘yxati</h1>
        <h2 className="text-xl font-semibold text-gray-700">
          {teacher.name} {teacher.surname}
        </h2>
      </div>

      {/* 🔹 Guruhlar jadvali */}
      <div className="bg-white rounded shadow overflow-x-auto">
        {groups.length === 0 ? (
          <div className="text-center py-6 text-gray-500 italic">
            Sizda hozircha guruhlar mavjud emas.
          </div>
        ) : (
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Guruh nomi</th>
                <th className="px-4 py-3">Yaratilgan sana</th>
                <th className="px-4 py-3 text-center">O‘quvchilar soni</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, index) => (
                <tr
                  key={group.id}
                  className={`border-b hover:bg-gray-100 cursor-pointer ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                  onClick={() =>
                    navigate(`/teacher/${teacher.id}/group/${group.id}`)
                  }
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 text-blue-600 font-medium">
                    {group.groupName}
                  </td>
                  <td className="px-4 py-2">{group.createdAt || "–"}</td>
                  <td className="px-4 py-2 text-center font-semibold">
                    {studentCounts[group.id] ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeacherPage;
