function ban(data) {
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send("Required usage of `user` is required.").then(data.complete).catch(data.err)
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send("Please include a valid member!").then(data.complete).catch(data.err)
    let reason = data.args.slice(1).join(" ").replace(mem, "")
    if (!data.args[1]) return data.msg.channel.send("Required usage of `reason` is required.").then(data.complete).catch(data.err)
    mem.ban(7).then(function() {
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

module.exports = {
    commands: [
        {
            trigger: ["ban", "banne"],
            call: ban,
            description: "Bans a user",
            category: "mod",
            usage: "ban @user reason",
            permissions: 0
        },
        {
            trigger: ["kick"],
            call: kick,
            description: "Kicks a user",
            category: "mod",
            usage: "kick @user reason",
            permissions: 0
        }
    ]
}