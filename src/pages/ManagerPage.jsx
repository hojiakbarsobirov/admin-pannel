import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const ManagerPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false); // 🔥 yangi holat
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    image: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserData(formData);
    setShowModal(false);
  };

  const handleDelete = () => {
    setConfirmDelete(true);
  };

  const confirmDeleteUser = () => {
    setUserData(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bio: "",
      location: "",
      image: "",
    });
    setConfirmDelete(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br flex flex-col items-center py-10 px-0 sm:px-0 lg:px-0">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Menejer sahifasi
      </h1>

      {!userData ? (
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition duration-200"
        >
          ➕ Qo‘shilish
        </button>
      ) : (
        <div className="bg-white shadow-lg rounded-xl w-full p-6 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between border-b pb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full">
              <img
                src={userData.image || "https://via.placeholder.com/100"}
                alt="Profil rasmi"
                className="w-24 h-24 rounded-full object-cover border"
              />
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-800">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-gray-500">
                  {userData.bio} | {userData.location}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
              >
                <FaEdit /> Tahrirlash
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg border border-red-300 hover:bg-red-100 text-red-600 flex items-center gap-2"
              >
                <FaTrash /> O‘chirish
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center sm:text-left">
              Shaxsiy maʼlumotlar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-500">Ism</p>
                <p className="font-medium">{userData.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Familiya</p>
                <p className="font-medium">{userData.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Elektron pochta</p>
                <p className="font-medium break-all">{userData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefon raqami</p>
                <p className="font-medium">{userData.phone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500">
                  Qo‘shimcha maʼlumot (bio)
                </p>
                <p className="font-medium">{userData.bio}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFIL YARATISH / TAHRIR MODALI */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 sm:p-8 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
              {userData ? "Profilni tahrirlash" : "Yangi profil yaratish"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <input
                type="text"
                placeholder="Ismingizni kiriting"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="border p-3 rounded-lg w-full"
                required
              />
              <input
                type="text"
                placeholder="Familiyangizni kiriting"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="border p-3 rounded-lg w-full"
                required
              />
              <input
                type="email"
                placeholder="Elektron pochtangiz"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="border p-3 rounded-lg w-full"
                required
              />
              <input
                type="text"
                placeholder="Telefon raqamingiz"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="border p-3 rounded-lg w-full"
                required
              />
              <input
                type="text"
                placeholder="Manzilingiz"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="border p-3 rounded-lg w-full sm:col-span-2"
              />
              <input
                type="text"
                placeholder="Qo‘shimcha maʼlumot (bio)"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="border p-3 rounded-lg w-full sm:col-span-2"
              />
              <input
                type="text"
                placeholder="Rasm havolasi (ixtiyoriy)"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="border p-3 rounded-lg w-full sm:col-span-2"
              />

              <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row justify-between mt-6 gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg w-full sm:w-auto"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg w-full sm:w-auto"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔥 O‘CHIRISHNI TASDIQLASH MODALI */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Profilni o‘chirishni xohlaysizmi?
            </h2>
            <p className="text-gray-500 mb-6">
              Bu amalni qaytarib bo‘lmaydi. Profil maʼlumotlari butunlay
              o‘chiriladi.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDelete(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
              >
                Ha, o‘chir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerPage;
