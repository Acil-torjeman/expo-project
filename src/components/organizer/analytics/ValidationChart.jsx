// src/components/organizer/analytics/ValidationChart.jsx
import React, { useEffect, useRef } from 'react';
import { Box, Text, Center } from '@chakra-ui/react';
import Chart from 'chart.js/auto';

const ValidationChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    if (!data || !data.kpis || !data.kpis.validatedBeforeDeadline) {
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            data: [1],
            backgroundColor: ['#E2E8F0']
          }]
        },
        options: {
          cutout: '70%',
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      });
      return;
    }
    
    const validationRate = data.kpis.validatedBeforeDeadline.value;
    const safeRate = isNaN(validationRate) ? 0 : Math.min(100, Math.max(0, validationRate));
    
    const chartData = {
      labels: ['Before Deadline', 'After Deadline'],
      datasets: [
        {
          data: [safeRate, 100 - safeRate],
          backgroundColor: [
            '#38A169', // green.500
            '#E2E8F0'  // gray.200
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
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed}%`
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

  if (!data || !data.kpis || !data.kpis.validatedBeforeDeadline) {
    return (
      <Box height="300px" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">No validation data available</Text>
      </Box>
    );
  }

  const percentValue = data.kpis.validatedBeforeDeadline.value;

  return (
    <Box height="300px" position="relative">
      <canvas ref={chartRef} />
      <Center 
        position="absolute" 
        top="0" 
        left="0" 
        right="0" 
        bottom="40px"
      >
        <Text 
          fontSize="2xl" 
          fontWeight="bold" 
          color="green.500"
        >
          {percentValue}%
        </Text>
      </Center>
    </Box>
  );
};

export default ValidationChart;