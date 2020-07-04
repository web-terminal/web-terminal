window.shadowRoot = null;
window.TerminalWin = null;
function initCmdWin() {
    let shadowHost = document.createElement('div');
    shadowHost.setAttribute('id', 'webTerminal-shadowRoot');
    shadowRoot = shadowHost.attachShadow({mode: 'closed'});
    let style = '<style>#WebTerminalMainWin {width:60%;height:70%;position:fixed;top:15%;left:20%;z-index:10000;}</style>'
    if (shadowRoot) {
        $(shadowRoot).append('<link rel="stylesheet" type="text/css" href="'+api_getURL("css/cmd.css")+'">')
        $(shadowRoot).append(style)
    }
    
    document.body && document.body.appendChild(shadowHost);
}
function showCmdWin() {
    if (!shadowRoot) {
        initCmdWin();
    }
    $(shadowRoot).append('<div id="WebTerminalMainWin" style="display:block;"></div>');
    TerminalWin = new TerminalWin({
        selector: $(shadowRoot).find('#WebTerminalMainWin'),
        history_id: 'interface'
    });
}

api_runtime_on_message_listener((msg, sender, response) => {
    console.log(msg);
    messageHandle(msg, sender, response);
});

$(function() {
    var dblCtrlKey = 0;
    $(document).on('keydown', function(event) {
        if (event.keyCode == 91 || event.ctrlKey) {
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
