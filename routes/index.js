require('dotenv').config()

var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

router.use(bodyParser.json());




router.get('/vars',function(req,resp){
	resp.json(process.env);
})

router.get('/',function(req,resp){
	resp.render('home');
})

module.exports = router;