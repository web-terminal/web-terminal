// 初始化cron
var cronJobStacks = {};
var cronJobMaps = {};
api_storage_sync_get("cron-jobs", function(results) {
    if (results.hasOwnProperty("cron-jobs")) {
        cronJobMaps = results["cron-jobs"];
        for (let id in cronJobMaps) {
            if (cronJobMaps[id].enabled) {
                cronItemRunStart(cronJobMaps[id]);
            }
        }
    }
});

function addCronItem(taburl, options) {
    // 对url去除锚点
    let archPos = taburl.indexOf('#');
    if (taburl.indexOf('#') > 0) {
        taburl = taburl.substring(0, archPos)
    }
    let item = {
        id: getUID(),
        rule: options.rule,
        cmds: options.cmds,
        url: taburl,
        openType: options.hasOwnProperty('openType') ? options.openType : "auto-open",  // auto-open, open-only 
        showType: options.hasOwnProperty('showType') ? options.showType : "frontend", // background, frontend
        enabled: true,  // true, false
        times: 0
    }
    cronJobMaps[item.id] = item;
    cronItemRunStart(item);
    api_storage_sync_set({"cron-jobs": cronJobMaps});
}
function updateCronItem(options) {
    if (options.hasOwnProperty('id') && cronJobMaps.hasOwnProperty(options.id)) {
        let id = options.id;
        if (options.hasOwnProperty('rule')) {
            cronJobMaps[id]['rule'] = options.rule;
            cronItemRunStop(cronJobMaps[id]);
            if (!options.hasOwnProperty('enabled'))
                options['enabled'] = cronJobMaps[id]['enabled'];
        }
        if (options.hasOwnProperty('cmds')) cronJobMaps[id]['cmds'] = options.cmds;
        if (options.hasOwnProperty('showType')) cronJobMaps[id]['showType'] = options.showType;
        if (options.hasOwnProperty('openType')) cronJobMaps[id]['openType'] = options.openType;
        if (options.hasOwnProperty('enabled')) {
            cronJobMaps[id]['enabled'] = options.enabled;
            if (options.enabled) {
                cronItemRunStart(cronJobMaps[id]);
            } else {
                cronItemRunStop(cronJobMaps[id]);
            }
        }
        api_storage_sync_set({"cron-jobs": cronJobMaps});
    }
}
function removeCronItem(options) {
    if (options.hasOwnProperty('id')) {
        cronItemRunStop(cronJobMaps[options.id]);
        delete cronJobMaps[options.id];
        api_storage_sync_set({"cron-jobs": cronJobMaps});
    }
}
function cronItemRunStart(item) {
    if (!item.enabled || cronJobStacks.hasOwnProperty(item.id)) return false;
    cronJobStacks[item.id] = {};
    try {
        let openTabToConnect = function(tab) {
            if (!tab) {
                if (item.openType == "auto-open") {
                    api_tab_create(item.url, function(tab) {
                        cronJobStacks[item.id]['tab'] = tab;
                        waitTabComplete(tab, 300, function(tab) {
                            item.times++;
                            api_send_tab_message(tab.id, {type: "remote-command-run", item: item})
                        });
                    });
                }
            } else {
                // console.log("api_send_tab_message", tab, {type: "remote-command-run", item: item});
                item.times++;
                api_send_tab_message(tab.id, {type: "remote-command-run", item: item})
            }
        }

        cronJobStacks[item.id]['job'] = new CronJob(item.rule, function() {
            if (cronJobStacks[item.id].hasOwnProperty('tab')) {
                api_tab_get(cronJobStacks[item.id].tab.id, function(tab) {
                    openTabToConnect(tab);
                });
            } else {
                api_tab_query({url: item.url}, function(tabs) {
                    openTabToConnect(tabs && tabs.length > 0 ? tabs[0] : null);
                });
            }
        });
    } catch (error) {
        console.log(error)
    }
}

function cronItemRunStop(item) {
    if (cronJobStacks.hasOwnProperty(item.id) && cronJobStacks[item.id].hasOwnProperty('job')) {
        cronJobStacks[item.id]['job'].Stop();
        item.enabled = false;
        delete cronJobStacks[item.id];
    }
}