let bot,
    commands,
    config,
    Discord,
    DiscordToken,
    logger,
    MongoURL,
    mongoose,
    schemas

try {
    Discord = require("discord.js")

    commands = require("./src/bot/commandsystem/index")
    helpers = require("./src/bot/helpers")
    let {env} = process
    if (env.DISCORDTOKEN) {
        DiscordToken = env.DISCORDTOKEN
    } else {
        DiscordToken = require("./config").tokens.discord
    }
    if (env.MONGOSERVER) {
        MongoURL = env.MONGOSERVER
    } else {
        MongoURL = require("./config").tokens.mongodb
    }
    logger = console // require("./src/bot/logger")
} catch (e) {
    e.message = "Error loading modules: " + e.message + "! Did you run `npm i`?"
    throw e
}

bot = new Discord.Client()
bot.login(DiscordToken).catch(err => {
    err.message = "Error logging into Discord: " + err.message + " are you sure your token in config.js is valid?"
    throw err
})

try {
    logger.log("Initializing MongoDB")
    mongoose = require("mongoose")
    mongoose.connect(MongoURL)
    schemas = {
        Guild: require("./src/shared/schema/guild"),
        Infractions: require("./src/shared/schema/infractions"),
        Settings: require("./src/shared/schema/settings")
    }
} catch (e) {
    e.message = "Error initializing MongoDB: " + e.message + "! Did you update your submodules?"
    throw e
}

let initial = new Date().getTime()

commands.reloadCommands(function (cmd, done) {
    logger.log("CALL")
    logger.log("Loaded " + cmd.name + " in " + String(new Date().getTime() - cmd.time) + "ms")
    if (done) {
        logger.log("Loaded " + done.length + " files in " + String(new Date().getTime() - initial) + "ms")
    }
})

bot.on("ready", () => {
    logger.log(bot.user.username + " connected to Discord ID: " + bot.user.id)
})

bot.on("guildMemberAdd", user => {
    helpers.modLog(`User ${user} (${user.user.username}#${user.user.discriminator}) joined the server`, null, user.guild, true)
})

bot.on("guildMemberRemove", user => {
    helpers.modLog(`User ${user} (${user.username}#${user.discriminator}) left the server`, null, user.guild, true)
})

bot.on("roleCreate", role => {
    helpers.modLog(`New role ${role} (${role.name}) created`, null, role.guild, true)
})

bot.on("roleDelete", role => {
    helpers.modLog(`Role ${role.name} deleted`, null, role.guild, true)
})

bot.on("channelCreate", channel => {
    helpers.modLog(`Channel ${channel} (${channel.name}) created`, null, channel.guild, true)
})

bot.on("debug", m => {
    logger.log("[DEBUG] " + m)
})
bot.on("error", m => {
    logger.log("[ERROR] " + m)
})
bot.on("warn", m => {
    logger.log("[WARN] " + m)
})

bot.on("guildMemberUpdate", (olduser, newuser) => {
    if (olduser.nickname != newuser.nickname) {
        helpers.modLog(`${newuser}'s nickname was changed from ${olduser.nickname || olduser.username} to ${newuser.nickname || newuser.username}`, null, newuser.guild, true)
    }
})

bot.on("guildCreate", guild => {
    logger.log("[INFO] Added to guild: " + guild.name + " ID: " + guild.id + " with " + guild.members.size + " users!")
    guild.channels.first().sendMessage("Hello! I'm " + bot.user.username + "! I'm a simple moderation bot that does what *YOU* want! The server owner can configure me at this servers personal link: https://steamb0at.party/" + guild.id + "/admin\nThe server owner can also choose to add trusted users and/or roles to be allowed to edit me as well!\nThanks for joining our little family! - The Steamboat devs")
})

bot.on("guildDelete", guild => {
    logger.log("[INFO] Removed from guild: " + guild.name + " ID: " + guild.id + " with " + guild.members.size + " users!")
})

bot.on("channelDelete", channel => {
    helpers.modLog(`Channel ${channel.name} deleted`, null, channel.guild, true)
})

bot.on("channelUpdate", (oldchannel, newchannel) => {
    if (oldchannel.name != newchannel.name) {
        helpers.modLog(`Channel ${oldchannel} was renamed from ${oldchannel.name}) to ${newchannel.name}`, null, channel.guild, true)
    } else if (oldchannel.topic != newchannel.topic) {
        helpers.modLog(`Channel ${newchannel}'s topic was changed from ${oldchannel.topic}) to ${newchannel.topic}`, null, channel.guild, true)
    }
})

bot.on("messageDelete", message => {
    let data = {
        bot, // if we don't have a wrapper for a particular function
        msg: message, // message is taken because it's how I used to do it in d.io ;D
        // most of these are just here for short-hand
        message: message.content, // message content
        channel: message.channel, // channel it runs in
        author: message.author // author of message
    }
    helpers.modLog("deleted message:\n" + message.content, data)
})

bot.on("messageUpdate", (oldmessage, newmessage) => {
    if (newmessage.author == bot.user) return // ignore our ping message
    let data = {
        bot, // if we don't have a wrapper for a particular functio
        msg: newmessage, // message is taken because it's how I used to do it in d.io ;D
        // most of these are just here for short-hand
        message: newmessage.content, // message content
        channel: newmessage.channel, // channel it runs in
        author: newmessage.author // author of message
    }
    if (oldmessage.content != newmessage.content) {
        helpers.modLog(`edited message:\n ${oldmessage.content}\n\n to ${newmessage.content}\n\n in ${newmessage.channel} (${newmessage.channel.name})`, data)
    }
})

// create an event listener for messages
bot.on("message", message => {
    let begin = new Date().getTime()
    logger.log(`[${message.author.username}]: ${message.content}`)
    if (message.author.id == bot.user.id) return // skip messages from ourself
    commands.find(message, commands, function (command, index) {
        if (!command) return

        logger.log("Executing command " + command.trigger[0] + "…")

        let args = message.content.split(" ")
        args.splice(index, 1)

        if (!command.disableTyping && command) message.channel.startTyping(10 * 1000) // command execution shouldn't take longer than 10 seconds
        schemas.Guild.findOne({guildID: message.guild.id}, (err, guilddb) => {
            if (err || !guilddb) {
                logger.log("EE", err)
                guilddb = new schemas.Guild({
                    guildID: message.guild.id,
                    settings: [],
                    infractions: []
                })
                guilddb.save().then(function () {
                    logger.log("save")
                }, function (e) {
                    logger.log("ERRSAVEHERE", e)
                })
            }
            let data = {
                bot, // if we don't have a wrapper for a particular function
                commands, // for calling commands internally
                schemas, // database access
                msg: message, // message is taken because it's how I used to do it in d.io ;D
                db: {
                    guild: guilddb
                },
                // most of these are just here for short-hand
                message: message.content, // message content
                channel: message.channel, // channel it runs in
                author: message.author, // author of message
                args, // parts of message without trigger
                helpers,
                embed: e => message.channel.sendEmbed(e), // short-hannd for sending embeds
                say: m => message.channel.sendMessage(m) // short-hand for sending messages
            }

            commands.call(command, data, function () {
                message.channel.stopTyping(true) // we're no longer "typing" when the command finishes executing
                logger.log("Executed command " + command.trigger[0] + " in " + String(new Date().getTime() - begin) + "ms!")
            })
        })
    })
})