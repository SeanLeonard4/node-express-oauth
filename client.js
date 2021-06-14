const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios").default
const { randomString, timeout } = require("./utils")
const url = require("url")
const { get } = require("http")
const config = {
	port: 9000,

	clientId: "my-client",
	clientSecret: "zETqHgl0d7ThysUqPnaFuLOmG1E=",
	redirectUri: "http://localhost:9000/callback",

	authorizationEndpoint: "http://localhost:9001/authorize",
	tokenEndpoint: "http://localhost:9001/token",
	userInfoEndpoint: "http://localhost:9002/user-info",
}
let state = ""

const app = express()
app.set("view engine", "ejs")
app.set("views", "assets/client")
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
	getState() {
		return state
	},
	setState(s) {
		state = s
	},
}

app.get('/authorize', (req, res) => {
	state = randomString();

	const redirectUrl = url.parse(config.authorizationEndpoint);
	redirectUrl.query = {
		response_type: "code",
		client_id: config.clientId,
		redirect_uri: config.redirectUri,
		scope: "permission:name permission:date_of_birth",
		state: state,
	}

	res.redirect(url.format(redirectUrl));


})

app.get('/callback', (req, res) => {
	if(req.query.state !== state){
		res.status(403).send("Error: incorrect status");
		return
	}
	const {code} = req.query;

	axios.post({
		url: config.tokenEndpoint,
		auth: {
			username: config.clientId,
			password: config.clientSecret
		},
		data: {code},
		validateStatus: null,
	})
		.then((res)  => {
			axios.get({
				url: config.userInfoEndpoint,
				headers: {
					authorization: "bearer " + res.data.access_token,
				},
			})
		})
		.then((res) => {
			const data = res.data;
			res.render("welcome", { user: data })
		})
		.catch((err) => {
			console.error(err)
			res.status(500).send("Error: something went wrong")
		})
})