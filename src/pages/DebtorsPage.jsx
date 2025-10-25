// src/pages/DebtorsPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { FaMoneyBillWave } from "react-icons/fa";

const DebtorsPage = () => {
  const [debtors, setDebtors] = useState([]);
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingDebtor, setEditingDebtor] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  // 🔍 Qidiruv uchun
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [allGroups, setAllGroups] = useState([]);
  const [newDebtor, setNewDebtor] = useState({
    groupId: "",
    debtAmount: "",
    note: "",
  });

  useEffect(() => {
    fetchDebtorsAndGroups();
    fetchAllGroups();
  }, []);

  const fetchDebtorsAndGroups = async () => {
    try {
      setLoading(true);
      const groupsSnap = await getDocs(collection(db, "groups"));
      const groupsMap = {};
      groupsSnap.docs.forEach((doc) => {
        groupsMap[doc.id] = doc.data().groupName;
      });
      setGroups(groupsMap);

      const debtorsSnap = await getDocs(collection(db, "debtors"));
      const debtorsList = debtorsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      debtorsList.sort((a, b) => b.debtAmount - a.debtAmount);
      setDebtors(debtorsList);
    } catch (error) {
      console.error("❌ Ma'lumotlarni olishda xato:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllGroups = async () => {
    try {
      const groupsSnap = await getDocs(collection(db, "groups"));
      const list = groupsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllGroups(list);
    } catch (error) {
      console.error("❌ Guruhlarni olishda xato:", error);
    }
  };

  // 🔍 O‘quvchini qidirish
  const handleSearch = async (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const q = query(collection(db, "students"));
    const snapshot = await getDocs(q);
    const allStudents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const filtered = allStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(value.toLowerCase()) ||
        s.surname.toLowerCase().includes(value.toLowerCase()) ||
        s.phone.includes(value)
    );

    setSearchResults(filtered);
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setShowFormModal(true);
    setShowAddModal(false);
  };

  const handleAddDebtor = async () => {
    const { groupId, debtAmount, note } = newDebtor;
    if (!groupId || !debtAmount || !selectedStudent) {
      alert("❌ Iltimos, barcha maydonlarni to‘ldiring!");
      return;
    }

    try {
      await addDoc(collection(db, "debtors"), {
        name: selectedStudent.name,
        surname: selectedStudent.surname,
        phone: selectedStudent.phone || "",
        groupId,
        debtAmount: parseFloat(debtAmount),
        note,
        createdAt: new Date().toISOString(),
      });
      alert("✅ Qarzdor muvaffaqiyatli qo‘shildi!");
      setShowFormModal(false);
      setSelectedStudent(null);
      setNewDebtor({ groupId: "", debtAmount: "", note: "" });
      fetchDebtorsAndGroups();
    } catch (error) {
      console.error("❌ Qarzdorni qo‘shishda xato:", error);
      alert("❌ Xatolik yuz berdi!");
    }
  };

  const handleDelete = async (debtorId) => {
    if (!window.confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;

    try {
      await deleteDoc(doc(db, "debtors", debtorId));
      alert("✅ Qarzdor muvaffaqiyatli o‘chirildi!");
      fetchDebtorsAndGroups();
    } catch (error) {
      console.error("❌ O‘chirishda xato:", error);
    }
  };

  const handleUpdateDebt = async (debtorId) => {
    if (!editAmount || parseFloat(editAmount) < 0) {
      alert("❌ To‘g‘ri miqdor kiriting!");
      return;
    }

    try {
      await updateDoc(doc(db, "debtors", debtorId), {
        debtAmount: parseFloat(editAmount),
        updatedAt: new Date().toISOString(),
      });
      alert("✅ Qarzdorlik yangilandi!");
      setEditingDebtor(null);
      setEditAmount("");
      fetchDebtorsAndGroups();
    } catch (error) {
      console.error("❌ Yangilashda xato:", error);
    }
  };

  const calculateTotalDebt = () =>
    debtors.reduce((sum, d) => sum + (d.debtAmount || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Ma'lumotlar yuklanmoqda...
      </div>
    );
  }

  const totalDebt = calculateTotalDebt();

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-bold text-red-600 mb-2 text-center">
            <FaMoneyBillWave />
            Qarzdorlar ro'yxati
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-gray-600">
              Jami qarzdorlar:{" "}
              <span className="font-semibold">{debtors.length} ta</span>
            </p>
            <div className="px-4 py-2 bg-red-50 rounded-lg border border-red-200">
              <span className="text-red-600 font-bold text-lg">
                Jami qarz: {totalDebt.toLocaleString("uz-UZ")} so'm
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow w-full sm:w-auto"
        >
          ➕ Qarzdor qo‘shish
        </button>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {debtors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">📋 Qarzdorlar mavjud emas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse text-sm sm:text-base">
              <thead className="bg-red-500 text-white">
                <tr>
                  <th className="px-3 sm:px-4 py-3">#</th>
                  <th className="px-3 sm:px-4 py-3">Ism Familiya</th>
                  <th className="px-3 sm:px-4 py-3">Telefon</th>
                  <th className="px-3 sm:px-4 py-3">Guruh</th>
                  <th className="px-3 sm:px-4 py-3">Qarzdorlik</th>
                  <th className="px-3 sm:px-4 py-3 text-center">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {debtors.map((debtor, i) => (
                  <tr
                    key={debtor.id}
                    className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-3 sm:px-4 py-3">{i + 1}</td>
                    <td className="px-3 sm:px-4 py-3 font-semibold break-words">
                      {debtor.name} {debtor.surname}
                    </td>
                    <td className="px-3 sm:px-4 py-3 break-words">
                      {debtor.phone || "–"}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      {groups[debtor.groupId] || "Noma'lum"}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-red-600 font-bold">
                      {editingDebtor === debtor.id ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-20 sm:w-24 px-2 py-1 border rounded"
                          />
                          <button
                            onClick={() => handleUpdateDebt(debtor.id)}
                            className="bg-green-500 text-white px-2 py-1 rounded"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingDebtor(null);
                              setEditAmount("");
                            }}
                            className="bg-gray-400 text-white px-2 py-1 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        `${debtor.debtAmount.toLocaleString("uz-UZ")} so‘m`
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center whitespace-nowrap">
                      {editingDebtor !== debtor.id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingDebtor(debtor.id);
                              setEditAmount(debtor.debtAmount.toString());
                            }}
                            className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded mr-1 sm:mr-2"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(debtor.id)}
                            className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🔍 Qidiruv Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-2">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">O‘quvchini qidirish</h2>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Ism, familiya yoki telefon raqami..."
              className="w-full border p-2 rounded mb-3"
            />
            <div className="max-h-60 overflow-y-auto">
              {searchResults.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectStudent(s)}
                  className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                >
                  {s.name} {s.surname} — {s.phone}
                </div>
              ))}
              {searchResults.length === 0 && searchTerm && (
                <p className="text-gray-500 text-center">
                  Hech narsa topilmadi
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🧾 Qarzdorlik Formasi */}
      {showFormModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">
              Qarzdorlik ma’lumotini kiritish
            </h2>
            <p className="mb-3 text-gray-700 font-medium">
              {selectedStudent.name} {selectedStudent.surname}
              <br />
              <span className="text-sm text-gray-500">
                {selectedStudent.phone}
              </span>
            </p>
            <select
              value={newDebtor.groupId}
              onChange={(e) =>
                setNewDebtor({ ...newDebtor, groupId: e.target.value })
              }
              className="w-full border p-2 rounded mb-3"
            >
              <option value="">Guruhni tanlang</option>
              {allGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.groupName}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={newDebtor.debtAmount}
              onChange={(e) =>
                setNewDebtor({ ...newDebtor, debtAmount: e.target.value })
              }
              placeholder="Qarzdorlik miqdori (so‘m)"
              className="w-full border p-2 rounded mb-3"
            />
            <textarea
              value={newDebtor.note}
              onChange={(e) =>
                setNewDebtor({ ...newDebtor, note: e.target.value })
              }
              placeholder="Qo‘shimcha ma’lumot (ixtiyoriy)"
              className="w-full border p-2 rounded mb-3 resize-none"
              rows={3}
            ></textarea>
            <button
              onClick={handleAddDebtor}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Saqlash
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtorsPage;
