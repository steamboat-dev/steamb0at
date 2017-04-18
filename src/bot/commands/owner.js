function evalcmd(data) {
    let e = new Function("data", "return " + data.args.join(" "))

    data.say("```" + String(e(data)) + "```").catch(data.err).then(data.complete)
}

module.exports = {
    commands: [
        {
            trigger: ["eval"],
            call: evalcmd,
            description: "Evaluates javascript",
            category: "owner",
            usage: "eval <code>",
            permissions: 0
        }
    ]
}