function callCommand(command, data, commandEnd, sudo) {

    if(!sudo && command.permissions != undefined && command.permissions != 0 && !checkPermissions(command.permissions, data)) {
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

function checkPermissions(permissionBit, data) {
    return true // data.triggermessage.member.hasPermissions(permissionBit)
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