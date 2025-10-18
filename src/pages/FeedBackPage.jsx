// FeedBackPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, deleteDoc, doc, addDoc, onSnapshot } from "firebase/firestore";

const FeedBackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  // 🔹 Real-time feedback ma'lumotlarni olish
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "feedback"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.feedbackAt) - new Date(a.feedbackAt));
      setFeedbacks(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 🗑 Foydalanuvchini o'chirish va deleted-users ga qo'shish
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      // 🔹 deleted-users ga qo‘shish
      await addDoc(collection(db, "deleted-users"), {
        id: selectedUser.id, // ID saqlaymiz
        name: selectedUser.name,
        phone: selectedUser.phone,
        extraPhone: selectedUser.extraPhone || "",
        deletedFrom: "feedback",
        deletedAt: new Date().toISOString(),
      });

      // 🔹 feedback dan o‘chirish Firestore’dan
      await deleteDoc(doc(db, "feedback", selectedUser.id));

      // 🔹 SessionStorage orqali ID saqlaymiz (faqat shu refreshda ko‘rinadi)
      sessionStorage.setItem("deletedUserId", selectedUser.id);

      // 🔹 Darhol deleted-users sahifasiga yo‘naltirish
      navigate("/deleted-users");
    } catch (error) {
      console.error("O‘chirishda xatolik:", error);
      alert("O‘chirishda xatolik yuz berdi!");
    }
  };

  // 🕒 Sana formatlash
  const formatUzTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return `${date.getDate().toString().padStart(2,"0")}.${(date.getMonth()+1).toString().padStart(2,"0")}.${date.getFullYear()} - ${date.getHours().toString().padStart(2,"0")}:${date.getMinutes().toString().padStart(2,"0")}`;
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-6 px-3 sm:px-2">
      <h2 className="text-xl sm:text-2xl font-semibold text-blue-500 mb-5 text-center">
        📞 Qayta aloqa foydalanuvchilari
      </h2>

      <div className="w-full bg-white rounded overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-500 py-10">⏳ Ma'lumotlar yuklanmoqda...</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Qayta aloqa ro'yxati bo'sh 😕</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse text-sm sm:text-base">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="py-3 px-4 font-medium">#</th>
                  <th className="py-3 px-4 font-medium">Ism</th>
                  <th className="py-3 px-4 font-medium">Telefon</th>
                  <th className="py-3 px-4 font-medium">Sabab</th>
                  <th className="py-3 px-4 font-medium">Qo'shilgan sana</th>
                  <th className="py-3 px-4 font-medium text-center">Harakat</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-green-50 transition`}
                  >
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{user.name}</td>
                    <td className="py-2 px-4">{user.phone}</td>
                    <td className="py-2 px-4 text-gray-700 italic">{user.feedbackReason || "-"}</td>
                    <td className="py-2 px-4">{formatUzTime(user.feedbackAt)}</td>
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-2 py-1 text-white bg-red-500 rounded hover:scale-125 transition"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] sm:w-[400px] shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-3">
              🗑 {selectedUser.name} ni o'chirmoqchimisiz?
            </h3>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedBackPage;
