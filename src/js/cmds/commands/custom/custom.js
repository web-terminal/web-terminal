var searchCmd = function()  {
    this.options = {
        google: {
            simple: "g",
            desc: "Use Google search engine.Useage: <code>search text -g</code> or <code>search text --google</code>",
            url: "https://www.google.com/search?q="
        },
        baidu: {
            simple: "d",
            desc: "Use Baidu search engine. Useage: <code>search text -d</code> or <code>search text --baidu</code>",
            url: "https://www.baidu.com/s?wd="
        },
        bing: {
            simple: "b",
            desc: "Use Bing search engine. Useage: <code>search text -b</code> or <code>search text --bing</code>",
            url: "https://cn.bing.com/search?q="   
        }
    };
    this.desc = "Useage: <code>search text</code> use the google as the default search engine.";
    this.defaultOption = "google";
    this.Exec = (command, cmdwin) => {
        var nums = 0;
        for (let option in command.options) {
            if (this.options.hasOwnProperty(option)) {
                nums++;
                setTimeout(() => {
                    console.log(command.content)
                    cmdwin.goToURL(encodeURI(this.options[option]['url']+command.content.join("")));
                }, nums*300);
            }
        }
    }
}

var translateCmd = function() {
    this.options = {
        google: {
            simple: "g",
            desc: "Use Google translate engine. Useage: <code>translate text -g</code> or <code>translate text --google</code>",
            url: "https://translate.google.cn/#view=home&op=translate&sl=auto&tl=auto&text="
        },
        baidu: {
            simple: "d",
            desc: "Use Baidu translate engine. Useage: <code>translate text -d</code> or <code>translate text --baidu</code>",
            url: "https://fanyi.baidu.com/#auto/auto/"
        },
        deepl: {
            simple: "l",
            desc: "Use Deepl translate engine. Useage: <code>translate text -l</code> or <code>translate text --deepl</code>",
            url: "http://deepl.com/translator#auto/auto/"
        }
    };
    this.desc = "Useage: <code>translate text</code> use the google as the default translate engine.";
    this.defaultOption = "google";
    this.Exec = (command, cmdwin) => {
        var nums = 0;
        for (let option in command.options) {
            if (this.options.hasOwnProperty(option)) {
                nums++;
                setTimeout(() => {
                    cmdwin.goToURL(encodeURI(this.options[option]['url']+command.content.join("")));
                }, nums*300);
            }
        }
        cmdwin.displayOutput("");
    }
}

var jsonCmd = function() {
    this.options = {
        "json-parser": {
            simple: "p",
            desc: "Use json-parser json engine. Useage: <code>json `{\"hello\":\"world\"}` -p</code> or <code>json `{\"hello\":\"world\"}` --json-parser</code>",
            url: "http://json.parser.online.fr/",
            selector: "#split textarea",
            triggers: [
                {
                    selector: "#split textarea",
                    trigger: "click"
                }
            ]
        },
        bejson: {
            simple: "b",
            desc: "Use bejson json engine. Useage: <code>json `{\"hello\":\"world\"}` -b</code> or <code>json `{\"hello\":\"world\"}` --bejson</code>",
            url: "https://www.bejson.com/jsonviewernew/",
            selector: "#edit",
            triggers: [
                {
                    selector: "#ext-gen45",
                    trigger: "click"
                }
            ]
        },
        jsoncn: {
            simple: "c",
            desc: "Use jsoncn json engine. Useage: <code>json `{\"hello\":\"world\"}` -c</code> or <code>json `{\"hello\":\"world\"}` --jsoncn</code>",
            url: "https://www.json.cn/",
            selector: "#json-src",
            triggers: [
                {
                    selector: "#json-src",
                    trigger: "change"
                }
            ]
        }
    };
    this.desc = "Useage: <code>json `{\"web\":\"terminal\"}`</code> use the json-parser as the default json engine.";
    this.defaultOption = "json-parser";
    this.Exec = (command, cmdwin) => {
        for (let option in command.options) {
            if (this.options.hasOwnProperty(option)) {
                let configOption = this.options[option];
                api_send_message({
                    type: "selector",
                    options: {
                        selector: configOption['selector'],
                        url: configOption['url'],
                        value: command.content.join("")
                    },
                    callback: function() {
                        if (configOption.hasOwnProperty('triggers')) {
                            for (let idx in configOption.triggers) {
                                api_send_message({
                                    type: "selector",
                                    options: {
                                        selector: configOption.triggers[idx]['selector'],
                                        url: configOption['url'],
                                        trigger: configOption.triggers[idx]['trigger']
                                    }
                                });
                            }
                        }
                    }
                });
            }
        }
        cmdwin.displayOutput("");
        
    }
}

var browserCmd = function() {
    this.subCmds = {
        bookmark: {
            desc: "Browser bookmark useage: <code>browser bookmark</code> or <code>browser bookmark 'query'</code>",
            Exec: function(command, cmdwin) {
                if (command.content.length > 0) {
                    api_send_message({
                        type: "browser-bookmarks",
                        options: {query: command.content[0], type: 'query'},
                        callback: function(msg) {
                            let results = msg.data;
                            let showStr = "<span class='green_highlight'>Search result:</span>";
                            results.forEach(element => {
                                showStr += "<div><a target='_blank' href='"+element.url+"'>"+element.title+"</a></div>";
                            });
                            cmdwin.displayOutput(showStr ? showStr : 'No result.')
                        }
                    });
                } else {
                    api_send_message({
                        type: "browser-bookmarks",
                        options: {numberOfItems: 15, type: 'getRecent'},
                        callback: function(msg) {
                            let results = msg.data;
                            let showStr = "<span class='green_highlight'>Recent 15: </span>";
                            results.forEach(element => {
                                showStr += "<div><a target='_blank' href='"+element.url+"'>"+element.title+"</a></div>";
                            });
                            cmdwin.displayOutput(showStr ? showStr : 'No result.')
                        }
                    });
                }
            }
        },
        history: {
            desc: "Browser history useage: <code>browser history</code> or <code>browser history 'query'</code>",
            Exec: function(command, cmdwin) {
                api_send_message({
                    type: "browser-history",
                    options: {text: command.content.length > 0 ? command.content[0] : '', maxResults: 20},
                    callback: function(msg) {
                        console.log("callback msg: ", msg)
                        let results = msg.data;
                        let showStr = "<span class='green_highlight'>Search result in the past 24 hours:</span>";
                        results.forEach(element => {
                            showStr += "<div><a target='_blank' href='"+element.url+"'>"+element.title+"</a></div>";
                        });
                        cmdwin.displayOutput(showStr ? showStr : 'No result.')
                    }
                });
            }
        },
        notice: {
            desc: "Browser notice useage: <code>browser notice -t basic -i https://developer.chrome.com/webstore/images/reader.png -T `It's test title` -m `main message` -M `content message`</code>",
            options: {
                type: {
                    simple: "t",
                    desc: "Which type of notification to display. type enum (basic, image, list, progress)",
                    options: ["basic", "image", "list", "progress"],
                    required: true
                },
                iconUrl: {
                    simple: "i",
                    desc: "A URL to the sender's avatar, app icon, or a thumbnail for image notifications.\
                            URLs can be a data URL, a blob URL",
                    required: true
                },
                title: {
                    simple: "T",
                    desc: "Title of the notification (e.g. sender name for email).",
                    required: true
                },
                message: {
                    simple: "m",
                    desc: "Main notification content.",
                    required: true
                },
                contextMessage: {
                    simple: "M",
                    desc: "Alternate notification content with a lower-weight font.",
                }
            },
            Exec: function(command, cmdwin) {
                // todo valid required params
                api_send_message({type: "browser-notifications", options: command.options});
                cmdwin.displayOutput("")
            }
        }
    }
}