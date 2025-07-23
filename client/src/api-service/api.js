import api from "./axios.js"
import toast from 'react-hot-toast'

// on success data is in response.data.data  and message is in response.data.message
// on errror message is in error.response.data.message
// code error.response.data.status

export const sendOtp = async (email) => {
  try {
    const response = await api.post('/auth/send-otp', { email });
    const message = response.data.message;
    toast.success(message);
    return true;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to send the OTP";
    toast.error(errorMessage);
    return false;
  }
};

export const verifyOtp = async (email, otp, registerFlag) => {
  try {
    const response = await api.post('/auth/verify-otp', {
      email,
      otp,
      registerFlag,
    });

    toast.success(response.data.message);
    return response.data.data;
  } catch (error) {
    if (error.response) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Something went wrong");
    }
    return null;
  }
};

export const createUser = async (name, email) => {
  try {
    toast.loading("Creating user...");
    const response = await api.post("/user/register", { name, email });
    return response.data.data;
  } catch (error) {
    if (error.response) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Something went wrong");
    }
    return null;
  } finally {
    toast.dismiss();
  }
};


