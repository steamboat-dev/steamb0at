async function ban(data) {
    if (data.msg.mentions.users.size === 0) return data.msg.channel.send('Required usage of `user` is required.').then(data.complete).catch(data.err);
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if (!mem) return data.msg.channel.send('Please include a valid member!').then(data.complete).catch(data.err);
    let reason = data.args.slice(1).join(" ").replace(mem, "")
    if (!data.args[1]) return data.msg.channel.send('Required usage of `reason` is required.').then(data.complete).catch(data.err);
    await mem.ban(7).then(data.complete).catch(data.err);
    data.msg.channel.sendMessage(`:hammer: User \`${mem.user.username}#${mem.user.discriminator}\` was banned for the following reason: \`${reason}\``)
}

module.exports = {
    commands: [{
        trigger: ["ban", "banne"],
        call: ban,
        description: "Check the bot's heatbeat and latency.",
        category: "mod",
        usage: "ban @user reason",
        permissions: 0
    }]
}