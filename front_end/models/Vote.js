const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    intitule: {
        type: String,
        required: true
    },
    id_organisateur: {
        type: String,
        required: true
    },
    nombre_votant: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    pubkey: {
        type: Number
    }
});

const Vote = mongoose.model('Vote', UserSchema);

module.exports = Vote;