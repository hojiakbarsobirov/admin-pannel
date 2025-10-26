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
  addDoc,
} from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { AiFillDelete } from "react-icons/ai";
import { MdOutlinePayment } from "react-icons/md";
import { FaMoneyBillWave } from "react-icons/fa6";

const AdvancePaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [groups, setGroups] = useState([]);
  const [paymentData, setPaymentData] = useState({
    tarif: "",
    groupName: "",
    operator: "",
    amount: "",
    paymentType: "naqt",
    date: "",
  });

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
      alert("⚠️ Oldindan to'lovlarni yuklashda xatolik yuz berdi!");
    }
    setLoading(false);
  };

  // Guruhlarni olish
  const fetchGroups = async () => {
    try {
      const snapshot = await getDocs(collection(db, "groups"));
      const groupsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupsData);
    } catch (error) {
      console.error("Guruhlarni yuklashda xatolik:", error);
      alert("⚠️ Guruhlarni yuklashda xatolik yuz berdi!");
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchGroups();
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
      console.error("O'chirishda xatolik:", error);
      alert("❌ O'chirishda muammo yuz berdi!");
    }
  };

  // 100% to'lov modalni ochish
  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
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

  // 100% to'lovni saqlash
  const handlePaymentSubmit = async () => {
    if (
      !paymentData.tarif ||
      !paymentData.groupName ||
      !paymentData.operator ||
      !paymentData.amount ||
      !paymentData.date
    ) {
      alert("❌ Barcha maydonlarni to'ldiring!");
      return;
    }
    try {
      // payments ga saqlash
      await setDoc(doc(db, "payments", selectedPayment.id), {
        ...selectedPayment,
        ...paymentData,
        paymentAt: new Date().toISOString(),
      });

      // Tanlangan guruhga students ga qo'shish
      const selectedGroup = groups.find(
        (g) =>
          g.name === paymentData.groupName ||
          g.groupName === paymentData.groupName ||
          g.title === paymentData.groupName
      );

      if (selectedGroup) {
        const studentAddedDate = new Date().toISOString();

        // groups/{groupId}/students ga qo'shish
        await setDoc(
          doc(db, "groups", selectedGroup.id, "students", selectedPayment.id),
          {
            name: selectedPayment.name,
            surname: selectedPayment.surname || "",
            phone: selectedPayment.phone,
            extraPhone: selectedPayment.extraPhone || "",
            tarif: paymentData.tarif,
            amount: paymentData.amount,
            paymentType: paymentData.paymentType,
            operator: paymentData.operator,
            createdAt:
              selectedPayment.createdAt instanceof Date
                ? selectedPayment.createdAt.toISOString()
                : selectedPayment.createdAt,
            addedAt: studentAddedDate,
          }
        );

        // students kolleksiyasiga ham qo'shish
        await addDoc(collection(db, "students"), {
          groupId: selectedGroup.id,
          groupName: paymentData.groupName,
          name: selectedPayment.name,
          surname: selectedPayment.surname || "",
          phone: selectedPayment.phone,
          extraPhone: selectedPayment.extraPhone || "",
          tarif: paymentData.tarif,
          amount: paymentData.amount,
          paymentType: paymentData.paymentType,
          operator: paymentData.operator,
          teacherId: selectedGroup.teacherId || "",
          createdAt:
            selectedPayment.createdAt instanceof Date
              ? selectedPayment.createdAt.toISOString()
              : selectedPayment.createdAt,
          addedAt: studentAddedDate,
        });
      }

      // advance-payments dan o'chirish
      await deleteDoc(doc(db, "advance-payments", selectedPayment.id));
      setPayments(payments.filter((p) => p.id !== selectedPayment.id));
      setShowPaymentModal(false);
      alert("✅ To'lov muvaffaqiyatli saqlandi va mijoz guruhga qo'shildi!");
      navigate(`/finance?id=${selectedPayment.id}`);
    } catch (error) {
      console.error("To'lov saqlashda xatolik:", error);
      alert("❌ To'lov saqlashda xatolik yuz berdi!");
    }
  };

  // Jami to'lovlarni hisoblash
  const totalAmount = payments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-0 px-0">
      <h2 className="flex items-center justify-center gap-2 text-xl sm:text-3xl font-bold text-yellow-600 mb-3 text-center">
        <MdOutlinePayment />
        Oldindan to'lovlar ro'yxati
      </h2>

      {/* Jami to'lovlar */}
      {!loading && payments.length > 0 && (
        <div className="w-full max-w-5xl flex justify-end mb-3 pr-4">
          <div className="text-right text-lg font-semibold text-gray-700">
            Jami to'lovlar:{" "}
            <span className="text-green-600">
              {totalAmount.toLocaleString("uz-UZ")} so'm
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-10">
          Ma'lumotlar yuklanmoqda...
        </p>
      ) : payments.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          Hech qanday oldindan to'lov topilmadi
        </p>
      ) : (
        <div className="overflow-x-auto w-full max-w-auto rounded">
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
                  <td className="py-2 px-4 text-center flex justify-center gap-2">
                    <button
                      onClick={() => openPaymentModal(p)}
                      className="flex items-center justify-center gap-1 px-3 py-1 text-white bg-green-500 hover:bg-green-600 rounded transition"
                      title="100% to'lov"
                    >
                      100% <FaMoneyBillWave />
                    </button>
                    <button
                      onClick={() => openDeleteModal(p)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      title="O'chirish"
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

      {/* 100% To'lov Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center text-green-700 flex justify-center items-center gap-2">
              <FaMoneyBillWave/> To'lov ma'lumotlari
            </h3>
            <div className="flex flex-col gap-3">
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
              <select
                className="border border-gray-300 rounded px-3 py-2"
                value={paymentData.groupName}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, groupName: e.target.value })
                }
              >
                <option value="">Guruh tanlang</option>
                {groups.length === 0 ? (
                  <option disabled>Guruhlar topilmadi</option>
                ) : (
                  groups.map((group) => (
                    <option
                      key={group.id}
                      value={group.name || group.groupName || group.title}
                    >
                      {group.name || group.groupName || group.title || group.id}
                    </option>
                  ))
                )}
              </select>
              <label>Operator ismi</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2"
                value={paymentData.operator}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, operator: e.target.value })
                }
              />
              <label>To'lov summasi</label>
              <input
                type="number"
                className="border border-gray-300 rounded px-3 py-2"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, amount: e.target.value })
                }
              />
              <label>To'lov sanasi</label>
              <input
                type="date"
                className="border border-gray-300 rounded px-3 py-2"
                value={paymentData.date}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, date: e.target.value })
                }
              />
              <label>To'lov turi</label>
              <select
                className="border border-gray-300 rounded px-3 py-2"
                value={paymentData.paymentType}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    paymentType: e.target.value,
                  })
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

      {/* O'chirish modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[380px] shadow-lg text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-3">
              🗑 Oldindan to'lovni o'chirish
            </h3>
            <p className="text-gray-700 mb-5">
              {selectedPayment?.name} ning oldindan to'lovini o'chirmoqchimisiz?
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
                Ha, o'chirilsin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancePaymentPage;