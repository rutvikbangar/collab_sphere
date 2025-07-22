import axios from "axios"

const baseUrl = "http://localhost:3000/api/v1";
const instance = axios.create({
    baseURL:baseUrl,
    timeout:5000,
    headers:{
        'Content-Type': 'application/json'
    }
});

export default instance