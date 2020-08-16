window.shadowRoot = null;
window.TerminalWin = null;
function initCmdWin() {
    let shadowHost = document.createElement('div');
    shadowRoot = shadowHost.attachShadow({mode: 'closed'});
    let style = '<style>#WebTerminalMainWin {width:60%;height:70%;position:fixed;top:15%;left:20%;}</style>'
    if (shadowRoot) {
        $(shadowRoot).append('<link rel="stylesheet" type="text/css" href="'+api_getURL("css/cmd.css")+'">')
        $(shadowRoot).append(style)
    }
    
    document.body && document.body.appendChild(shadowHost);
    $(shadowRoot).append('<div class="web-terminal-mask-layer" style="display:block;"></div><div id="WebTerminalMainWin" style="display:block;"></div>');
    $(shadowRoot).find('.web-terminal-mask-layer').on('click', function() {
        toggleCmdWin('hide');
    });
}
function showCmdWin() {
    if (!shadowRoot) {
        initCmdWin();
    }
    TerminalWin = new TerminalWin({
        selector: $(shadowRoot).find('#WebTerminalMainWin'),
        history_id: 'interface'
    });
}

api_runtime_on_message_listener((msg, sender, response) => {
    messageHandle(msg, sender, response);
});

$(function() {
    var dblCtrlKey = 0;
    $(document).on('keyup', function(event) {
        if (event.keyCode == 91 || event.keyCode == 17) {
            if (dblCtrlKey != 0) {
                toggleCmdWin()
            }
            dblCtrlKey++;
            setTimeout(function() {
                dblCtrlKey = 0;
            }, 300);
        }
      
    });
});
