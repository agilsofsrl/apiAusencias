var User    = require('../models/user');
var jwt     = require('jsonwebtoken');
var config  = require('../config/config');

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
     // var update = req.body;

     //console.log('esto recibi',req.body);
     
    
    let updateUser = User(req.body);



       // console.log('user', updateUser);


    User.findOneAndUpdate({_id: userId}, updateUser, {new:true, useFindAndModify: false}, (err, userUpdate) => {
        if (err) {
            res.status(500).send({message:'Error al actualizar el usuario'});
            console.log(err);
         
        }else{
            if (!userUpdate) {
                res.status(404).send({message:'No se ha podido actualizar el usuario'});
            }else{
                res.status(200).send({user: userUpdate});
            }

        }
    });


};



exports.loginUser = (req, res) =>{
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
                    msg: 'The email and password don\'t match.'
                });
            }
        })
    })
};