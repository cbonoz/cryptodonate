const opennode = require("opennode")

const OPEN_KEY = process.env.OPEN_NODE_KEY
if (!OPEN_KEY) {
  console.error("OPEN_NODE_KEY env variable required to run server")
  process.exit()
}

console.log("key", OPEN_KEY)
opennode.setCredentials(OPEN_KEY, "dev") //if no parameter given, default environment is 'live'

module.exports = {
  createCharge: async function(customer_email, amount, callback_url, success_url) {
    let charge
    let error 
    try {
      charge = await opennode.createCharge({
        amount,
        customer_email,
        callback_url,
        success_url,
        currency: "USD",
        auto_settle: false
      })
    } catch (err) {
      error = err
      console.error(`${error.status} | ${error.message}`)
    }
    return {data: charge, error: error}
  },

  withdrawlToAddress: async function(address, amount, callback_url) {
    const description = `Donate ${amount} to ${address}`
    const payload = {
      type: 'ln',
      description,
      address,
      amount,
      callback_url
    };

    let withdrawal
    let error
    try {
      withdrawal = opennode.initiateWithdrawalAsync(payload)
    } catch (err) {
      error = err
      console.error(`${error.status} | ${error.message}`)
    }
    return {data: withdrawal, error: error }
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
    return {data: data, error: error}
  }
}
