import axiosClient from './axiosClient';

export const login = async (email) => {
  const response = await axiosClient.post('/auth/login', { email });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await axiosClient.post('/auth/verify-otp', { email, otp });
  return response.data;
};
