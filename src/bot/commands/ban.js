async function ban(data) {
    if(data.msg.mentions.user.size === 0) return data.msg.channel.send('Required `user` required.');
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
}

module.exports = {
    commands: [
        {
            trigger: ["ban", "banne"],
            call: ban,
            description: "Check the bot's heatbeat and latency.",
            category: "mod",
            usage: "ban @user reason",
            permissions: 0
        }
    ]
}