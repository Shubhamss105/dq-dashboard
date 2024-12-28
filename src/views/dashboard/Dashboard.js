import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CChartLine, CChartPie } from '@coreui/react-chartjs';
import { CFormSelect, CSpinner, CRow, CCol, CCard, CCardBody, CCardHeader } from '@coreui/react';
import { fetchChartData, fetchWeeklyChartData, fetchOverallReport } from '../../redux/slices/dashboardSlice';

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
  const [selectedWeekYear, setSelectedWeekYear] = useState(new Date().getFullYear());
  const [dropdownStates, setDropdownStates] = useState({
    collection: 'today',
    invoices: 'today',
    completedOrders: 'today',
    rejectedOrders: 'today',
  });

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchOverallReport({ restaurantId }));
      dispatch(fetchChartData({ year: selectedYear, restaurantId }));
      dispatch(fetchWeeklyChartData({ year: selectedWeekYear, restaurantId }));
    }
  }, [dispatch, selectedYear, selectedWeekYear, restaurantId]);

  const handleDropdownChange = (key, value) => {
    setDropdownStates((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return (
      <option key={year} value={year}>
        {year}
      </option>
    );
  });

  const getReportData = (key) => {
    const state = dropdownStates[key];
    return {
      collection: overallReport?.[`${state}Collection`],
      invoices: overallReport?.[`totalInvoice${state.charAt(0).toUpperCase() + state.slice(1)}`],
      completedOrders: overallReport?.[`totalCompleteOrder${state.charAt(0).toUpperCase() + state.slice(1)}`],
      rejectedOrders: overallReport?.[`totalRejectOrder${state.charAt(0).toUpperCase() + state.slice(1)}`],
    }[key];
  };

  const renderReportCard = (title, key) => (
    <CCol md={3}>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          {title}
          <CFormSelect
            value={dropdownStates[key]}
            onChange={(e) => handleDropdownChange(key, e.target.value)}
            style={{ width: '120px' }}
          >
            <option value="today">Today</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </CFormSelect>
        </CCardHeader>
        <CCardBody>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              textAlign: 'center',
              margin: '20px 0',
            }}
          >
            {getReportData(key) || 0}
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h2 className="mb-4">Dashboard</h2>
      {loading ? (
        <div className="d-flex justify-content-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <>
          {/* Overall Report Section */}
          <CRow className="mb-4" style={{ width: '100%' }}>
            {renderReportCard('Collection (₹)', 'collection')}
            {renderReportCard('Total Invoices', 'invoices')}
            {renderReportCard('Completed Orders', 'completedOrders')}
            {renderReportCard('Rejected Orders', 'rejectedOrders')}
          </CRow>

          {/* Chart Section */}
          <CRow className="justify-content-center" style={{ width: '100%' }}>
            <CCol md={6}>
              <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  Yearly Performance
                  <CFormSelect
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    style={{ width: '120px' }}
                  >
                    {yearOptions}
                  </CFormSelect>
                </CCardHeader>
                <CCardBody>
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
                </CCardBody>
              </CCard>
            </CCol>

            <CCol md={6}>
              <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  Weekly Performance
                  <CFormSelect
                    value={selectedWeekYear}
                    onChange={(e) => setSelectedWeekYear(e.target.value)}
                    style={{ width: '120px' }}
                  >
                    {yearOptions}
                  </CFormSelect>
                </CCardHeader>
                <CCardBody>
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
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  );
};

export default Dashboard;
