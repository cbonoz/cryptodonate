import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router'
import { CSSTransitionGroup } from 'react-transition-group';
import InfiniteScroll from 'react-infinite-scroll-component';
import queryString from 'query-string'
import hover from "./hover.js";
import "./CharitiesList.css";
import { getCharities, isEmpty } from "../../api/index.js";
import { UserSession } from "blockstack";


class CharitiesList extends Component{
    constructor(props){
        super(props);

        this.state = {
            charityList: [],
            resultList: [],
            page: 1,
            donations: {}
        }
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.pushRef = this.pushRef.bind(this);
    }

    // API call to generate currently popular charities each time the component mounts.
    async componentDidMount(){
        const { getDonationsFile, putDonationsFile, history } = this.props
        this.props.handlePending()
        const user = this.props.getUser()
        const charities = await getCharities()
        this.setState({ user: user, charityList: charities.data.data });

        if (user) {
            let file = undefined
            let donations = {}
            try {
                // attempt to save the current query param
                file = await getDonationsFile()
                donations = JSON.parse(file || '{}')
                const values = queryString.parse(this.props.location.search)
                const { charityName, amount } = values
                if (charityName && amount) {
                    if (!donations.hasOwnProperty(charityName)) {
                        donations[charityName] = 0.0
                    }
                    donations[charityName] = parseFloat(donations[charityName]) + parseFloat(amount)
                    await putDonationsFile(donations)
                    history.push('/')
                }
            } catch (e) {
                file = undefined
            }
            this.setState({donations})
        }
    }

    // Pushing DOM element atrributes as a ref into external file so I can use the data.
    pushRef(ref){
        hover.addListener(ref);
    }

    nextPage() {
        console.log('next')
    }

    login() {
        console.log('login')
        this.props.login()
    }

    logout() {
        console.log('logout')
        this.props.logout()
    }

    renderCharity(charity, i) {
        return (<Link key={i} to={ `/charities/${charity.id}` } style={{ textDecoration: "none", width: "20%"}}>
        <div className="charity-card" data-title={ charity.original_title } data-desc={ charity.overview } data-rating={ charity.vote_average } data-backdrop={charity.backdrop_path} ref={(ref) => { this.charity=ref; this.pushRef(ref); } }>
            <div className="charity-poster" style={{ backgroundImage:`url(${ charity.poster_path })`, height:"200px" , width:"100%" }}></div>
            <h4>{ 
                    charity.original_title.length > 20 ? charity.original_title.substring(0,21) + "..." 
                    : charity.original_title
                }
            </h4>

            <div className="charity-card-info">
                {charity.release_date && <p>Release: { charity.release_date.substring(0,4) }</p>}
                {charity.rating && <p>Rating: { charity.vote_average }</p>}
            </div>
        </div>
    </Link>)
    }

    render() {
        const { charityList, resultList, donations, user} = this.state
        const donatedCharities = Object.keys(donations)

        const hasUser = !isEmpty(user)

        const nowPlaying = charityList.map((charity, i) => this.renderCharity(charity, i))
        const results = resultList.map((charity, i) => this.renderCharity(charity, i))
        
        return(
            <section className="charitiesList-view">
                <div className="backdrop-container">
                    <div className="backdrop-gradient"></div>
                    <div className="overlay"></div>
                    <div className="backdrop-text">
                        <h1 className="backdrop-title" style={{ fontFamily:"Roboto", color: "#FFF", margin: "0px" }}>Title</h1>
                        <span className="backdrop-rating" style={{ color: "red" }}></span>
                        <p className="backdrop-desc" style={{ fontFamily:"Montserrat", color: "#999", width: "55%" }}>Hello, thank you for reading my source code :)</p>
                    </div>
                </div>
                
                <div className="charity-container">
                <InfiniteScroll    
                    pullDownToRefreshContent={
                        <h3 style={{ textAlign: "center" }}>&#8595; Pull down to refresh</h3>
                    }
                    releaseToRefreshContent={
                        <h3 style={{ textAlign: "center" }}>&#8593; Release to refresh</h3>
                    }
                    refreshFunction={ this.refresh }
                    hasMore={ true }
                    loader={
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 14 32 4" width="100vw" height="8" fill="red" preserveAspectRatio="none">
                            <path opacity="0.8" transform="translate(0 0)" d="M2 14 V18 H6 V14z">
                                <animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0" repeatCount="indefinite" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />
                            </path>
                            <path opacity="0.5" transform="translate(0 0)" d="M0 14 V18 H8 V14z">
                                <animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0.1s" repeatCount="indefinite" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />
                            </path>
                            <path opacity="0.25" transform="translate(0 0)" d="M0 14 V18 H8 V14z">
                                <animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0.2s" repeatCount="indefinite" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />
                            </path>
                        </svg>
                    }
                    endMessage={
                        <p style={{ textAlign: "center" }}>
                            No more charities!
                        </p>
                    }>
                    <h2 className="heading">Discover Charities</h2>
                    <CSSTransitionGroup
                        transitionName="fade"
                        transitionEnterTimeout={ 750 }
                        transitionLeaveTimeout={ 500 }>
                        <div className="nowplaying-container">
                        { nowPlaying }
                        </div>
                    </CSSTransitionGroup> 
                </InfiniteScroll>

                <InfiniteScroll    
                    pullDownToRefreshContent={
                        <h3 style={{ textAlign: "center" }}>&#8595; Pull down to refresh</h3>
                    }
                    releaseToRefreshContent={
                        <h3 style={{ textAlign: "center" }}>&#8593; Release to refresh</h3>
                    }
                    refreshFunction={ this.refresh }
                    next={ () => this.nextPage() }
                    hasMore={ true }
                    // loader={
                    //     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 14 32 4" width="100vw" height="8" fill="red" preserveAspectRatio="none">
                    //         <path opacity="0.8" transform="translate(0 0)" d="M2 14 V18 H6 V14z">
                    //             <animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0" repeatCount="indefinite" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />
                    //         </path>
                    //         <path opacity="0.5" transform="translate(0 0)" d="M0 14 V18 H8 V14z">
                    //             <animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0.1s" repeatCount="indefinite" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />
                    //         </path>
                    //         <path opacity="0.25" transform="translate(0 0)" d="M0 14 V18 H8 V14z">
                    //             <animateTransform attributeName="transform" type="translate" values="0 0; 24 0; 0 0" dur="2s" begin="0.2s" repeatCount="indefinite" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />
                    //         </path>
                    //     </svg>
                    // }
                    endMessage={
                        <p style={{ textAlign: "center" }}>
                            No more charities!
                        </p>
                    }>
                    {results && results.length > 0 && <div><h2 className="heading">Results</h2>
                    <CSSTransitionGroup
                        className="results-container"
                        transitionName="fade"
                        transitionEnterTimeout={ 750 }
                        transitionLeaveTimeout={ 500 }>
                        { results }
                </CSSTransitionGroup></div> }
                </InfiniteScroll>
                </div>

                <div className="filters">
                    <h1 id="blockcharity">Blockcharity</h1>

                    <div className="sliders-container">
                        {!hasUser && <div className='user-data centered'>
                            <br/>
                            <p>Charitable deposits with Bitcoin <br/>powered by the lightning network</p>
                            </div>}
                        {hasUser && <div className='user-data centered'>
                            <h5>Logged in as:</h5>
                            <p>{user.username.split('.')[0]}</p>
                            <br/>
                            <p>You can now make deposits!</p>
                            <hr/>
                            {donatedCharities.length > 0 && <div>
                                <p>We appreciate your past donations<hr/></p>
                                {donatedCharities.map((c, i) => {
                                    return <li key={i}>{c}: ${parseFloat(donations[c]).toFixed(2)}</li>
                                })}
                            </div>}
                        </div>}
                    </div>

                {!hasUser && <button onClick={ () => this.login() } className="btn submit-btn">Login</button>}
                {hasUser && <button onClick={ () => this.logout() } className="btn submit-btn">Logout</button>}
                </div>
            </section>
        )
    }
}

export default withRouter(CharitiesList)