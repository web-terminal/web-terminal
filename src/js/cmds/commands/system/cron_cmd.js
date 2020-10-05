var cronCmd = function() {
    this.options = {
        list: {
            simple: "l",
            desc: "Useage: <code>cron -l</code> show all the crontab tasks"
        },
        add: {
            simple: "a",
            desc: "Useage: <code>cron `00 * * * * *` `js console.log(123);` -a</code> Add a new contab task"
        },
        delete: {
            simple: "D",
            desc: "Useage: <code>cron 4f0wr4ynbs80 -D</code> delete the specified contab task"
        },
        showType: {
            simple: "s",
            desc: "Useage: <code>cron 4f0wr4ynbs80 -s background</code> Update the show type when cron job excute. the options is background or frontend."
        },
        openType: {
            simple: "o",
            desc: "Useage: <code>cron 4f0wr4ynbs80 -o auto-open</code> Update the show type when cron job excute. the option is auto-open, open-only, finished-close."
        },
        enabled: {
            simple: "e",
            desc: "Useage: <code>cron 4f0wr4ynbs80 -e 0</code> Update the enabled status. the options is 0 or 1"
        },
        url: {
            simple: "u",
            desc: "Useage: <code>cron 4f0wr4ynbs80 -u http://www.google.com</code> Update the host page url address."
        },
        rule: {
            simple: "r",
            desc: "Useage: <code>cron 4f0wr4ynbs80 -r `01 * * * * *`</code> Update the rule of cron."
        },
        command: {
            simple: "c",
            desc: "Useage: <code>cron 4f0wr4ynbs80 -c `time -t`</code> Update the executor command."
        },
    }
    this.desc = "Useage: <code>cron `*/3 * * * * *` \"js `console.log('hello WebTerminal!')`\" -a</code>";
    this.defaultOption = "list";
    this.Exec = function(command, cmdwin) {
        if (command.options.hasOwnProperty("list")) {
            api_send_message({
                type: "cron-job",
                options: {
                    type: "list"
                },
                callback: function(msg) {
                    let cronJobs = msg.data;
                    if (JSON.stringify(cronJobs) == '{}') {
                        cmdwin.displayOutput("You haven't added cron tasks.")
                    } else {
                        let showStr = '<table width="100%"><tr><th>id</th><th>rule</th><th>cmds</th><th>enabled</th><th>showType</th><th>openType</th></tr>';
                        for (let id in cronJobs) {
                            showStr += '<tr title="'+cronJobs[id]['url']+'"><td>'+id+'</td>';
                            showStr += '<td>'+cronJobs[id]['rule']+'</td>';
                            showStr += '<td>'+cronJobs[id]['cmds'].join('<br/>')+'</td>';
                            showStr += '<td>'+cronJobs[id]['enabled']+'</td>';
                            showStr += '<td>'+cronJobs[id]['showType']+'</td>';
                            showStr += '<td>'+cronJobs[id]['openType']+'</td>';
                            // showStr += '<td>'+cronJobs[id]['times']+'</td>';
                            showStr += '</tr>';
                        }
                        showStr += '</table>'
                        cmdwin.displayOutput(showStr);
                    }
                }
            });
        } else if (command.options.hasOwnProperty("add")) {
            var cronRule = command.content[0];
            command.content.splice(0, 1)
            var options = {
                type: "add",
                rule: cronRule,
                cmds: command.content
            }
            if (command.options.hasOwnProperty('showType') && ["background", "frontend"].indexOf(command.options.showType) > -1) {
                options['showType'] = command.options.showType
            }
            if (command.options.hasOwnProperty('openType') && ["auto-open", "only-open", "finished-close"].indexOf(command.options.openType) > -1) {
                options['openType'] = command.options.openType
            }
            if (command.options.hasOwnProperty('url')) {
                options['url'] = command.options.url
            }
            // console.log("add cron:", cronRule, command.content)
            api_send_message({
                type: "cron-job",
                options: options,
                callback: function(msg) {
                    cmdwin.handleInput('cron -l');
                }
            });
        } else if (command.options.hasOwnProperty("delete")) {
            let id = command.options.delete;
            if (typeof id == "boolean") id = command.content[0];
            api_send_message({
                type: "cron-job",
                options: {
                    type: "delete",
                    id: id
                },
                callback: function(msg) {
                    cmdwin.handleInput('cron -l');
                }
            });
        } else {
            var options = {
                type: "update"
            }
            if (command.content.length > 0) {
                options['id'] = command.content[0];
            }
            if (command.options.hasOwnProperty('enabled')) {
                options['enabled'] = command.options.enabled ? true : false;
            }
            if (command.options.hasOwnProperty('showType') && ["background", "frontend"].indexOf(command.options.showType) > -1) {
                options['showType'] = command.options.showType;
            }
            if (command.options.hasOwnProperty('openType') && ["auto-open", "only-open", "finished-close"].indexOf(command.options.openType) > -1) {
                options['openType'] = command.options.openType;
            }
            if (command.options.hasOwnProperty('url') && isURL(command.options.url)) {
                options['url'] = command.options.url;
            }
            if (command.options.hasOwnProperty('rule')) {
                options['rule'] = command.options.rule;
            }
            if (command.options.hasOwnProperty('command')) {
                options['cmds'] = typeof command.options.command == 'string' ? [command.options.command] : command.options.command;
            }

            api_send_message({
                type: "cron-job",
                options: options,
                callback: function(msg) {
                    cmdwin.handleInput('cron -l');
                }
            });
        }
    }
}