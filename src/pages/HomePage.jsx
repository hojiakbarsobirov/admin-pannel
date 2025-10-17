import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const HomePage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Ma'lumotlarni olish
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "registrations"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUsers(data);
    } catch (error) {
      console.error("Xatolik:", error);
      alert("⚠️ Ma’lumotlarni yuklashda xatolik yuz berdi!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Qidiruv
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  // Vaqt formatlash
  const formatUzTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const uzDate = new Date(date.getTime());
    const day = String(uzDate.getDate()).padStart(2, "0");
    const month = String(uzDate.getMonth() + 1).padStart(2, "0");
    const year = uzDate.getFullYear();
    const hours = String(uzDate.getHours()).padStart(2, "0");
    const minutes = String(uzDate.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  };

  return (
    <div className="min-h-auto w-full bg-gray-50 flex flex-col items-center py-6 px-4">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-blue-700 mb-6">
        📋 Ro‘yxatdan o‘tgan foydalanuvchilar
      </h2>

      {/* Qidiruv input */}
      <div className="w-full max-w-4xl mb-4">
        <input
          type="text"
          placeholder="🔍 Ism yoki raqam orqali qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Jadval */}
      <div className="w-full max-w-5xl bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
        {loading ? (
          <p className="text-center text-gray-500 py-10">
            ⏳ Ma’lumotlar yuklanmoqda...
          </p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            Hech qanday foydalanuvchi topilmadi 😕
          </p>
        ) : (
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-3 px-4 text-sm font-medium">#</th>
                <th className="py-3 px-4 text-sm font-medium">Ism</th>
                <th className="py-3 px-4 text-sm font-medium">Telefon</th>
                <th className="py-3 px-4 text-sm font-medium">Tg | WhatsApp</th>
                <th className="py-3 px-4 text-sm font-medium">Sana</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={`border-b hover:bg-blue-50 transition ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.phone}</td>
                  <td className="py-2 px-4">{user.extraPhone || "-"}</td>
                  <td className="py-2 px-4">{formatUzTime(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HomePage;
