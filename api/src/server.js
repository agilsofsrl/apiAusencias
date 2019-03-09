var express         = require('express');
var bodyParser      = require('body-parser');
var passport        = require('passport');
var mongoose        = require('mongoose');
var config          = require('./config/config');
var port            = process.env.PORT || 5000;


var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next)=>{
	res.header('Access-Control-Allow-Origin','*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X_API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow','GET, POST, OPTIONS, PUT, DELETE');
	next();
});

app.use(passport.initialize());
var passportMiddleware = require('./middleware/passport');
passport.use(passportMiddleware);

app.get('/', function(req, res){
    return res.send('Hello! The API Rest is at http://localhost:'+ port +'/api');
});

var routes = require('./routes.js');
app.use('/api', routes);

mongoose.connect(config.db, { useNewUrlParser:true, useCreateIndex:true });

const conection = mongoose.connection;

conection.once('open', ()=>{
    console.log('MongoDB database connection established successfully!');
});

conection.on('error', (err)=>{
    console.log('MongoDb connection error. Please make sure MongoDB is running.' + err);
    process.exit();
});

app.listen(port);
console.log('There will be dragons: http://localhost:' + port);