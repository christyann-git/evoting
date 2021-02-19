const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id_vote: {
        type: String,
        required: true
    },
    nom: {
        type: String,
        required: true
    },
    nombreDeVote: {
        type: Number,
        default: 0
    }
    
});

const Candidat = mongoose.model('Candidat', UserSchema);

module.exports = Candidat;