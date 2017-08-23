var Promise = require('promise');
var moment = require('moment');


function Questions(){
	this.db = require('../kernel/db.js');
	this.table = this.db.get('questions');
}

Questions.prototype.new = function(user_id,username){
	var datestring = new Date().toISOString()
	var struct = {
		userId:user_id,
		username: username,
		questions:[
			{
			questionId:1,
			questionText:'¿Qué es lo que te gusta de programar?',
			wordCount:0,
			next:2
			},
			{
			questionId:2,
			questionText:'¿Cuál es tu lenguaje favorito para programar y por qué?',
			wordCount:0,
			next:3,
			previous:1
			},
			{
			questionId:3,	
			questionText:'¿Cuál es el proyecto que más te costó terminar? ¿Qué lo hizo tan difícil?',
			wordCount:0,
			previous:2
			}
		],
		answeredQuestions:0,
		totalWordCount:0,
		lastProgress:datestring
	}
	this.table.insert(struct);
	return true;
}

Questions.prototype.get_all = function(){
	var conn = this;
	return new Promise(function(resolve, reject){
		conn.table.find({}).then(function(values){
			return resolve(values);
		})
	})
}

Questions.prototype.save = function(content, userId, questionId){
	var conn = this;
	return new Promise(function(resolve, reject){
		conn.table.find({'userId':userId}).then(function(results){
			var question_data = results[0];
			var split_content = content.split(' ');
			question_data.questions[questionId-1].wordCount = split_content.length;
			if (question_data.questions[questionId-1].answer == null){
				question_data.answeredQuestions += 1;
			} 
			question_data.questions[questionId-1].answer = content;
			question_data.totalWordCount = 0;
			for (var i = 0; i < question_data.questions.length;i++){
				question_data.totalWordCount += question_data.questions[i].wordCount
			}
			conn.table.update({'userId':userId},question_data);
			return resolve();
		})
	})
}

Questions.prototype.get = function(user,question){
	var conn = this;
	return new Promise(function(resolve,reject){
		conn.table.find({'userId':user}).then(function(results){
			return resolve(results[0].questions[question-1]);
		})
	})
}

Questions.prototype.get_next = function(user){
	var db = this;
	return new Promise(function(resolve, reject){
		db.table.find({'userId':user}).then(function(results){
			var questions  = results[0].questions;
			for (var i = 0; i < questions.length; i++){
				if (questions[i].wordCount === 0){
					return resolve(questions[i].questionId);
				}
			}
			return resolve(questions[0].questionId);
		})
	})
}


module.exports = Questions;