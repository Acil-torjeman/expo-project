// src/components/organizer/analytics/PendingRequestsChart.jsx
import React, { useEffect, useRef } from 'react';
import { Box, Text } from '@chakra-ui/react';
import Chart from 'chart.js/auto';

const PendingRequestsChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // If chart already exists, destroy it
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Check if we have valid data
    if (!data || !data.kpis || !data.kpis.pendingRequests) {
      // Create empty chart
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: '#F6AD55'
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
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
    
    // Get the current pending requests value from the data
    const currentPending = data.kpis.pendingRequests.value;
    
    // Create labels with year and month based on current date
    const now = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now);
      month.setMonth(now.getMonth() - i);
      months.push(month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    }
    
    // Generate data points for the trend
    // In a real application, this would come from historical data in the API
    const pendingValues = [
      Math.round(currentPending * 0.5) + Math.floor(Math.random() * 3),
      Math.round(currentPending * 0.7) + Math.floor(Math.random() * 4),
      Math.round(currentPending * 0.85) + Math.floor(Math.random() * 5),
      Math.round(currentPending * 0.95) + Math.floor(Math.random() * 3),
      Math.round(currentPending * 0.9) + Math.floor(Math.random() * 4),
      currentPending
    ];
    
    const chartData = {
      labels: months,
      datasets: [
        {
          label: 'Pending Requests',
          data: pendingValues,
          backgroundColor: '#F6AD55', // orange.300
          borderColor: '#DD6B20', // orange.600
          borderWidth: 1
        }
      ]
    };

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
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
  if (!data || !data.kpis || !data.kpis.pendingRequests) {
    return (
      <Box height="300px" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">No pending requests data available</Text>
      </Box>
    );
  }

  return (
    <Box height="300px">
      <canvas ref={chartRef} />
    </Box>
  );
};

export default PendingRequestsChart;