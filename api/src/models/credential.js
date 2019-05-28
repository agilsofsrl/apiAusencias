var mongoose = require('mongoose');

var CredentialSchema = new mongoose.Schema({
    codigo: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    appid: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    senderid: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    header: {
        type: String,
        unique: true,
        required: true,
        trim: true
    }
})




module.exports = mongoose.model('Credential', CredentialSchema);