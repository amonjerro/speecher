var Promise = require('promise');
var bcrypt = require('bcrypt');
const saltRounds = 10;

function Users(){
	this.db =  require('../kernel/db.js');
	this.table = this.db.get('users');
}

Users.prototype.new = function(params){
	var db = this;
	return new Promise(function(resolve, reject){
		db.hash_password(params.password).then(function(hash){
			params.password = hash;
			db.table.insert(params);
			return resolve();
		})
	})
}

Users.prototype.exists = function(id){
	var db = this;
	return new Promise(function(resolve, reject){
		db.table.find({'id':id}).then(function(value){
			resolve(value.length > 0);
		})
	})
}

Users.prototype.list = function(){
	var db = this;
	return new Promise(function(resolve, reject){
		db.table.find({},'-password').then(function(values){
			resolve(values);
		})
	})
}

Users.prototype.login = function(id,password){
	var obj = this;
	return new Promise(function(resolve, reject){
		obj.table.find({'id':id}).then(function(object){
			var returnable;
			obj.verify_password(password,object[0].password).then(function(){
				returnable = {
					id:object[0].id,
					group:object[0].group,
					username:object[0].username
				}
				return resolve(returnable);
			}).catch(function(error){
				return reject(error);
			})
		}).catch(function(){
			return reject({ok:false,message:'Incorrect login credentials'})
		})
	})
}

Users.prototype.hash_password = function(string){
	return new Promise(function(resolve, reject){
		bcrypt.hash(string,saltRounds).then(function(hash){
			return resolve(hash)
		})
	})
}

Users.prototype.verify_password = function(string,hash){
	return new Promise(function(resolve, reject){
		bcrypt.compare(string,hash).then(function(value){
			if(value){
				return resolve(value);
			} else {
				return reject(value);
			}
		}).catch(function(error){
			return reject(error);
		})
	})
}

module.exports = Users;