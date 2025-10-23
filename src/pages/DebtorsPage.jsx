// src/pages/DebtorsPage.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const DebtorsPage = () => {
  const [debtors, setDebtors] = useState([]);
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingDebtor, setEditingDebtor] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    fetchDebtorsAndGroups();
  }, []);

  const fetchDebtorsAndGroups = async () => {
    try {
      setLoading(true);

      // Guruhlarni olish
      const groupsSnap = await getDocs(collection(db, 'groups'));
      const groupsMap = {};
      groupsSnap.docs.forEach((doc) => {
        groupsMap[doc.id] = doc.data().groupName;
      });
      setGroups(groupsMap);

      // Qarzdorlarni olish
      const debtorsSnap = await getDocs(collection(db, 'debtors'));
      const debtorsList = debtorsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      
      // Qarzdorlik miqdori bo'yicha saralash (ko'pdan kamga)
      debtorsList.sort((a, b) => b.debtAmount - a.debtAmount);
      
      setDebtors(debtorsList);
    } catch (error) {
      console.error('❌ Ma\'lumotlarni olishda xato:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (debtorId) => {
    if (!window.confirm('Haqiqatan ham o\'chirmoqchimisiz?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'debtors', debtorId));
      alert('✅ Qarzdor muvaffaqiyatli o\'chirildi!');
      fetchDebtorsAndGroups();
    } catch (error) {
      console.error('❌ O\'chirishda xato:', error);
      alert('❌ Xatolik yuz berdi!');
    }
  };

  const handleUpdateDebt = async (debtorId) => {
    if (!editAmount || parseFloat(editAmount) < 0) {
      alert('❌ To\'g\'ri miqdor kiriting!');
      return;
    }

    try {
      await updateDoc(doc(db, 'debtors', debtorId), {
        debtAmount: parseFloat(editAmount),
        updatedAt: new Date().toISOString(),
      });
      alert('✅ Qarzdorlik yangilandi!');
      setEditingDebtor(null);
      setEditAmount('');
      fetchDebtorsAndGroups();
    } catch (error) {
      console.error('❌ Yangilashda xato:', error);
      alert('❌ Xatolik yuz berdi!');
    }
  };

  const calculateTotalDebt = () => {
    return debtors.reduce((sum, debtor) => sum + (debtor.debtAmount || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Ma'lumotlar yuklanmoqda...
      </div>
    );
  }

  const totalDebt = calculateTotalDebt();

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-red-600 mb-2">
          💰 Qarzdorlar ro'yxati
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-600">
            Jami qarzdorlar: <span className="font-semibold">{debtors.length} ta</span>
          </p>
          <div className="px-4 py-2 bg-red-50 rounded-lg border border-red-200">
            <span className="text-red-600 font-bold text-lg">
              Jami qarz: {totalDebt.toLocaleString('uz-UZ')} so'm
            </span>
          </div>
        </div>
      </div>

      {/* Qarzdorlar jadvali */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {debtors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">📋 Qarzdorlar mavjud emas</p>
            <p className="text-sm">Yangi qarzdor qo'shish uchun guruh sahifasiga o'ting</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-red-500 text-white">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Ism Familiya</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">Guruh</th>
                  <th className="px-4 py-3">Qarzdorlik</th>
                  <th className="px-4 py-3 text-center">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {debtors.map((debtor, index) => (
                  <tr
                    key={debtor.id}
                    className={`border-b ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-800">
                        {debtor.name} {debtor.surname}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {debtor.phone || '–'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {groups[debtor.groupId] || 'Noma\'lum'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editingDebtor === debtor.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateDebt(debtor.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingDebtor(null);
                              setEditAmount('');
                            }}
                            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-red-600">
                          {(debtor.debtAmount || 0).toLocaleString('uz-UZ')} so'm
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        {editingDebtor !== debtor.id && (
                          <>
                            <button
                              onClick={() => {
                                setEditingDebtor(debtor.id);
                                setEditAmount(debtor.debtAmount.toString());
                              }}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm font-medium"
                            >
                              ✏️ Tahrirlash
                            </button>
                            <button
                              onClick={() => handleDelete(debtor.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-medium"
                            >
                              🗑️ O'chirish
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistika kartochkalari */}
      {debtors.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-600 mb-1">Eng ko'p qarzdor</p>
            <p className="text-lg font-bold text-red-700">
              {debtors[0]?.name} {debtors[0]?.surname}
            </p>
            <p className="text-red-600 font-semibold">
              {(debtors[0]?.debtAmount || 0).toLocaleString('uz-UZ')} so'm
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-600 mb-1">O'rtacha qarzdorlik</p>
            <p className="text-2xl font-bold text-yellow-700">
              {Math.round(totalDebt / debtors.length).toLocaleString('uz-UZ')} so'm
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-600 mb-1">Guruhlar soni</p>
            <p className="text-2xl font-bold text-purple-700">
              {new Set(debtors.map(d => d.groupId)).size} ta
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtorsPage;