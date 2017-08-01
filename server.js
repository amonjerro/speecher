var express = require('express');
var app = express();
var router = require('./routes/index.js')

var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

app.set('port',process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.use('/', router);

app.listen(app.get('port'),function(){
	console.log('System online - Press Ctrl+C to shut it down');
})