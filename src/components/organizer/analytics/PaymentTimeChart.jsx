// src/components/organizer/analytics/PaymentTimeChart.jsx
import React, { useEffect, useRef } from 'react';
import { Box, Text } from '@chakra-ui/react';
import Chart from 'chart.js/auto';

const PaymentTimeChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    if (!data || !data.kpis || !data.kpis.paymentTimeDistribution) {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Under 24h', '1-2 days', '3-5 days', '1 week+', '2 weeks+'],
          datasets: [{
            data: [0, 0, 0, 0, 0],
            backgroundColor: '#4299E1'
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: '% of Payments'
              },
              ticks: {
                callback: (value) => `${value}%`
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
    
    const distributionData = data.kpis.paymentTimeDistribution;
    const labels = distributionData.labels || ['Under 24h', '1-2 days', '3-5 days', '1 week+', '2 weeks+'];
    const values = distributionData.data || [0, 0, 0, 0, 0];
    
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Payment Distribution',
          data: values,
          backgroundColor: [
            '#4299E1', // blue.400
            '#63B3ED', // blue.300
            '#90CDF4', // blue.200
            '#BEE3F8', // blue.100
            '#EBF8FF'  // blue.50
          ],
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
            beginAtZero: true,
            title: {
              display: true,
              text: '% of Payments'
            },
            ticks: {
              callback: (value) => `${value}%`
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
              label: (context) => `${context.parsed.y}% of payments`
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

  if (!data || !data.kpis || !data.kpis.paymentTimeDistribution) {
    return (
      <Box height="300px" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">No payment time data available</Text>
      </Box>
    );
  }

  const totalPayments = data.kpis.paymentTimeDistribution.totalPayments || 0;

  return (
    <Box height="300px">
      <canvas ref={chartRef} />
      {totalPayments > 0 && (
        <Text fontSize="sm" color="gray.500" mt={2} textAlign="center">
          Based on {totalPayments} payment{totalPayments !== 1 ? 's' : ''}
        </Text>
      )}
    </Box>
  );
};

export default PaymentTimeChart;