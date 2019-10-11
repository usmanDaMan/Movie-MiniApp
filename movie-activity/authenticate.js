const express = require('express')
const app = express()
const jwt = require('express-jwt')
const jwtAuthz = require('express-jwt-authz')
const jwksRsa = require('jwks-rsa')

exports.checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-1lob6mo9.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  aud: 'http://localhost:4000/',
  issuer: `https://dev-1lob6mo9.auth0.com/`,
  algorithms: ['RS256']
})
