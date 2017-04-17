async function ban(data) {
    if(data.msg.mentions.user.size === 0) return data.msg.channel.send('Required usage of `user` is required.');
    let mem = data.msg.guild.member(data.msg.mentions.users.first())
    if(!mem) return data.msg.channel.send('Please include a valid member!');
    if(!data.args) return data.msg.channel.send('Required usage of `reason` is required.')
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