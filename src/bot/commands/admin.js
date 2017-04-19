function ban(data) {
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send("Required usage of `user` is required.").then(data.complete).catch(data.err)
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send("Please include a valid member!").then(data.complete).catch(data.err)
    let reason = data.args.slice(1).join(" ").replace(mem, "")
    if (!data.args[1]) return data.msg.channel.send("Required usage of `reason` is required.").then(data.complete).catch(data.err)
    mem.ban(7).then(function () {
        data.msg.channel.sendMessage(`:hammer: User \`${mem.user.username}#${mem.user.discriminator}\` was banned for the following reason: \`${reason}\``).then(data.complete).catch(data.err)
        data.helpers.modLog("banned " + mem.user.username + "#" + mem.user.discriminator + " for " + reason, data)
        data.db.guild.infractions.push(new data.schemas.Infractions({
            moderatorID: data.msg.author.user.id,
            targetID: mem.user.id,
            type: "ban",
            reason: reason || "No reason given",
            time: new Date()
        }))

        data.db.guild.save()
    }).catch(data.err)
}

function kick(data) {
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send("Required usage of `user` is required.").then(data.complete).catch(data.err)
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send("Please include a valid member!").then(data.complete).catch(data.err)
    let reason = data.args.slice(1).join(" ").replace(mem, "")
    if (!data.args[1]) return data.msg.channel.send("Required usage of `reason` is required.").then(data.complete).catch(data.err)
    mem.kick().then(function () {
        data.msg.channel.sendMessage(`:boot: User \`${mem.user.username}#${mem.user.discriminator}\` was kicked for the following reason: \`${reason}\``).then(data.complete).catch(data.err)
        data.helpers.modLog("kicked " + mem.user.username + "#" + mem.user.discriminator + " for " + reason, data)
        data.db.guild.infractions.push({
            moderatorID: data.author.id,
            targetID: mem.user.id,
            type: "kick",
            reason: reason || "No reason given",
            time: new Date()
        })
        data.guild.save(function (err) {
            if (err) data.logger.log("Error saving: ", err)
        })
    }).catch(data.err)
}

function mute(data) {
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send("Required usage of `user` is required.").then(data.complete).catch(data.err)
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send("Please include a valid member!").then(data.complete).catch(data.err)
    let role2 = data.msg.guild.roles.find("name", "Muted")
    if (role2 && mem.roles.get(role2.id)) return data.say("That user is already muted!")

    if (!role2) {
        return data.msg.guild.createRole().then(role => {
            role.setName("Muted").then(role => {
                role.setColor("#ff0000").then(role => {
                    data.msg.channel.guild.channels.forEach(function (chan) {
                        chan.overwritePermissions(role, {
                            SEND_MESSAGES: false
                        }).catch(data.err)
                    })
                    trueMute(data, mem, role)
                }).catch(data.err)
            }).catch(data.err)
        }).catch(data.err)
    }
    trueMute(data, mem, role2)
}

function trueMute(data, mem, role) {
    role.setPosition(data.msg.guild.member(data.bot.user).highestRole.position - 1).then(role => {
        mem.addRole(role).then(() => {
            data.say(`Muted ${mem.user.username}#${mem.user.discriminator}${mem.user.bot ? " (BOT)" : ""}!`).then(data.complete).catch(data.err)
            data.helpers.modLog("muted " + mem.user, data)
            data.db.guild.infractions.push({
                moderatorID: data.author.id,
                targetID: mem.user.id,
                type: "mute",
                reason: reason || "No reason given",
                time: new Date()
            })
            data.guild.save(function (err) {
                if (err) data.logger.log("Error saving: ", err)
            })
        }).catch(data.err)
    }).catch(data.err)
}

function unmute(data) {
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send("Required usage of `user` is required.").then(data.complete).catch(data.err)
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send("Please include a valid member!").then(data.complete).catch(data.err)
    let role = data.msg.guild.roles.find("name", "Muted")
    if (!role || !mem.roles.get(role.id)) return data.say("That user isn't muted!").then(data.complete).catch(data.err)

    mem.removeRole(role).then(() => {
        data.say(`Unmuted ${mem.user.username}#${mem.user.discriminator}${mem.user.bot ? " (BOT)" : ""}!`).then(data.complete).catch(data.err)
        data.helpers.modLog("unmuted " + mem.user, data)
    }).catch(data.err)
}

module.exports = {
    commands: [
        {
            trigger: ["ban", "banne"],
            call: ban,
            description: "Bans a user",
            category: "mod",
            usage: "ban @user reason",
            permissions: 0
        }, {
            trigger: ["kick"],
            call: kick,
            description: "Kicks a user",
            category: "mod",
            usage: "kick @user reason",
            permissions: 0
        }, {
            trigger: ["mute"],
            call: mute,
            description: "Mutes a user",
            category: "mod",
            usage: "mute @user",
            permissions: 0
        }, {
            trigger: ["unmute"],
            call: unmute,
            description: "Unmutes a user",
            category: "mod",
            usage: "unmute @user",
            permissions: 0
        }
    ]
}