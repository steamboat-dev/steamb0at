function ban(data) {
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send("Required usage of `user` is required.").then(data.complete).catch(data.err)
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send("Please include a valid member!").then(data.complete).catch(data.err)
    let reason = data.args.slice(1).join(" ").replace(mem, "")
    if (!data.args[1]) return data.msg.channel.send("Required usage of `reason` is required.").then(data.complete).catch(data.err)
    mem.ban(7).then(function () {
        data.msg.channel.sendMessage(`:hammer: User \`${mem.user.username}#${mem.user.discriminator}\` was banned for the following reason: \`${reason}\``).catch(data.err).then(data.complete)
    })
}

function kick(data) {
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send("Required usage of `user` is required.").then(data.complete).catch(data.err)
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send("Please include a valid member!").then(data.complete).catch(data.err)
    let reason = data.args.slice(1).join(" ").replace(mem, "")
    if (!data.args[1]) return data.msg.channel.send("Required usage of `reason` is required.").then(data.complete).catch(data.err)
    mem.kick().catch(data.err).then(function () {
        data.msg.channel.sendMessage(`:boot: User \`${mem.user.username}#${mem.user.discriminator}\` was kicked for the following reason: \`${reason}\``).catch(data.err).then(data.complete)
    })
}

function mute(data) {
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send("Required usage of `user` is required.").then(data.complete).catch(data.err)
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send("Please include a valid member!").then(data.complete).catch(data.err)
    let role2 = data.msg.guild.roles.find("name", "Muted")
    if (role2 && mem.roles.get(role2.id)) return data.say("That user is already muted!")

    if (!role2) {
        return data.msg.guild.createRole().then(role => {
            role.setPosition(data.msg.guild.member(data.bot.user).highestRole.position - 1).then(role => {
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
        }).catch(data.err)
    }
    trueMute(data, mem, role2)
}

function trueMute(data, mem, role) {
    mem.addRole(role).then(() => {
        data.say(`Muted ${mem.user.username}#${mem.user.discriminator}${mem.user.bot ? " (BOT)" : ""}!`).then(data.complete).catch(data.err)
    }).catch(data.err)
}

function unmute(data) {
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send("Required usage of `user` is required.").then(data.complete).catch(data.err)
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send("Please include a valid member!").catch(data.err).then(data.complete)
    let role = data.msg.guild.roles.find("name", "Muted")
    if (!role || !mem.roles.get(role.id)) return data.say("That user isn't muted!").catch(data.err).then(data.complete)

    mem.removeRole(role).catch(data.err).then(() => {
        data.say(`Unmuted ${mem.user.username}#${mem.user.discriminator}${mem.user.bot ? " (BOT)" : ""}!`).catch(data.err).then(data.complete)
    })
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