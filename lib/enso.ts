import axios from "axios"


const BASE_URL = "'http://api.enso.finance/api/v1/"


export const EnsoAgent = axios.create({
    baseURL: BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${BASE_URL}`
    },
});

