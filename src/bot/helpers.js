schemas = {
    Guild: require("../shared/schema/guild"),
    Infractions: require("../shared/schema/infractions"),
    Settings: require("../shared/schema/settings")
}

let logger = console

function modLog(msg, data, guild, raw) {
    if (!guild) {
        let tmpguild = data.msg.guild
        guild = tmpguild
    }
    if (!data || !data.db) {
        schemas.Guild.findOne({guildID: guild.id}, (err, guilddb) => {
            if (err || !guilddb) {
                logger.log("EE", err)
                let guilddb = new schemas.Guild({
                    guildID: guild.id,
                    settings: [],
                    infractions: []
                })
                guilddb.save()
            } else {
                if(!guilddb.settings[0]) return false
                let chan = guild.channels.get(guilddb.settings[0].modLogID)
                if (!chan) return false
                sendModLogItm(msg, chan, data, raw)
            }
        })
    } else {
        let chan = guild.channels.get(data.db.guild.settings.modLogId)
        if (!chan) return false
        sendModLogItm(msg, chan, data, raw)
    }
}

function sendModLogItm(msg, chan, data, raw) {
    if (raw) {
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