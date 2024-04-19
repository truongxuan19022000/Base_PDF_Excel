import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const BarChart = ({ data }) => {
  const chartRef = useRef(null);
  const barChart = useRef(null);

  useEffect(() => {
    const createOrUpdateChart = () => {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext('2d');

        const containerWidth = chartRef.current.clientWidth;
        const containerHeight = chartRef.current.clientHeight;

        chartRef.current.width = containerWidth;
        chartRef.current.height = containerHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const gradient = ctx.createLinearGradient(0, 0, 0, 306)
        gradient.addColorStop(0, '#AB8B6A')
        gradient.addColorStop(1, '#E4D5C6')

        if (barChart.current) {
          barChart.current.destroy();
        }
        barChart.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [{
              label: 'This year',
              data: data.values1,
              backgroundColor: gradient,
              borderRadius: 4,
              barPercentage: 0.6,
              categoryPercentage: 0.78,
              color: '#8A9091',
              barThickness: 30,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
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
                    family: 'Roboto',
                    size: 12,
                    weight: '400',
                  },
                  generateLabels: (chart) => {
                    return chart.data.datasets.map((dataset) => ({
                      text: dataset.label,
                      fillStyle: dataset.backgroundColor,
                      strokeStyle: dataset.backgroundColor,
                      color: '#8A9091',
                    }))
                  },
                },
              },
              title: {
                color: '#8A9091',
              },
              tooltip: {
                callbacks: {
                  label(context) {
                    const value = context.parsed.y
                    return value === 0 ? '0' : value / 1000 + 'k'
                  },
                  title() {
                    return ''
                  },
                  labelTextColor() {
                    return '#453516CC'
                  },
                },
                backgroundColor: '#ede5d8',
                position: 'average',
                displayColors: false,
                titleFont: {
                  weight: 'bold',
                },
                yAlign: 'bottom',
                caretPadding: 10,
              },
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                },
                font: {
                  family: 'Roboto',
                  size: 11,
                  weight: 400,
                  color: '#00000080',
                },
                grid: {
                  display: false,
                  grid: {
                    offset: true,
                  },
                },
                ticks: {
                  display: true,
                },
                border: {
                  display: true,
                  color: '#EAEAEA',
                },
              },
              y: {
                display: true,
                title: {
                  display: true,
                },
                font: {
                  family: 'Roboto',
                  size: 11,
                  weight: 400,
                  color: '#00000080',
                },
                grid: {
                  color: '#ACACAC80',
                  drawTicks: false,
                },
                ticks: {
                  display: true,
                  min: 0,
                  maxTicksLimit: 5,
                  padding: 9,
                  callback: function (value) {
                    return value === 0 ? '0' : value / 1000 + 'k'
                  },
                },
                border: {
                  display: false,
                  dash: [4, 4],
                },
                beginAtZero: true,
              },
            },
          },
        });
      }
    };

    createOrUpdateChart();

    const resizeHandler = () => {
      createOrUpdateChart();
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      if (barChart.current) {
        barChart.current.destroy();
      }
      window.removeEventListener('resize', resizeHandler);
    };
  }, [data]);

  return (
    <div className="barChart">
      <canvas className="barChart__canvas" ref={chartRef} />
    </div>
  );
};

export default BarChart;
