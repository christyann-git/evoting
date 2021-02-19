const fs = require('fs');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server);
const nbVoters = 5;
const nbCandidates = 5;
const paillierBigint = require('paillier-bigint');
var bigintConversion = require('bigint-conversion');


var paillierPublicKey;
var paillierPrivateKey;
var paillierPublicKeyString;

let result = new Array();
result.length = nbCandidates;
var processedSecrets = 0;
var processedVotes = 0;
let result_candidate = new Array();
var voteEncrypted;
var result_data_candidate;

async function createPaillierKeys () {
	const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(3072);
	paillierPublicKey = publicKey;
	// console.log(publicKey)
	paillierPrivateKey = privateKey;
	init = 0n;
	for (var i = 0; i < result.length; i++) {
		result[i] = paillierPublicKey.encrypt(init);
		// console.log("result[",i,"] = ", result[i])
		// console.log("result[",i,"] = ", paillierPrivateKey.decrypt(result[i]))
	}
	// var m1 = 1
	// var m2 = 2
	// var m3 = 3
	// var c1 = publicKey.encrypt(m1)
	// var c2 = publicKey.encrypt(m2)
	// var c3 = publicKey.encrypt(m3)
	// var encryptedSum = publicKey.addition(c1, c2)
	// console.log("---------------------------------------")
	// console.log(privateKey.decrypt(encryptedSum))
	// var encryptedSum2 = publicKey.addition(encryptedSum, c3)
	// console.log(privateKey.decrypt(encryptedSum2))
	// console.log("---------------------------------------")


}

createPaillierKeys()

var voters = {}; // dict pk => socket

app.get("/", (req, res) => {
	res.sendFile('test.html', {root: __dirname});
});

app.use(express.static("public"))

server.listen(3000, () => {
	console.log("Listening on port 3000...");
});






io.on('connection', (socket) => { 
	console.log("WS connection opened");
	if (Object.keys(voters).length < nbVoters)
	{
		socket.on('sendPublicKey', (publicKey) => { 
			voters[publicKey] = socket;
			console.log("Added new voter");

			if (Object.keys(voters).length == nbVoters)
			{
				io.emit('generateSecrets', {"publicKeys" : Object.keys(voters), "nbCandidates": nbCandidates});
			}

			socket.on('secret', (data) => { 

				voters[data.receiverKey].emit('secret', {"secretEncrypted" : data.secretEncrypted, "candidate" : data.candidate}, () => { 
					++processedSecrets;
					// console.log("I've been called back!", processedSecrets, " times...")
					if (processedSecrets == (nbVoters * nbCandidates))
					{
						console.log("All secrets exchanged between voters");

						// console.log("paillierPublicKey : ", paillierPublicKey)
						// console.log("paillierPublicKey.n : ", bigintToText(paillierPublicKey.n))

						// console.log("paillierPublicKey : ", paillierPublicKey )
						io.emit('generateVote', {"nbCandidates" : nbCandidates, "paillierPublicKeyN": String(paillierPublicKey.n), "paillierPublicKeyG" : String(paillierPublicKey.g)});

					}
				})

			})
			socket.on('vote', (data) => {
				++processedVotes;
				result_data_candidate = result[data.candidate]
				voteEncrypted = BigInt(data.voteEncrypted)
				voteDecrypted = paillierPrivateKey.decrypt(voteEncrypted)
				// console.log("processedVotes : ", processedVotes)
				// console.log("Vote recu! voteEncrypted : ", voteEncrypted);
				// console.log("Vote recu! voteDecrypted : ", voteDecrypted);				
				// console.log("AVANT ADDITION : result[data.candidate] = ", result_data_candidate, " ... result[data.candidate]_dechiffrer = ", paillierPrivateKey.decrypt(result_data_candidate))
				result[data.candidate] = paillierPublicKey.addition(result_data_candidate, voteEncrypted);
				// console.log("APRES ADDITION : result[data.candidate] = ", result[data.candidate], " ... result[data.candidate]_dechiffrer = ", paillierPrivateKey.decrypt(result[data.candidate]))
				// console.log("result[data.candidate] = ", result[data.candidate])
				if (processedVotes == (nbVoters * nbCandidates)){
					console.log("Il y a eu ", processedVotes, " votes, place au depouillement : ")
					for (var i = 0; i < nbCandidates; i++) {
						result_candidate[i] = parseInt(paillierPrivateKey.decrypt(result[i]));
						// console.log("result[i] (decrypted) : ", result_candidate)
						console.log("candidat ", i + 1, " a ", result_candidate[i], " votes")
					}
					result_string = JSON.stringify(result_candidate)
					io.emit('voteFinish', {"result_string" : result_string, "processedVotes" : processedVotes});
				}
				// io.emit('voteFinish', {"result_string" : result_string, "processedVotes" : processedVotes});
			})
		});
	}
	else
	{
		console.log("limit reached")
	}
});

