var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase:true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    ci: {
        type:String,
        required:true,
        trim:true
    },
    level:{
        type:String,
        required:true,
        trim:true
    },
    pushid:{
        type:String,
        required:true,
        trim:true
    },
    idEquipo:{
         type:String
    },
    notificaciones:[{
        cabeza:{type:String,required:true,trim:true},
        cuerpo:{type:String,required:true,trim:true}
    }]
})

UserSchema.pre('save', function(next) {
    var user = this;

    if(!user.isModified('password')) return next();

    bcrypt.genSalt(10, function(err, salt){
        if(err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.pre('findOneAndUpdate', function(next) {
    var user = this._update;
    delete user._id;

    
    //console.log('ingreso al pre de mod', user);

    //if(!user.isModified('password')) return next();

    bcrypt.genSalt(10, function(err, salt){
        if(err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err);

            //console.log('Este es el hash',hash);

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function (candidatePassword, cb){

    bcrypt.compare(candidatePassword, this.password, (err, isMatch)=>{
        if(err) return cb(err);
        cb(null, isMatch);
    })


}


module.exports = mongoose.model('User', UserSchema);