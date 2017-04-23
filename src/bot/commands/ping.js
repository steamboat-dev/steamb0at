function ping(data) {
    let txt = ":ship: Heartbeat: `" + Math.round(data.bot.ping) + "ms` | :trumpet: Latency: `*Getting latency*`"
    if(Math.random() >= 0.9) {
        txt = "TOOOOOOOT TOOOOOOOOOOOT!!!!!!!! I HAVE MY HEART GOING AT 1 BEAT PER `" + Math.round(data.bot.ping) + "MS AHAHAHAHH!!!!!! IT TAKES ME `*Getting latency*` TO RESPOND TO A MESSAGE EHEHEHEHEHEH!!!!!!!"
    }
    data.msg.channel.send(txt).then(msg => {
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