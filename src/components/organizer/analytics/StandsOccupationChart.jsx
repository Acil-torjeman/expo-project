// src/components/organizer/analytics/StandsOccupationChart.jsx
import React, { useEffect, useRef } from 'react';
import { Box, Text } from '@chakra-ui/react';
import Chart from 'chart.js/auto';

const StandsOccupationChart = ({ data }) => {
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
    if (!data || !data.kpis || !data.kpis.standsOccupation) {
      // Create empty chart
      chartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['No Data'],
          datasets: [{
            data: [1],
            backgroundColor: ['#E2E8F0']
          }]
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      });
      return;
    }
    
    // Get stands occupation data from the API
    const standsData = data.kpis.standsOccupation;
    
    // Ensure we have numeric values
    const occupied = parseInt(standsData.occupied) || 0;
    const available = parseInt(standsData.available) || 0;
    
    // Calculate total if not provided
    const total = standsData.total || (occupied + available);
    
    // Safety check to ensure we have valid data
    if (total <= 0) {
      chartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['No Stands'],
          datasets: [{
            data: [1],
            backgroundColor: ['#E2E8F0']
          }]
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'right' }
          }
        }
      });
      return;
    }
    
    const chartData = {
      labels: ['Occupied', 'Available'],
      datasets: [
        {
          data: [occupied, available],
          backgroundColor: [
            '#805AD5', // purple.500
            '#E9D8FD'  // purple.100
          ],
          borderWidth: 0
        }
      ]
    };

    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${value} (${percentage}%)`;
              }
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
  if (!data || !data.kpis || !data.kpis.standsOccupation) {
    return (
      <Box height="300px" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">No stands occupation data available</Text>
      </Box>
    );
  }

  return (
    <Box height="300px">
      <canvas ref={chartRef} />
    </Box>
  );
};

export default StandsOccupationChart;