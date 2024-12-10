import React, { createContext, useContext, useState } from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  return (
    <GlobalContext.Provider value={{ loading, setLoading, error, setError, clearError }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom Hook to use Global Context
export const useGlobalContext = () => useContext(GlobalContext);
