// DeletedUsersPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, deleteDoc, doc, addDoc, onSnapshot } from "firebase/firestore";

const DeletedUsersPage = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [search, setSearch] = useState("");

  // 🔹 Real-time deleted-users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "deleted-users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      data.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
      setDeletedUsers(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ♻️ Qayta tiklash
  const handleRestore = async () => {
    if (!selectedUser) return;
    try {
      // Registratsiya ga qo‘shish
      await addDoc(collection(db, "registrations"), {
        name: selectedUser.name,
        phone: selectedUser.phone,
        extraPhone: selectedUser.extraPhone || "",
        createdAt: new Date().toISOString(),
      });

      // deleted-users dan to‘liq o‘chirish
      await deleteDoc(doc(db, "deleted-users", selectedUser.id));

      // Frontenddan darhol olib tashlash
      setDeletedUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));

      setShowRestoreModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("❌ Qayta tiklashda xatolik:", error);
    }
  };

  // 🗑 Butunlay o‘chirish
  const handlePermanentDelete = async () => {
    if (!selectedUser) return;
    try {
      // deleted-users dan to‘liq o‘chirish
      await deleteDoc(doc(db, "deleted-users", selectedUser.id));

      // Frontenddan darhol olib tashlash
      setDeletedUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));

      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("❌ O‘chirishda xatolik:", error);
    }
  };

  const filteredUsers = deletedUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  const formatUzTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return `${date.toLocaleDateString("uz-UZ")} ${date
      .toLocaleTimeString("uz-UZ")
      .slice(0, 5)}`;
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-6 px-3 sm:px-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-red-600 mb-5 text-center">
        🗑 O‘chirilgan foydalanuvchilar
      </h2>

      <div className="w-full max-w-5xl mb-4">
        <input
          type="text"
          placeholder="🔍 Ism yoki raqam orqali qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="w-full max-w-6xl bg-white rounded-lg overflow-hidden border border-gray-300 shadow">
        {loading ? (
          <p className="text-center text-gray-500 py-10">⏳ Ma’lumotlar yuklanmoqda...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            O‘chirilgan foydalanuvchilar topilmadi 😕
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse text-sm sm:text-base">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="py-3 px-4 font-medium">#</th>
                  <th className="py-3 px-4 font-medium">Ism</th>
                  <th className="py-3 px-4 font-medium">Telefon</th>
                  <th className="py-3 px-4 font-medium">Tg | WhatsApp</th>
                  <th className="py-3 px-4 font-medium">O‘chirilgan sana</th>
                  <th className="py-3 px-4 font-medium text-center">Harakat</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-red-50 transition`}
                  >
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{user.name}</td>
                    <td className="py-2 px-4">{user.phone}</td>
                    <td className="py-2 px-4">{user.extraPhone || "-"}</td>
                    <td className="py-2 px-4">{formatUzTime(user.deletedAt)}</td>
                    <td className="py-2 px-4 text-center space-x-2">
                      <button
                        onClick={() => { setSelectedUser(user); setShowRestoreModal(true); }}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        ♻️ Qayta tiklash
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        🗑 O‘chirish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showRestoreModal && selectedUser && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[380px] shadow-lg text-center">
            <h3 className="text-lg font-semibold text-green-600 mb-3">♻️ Qayta tiklash</h3>
            <p className="text-gray-700 mb-5">{selectedUser.name} ni qayta tiklamoqchimisiz?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => { setShowRestoreModal(false); setSelectedUser(null); }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleRestore}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Ha, tiklansin
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[380px] shadow-lg text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-3">🗑 Foydalanuvchini butunlay o‘chirish</h3>
            <p className="text-gray-700 mb-5">{selectedUser.name} ni bazadan butunlay o‘chirmoqchimisiz?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handlePermanentDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Ha, o‘chirilsin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedUsersPage;
