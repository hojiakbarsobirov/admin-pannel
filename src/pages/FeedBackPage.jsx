import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { AiFillDelete } from "react-icons/ai";
import { FaPhoneAlt } from "react-icons/fa";

const FeedBackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    tarif: "",
    groupName: "",
    operator: "",
    amount: "",
    paymentType: "naqt",
    date: "",
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
      await setDoc(doc(db, "deleted-users", selectedUser.id), {
        ...selectedUser,
        deletedFrom: "feedback",
        deletedAt: new Date().toISOString(),
      });

      await deleteDoc(doc(db, "feedback", selectedUser.id));
      setSelectedUser(null);
      setShowDeleteModal(false);
      navigate("/deleted-users");
    } catch (error) {
      console.error(error);
      alert("O‘chirishda muammo yuz berdi!");
    }
  };

  // 💰 To‘lov
  const openPaymentModal = (user) => {
    setSelectedUser(user);
    setShowPaymentModal(true);
    setPaymentData({
      tarif: "",
      groupName: "",
      operator: "",
      amount: "",
      paymentType: "naqt",
      date: "",
    });
  };

  const handlePaymentSubmit = async () => {
    const { tarif, groupName, operator, amount, paymentType, date } = paymentData;
    if (!tarif || !groupName || !operator || !amount || !date) {
      alert("❌ Barcha maydonlarni to‘ldiring!");
      return;
    }

    try {
      const paymentInfo = {
        ...selectedUser,
        tarif,
        groupName,
        operator,
        amount,
        paymentType,
        date,
        paymentAt: new Date().toISOString(),
      };

      // 🔹 Shu foydalanuvchining ID si bilan `payments` kolleksiyasiga saqlaymiz
      await setDoc(doc(db, "payments", selectedUser.id), paymentInfo);

      // 🔹 feedback dan o‘chiramiz
      await deleteDoc(doc(db, "feedback", selectedUser.id));

      setShowPaymentModal(false);
      navigate("/finance");
    } catch (error) {
      console.error("To‘lov saqlashda xatolik:", error);
      alert("❌ To‘lov saqlashda xatolik yuz berdi!");
    }
  };

  // 🕒 Sana formatlash
  const formatUzTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${d}.${m}.${y} - ${h}:${min}`;
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-2 px-0">
      <h2 className="text-xl sm:text-4xl font-bold text-blue-500 mb-5 text-center flex items-center gap-2">
        <FaPhoneAlt className="w-8 mt-2"/> Qayta aloqa foydalanuvchilari
      </h2>

      <div className="w-full bg-white rounded overflow-hidden shadow">
        {loading ? (
          <p className="text-center text-gray-500 py-10">
            ⏳ Ma'lumotlar yuklanmoqda...
          </p>
        ) : feedbacks.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            Qayta aloqa ro'yxati bo'sh 😕
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse text-sm sm:text-base">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="py-3 px-4 font-medium">#</th>
                  <th className="py-3 px-4 font-medium">Ism</th>
                  <th className="py-3 px-4 font-medium">Telefon</th>
                  <th className="py-3 px-4 font-medium">Sabab</th>
                  <th className="py-3 px-4 font-medium">Qo‘shilgan sana</th>
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
                    <td className="py-2 px-4 text-gray-700 italic">
                      {user.feedbackReason || "-"}
                    </td>
                    <td className="py-2 px-4">{formatUzTime(user.feedbackAt)}</td>
                    <td className="py-2 px-4 text-center flex justify-center gap-2">
                      <button
                        onClick={() => openPaymentModal(user)}
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        100% 💰
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        className="px-2 py-1 text-white hover:scale-125 transition"
                      >
                        <AiFillDelete className="text-black"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🗑 O‘chirish modali */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[380px] shadow-lg text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-3">
              🗑 {selectedUser?.name} ni o‘chirmoqchimisiz?
            </h3>
            <p className="text-gray-700 mb-5">
              Ushbu foydalanuvchi "Deleted Users" sahifasiga o‘tkaziladi.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Ha, o‘chirilsin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💰 To‘lov modali */}
      {showPaymentModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center text-green-700">
              💰 To‘lov ma’lumotlari
            </h3>

            <div className="flex flex-col gap-3">
              <label>Ism</label>
              <input
                type="text"
                value={selectedUser?.name || ""}
                readOnly
                className="border border-gray-300 rounded px-3 py-2 bg-gray-100"
              />

              <label>Telefon</label>
              <input
                type="text"
                value={selectedUser?.phone || ""}
                readOnly
                className="border border-gray-300 rounded px-3 py-2 bg-gray-100"
              />

              <label>Tarif</label>
              <select
                className="border border-gray-300 rounded px-3 py-2"
                value={paymentData.tarif}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, tarif: e.target.value })
                }
              >
                <option value="">Tanlang</option>
                <option value="razgovor">Razgovor</option>
                <option value="premium">Premium</option>
              </select>

              <label>Guruh nomi</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2"
                value={paymentData.groupName}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, groupName: e.target.value })
                }
              />

              <label>Operator ismi</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2"
                value={paymentData.operator}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, operator: e.target.value })
                }
              />

              <label>To‘lov summasi</label>
              <input
                type="number"
                className="border border-gray-300 rounded px-3 py-2"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, amount: e.target.value })
                }
              />

              <label>To‘lov sanasi</label>
              <input
                type="date"
                className="border border-gray-300 rounded px-3 py-2"
                value={paymentData.date}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, date: e.target.value })
                }
              />

              <label>To‘lov turi</label>
              <select
                className="border border-gray-300 rounded px-3 py-2"
                value={paymentData.paymentType}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, paymentType: e.target.value })
                }
              >
                <option value="naqt">Naqt</option>
                <option value="karta">Karta</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
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

export default FeedBackPage;
