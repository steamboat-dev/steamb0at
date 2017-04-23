let caller = require("./command-caller")

module.exports = {
    commands: [],
    find: require("./command-search"),
    call: caller.callCommand,
    checkPermissions: caller.checkPermissions,
    reloadCommands: reload
}

function reload(callback) {
    require("fs").readdir("./src/bot/commands", function(err, files) {
        if(err) throw new Error("Error reading commands folder: " + err)
        for(let f in files) {
            let start = new Date().getTime()
            let mod = require("../commands/" + files[f].replace(/\.js/gi, ""))
            for(let cmd in mod.commands) {
                let done = Number(f) + 1 >= files.length && Number(cmd) + 1 >= mod.commands.length ? files : false
                callback({
                    name: mod.commands[cmd].trigger,
                    time: start
                }, done)
                module.exports.commands.push(mod.commands[cmd])
            }
        }
    })
}