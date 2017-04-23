let AsciiTable = require("ascii-table")

function ban(data) {
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send("Please give a user!").then(data.complete).catch(data.err)
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send("Please include a valid member!").then(data.complete).catch(data.err)
    let reason = data.args.slice(1).join(" ").replace(mem, "")
    if (!data.args[1]) return data.msg.channel.send("Please give a reason!").then(data.complete).catch(data.err)
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
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send("Please give a user!").then(data.complete).catch(data.err)
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send("Please include a valid member!").then(data.complete).catch(data.err)
    let reason = data.args.slice(1).join(" ").replace(mem, "")
    if (!data.args[1]) return data.msg.channel.send("Please give a reason!").then(data.complete).catch(data.err)
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

function userInfo(data) {
    if(data.args.length != 1) return data.say(`Too ${data.args.length > 1 ? "many" : "few"} arguments!`).then(data.complete).catch(data.err)
    let targetID = data.args[0]
    if (data.msg.mentions.users.size !== 0) {
        targetID = data.msg.mentions.users.first().id
    }
    let mem = data.msg.guild.members.get(targetID.toString())
    if (!mem) return data.msg.channel.send("Please include a valid member!").then(data.complete).catch(data.err)
    let infractions = {}
    let resptext = ""
    for(let inf in data.db.guild.infractions) {
        if(data.db.guild.infractions[inf].targetID == targetID) infractions[inf] = data.db.guild.infractions[inf]
    }
    if(infractions.length <= 0) {
        return data.say("This user has no infractions!").then(data.complete).catch(data.err)
    }
    for(let inf in infractions) {
        let frac = infractions[inf]
        resptext += `\n\
**Case Number:** ${Number(inf) + 1}\n\
**Type:** ${frac.type}\n\
**From:** ${frac.time.toISOString().replace("T", " ").substr(0, 19)}\n\
**Until:** ${typeof frac.until == Date ? frac.until.toISOString().replace("T", " ").substr(0, 19) : "N/A"}\n\
**Moderator:** <@${frac.moderatorID}>\n`
    }
    console.log("Thus far")
    data.embed({
        title: `Infractions for user: ${mem.user.username}#${mem.user.discriminator}`,
        description: resptext,
        color: Math.random() * 0xFFFFFF << 0
    }, "", {split: true}).then(data.complete).catch(data.err)
}

function mute(data) {
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send("Please give a valid user!").then(data.complete).catch(data.err)
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send("Please include a valid member!").then(data.complete).catch(data.err)
    if(!data.args.join(" ").replace(mem, "")) return data.say("Please give a reason!").then(data.complete).catch(data.err)
    let reason = data.args.join(" ").replace(mem, "")
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
                    trueMute(data, mem, role, reason)
                }).catch(data.err)
            }).catch(data.err)
        }).catch(data.err)
    }
    trueMute(data, mem, role2, reason)
}

function trueMute(data, mem, role, reason) {
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
            data.db.guild.save(function (err) {
                if (err) data.logger.log("Error saving: ", err)
            })
        }).catch(data.err)
    }).catch(data.err)
}

function unmute(data) {
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send("Please give a user!").then(data.complete).catch(data.err)
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send("Please include a valid member!").then(data.complete).catch(data.err)
    let role = data.msg.guild.roles.find("name", "Muted")
    if (!role || !mem.roles.get(role.id)) return data.say("That user isn't muted!").then(data.complete).catch(data.err)

    mem.removeRole(role).then(() => {
        data.say(`Unmuted ${mem.user.username}#${mem.user.discriminator}${mem.user.bot ? " (BOT)" : ""}!`).then(data.complete).catch(data.err)
        data.helpers.modLog("unmuted " + mem.user, data)
        for(let i in data.db.guild.infractions) {
            let inf = data.db.guild.infractions[i]
            if(inf.targetID == mem.id && inf.type == "mute") {
                data.db.guild.infractions[i].active = false
            }
        }
        data.db.guild.save()
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
            permissions: 60
        }, {
            trigger: ["kick"],
            call: kick,
            description: "Kicks a user",
            category: "mod",
            usage: "kick @user reason",
            permissions: 40
        }, {
            trigger: ["mute"],
            call: mute,
            description: "Mutes a user",
            category: "mod",
            usage: "mute @user",
            permissions: 30
        }, {
            trigger: ["unmute"],
            call: unmute,
            description: "Unmutes a user",
            category: "mod",
            usage: "unmute @user",
            permissions: 30
        }, {
            trigger: ["info"],
            call: userInfo,
            description: "Get info on a user",
            category: "mod",
            usage: "shit @user",
            permissions: 20
        }
    ]
}