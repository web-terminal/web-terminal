var lsCmd = function () {
    this.desc = 'Show the current commands or options.';
    this.Exec = function (command, cmdwin) {
        let help = new helpCmd();
        let showStr = "";
        if (command.content.length > 0) {
            if (cmdwin.all_commands.hasOwnProperty(command.content[0])) {
                commandObject = new cmdwin.all_commands[command.content[0]]();
                // has sub command?
                showStr += help.printCmdDetail('', commandObject);
            }
        } else {
            showStr += help.printCmds(cmdwin.all_commands);
        }
        cmdwin.displayOutput(showStr)
    }
}

var cdCmd = function () {
    this.desc = 'Change to the command space.';
    this.Exec = function (command, cmdwin) {
        if (command.content.length > 0) {
            if (!command.content[0].trim()) {
                cmdwin.setPrompt("$ ");
                cmdwin.displayOutput("")
            } else if (cmdwin.all_commands.hasOwnProperty(command.content[0])) {
                cmdwin.setPrompt("$" + command.content[0] + " ");
                cmdwin.displayOutput("")
            } else {
                cmdwin.displayErrorOutput("invalid command " + command.content[0]);
            }
        } else {
            cmdwin.setPrompt("$ ");
            cmdwin.displayOutput("")
        }
    }
}

var clearCmd = function () {
    this.options = {
        screen: {
            simple: "s",
            desc: "clear screen. <code>clear -s</code>",
        },
        history: {
            simple: "h",
            desc: "clear history. <code>clear -h</code>",
        }
    }
    this.desc = 'clear datas. useage <code>clear</code>';
    this.defaultOption = 'screen';
    this.Exec = function (command, cmdwin) {
        for (let option in command.options) {
            switch (option) {
                case "screen":
                    // clear screen
                    cmdwin.clearScreen();
                    break;
                case "history":
                    // clear history
                    cmdwin.cmd_stack.empty();
                    cmdwin.cmd_stack.reset();
                    cmdwin.displayOutput('Command history cleared. ');
                    break;
                default:
                    cmdwin.displayOutput('Place use the right option.');
            }
        }
    }
}

var themeCmd = function () {
    this.options = {
        dark: {
            simple: "d",
            desc: "typical mode",
        },
        white: {
            simple: "w",
            desc: "舒适模式",
        }
    };

    this.desc = "Theme controller";

    this.Exec = function (command, cmdwin) {
        cmdwin.invert();
        cmdwin.displayOutput('Shazam.');
    }
}

var talkCmd = function () {
    this.options = {
        enabled: {
            simple: "e",
            desc: "enabled talk"
        },
        disabled: {
            simple: "d",
            desc: "disabled talk"
        },
        stop: {
            simple: "s",
            desc: "stop talk"
        }
    };
    this.defaultOption = "enabled";
    this.desc = "voice controller";

    this.Exec = function (command, cmdwin) {
        if (!cmdwin.speech_synth_support) {
            cmdwin.displayOutput('You browser doesn\'t support speech synthesis.');
            return false;
        }
        for (let option in command.options) {
            if (["enabled", "disabled"].indexOf(option) > -1) {
                if (option == 'enabled') cmdwin.options.talk = true;
                else if (option == 'disabled') cmdwin.options.talk = false;
                cmdwin.displayOutput((cmdwin.options.talk ? 'Talk mode enabled.' : 'Talk mode disabled.'));
            } else if (option == "stop") {
                if (cmdwin.options.talk) {
                    window.speechSynthesis.cancel();
                    cmdwin.options.talk = false;
                    cmdwin.displayOutput('Speech stopped. Talk mode is still enabled. Type TALK to disable talk mode.');
                    cmdwin.options.talk = true;
                } else {
                    cmdwin.displayOutput('Ok.');
                }
            }
        }
    }

}

var curlCmd = function () {
    this.options = {
        user: {
            simple: "u",
            desc: "Usage: <code>curl http://api.xxx.com -u username:password</code> Server user and password"
        },
        header: {
            simple: "H",
            desc: "Usage: <code>curl http://api.xxx.com -H header1:v1 -H header2:v2</code> Pass custom header(s) to server"
        },
        get: {
            simple: "G",
            desc: "Usage: <code>curl http://api.xxx.com -G</code> Put the post data in the URL and use GET"
        },
        timeout: {
            desc: "Usage: <code>curl http://api.xxx.com --timeout</code> Set the seconds request timeout."
        },
        data: {
            simple: "d",
            desc: 'Usage: <code>curl http://api.xxx.com -d {"k1":v1, "k2":"v2"}</code> Or <code>curl http://api.xxx.com -d k1=v1&k2=v2</code> HTTP POST data'
        },
        include: {
            simple: "i",
            desc: "Usage: <code>curl http://api.xxx.com -i</code> Include protocol response headers in the output"
        }
    };
    this.desc = "Usage: <code>curl http://api.xxx.com -u username:password -d `{\"field\": \"value\"}` -i </code> Or <code>curl http://api.xxx.com -u username:password -d k1=v1&k2=v2&k3=v3 -i</code>";
    this.defaultOption = "get";
    this.Exec = function (command, cmdwin) {
        if (command.content.length < 1) {
            cmdwin.displayOutput("no url input.");
        } else {
            let ajaxConfig = {
                url: command.content[0],
                type: 'GET',
                async: true,
                dataType: 'text'
            }
            // data
            if (command.options.hasOwnProperty('data')) {
                ajaxConfig['type'] = 'POST';

                if (typeof command.options.data == 'object') {
                    let data = {};
                    for (let i in command.options.data) {
                        let element = command.options.data[i];
                        let keyval = element.indexOf(':') > -1 ? element.split(':') : element.split('=');
                        console.log(keyval)
                        if (keyval.length > 1) {
                            data[$.trim(keyval[0])] = $.trim(keyval[1]);
                        } else {
                            data[i] = element;
                        }
                    }
                    ajaxConfig['data'] = data;
                } else {
                    ajaxConfig['data'] = command.options.data;
                }
            }
            // header
            if (command.options.hasOwnProperty('header')) {
                let header = {};
                if (typeof command.options.header == 'string') {
                    command.options.header = [command.options.header];
                }
                command.options.header.forEach(element => {
                    let keyval = element.indexOf(':') > -1 ? element.split(':') : element.split('=');
                    header[$.trim(keyval[0])] = keyval.length > 1 ? $.trim(keyval[1]) : true;
                    // console.log(keyval, header)
                });
                ajaxConfig['header'] = header;
            }
            // user
            if (command.options.hasOwnProperty('user')) {
                let keyval = command.options.user.split(':')
                ajaxConfig['username'] = keyval.length > 0 ? keyval[0] : '';
                ajaxConfig['password'] = keyval.length > 1 ? keyval[1] : '';
            }
            // get
            if (command.options.hasOwnProperty('get')) {
                ajaxConfig['type'] = 'GET';
            }
            // timeout
            if (command.options.hasOwnProperty('timeout')) {
                ajaxConfig['timeout'] = command.options['timeout'];
            }
            // ajax-request
            api_send_message({
                type: 'ajax-request',
                config: ajaxConfig,
                callback: function (res) {
                    if (command.options.hasOwnProperty('include')) {
                        window.TerminalWin.displayOutput('============================ Request ========================');
                        for (let option in ajaxConfig) {
                            if (typeof ajaxConfig[option] != 'string') {
                                ajaxConfig[option] = JSON.stringify(ajaxConfig[option]);
                            }
                            window.TerminalWin.displayOutput(option + ': ' + ajaxConfig[option], true);
                        }
                        window.TerminalWin.displayOutput('============================ Response ========================');
                        window.TerminalWin.displayOutput('Status: ' + res.data.xhr.status + ' ' + res.data.xhr.statusText);
                        // window.TerminalWin.displayOutput('TextStatus: '+res.data.xhr.status+' '+res.data.xhr.statusText, true);
                    }

                    window.TerminalWin.displayOutput(res.data.xhr.responseText, true)
                }
            });
        }
    }
}

var selectorCmd = function () {
    this.options = {
        selector: {
            simple: "s",
            desc: "the operate element"
        },
        current: {
            simple: "c",
            desc: "it will operate current tab"
        },
        url: {
            simple: "u",
            desc: "url"
        },
        value: {
            simple: "v",
            desc: "Sets or returns the value of the input type selected element"
        },
        text: {
            simple: "t",
            desc: "Sets or returns the text content of the selected element"
        },
        html: {
            simple: "h",
            desc: "Sets or returns the html content of the selected element"
        },
        css: {
            simple: "c",
            desc: "Sets or returns the css value of the selected element"
        },
        attr: {
            simple: "a",
            desc: "Sets or returns the attribute value of the selected element"
        },
        removeAttr: {
            simple: "A",
            desc: "Remove the specified attribute of the selected element"
        },
        prop: {
            simple: "p",
            desc: "Get the attribute value of the first element in the matched element set"
        },
        removeProp: {
            simple: "P",
            desc: "Remove the attribute value of the first element in the matched element set"
        },
        addClass: {
            simple: "d",
            desc: "Add the specified class name for each matched element"
        },
        removeClass: {
            simple: "D",
            desc: "Remove the specified class name for each matched element"
        },
        trigger: {
            simple: "o",
            desc: "the trigger of selector element",
            options: [
                "click", "blur", "focus", "keyup", "keydown", "keypress",
                "change", "dblclick", "error", "focusin", "focusout",
                "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mouseleave", "mouseenter",
                "resize", "scroll", "select", "submit", "unload"
            ]
        }
    };
    this.defaultOption = "current";
    this.desc = "Usage: <code>selector #id -t</code>";

    this.Exec = function (command, cmdwin) {
        api_send_message({
            type: "selector",
            options: command.options,
            content: command.content,
            callback: function (msg) {
                cmdwin.displayOutput(msg.response);
            }
        });
    }
}

var helpCmd = function () {
    var self = this;
    this.desc = "Show the command how to use. eg: help"
    this.printCmdDetail = function (cmd, commandConfig) {
        let showStr = '<div style="margin-left: 15px;">';
        // desc
        if (commandConfig.hasOwnProperty('desc'))
            showStr += "<div>" + (cmd ? cmd + ": " : '') + commandConfig.desc + "</div>";
        if (commandConfig.hasOwnProperty('options')) {
            for (let option in commandConfig.options) {
                showStr += '<div style="margin-left: 15px;">'
                showStr += '<span>' + (commandConfig.options[option].hasOwnProperty('simple') ? ('-' + commandConfig.options[option]['simple'][0]) : '&nbsp;&nbsp;') + '</span>'
                showStr += '<span class="help-span">--' + option + '</span>'
                if (getPropertyVal(commandConfig.options[option], "required")) {
                    showStr += '<span class="help-span red_highlight">Required</span>'
                }
                if (getPropertyVal(commandConfig.options[option], "dataType")) {
                    showStr += '<span class="help-span green_highlight">dataType=' + commandConfig.options[option].dataType + '</span>'
                }
                if (commandConfig.options[option].hasOwnProperty('default')) {
                    showStr += '<span class="help-span green_highlight">default=' + commandConfig.options[option].default + '</span>'
                }
                showStr += '<span class="help-span">' + (commandConfig.options[option].hasOwnProperty('desc') ? commandConfig.options[option]['desc'] : '') + '</span>'
                showStr += '</div>'
            }
        }
        if (commandConfig.hasOwnProperty('subCmds')) {
            for (let subcmd in commandConfig.subCmds) {
                showStr += self.printCmdDetail(subcmd, commandConfig.subCmds[subcmd]);
            }
        }

        return showStr + '</div>';
    }

    this.printCmds = function (all_commands) {
        let showStr = "";
        for (let cmd in all_commands) {
            showStr += '<span class="blue_highlight help-span">' + cmd + '</span>';
        }
        return showStr;
    }

    this.Exec = function (command, cmdwin) {
        let showStr = ''
        if (command.content.length > 0) {
            command.content.forEach(cmd => {
                if (cmdwin.all_commands.hasOwnProperty(cmd)) {
                    commandObject = cmdwin.command.getCmdInstance(cmdwin.all_commands[cmd]);
                    // commandObject = new cmdwin.all_commands[cmd]();
                    showStr += this.printCmdDetail('', commandObject);
                } else {
                    showStr += cmdwin.getErrorOutput('the command "' + cmd + '" is invalid.')
                }
            });
        } else {
            showStr += this.printCmds(cmdwin.all_commands)
        }
        cmdwin.displayOutput(showStr);
    }
}

var timeCmd = function () {
    this.options = {
        timestamp: {
            simple: "t",
            desc: "Get timestamp. useage: <code>time `2020-07-04 14:00:00` -t</code>"
        },
        microtimestamp: {
            simple: "m",
            desc: "Get micro timestamp. useage: <code>time `2020-07-04 14:00:00` -m</code>"
        },
        date: {
            simple: "d",
            desc: "Get date. useage: <code>time `1593842041976` -d</code>"
        }
    };
    this.desc = "Useage: <code>time `2020-07-04 14:00:00` -t</code>"
    this.defaultOption = "date";
    this.Exec = function (command, cmdwin) {
        if (command.options.hasOwnProperty('timestamp')) {
            var timestamp = null;
            if (typeof command.options.timestamp != "boolean") {
                timestamp = new Date(command.options.timestamp).getTime();
            } else if (command.content.length > 0) {
                timestamp = new Date(command.content[0]).getTime();
            } else {
                timestamp = new Date().getTime()
            }
            cmdwin.displayOutput(parseInt(timestamp / 1000) + '');
        }
        if (command.options.hasOwnProperty('microtimestamp')) {
            var microtimestamp = null;
            if (typeof command.options.microtimestamp != "boolean") {
                microtimestamp = new Date(command.options.microtimestamp).getTime();
            } else if (command.content.length > 0) {
                microtimestamp = new Date(command.content[0]).getTime();
            } else {
                microtimestamp = new Date().getTime()
            }
            cmdwin.displayOutput(microtimestamp + '');
        }
        if (command.options.hasOwnProperty('date')) {
            let Pad = function (num, n, right) {
                var len = num.toString().length;
                while (len < n) {
                    if (right) num = num + "0";
                    else num = "0" + num;
                    len++;
                }
                return num;
            }
            var date = new Date();
            if (typeof command.options.date != "boolean") {
                date = new Date(parseInt(Pad(command.options.date, 13, 1)));
            } else if (command.content.length > 0) {
                date = new Date(parseInt(Pad(command.content[0], 13, 1)));
            }

            var year = date.getFullYear();
            var month = Pad(date.getMonth() + 1, 2);    //js从0开始取 
            var date1 = Pad(date.getDate(), 2);
            var hour = Pad(date.getHours(), 2);
            var minutes = Pad(date.getMinutes(), 2);
            var second = Pad(date.getSeconds(), 2);
            cmdwin.displayOutput(year + '-' + month + '-' + date1 + ' ' + hour + ':' + minutes + ':' + second);
        }
    }
}
