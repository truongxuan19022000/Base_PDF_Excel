import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const BarChart = ({ data }) => {
  const chartRef = useRef(null);
  const barChart = useRef(null);

  useEffect(() => {
    if (chartRef && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      chartRef.current.width = 482;
      chartRef.current.height = 306;

      if (barChart.current) {
        barChart.current.destroy();
      }

      barChart.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: 'Last week',
              data: data.values1,
              backgroundColor: '#ECD18D',
              borderRadius: {
                topLeft: 50,
              },
              barPercentage: 0.6,
              categoryPercentage: 0.78,
              color: '#8A9091',
            },
            {
              label: 'This week',
              data: data.values2,
              backgroundColor: '#453516CC',
              borderRadius: {
                topLeft: 50,
              },
              barPercentage: 0.6,
              categoryPercentage: 0.78,
              color: '#8A9091',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              maxHeight: 100,
              maxWidth: 100,
              labels: {
                boxWidth: 8,
                boxHeight: 8,
                usePointStyle: false,
                borderRadius: 0,
                color: '#8A9091',
                font: {
                  size: 12,
                  weight: '400',
                },
                generateLabels: (chart) => {
                  return chart.data.datasets.map(
                    (dataset) => ({
                      text: dataset.label,
                      fillStyle: dataset.backgroundColor,
                      strokeStyle: dataset.backgroundColor,
                      color: '#8A9091',
                    })
                  )
                }
              },
            },
            title: {
              color: '#8A9091',
            },
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
              },
              font: {
                size: 10,
                weight: 400,
                color: '#8A9091',
              },
              grid: {
                display: false,
                grid: {
                  offset: true
                }
              },
              ticks: {
                display: true,
                padding: 10,
              },
              border: {
                display: true,
                color: '#EAEAEA',
                width: 1,
              }
            },
            y: {
              display: true,
              title: {
                display: true,
              },
              font: {
                size: 10,
                weight: 400,
                color: '#8A9091',
              },
              grid: {
                display: true,
                drawTicks: false,
                drawOnChartArea: true,
              },
              ticks: {
                display: true,
                min: 0,
                stepSize: 5000,
                padding: 10,
                callback: function (value) {
                  return value === 0 ? '0' : (value / 1000) + 'k';
                },
              },
              border: {
                display: false,
                color: '#EAEAEA',
                width: 0,
              },
            },
          },
          layout: {
            padding: {
              left: -20,
              right: 29,
              top: 12,
              bottom: -20,
            }
          },
        },
      });
    }
  }, [data]);

  return (
    <div className="barChart">
      <canvas className="barChart__canvas" ref={chartRef} />
    </div>
  );
};

export default BarChart;
