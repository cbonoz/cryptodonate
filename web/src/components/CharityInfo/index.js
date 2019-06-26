import React, { Component } from "react"
import { Link } from "react-router-dom"
// import { Player, BigPlayButton } from "video-react"
import YouTube from "react-youtube"
import CurrencyInput from "react-currency-input"
import { Button, Form, Modal } from "react-bootstrap"

import "./CharityInfo.css"
import { getCharityById, postCharge, isEmpty } from "../../api"
import "./../../../node_modules/video-react/dist/video-react.css"

const OPEN_NODE_REDIRECT = `https://checkout.opennode.co`

export default class CharityInfo extends Component {
  constructor(props) {
    super(props)
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleEmailChange = this.handleEmailChange.bind(this)
    this.handleNotesChange = this.handleNotesChange.bind(this)
    this.handleShow = this.handleShow.bind(this)
    this.handleClose = this.handleClose.bind(this)

    this.state = {
      charity: {},
      genres: [],
      user: {},
      show: false,
      email: '',
      notes: '',
      amount: "0.00",
      height: window.innerWidth,
      width: window.innerHeight - 200
    }
  }

  updateWindowDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight - 200
    })
  }

  // Makes a call to API to request charity details for the selected charity.
  async componentDidMount() {
    this.updateWindowDimensions()
    window.addEventListener("resize", this.updateWindowDimensions)
    const id = this.props.match.params.id
    const charityData = await getCharityById(id)
    const charity = charityData.data
    const youtubeUrl = (charity && charity.video_url) || ""
    const url = new URL(youtubeUrl)
    const video_url = url.searchParams.get("v")
    charity.video_url = video_url
    console.log(youtubeUrl, video_url)
    const user = this.props.getUser()
    this.setState({ charity, user })
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions)
  }

  async donate(amount, address) {
    const user = this.props.getUser()

    const { getDonationsFile, putDonationsFile } = this.props
    const { email, charity } = this.state

    if (!email) {
      alert("Email must be provided")
      return
    }

    if (!user) {
      alert("Session expired, please login again")
      window.location.href = "/"
      return
    }

    amount = parseFloat(amount.replace('$', ''))
    if (isNaN(amount) || amount <= 0) {
      alert("Amount to donate must be a positive dollar value")
      return
    }

    this.setState({email: '', show: false})
    let result = undefined
    try {
      result = await postCharge(email, amount, address, charity.original_title)
      const data = result.data
      // alert(`Submitted donation to ${charity.original_title} (${address}) for $${amount} (paid in BTC)!`)
      if (data && data.id) {
        // alert(`Complete your donation`)
        window.location.href = `${OPEN_NODE_REDIRECT}/${data.id}`
      } else {
        alert(`Error submitting deposit, donation response:  ${JSON.stringify(result)}`)
      }
    } catch (e) {
      console.error("error submitting donation", e)
      alert(`Error submitting deposit: ${e}`)
    }
    return result
  }

  async handleDonate(amount, address) {
    this.setState({ show: false })
    const result = await this.donate(amount, address)
    return result
  }

  handleClose() {
    this.setState({ show: false })
  }

  handleShow() {
    const user = this.props.getUser()
    if (user) {
      this.setState({notes: `Thanks from ${user.username}!`})
    }
    this.setState({ show: true })
  }

  handleEmailChange(event) {
    this.setState({email: event.target.value});
  }

  handleNotesChange(event) {
    this.setState({notes: event.target.value});
  }

  handleChange(event, maskedvalue, floatvalue) {
    this.setState({ amount: maskedvalue })
  }

  render() {
    const charity = this.state.charity || {}
    const { height, width, user, amount } = this.state

    const hasUser = !isEmpty(user)
    const backdropURL = charity.backdrop_path
    const opts = {
      height,
      width,
      playerVars: {
        // https://developers.google.com/youtube/player_parameters
        autoplay: 0
      }
    }

    return (
      <section className="charity-info-view">
        {/* <div className="charity-info-backdrop-container"> */}
        {/* <div className="charity-backdrop"> */}

        <Link to="/">
          <button className="btn back-btn">
            <i className="fas fa-chevron-left" />
            <i className="fas fa-chevron-left" />
            &nbsp;BACK
          </button>
        </Link>
        {charity.video_url && (
          <YouTube
            videoId={charity.video_url}
            opts={opts}
            onReady={this._onReady}
          />
        )}
        {/* <Player
          src={
            charity.video_url ||
            "https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
          }
        >
          <BigPlayButton position="center" />
        </Player> */}
        {/* </div> */}

        {/* </div> */}

        <div className="charity-info-container">
          <div className="charity-info-row">
            <h1 style={{ margin: "0px" }}>
              {charity.original_title}
              {/* <span style={{ color: "#888" }}> ({charity.release_date}) </span> */}
            </h1>

            <p style={{ fontStyle: "italic", color: "#888" }}>
              "
              {charity.tagline ||
                (charity.overview && charity.overview.split(".")[0])}
              "
            </p>
            <p style={{ color: "#ddd" }}>---</p>
            <div className="description-container">
              <p style={{ color: "#888" }}>{charity.overview}</p>
            </div>

            <br />
            {charity && (
              <p style={{ color: "#FEFEFE", margin: "0px" }}>
                {hasUser && (
                  <div>
                    <button onClick={() => this.handleShow()} className="btn">
                      Donate Bitcoin
                    </button>
                  </div>
                )}
                {!hasUser && (
                  <button onClick={() => this.props.login()} className="btn">
                    Login to Donate
                  </button>
                )}
              </p>
            )}
            <Modal show={this.state.show} onHide={this.handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Donate to {charity.original_title}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <h5>Enter the amount to donate!</h5>
                <p>
                  USD will be automatically converted to bitcoin during your
                  deposit.
                </p>

                <CurrencyInput
                  decimalSeparator="."
                  thousandSeparator=","
                  prefix="$"
                  value={amount}
                  onChangeEvent={this.handleChange}
                />
                <br />
                <hr/>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control type="email" placeholder="Enter email"
                   value={this.state.email} onChange={this.handleEmailChange}
                  />
                  <Form.Text className="text-muted">
                    You'll be emailed an invoice. Complete the submission
                    process there and you're all done!
                  </Form.Text>
                </Form.Group>
                <Form.Group controlId="formBasicNotes">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control type="text" placeholder="Enter notes" 
                        value={this.state.notes} onChange={this.handleNotesChange}
                  />
                  <Form.Text className="text-muted">
                    Enter any notes to go to the recipient.
                  </Form.Text>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => this.handleDonate(amount, charity.address)}
                >
                  Send Deposit!
                </Button>
              </Modal.Footer>
            </Modal>

            {/* <p style={{ color: "#FEFEFE" }}>
              Runtime:{" "}
              <span style={{ color: "#888" }}>{charity.runtime} minutes</span>
            </p> */}
          </div>

          <div className="charity-info-row">
            {/* <div className="genre-list">{ genres }</div> */}
          </div>
        </div>
      </section>
    )
  }
}
