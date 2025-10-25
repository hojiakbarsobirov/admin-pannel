import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { AiFillDelete } from "react-icons/ai";
import { MdOutlinePayment } from "react-icons/md";

const AdvancePaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("id");

  const navigate = useNavigate();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let q = collection(db, "advance-payments");
      if (userId) {
        q = query(q, where("id", "==", userId));
      }
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setPayments(data);
    } catch (error) {
      console.error("Xatolik:", error);
      alert("⚠️ Oldindan to‘lovlarni yuklashda xatolik yuz berdi!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, [userId]);

  const formatUzTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return Number(amount).toLocaleString("uz-UZ");
  };

  const openDeleteModal = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;

    try {
      const deletedRef = doc(db, "deleted-users", selectedPayment.id);

      await setDoc(deletedRef, {
        ...selectedPayment,
        deletedAt: new Date(),
      });

      await deleteDoc(doc(db, "advance-payments", selectedPayment.id));

      setPayments((prev) => prev.filter((p) => p.id !== selectedPayment.id));
      setShowDeleteModal(false);
      setSelectedPayment(null);

      navigate("/deleted-users");
    } catch (error) {
      console.error("O‘chirishda xatolik:", error);
      alert("❌ O‘chirishda muammo yuz berdi!");
    }
  };

  // 🔹 Jami to‘lovlarni hisoblash
  const totalAmount = payments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-4 px-2">
      <h2 className="flex items-center justify-center gap-2 text-xl sm:text-3xl font-bold text-yellow-600 mb-3 text-center">
        <MdOutlinePayment />
        Oldindan to‘lovlar ro‘yxati
      </h2>

      {/* 🔹 Jami to‘lovlar tepada */}
      {!loading && payments.length > 0 && (
        <div className="w-full max-w-5xl flex justify-end mb-3 pr-4">
          <div className="text-right text-lg font-semibold text-gray-700">
            Jami to‘lovlar:{" "}
            <span className="text-green-600">
              {totalAmount.toLocaleString("uz-UZ")} so‘m
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-10">
          Ma’lumotlar yuklanmoqda...
        </p>
      ) : payments.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          Hech qanday oldindan to‘lov topilmadi
        </p>
      ) : (
        <div className="overflow-x-auto w-full max-w-5xl rounded">
          <table className="min-w-full text-left border-collapse text-sm sm:text-base">
            <thead className="bg-yellow-500 text-white">
              <tr>
                <th className="py-3 px-4 font-medium">#</th>
                <th className="py-3 px-4 font-medium">Ism</th>
                <th className="py-3 px-4 font-medium">Telefon</th>
                <th className="py-3 px-4 font-medium">Summa</th>
                <th className="py-3 px-4 font-medium">Sana</th>
                <th className="py-3 px-4 font-medium text-center">Harakat</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, index) => (
                <tr
                  key={p.id}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{p.name}</td>
                  <td className="py-2 px-4">{p.phone}</td>
                  <td className="py-2 px-4">{formatAmount(p.amount)}</td>
                  <td className="py-2 px-4">{formatUzTime(p.paidAt)}</td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => openDeleteModal(p)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      <AiFillDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* O‘chirish modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[380px] shadow-lg text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-3">
              🗑 Oldindan to‘lovni o‘chirish
            </h3>
            <p className="text-gray-700 mb-5">
              {selectedPayment?.name} ning oldindan to‘lovini o‘chirmoqchimisiz?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
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

export default AdvancePaymentPage;
