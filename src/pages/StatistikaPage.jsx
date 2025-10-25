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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const sources = ["registrations", "deleted-users", "feedback"];
        let allDates = [];

        for (const source of sources) {
          const snapshot = await getDocs(collection(db, source));
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const time =
              data.createdAt?.toDate?.() ||
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

        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 6);

        const last7Days = allDates.filter((d) => d >= sevenDaysAgo && d <= now);
        const dayLabels = Array.from({ length: 7 }, (_, i) => {
          const day = new Date(sevenDaysAgo);
          day.setDate(day.getDate() + i);
          return day;
        });

        const dayCounts = dayLabels.map((d) => {
          return last7Days.filter(
            (x) =>
              x.getDate() === d.getDate() &&
              x.getMonth() === d.getMonth() &&
              x.getFullYear() === d.getFullYear()
          ).length;
        });

        const labelNames = dayLabels.map((d) =>
          d.toLocaleDateString("uz-UZ", { day: "2-digit" })
        );

        const colors = dayLabels.map((d) => {
          const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
          if (diff === 0) return "#3b82f6";
          if (diff === 1) return "#ef4444";
          if (diff === 2) return "#facc15";
          const pastel = [
            "#60a5fa",
            "#93c5fd",
            "#a5b4fc",
            "#c7d2fe",
            "#bfdbfe",
          ];
          return pastel[Math.floor(Math.random() * pastel.length)];
        });

        setBarOptions({
          chart: {
            id: "daily-bar",
            toolbar: { show: false },
          },
          xaxis: {
            categories: labelNames,
            title: { text: "Sanalar" },
          },
          plotOptions: {
            bar: { distributed: true },
          },
          colors: colors,
          dataLabels: { enabled: true },
          responsive: [
            {
              breakpoint: 768,
              options: {
                chart: { width: "100%" },
                legend: { position: "bottom" },
              },
            },
          ],
        });

        setBarSeries([{ name: "Mijozlar soni", data: dayCounts }]);

        const activeDays = labelNames.filter((_, i) => dayCounts[i] > 0);
        const activeCounts = dayCounts.filter((c) => c > 0);

        setDonutOptions({
          labels: activeDays,
          legend: { position: "bottom" },
          colors: colors,
        });

        setDonutSeries(activeCounts);

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const thisMonth = allDates.filter(
          (d) =>
            d.getMonth() === currentMonth && d.getFullYear() === currentYear
        );

        setMonthlyTotal(thisMonth.length);
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
        Kunlik statistika (so‘nggi 7 kun)
      </h2>

      {loading ? (
        <p className="text-center text-gray-500 py-10">
          ⏳ Ma’lumotlar yuklanmoqda...
        </p>
      ) : (
        <>
          {/* 🔹 Flex tartibi o‘zgartirildi: mobil qurilmada card yuqorida, desktopda pastda */}
          <div className="flex flex-col-reverse lg:flex-col">
            {/* Chartlar */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Bar Chart */}
              <div className="flex-1 bg-white shadow-md rounded-lg p-4">
                <h3 className="text-center text-xl font-semibold mb-4 text-blue-500">
                  📅 So‘nggi 7 kunlik faoliyat
                </h3>
                <Chart
                  options={barOptions}
                  series={barSeries}
                  type="bar"
                  width="100%"
                  height={350}
                />
              </div>

              {/* Donut Chart */}
              <div className="flex-1 bg-white shadow-md rounded-lg p-4">
                <h3 className="text-center text-xl font-semibold mb-4 text-blue-500">
                  🧭 Kunlar bo‘yicha ulush
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

            {/* 🔹 Oylik umumiy natija card */}
            <div className="bg-blue-100 shadow-lg rounded-lg p-4 mt-10 text-center lg:mt-10 mb-6 lg:mb-0">
              <h3 className="text-xl font-semibold text-blue-700">
                🗓 Joriy oy uchun umumiy natija:
              </h3>
              <p className="text-3xl font-bold text-blue-800 mt-2">
                {monthlyTotal} ta mijozlar
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatistikaPage;
