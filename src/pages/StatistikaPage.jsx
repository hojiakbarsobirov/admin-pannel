import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { IoStatsChartSharp } from "react-icons/io5";

const StatistikaPage = () => {
  const [barSeries, setBarSeries] = useState([]);
  const [barOptions, setBarOptions] = useState({});
  const [donutSeries, setDonutSeries] = useState([]);
  const [donutOptions, setDonutOptions] = useState({});
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [yearlyTotal, setYearlyTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const sources = [
          "registrations",
          "deleted-users",
          "feedback",
          "payments",
          "advance-payments",
        ];
        let allDates = [];

        // 🔹 Barcha manbalardan vaqtlarni olish
        for (const source of sources) {
          const snapshot = await getDocs(collection(db, source));
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const time =
              data.createdAt?.toDate?.() ||
              data.deletedAt?.toDate?.() ||
              data.feedbackAt?.toDate?.() ||
              new Date(
                data.createdAt || data.deletedAt || data.feedbackAt || null
              );
            if (time && !isNaN(time.getTime())) {
              allDates.push(time);
            }
          });
        }

        if (allDates.length === 0) {
          setLoading(false);
          return;
        }

        // 🔹 Hozirgi sanani tayyorlash (soat qismini 00:00:00 ga tushirish)
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // 🔹 Eng eski sanani topish
        const firstDate = new Date(
          Math.min(...allDates.map((d) => d.getTime()))
        );
        firstDate.setHours(0, 0, 0, 0);

        // 🔹 Sana oraliqlarini hosil qilish (bugungi sana ham qo‘shiladi)
        const allDayLabels = [];
        for (
          let d = new Date(firstDate);
          d <= now;
          d = new Date(d.getTime() + 86400000) // 1 kun = 86400000 ms
        ) {
          allDayLabels.push(new Date(d));
        }

        // 🔹 Har bir kun uchun yozuvlar sonini hisoblash
        const dayCounts = allDayLabels.map((d) =>
          allDates.filter(
            (x) =>
              x.getDate() === d.getDate() &&
              x.getMonth() === d.getMonth() &&
              x.getFullYear() === d.getFullYear()
          ).length
        );

        // 🔹 Sanalarni "01.11" formatida chiqarish
        const labelNames = allDayLabels.map((d) => {
          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          return `${day}.${month}`;
        });

        // 🔹 Ranglar (bugun, kecha, avvalgi kunlar uchun)
        const colors = allDayLabels.map((d) => {
          const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
          if (diff === 0) return "#3b82f6"; // bugun
          if (diff === 1) return "#ef4444"; // kecha
          if (diff === 2) return "#facc15"; // avvalgi kun
          const pastel = [
            "#60a5fa",
            "#93c5fd",
            "#a5b4fc",
            "#c7d2fe",
            "#bfdbfe",
          ];
          return pastel[Math.floor(Math.random() * pastel.length)];
        });

        // 🔹 Bar chart sozlamalari
        setBarOptions({
          chart: {
            id: "daily-bar",
            toolbar: {
              show: true,
              tools: {
                zoom: true,
                zoomin: true,
                zoomout: true,
                pan: true,
                reset: true,
              },
            },
            zoom: {
              enabled: true,
              type: "x",
              autoScaleYaxis: true,
            },
            animations: { enabled: true },
          },
          xaxis: {
            categories: labelNames,
            title: { text: "Sanalar" },
            labels: {
              rotate: -45,
              style: { fontSize: "12px" },
            },
          },
          plotOptions: {
            bar: { distributed: true },
          },
          colors: colors,
          dataLabels: { enabled: true },
          stroke: { width: 1, colors: ["#fff"] },
          grid: { show: true },
          tooltip: {
            theme: "light",
            x: { show: true },
            y: { title: { formatter: () => "Mijozlar soni" } },
          },
        });

        setBarSeries([{ name: "Mijozlar soni", data: dayCounts }]);

        // 🔹 Donut chart
        const activeDays = labelNames.filter((_, i) => dayCounts[i] > 0);
        const activeCounts = dayCounts.filter((c) => c > 0);

        setDonutOptions({
          labels: activeDays,
          legend: { position: "bottom" },
          colors: colors,
        });

        setDonutSeries(activeCounts);

        // 🔹 Oylik va yillik natijalar
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonth = allDates.filter(
          (d) =>
            d.getMonth() === currentMonth && d.getFullYear() === currentYear
        );
        const thisYear = allDates.filter(
          (d) => d.getFullYear() === currentYear
        );

        setMonthlyTotal(thisMonth.length);
        setYearlyTotal(thisYear.length);

        setLoading(false);
      } catch (error) {
        console.error("Xatolik:", error);
        alert("⚠️ Statistika ma’lumotlarini yuklashda xatolik yuz berdi!");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto p-0">
      <h2 className="flex items-center justify-center gap-2 text-center text-2xl font-bold mb-6 text-blue-600">
        <IoStatsChartSharp />
        Kunlik statistika (scroll & zoom bilan)
      </h2>

      {loading ? (
        <p className="text-center text-gray-500 py-10">
          ⏳ Ma’lumotlar yuklanmoqda...
        </p>
      ) : (
        <>
          <div className="flex flex-col-reverse lg:flex-col">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Bar Chart */}
              <div className="flex-1 bg-white shadow-md rounded-lg p-4 overflow-x-auto">
                <h3 className="text-center text-xl font-semibold mb-4 text-blue-500">
                  📅 Kunlik faoliyat (zoom va scroll ishlaydi)
                </h3>
                <Chart
                  options={barOptions}
                  series={barSeries}
                  type="bar"
                  width="100%"
                  height={400}
                />
              </div>

              {/* Donut Chart */}
              <div className="flex-1 bg-white shadow-md rounded-lg p-4">
                <h3 className="text-center text-xl font-semibold mb-4 text-blue-500">
                  🧭 Faol kunlar bo‘yicha ulush
                </h3>
                <Chart
                  options={donutOptions}
                  series={donutSeries}
                  type="donut"
                  width="100%"
                  height={350}
                />
              </div>
            </div>

            {/* Oylik natijalar */}
            <div className="bg-blue-100 shadow-lg rounded-lg p-4 mt-10 text-center mb-6">
              <h3 className="text-xl font-semibold text-blue-700">
                🗓 Joriy oy uchun umumiy natija:
              </h3>
              <p className="text-3xl font-bold text-blue-800 mt-2">
                {monthlyTotal} ta mijoz
              </p>
            </div>

            {/* Yillik natijalar */}
            <div className="bg-blue-100 shadow-lg rounded-lg p-4 mt-10 text-center mb-6">
              <h3 className="text-xl font-semibold text-blue-700 mt-6">
                📆 Joriy yil uchun umumiy natija:
              </h3>
              <p className="text-3xl font-bold text-blue-800 mt-2">
                {yearlyTotal} ta mijoz
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatistikaPage;
