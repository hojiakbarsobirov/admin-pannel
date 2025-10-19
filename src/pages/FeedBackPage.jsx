// FeedBackPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, deleteDoc, doc, addDoc, onSnapshot } from "firebase/firestore";

const FeedBackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    name: "",
    phone: "",
    tarif: "",
    groupName: "",
    operator: "",
    amount: "",
    paymentType: "naqt",
  });
  const navigate = useNavigate();

  // 🔹 Real-time ma'lumotlarni olish
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "feedback"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.feedbackAt) - new Date(a.feedbackAt));
      setFeedbacks(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🗑 O‘chirish
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await addDoc(collection(db, "deleted-users"), {
        name: selectedUser.name,
        phone: selectedUser.phone,
        extraPhone: selectedUser.extraPhone || "",
        feedbackReason: selectedUser.feedbackReason || "",
        deletedFrom: "feedback",
        feedbackAt: selectedUser.feedbackAt || "",
        deletedAt: new Date().toISOString(),
      });
      if (selectedUser.id) {
        await deleteDoc(doc(db, "feedback", selectedUser.id));
      }
      setSelectedUser(null);
      navigate("/deleted-users");
    } catch (error) {
      console.error(error);
      alert("O‘chirishda muammo yuz berdi. Iltimos, qaytadan urinib ko‘ring!");
    }
  };

  // 🔹 Payment modal input handler
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };

  const handlePaymentSubmit = async () => {
    try {
      await addDoc(collection(db, "payments"), {
        ...paymentData,
        createdAt: new Date().toISOString(),
      });

      // Payment yuborilgach ma'lumotlarni tozalash
      setPaymentData({
        name: "",
        phone: "",
        tarif: "",
        groupName: "",
        operator: "",
        amount: "",
        paymentType: "naqt",
      });
      setShowPaymentModal(false);

      // /finance sahifasiga o'tish
      navigate("/finance");
    } catch (error) {
      console.error(error);
      alert("❌ Ma’lumotlarni yuborishda xatolik yuz berdi!");
    }
  };

  // 🕒 Sana formatlash
  const formatUzTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return `${date.getDate().toString().padStart(2, "0")}.${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}.${date.getFullYear()} - ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-2 px-0">
      <h2 className="text-xl sm:text-4xl font-bold text-blue-500 mb-5 text-center">
        📞 Qayta aloqa foydalanuvchilari
      </h2>

      <div className="w-full bg-white rounded overflow-hidden shadow">
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
                    className={`border-b ${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    } hover:bg-green-50 transition`}
                  >
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{user.name}</td>
                    <td className="py-2 px-4">{user.phone}</td>
                    <td className="py-2 px-4 text-gray-700 italic">{user.feedbackReason || "-"}</td>
                    <td className="py-2 px-4">{formatUzTime(user.feedbackAt)}</td>
                    <td className="py-2 px-4 text-center flex justify-center gap-2">
                      {/* 💵 To‘lov tugmasi */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setPaymentData({
                            name: user.name,
                            phone: user.phone,
                            tarif: "",
                            groupName: "",
                            operator: "",
                            amount: "",
                            paymentType: "naqt",
                          });
                          setShowPaymentModal(true);
                        }}
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        100% 💰
                      </button>

                      {/* 🗑 O‘chirish tugmasi */}
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-2 py-1 text-white rounded hover:scale-125 transition"
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

      {/* 🔹 O‘chirish modal */}
      {selectedUser && !showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] sm:w-[400px] shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-3 text-red-600">
              🗑 {selectedUser.name} ni o'chirmoqchimisiz?
            </h3>
            <p className="text-gray-700 mb-4">
              Ushbu foydalanuvchi "Deleted Users" sahifasiga o'tkaziladi.
            </p>
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

      {/* 🔹 Payment modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-blue-600 text-center">
              💵 To‘lov ma’lumotlarini kiriting
            </h3>
            <div className="grid gap-2">
              <input type="text" name="name" placeholder="Ism" value={paymentData.name} onChange={handlePaymentChange} className="border px-2 py-1 rounded w-full"/>
              <input type="text" name="phone" placeholder="Telefon" value={paymentData.phone} onChange={handlePaymentChange} className="border px-2 py-1 rounded w-full"/>
              <select name="tarif" value={paymentData.tarif} onChange={handlePaymentChange} className="border px-2 py-1 rounded w-full">
                <option value="">Tanlang</option>
                <option value="razgovor">Razgovor</option>
                <option value="premium">Premium</option>
              </select>
              <input type="text" name="groupName" placeholder="Guruh nomi" value={paymentData.groupName} onChange={handlePaymentChange} className="border px-2 py-1 rounded w-full"/>
              <input type="text" name="operator" placeholder="Operator" value={paymentData.operator} onChange={handlePaymentChange} className="border px-2 py-1 rounded w-full"/>
              <input type="number" name="amount" placeholder="Summasi" value={paymentData.amount} onChange={handlePaymentChange} className="border px-2 py-1 rounded w-full"/>
              <select name="paymentType" value={paymentData.paymentType} onChange={handlePaymentChange} className="border px-2 py-1 rounded w-full">
                <option value="naqt">Naqt</option>
                <option value="karta">Karta</option>
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">Bekor qilish</button>
                <button onClick={handlePaymentSubmit} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Yuborish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedBackPage;
