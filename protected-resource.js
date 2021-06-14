const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")
const { timeout } = require("./utils")
const {JsonWebTokenError } = require("jsonwebtoken")
const jwt = require("jsonwebtoken");

const config = {
	port: 9002,
	publicKey: fs.readFileSync("assets/public_key.pem"),
}

const users = {
	user1: {
		username: "user1",
		name: "User 1",
		date_of_birth: "7th October 1990",
		weight: 57,
	},
	john: {
		username: "john",
		name: "John Appleseed",
		date_of_birth: "12th September 1998",
		weight: 87,
	},
}

const app = express()
app.use(timeout)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/*
Your code here
*/

const server = app.listen(config.port, "localhost", function () {
	var host = server.address().address
	var port = server.address().port
})

// for testing purposes
module.exports = {
	app,
	server,
}

app.get('/user-info', (req, res) => {

	if(!req.headers.authorization){
		return res.status(401).send("User not authorized");
	}

	const authToken = req.headers.authorization.slice("bearer ".length);
	
	let userInfo = null
	try{ 
		userInfo = jwt.verify(authToken, config.publicKey, {
			algorithms: ["RS256"],
		});
	}catch(e){
		return res.status(401).send("Verification failed");
	}
	if(!userInfo){
		return res.status(401).send("Verification failed");
	}

	const user = users[userInfo.userName];
	const scope = userInfo.scope.split(" ");
	const userWithRestrictedFields = {}
	for(let i = 0; i < scope.length; i++){
		const field = scope[i].slice("permission:".length);
		userWithRestrictedFields[field] = user[field];
		console.log(field)
	}

	res.json(userWithRestrictedFields); 	
})