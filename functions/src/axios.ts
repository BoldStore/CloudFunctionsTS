import axios from "axios";

const axiosInstance = axios.create({
  timeout: 15000,
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

export default axiosInstance;
