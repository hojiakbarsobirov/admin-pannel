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
  const [expandedRows, setExpandedRows] = useState({}); // ✅ qo‘shildi

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
      await addDoc(collection(db, "registrations"), {
        name: selectedUser.name,
        phone: selectedUser.phone,
        extraPhone: selectedUser.extraPhone || "",
        createdAt: new Date().toISOString(),
      });

      await deleteDoc(doc(db, "deleted-users", selectedUser.id));

      setShowRestoreModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("❌ Qayta tiklashda xatolik:", error);
      alert("❌ Qayta tiklashda muammo yuz berdi!");
    }
  };

  // 🗑 Butunlay o‘chirish
  const handlePermanentDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteDoc(doc(db, "deleted-users", selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("❌ O‘chirishda xatolik:", error);
      alert("❌ O‘chirishda muammo yuz berdi!");
    }
  };

  // 🔍 Qidiruv
  const filteredUsers = deletedUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  const formatUzTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const day = String(date.getDate()).padStart(2,"0");
    const month = String(date.getMonth()+1).padStart(2,"0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2,"0");
    const minutes = String(date.getMinutes()).padStart(2,"0");
    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-2 px-0 sm:px-0">
      <h2 className="text-xl sm:text-4xl font-bold text-blue-500 mb-2 text-center">
        🗑 O‘chirilgan foydalanuvchilar
      </h2>

      {/* Qidiruv input */}
      <div className="w-full max-w-5xl mb-4">
        <input
          type="text"
          placeholder="🔍 Ism yoki raqam orqali qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-[1px] focus:ring-blue-500"
        />
      </div>

      {/* Jadval */}
      <div className="w-full bg-white rounded overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-500 py-10">
            ⏳ Ma’lumotlar yuklanmoqda...
          </p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            O‘chirilgan foydalanuvchilar topilmadi 😕
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse text-sm sm:text-base">
              <thead className="bg-blue-500 text-white">
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
                  <React.Fragment key={`${user.id}-${index}`}>
                    <tr
                      className={`border-b ${
                        index % 2 === 0 ? "bg-gray-100" : "bg-white"
                      } hover:bg-red-50 transition cursor-pointer`}
                      onClick={() =>
                        setExpandedRows({
                          ...expandedRows,
                          [user.id]: !expandedRows[user.id],
                        })
                      }
                    >
                      <td className="py-2 px-4">{index + 1}</td>
                      <td className="py-2 px-4">{user.name}</td>
                      <td className="py-2 px-4">{user.phone}</td>
                      <td className="py-2 px-4">{user.extraPhone || "-"}</td>
                      <td className="py-2 px-4">{formatUzTime(user.deletedAt)}</td>
                      <td className="py-2 px-4 text-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setShowRestoreModal(true);
                          }}
                          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          ♻️ tiklash
                        </button>
                      </td>
                    </tr>

                    {expandedRows[user.id] && (
                      <tr className={`${index % 2 === 0 ? "bg-gray-100" : "bg-gray-100"}`}>
                        <td colSpan={6} className="py-2 px-4 text-gray-700 italic">
                          <strong>O‘chirish sababi:</strong> {user.deleteReason || "-"}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ♻️ Qayta tiklash modal */}
      {showRestoreModal && selectedUser && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[380px] shadow-lg text-center">
            <h3 className="text-lg font-semibold text-green-600 mb-3">
              ♻️ Qayta tiklash
            </h3>
            <p className="text-gray-700 mb-5">
              {selectedUser.name} ni qayta tiklamoqchimisiz?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedUser(null);
                }}
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

      {/* 🗑 Butunlay o‘chirish modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[380px] shadow-lg text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-3">
              🗑 Foydalanuvchini butunlay o‘chirish
            </h3>
            <p className="text-gray-700 mb-5">
              {selectedUser.name} ni bazadan butunlay o‘chirmoqchimisiz?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
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
