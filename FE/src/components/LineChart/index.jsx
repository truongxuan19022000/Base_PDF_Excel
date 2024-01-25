import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const LineChart = ({ data, }) => {
  const chartRef = useRef(null);
  const lineChart = useRef(null);

  useEffect(() => {
    if (chartRef && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      chartRef.current.width = 813;
      chartRef.current.height = 322;

      if (lineChart.current) {
        lineChart.current.destroy();
      }

      lineChart.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: 'This Year',
              data: data.values1,
              borderColor: '#ECD18D',
              backgroundColor: 'white',
              borderWidth: 3,
              fill: false,
              color: '#8A9091',
            },
            {
              label: 'Last Year',
              data: data.values2,
              borderColor: '#7F7462',
              backgroundColor: 'white',
              borderWidth: 3,
              fill: false,
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
              align: 'start',
              maxHeight: 100,
              maxWidth: 100,
              labels: {
                boxWidth: 8,
                boxHeight: 8,
                usePointStyle: false,
                borderRadius: 0,
                padding: 55,
                color: '#8A9091',
                font: {
                  size: 12,
                  weight: '400',
                },
                generateLabels: (chart) => {
                  return chart.data.datasets.map(
                    (dataset) => ({
                      text: dataset.label,
                      fillStyle: dataset.borderColor,
                      strokeStyle: dataset.borderColor,
                      color: '#8A9091',
                    })
                  )
                }
              },
            },
            title: {
              color: '#8A9091',
            }
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
              },
              font: {
                size: 10,
                weight: '400',
                color: '#8A9091',
              },
              grid: {
                display: true,
                drawTicks: false,
                drawOnChartArea: true,
              },
              ticks: {
                display: true,
                padding: 10,
              },
              border: {
                display: true,
                color: '#EAEAEA',
                width: 0,
                dash: [2, 2],
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
                display: false,
              },
              ticks: {
                min: 0,
                max: 100,
                stepSize: 25,
              },
              border: {
                display: true,
                color: '#EAEAEA',
                width: 0,
                dash: [2, 2],
              },
              suggestedMin: 0,
              suggestedMax: 100,
            },
          },
          elements: {
            point: {
              pointStyle: (context) => {
                if (context.dataIndex === 0 || context.dataIndex === context.dataset.data.length - 1) {
                  return false;
                } else {
                  return 'circle';
                }
              },
              radius: 5,
            },
            line: {
              borderColor: 'red',
              borderWidth: 2,
            },
          },
          layout: {
            padding: {
              left: 20,
              right: 70,
              top: -50,
              bottom: -19,
            }
          }
        },
      });
    }
  }, [data]);

  return (
    <div className="lineChart">
      <canvas className="lineChart__canvas" ref={chartRef} />
      <div className="lineChart__filter">
        <select name="year" id="year">
          <option value="year">By Year</option>
          <option value="month">By Month</option>
          <option value="week">By Week</option>
          <option value="day">By Day</option>
        </select>
      </div>
    </div>
  );
};

export default LineChart;
