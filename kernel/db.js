require('dotenv').config()
var mongodb = require('monk')('localhost:'+process.env.MDB_PORT+'/'+process.env.MDB_DB);

module.exports = mongodb;