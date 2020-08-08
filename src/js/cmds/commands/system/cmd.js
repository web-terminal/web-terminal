var cmdCmd = function() {
    this.subCmds = {
        add: {
            desc: "Add a command. <code>cmd add github</code> the github command will be add.",
            exec: function(command, terminal) {
                if (command.content.length > 1) {
                    let newCmd = command.content[1].trim();
                    // get the 
                    api_send_message({type: "cmdhub", method: "add", newCmd: newCmd, callback: function(res) {
                        if (res.meta.code == 200) {
                            $.extend(terminal.customcmds, res.meta.data);
                            $.extend(terminal.all_commands, keys(terminal.customcmds));
                            terminal.displayOutput(newCmd+" added.");
                        } else {
                            terminal.displayErrorOutput(res.meta.msg);
                        }
                    }});
                } else {
                    terminal.displayErrorOutput("Input the command names what you want to add.");
                }
            }
        },
        update: {
            desc: "clear screen. <code>clear -s</code>",
            exec: function(command, terminal) {
                if (command.content.length > 1) {
                    let newCmd = command.content[1].trim();
                    api_send_message({type: "cmdhub", method: "update", newCmd: newCmd, callback: function(res) {
                        if (res.meta.code == 200) {
                            $.extend(terminal.customcmds, res.meta.data);
                            $.extend(terminal.all_commands, keys(terminal.customcmds));
                            terminal.displayOutput(newCmd+" updated.");
                        } else {
                            terminal.displayErrorOutput(res.meta.msg);
                        }
                    }});
                } else {
                    terminal.displayErrorOutput("Input the command names what you want to update.");
                }
            }
        },
        delete: {
            desc: "clear history. <code>clear -h</code>",
        }
    }
    this.desc = 'clear datas. useage <code>clear</code>';
    this.Exec = function(command, terminal) {
        if (command.content.length > 0) {
            if (this.subCmds.hasOwnProperty(command.content[0])) {
                this.subCmds[command.content[0]].exec(command, terminal);
            } else {
                terminal.displayErrorOutput("invalid command "+command.content[0]);
            }
        } else {
            terminal.displayErrorOutput("please input sub command. like: browser bookmark <first content>");
        }
    }
}