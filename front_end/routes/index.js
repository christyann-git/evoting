const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Vote = require('../models/Vote');
const Candidat = require('../models/Candidat');
const Votant = require('../models/Votant');
const url = require('url');

global.reqs = [];
router.get('/', (req, res) => res.render('welcome')); 

router.get('/dashbord/result', ensureAuthenticated, (req, res) => {
    res.render('finish');

});

//Dashboard a terminer
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    query =  url.parse(req.url, true).query;

    if (query.vote) {
        vote = query.vote.substr(1);
        Candidat.find({ id_vote: vote })
            .then(candidats => {
                console.log('-->candidat', candidats)
                res.render('info', {
                    candidats: candidats
                });
            })
        
    }
    else {
        let votes = [];
        global.candidats = [];

        // recherche des votes
        Vote.find({ id_organisateur: req.user._id })
            .then(vote => {

                votes = vote;
                console.log(votes)
                if (vote) {
                    Votant.find({ id_client: req.user._id })
                        .then(votants => {
                            res.render('dashboard', {
                                user: req.user,
                                votes: votes,
                                votants: votants
                            })
                        })

                }
                else {
                    Votant.find({ id_client: req.user._id })
                        .then(votant => {
                            res.render('dashboard', {
                                user: req.user,
                                votes: votes,

                            })
                        })
                }
            })

        //console.log(global.candidats.length)
        //console.log(req.user._id);

        global.reqs.push(req.user);
    }
    
    
});



router.get('/dashboard/:vote', ensureAuthenticated, (req, res) => {
    id_vote = req.params.vote;
    console.log('--> req ', req.url);
    
    console.log('--> vote clique ', id_vote);
});



module.exports = router;