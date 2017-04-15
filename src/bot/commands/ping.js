function ping(data) {
    data.say("I AM A STEAMBOT TOOT TOOT PLS NO BAN ME KTHX!!!1!!!!!!! Also, Pong!").catch(data.err).then(data.complete())
}

module.exports = {
    commands: [
        {
            trigger: ["ping"],
            call: ping,
            description: ":100: Bestest command for test",
            category: "pongy",
            usage: "ping",
            permissions: 8
        }
    ]
}