function generateAllHelp(commands) {
    let helpText = ""
    let help = {}
    for(let c in commands) {
        if(!help[commands[c].category]) help[commands[c].category] = []
        help[commands[c].category].push(commands[c])
    }
    for(let c in help) {
        helpText += "__**" + c.toUpperCase() + "**__\n"
        for(let d in help[c]) {
            let command = help[c][d]
            helpText += `    **${command.trigger.join("** or **")}** - *${command.description}*\n`
        }
    }
    return helpText
}

function help(data) {
    data.embed({
        title: "My commands are:",
        description: generateAllHelp(data.commands.commands),
        color: Math.random() * 0xFFFFFF << 0
    }, {
        split: true
    }).then(data.complete).catch(data.err)
}

module.exports = {
    commands: [
        {
            trigger: ["help"],
            call: help,
            description: "Shows help",
            category: "basic",
            usage: "help (category/command)"
        }
    ]
}