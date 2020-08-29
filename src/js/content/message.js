function messageHandle(msg, sender, callback) {
    let result = "";
    try {
        // First, validate the message's structure.
        if (msg.type == 'selector') {
            if (!msg.options.hasOwnProperty('selector')) {
                msg.options = msg.content[0];
            }
            result = selector(msg.options);
        } else if (msg.type == "toggleCmdWin") {
            toggleCmdWin();
        } else if (msg.type == "messageCallback") {
            api_message_callback(msg);
        } else if (msg.type == 'remote-command-run') {
            let item = msg.item;
            if (!window.shadowRoot) {
                toggleCmdWin();
            }

            toggleCmdWin(item.showType == 'background' ? 'hide' : 'show');
            if (item.cmds.length > 0) {
                let data = [];
                item.cmds.forEach(cmd => {
                    window.TerminalWin.autofill = window.TerminalWin.input.val();
                    window.TerminalWin.handleInput(cmd, true, function(res) {
                        if (res) data.push(res);
                    });
                });
                result = data;
            }
        } else if (msg.type == 'remote-tab-run') {
            let item = msg.item;
            if (!window.shadowRoot) {
                toggleCmdWin();
            }

            toggleCmdWin(item.showType == 'background' ? 'hide' : 'show');
            window.TerminalWin.tab_nums = 1;
            result = window.TerminalWin.tabComplete(item.input, true);
        }
    } catch (error) {
        result = "Error : "+error
        console.log(result);
    }
    
    typeof callback == 'function' && callback(result);
}

function toggleCmdWin(show) {
    if (window.shadowRoot) {
        if (show == 'hide') {
            $(window.shadowRoot).find('#WebTerminalMainWin').hide();
            $(window.shadowRoot).find('.web-terminal-mask-layer').hide();
        } else if (show == 'show') {
            $(window.shadowRoot).find('#WebTerminalMainWin').show();
            $(window.shadowRoot).find('.web-terminal-mask-layer').show();
        } else {
            $(window.shadowRoot).find('#WebTerminalMainWin').toggle();
            $(window.shadowRoot).find('.web-terminal-mask-layer').toggle();
        }
        
        window.TerminalWin.focusOnInput();
    } else {
        (typeof showCmdWin != 'undefined') && showCmdWin();
    }
}

function selector(options) {
    var result = null;
    if (!options.hasOwnProperty('selector')) {
        return null;
    }

    let selector = $(options['selector']);
    // fill or get content
    if (options.hasOwnProperty("value")) {
        if (typeof options.value == "boolean") {
            result = selector.val()
            // console.log("result:", result);
        } else {
            result = selector.val(options.value)
        }
    } else if (options.hasOwnProperty("text")) {
        if (typeof options.text == "boolean") {
            result = selector.text()
        } else {
            result = selector.text(options.text)
        }
    } else if (options.hasOwnProperty("html")) {
        if (typeof options.html == "boolean") {
            result = selector.html()
        } else {
            result = selector.html(options.html)
        }
    }
    // css event
    if (options.hasOwnProperty("css")) {
        if (options.css.startsWith("{")) {
            result = selector.css(JSON.parse(options.css))
        } else {
            result = selector.css(options.css)
        }
    }
    // attr event
    if (options.hasOwnProperty("attr")) {
        if (options.attr.startsWith("{")) {
            result = selector.attr(JSON.parse(options.attr))
        } else {
            result = selector.attr(options.attr)
        }
    }
    if (options.hasOwnProperty("removeAttr")) {
        result = selector.removeAttr(options.removeAttr)
    }
    // prop event
    if (options.hasOwnProperty("prop")) {
        if (options.prop.startsWith("{")) {
            result = selector.prop(JSON.parse(options.prop))
        } else {
            result = selector.prop(options.prop)
        }
    }
    if (options.hasOwnProperty("removeProp")) {
        result = selector.removeProp(options.removeProp)
    }
    // class event
    if (options.hasOwnProperty("addClass")) {
        result = selector.addClass(options.addClass)
    }
    if (options.hasOwnProperty("removeClass")) {
        if (typeof options.removeClass == "boolean") {
            result = selector.removeClass()
        } else {
            result = selector.removeClass(options.removeClass)
        }
    }
    // trigger event
    if (options.hasOwnProperty("trigger")) {
        result = selector.trigger(options['trigger'])
    }

    return result;
}