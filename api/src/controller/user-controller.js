var User    = require('../models/user');
var jwt     = require('jsonwebtoken');
var config  = require('../config/config');

function createToken(user){
    return jwt.sign({ id: user.id, email: user.email, ci: user.ci, level: user.level}, config.jwtSecret, {
        expiresIn: 86400
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