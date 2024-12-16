import React from 'react';
import { useParams } from 'react-router-dom';
import { CContainer } from '@coreui/react';

const POSTableContent = () => {
  const { tableNumber } = useParams();

  return (
    <CContainer className="d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="mb-4">Table {tableNumber}</h1>
      <p>This is the content page for Table {tableNumber}.</p>
    </CContainer>
  );
};

export default POSTableContent;
