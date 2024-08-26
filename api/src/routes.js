var express         	= require('express'),
    routes          	= express.Router();
var userController  	= require('./controller/user-controller');
var credentialController = require('./controller/credential-controller');
var passport        	= require('passport');

routes.get('/',  (req, res)=>{
    return res.send('Hola, esta es la API');
});
routes.get('/getcredential/:codigo', credentialController.getCredential);
routes.post('/registercredential', credentialController.registerCredential);
routes.post('/register', userController.registerUser);
routes.post('/update', userController.updateUser);
//-----capturar el id del celular y guardar en la bd----------put
routes.post('/updateequipo', userController.updateEquipo);
//-----retornar el id del equipo para la notificacion---------
routes.get('/getIdEquipo/:ci', userController.getIdEquipo);
//busca el correo en la bd, si encuentra envia un correo al usuario para reestablecer contrasena
routes.post('/reestablecer', userController.reestablecer);
//---------------modificar la contrasena----------------------put
routes.post('/resetear', userController.resetear);
//------------------------------------------------------------
routes.post('/guardarNotificaciones',userController.updateNotificaciones);
routes.delete('/deleteNotificaciones/:ci',userController.deleteNotificaciones);
routes.get('/obtenerNotificaciones/:ci',userController.obtenerNotificaciones);
//--------------
routes.post('/login', userController.loginUser);
routes.get('/special', passport.authenticate('jwt', { session: false }), ( req, res )=>{
    return res.json({ msg: `Hola ${req.user.email}! Esta pantalla recive la info` });
});

module.exports = routes;