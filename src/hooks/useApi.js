import { useGlobalContext } from '../context/GlobalContext';

export const useApi = () => {
  const { setLoading, setError, clearError } = useGlobalContext();

  const callApi = async (apiFn, onSuccess) => {
    try {
      setLoading(true);
      clearError();
      const response = await apiFn();
      onSuccess(response);
    } catch (error) {
      console.error('Error details:', error); // Log the error for debugging
      setError(error?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  

  return { callApi };
};
