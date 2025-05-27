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
    
    // Check if we have the real time series data
    if (!data || !data.timeSeriesData || !data.timeSeriesData.datePoints) {
      // Create empty chart if no data is available
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
    
    // Use the real time series data from the backend
    const labels = data.timeSeriesData.datePoints || [];
    const values = data.timeSeriesData.pendingRequestsData || [];
    
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Pending Requests',
          data: values,
          backgroundColor: '#F6AD55', 
          borderColor: '#DD6B20', 
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