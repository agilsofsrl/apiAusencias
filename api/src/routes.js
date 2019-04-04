var express         	= require('express'),
    routes          	= express.Router();
var userController  	= require('./controller/user-controller');
var credentialController = require('./controller/credential-controller');
var passport        	= require('passport');

routes.get('/',  (req, res)=>{
    return res.send('Hola, esta es la API');
});
routes.get('/getcredential/:codigo', credentialController.getCredentials);
routes.get('/getcredentials', credentialController.getCredentials);
routes.post('/registercredential', credentialController.registerCredential);
routes.post('/register', userController.registerUser);
routes.post('/login', userController.loginUser);
routes.get('/special', passport.authenticate('jwt', { session: false }), ( req, res )=>{
    return res.json({ msg: `Hola ${req.user.email}! Esta pantalla recive la info` });
});

module.exports = routes;