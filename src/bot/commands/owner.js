function evalcmd(data) {
    let e = new Function("data", "return " + data.args.join(" "))

    data.say("```" + String(e(data)) + "```").then(data.complete).catch(data.err)
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