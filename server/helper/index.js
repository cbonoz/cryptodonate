const opennode = require("opennode")
const axios = require("axios")
const uuidv4 = require('uuid/v4');


const INVOICE_KEY = process.env.INVOICE_KEY
if (!INVOICE_KEY) {
  console.error("INVOICE_KEY env variable required to run server")
  process.exit()
}

const WITHDRAW_KEY = process.env.WITHDRAW_KEY
if (!WITHDRAW_KEY) {
  console.error("WITHDRAW_KEY env variable required to run server")
  process.exit()
}

console.log("keys", INVOICE_KEY, WITHDRAW_KEY)

function createInstance(key = "", environment = "live") {
  api_key = key
  const instance = axios.create()
  env = environment
  instance.defaults.baseURL =
    environment === "live"
      ? "https://api.opennode.co/v1"
      : "https://dev-api.opennode.co/v1"
  instance.defaults.timeout = 15000
  instance.defaults.headers = { Authorization: api_key } //, 'user_agent' : version };
  return instance
}

module.exports = {
  createCharge: async function(customer_email, amount, address, callback_url, success_url) {
    try {
      const description = `Donate ${amount} to ${address}`
      const body = {
        description,
        amount,
        customer_email,
        callback_url,
        success_url,
        currency: "USD",
        auto_settle: false,
        order_id: uuidv4()
      }
      console.log("body", body)
      const charge = await createInstance(INVOICE_KEY).post("/charges", body)
      return { data: charge.data.data }
    } catch (error) {
      console.error(`${error.status} || ${error.message}`)
      return { error }
    }
  },

  withdrawlToAddress: async function(address, amount, callback_url) {
    const payload = {
      type: "ln",
      description,
      address,
      amount,
      callback_url
    }

    let withdrawal
    let error
    try {
      opennode.setCredentials(WITHDRAW_KEY, "live") //if no parameter given, default environment is 'live'
      const withdrawal = await opennode.initiateWithdrawalAsync(payload)
      return { data: withdrawal.data, error: error }
    } catch (error) {
      console.error(`${error.status} | ${error.message}`)
      return { error }
    }
  },

  getChargeInfo: async function(chargeId) {
    let data
    let error
    try {
      data = await opennode.chargeInfo(chargeId)
      console.log(data)
    } catch (err) {
      error = err
      console.error(`${error.status} | ${error.message}`)
    }
    return { data: data, error: error }
  }
}
