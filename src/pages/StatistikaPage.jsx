import React, { Component } from "react";
import Chart from "react-apexcharts";

class StatistikaPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // Bar chart (kunlik)
      barOptions: {
        chart: {
          id: "daily-bar",
          toolbar: { show: false }
        },
        xaxis: {
          categories: ["01-10", "02-10", "03-10", "04-10", "05-10", "06-10", "07-10"]
        },
        responsive: [
          {
            breakpoint: 768,
            options: {
              chart: { width: "100%" },
              legend: { position: "bottom" }
            }
          }
        ]
      },
      barSeries: [
        {
          name: "Sotuvlar",
          data: [5, 1, 2, 1, 2, 1, 2]  // kunlik ma'lumot
        }
      ],

      // Donut chart (kunlik)
      donutOptions: {
        labels: ["01-10", "02-10", "03-10", "04-10", "05-10", "06-10", "07-10"],
        responsive: [
          {
            breakpoint: 768,
            options: {
              chart: { width: "100%" },
              legend: { position: "bottom" }
            }
          }
        ]
      },
      donutSeries: [1, 1, 1, 1, 1, 1, 1]  // bar chart bilan mos
    };
  }

  render() {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-center text-2xl font-bold mb-6">Statistika</h2>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 bg-white shadow-md rounded-lg p-4">
            <h3 className="text-center text-xl font-semibold mb-4">Kunlik Sotuvlar</h3>
            <Chart
              options={this.state.barOptions}
              series={this.state.barSeries}
              type="bar"
              width="100%"
              height={350}
            />
          </div>

          <div className="flex-1 bg-white shadow-md rounded-lg p-4">
            <h3 className="text-center text-xl font-semibold mb-4">Kunlik Donut Chart</h3>
            <Chart
              options={this.state.donutOptions}
              series={this.state.donutSeries}
              type="donut"
              width="100%"
              height={350}
            />
          </div>

        </div>
      </div>
    );
  }
}

export default StatistikaPage;
