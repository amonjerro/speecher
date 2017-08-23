require('dotenv').config()

var express 	= require('express');
var bodyParser 	= require('body-parser');
var router 		= express.Router();
var crypto 		= require('crypto');
var fs 			= require('fs');
var session 	= require('express-session');
var sanitizer	= require('sanitize-html');

var User 		= require('../model/user.js');
var Questions	= require('../model/questions.js');
var u = new User();
var q = new Questions();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}))
router.use(session({secret:process.env.SECRET,resave:false,saveUninitialized:false}))
router.use('/*',express.static(__dirname + '../public'));

var ssn;

function password_strength(string){
	strength = 0;
	upper_case_test = '/[A-Z]/';
	lower_case_test = '/[a-z]';
	numbers_test = '/[0-9]/';
	special_characters  = '/[^A-z][^a-z][^0-9]/';
	if (upper_case_test.test(string)){
		console.log('Upper case letters in password');
		strength++;
	}
	if (lower_case_test.test(string)){
		console.log('Lower case letters in password');
		strength++;
	}
	if (numbers_test.test(string)){
		console.log('Numbers in password');
		strength++;
	}
	if (special_characters.test(string)){
		console.log('Special characters in password');
		strength++;
	}
	if (string.length > 8){
		console.log('Password length sufficient');
		strength++;
	}
	return strength;
}

router.get('/',function(req,resp){
	ssn = req.session;
	ssn.token = crypto.randomBytes(32).toString('hex');
	resp.render('login',{page_title:'Login', token:ssn.token});
})

router.get('/logout',function(req,resp){
	ssn = req.session;
	ssn.user_id = '';
	ssn.username = '';
	ssn.group = '';
	resp.redirect('/');
})

router.post('/login',function(req,resp,next){
	var token = req.body.token;
	if (!token == req.session.token){
		resp.json({error:true,message:'Authorization Error'})
	} else {
		console.log('Token OK');
	}
	var id = req.body.id;
	var password = req.body.password;
	id = sanitizer(id,{allowedTags:[]});
	password = sanitizer(password,{allowedTags:[]})
	if (id == null || password == null){
		resp.json({ok:false,message:'Missing login information'})
	}
	u.login(id,password).then(function(user_info){
		ssn = req.session;
		ssn.user_id = user_info.id;
		ssn.username = user_info.username;
		ssn.group = user_info.group;
		if (user_info.group == 'admin'){
			return resp.json({url:'./admin',ok:true});
		} else {
			return resp.json({url:'./user/'+user_info.id+'/question',ok:true});
		}
	}).catch(function(err){
		resp.json({ok:false,message:'Login Failed',detail:err})
	})
})

router.get('/admin',function(req,resp){
	if (req.session.group != null && req.session.group == 'admin'){
		ssn = req.session;
		ssn.token = crypto.randomBytes(32).toString('hex');
		resp.render('admin',{username:ssn.username, token:ssn.token});	
	} else {
		console.log('Unauthorized Access');
		resp.redirect('/');
	}
})

router.post('/admin/new/password',function(req,resp){
	resp.json({strength:password_strength(req.body.password)});
})

router.get('/admin/user/list',function(req,resp){
	if(req.query.token == null || req.session.token !== req.query.token){
		resp.json({ok:false})
		return;
	}
	u.list().then(function(vals){
		resp.json({ok:true,users:vals});
	})
})

router.get('/report',function(req,resp){
})

router.post('/admin/user/new',function(req,resp){
	if (req.body.token == null || req.body.token !== req.session.token){
		return resp.render('modal_user',{message:'Authorization Error',layout:false});
	}
	var id = sanitizer(req.body.id,{allowedTags:[]});
	var password = sanitizer(req.body.password,{allowedTags:[]});
	var group = sanitizer(req.body.group,{allowedTags:[]});
	var username = sanitizer(req.body.username,{allowedTags:[]});
	u.exists(id).then(function(result){
		if (result){
			resp.render('modal_user',{message:'User already exists',layout:false})
			return;
		}
		if(group != 'admin'){
			q.new(id,username);
		}
		u.new({
			id:id,
			password:password,
			username:username,
			group:group
		}).then(function(val){
			resp.render('modal_user',{message:'User created succesfully',layout:false})
		})
	})
})

router.get('/user/:userId/question',function(req,resp){
	if (req.session.user_id !== req.params.userId){
		resp.redirect('/');
		return;
	}
	q.get_next(req.params.userId).then(function(results){
		resp.redirect('/user/'+req.params.userId+'/question/'+results);
	})
})

router.get('/user/:userId/question/:questionId',function(req,resp){
	q.get(req.params.userId, req.params.questionId).then(function(results){
		var answer = '';
		var next = null;
		var previous = null;
		if (results.answer != null){
			answer = results.answer;
		}
		if (results.previous != null){
			previous = results.previous
		}
		if (results.next != null){
			next  = results.next
		}
		ssn = req.session;
		ssn.question = results.questionId;
		resp.render('home',{
				userID:req.params.userId,
				previous:previous,
				next:next,
				question:results.questionText,
				value:answer,
				questionId:results.questionId})	
	})
})

router.post('/send',function(req,resp){
	q.save(req.body.content, req.session.user_id,req.session.question).then(function(results){
		resp.render('modal_saved',{layout:false})
	})
})

module.exports = router;