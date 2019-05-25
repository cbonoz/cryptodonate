const opennode = require("opennode")
const axios = require("axios")

const INVOICE_KEY =
  process.env.INVOICE_KEY || "9b87e35b-249a-43c0-9d26-e28bc721eef1"
if (!INVOICE_KEY) {
  console.error("INVOICE_KEY env variable required to run server")
  process.exit()
}

const WITHDRAW_KEY =
  process.env.WITHDRAW_KEY || "9b87e35b-249a-43c0-9d26-e28bc721eef1"
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
  createCharge: async function(customer_email, amount, address, callback_url) {
    let charge
    let error
    try {
      const description = `Donate ${amount} to ${address}`
      const data = {
        description,
        amount,
        customer_email,
        callback_url,
        currency: "USD",
        auto_settle: false
      }
      console.log("data", data)
      charge = createInstance(INVOICE_KEY).post("/charges", data)
    } catch (err) {
      error = err
      console.error(`${error.status} | ${error.message}`)
    }
    return { data: charge, error: error }
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
      withdrawal = opennode.initiateWithdrawalAsync(payload)
    } catch (err) {
      error = err
      console.error(`${error.status} | ${error.message}`)
    }
    return { data: withdrawal, error: error }
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
