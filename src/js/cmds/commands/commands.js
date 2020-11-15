var Command = function (input, prompt) {
    this.input = input;
    this.prompt = '';
    this.name = '';
    this.options = {};
    this.content = [];
    // parse prompt
    this.PrompParser(prompt);
    // parse input
    this.InputParser(input);
}

Command.prototype.PrompParser = function (prompt) {
    if (prompt.length > 1) {
        this.name = prompt.substring(1).trim();
        this.prompt = this.name;
    }
}

Command.prototype.displayCommand = function (terminal, commands, cmd) {
    var autocompletions = [];
    for (let key in commands) {
        if (key == cmd) {
            terminal.input.val(terminal.input.val() + cmd + " ");
            let cmdInstance = this.getCmdInstance(commands[key]);
            if (cmdInstance && cmdInstance.hasOwnProperty('subCmds')) {
                let subCmd = this.content.length > 0 ? this.content.shift() : '';
                this.displayCommand(terminal, cmdInstance.subCmds, subCmd);
            } else if (this.content.length > 0) {
                terminal.input.val(terminal.input.val() + this.content.join(' '));
            }
            break;
        } else if (key.startsWith(cmd)) {
            autocompletions.push(key);
        }
    }
    if (autocompletions.length == 1) {
        terminal.input.val(terminal.input.val() + autocompletions[0] + " ");
    } else if (autocompletions.length > 1) {
        terminal.displayOutput(autocompletions.join(', '));
        terminal.input.val(this.input);
    }
}

Command.prototype.GetInputArgs = function () {
    return {
        input: this.input,
        cmd: this.name,
        options: this.options,
        content: this.content,
        prompt: this.prompt
    }
}

Command.prototype.TabCompleteSystem = function (terminal) {
    terminal.input.val('');
    this.displayCommand(terminal, terminal.all_commands, this.name);
}

Command.prototype.TabComplete = function (terminal, from_remote) {
    var self = this;
    var cmdInstance = this.getCmdInstance(terminal.all_commands[this.name]);
    if (cmdInstance && typeof cmdInstance.TabComplete == 'function') {
        // 判断命令是当前页面执行还是远端执行
        if (!from_remote && cmdInstance.hasOwnProperty('config') && cmdInstance.config.hasOwnProperty('site')) {
            api_send_message({
                type: 'exec-remote-tab',
                config: cmdInstance.config,
                item: {
                    'showType': 'background',
                    'input': self.input,
                },
                callback: function (result) {
                    var message = result && result.hasOwnProperty('data') ? result.data : [];
                    terminal.displayOutput(terminal.formateOutput(message, from_remote));
                    terminal.input.val(self.input);
                }
            });
        } else {
            var result = cmdInstance.TabComplete(this.GetInputArgs());
            terminal.input.val(self.input);
            return result;
        }
    }
    return [];
}

Command.prototype.getCmdInstance = function (cmdDefine) {
    let cmdInstance = null;
    try {
        if (typeof cmdDefine == 'function') {
            cmdInstance = (new cmdDefine());
        } else if (typeof cmdDefine == 'string' && cmdDefine.trim()) {
            cmdInstance = eval('new ' + cmdDefine + '()');
        } else {
            cmdInstance = cmdDefine;
        }
    } catch (e) { }

    return cmdInstance;
}

Command.prototype.Exec = function (terminal, from_remote, callback) {
    var self = this;
    var shown_input = this.input;
    if (terminal.input.attr('type') === 'password') {
        shown_input = new Array(shown_input.length + 1).join("•");
    }

    terminal.displayInput(shown_input);
    terminal.validator(self.name);

    let cmdInstance = self.getCmdInstance(terminal.all_commands[self.name]);
    // change simple options to normal options
    this.options = self.TransferSimpleOptions(cmdInstance);
    var exec = function (instance, exec_type) {
        // exec this cmd
        if (instance.hasOwnProperty('subCmds')) {
            if (self.content.length > 0) {
                if (instance.subCmds.hasOwnProperty(self.content[0])) {
                    let subCmd = self.content.shift();
                    return exec(instance.subCmds[subCmd], exec_type);
                }
            }
        }
        if (self.options.hasOwnProperty('help')) {
            var help = new helpCmd();
            return help.printCmdDetail('', instance);
        } else if (exec_type == 'Exec') {
            if (typeof instance.Exec == 'function') {
                let result = instance.Exec(self.GetInputArgs(), terminal);
                terminal.showInputType();
                return result;
            } else {
                terminal.displayOutput('Command without handle function.');
            }
            return null;
        } else if (exec_type == 'config') {
            return instance.hasOwnProperty('config') ? instance.config : {};
        }
        return null;
    }

    // 判断命令是当前页面执行还是远端执行
    if (!from_remote && cmdInstance.hasOwnProperty('site') && location.href.indexOf(cmdInstance.site) == -1) {
        var config = exec(cmdInstance, 'config');
        config = $.extend(cmdInstance.config, config);
        api_send_message({
            type: 'exec-remote-command',
            site: cmdInstance.site,
            config: config,
            item: {
                'showType': 'background',
                'cmds': [self.input],
            },
            callback: function (result) {
                let cmd_datas = result && result.hasOwnProperty('data') ? result.data : [];
                if (cmd_datas.length > 0) {
                    for (let i in cmd_datas) {
                        if (typeof callback == 'function') callback(cmd_datas[i]);
                    }
                } else {
                    if (typeof callback == 'function') callback([]);
                }
            }
        });
    } else {
        var res = exec(cmdInstance, 'Exec');
        if (typeof callback == 'function') callback(res);
    }

}

Command.prototype.InputParser = function (input_str) {
    let string_arr = [];
    let str = "";
    let quote = "";

    for (let i = 0; i < input_str.length; i++) {
        let chr = input_str.charAt(i);
        if (chr == " ") {
            // 如果不是引号中间出现的那么就进行分割
            if (!quote) {
                str && string_arr.push(str);
                str = "";
            } else {
                str += chr;
            }
        } else if (chr == '"' || chr == "'" || chr == "`") {
            // 如果是开头，则开始对字符串进行包裹
            if (!quote && str == "") {
                quote = chr;
            } else if (quote && quote == chr && input_str.charCodeAt(i - 1) != 92) {  // 如果是结尾
                str && string_arr.push(str);
                quote = "";
                str = "";
            } else {
                str += chr;
            }
        } else {
            str += chr;
        }
    }
    str && string_arr.push(str);

    // console.log(string_arr);
    let args = Minimist(string_arr);
    for (let opt in args) {
        if (opt != '_') {
            this.options[opt] = args[opt];
        } else {
            if (args['_'].length > 0) {
                // confirm the prompt has be setted
                if (args['_'][0].startsWith('$')) {
                    this.name = args['_'][0].substring(1);
                    args['_'].splice(0, 1);
                } else if (!this.name) {
                    this.name = args['_'][0];
                    args['_'].splice(0, 1);
                }

                this.content = args['_'];
            }
        }
    }
}

Command.prototype.TransferSimpleOptions = function (cmdInstance, index) {
    index = typeof index == 'number' ? index : 0;
    var newOptions = {};
    if (this.content.length > index && cmdInstance.hasOwnProperty('subCmds') && cmdInstance.subCmds.hasOwnProperty(this.content[index])) {
        newOptions = this.TransferSimpleOptions(cmdInstance.subCmds[this.content[index]], ++index);
    } else {
        for (let inputOption in this.options) {
            var find = false;
            if (cmdInstance.hasOwnProperty('options')) {
                for (let configOption in cmdInstance.options) {
                    if (configOption == inputOption || (cmdInstance.options[configOption].hasOwnProperty('simple') &&
                        cmdInstance.options[configOption].simple == inputOption)) {
                        if (cmdInstance.options[configOption].hasOwnProperty("default") && this.options[inputOption] === true) {
                            newOptions[configOption] = cmdInstance.options[configOption].default;
                        } else {
                            newOptions[configOption] = this.options[inputOption];
                        }
                        find = true;
                        break;
                    }
                }
            }
            if (!find) {
                newOptions[inputOption] = this.options[inputOption];
            }
        }
        // if empty options and then use default option
        if (JSON.stringify(newOptions) === '{}' && cmdInstance.hasOwnProperty("defaultOption")) {
            newOptions[cmdInstance.defaultOption] = true;
        }
    }

    // parse option value
    var configOption = cmdInstance.hasOwnProperty('options') ? cmdInstance.options : {};
    for (var opt in newOptions) {
        if (configOption.hasOwnProperty(opt) && configOption[opt].hasOwnProperty('dataType')) {
            switch (configOption[opt].dataType) {
                case 'bool':
                    if (!newOptions[opt] || ["false", "0"].indexOf(newOptions[opt]) > -1) {
                        newOptions[opt] = false;
                    } else {
                        newOptions[opt] = true;
                    }
                    break;
            }
        }
    }

    // check the required option
    for (let opt in cmdInstance.options) {
        if (getPropertyVal(cmdInstance.options[opt], "required")) {
            if (!newOptions.hasOwnProperty(opt)) {
                throw 'Parameter <code>' + opt + '</code> is required.';
            }
        }
    }

    return newOptions;
}

