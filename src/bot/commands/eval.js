let {VM} = require("vm2");

function safeEval(data) {
    let vm = new VM({
        timeout: 1000
    });
    data.msg.channel.sendCode("", vm.run(data.args.join(" ")), {split: true}).then(data.complete).catch(data.err);
}

module.exports = {
    commands: [
        {
            trigger: ["seval"],
            call: safeEval,
            description: "Evaluates javascript",
            category: "fun",
            usage: "seval <code>",
            permissions: 0
        }
    ]
}