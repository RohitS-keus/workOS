"use strict";

const ApiGateway = require("moleculer-web");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
	name: "api",

	mixins: [ApiGateway],
	settings: {
		port: process.env.PORT || 4000,
		cors: {
			origin: "*",
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			exposedHeaders: [],
			credentials: false,
			maxAge: 3600
		},
		routes: [
			{
				path: "/api",
				aliases: {
					"POST /auth/login": "auth.login",
					"POST /auth/validate-token": "auth.validateToken",
					"POST /auth/get-authorization-url": "auth.getAuthorizationUrl",
					"POST /auth/authenticate-with-code": "auth.authenticateWithCode",
					"POST /user/create": "users.createUser",
					"GET /user/list": "users.listUsers",
					"GET /user/info": "users.getUserInfo",
					"PUT /user/update": "users.updateUserInfo",
					"DELETE /user/delete": "users.deleteUser",
					"POST /auth/emailVerify" : "auth.emailVerify"
				},
				// onBeforeCall(ctx, route, req) {
				// 	if (req.headers["authorization"]) {
				// 		try {
				// 			const decoded = jwt.verify(req.headers["authorization"].split(" ")[1], process.env.JWT_SECRET_KEY);
				// 			ctx.meta.user = decoded;
				// 		} catch (err) {
				// 			throw new Error("Unauthorized");
				// 		}
				// 	} else if (!["/auth/login", "/auth/get-authorization-url", "/auth/authenticate-with-code"].includes(req.url)) {
				// 		throw new Error("Unauthorized");
				// 	}
				// },
			},
			{
				path: "/redirect",
				aliases: {
					"GET /": "auth.handleRedirect",
				},
			},
		],
	},
};
  