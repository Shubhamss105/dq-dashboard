import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CChartLine } from '@coreui/react-chartjs';
import { CFormSelect, CSpinner } from '@coreui/react';
import {
  fetchChartData,
  fetchWeeklyChartData,
} from '../../redux/slices/dashboardSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { chartData, weeklyChartData, loading } = useSelector(
    (state) => state.dashboard
  );
  const restaurantId = useSelector((state) => state.auth.restaurantId);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchChartData({ year: selectedYear, restaurantId }));
      dispatch(fetchWeeklyChartData({ year: selectedYear, restaurantId }));
    }
  }, [dispatch, selectedYear, restaurantId]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

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
      <h2 className="mb-4">Dashboard</h2>

      <div style={{ marginBottom: '20px', width: '200px' }}>
        <CFormSelect
          value={selectedYear}
          onChange={handleYearChange}
          aria-label="Select Year"
        >
          {yearOptions}
        </CFormSelect>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '50px' }}>
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
            />
          </div>

          <div>
            <CChartLine
              data={{
                labels: weeklyChartData?.labels || [],
                datasets: weeklyChartData?.datasets || [],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: `Weekly Performance for ${selectedYear}`,
                  },
                },
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
