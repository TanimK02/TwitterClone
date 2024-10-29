import {
    boolean,
    pgTable, uniqueIndex, foreignKey, text, timestamp, serial, index, varchar, integer, primaryKey, pgEnum
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm/relations";
import type { AdapterAccountType } from "next-auth/adapters"
import { sql } from "drizzle-orm"

const tweetType = pgEnum("TweetType", ['DEFAULT', 'REPLY', 'RETWEET', 'QUOTE'])





export const sessions = pgTable("sessions", {
    id: text().$defaultFn(() => crypto.randomUUID()),  // Primary key with UUID
    sessionToken: text("session_token").notNull().unique().primaryKey(),  // Unique session token
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),      // Foreign key to users table
    expires: timestamp("expires", { mode: "date" }).notNull(),     // Expiration timestamp
});


export const tweet = pgTable("Tweet", {
    id: text().primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
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

export const authenticators = pgTable(
    "authenticators",
    {
        credentialID: text("credential_id").notNull().unique(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        providerAccountId: text("provider_account_id").notNull(),
        credentialPublicKey: text("credential_public_key").notNull(),
        counter: integer("counter").notNull(),
        credentialDeviceType: text("credential_device_type").notNull(),
        credentialBackedUp: boolean("credential_backed_up").notNull(),
        transports: text("transports"),
    },
    (table) => ({
        compositePK: primaryKey({
            columns: [table.userId, table.credentialID],
        }),
    })
);

export const verificationTokens = pgTable(
    "verification_tokens",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (table) => ({
        compositePk: primaryKey({
            columns: [table.identifier, table.token],
        }),
    })
);

export const messages = pgTable("Messages", {
    id: text().primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
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
    id: text().primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
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
    id: text().primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
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
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    image: text("image"),
    username: varchar("username", { length: 50 }).unique(),
    passwordHash: text("password_hash"),
    displayName: varchar("display_name", { length: 100 }),
    bio: text("bio"),
    coverImageUrl: text("cover_image_url"),
    createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
    (table) => {
        return {
            emailKey: uniqueIndex("users_email_key").using("btree", table.email.asc().nullsLast()),
            usernameKey: uniqueIndex("users_username_key").using("btree", table.username.asc().nullsLast()),
        };
    }
);

export const accounts = pgTable(
    "account",
    {
        id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
)


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
            likesPkey: primaryKey({ columns: [table.userId, table.tweetId], name: "Likes_pkey" }),
        }
    });



export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id]
    }),
}));

export const usersRelations = relations(users, ({ many }) => ({
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

export const tweetRelations = relations(tweet, ({ one, many }) => ({
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

export const messagesRelations = relations(messages, ({ one }) => ({
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

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
    user: one(users, {
        fields: [userSettings.userId],
        references: [users.id]
    }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
    user: one(users, {
        fields: [media.userId],
        references: [users.id]
    }),
    tweet: one(tweet, {
        fields: [media.tweetId],
        references: [tweet.id]
    }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
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

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id]
    }),
}));

export const hashtagsToTweetRelations = relations(hashtagsToTweet, ({ one }) => ({
    hashtag: one(hashtags, {
        fields: [hashtagsToTweet.a],
        references: [hashtags.id]
    }),
    tweet: one(tweet, {
        fields: [hashtagsToTweet.b],
        references: [tweet.id]
    }),
}));

export const hashtagsRelations = relations(hashtags, ({ many }) => ({
    hashtagsToTweets: many(hashtagsToTweet),
}));

export const likesRelations = relations(likes, ({ one }) => ({
    user: one(users, {
        fields: [likes.userId],
        references: [users.id]
    }),
    tweet: one(tweet, {
        fields: [likes.tweetId],
        references: [tweet.id]
    }),
}));