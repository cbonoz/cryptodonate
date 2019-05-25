import React, { Component } from "react"
import { Link } from "react-router-dom"
import { Player, BigPlayButton } from "video-react"
import YouTube from "react-youtube"
import CurrencyInput from "react-currency-input"

import "./CharityInfo.css"
import { getCharityById, postCharge, isEmpty } from "../../api"

import "./../../../node_modules/video-react/dist/video-react.css"

export default class CharityInfo extends Component {
  constructor(props) {
    super(props)
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
    this.handleChange = this.handleChange.bind(this)

    this.state = {
      charity: {},
      genres: [],
      user: {},
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

    if (!user) {
      alert("Session expired, please login again")
      window.location.href = "/"
      return
    }

    amount = parseFloat(amount)
    if (isNaN(amount) || amount <= 0) {
      alert("Amount to donate must be a positive dollar value")
    }

    try {
      const result = await postCharge(user.email(), amount, address)
      alert("Submitted donation to %s for %f", address, amount)
    } catch (e) {
      console.error("error submitting donation", e)
      alert(`Error submitting deposit: ${e}`)
    }
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
                {hasUser && <div>
                  <CurrencyInput
                  decimalSeparator="." thousandSeparator="," prefex="$"
                    value={amount}
                    onChangeEvent={this.handleChange}
                  />
                  <br/>
                <br />
                  <button
                    onClick={() => this.donate(amount, charity.address)}
                    className="btn"
                  >
                    Donate Bitcoin
                  </button>
                  </div>
                  }
                {!hasUser && (
                  <button onClick={() => this.props.login()} className="btn">
                    Login to Donate
                  </button>
                )}
              </p>
            )}

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
