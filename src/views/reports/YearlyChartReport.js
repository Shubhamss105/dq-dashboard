// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Line } from 'react-chartjs-2';
// import { fetchDashboardChartData } from '../../redux/slices/reportSlice';
// import { CCard, CCardBody, CSpinner } from '@coreui/react';
// import { useTheme } from '@mui/material/styles';

// const YearlyChartReport = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const { restaurantId } = useSelector((state) => state.auth);
//   const { yearlyChartData, loading } = useSelector((state) => state.reports);
//   const currentYear = new Date().getFullYear();
//     console.log('chartData', yearlyChartData);
//   useEffect(() => {
//     if (restaurantId) {
//       dispatch(fetchDashboardChartData({ year: currentYear, restaurantId }));
//     }
//   }, [restaurantId, dispatch]);


//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: { position: 'top' },
//       title: { display: true, text: `Yearly Stats - ${currentYear}` },
//     },
//   };

//   const chartDataset = {
//     labels: yearlyChartData.labels,
//     datasets: yearlyChartData.datasets.map((dataset) => ({
//       ...dataset,
//       tension: 0.3,
//       borderWidth: 2,
//       pointRadius: 4,
//       pointHoverRadius: 6,
//     })),
//   };

//   return (
//     <CCard className="mt-4">
//       <CCardBody>
//         <h4 className="mb-4">Dashboard Yearly Chart</h4>
//         <Line options={chartOptions} data={chartDataset} />
//       </CCardBody>
//     </CCard>
//   );
// };

// export default YearlyChartReport;
