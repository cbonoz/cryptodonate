const express = require("express")
const bodyParser = require("body-parser")
const csv = require("csvtojson")
const cors = require("cors")
const customEnv = require("custom-env")
customEnv.env(true)

const helper = require("./helper")

const BASE_URL = process.env.BASE_URL || "http://localhost:5000"
const CHARGE_URL = `${BASE_URL}/events/charge`
const WITHDRAW_URL = `${BASE_URL}/events/withdraw`


const WEB_URL = `https://blockcharity.space`

const app = express()
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
app.use(cors())

const port = process.env.HOST || 5000

let donationData

app.get("/api/charities", function(req, res) {
  res.send({ data: donationData })
})

// Get charity details for specific charity.
app.get("/api/charities/:id", (req, res, next) => {
  const id = req.params.id
  const data = donationData.find(c => c.id === id)
  console.log("match", data)
  return res.json(data)
})

app.post("/api/charge", async function(req, res) {
  const body = req.body
  const { email, amount, address, charityName } = body

  if (!address || !email || !amount || !charityName) {
    return res.status(400).send("address, email, charityName, and amount must be specified.")
  }

  const chargeResult = await helper.createCharge(
    email,
    amount,
    address,
    CHARGE_URL, // callback_url
    `${WEB_URL}?charityName=${charityName}&amount=${amount}` // success_url (back to the charity page)
  )

  if (chargeResult.error) {
    return res.status(500).send(chargeResult.error)
  }

  return res.status(200).json(chargeResult.data)
})

app.post("/api/charge/info", async function(req, res) {
  const body = req.body
  const { chargeId } = body

  const data = await helper.getChargeInfo(chargeId)
  return res.json(data)
})

app.post("/events/withdraw", async function(req, res) {
  const body = req.body
  console.log('submitted withdrawl', body)
  return res.status(200).json(body)
})

// webhook for receiving completed charge events
app.post("/events/charge", async function(req, res) {
  const {
    id,
    callback_url,
    success_url,
    status,
    order_id,
    description,
    price,
    fee,
    auto_settle,
    hashed_order
  } = req.body

  const tokens = description.split(" ")
  const address = tokens[tokens.length - 1] // expect: "Send .... to XXX"
  const amount = price

  console.log("event", "charge", status, description, amount, address)

  if (status !== "paid") {
    // don't send the withdrawl until paid status achieved.
    return res.status(200)
  }

  // Received the charge credit, now forward to the listed address
  const withdrawResult = await helper.withdrawlToAddress(
    address,
    amount,
    description,
    WITHDRAW_URL,
    success_url
  )

  if (withdrawResult.error) {
    return res.status(500).send(withdrawResult.error)
  }

  // TODO: broadcast or email the successful deposit to the original sender.
  return res.status(200).json(withdrawResult.data)
})

// Read the config (charity) csv and start the server.
const fileName = `./bitcoin_charities.csv`
console.log("charities", fileName)
csv()
  .fromFile(fileName)
  .then(jsonObj => {
    // console.log(jsonObj)
    donationData = jsonObj

    app.listen(port, async err => {
      if (err) {
        console.error("Something bad happend", err)
      }
      console.log(`App running at: http://localhost:${port}`)
    })
  })
