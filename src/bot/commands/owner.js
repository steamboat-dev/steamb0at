function evalcmd(data) {
    let e = eval(data.args.join(" "))

    data.say("```" + String(e) + "```").then(data.complete).catch(data.err)
}

module.exports = {
    commands: [
        {
            trigger: ["eval"],
            call: evalcmd,
            description: "Evaluates javascript",
            category: "owner",
            usage: "eval <code>",
            permissions: 0,
            owner: true
        }
    ]
}