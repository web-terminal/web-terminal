var cmdCmd = function () {
    var commonOptions = {
        hub: {
            simple: "h",
            desc: "the cmd hub url address.",
            default: "https://raw.githubusercontent.com/web-terminal/cmdhub/master/"
        }
    };
    this.subCmds = {
        add: {
            desc: "<code>cmd add [command]</code> add a command. <code>cmd add github</code> the github command will be adding.",
            options: commonOptions,
            Exec: function (command, terminal) {
                if (command.content.length > 0) {
                    let newCmd = command.content[0].trim();
                    // get the 
                    api_send_message({
                        type: "cmdhub", method: "add", options: command.options, newCmd: newCmd, callback: function (res) {
                            if (res.meta.code == 200) {
                                $.extend(terminal.customcmds, res.meta.data);
                                for (let cmd in terminal.customcmds) {
                                    terminal.all_commands[cmd] = terminal.customcmds[cmd]['index_func'];
                                }
                                terminal.displayOutput(newCmd + " added.");
                            } else {
                                terminal.displayErrorOutput(res.meta.msg);
                            }
                        }
                    });
                } else {
                    terminal.displayErrorOutput("Input the command names what you want to add.");
                }
            }
        },
        update: {
            desc: "<code>cmd update [command]</code> update a command. <code>cmd update github</code> to update the github commands latest version.",
            options: commonOptions,
            Exec: function (command, terminal) {
                if (command.content.length > 0) {
                    let newCmd = command.content[0].trim();
                    api_send_message({
                        type: "cmdhub", method: "update", options: command.options, newCmd: newCmd, callback: function (res) {
                            if (res.meta.code == 200) {
                                $.extend(terminal.customcmds, res.meta.data);
                                for (let cmd in self.customcmds) {
                                    terminal.all_commands[cmd] = terminal.customcmds[cmd]['index_func'];
                                }
                                terminal.displayOutput(newCmd + " updated.");
                            } else {
                                terminal.displayErrorOutput(res.meta.msg);
                            }
                        }
                    });
                } else {
                    terminal.displayErrorOutput("Input the command names what you want to update.");
                }
            }
        },
        delete: {
            desc: "<code>cmd delete [command]</code> delete a command. <code>cmd delete github</code> to delete github command.",
            options: commonOptions,
            Exec: function (command, terminal) {
                if (command.content.length > 0) {
                    let newCmd = command.content[0].trim();
                    api_send_message({
                        type: "cmdhub", method: "delete", options: command.options, newCmd: newCmd, callback: function (res) {
                            if (res.meta.code == 200) {
                                delete terminal.customcmds[newCmd];
                                delete terminal.all_commands[newCmd];
                                terminal.displayOutput(newCmd + " deleted.");
                            } else {
                                terminal.displayErrorOutput(res.meta.msg);
                            }
                        }
                    });
                } else {
                    terminal.displayErrorOutput("Input the command names what you want to delete.");
                }
            }
        },
        custom: {
            desc: 'Custom command',
            Exec: function (command, terminal) {
                if (command.content.length > 1) {
                    var newCmd = command.content[0];
                    // 命令名成不允许和系统命令相同
                    if (terminal.syscmds.hasOwnProperty(newCmd)) {
                        terminal.displayErrorOutput("Command " + newCmd + " is system command.");
                    } else {
                        api_send_message({
                            type: "cmdhub", method: "custom", newCmd: newCmd, cmdContent: command.content[1], callback: function (res) {
                                if (res.meta.code == 200) {
                                    $.extend(terminal.customcmds, res.meta.data);
                                    for (let cmd in terminal.customcmds) {
                                        terminal.all_commands[cmd] = terminal.customcmds[cmd]['index_func'];
                                    }
                                    terminal.displayOutput(newCmd + " added.");
                                } else {
                                    terminal.displayErrorOutput(res.meta.msg);
                                }
                            }
                        });
                    }
                }
            }
        }
    }
    this.desc = "This is Terminal's command manager. like nodejs npm.";
}