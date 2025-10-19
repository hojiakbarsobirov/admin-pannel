import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";

const FinancePage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [editData, setEditData] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);

  const formatNumber = (num) => {
    if (!num) return "-";
    return Number(num).toLocaleString("uz-UZ");
  };

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
    setExpandedRow(payment.id);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = async () => {
    if (!editPaymentId) return;
    const docRef = doc(db, "payments", editPaymentId);
    try {
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        alert("❌ Ushbu hujjat mavjud emas!");
        setEditPaymentId(null);
        setExpandedRow(null);
        setEditData({});
        fetchPayments();
        return;
      }

      await updateDoc(docRef, {
        name: editData.name || "",
        phone: editData.phone || "",
        tarif: editData.tarif || "",
        groupName: editData.groupName || "",
        operator: editData.operator || "",
        amount: editData.amount || "",
        paymentType: editData.paymentType || "naqt",
        date: editData.date || "",
      });

      alert("✅ Ma’lumotlar yangilandi!");
      setEditPaymentId(null);
      setExpandedRow(null);
      setEditData({});
      fetchPayments();
    } catch (error) {
      console.error(error);
      alert("❌ Yangilashda muammo yuz berdi!");
    }
  };

  return (
    <section className="p-0 py-2 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-center text-blue-500 mb-4">
        💰 Moliyaviy Hisobot
      </h1>

      {loading ? (
        <p className="text-gray-700 text-center">
          ⏳ Ma’lumotlar yuklanmoqda...
        </p>
      ) : payments.length === 0 ? (
        <p className="text-gray-700 text-center">
          Hech qanday to‘lov ma’lumotlari topilmadi.
        </p>
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
                    className={`${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    } border-b cursor-pointer`}
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
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
                      >
                        O'zgartirish
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={5} className="p-0">
                      <div
                        className={`overflow-hidden transition-all duration-500 bg-gray-50 border-b ${
                          expandedRow === p.id ? "max-h-[600px] p-4" : "max-h-0"
                        }`}
                      >
                        {expandedRow === p.id && (
                          <div className="grid gap-2">
                            {editPaymentId !== p.id ? (
                              <>
                                <p><strong>Ism:</strong> {p.name}</p>
                                <p><strong>Telefon:</strong> {p.phone}</p>
                                <p><strong>Tarif:</strong> {p.tarif}</p>
                                <p><strong>Guruh:</strong> {p.groupName}</p>
                                <p><strong>Operator:</strong> {p.operator}</p>
                                <p><strong>Summasi:</strong> {formatNumber(p.amount)}</p>
                                <p><strong>To‘lov turi:</strong> {p.paymentType}</p>
                                <p><strong>To‘lov sanasi:</strong> {p.date || "-"}</p>
                              </>
                            ) : (
                              <>
                                <input name="name" value={editData.name} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Ism" />
                                <input name="phone" value={editData.phone} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Telefon" />
                                <input name="tarif" value={editData.tarif} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Tarif" />
                                <input name="groupName" value={editData.groupName} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Guruh" />
                                <input name="operator" value={editData.operator} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Operator" />
                                <input name="amount" type="number" value={editData.amount} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Summasi" />
                                <select name="paymentType" value={editData.paymentType} onChange={handleChange} className="border px-2 py-1 rounded">
                                  <option value="naqt">Naqt</option>
                                  <option value="karta">Karta</option>
                                </select>
                                <input name="date" type="date" value={editData.date} onChange={handleChange} className="border px-2 py-1 rounded" />

                                <div className="flex justify-end gap-2 mt-2">
                                  <button onClick={() => setEditPaymentId(null)} className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-600">Bekor qilish</button>
                                  <button onClick={handleSave} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Saqlash</button>
                                </div>
                              </>
                            )}
                          </div>
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
