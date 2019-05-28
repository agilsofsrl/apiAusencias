
var Credential    = require('../models/credential');
var jwt     = require('jsonwebtoken');
var config  = require('../config/config');



exports.registerCredential = (req, res) =>{
    
    if(!req.body.appid || !req.body.senderid){
        return res.status(400).json({'msg':'Usted necesita enviar un appId y un senderId válidos'});
    }

    Credential.findOne({ appid: req.body.appid }, (err, credential)=>{
        if(err){
            return res.status(400).json({'msg': err});
        }

        if(credential){
            return res.status(400).json({'msg':'La credencial ya existe'});
        }
        
        let newCredential = Credential(req.body);

        newCredential.save((err, credential)=>{
            if(err){
                return res.status(400).json({'msg': err});
            }
            return res.status(201).json(credential);
        });

    })
};



exports.getCredential = (req, res) =>{

	var cod = req.params.codigo;

	Credential.find({"codigo":cod.toUpperCase()}).exec((err, credential)=>{
		if(err){
			res.status(500).send({message: 'Error en la petición'});
		}else{
			if(!credential){
				res.status(404).send({message: 'No se encontro la credencial'});
			}else{
				res.status(200).send({credential});
			}
			
		}

	});

};

