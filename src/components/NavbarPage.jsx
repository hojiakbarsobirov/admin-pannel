import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdRefresh, MdSearch, MdClose } from "react-icons/md";
import { IoExitOutline } from "react-icons/io5";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const NavbarPage = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allData, setAllData] = useState([]);

  // Firebase'dan barcha ma'lumotlarni yuklash
  useEffect(() => {
    if (showSearchModal && allData.length === 0) {
      fetchAllData();
    }
  }, [showSearchModal]);

  const fetchAllData = async () => {
    setIsSearching(true);
    try {
      const excludedCollections = ["teachers", "admins", "admin"];
      const allResults = [];

      // Barcha asosiy kolleksiyalarni yuklash
      const collections = [
        "students",
        "feedback",
        "payments",
        "deleted-users",
        "clients",
        "registrations", // Yangi qo'shildi
        "advance-payments", // Oldindan to'lovlar
      ];

      for (const collectionName of collections) {
        try {
          const querySnapshot = await getDocs(collection(db, collectionName));

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // teacher va admin rollarini chiqarib tashlash
            if (
              !excludedCollections.includes(collectionName) &&
              data.role !== "teacher" &&
              data.role !== "admin"
            ) {
              allResults.push({
                id: doc.id,
                collection: collectionName,
                ...data,
              });
            }
          });
        } catch (error) {
          console.log(`${collectionName} xatolik:`, error);
        }
      }

      setAllData(allResults);
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Qidiruv funksiyasi
  const handleSearch = (value) => {
    setSearchQuery(value);

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    // Faqat 2 ta belgidan ko'p bo'lsa qidirish boshlanadi
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const searchLower = value.toLowerCase().trim();
    const searchPhone = searchLower.replace(/\D/g, "");

    // ANIQ qidiruv - faqat to'liq mos keluvchi natijalar
    const filtered = allData.filter((item) => {
      const firstName = (item.firstName || "").toLowerCase().trim();
      const lastName = (item.lastName || "").toLowerCase().trim();
      const fullName = (item.fullName || "").toLowerCase().trim();
      const name = (item.name || "").toLowerCase().trim();
      const surname = (item.surname || "").toLowerCase().trim();
      const phone = (item.phone || "").replace(/\D/g, "");
      const phoneNumber = (item.phoneNumber || "").replace(/\D/g, "");
      const extraPhone = (item.extraPhone || "").replace(/\D/g, "");

      // To'liq ism kombinatsiyalari
      const fullNameCombinations = [
        fullName,
        `${name} ${surname}`.trim(),
        `${firstName} ${lastName}`.trim(),
        name,
        surname,
        firstName,
        lastName
      ];

      // Telefon raqam bo'yicha aniq qidiruv (kamida 3 ta raqam)
      if (searchPhone.length >= 3) {
        if (phone.includes(searchPhone) || 
            phoneNumber.includes(searchPhone) || 
            extraPhone.includes(searchPhone)) {
          return true;
        }
      }

      // Ism bo'yicha aniq qidiruv
      for (const nameVariant of fullNameCombinations) {
        if (nameVariant && nameVariant === searchLower) {
          return true; // To'liq mos kelsa
        }
        if (nameVariant && nameVariant.includes(searchLower) && searchLower.length >= 3) {
          return true; // 3+ belgi uchun qisman mos kelsa
        }
      }

      return false;
    });

    setSearchResults(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const openSearchModal = () => {
    setShowSearchModal(true);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Sahifaga o'tish funksiyasi
  const handleNavigateToPage = (result) => {
    const collection = result.collection;
    
    // Kolleksiyaga qarab sahifaga yo'naltirish
    switch(collection) {
      case "students":
        // Agar groupId bo'lsa, guruh sahifasiga yo'naltirish
        if (result.groupId && result.teacherId) {
          navigate(`/groups/${result.teacherId}/${result.groupId}`);
        } else {
          navigate("/all-users");
        }
        break;
      case "feedback":
        navigate("/feedback");
        break;
      case "payments":
        navigate(`/finance?id=${result.id}`);
        break;
      case "deleted-users":
        navigate("/deleted-users");
        break;
      case "registrations":
        navigate("/all-users");
        break;
      case "advance-payments":
        navigate("/advance-payment");
        break;
      default:
        navigate("/");
    }
    
    // Qidiruv modalni yopish
    closeSearchModal();
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };
  const getCollectionLabel = (collectionName) => {
    const labels = {
      students: "O'quvchilar",
      feedback: "Qayta aloqa",
      payments: "To'lovlar",
      "deleted-users": "O'chirilganlar",
      clients: "Mijozlar",
      registrations: "Ro'yxatdan o'tganlar",
      "advance-payments": "Oldindan to'lovlar",
    };
    return labels[collectionName] || collectionName;
  };

  // Kolleksiya nomini o'zbek tiliga o'girish
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    
    let date;
    
    // Firestore Timestamp obyektini tekshirish
    if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } 
    // ISO string yoki oddiy string
    else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    }
    // Number (milliseconds)
    else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    }
    // Allaqachon Date obyekti
    else if (timestamp instanceof Date) {
      date = timestamp;
    }
    else {
      return "-";
    }
    
    // Noto'g'ri sana tekshiruvi
    if (isNaN(date.getTime())) {
      return "-";
    }
    
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${d}.${m}.${y} - ${h}:${min}`;
  };

  // Telefon raqamni formatlash
  const displayPhoneNumber = (phone) => {
    if (!phone) return "-";
    const numbers = phone.replace(/\D/g, "");
    if (numbers.length < 12) return phone;

    const afterCode = numbers.slice(3);
    return `+998 ${afterCode.slice(0, 2)} ${afterCode.slice(
      2,
      5
    )} ${afterCode.slice(5, 7)} ${afterCode.slice(7, 9)}`;
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-500 w-full h-16 flex justify-between items-center px-4 sm:px-8 shadow-lg">
        {/* Logo */}
        <h3 className="text-white font-bold text-lg sm:text-xl cursor-pointer hover:scale-105 transition-transform">
          RuSpeak.uz
        </h3>

        {/* Markazdagi matn */}
        <h2 className="hidden sm:block font-semibold text-white text-base tracking-wide">
          Admin Panel
        </h2>

        {/* Tugmalar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Qidiruv tugmasi */}
          <button
            onClick={openSearchModal}
            className="flex items-center gap-2 border-2 border-white/80 text-white rounded-lg px-4 py-2 hover:bg-white hover:text-blue-600 transition-all hover:scale-105"
          >
            <MdSearch className="text-xl" />
            <span className="hidden sm:inline">Qidirish</span>
          </button>

          {/* Yangilash tugmasi */}
          <button
            onClick={handleRefresh}
            className="border-2 border-white/80 text-white rounded-lg p-2 hover:bg-white hover:text-blue-600 transition-all hover:scale-110"
            title="Yangilash"
          >
            <MdRefresh className="text-xl" />
          </button>

          {/* Chiqish tugmasi */}
          <button
            onClick={() => setShowModal(true)}
            className="border-2 border-white/80 text-white rounded-lg p-2 hover:bg-white hover:text-red-600 transition-all hover:scale-110"
            title="Chiqish"
          >
            <IoExitOutline className="text-xl" />
          </button>
        </div>
      </nav>

      {/* Mobil uchun pastdagi matn */}
      <div className="sm:hidden w-full bg-gradient-to-r from-blue-600 to-blue-500 text-center py-2 border-t border-white/30">
        <h2 className="text-white text-sm font-semibold tracking-wide">
          Admin Panel
        </h2>
      </div>

      {/* To'liq ekran qidiruv modali */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-white z-50 overflow-hidden flex flex-col">
          {/* Qidiruv header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <button
                onClick={closeSearchModal}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <MdClose className="text-2xl" />
              </button>
              <div className="flex-1 relative">
                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Ism, familya yoki telefon raqam kiriting..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-white/30 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-white text-base"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Qidiruv natijalari */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-6xl mx-auto p-4">
              {isSearching ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Ma'lumotlar yuklanmoqda...</p>
                </div>
              ) : searchQuery.trim() === "" ? (
                <div className="text-center py-20">
                  <MdSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    Qidirish uchun matn kiriting
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Ism, familya yoki telefon raqam bo'yicha qidiring
                  </p>
                </div>
              ) : searchQuery.trim().length < 2 ? (
                <div className="text-center py-20">
                  <MdSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    Kamida 2 ta belgi kiriting
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Qidiruv uchun ko'proq belgi kiriting
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">❌</div>
                  <p className="text-gray-600 text-lg font-medium">
                    Bunday mijoz topilmadi
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    "{searchQuery}" nomli yoki raqamli mijoz mavjud emas
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-700">
                      {searchResults.length} ta natija topildi
                    </h3>
                  </div>

                  <div className="bg-white rounded shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left border-collapse text-sm">
                        <thead className="bg-blue-500 text-white">
                          <tr>
                            <th className="py-3 px-4 font-medium">#</th>
                            <th className="py-3 px-4 font-medium">Ism Familya</th>
                            <th className="py-3 px-4 font-medium">Telefon</th>
                            <th className="py-3 px-4 font-medium">Sahifa</th>
                            <th className="py-3 px-4 font-medium">Sana</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map((result, index) => (
                            <tr
                              key={`${result.collection}-${result.id}-${index}`}
                              onClick={() => handleNavigateToPage(result)}
                              className={`border-b ${
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                              } hover:bg-blue-50 transition cursor-pointer`}
                            >
                              <td className="py-3 px-4 font-medium text-gray-600">
                                {index + 1}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-gray-800">
                                  {result.name && result.surname
                                    ? `${result.name} ${result.surname}`
                                    : result.firstName && result.lastName
                                    ? `${result.firstName} ${result.lastName}`
                                    : result.fullName ||
                                      result.name ||
                                      "Noma'lum"}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-700">
                                {displayPhoneNumber(
                                  result.phone ||
                                    result.phoneNumber ||
                                    result.extraPhone
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                    result.collection === "students"
                                      ? "bg-green-100 text-green-700"
                                      : result.collection === "feedback"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : result.collection === "payments"
                                      ? "bg-blue-100 text-blue-700"
                                      : result.collection === "deleted-users"
                                      ? "bg-red-100 text-red-700"
                                      : result.collection === "registrations"
                                      ? "bg-purple-100 text-purple-700"
                                      : result.collection === "advance-payments"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {getCollectionLabel(result.collection)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm">
                                {formatDate(
                                  result.createdAt ||
                                    result.addedAt ||
                                    result.feedbackAt ||
                                    result.paymentAt ||
                                    result.deletedAt ||
                                    result.registeredAt ||
                                    result.registrationDate ||
                                    result.timestamp ||
                                    result.date ||
                                    result.created ||
                                    result.updatedAt
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chiqish modali */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[90%] max-w-sm rounded-2xl shadow-2xl p-6 text-center animate-scale-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoExitOutline className="text-3xl text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Chiqmoqchimisiz?
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Siz tizimdan chiqmoqchisiz. Tasdiqlaysizmi?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 transition-all font-medium hover:scale-105"
              >
                Chiqish
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="border-2 border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-all font-medium hover:scale-105"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default NavbarPage;