require('dotenv').config()

var express 	= require('express');
var bodyParser 	= require('body-parser');
var router 		= express.Router();
var crypto 		= require('crypto')
var session 	= require('express-session');
var sanitizer	= require('sanitize-html');



router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}))
router.use(session({secret:process.env.SECRET,resave:false,saveUninitialized:false}))
var ssn;



router.get('/',function(req,resp){
	ssn = req.session;
	ssn.token = crypto.randomBytes(32).toString('hex');
	resp.render('login',{page_title:'Login', token:ssn.token});
})


router.post('/login',function(req,resp,next){
	if (!token == req.session.token){
		resp.json({error:true,message:'Authorization Error'})
	} else {
		console.log('Token OK');
	}
	var id = req.body.id;
	var token = req.body.token;
	id = sanitizer(id,{allowedTags:[]});
	console.log(id);
})

router.get('/admin',function(req,resp){
	resp.render('admin');
})

router.get('/user/:userId/question/:questionId',function(req,resp,next){

})

module.exports = router;