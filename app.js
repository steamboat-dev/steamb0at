let Discord,
    bot,
    mongoose,
    commands,
    logger,
    schemas

try {
    Discord = require("discord.js")

    commands = require("./src/bot/commandsystem/index")
    logger = console // require("./src/bot/logger")
} catch (e) {
    e.message = "Error loading modules: " + e.message + "! Did you run `npm i`?"
    throw e
}
bot = new Discord.Client()
bot.login(process.env.DISCORDTOKEN)

if (process.env.MONGOSERVER) {
    try {
        mongoose = require("mongoose")
        mongoose.connect(process.env.DISCORDTOKEN)
        schemas = require("./src/schemas")
    } catch (e) {
        e.message = "Error loading modules: " + e.message + "! Did you run `npm i`?"
        throw e
    }
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

// create an event listener for messages
bot.on("message", message => {
    let begin = new Date().getTime()
    logger.log(`[${message.author.username}]: ${message.content}`)
    if(message.author.id == bot.user.id) return // Skip messages from ourself
    commands.find(message, commands, function(command, index) {
        if(!command) return

        logger.log("Executing command " + command.trigger[0] + "…")

        let args = message.content.split(" ")
        args.splice(index, 1)

        if(!command.disableTyping && command) message.channel.startTyping(10 * 1000) // Command execution shouldn't take longer than 10 seconds

        let data = {
            bot, // If we don't have a wrapper for a particular function
            commands, // For calling commands internally
            schemas, // Database access
            msg: message, // Message is taken because it's how I used to do it in d.io ;D
            // Most of these are just here for short-hand
            message: message.content, // Message content
            channel: message.channel, // Channel it runs in
            author: message.author, // Author of message
            args: args, // Parts of message without trigger
            embed: e => {return message.channel.sendEmbed(e)}, // Short-hannd for sending embeds
            say: m => {return message.channel.sendMessage(m)} // Short-hand for sending messages
        }

        commands.call(command, data, function() {
            message.channel.stopTyping(true) // We're no longer "typing" when the command finishes executing
            logger.log("Executed command " + command.trigger[0] + " in " + String(new Date().getTime() - begin) + "ms!")
        })
    })
})
