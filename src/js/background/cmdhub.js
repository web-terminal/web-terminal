var CmdHub = {};
function message_cmdhub(message, sender, callback) {
    let meta = {code: 200, msg: "", data: []};
    switch (message.method) {
        case 'get_cmdhub':
            meta.data = CmdHub;
            api_send_callback_message(sender, message, {meta: meta});
        break;
        case 'add':
            newCmd = message.newCmd;
            if (CmdHub.hasOwnProperty(newCmd)) {
                meta.code = 300;
                meta.msg = 'The command '+newCmd+' has exist.';
                api_send_callback_message(sender, message, {meta: meta});
            } else {
                cmdhub_get_cmd_code(newCmd, function(meta, config, code) {
                    cmdhub_update_all_tabs_cmd(newCmd);
                    api_send_callback_message(sender, message, {meta: meta});
                }, function(meta) {
                    api_send_callback_message(sender, message, {meta: meta});
                });
            }
            
        break;
        case 'update':
            newCmd = message.newCmd;
            cmdhub_get_cmd_code(newCmd, function(meta, config, code) {
                cmdhub_update_all_tabs_cmd(newCmd);
                api_send_callback_message(sender, message, {meta: meta});
            }, function(meta) {
                api_send_callback_message(sender, message, {meta: meta});
            });
        break;
        case 'delete':
            newCmd = message.newCmd;
            delete CmdHub[newCmd];
            api_storage_sync_set({'cmd:hub': CmdHub});
            meta.data = CmdHub;
            api_send_callback_message(sender, message, {meta: meta});
        break;
    }
}

function cmdhub_get_cmd_code(newCmd, successCallback, errorCallback) {
    let cmdhub_prefix = 'https://api.github.com/repos/web-terminal/cmdhub/contents/';
    let meta = {code: 200, msg: "", data: []};
    $.ajax({
        url: cmdhub_prefix+newCmd+'/cmd.json',
        type: 'GET',
        async: true,
        dataType: 'json',
        success: function(jsonData) {
            jsonData = jsonData.hasOwnProperty('content') ? JSON.parse(atob(jsonData.content)) : {};
            if (jsonData.hasOwnProperty('version')) {
                let mainFile = jsonData.hasOwnProperty('main') ? jsonData.main : 'main.js';
                // get main file
                $.ajax({
                    url: cmdhub_prefix+newCmd+'/'+mainFile,
                    type: 'GET',
                    async: true,
                    dataType: 'json',
                    success: function(fileJson) {
                        
                        let cmdset = {}
                        if (fileJson.hasOwnProperty('content')) {
                            cmdset['cmd:code:'+newCmd] = atob(fileJson.content);
                            CmdHub[newCmd] = {
                                version: jsonData.version,
                                site: jsonData.hasOwnProperty('site') ? jsonData.site : '',
                                index_func: jsonData.index_func ,
                            }

                            api_storage_sync_set({'cmd:hub': CmdHub});
                            api_storage_local_set(cmdset);
                            meta.data = CmdHub;
                            successCallback && successCallback(meta, jsonData, cmdset['cmd:code:'+newCmd]);
                        } else {
                            meta.code = 501;
                            meta.msg = fileJson.message;
                            errorCallback && errorCallback(meta, jsonData);
                        }
                    },
                    error: function(xhr) {
                        meta.code = 500;
                        meta.msg = 'Get code error. please check you have visit url '+cmdhub_prefix+newCmd+'/'+mainFile;
                        errorCallback && errorCallback(meta, jsonData);
                    }
                });
            } else {
                meta.code = 500;
                meta.msg = 'Invalid command config, unknown command version.';
                errorCallback && errorCallback(meta, jsonData);
            }
        },
        error: function(xhr) {
            meta.code = 500;
            meta.msg = 'Please check if the command you want to add is in <a target="_blank" href="https://github.com/web-terminal/cmdhub">cmdhub</a>.';
            errorCallback && errorCallback(meta, null);
        }
    });
}

function cmdhub_update_all_tabs_cmd(cmd) {
    api_tab_query({}, function(tabs) {
        for (let i in tabs) {
            if (tabs[i].url.startsWith('http')) {
                cmdhub_inject_cmd(cmd, tabs[i].id);
            }
        }
    });
}

function cmdhub_inject_cmd(cmd, tabId, callback, error) {
    let cmd_storage_key = 'cmd:code:'+cmd;
    try {
        api_storage_local_get(cmd_storage_key, function(res) {
            if (res && res.hasOwnProperty(cmd_storage_key)) {
                api_execute_script(tabId, {code: res[cmd_storage_key]}, callback);
            } else {
                cmdhub_get_cmd_code(newCmd, function(meta, config, code) {
                    api_execute_script(tabId, {code: code}, callback);
                });
            }
        });
    } catch (e) {
        typeof error == 'function' && error(e);
    }
    
}

function cmdhub_init(tabId) {
    api_storage_sync_get(['cmd:hub'], function(res) {
        if (res && res.hasOwnProperty('cmd:hub')) {
            CmdHub = res['cmd:hub'];
            for (let cmd in CmdHub) {
                cmdhub_inject_cmd(cmd, tabId);
            }
        }
    });
    
}

function cmdhub_listen_tab_loading_event(tabId, changeInfo, tab) {
    if (changeInfo.hasOwnProperty('status') && changeInfo.status == 'loading' && tab.url.startsWith('http')) {
        cmdhub_init(tabId)
    }
}