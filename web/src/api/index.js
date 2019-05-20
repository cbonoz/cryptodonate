const axios = require("axios")

const baseURL = process.env.BASE_URL || "http://localhost:5000"

const instance = axios.create({
  baseURL,
  timeout: 3000
})

export const getCharities = async function() {
  return instance.get("/api/charities")
}

export const isEmpty = (obj) => typeof(obj) === 'object' && Object.keys(obj).length == 0

export const postCharge = async function(email, amount, address) {
  const body = {
      email, amount, address
  }
  return instance.post("/api/charge", body)
}

export const getCharityById = async function(id) {
  return instance.get(`/api/charities/${id}`)
}
