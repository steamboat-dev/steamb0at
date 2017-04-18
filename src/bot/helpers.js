function modLog(msg, data, guild, raw) {
    if(!guild) guild = data.msg.guild

    let chan = guild.channels.find("name", "mod-logs")
    if(chan) {
        sendModLogItm(msg, chan, data, raw)
    } else {
        data.msg.guild.createChannel("mod-logs", "text").then(chan => {
            chan.sendMessage(`Channel ${chan} created by ${data.bot.user}`, chan, data).then(() => {
                sendModLogItm(msg, chan, data)
            }).catch(data.err)
        }).catch(data.err)
    }
}

function sendModLogItm(msg, chan, data, raw) {
    if(raw) {
        chan.sendEmbed({
            title: "Moderator action",
            description: msg,
            color: Math.random() * 0xFFFFFF << 0
        })
    } else {
        chan.sendEmbed({
            title: "Moderator action by " + data.msg.author.username,
            description: data.msg.author + " " + msg,
            color: Math.random() * 0xFFFFFF << 0
        })
    }
}

module.exports = {
    modLog
}