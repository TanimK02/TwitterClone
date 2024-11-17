import { pgTable, uniqueIndex, serial, varchar, foreignKey, text, boolean, timestamp, index, unique, integer, primaryKey, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const tweetType = pgEnum("TweetType", ["DEFAULT", "REPLY", "RETWEET", "QUOTE"]);

export const hashtags = pgTable("Hashtags", {
    id: serial().primaryKey().notNull(),
    tag: varchar({ length: 100 }).notNull(),
},
    (table) => {
        return {
            tagKey: uniqueIndex("Hashtags_tag_key").using("btree", table.tag.asc().nullsLast()),
        };
    });

export const media = pgTable("media", {
    id: text().primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
    url: text().notNull(),
    userId: text(),
    tweetId: text(),
    type: text().notNull(),
    profilePicture: boolean().default(false).notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
    (table) => {
        return {
            mediaUserIdFkey: foreignKey({
                columns: [table.userId],
                foreignColumns: [users.id],
                name: "media_userId_fkey",
            }).onUpdate("cascade").onDelete("set null"),
            mediaTweetIdFkey: foreignKey({
                columns: [table.tweetId],
                foreignColumns: [tweet.id],
                name: "media_tweetId_fkey",
            }).onUpdate("cascade").onDelete("set null"),
        };
    });

export const messages = pgTable("Messages", {
    id: text().primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
    senderId: text().notNull(),
    receiverId: text().notNull(),
    content: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
    (table) => {
        return {
            messagesSenderIdFkey: foreignKey({
                columns: [table.senderId],
                foreignColumns: [users.id],
                name: "Messages_senderId_fkey",
            }).onUpdate("cascade").onDelete("restrict"),
            messagesReceiverIdFkey: foreignKey({
                columns: [table.receiverId],
                foreignColumns: [users.id],
                name: "Messages_receiverId_fkey",
            }).onUpdate("cascade").onDelete("restrict"),
        };
    });

export const sessions = pgTable("sessions", {
    sessionToken: text("session_token").primaryKey().notNull(),
    userId: text("user_id").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(), // Use `timestamp` with `date` mode for compatibility
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
                name: "_UserFollows_A_fkey",
            }).onUpdate("cascade").onDelete("cascade"),
            userFollowsBFkey: foreignKey({
                columns: [table.b],
                foreignColumns: [users.id],
                name: "_UserFollows_B_fkey",
            }).onUpdate("cascade").onDelete("cascade"),
        };
    });

export const userSettings = pgTable("UserSettings", {
    id: text().primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
    userId: text().notNull(),
},
    (table) => {
        return {
            userIdKey: uniqueIndex("UserSettings_userId_key").using("btree", table.userId.asc().nullsLast()),
            userSettingsUserIdFkey: foreignKey({
                columns: [table.userId],
                foreignColumns: [users.id],
                name: "UserSettings_userId_fkey",
            }).onUpdate("cascade").onDelete("restrict"),
        };
    });

export const tweet = pgTable("Tweet", {
    id: text().primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
    userId: text("user_id").notNull(),
    content: text().notNull(),
    parentTweetId: text("parent_tweet_id"),
    createdAt: timestamp({ precision: 3, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    tweetType: tweetType("tweet_type").default("DEFAULT").notNull(),
    profilePicture: boolean("profile_picture").default(false).notNull(),
},
    (table) => {
        return {
            tweetUserIdFkey: foreignKey({
                columns: [table.userId],
                foreignColumns: [users.id],
                name: "Tweet_user_id_fkey",
            }).onUpdate("cascade").onDelete("restrict"),
            tweetParentTweetIdFkey: foreignKey({
                columns: [table.parentTweetId],
                foreignColumns: [table.id],
                name: "Tweet_parent_tweet_id_fkey",
            }).onUpdate("cascade").onDelete("set null"),
        };
    });

export const users = pgTable("users", {
    id: text().primaryKey().$defaultFn(() => crypto.randomUUID()).notNull(),
    name: text(),
    email: text(),
    emailVerified: timestamp("email_verified", { mode: "date" }), // Change to Date type
    image: text(),
    username: text(),
    passwordHash: text("password_hash"),
    displayName: text(),
    bio: text(),
    coverImageUrl: text("cover_image_url"),
    createdAt: timestamp("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
    (table) => ({
        emailUnique: primaryKey(table.email), // Example for email uniqueness constraint
    })
);

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
                name: "_HashtagsToTweet_A_fkey",
            }).onUpdate("cascade").onDelete("cascade"),
            hashtagsToTweetBFkey: foreignKey({
                columns: [table.b],
                foreignColumns: [tweet.id],
                name: "_HashtagsToTweet_B_fkey",
            }).onUpdate("cascade").onDelete("cascade"),
        };
    });

export const likes = pgTable("Likes", {
    userId: text("user_id").notNull(),
    tweetId: text("tweet_id").notNull(),
    likedAt: timestamp("liked_at", { precision: 3, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
    (table) => {
        return {
            likesUserIdFkey: foreignKey({
                columns: [table.userId],
                foreignColumns: [users.id],
                name: "Likes_user_id_fkey",
            }).onUpdate("cascade").onDelete("restrict"),
            likesTweetIdFkey: foreignKey({
                columns: [table.tweetId],
                foreignColumns: [tweet.id],
                name: "Likes_tweet_id_fkey",
            }).onUpdate("cascade").onDelete("restrict"),
            likesPkey: primaryKey({ columns: [table.userId, table.tweetId], name: "Likes_pkey" }),
        };
    });

export const verificationTokens = pgTable("verification_tokens", {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(), // Use `timestamp` with `date` mode for compatibility
},
    (table) => ({
        compositePk: primaryKey(table.identifier, table.token), // Composite primary key
    })
);


export const authenticators = pgTable("authenticators", {
    credentialId: text("credential_id").notNull(),
    userId: text("user_id").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer().notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text(),
},
    (table) => {
        return {
            authenticatorsUserIdUsersIdFk: foreignKey({
                columns: [table.userId],
                foreignColumns: [users.id],
                name: "authenticators_user_id_users_id_fk",
            }).onDelete("cascade"),
            authenticatorsUserIdCredentialIdPk: primaryKey({
                columns: [table.credentialId, table.userId],
                name: "authenticators_user_id_credential_id_pk",
            }),
            authenticatorsCredentialIdUnique: unique("authenticators_credential_id_unique").on(table.credentialId),
        };
    });
export const accounts = pgTable("account", {
    userId: text("user_id").notNull(), // Required
    type: text("type").notNull(), // Required
    provider: text("provider").notNull(), // Required
    providerAccountId: text("provider_account_id").notNull(), // Required
    refresh_token: text("refresh_token"), // Optional
    access_token: text("access_token"), // Optional
    expires_at: integer("expires_at"), // Optional but matches DefaultPostgresAccountsTable
    token_type: text("token_type"), // Optional
    scope: text(), // Optional
    id_token: text("id_token"), // Optional
    session_state: text("session_state"), // Optional and snake_case
},
    (table) => ({
        accountProviderProviderAccountIdPk: primaryKey(table.provider, table.providerAccountId), // Composite key
    })
);
