let Discord,
    bot,
    mongoose,
    commands,
    logger,
    schemas

try {
    Discord = require("discord.js")

    commands = require("./src/bot/commandsystem/index")
    helpers = require("./src/bot/helpers")
    logger = console // require("./src/bot/logger")
} catch (e) {
    e.message = "Error loading modules: " + e.message + "! Did you run `npm i`?"
    throw e
}
bot = new Discord.Client()
bot.login(process.env.DISCORDTOKEN)

if (process.env.MONGOSERVER) {
    try {
        logger.log("Initializing MongoDB")
        mongoose = require("mongoose")
        mongoose.connect(process.env.MONGOSERVER)
        schemas = {
            Guild: require("./src/shared/schema/guild"),
            Infractions: require("./src/shared/schema/infractions"),
            Settings: require("./src/shared/schema/settings")
        }
    } catch (e) {
        e.message = "Error loading modules: " + e.message + "! Did you run `npm i`?"
        throw e
    }
} else {
    logger.log("Skipping initialization of MongoDB")
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
    helpers.modLog(`User ${user} (${user.username}#${user.discriminator}) joined the server`, null, user.guild, true)
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

bot.on("userUpdate", (olduser, newuser) => {
    if (olduser.nickname != newuser.nickname) {
        helpers.modLog(`${newuser}'s nickname was changed from ${olduser.nickname} to ${newuser.nickname}`, null, channel.guild, true)
    } else {
        console.log("NO")
    }
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
        bot, // If we don't have a wrapper for a particular function
        msg: message, // Message is taken because it's how I used to do it in d.io ;D
        // Most of these are just here for short-hand
        message: message.content, // Message content
        channel: message.channel, // Channel it runs in
        author: message.author // Author of message
    }
    helpers.modLog("deleted message:\n" + message.content, data)
})

bot.on("messageUpdate", (oldmessage, newmessage) => {
    if (newmessage.author == bot.user) return // Ignore our ping message
    let data = {
        bot, // If we don't have a wrapper for a particular functio
        msg: newmessage, // Message is taken because it's how I used to do it in d.io ;D
        // Most of these are just here for short-hand
        message: newmessage.content, // Message content
        channel: newmessage.channel, // Channel it runs in
        author: newmessage.author // Author of message
    }
    if (oldmessage.content != newmessage.content) {
        helpers.modLog(`edited message:\n ${oldmessage.content}\n\n to ${newmessage.content}\n\n in ${newmessage.channel} (${newmessage.channel.name})`, data)
    }
})

// create an event listener for messages
bot.on("message", message => {
    let begin = new Date().getTime()
    logger.log(`[${message.author.username}]: ${message.content}`)
    if (message.author.id == bot.user.id) return // Skip messages from ourself
    commands.find(message, commands, function (command, index) {
        if (!command) return

        logger.log("Executing command " + command.trigger[0] + "…")

        let args = message.content.split(" ")
        args.splice(index, 1)

        if (!command.disableTyping && command) message.channel.startTyping(10 * 1000) // Command execution shouldn't take longer than 10 seconds
        schemas.Guild.findOne({ guildID: message.guild.id }, (err, guilddb) => {
            if (err || !guilddb) {
                console.log("EE", err)
                guilddb = new schemas.Guild({
                    guildID: message.guild.id,
                    settings: [],
                    infractions: []
                })
                guilddb.save().then(function() {
                    console.log("save")
                }, function(e) {
                    console.log("ERRSAVEHERE", e)
                })
            }
            let data = {
                bot, // If we don't have a wrapper for a particular function
                commands, // For calling commands internally
                schemas, // Database access
                msg: message, // Message is taken because it's how I used to do it in d.io ;D
                db: {
                    guild: guilddb
                },
                // Most of these are just here for short-hand
                message: message.content, // Message content
                channel: message.channel, // Channel it runs in
                author: message.author, // Author of message
                args: args, // Parts of message without trigger
                helpers: helpers,
                embed: e => { return message.channel.sendEmbed(e) }, // Short-hannd for sending embeds
                say: m => { return message.channel.sendMessage(m) } // Short-hand for sending messages
            }

            commands.call(command, data, function () {
                message.channel.stopTyping(true) // We're no longer "typing" when the command finishes executing
                logger.log("Executed command " + command.trigger[0] + " in " + String(new Date().getTime() - begin) + "ms!")
            })
        })
    })
})
