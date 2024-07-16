"use strict";
const DbService = require("moleculer-db");
const bcrypt = require("bcrypt");
const { WorkOS } = require("@workos-inc/node");
require("dotenv").config();

const workos = new WorkOS(process.env.WORKOS_API_KEY);
module.exports = {
	name: "users",
	mixins: [DbService],
	actions: {
		async createUser(ctx) {
			const { email, password, firstName, lastName } = ctx.params;
			if (!email || typeof email !== "string") {
				throw new Error("Email is required and must be a string.");
			}
			// const hashedPassword = await bcrypt.hash(password, 10);
			try {
				const workosUser = await workos.userManagement.createUser({ email, password, firstName, lastName });
				const user = await this.adapter.insert({ email, password: password, firstName, lastName, userId: workosUser.id });
				return user;
			} catch (error) {
				this.logger.error(error);
				throw new Error("Error creating user");
			}
		},
		async listUsers() {
			try {
				const workosUsers = await workos.userManagement.listUsers();
				return workosUsers;
			} catch (error) {
				this.logger.error(error);
				throw new Error("Error listing users");
			}
		},
		async getUserInfo(ctx) {
			const { userId } = ctx.params;
			try {
				const workosUser = await workos.userManagement.getUser(userId);
				return workosUser;
			} catch (error) {
				this.logger.error(error);
				throw new Error("Error fetching user info");
			}
		},
		async updateUserInfo(ctx) {
			const { userId, ...updateData } = ctx.params;
			try {
				const workosUser = await workos.userManagement.updateUser({ userId, ...updateData });
				return workosUser;
			} catch (error) {
				this.logger.error(error);
				throw new Error("Error updating user info");
			}
		},
		async deleteUser(ctx) {
			const { userId } = ctx.params;
			try {
				await workos.userManagement.deleteUser(userId);
				await this.adapter.removeById(userId);
				return { success: true };
			} catch (error) {
				this.logger.error(error);
				throw new Error("Error deleting user");
			}
		},
	},
};
