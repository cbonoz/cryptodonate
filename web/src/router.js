import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

// Import components to be rendered.
import CharitiesList from "../src/components/CharitiesList";
import CharityInfo from "../src/components/CharityInfo";
import * as blockstack from 'blockstack'

const appConfig = new blockstack.AppConfig(['store_write', 'publish_data', 'email'])
const userSession = new blockstack.UserSession({ appConfig: appConfig })

const getUser = () => {
    const user = userSession.isUserSignedIn() ? userSession.loadUserData() : {}
    if (Object.keys(user).length > 0) {
        console.log('getUser', user)
    }
    return user
}

const login = () => {
    if (userSession.isSignInPending()) {
        userSession.handlePendingSignIn().then(function(userData) {
          console.log('userData', JSON.stringify(userData))
          window.location = window.location.origin
        })
        return
    }
    blockstack.redirectToSignIn()
}

const logout = () => {
    blockstack.signUserOut(window.location.origin)
}

export default(
    <BrowserRouter>
        <Switch>
            <Route component={props => <CharitiesList getUser={getUser} login={login} logout={logout} {...props} />} exact path= "/" />
            <Route component={props => <CharityInfo getUser={getUser} login={login} {...props} /> } path="/charities/:id" />
        </Switch>
    </BrowserRouter>
)

