import { relations } from "drizzle-orm/relations";
import { users, sessions, tweet, messages, userSettings, media, userFollows, accounts, hashtags, hashtagsToTweet, likes } from "./schema";

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	sessions: many(sessions),
	tweets: many(tweet),
	messages_senderId: many(messages, {
		relationName: "messages_senderId_users_id"
	}),
	messages_receiverId: many(messages, {
		relationName: "messages_receiverId_users_id"
	}),
	userSettings: many(userSettings),
	media: many(media),
	userFollows_a: many(userFollows, {
		relationName: "userFollows_a_users_id"
	}),
	userFollows_b: many(userFollows, {
		relationName: "userFollows_b_users_id"
	}),
	accounts: many(accounts),
	likes: many(likes),
}));

export const tweetRelations = relations(tweet, ({one, many}) => ({
	user: one(users, {
		fields: [tweet.userId],
		references: [users.id]
	}),
	tweet: one(tweet, {
		fields: [tweet.parentTweetId],
		references: [tweet.id],
		relationName: "tweet_parentTweetId_tweet_id"
	}),
	tweets: many(tweet, {
		relationName: "tweet_parentTweetId_tweet_id"
	}),
	media: many(media),
	hashtagsToTweets: many(hashtagsToTweet),
	likes: many(likes),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	user_senderId: one(users, {
		fields: [messages.senderId],
		references: [users.id],
		relationName: "messages_senderId_users_id"
	}),
	user_receiverId: one(users, {
		fields: [messages.receiverId],
		references: [users.id],
		relationName: "messages_receiverId_users_id"
	}),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id]
	}),
}));

export const mediaRelations = relations(media, ({one}) => ({
	user: one(users, {
		fields: [media.userId],
		references: [users.id]
	}),
	tweet: one(tweet, {
		fields: [media.tweetId],
		references: [tweet.id]
	}),
}));

export const userFollowsRelations = relations(userFollows, ({one}) => ({
	user_a: one(users, {
		fields: [userFollows.a],
		references: [users.id],
		relationName: "userFollows_a_users_id"
	}),
	user_b: one(users, {
		fields: [userFollows.b],
		references: [users.id],
		relationName: "userFollows_b_users_id"
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const hashtagsToTweetRelations = relations(hashtagsToTweet, ({one}) => ({
	hashtag: one(hashtags, {
		fields: [hashtagsToTweet.a],
		references: [hashtags.id]
	}),
	tweet: one(tweet, {
		fields: [hashtagsToTweet.b],
		references: [tweet.id]
	}),
}));

export const hashtagsRelations = relations(hashtags, ({many}) => ({
	hashtagsToTweets: many(hashtagsToTweet),
}));

export const likesRelations = relations(likes, ({one}) => ({
	user: one(users, {
		fields: [likes.userId],
		references: [users.id]
	}),
	tweet: one(tweet, {
		fields: [likes.tweetId],
		references: [tweet.id]
	}),
}));