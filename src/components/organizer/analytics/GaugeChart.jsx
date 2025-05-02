// src/components/organizer/analytics/GaugeChart.jsx
import React, { useEffect, useRef } from 'react';
import { Box, Text, Center } from '@chakra-ui/react';
import Chart from 'chart.js/auto';

const GaugeChart = ({ 
  value = 0, 
  maxValue = 100, 
  label = '', 
  colorScheme = ['#38A169', '#ECC94B', '#E53E3E'],
  inverse = false // Set to true if lower values are better (like processing time)
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // If chart already exists, destroy it
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Handle invalid inputs
    let safeValue = !isNaN(value) ? value : 0;
    const safeMaxValue = !isNaN(maxValue) && maxValue > 0 ? maxValue : 100;
    
    // Clamp value to be within 0 and maxValue
    safeValue = Math.max(0, Math.min(safeMaxValue, safeValue));
    
    // Normalize value to percentage
    const percentage = (safeValue / safeMaxValue) * 100;
    
    // Set color based on percentage and whether inverse is true
    let color;
    if (inverse) {
      // For inverse metrics (lower is better, like processing time)
      if (percentage >= 66) {
        color = colorScheme[2]; // red for high values
      } else if (percentage >= 33) {
        color = colorScheme[1]; // yellow for medium values
      } else {
        color = colorScheme[0]; // green for low values
      }
    } else {
      // For normal metrics (higher is better, like completion rates)
      if (percentage <= 33) {
        color = colorScheme[2]; // red for low values
      } else if (percentage <= 66) {
        color = colorScheme[1]; // yellow for medium values
      } else {
        color = colorScheme[0]; // green for high values
      }
    }
    
    // Create gauge chart
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [percentage, 100 - percentage],
          backgroundColor: [
            color,
            '#E2E8F0'  // gray.200
          ],
          borderWidth: 0,
          circumference: 180,
          rotation: 270
        }]
      },
      options: {
        cutout: '75%',
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        }
      }
    });
    
    // Draw needle
    const drawNeedle = (chart) => {
      if (!chart.getDatasetMeta(0) || !chart.getDatasetMeta(0).data[0]) {
        return; // Safety check
      }
      
      const ctx = chart.ctx;
      const centerX = chart.getDatasetMeta(0).data[0].x;
      const centerY = chart.getDatasetMeta(0).data[0].y;
      const radius = chart.getDatasetMeta(0).data[0].outerRadius;
      
      // Needle angle based on percentage (0-180 degrees)
      const angle = Math.PI * (percentage / 100);
      
      // Draw needle
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      // Needle base
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(0, -radius);
      ctx.lineTo(5, 0);
      ctx.fillStyle = '#4A5568'; // gray.600
      ctx.fill();
      
      // Draw center circle
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#4A5568'; // gray.600
      ctx.fill();
      
      ctx.restore();
    };
    
    // Create custom plugin for needle
    const needlePlugin = {
      id: 'gaugeNeedle',
      afterDatasetDraw: (chart) => {
        drawNeedle(chart);
      }
    };
    
    // Register plugin
    Chart.register(needlePlugin);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      // Unregister plugin to prevent memory leaks
      Chart.unregister(needlePlugin);
    };
  }, [value, maxValue, colorScheme, inverse]);

  return (
    <Box height="200px" position="relative">
      <canvas ref={chartRef} />
      <Center 
        position="absolute" 
        bottom="10px" 
        left="0" 
        right="0" 
        flexDirection="column"
      >
        <Text fontWeight="bold" fontSize="xl">{value}{label}</Text>
        <Text fontSize="sm" color="gray.500">{label ? 'out of ' + maxValue : ''}</Text>
      </Center>
    </Box>
  );
};

export default GaugeChart;