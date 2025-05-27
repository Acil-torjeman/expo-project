// src/pages/organizer/Analytics.jsx
import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  SimpleGrid,
  Skeleton,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from '@chakra-ui/react';
import { 
  FiClock, 
  FiDollarSign, 
  FiPackage,
  FiRefreshCw,
  FiHome
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import useAnalytics from '../../hooks/useAnalytics';
import AnalyticsFilters from '../../components/organizer/analytics/AnalyticsFilters';
import KpiCard from '../../components/organizer/analytics/KpiCard';
import ChartContainer from '../../components/organizer/analytics/ChartContainer';
import TimeProcessingChart from '../../components/organizer/analytics/TimeProcessingChart';
import PaymentTimeChart from '../../components/organizer/analytics/PaymentTimeChart';
import RevenueChart from '../../components/organizer/analytics/RevenueChart';
import ValidationChart from '../../components/organizer/analytics/ValidationChart';
import StandsOccupationChart from '../../components/organizer/analytics/StandsOccupationChart';
import PendingRequestsChart from '../../components/organizer/analytics/PendingRequestsChart';

const Analytics = () => {
  const {
    loading,
    error,
    analyticsData,
    events,
    filters,
    updateFilters,
    refreshData
  } = useAnalytics();
  
  const renderWithSkeleton = (content) => {
    if (loading) {
      return <Skeleton height="100%" borderRadius="lg" />;
    }
    return content;
  };

  useEffect(() => {
    if (analyticsData) {
      console.log('Analytics data in component:', analyticsData);
    }
  }, [analyticsData]);

  return (
    <DashboardLayout title="Analytics Dashboard">
      <Box p={6} maxW="7xl" mx="auto">
        <Heading size="lg" mb={2}>Analytics Dashboard</Heading>
        <Text color="gray.500" mb={8}>
          Monitor event performance and revenue metrics
        </Text>
        
        <AnalyticsFilters 
          events={events}
          filters={filters}
          updateFilters={updateFilters}
          refreshData={refreshData}
        />
        
        {error && (
          <Alert status="error" mb={6} borderRadius="lg">
            <AlertIcon />
            <AlertTitle mr={2}>Error loading data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button ml={4} size="sm" colorScheme="red" leftIcon={<FiRefreshCw />} onClick={refreshData}>
              Retry
            </Button>
          </Alert>
        )}
        
        {!loading && !error && (!analyticsData || !analyticsData.kpis) && (
          <Alert status="info" mb={6} borderRadius="lg">
            <AlertIcon />
            <AlertTitle mr={2}>No analytics data available</AlertTitle>
            <AlertDescription>
              There is no data available for the selected filters. Please try selecting a different event or time period.
            </AlertDescription>
          </Alert>
        )}
        
        {/* 5 KPI Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, xl: 5 }} spacing={6} mb={8}>
          {renderWithSkeleton(
            <KpiCard
              title="Avg. Processing Time"
              value={analyticsData?.kpis?.processingTime?.value || 0}
              unit="hours"
              icon={FiClock}
              color="teal"
            />
          )}
          
          {renderWithSkeleton(
            <KpiCard
              title="Avg. Payment Time"
              value={analyticsData?.kpis?.paymentTime?.value || 0}
              unit="hours"
              icon={FiClock}
              color="blue"
            />
          )}
          
          {renderWithSkeleton(
            <KpiCard
              title="Equipment Reserved"
              value={analyticsData?.kpis?.equipmentReserved?.value || 0}
              unit="count"
              icon={FiPackage}
              color="green"
            />
          )}
          
          {renderWithSkeleton(
            <KpiCard
              title="Total Revenue"
              value={analyticsData?.kpis?.totalRevenue?.value || 0}
              unit="currency"
              icon={FiDollarSign}
              color="purple"
            />
          )}
          
          {renderWithSkeleton(
            <KpiCard
              title="Stands Reserved 30 Days Before"
              value={analyticsData?.kpis?.standsReserved30Days?.value || 0}
              unit="count"
              icon={FiHome}
              color="orange"
            />
          )}
        </SimpleGrid>
        
        {/* Main Charts Section */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} mb={8}>
          {renderWithSkeleton(
            <ChartContainer 
              title="Registration Processing Time" 
              description="Average time taken to process registration requests"
            >
              <TimeProcessingChart data={analyticsData} />
            </ChartContainer>
          )}
          
          {renderWithSkeleton(
            <ChartContainer 
              title="Revenue Overview"
              description="Total revenue from paid invoices"
            >
              <RevenueChart data={analyticsData} />
            </ChartContainer>
          )}
        </Grid>
        
        {/* Secondary Charts - Well organized 2x2 grid */}
        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={8} mb={8}>
          {renderWithSkeleton(
            <ChartContainer 
              title="Payment Timing Distribution"
              description="Distribution of payment times across different periods"
            >
              <PaymentTimeChart data={analyticsData} />
            </ChartContainer>
          )}
          
          {renderWithSkeleton(
            <ChartContainer 
              title="Pending Requests"
              description="Number of pending registration requests over time"
            >
              <PendingRequestsChart data={analyticsData} />
            </ChartContainer>
          )}
          
          {renderWithSkeleton(
            <ChartContainer 
              title="Stands Occupation"
              description="Current occupation rate of event stands"
            >
              <StandsOccupationChart data={analyticsData} />
            </ChartContainer>
          )}
          
          {renderWithSkeleton(
            <ChartContainer 
              title="Validated Before Deadline"
              description="Percentage of registrations validated before deadline"
            >
              <ValidationChart data={analyticsData} />
            </ChartContainer>
          )}
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Analytics;