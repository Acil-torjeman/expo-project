// src/components/organizer/analytics/RevenueChart.jsx
import React, { useEffect, useRef } from 'react';
import { Box, Text, Center } from '@chakra-ui/react';
import Chart from 'chart.js/auto';

const RevenueChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // If chart already exists, destroy it
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Create gradient for area under the line
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(128, 90, 213, 0.5)'); // purple.500 with opacity
    gradient.addColorStop(1, 'rgba(128, 90, 213, 0.0)'); // purple.500 fully transparent
    
    // Check if we have the real time series data
    if (!data || !data.timeSeriesData || !data.timeSeriesData.datePoints) {
      // Create empty chart if no data is available
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: gradient,
            borderColor: '#805AD5'
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `$${value}`
              }
            }
          },
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      });
      return;
    }
    
    // Use the real time series data from the backend
    const labels = data.timeSeriesData.datePoints || [];
    const values = data.timeSeriesData.revenueData || [];
    
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Revenue ($)',
          data: values,
          backgroundColor: gradient,
          borderColor: '#805AD5', // purple.500
          borderWidth: 2,
          tension: 0.4, // Smoother curve
          fill: true,
          pointBackgroundColor: '#805AD5',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${value.toFixed(0)}`
            }
          }
        },
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => `$${context.parsed.y.toFixed(2)}`
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  // If no data available, show a message
  if (!data || !data.kpis || !data.kpis.totalRevenue) {
    return (
      <Box height="300px" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">No revenue data available</Text>
      </Box>
    );
  }

  return (
    <Box height="300px">
      <canvas ref={chartRef} />
    </Box>
  );
};

export default RevenueChart;