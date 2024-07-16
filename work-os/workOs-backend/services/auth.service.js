"use strict";
const { WorkOS  } = require("@workos-inc/node");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const JWT_SECRET_KEY= process.env.JWT_SECRET_KEY;
module.exports = {
	name: "auth",
	actions: {
		async login(ctx) {
			const { email, password, clientId } = ctx.params;
			try {
				const { user ,authenticationMethod} = await workos.userManagement.authenticateWithPassword({ email, password, clientId });
				const token = jwt.sign({ userId: user.id }, JWT_SECRET_KEY, { expiresIn: "1h" });
				return { token, user, authenticationMethod };
			} catch (error) {
				this.logger.error(error);
				throw new Error("Invalid email or password");
			}
		},
		async validateToken(ctx) {
			const { token } = ctx.params;
			try {
				const decoded = jwt.verify(token, JWT_SECRET_KEY);
				return { valid: true, decoded };
			} catch (error) {
				this.logger.error(error);
				return { valid: false, error: "Invalid token" };
			}
		},
		async getAuthorizationUrl(ctx) {
			const { clientId, redirectUri, provider } = ctx.params;
			try {
				const authorizationUrl = await workos.userManagement.getAuthorizationUrl({ clientId, redirectUri, provider });
				return { authorizationUrl };
			} catch (error) {
				this.logger.error(error);
				throw new Error("Error getting authorization URL");
			}
		},
		async authenticateWithCode(ctx) {
			const { code, clientId } = ctx.params;
			try {
				const { user, accessToken, refreshToken } = await workos.userManagement.authenticateWithCode({ clientId, code });
				const token = jwt.sign({ userId: user.id }, JWT_SECRET_KEY, { expiresIn: "1h" });
				return { token, user, accessToken, refreshToken };
			} catch (error) {
				this.logger.error(error);
				throw new Error("Error authenticating with code");
			}
		},
		async handleRedirect(ctx) {
			const { code } = ctx.params;
			try {
				const { user } = await workos.userManagement.authenticateWithCode({ clientId: process.env.CLIENT_ID, code });
				const token = jwt.sign({ userId: user.id }, JWT_SECRET_KEY, { expiresIn: "1h" });
				ctx.meta.$response.headers["Location"] = `/dashboard?token=${token}`;
				ctx.meta.$response.statusCode = 302;
			} catch (error) {
				this.logger.error(error);
				ctx.meta.$response.headers["Location"] = "/login?error=Authentication%20failed";
				ctx.meta.$response.statusCode = 302;
			}
		},

		async emailVerify(ctx){
			const {code} = ctx.params;
			try {
				const { user } = await workos.userManagement.authenticateWithEmailVerification({
					clientId: process.env.CLIENT_ID,
					code,
					pendingAuthenticationToken : "Q2BpQ0vpO9PjJswoNeEmLfdo4",
				});

				return user;
			} catch (error) {
				this.logger.error(error);
			}
		}
	},
};

