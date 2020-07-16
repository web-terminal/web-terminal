function messageHandle(msg, sender, callback) {
    let result = "";
    try {
        // First, validate the message's structure.
        if (msg.type == 'js') {
            for (let i in msg.content) {
                // trim
                let code = msg.content[i].replace(/(^\s*)|(\s*$)/g, "");
                console.log(code);
                result = eval(code);
            }
        } else if (msg.type === 'selector') {
            let selectorId = msg.options.hasOwnProperty('selector') ? msg.options['selector'] : msg.content[0];
            let selector = $(selectorId);
            // fill or get content
            if (msg.options.hasOwnProperty("value")) {
                if (typeof msg.options.value == "boolean") {
                    result = selector.val()
                    // console.log("result:", result);
                } else {
                    result = selector.val(msg.options.value)
                }
            } else if (msg.options.hasOwnProperty("text")) {
                if (typeof msg.options.text == "boolean") {
                    result = selector.text()
                } else {
                    result = selector.text(msg.options.text)
                }
            } else if (msg.options.hasOwnProperty("html")) {
                if (typeof msg.options.html == "boolean") {
                    result = selector.html()
                } else {
                    result = selector.html(msg.options.html)
                }
            }
            // css event
            if (msg.options.hasOwnProperty("css")) {
                if (msg.options.css.startsWith("{")) {
                    result = selector.css(JSON.parse(msg.options.css))
                } else {
                    result = selector.css(msg.options.css)
                }
            }
            // attr event
            if (msg.options.hasOwnProperty("attr")) {
                if (msg.options.attr.startsWith("{")) {
                    result = selector.attr(JSON.parse(msg.options.attr))
                } else {
                    result = selector.attr(msg.options.attr)
                }
            }
            if (msg.options.hasOwnProperty("removeAttr")) {
                result = selector.removeAttr(msg.options.removeAttr)
            }
            // prop event
            if (msg.options.hasOwnProperty("prop")) {
                if (msg.options.prop.startsWith("{")) {
                    result = selector.prop(JSON.parse(msg.options.prop))
                } else {
                    result = selector.prop(msg.options.prop)
                }
            }
            if (msg.options.hasOwnProperty("removeProp")) {
                result = selector.removeProp(msg.options.removeProp)
            }
            // class event
            if (msg.options.hasOwnProperty("addClass")) {
                result = selector.addClass(msg.options.addClass)
            }
            if (msg.options.hasOwnProperty("removeClass")) {
                if (typeof msg.options.removeClass == "boolean") {
                    result = selector.removeClass()
                } else {
                    result = selector.removeClass(msg.options.removeClass)
                }
            }
            // trigger event
            if (msg.options.hasOwnProperty("trigger")) {
                result = selector.trigger(msg.options['trigger'])
            }
        } else if (msg.type == "toggleCmdWin") {
            toggleCmdWin();
        } else if (msg.type == "messageCallback") {
            api_message_callback(msg);
        } else if (msg.type == 'cron-job') {
            let item = msg.item;
            if (!window.shadowRoot) {
                toggleCmdWin();
            }
            if (item.showType == 'background') {
                toggleCmdWin();
            }
            if (item.cmds.length > 0) {
                item.cmds.forEach(cmd => {
                    window.TerminalWin.autofill = window.TerminalWin.input.val();
                    window.TerminalWin.handleInput(cmd);
                });
            }
        }
    } catch (error) {
        result = "Error : "+error
        console.log(result);
    }
    
    callback(result);
}

function toggleCmdWin() {
    if (window.shadowRoot) {
        $(window.shadowRoot).find('#WebTerminalMainWin').toggle();
        window.TerminalWin.focusOnInput();
    } else {
        (typeof showCmdWin != 'undefined') && showCmdWin();
    }
}