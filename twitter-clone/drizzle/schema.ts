import { pgTable, uniqueIndex, foreignKey, text, timestamp, serial, index, varchar, integer, primaryKey, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const tweetType = pgEnum("TweetType", ['DEFAULT', 'REPLY', 'RETWEET', 'QUOTE'])



export const sessions = pgTable("sessions", {
	id: text().primaryKey().notNull(),
	sessionToken: text("session_token").notNull(),
	userId: text("user_id").notNull(),
	expires: timestamp({ precision: 3, mode: 'string' }).notNull(),
},
(table) => {
	return {
		sessionTokenKey: uniqueIndex("sessions_session_token_key").using("btree", table.sessionToken.asc().nullsLast()),
		sessionsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const tweet = pgTable("Tweet", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	content: text().notNull(),
	parentTweetId: text("parent_tweet_id"),
	tweetType: tweetType("tweet_type").default('DEFAULT').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		tweetUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "Tweet_user_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		tweetParentTweetIdFkey: foreignKey({
			columns: [table.parentTweetId],
			foreignColumns: [table.id],
			name: "Tweet_parent_tweet_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});

export const verificationTokens = pgTable("verification_tokens", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ precision: 3, mode: 'string' }).notNull(),
},
(table) => {
	return {
		identifierTokenKey: uniqueIndex("verification_tokens_identifier_token_key").using("btree", table.identifier.asc().nullsLast(), table.token.asc().nullsLast()),
	}
});

export const messages = pgTable("Messages", {
	id: serial().primaryKey().notNull(),
	senderId: text().notNull(),
	receiverId: text().notNull(),
	content: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		messagesSenderIdFkey: foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "Messages_senderId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		messagesReceiverIdFkey: foreignKey({
			columns: [table.receiverId],
			foreignColumns: [users.id],
			name: "Messages_receiverId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const userSettings = pgTable("UserSettings", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
},
(table) => {
	return {
		userIdKey: uniqueIndex("UserSettings_userId_key").using("btree", table.userId.asc().nullsLast()),
		userSettingsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "UserSettings_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const media = pgTable("media", {
	id: text().primaryKey().notNull(),
	url: text().notNull(),
	userId: text(),
	tweetId: text(),
	type: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		mediaUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "media_userId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		mediaTweetIdFkey: foreignKey({
			columns: [table.tweetId],
			foreignColumns: [tweet.id],
			name: "media_tweetId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});

export const userFollows = pgTable("_UserFollows", {
	a: text("A").notNull(),
	b: text("B").notNull(),
},
(table) => {
	return {
		abUnique: uniqueIndex("_UserFollows_AB_unique").using("btree", table.a.asc().nullsLast(), table.b.asc().nullsLast()),
		bIdx: index().using("btree", table.b.asc().nullsLast()),
		userFollowsAFkey: foreignKey({
			columns: [table.a],
			foreignColumns: [users.id],
			name: "_UserFollows_A_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		userFollowsBFkey: foreignKey({
			columns: [table.b],
			foreignColumns: [users.id],
			name: "_UserFollows_B_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const hashtags = pgTable("Hashtags", {
	id: serial().primaryKey().notNull(),
	tag: varchar({ length: 100 }).notNull(),
},
(table) => {
	return {
		tagKey: uniqueIndex("Hashtags_tag_key").using("btree", table.tag.asc().nullsLast()),
	}
});

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text(),
	emailVerified: timestamp("email_verified", { precision: 3, mode: 'string' }),
	image: text(),
	username: varchar({ length: 50 }),
	passwordHash: text("password_hash"),
	displayName: varchar("display_name", { length: 100 }),
	bio: text(),
	coverImageUrl: text("cover_image_url"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }),
},
(table) => {
	return {
		emailKey: uniqueIndex("users_email_key").using("btree", table.email.asc().nullsLast()),
		usernameKey: uniqueIndex("users_username_key").using("btree", table.username.asc().nullsLast()),
	}
});

export const accounts = pgTable("accounts", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text("provider_account_id").notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
},
(table) => {
	return {
		providerProviderAccountIdKey: uniqueIndex("accounts_provider_provider_account_id_key").using("btree", table.provider.asc().nullsLast(), table.providerAccountId.asc().nullsLast()),
		accountsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const hashtagsToTweet = pgTable("_HashtagsToTweet", {
	a: integer("A").notNull(),
	b: text("B").notNull(),
},
(table) => {
	return {
		abUnique: uniqueIndex("_HashtagsToTweet_AB_unique").using("btree", table.a.asc().nullsLast(), table.b.asc().nullsLast()),
		bIdx: index().using("btree", table.b.asc().nullsLast()),
		hashtagsToTweetAFkey: foreignKey({
			columns: [table.a],
			foreignColumns: [hashtags.id],
			name: "_HashtagsToTweet_A_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		hashtagsToTweetBFkey: foreignKey({
			columns: [table.b],
			foreignColumns: [tweet.id],
			name: "_HashtagsToTweet_B_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const likes = pgTable("Likes", {
	userId: text("user_id").notNull(),
	tweetId: text("tweet_id").notNull(),
	likedAt: timestamp("liked_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		likesUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "Likes_user_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		likesTweetIdFkey: foreignKey({
			columns: [table.tweetId],
			foreignColumns: [tweet.id],
			name: "Likes_tweet_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		likesPkey: primaryKey({ columns: [table.userId, table.tweetId], name: "Likes_pkey"}),
	}
});
