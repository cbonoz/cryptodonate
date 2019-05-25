Blockcharity
---

Crypto charity donations through the Bitcoin lightning network.

## Inspiration
With no shortage of great causes available for charitable donations, we wanted to create a platform to enable us to quickly choose and split our donations among several organizations.
## What it does
Blockcharity utilizes the lightning network to enable charities from around the world to receive large amounts of small donations with minimal costs for transaction fees and currency conversion.
* Charities can continue to accept payments without fees as long as they remain in the channel
* When a desired charity is discovered, enter your credentials after logging in with blockstack, and you can receive an email for completing the payment and having it forwarded on in Bitcoin to that charity (by Bitcoin address).
* Shorter settlement times also mean the charity has more immediate access to funds.

## How we built it
The project is a web application built using the react for blockstack implementation of the lightning network.
* Lightning network bitcoin payments powered by the open node LN API.
## Challenges we ran into
Implementing Blockstack to handle out authentication and security issues.
## Accomplishments that we're proud of
Were able to get some donations through our app.
## What we learned
We learned how to implement the lightning network using blockstack.
## What's next for Blockcharity
Add a micro-lending feature in which loans are made using crypto-currency and either returned to the lender or passed on to another cause seeking a loan.


### Dev Notes
* https://github.com/benoror/blockstack-create-react-app
* https://forum.blockstack.org/t/dealing-with-cors-errors-in-blockstack-auth-and-react/2592/4