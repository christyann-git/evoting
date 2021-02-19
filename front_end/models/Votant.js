const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id_client: {
        type: String,
        required: true
    },
    id_vote: {
        type: String,
        required: true
    }
});

const Votant = mongoose.model('Votant', UserSchema);

module.exports = Votant;