const invariant = require('invariant')

require('dotenv').config()

module.exports = {
  apiToken: process.env.TG_API_TOKEN || invariant(false, 'TG_API_TOKEN is required'),
}
