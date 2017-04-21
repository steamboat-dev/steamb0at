let logger = console

module.exports = function (message, commands, done) {
    let parts = message.content.split(" ")
    let prefixes = ["$teamboat:", "$"]
    for (let pref in prefixes) {
        for (let itm in commands.commands) {
            if (typeof commands.commands[itm].trigger != "object") commands.commands[itm].trigger = [commands.commands[itm].trigger]
            for (let trig in commands.commands[itm].trigger) {
                let trigger = commands.commands[itm].trigger[trig]
                if (parts[0] == prefixes[pref] + trigger) {
                    logger.log("Found command: " + trigger + "!")
                    return done(commands.commands[itm], 0)
                }
            }
        }
    }
}