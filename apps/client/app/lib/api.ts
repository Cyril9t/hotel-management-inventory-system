import axios from "axios";


const api = axios.create({
    baseURL: "https://hms-d740.onrender.com",
    withCredentials: true
})

export default api