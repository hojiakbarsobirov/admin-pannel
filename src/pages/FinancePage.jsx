import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

const FinancePage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [editData, setEditData] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);

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

  const handleEditClick = (payment) => {
    setEditPaymentId(payment.id);
    setEditData({ ...payment });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "receipt") {
      setEditData({ ...editData, [name]: files[0] });
    } else {
      setEditData({ ...editData, [name]: value });
    }
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, "payments", editPaymentId);
      const updateObj = { ...editData };

      if (updateObj.receipt && typeof updateObj.receipt !== "string") {
        updateObj.receipt = updateObj.receipt.name;
      }

      await updateDoc(docRef, updateObj);
      setEditPaymentId(null);
      fetchPayments();
      alert("✅ Ma’lumotlar yangilandi!");
    } catch (error) {
      console.error(error);
      alert("❌ Yangilashda muammo yuz berdi!");
    }
  };

  return (
    <section className="p-0 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-center text-blue-500 mb-4">💰 Moliyaviy Hisobot</h1>

      {loading ? (
        <p className="text-gray-700">⏳ Ma’lumotlar yuklanmoqda...</p>
      ) : payments.length === 0 ? (
        <p className="text-gray-700">Hech qanday to‘lov ma’lumotlari topilmadi.</p>
      ) : (
        <div className="overflow-x-auto rounded">
          <table className="min-w-full text-left border-collapse text-sm sm:text-base">
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
                    className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} border-b cursor-pointer`}
                    onClick={() =>
                      setExpandedRow(expandedRow === p.id ? null : p.id)
                    }
                  >
                    <td className="py-2 px-3">{index + 1}</td>
                    <td className="py-2 px-3">{p.name}</td>
                    <td className="py-2 px-3">{p.phone}</td>
                    <td className="py-2 px-3">{p.amount}</td>
                    <td className="py-2 px-3 space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(p);
                        }}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
                      >
                        O'zgartirish
                      </button>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  <tr className="transition-all duration-500">
                    <td colSpan={5} className="p-0">
                      <div
                        className={`overflow-hidden transition-all duration-500 ${
                          expandedRow === p.id ? "max-h-[500px] p-4" : "max-h-0"
                        }`}
                      >
                        {expandedRow === p.id && (
                          editPaymentId === p.id ? (
                            <div className="grid gap-2">
                              <input
                                type="text"
                                name="name"
                                value={editData.name || ""}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                              />
                              <input
                                type="text"
                                name="phone"
                                value={editData.phone || ""}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                              />
                              <select
                                name="tarif"
                                value={editData.tarif || ""}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                              >
                                <option value="">Tanlang</option>
                                <option value="razgovor">Razgovor</option>
                                <option value="premium">Premium</option>
                              </select>
                              <input
                                type="text"
                                name="groupName"
                                value={editData.groupName || ""}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                              />
                              <input
                                type="text"
                                name="operator"
                                value={editData.operator || ""}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                              />
                              <input
                                type="number"
                                name="amount"
                                value={editData.amount || ""}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                              />
                              <select
                                name="paymentType"
                                value={editData.paymentType || ""}
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                              >
                                <option value="naqt">Naqt</option>
                                <option value="karta">Karta</option>
                              </select>
                              <input
                                type="file"
                                name="receipt"
                                onChange={handleChange}
                                className="border px-2 py-1 rounded w-full"
                              />
                              <button
                                onClick={handleSave}
                                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition mt-2"
                              >
                                Saqlash
                              </button>
                            </div>
                          ) : (
                            <div className="text-gray-700 grid gap-1">
                              <p><strong>Tarif:</strong> {p.tarif}</p>
                              <p><strong>Guruh:</strong> {p.groupName}</p>
                              <p><strong>Operator:</strong> {p.operator}</p>
                              <p><strong>To‘lov turi:</strong> {p.paymentType}</p>
                              <p><strong>Chek:</strong> {p.receipt || "-"}</p>
                            </div>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
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
