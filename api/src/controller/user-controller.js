var User    = require('../models/user');
var jwt     = require('jsonwebtoken');
var config  = require('../config/config');
var fs = require('fs');
//-------------------------------
var jwt_decode = require('jwt-decode');
const nodemailer= require('nodemailer')
var bcrypt = require('bcryptjs');
var smtpTransport = require('nodemailer-smtp-transport');
//--------------------------------
var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};
//--------------------------------
function createToken(user){
    return jwt.sign({ id: user.id, email: user.email, ci: user.ci, level: user.level}, config.jwtSecret, {
        expiresIn: 62208000
    });
}

exports.registerUser = (req, res) =>{
    
    if(!req.body.email || !req.body.password){
        return res.status(400).json({'msg':'Usted necesita enviar un Email y un password'});
    }

    User.findOne({ email: req.body.email }, (err, user)=>{
        if(err){
            return res.status(400).json({'msg': err});
        }

        if(user){
            return res.status(400).json({'msg':'El usuario ya existe'});
        }
        let newUser = User(req.body);

        newUser.save((err, user)=>{
            if(err){
                return res.status(400).json({'msg': err});
            }
            return res.status(201).json(user);
        });        

    })
};

exports.updateUser = (req, res)=>{
    var userId = req.body.id;
	let updateUser = User(req.body);
    	User.findOneAndUpdate({_id: userId}, updateUser, {new:true, useFindAndModify: false}, (err, userUpdate) => {
        if (err) {
            res.status(500).send({message:'Error al actualizar el usuario'});
        }else{
            if (!userUpdate) {
                res.status(404).send({message:'No se ha podido actualizar el usuario'});
            }else{
                res.status(200).send({user: userUpdate});
            }
        }
    });
};



 exports.loginUser =  (req, res) =>{
    if(!req.body.email || !req.body.password){
        return res.status(400).json({'msg':'Usted necesita enviar un Email y un password'});
    }

      User.findOne({ email: req.body.email }, (err, user)=>{
        if(err){
            return res.status(400).json({'msg': err});
        }

        if(!user){
            return res.status(400).json({'msg':'El usuario no existe'});
        }
        
         user.comparePassword(req.body.password, (err, isMatch)=>{
            if(isMatch && !err){
                return res.status(200).json({
                    token: createToken(user)
                });
            }else{
                return res.status(400).json({
                    msg: 'El correo electrónico y la contraseña no coinciden'
                });
            }
        })
    })

};


//endpoint para agregar o actualizar id del equipo movil (pushid) cuando el usuario ingresa a Mis solicitudes o se registra  
exports.updateEquipo =async (req, res)=>{
    if((String(req.body.pushid))=='undefined'){
        res.json({'msg':'No existe id del equipo movil'});
    }else{
        const {ci,pushid} =req.body
        const idCi =  req.body.ci
        const codigo=   req.body.pushid
        await User.updateOne({ ci:idCi}, { pushid:codigo})
        res.json({'msg':'Id de equipo movil actualizado correctamente'})    
  }
}

//verificar si el correo existe en la base de datos
//enviar correco electronico si el correo existe 
exports.reestablecer =  async (req, res)=>{
    try{
        const {email}=req.body;
        const usuarioVerificado = await User.findOne({email:email});
        console.log('usuario',usuarioVerificado);
        if(usuarioVerificado!=null){
            const numeroAleatorio = Math.floor(1000000 + Math.random() * 9000000);
            const encPassword = await bcrypt.hash(String(numeroAleatorio),10);
            const result = await User.updateOne({ ci: usuarioVerificado.ci }, { password:encPassword});
            console.log('result',usuarioVerificado);
            if(!result.nModified) return res.send(false);
            const correoUsuario = usuarioVerificado.email; 
            let transporter = nodemailer.createTransport(smtpTransport({
                service: 'gmail',
                auth: {
                    user:'agilpass2024@gmail.com',
                    pass: 'kdlu gjlu pacj gjgr',
                }
                /*host: 'm78.siteground.biz',
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: String(config.email), // generated ethereal user
                    pass: String(config.passwordApp), // generated ethereal password
                },*/
            }));
            //------------------------------------------
            const mailOptions = {
                from: String(config.email), //CORREO DEL REMITENTE
                to: String(correoUsuario),//CORREO DE DESTINO
                subject:'AGILPASS - Reestablecer contraseña', //ASUNTO DEL CORREO
                html:`<p>Estimado usuario,</p>
                <p>Su nueva contraseña es: <strong>${numeroAleatorio}</strong></p>
                <p>Le recomendamos que cambie esta contraseña lo antes posible para garantizar una mayor seguridad en su cuenta.</p>
                <p>Atentamente,</p>
                <p>El equipo de soporte</p>`
            };
            //------------------------------------------
            transporter.sendMail(mailOptions,(err,response)=>{
                    if(err){
                        return res.send(false);
                    }else{
                        return res.send(true);
                    }
            })
        }else{
            return res.send(false); 
        }   
    }catch(e){
        return res.send(e); 
    }
}

//Entrega id del equipo movil
exports.getIdEquipo = async (req, res)=>{
    const info = await User.findOne({ ci: req.params.ci })
    if(info==null){
        res.json(false)
    }else{
        if((String(info.pushid))!='undefined' && (String(info.pushid))!='null'&& (String(info.pushid))!='1' &&(String(info.pushid))!=''){
            res.json(info.pushid)
        }else{
            res.json(false)
        }
    }


}
//Guardar nueva contraseña
exports.resetear= async(req, res)=>{
    const {ci, password}=req.body
    const valido = true 
    if(req.body.token!=undefined &&req.body.token!=null){
        try{
            let decoded = jwt_decode(String(req.body.token));
            if(Number(decoded.ci)!=Number(ci)){
                valido=false
            }
        }catch(error){
            valido=false
        }
    }
    if(valido){
        const encPassword = await bcrypt.hash(password,10)
        await User.updateOne({ ci:ci}, { password:encPassword},(err,contrasena)=>{
                    if(err){
                            return res.send(false)
                    }else{
                            return res.send(true)
                    }
        })
    }else{
        return res.send(false)
    }
}
//Guardar notificaciones
exports.updateNotificaciones =async (req, res)=>{
        const {ciNot,cabezaNot,cuerpoNot} =req.body
        User.updateOne({ ci:ciNot}, {
            $push:{
                'notificaciones':{
                    cabeza:cabezaNot,
                    cuerpo:cuerpoNot
                }
            }
        },
        (err,notificaciones)=>{
                if(err){
                    return res.status(500).json({"mensaje":"Ocurrio un error en la conexión"})
                }else{
                    if(notificaciones.nModified<1){
                         return res.status(400).json({"mensaje":"No se puede guardar la notificación"})
                    }else{
                        return res.status(201).json({"mensaje":"Notificación guardada"})
                    }
                }
            }
        )
}
//Eliminar notificaciones
exports.deleteNotificaciones =async (req, res)=>{
        const ciNot =req.params.ci 
        let resultado = await User.update({ ci:ciNot},{$unset:{"notificaciones":""}},
            (err,notificacion)=>{
                if(err){
                    return res.status(500).json({"mensaje":"Ocurrio un error en la conexión"})
                }else{
                    if(notificacion.nModified<1 && notificacion.n<1 ){
                        return res.status(400).json({"mensaje":"Ocurrio un error al eliminar las notificaciones"})
                    }else if(notificacion.nModified<1 && notificacion.n>0){
                        return res.status(200).json({"mensaje":"No existe notificaciones para eliminar"})
                    }else{
                        return res.status(200).json({"mensaje":"Notificaciones eliminadas"})   
                    }
                }
            }
        )
}
//Obtener nuevas notificaciones
exports.obtenerNotificaciones =async (req, res)=>{
        const ciNot =req.params.ci 
        const info = await User.findOne({ ci:ciNot })
        if(info!=null){
            return res.status(200).json(info.notificaciones)
        }else{
            return res.status(400).json({"mensaje":"No se pudo obtener las notificaciones"})
        }
}