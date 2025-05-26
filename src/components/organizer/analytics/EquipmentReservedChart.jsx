// src/components/organizer/analytics/EquipmentReservedChart.jsx
import React, { useEffect, useRef } from 'react';
import { Box, Text } from '@chakra-ui/react';
import Chart from 'chart.js/auto';

const EquipmentReservedChart = ({ data }) => {
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
    if (!data || !data.kpis || !data.kpis.equipmentReserved) {
      // Create empty chart
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
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
    
    // Get equipment reserved count
    const equipmentCount = data.kpis.equipmentReserved.value || 0;
    
    // Create a simple display for equipment count
    const chartData = {
      labels: ['Equipment Reserved'],
      datasets: [
        {
          data: [equipmentCount, Math.max(10, equipmentCount * 0.2)], // Visual proportion
          backgroundColor: [
            '#68D391', // green.300
            '#F7FAFC'  // gray.50
          ],
          borderWidth: 0
        }
      ]
    };

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        cutout: '70%',
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.dataIndex === 0) {
                  return `Equipment Reserved: ${equipmentCount}`;
                }
                return '';
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
  if (!data || !data.kpis || !data.kpis.equipmentReserved) {
    return (
      <Box height="300px" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">No equipment data available</Text>
      </Box>
    );
  }

  const equipmentCount = data.kpis.equipmentReserved.value || 0;

  return (
    <Box height="300px" position="relative">
      <canvas ref={chartRef} />
      <Box 
        position="absolute" 
        top="50%" 
        left="50%" 
        transform="translate(-50%, -50%)"
        textAlign="center"
      >
        <Text 
          fontSize="3xl" 
          fontWeight="bold" 
          color="green.500"
        >
          {equipmentCount}
        </Text>
        <Text fontSize="sm" color="gray.500">Equipment</Text>
      </Box>
    </Box>
  );
};

export default EquipmentReservedChart;