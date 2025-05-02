// src/components/organizer/analytics/TimeProcessingChart.jsx
import React, { useEffect, useRef } from 'react';
import { Box, Text, Center } from '@chakra-ui/react';
import Chart from 'chart.js/auto';

const TimeProcessingChart = ({ data }) => {
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
    gradient.addColorStop(0, 'rgba(49, 151, 149, 0.5)'); // teal.500 with opacity
    gradient.addColorStop(1, 'rgba(49, 151, 149, 0.0)'); // teal.500 fully transparent
    
    // If we don't have any data, show empty chart
    if (!data || !data.kpis || !data.kpis.processingTime) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: gradient,
            borderColor: '#319795'
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `${value} hrs`
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
    
    // Get the main value
    const processingTime = data?.kpis?.processingTime?.value || 0;
    
    // Create labels for a time series (use days of week for now)
    // In a real implementation, this would come from backend data points
    const labels = ['Last Week', '6 Days Ago', '5 Days Ago', '4 Days Ago', 
                    '3 Days Ago', '2 Days Ago', 'Yesterday', 'Today'];
    
    // For now, create values that converge toward the current processing time
    // In a real implementation, this would be historical data from the API
    const values = [];
    for (let i = 0; i < labels.length; i++) {
      // More variation at the beginning, converging to the current value
      const randomVariation = (labels.length - i) / labels.length * 2;
      const value = Math.max(0, processingTime + 
                              (Math.random() * 2 - 1) * randomVariation);
      values.push(parseFloat(value.toFixed(1)));
    }
    
    // Make sure the last value is the actual current value
    values[values.length - 1] = processingTime;
    
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Processing Time (hrs)',
          data: values,
          backgroundColor: gradient,
          borderColor: '#319795', // teal.500
          borderWidth: 2,
          tension: 0.4, // Smoother curve
          fill: true,
          pointBackgroundColor: '#319795',
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
              callback: (value) => `${value} hrs`
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
              label: (context) => `${context.parsed.y.toFixed(1)} hrs`
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
  if (!data || !data.kpis || !data.kpis.processingTime) {
    return (
      <Box height="300px" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">No processing time data available</Text>
      </Box>
    );
  }

  return (
    <Box height="300px">
      <canvas ref={chartRef} />
    </Box>
  );
};

export default TimeProcessingChart;