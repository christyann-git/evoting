const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Vote = require('../models/Vote');
const Candidat = require('../models/Candidat');
const Votant = require('../models/Votant');

global.reqs = [];

//make a vote
router.get('/make', ensureAuthenticated, (req, res) => {
    
    res.render('make', {
        user: req.user
    })
});

//create a vote
router.get('/create', ensureAuthenticated, (req, res) => {
    res.render('create');

});


//terminate your vote
router.get('/make/finish', ensureAuthenticated, (req, res) => {
    res.render('finish');

});

router.post('/make/finish', ensureAuthenticated, (req, res) => {
    console.log('c est cool');
    console.log(req.body);
    const { choice, ident_vote } = req.body
    console.log('--> ident_vote');

    
    Candidat.findOne({ _id: choice })
        .then(candidat => {
            
            console.log(candidat.nom);
            console.log(candidat.nombreDeVote);
            var value = candidat.nombreDeVote + 1;
            
            var myquery = { _id: choice };
            var newvalues = { $set: { nombreDeVote: value } };
            Candidat.updateOne(myquery, newvalues, function (err, res) {
                if (err) throw err;
                id_client = req.user._id;
                id_vote = ident_vote;
                const newVotant = new Votant({
                    id_client,
                    id_vote
                });
                newVotant.save()
                    .then(vote => {
                        console.log('ca marche');
                    })
                    .catch(err => console.log(err));
            });
            
            

        });
    
});


//vote handle
router.post('/make', ensureAuthenticated, (req, res) => {
    const { id_vote } = req.body;

    Votant.findOne({ id_client: req.user._id })
        .then(votant => {
            if (votant) {
                console.log('--> ', votant._id);
                console.log('--votant.id_vote ', votant.id_vote, typeof (id_vote));
                console.log('--> id_vote ', id_vote, typeof(id_vote));
                if (votant.id_vote !== id_vote) {
                    Candidat.find({ id_vote: id_vote })
                        .then(candidat => {
                            console.log('--> candidat ', candidat);
                            res.render('finish', {
                                candidats: candidat,
                                id_vote: id_vote

                            });

                        });
                    
                } else {
                    console.log('--> deja vote');
                    res.render('login');
                }
            } else {
                Candidat.find({ id_vote: id_vote })
                    .then(candidat => {
                        console.log(candidat);
                        res.render('finish', {
                            candidats: candidat,
                            id_vote: id_vote

                        });

                    });
            }

        })
        
        

    

});

//create vote handle
router.post('/create', ensureAuthenticated, (req, res) => {
    const { intitule, candidatsString } = req.body;
    let candidats = [];
    let errors = [];

    
    //console.log(intitule, Candidats);

    //validation
    if (!intitule || !candidatsString) {
        errors.push({ msg: 'Please fill in all fields' });
    } else {
        candidats = candidatsString.split('/');
    }

    if (errors.length > 0) {
        res.render('create', {
            errors,
            intitule,
            candidatsString
        });
    } else {
        //validation pass

        //create a vote
        id_organisateur = req.user._id;
        status = true;
        const newVote = new Vote({
            intitule,
            id_organisateur,
            status
        });

        newVote.save()
            .then(vote => {
                console.log(vote._id);
                id_vote = vote._id;

                candidats.forEach(candidat => {
                    nom = candidat;
                    const newCandidat = new Candidat({
                        id_vote,
                        nom
                    });
                    newCandidat.save()
                        .then(candidat => {
                            req.flash('success_msg', 'you vote have been created. share the id below for the vote id:', vote.id);
                            
                            res.redirect('/vote/create');
                        })
                        .catch(err => console.log(err));
                        
                });
                
            })
            .catch(err => console.log(err));
    }
    console.log('vote created');
});


module.exports = router;