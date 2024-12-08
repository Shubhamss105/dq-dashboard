import { useMutation } from '@tanstack/react-query';
import { login, verifyOtp } from '../api/authApi';
import { saveToken } from '../utils/storage';

export const useLogin = () => {
  return useMutation(login, {
    onSuccess: (data) => {
      console.log('Login successful:', data.message);
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation(verifyOtp, {
    onSuccess: (data) => {
      saveToken(data.token); // Save the token after verification
      window.location.href = '/dashboard'; // Redirect to dashboard
    },
  });
};
