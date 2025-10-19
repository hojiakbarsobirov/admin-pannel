import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [feedbackReason, setFeedbackReason] = useState("");
  const [paymentData, setPaymentData] = useState({
    tarif: "",
    groupName: "",
    operator: "",
    amount: "",
    paymentType: "naqt",
  });

  const navigate = useNavigate();

  // Ma'lumotlarni olish
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "registrations"));
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        let createdAtDate = docData.createdAt?.toDate ? docData.createdAt.toDate() : new Date(docData.createdAt);
        return { id: doc.id, ...docData, createdAt: createdAtDate };
      });
      data.sort((a, b) => b.createdAt - a.createdAt);
      setUsers(data);
    } catch (error) {
      console.error("Xatolik:", error);
      alert("⚠️ Ma’lumotlarni yuklashda xatolik yuz berdi!");
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // O‘chirish
  const openDeleteModal = (user) => { setSelectedUser(user); setShowDeleteModal(true); };
  const handleDelete = async () => {
    try {
      await addDoc(collection(db, "deleted-users"), { ...selectedUser, deletedAt: new Date().toISOString() });
      await deleteDoc(doc(db, "registrations", selectedUser.id));
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      navigate("/deleted-users");
    } catch (error) {
      console.error("O‘chirishda xatolik:", error);
      alert("❌ O‘chirishda muammo yuz berdi!");
    }
  };

  // Feedback
  const openFeedbackModal = (user) => { setSelectedUser(user); setShowModal(true); };
  const handleFeedbackSubmit = async () => {
    if (!feedbackReason.trim()) { alert("📝 Sababni yozing!"); return; }
    try {
      await addDoc(collection(db, "feedback"), { ...selectedUser, feedbackReason, feedbackAt: new Date().toISOString() });
      setShowModal(false); setFeedbackReason(""); setSelectedUser(null); navigate("/feedback");
    } catch (error) {
      console.error("Feedback yozishda xatolik:", error);
      alert("❌ Qayta aloqa yozishda muammo yuz berdi!");
    }
  };

  // 100% to‘lov
  const openPaymentModal = (user) => { 
    setSelectedUser(user); 
    setShowPaymentModal(true); 
    setPaymentData({ tarif: "", groupName: "", operator: "", amount: "", paymentType: "naqt" }); 
  };
  const handlePaymentSubmit = async () => {
    if (!paymentData.tarif || !paymentData.groupName || !paymentData.operator || !paymentData.amount) {
      alert("❌ Barcha maydonlarni to‘ldiring!");
      return;
    }
    try {
      const formData = { ...selectedUser, ...paymentData, paymentAt: new Date().toISOString() };
      await addDoc(collection(db, "payments"), formData);
      setShowPaymentModal(false);
      navigate("/finance");
    } catch (error) {
      console.error("To‘lov saqlashda xatolik:", error);
      alert("❌ To‘lov saqlashda xatolik yuz berdi!");
    }
  };

  const filteredUsers = users.filter(
    (u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search)
  );

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

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-2 px-0 sm:px-0">
      <h2 className="text-xl sm:text-4xl font-bold text-blue-500 mb-5 text-center">
        📋 Ro‘yxatdan o‘tgan foydalanuvchilar
      </h2>

      {/* Qidiruv */}
      <div className="w-full max-w-5xl mb-4">
        <input
          type="text"
          placeholder="🔍 Ism yoki raqam orqali qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Jadval */}
      <div className="w-full bg-white rounded overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-500 py-10"> ⏳ Ma’lumotlar yuklanmoqda... </p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-10"> Hech qanday foydalanuvchi topilmadi 😕 </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse text-sm sm:text-base">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="py-3 px-4 font-medium">#</th>
                  <th className="py-3 px-4 font-medium">Ism</th>
                  <th className="py-3 px-4 font-medium">Telefon</th>
                  <th className="py-3 px-4 font-medium">Tg | WhatsApp</th>
                  <th className="py-3 px-4 font-medium">Sana</th>
                  <th className="py-3 px-4 font-medium text-center">Harakat</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-blue-50 transition`}
                  >
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{user.name}</td>
                    <td className="py-2 px-4">{user.phone}</td>
                    <td className="py-2 px-4">{user.extraPhone || "-"}</td>
                    <td className="py-2 px-4">{formatUzTime(user.createdAt)}</td>
                    <td className="py-2 px-4 text-center space-x-2 flex justify-center">
                      <button onClick={() => openFeedbackModal(user)} className="px-2 py-1 text-white rounded hover:scale-125 transition">📞</button>
                      <button onClick={() => openDeleteModal(user)} className="px-2 py-1 text-white rounded hover:scale-125 transition">🗑</button>
                      <button onClick={() => openPaymentModal(user)} className="px-2 py-1 text-white hover:bg-green-600 bg-green-500 rounded hover:scale-110 transition">100% 💰</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[400px] shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center text-blue-700">📞 Qayta aloqa sababi</h3>
            <textarea
              value={feedbackReason}
              onChange={(e) => setFeedbackReason(e.target.value)}
              placeholder="Masalan: 2 kundan keyin aloqaga chiqish kerak..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">Bekor qilish</button>
              <button onClick={handleFeedbackSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] sm:w-[380px] shadow-lg text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-3">🗑 Foydalanuvchini o‘chirish</h3>
            <p className="text-gray-700 mb-5">{selectedUser?.name} ni ro‘yxatdan o‘chirmoqchimisiz?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">Bekor qilish</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">Ha, o‘chirilsin</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center text-green-700">💰 To‘lov ma’lumotlari</h3>
            
            <div className="flex flex-col gap-3">
              <label>Tarif</label>
              <select className="border border-gray-300 rounded px-3 py-2" value={paymentData.tarif} onChange={(e) => setPaymentData({ ...paymentData, tarif: e.target.value })}>
                <option value="">Tanlang</option>
                <option value="razgovor">Razgovor</option>
                <option value="premium">Premium</option>
              </select>

              <label>Guruh nomi</label>
              <input type="text" className="border border-gray-300 rounded px-3 py-2" value={paymentData.groupName} onChange={(e) => setPaymentData({ ...paymentData, groupName: e.target.value })} />

              <label>Operator ismi</label>
              <input type="text" className="border border-gray-300 rounded px-3 py-2" value={paymentData.operator} onChange={(e) => setPaymentData({ ...paymentData, operator: e.target.value })} />

              <label>To‘lov summasi</label>
              <input type="number" className="border border-gray-300 rounded px-3 py-2" value={paymentData.amount} onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })} />

              <label>To‘lov turi</label>
              <select className="border border-gray-300 rounded px-3 py-2" value={paymentData.paymentType} onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value })}>
                <option value="naqt">Naqt</option>
                <option value="karta">Karta</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">Bekor qilish</button>
              <button onClick={handlePaymentSubmit} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
