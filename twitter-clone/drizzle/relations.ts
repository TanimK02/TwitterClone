import { relations } from "drizzle-orm/relations";
import { users, retweets, tweet, hashtags, hashtagsToTweet, media, messages, userFollows, userSettings, likes, authenticators } from "./schema";

export const retweetsRelations = relations(retweets, ({one}) => ({
	user: one(users, {
		fields: [retweets.userId],
		references: [users.id]
	}),
	tweet: one(tweet, {
		fields: [retweets.parentTweetId],
		references: [tweet.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	retweets: many(retweets),
	tweets: many(tweet),
	media: many(media),
	messages_senderId: many(messages, {
		relationName: "messages_senderId_users_id"
	}),
	messages_receiverId: many(messages, {
		relationName: "messages_receiverId_users_id"
	}),
	userFollows_a: many(userFollows, {
		relationName: "userFollows_a_users_id"
	}),
	userFollows_b: many(userFollows, {
		relationName: "userFollows_b_users_id"
	}),
	userSettings: many(userSettings),
	likes: many(likes),
	authenticators: many(authenticators),
}));

export const tweetRelations = relations(tweet, ({one, many}) => ({
	retweets: many(retweets),
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
	hashtagsToTweets: many(hashtagsToTweet),
	media: many(media),
	likes: many(likes),
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

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id]
	}),
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

export const authenticatorsRelations = relations(authenticators, ({one}) => ({
	user: one(users, {
		fields: [authenticators.userId],
		references: [users.id]
	}),
}));