require('dotenv').config()
var mongodb = require('monk')('localhost:'+process.env.MPORT+'/'+process.env.MDB);

module.exports = mongodb;