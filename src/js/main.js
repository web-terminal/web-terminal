window.TerminalWin = new TerminalWin({
    selector: $('#WebTerminalMainWin'),
    history_id: 'interface',
});

api_runtime_on_message_listener((msg, sender, response) => {
    if (sender.origin == "null") {
        messageHandle(msg, sender, response);
    }
});