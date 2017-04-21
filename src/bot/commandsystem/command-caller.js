let config = require("../../../config")

function callCommand(command, data, commandEnd, sudo) {
    if(!sudo && !config.owners.includes(data.author.id) && command.owner) {
        data.say("Nice try! You don't have permission to run that command! It's marked as owner-only!")
        return commandEnd({
            code: errors.permissionMissing
        })
    }

    if(!sudo && command.permissions != undefined && !config.owners.includes(data.author.id) && !checkPermissions(command.permissions, data)) {
        data.say("Nice try! You don't have permission to run that command!")
        return commandEnd({
            code: errors.permissionMissing
        })
    }

    data.err = function(err) {
        if(err) {
            data.say("A fatal exception occurred while trying to execute that command: ```" + err + "```")
            return commandEnd({
                code: errors.fatal,
                description: err
            })
        }
    }

    data.complete = commandEnd

    try {
        command.call(data)
    } catch(e) {
        data.err(e)
        commandEnd({
            code: errors.fatal,
            description: e
        })
    }
}

function checkPermissions(permbit, data) {
    if(permbit == 0) return true // ignore no perm commands
    return data.msg.guild.member(data.msg.author).permissions.hasPermission(permbit)
}

module.exports = {
    checkPermissions,
    callCommand
}

let errors = {
    success: 0,
    unknown: 1,
    fatal: 2,
    permissionMissing: 3
}