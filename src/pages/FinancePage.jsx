import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

const FinancePage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [editData, setEditData] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);

  // Raqam formatlash
  const formatNumber = (num) => {
    if (!num) return "0";
    return Number(num).toLocaleString("uz-UZ");
  };

  // 🔄 Ma'lumotlarni olish
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "payments"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPayments(data);
    } catch (error) {
      console.error(error);
      alert("⚠️ Ma’lumotlarni yuklashda xatolik yuz berdi!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // 🖊️ Tahrirlashni boshlash
  const handleEditClick = (payment) => {
    setEditPaymentId(payment.id);
    setExpandedRow(payment.id);
    setEditData({
      name: payment.name || "",
      phone: payment.phone || "",
      tarif: payment.tarif || "",
      groupName: payment.groupName || "",
      operator: payment.operator || "",
      amount: payment.amount || "",
      paymentType: payment.paymentType || "naqt",
      date: payment.date || "",
    });
  };

  // Input o‘zgarishlari
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  // 💾 Saqlash
  const handleSave = async () => {
    if (!editPaymentId) return;

    const docRef = doc(db, "payments", editPaymentId);
    try {
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        alert("❌ Ushbu hujjat mavjud emas!");
        return;
      }

      await updateDoc(docRef, editData);
      alert("✅ Ma’lumotlar muvaffaqiyatli yangilandi!");
      setEditPaymentId(null);
      setExpandedRow(null);
      setEditData({});
      fetchPayments();
    } catch (error) {
      console.error(error);
      alert("❌ Ma’lumotlarni yangilashda xatolik yuz berdi!");
    }
  };

  // 💰 Statistika
  const { totalCash, totalCard, totalAll } = payments.reduce(
    (acc, curr) => {
      const amount = Number(curr.amount) || 0;
      if (curr.paymentType === "naqt") acc.totalCash += amount;
      if (curr.paymentType === "karta") acc.totalCard += amount;
      acc.totalAll += amount;
      return acc;
    },
    { totalCash: 0, totalCard: 0, totalAll: 0 }
  );

  return (
    <section className="p-4 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-center text-blue-500 mb-6">
        💰 Moliyaviy Hisobot
      </h1>

      {/* Statistika */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
        <div className="bg-green-100 text-green-800 px-5 py-3 rounded-lg shadow font-medium">
          Naqt to‘lovlar: <strong>{formatNumber(totalCash)}</strong> so‘m
        </div>
        <div className="bg-blue-100 text-blue-800 px-5 py-3 rounded-lg shadow font-medium">
          Karta to‘lovlar: <strong>{formatNumber(totalCard)}</strong> so‘m
        </div>
        <div className="bg-yellow-100 text-yellow-800 px-5 py-3 rounded-lg shadow font-medium">
          Jami to‘lovlar: <strong>{formatNumber(totalAll)}</strong> so‘m
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">⏳ Yuklanmoqda...</p>
      ) : payments.length === 0 ? (
        <p className="text-center text-gray-600">
          Hech qanday to‘lov ma’lumotlari topilmadi.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full border-collapse text-sm sm:text-base">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Ism</th>
                <th className="py-2 px-3">Telefon</th>
                <th className="py-2 px-3">Summasi</th>
                <th className="py-2 px-3">Harakat</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, index) => (
                <React.Fragment key={p.id}>
                  <tr
                    className={`cursor-pointer ${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    } border-b hover:bg-gray-200 transition`}
                    onClick={() =>
                      setExpandedRow(expandedRow === p.id ? null : p.id)
                    }
                  >
                    <td className="py-2 px-3">{index + 1}</td>
                    <td className="py-2 px-3">{p.name}</td>
                    <td className="py-2 px-3">{p.phone}</td>
                    <td className="py-2 px-3">{formatNumber(p.amount)}</td>
                    <td className="py-2 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(p);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
                      >
                        O‘zgartirish
                      </button>
                    </td>
                  </tr>

                  {/* Pastki panel */}
                  {expandedRow === p.id && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 border-b p-4">
                        {editPaymentId === p.id ? (
                          // ✏️ Tahrirlash formasi
                          <div className="grid sm:grid-cols-2 gap-2">
                            <input
                              name="name"
                              value={editData.name}
                              onChange={handleChange}
                              className="border px-2 py-1 rounded"
                              placeholder="Ism"
                            />
                            <input
                              name="phone"
                              value={editData.phone}
                              onChange={handleChange}
                              className="border px-2 py-1 rounded"
                              placeholder="Telefon"
                            />
                            <input
                              name="tarif"
                              value={editData.tarif}
                              onChange={handleChange}
                              className="border px-2 py-1 rounded"
                              placeholder="Tarif"
                            />
                            <input
                              name="groupName"
                              value={editData.groupName}
                              onChange={handleChange}
                              className="border px-2 py-1 rounded"
                              placeholder="Guruh"
                            />
                            <input
                              name="operator"
                              value={editData.operator}
                              onChange={handleChange}
                              className="border px-2 py-1 rounded"
                              placeholder="Operator"
                            />
                            <input
                              name="amount"
                              type="number"
                              value={editData.amount}
                              onChange={handleChange}
                              className="border px-2 py-1 rounded"
                              placeholder="Summasi"
                            />
                            <select
                              name="paymentType"
                              value={editData.paymentType}
                              onChange={handleChange}
                              className="border px-2 py-1 rounded"
                            >
                              <option value="naqt">Naqt</option>
                              <option value="karta">Karta</option>
                            </select>
                            <input
                              name="date"
                              type="date"
                              value={editData.date}
                              onChange={handleChange}
                              className="border px-2 py-1 rounded"
                            />

                            <div className="flex justify-end gap-2 sm:col-span-2 mt-3">
                              <button
                                onClick={() => {
                                  setEditPaymentId(null);
                                  setExpandedRow(null);
                                }}
                                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-600"
                              >
                                Bekor qilish
                              </button>
                              <button
                                onClick={handleSave}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Saqlash
                              </button>
                            </div>
                          </div>
                        ) : (
                          // 👁️ Ko‘rish rejimi
                          <div className="grid gap-1">
                            <p>
                              <strong>Ism:</strong> {p.name}
                            </p>
                            <p>
                              <strong>Telefon:</strong> {p.phone}
                            </p>
                            <p>
                              <strong>Tarif:</strong> {p.tarif}
                            </p>
                            <p>
                              <strong>Guruh:</strong> {p.groupName}
                            </p>
                            <p>
                              <strong>Operator:</strong> {p.operator}
                            </p>
                            <p>
                              <strong>Summasi:</strong>{" "}
                              {formatNumber(p.amount)} so‘m
                            </p>
                            <p>
                              <strong>To‘lov turi:</strong> {p.paymentType}
                            </p>
                            <p>
                              <strong>To‘lov sanasi:</strong> {p.date || "-"}
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default FinancePage;
