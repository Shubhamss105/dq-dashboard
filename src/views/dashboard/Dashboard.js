import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CChartLine, CChartPie } from '@coreui/react-chartjs';
import { CFormSelect, CSpinner, CRow, CCol, CCard, CCardBody, CCardHeader } from '@coreui/react';
import {
  fetchChartData,
  fetchWeeklyChartData,
  fetchOverallReport,
} from '../../redux/slices/dashboardSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const {
    chartData,
    weeklyChartData,
    overallReport,
    loading,
  } = useSelector((state) => state.dashboard);
  const restaurantId = useSelector((state) => state.auth.restaurantId);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeekYear, setSelectedWeekYear] = useState(
    new Date().getFullYear()
  );

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchOverallReport({ restaurantId }));
      dispatch(fetchChartData({ year: selectedYear, restaurantId }));
      dispatch(fetchWeeklyChartData({ year: selectedWeekYear, restaurantId }));
    }
  }, [dispatch, selectedYear, selectedWeekYear, restaurantId]);

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return (
      <option key={year} value={year}>
        {year}
      </option>
    );
  });

  return (
    <div style={{ padding: '20px' }}>
      <h2 className="mb-4 ">Dashboard</h2>
      {loading ? (
        <div className="d-flex justify-content-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <>
          {/* Overall Report Section */}
          <CRow className="mb-4" style={{ width: '100%' }}>
            {overallReport && (
              <>
                <CCol md={3}>
                  <CCard>
                    <CCardHeader>Today's Report</CCardHeader>
                    <CCardBody>
                      <p>Collection: ₹{overallReport.todayCollection}</p>
                      <p>Total Invoices: {overallReport.totalInvoiceToday}</p>
                      <p>Completed Orders: {overallReport.totalCompleteOrderToday}</p>
                      <p>Rejected Orders: {overallReport.totalRejectOrderToday}</p>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol md={3}>
                  <CCard>
                    <CCardHeader>Weekly Report</CCardHeader>
                    <CCardBody>
                      <p>Collection: ₹{overallReport.weeklyCollection}</p>
                      <p>Total Invoices: {overallReport.totalInvoiceWeekly}</p>
                      <p>Completed Orders: {overallReport.totalCompleteOrderWeekly}</p>
                      <p>Rejected Orders: {overallReport.totalRejectOrderWeekly}</p>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol md={3}>
                  <CCard>
                    <CCardHeader>Monthly Report</CCardHeader>
                    <CCardBody>
                      <p>Collection: ₹{overallReport.monthlyCollection}</p>
                      <p>Total Invoices: {overallReport.totalInvoiceMonthly}</p>
                      <p>Completed Orders: {overallReport.totalCompleteOrderMonthly}</p>
                      <p>Rejected Orders: {overallReport.totalRejectOrderMonthly}</p>
                    </CCardBody>
                  </CCard>
                </CCol>
              </>
            )}
          </CRow>

          {/* Chart Section */}
          <CRow className="justify-content-center" style={{ width: '100%' }}>
            <CCol md={6}>
              <div style={{ marginBottom: '20px', width: '200px', margin: '0 auto' }}>
                <CFormSelect
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  aria-label="Select Year for Line Chart"
                >
                  {yearOptions}
                </CFormSelect>
              </div>
              <CChartLine
                data={{
                  labels: chartData?.labels || [],
                  datasets: chartData?.datasets || [],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: `Yearly Performance for ${selectedYear}`,
                    },
                  },
                }}
                style={{ height: '400px' }}
              />
            </CCol>

            <CCol md={6}>
              <div style={{ marginBottom: '20px', width: '200px', margin: '0 auto' }}>
                <CFormSelect
                  value={selectedWeekYear}
                  onChange={(e) => setSelectedWeekYear(e.target.value)}
                  aria-label="Select Year for Pie Chart"
                >
                  {yearOptions}
                </CFormSelect>
              </div>
              <CChartPie
                data={{
                  labels: weeklyChartData?.datasets?.map((ds) => ds.label) || [],
                  datasets: [
                    {
                      data: weeklyChartData?.datasets?.map((ds) =>
                        ds.data.reduce((acc, val) => acc + parseFloat(val || 0), 0)
                      ) || [],
                      backgroundColor:
                        weeklyChartData?.datasets?.map((ds) => ds.backgroundColor) || [],
                      borderColor:
                        weeklyChartData?.datasets?.map((ds) => ds.borderColor) || [],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: `Weekly Performance for ${selectedWeekYear}`,
                    },
                  },
                }}
                style={{ height: '400px' }}
              />
            </CCol>
          </CRow>
        </>
      )}
    </div>
  );
};

export default Dashboard;
