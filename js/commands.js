var Command = function(input, prompt) {
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

Command.prototype.PrompParser = function(prompt) {
    if (prompt.length > 1) {
        this.name = prompt.substring(1).trim();
        this.prompt = this.name;
    }
}

Command.prototype.Exec = function(cmdwin) {
    var shown_input = this.input;
    if (cmdwin.input.attr('type') === 'password') {
        shown_input = new Array(shown_input.length + 1).join("•");
    }
    cmdwin.displayInput(shown_input);
    
    if (cmdwin.all_commands.hasOwnProperty(this.name)) {
        // console.log("this is system commands.", this.name+"Cmd");
        cmdInstance = (new cmdwin.all_commands[this.name]());
        // change simple options to normal options
        this.TransferSimpleOptions(cmdInstance);
        // exec this cmd
        cmdInstance.Exec(this, cmdwin)
        cmdwin.showInputType();
    } else {
        cmdwin.displayOutput(cmdwin.options.unknown_cmd);
    }
    return false;
}

Command.prototype.InputParser = function(input_str) {
    let string_arr = [];
    let str = "";
    let quote = "";

    for (let i=0; i<input_str.length; i++) {
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
            } else if (quote && quote == chr && input_str.charCodeAt(i-1) != 92) {  // 如果是结尾
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

Command.prototype.TransferSimpleOptions = function(cmdInstance) {
    var newOptions = {};
    for (let inputOption in this.options) {
        let subcmd = this.content.length > 0 ? this.content[0] : '';
        if (cmdInstance.hasOwnProperty('subCmds') && cmdInstance.subCmds.hasOwnProperty(subcmd)) {
            let subCmdConfig = cmdInstance.subCmds[subcmd];
            if (subCmdConfig.hasOwnProperty('options')) {
                for (let configOption in subCmdConfig.options) {
                    if (subCmdConfig.options[configOption].hasOwnProperty('simple') && 
                        subCmdConfig.options[configOption].simple == inputOption) {
                        newOptions[configOption] = this.options[inputOption];
                    }
                }
            }
        } else if (cmdInstance.hasOwnProperty('options') && !cmdInstance.options.hasOwnProperty(inputOption)) {
            for (let configOption in cmdInstance.options) {
                if (cmdInstance.options[configOption].hasOwnProperty('simple') && 
                    cmdInstance.options[configOption].simple == inputOption) {
                    newOptions[configOption] = this.options[inputOption];
                }
            }
        } else {
            newOptions[inputOption] = this.options[inputOption];
        }
    }
    // if empty options and then use default option
    if (JSON.stringify(newOptions) === '{}' && cmdInstance.hasOwnProperty("defaultOption")) {
        newOptions[cmdInstance.defaultOption] = true;
    }

    this.options = newOptions;
}

