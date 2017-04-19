function ping(data) {
    data.msg.channel.send(":ship: Heartbeat: `" + Math.round(data.bot.ping) + "ms` | :trumpet: Latency: `*Getting latency*`").then(msg => {
        msg.edit(msg.content.replace("*Getting latency*", Math.round(new Date(msg.createdTimestamp).valueOf() - new Date(data.msg.createdTimestamp).valueOf()) + "ms"))
            .then(data.complete).catch(data.err)
    }).catch(data.err)
}

module.exports = {
    commands: [
        {
            trigger: ["ping"],
            call: ping,
            description: "Check the bot's heatbeat and latency.",
            category: "basic",
            usage: "ping",
            permissions: 0
        }
    ]
}