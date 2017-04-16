function ping(data) {
    data.msg.channel.send(":ship: Heartbeat: `" + data.bot.ping + "ms` | :trumpet: Latency: `*Getting latency*`").then(msg => {
        msg.edit(msg.content.replace("*Getting latency*", Math.floor(new Date(msg.createdTimestamp).valueOf() - new Date(data.msg.createdTimestamp).valueOf()) + "ms"))
            .catch(data.err).then(data.complete)
    }).catch(data.err)
}

module.exports = {
    commands: [
        {
            trigger: ["ping"],
            call: ping,
            description: "Check the bot's heatbeat and latency.",
            category: "pongy",
            usage: "ping",
            permissions: 0
        }
    ]
}