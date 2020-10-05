var jsCmd = function() {
    this.options = {
        current: {
            simple: ["c"],
            desc: "Useage: <code>js `alert('hello web terminal.')` -c</code> Or <code>js `alert('hello web terminal.')`</code> to exec js code at the current page."
        },
        url: {
            simple: "u",
            desc: "Useage: <code>js `alert('hello web terminal.')` -u https://www.google.com</code> to exec js code at the specified url page."
        },
        active_tab: {
            simple: "a",
            dataType: 'bool',
            desc: "Useage: <code>js `alert('hello web terminal.')` -u https://www.google.com -a</code> to exec js code at the specified url page and active this page tab."
        },
        file: {
            simple: "f",
            desc: "Useage: <code>js https://buttons.github.io/buttons.js -f</code> to exec js file at the specified page."
        }
    }
    this.desc = "This command is very powerful. you can use javascript code to finish your task, and jquery also be supported. eg: <code>js `$('#name').val('ok')` `var a = 1;` `alert(a);`</code>"
    this.Exec = (command, cmdwin) => {
        let execjs = function(content) {
            api_send_message({
                type: "js",
                options: command.options,
                content: content,
                feed_data: cmdwin.feed_data,
                callback: function(msg) {
                    cmdwin.displayOutput(msg.response);
                }
            });
        }
        if (command.options.hasOwnProperty('file')) {
            let url = isURL(command.options.file) ? command.options.file : command.content[0];
            if (isURL(url)) {
                let ajaxConfig = {
                    url: url,
                    type: 'GET',
                    async: true,
                    dataType: 'text'
                }
                api_send_message({
                    type: 'ajax-request', 
                    config: ajaxConfig,
                    callback: function(res) {
                        execjs([res.data.xhr.responseText]);
                    }
                });
            }
        } else {
            execjs(command.content);
        }
        
    }
}