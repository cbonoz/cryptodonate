const axios = require("axios")

const baseURL = process.env.REACT_APP_BASE_URL || "http://localhost:5000"

const instance = axios.create({
  baseURL,
  timeout: 15000
})

export const getCharities = async function() {
  return instance.get("/api/charities")
}

export const isEmpty = (obj) => (typeof(obj) === 'object' && Object.keys(obj).length == 0) || typeof(obj) !== 'object'

export const postCharge = async function(email, amount, address, charityName) {
  const body = {
      email, amount, address, charityName
  }
  return instance.post("/api/charge", body)
}

export const getCharityById = async function(id) {
  return instance.get(`/api/charities/${id}`)
}
