var Promise = require('promise');
var bcrypt = require('bcrypt');
const saltRounds = 10;

function Users(){
	this.db =  require('../kernel/db.js');
	this.table = db.get('users');
}

Users.prototype.new = function(params){
	var db = this.db;
	this.hash_password(params.password).then(function(hash){
		params.password = hash;
		db.insert{params}
		return true;
	})
}

Users.prototype.login = function(id,password){
	var obj = this;
	return new Promise(function(resolve, reject){
		this.db.find({id:id}).then(function(object){
			var returnable;
			obj.verify_password(password,object.password).then(function(){
				returnable = {
					id:object.id,
					group:object.group
				}
				return resolve(returnable);
			}).catch(function(){
				return reject();
			})
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
				return resolve();
			} else {
				return reject();
			}
		})
	})
}

module.exports = Users;