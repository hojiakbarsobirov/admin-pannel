import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, deleteDoc, doc, onSnapshot, setDoc, getDocs, addDoc } from "firebase/firestore";
import { AiFillDelete } from "react-icons/ai";
import { FaPhoneAlt, FaMoneyBillWave } from "react-icons/fa";

const FeedBackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [groups, setGroups] = useState([]);
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

  // Guruhlarni olish
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const snapshot = await getDocs(collection(db, "groups"));
      const groupsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Guruhlar yuklandi:", groupsData);
      setGroups(groupsData);
    } catch (error) {
      console.error("Guruhlarni yuklashda xatolik:", error);
      alert("⚠️ Guruhlarni yuklashda xatolik yuz berdi!");
    }
  };

  // 🗑 O'chirish
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
      alert("O'chirishda muammo yuz berdi!");
    }
  };

  // 💰 To'lov modalni ochish
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

  // 💰 To'lovni saqlash (HomePage dagi funksiya)
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
      await setDoc(doc(db, "payments", selectedUser.id), {
        ...selectedUser,
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
          doc(db, "groups", selectedGroup.id, "students", selectedUser.id),
          {
            name: selectedUser.name,
            surname: selectedUser.surname || "",
            phone: selectedUser.phone,
            extraPhone: selectedUser.extraPhone || "",
            tarif: paymentData.tarif,
            amount: paymentData.amount,
            paymentType: paymentData.paymentType,
            operator: paymentData.operator,
            createdAt:
              selectedUser.createdAt instanceof Date
                ? selectedUser.createdAt.toISOString()
                : selectedUser.createdAt,
            addedAt: studentAddedDate,
          }
        );

        // students kolleksiyasiga ham qo'shish (StudentsPage uchun)
        await addDoc(collection(db, "students"), {
          groupId: selectedGroup.id,
          groupName: paymentData.groupName,
          name: selectedUser.name,
          surname: selectedUser.surname || "",
          phone: selectedUser.phone,
          extraPhone: selectedUser.extraPhone || "",
          tarif: paymentData.tarif,
          amount: paymentData.amount,
          paymentType: paymentData.paymentType,
          operator: paymentData.operator,
          teacherId: selectedGroup.teacherId || "",
          createdAt:
            selectedUser.createdAt instanceof Date
              ? selectedUser.createdAt.toISOString()
              : selectedUser.createdAt,
          addedAt: studentAddedDate,
        });
      }

      // feedback dan o'chirish
      await deleteDoc(doc(db, "feedback", selectedUser.id));
      
      setFeedbacks(feedbacks.filter((u) => u.id !== selectedUser.id));
      setShowPaymentModal(false);
      alert("✅ To'lov muvaffaqiyatli saqlandi va mijoz guruhga qo'shildi!");
      navigate(`/finance?id=${selectedUser.id}`);
    } catch (error) {
      console.error("To'lov saqlashda xatolik:", error);
      alert("❌ To'lov saqlashda xatolik yuz berdi!");
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

  // Telefon raqamni ko'rsatish uchun formatlash
  const displayPhoneNumber = (phone) => {
    if (!phone) return "-";
    const numbers = phone.replace(/\D/g, "");
    if (numbers.length < 12) return phone;
    
    const afterCode = numbers.slice(3);
    return `+998 ${afterCode.slice(0, 2)} ${afterCode.slice(2, 5)} ${afterCode.slice(5, 7)} ${afterCode.slice(7, 9)}`;
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
                    <td className="py-2 px-4">{displayPhoneNumber(user.phone)}</td>
                    <td className="py-2 px-4 text-gray-700 italic">
                      {user.feedbackReason || "-"}
                    </td>
                    <td className="py-2 px-4">{formatUzTime(user.feedbackAt)}</td>
                    <td className="py-2 px-4 text-center flex justify-center gap-2">
                      <button
                        onClick={() => openPaymentModal(user)}
                        className="flex items-center justify-center gap-1 px-2 py-1 text-white bg-green-500 hover:bg-green-600 rounded hover:scale-110 transition"
                      >
                        100% <FaMoneyBillWave />
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

      {/* 🗑 O'chirish modali */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[380px] shadow-lg text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-3">
              🗑 {selectedUser?.name} ni o'chirmoqchimisiz?
            </h3>
            <p className="text-gray-700 mb-5">
              Ushbu foydalanuvchi "Deleted Users" sahifasiga o'tkaziladi.
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
                Ha, o'chirilsin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💰 To'lov modali */}
      {showPaymentModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center text-green-700">
              💰 To'lov ma'lumotlari
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
    </div>
  );
};

export default FeedBackPage;