import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const CreateGroupPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Teachers va Groups ma’lumotlarini olish
  const fetchData = async () => {
    try {
      const teachersSnap = await getDocs(collection(db, "teachers"));
      const groupsSnap = await getDocs(collection(db, "groups"));

      const groupsData = groupsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const teachersList = teachersSnap.docs.map((doc) => {
        const teacher = { id: doc.id, ...doc.data() };

        // 🔹 Har bir o‘qituvchining ID bo‘yicha guruhlarini topish
        const teacherGroups = groupsData.filter(
          (g) => g.teacherId === teacher.id
        );

        return { ...teacher, totalGroups: teacherGroups.length };
      });

      setTeachers(teachersList);
      setGroups(groupsData);
    } catch (err) {
      console.error("❌ Ma’lumotlarni olishda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-lg">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      <h1 className="text-3xl font-bold text-center text-blue-500 mb-6">
        O‘qituvchilar ro‘yxati
      </h1>

      <div className="bg-white rounded overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Ism Familya</th>
              <th className="px-4 py-3">Login</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3 text-center">Ja’mi guruhlar</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-500 py-4 italic"
                >
                  Hozircha o‘qituvchilar yo‘q
                </td>
              </tr>
            ) : (
              teachers.map((t, index) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/teacher/${t.id}`)} // 🔹 endi teacherId orqali navigatsiya qiladi
                  className={`border-b cursor-pointer hover:bg-gray-100 ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2  font-semibold text-blue-500 hover:text-blue-600 transition ease-in-out">
                    {t.name}
                  </td>
                  <td className="px-4 py-2">{t.login}</td>
                  <td className="px-4 py-2 text-gray-600">{t.phone}</td>
                  <td className="px-4 py-2 text-center font-medium text-blue-600">
                    {t.totalGroups}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateGroupPage;
