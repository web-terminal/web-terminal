function messageHandle(msg, sender, response) {
    let result = "";
    try {
        // First, validate the message's structure.
        if (msg.type == 'js') {
            for (let i in msg.content) {
                // trim
                let code = msg.content[i].replace(/(^\s*)|(\s*$)/g, "");
                result = eval(code);
            }
        } else if (msg.type === 'selector') {
            let selector = $(msg.options['selector']);
            // fill or get content
            if (msg.options.hasOwnProperty("value")) {
                if (typeof msg.options.value == "boolean") {
                    result = selector.val()
                    console.log("result:", result);
                } else {
                    selector.val(msg.options.value)
                }
            } else if (msg.options.hasOwnProperty("text")) {
                if (typeof msg.options.text == "boolean") {
                    result = selector.text()
                } else {
                    selector.text(msg.options.text)
                }
            } else if (msg.options.hasOwnProperty("html")) {
                if (typeof msg.options.html == "boolean") {
                    result = selector.html()
                } else {
                    selector.html(msg.options.html)
                }
            }
            // css event
            if (msg.options.hasOwnProperty("css")) {
                if (msg.options.css.startWith("{")) {
                    selector.css(JSON.parse(msg.options.css))
                } else {
                    result = selector.css(msg.options.css)
                }
            }
            // attr event
            if (msg.options.hasOwnProperty("attr")) {
                if (msg.options.attr.startWith("{")) {
                    selector.attr(JSON.parse(msg.options.attr))
                } else {
                    result = selector.attr(msg.options.attr)
                }
            }
            if (msg.options.hasOwnProperty("removeAttr")) {
                selector.removeAttr(msg.options.removeAttr)
            }
            // prop event
            if (msg.options.hasOwnProperty("prop")) {
                if (msg.options.prop.startWith("{")) {
                    selector.prop(JSON.parse(msg.options.prop))
                } else {
                    result = selector.prop(msg.options.prop)
                }
            }
            if (msg.options.hasOwnProperty("removeProp")) {
                selector.removeProp(msg.options.removeProp)
            }
            // class event
            if (msg.options.hasOwnProperty("addClass")) {
                selector.addClass(msg.options.addClass)
            }
            if (msg.options.hasOwnProperty("removeClass")) {
                if (typeof msg.options.removeClass == "boolean") {
                    selector.removeClass()
                } else {
                    selector.removeClass(msg.options.removeClass)
                }
            }
            // trigger event
            if (msg.options.hasOwnProperty("trigger")) {
                selector.trigger(msg.options['trigger'])
            }
        } else if (msg.type == "toggleCmdWin") {
            toggleCmdWin();
        } else if (msg.type == "messageCallback") {
            api_message_callback(msg);
        } else if (msg.type == 'cron-job') {
            let item = msg.item;
            console.log(item);
            if (!window.shadowRoot) {
                toggleCmdWin();
            }
            if (item.showType == 'background') {
                toggleCmdWin();
            }
            if (item.cmds.length > 0) {
                item.cmds.forEach(cmd => {
                    window.TerminalWin.handleInput(cmd);
                });
            }
        }
    } catch (error) {
        result = "Error : "+error
        console.log(result);
    }
    
    response(result);
}

function toggleCmdWin() {
    if (window.shadowRoot) {
        $(window.shadowRoot).find('#WebTerminalMainWin').toggle();
        window.TerminalWin.focusOnInput();
    } else {
        (typeof showCmdWin != 'undefined') && showCmdWin();
    }
}