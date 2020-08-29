# web-terminal Web终端
### Web Terminal 是一个web终端，类似Linux shell，你可以使用js来编写脚本处理一些自动化任务，js能够操控任何隔离的web资源。同时我们提供了一些有效的命令来帮助你提升工作效率，而且你也可以自定义一些命令来完成个性化需求，同时你也可以添加第三方提供的命令，虽然第三方库还很少，但这一切都是个很好的开始，期待你能把自己写的命令提交到 [cmdhub](https://github.com/web-terminal/cmdhub) 仓库共享给其他人。
好了我们开始瞧瞧有哪些惊艳的功能吧。
## 安装
[chrome插件](https://chrome.google.com/webstore/detail/webterminal/djnneaagmekpmmbmeicecdkgcnkcnhle)
期待给个好评鼓励一下。  
如果你的网络无法访问chrome应用商店，可以本地安装  

## 开始
安装成功后通过`ctrl + shift + 0`可以打开web终端，同时你也可以在任一有效的网页中在任一新打开的网站中（安装前打开的页面需要重新刷新才能生效）都可以通过`双击Ctrl`键调起命令行窗口，通过相同的操作可以关闭窗口。

![](https://github.com/web-terminal/web-terminal/blob/master/js-command.gif)

## 命令行使用
命令行的格式和linux几乎一致，空格是一个重要的分隔符，如果输入的参数中包含空格，那么建议使用`` ` ` ``将字符串包装 `` cron `* * * * * *` `js console.log('hello web terminal');` -a ``

## 命令

### help
首先你会使用 `help` 或则 `ls` 查看有哪些可用的命令。  
如果你想查看某个命令如何使用可以使用`help [command]`

示例  
 - `help` 查看所有可用的命令.
 - `help js` 查看js命令使用文档.  
-c --current 当前页面   
-c 代表参数简称  
--current 代表参数全称  
``js `alert('hello web terminal.')` -c`` 等价于  ``js `alert('hello web terminal.')` --current``  

### js
js命令允许你在指定的页面执行一段js代码或者一个远程的js文件，这将会非常有用，也就是你能够通过js命令操作任何一个页面的内容。js命令已经原生支持jquery能力，能够帮助你很轻松的操作页面dom。如果再结合cron命令，就可以实现一些自动化任务的需求了。

示例  
- ``js `var a = "hello web-terminal"; alert(a);` ``  
将会在当前页面执行这段代码。

- ``js `var a = "hello web-terminal"; alert(a);` -u http://www.github.com``  
将会自动跳转到github页面中执行这段代码。

- `js https://buttons.github.io/buttons.js -f`  
在当前页面执行远程buttons.js文件。

- ``js `$("body").text();` ``  
获取页面文本内容。

### cron
cron可以帮助你创建定时任务

``cron `* * * * * *` 'js `console.log("hello web-terminal!");`' -a``
上面这个命令将会创建一个每秒执行`` js `console.log("hello web-terminal!");` ``的任务。

- -l --list 查看任务列表，通过 `cron -l` 或者 `cron --list` 可以展示所有的定时任务
- -a --add 添加定时任务指令，示例 ``cron `00 * * * * *` `js console.log(123);` -a`` 此命令将添加一条每分钟执行 `js console.log(123);` 的定时任务。
- -D --delete 删除一条定时任务，示例 `cron 4f0wr4ynbs80 -D` 删除一条ID为4f0wr4ynbs80的定时任务
- -s --showType 展示类型，background(后台)和frontend(前台)，示例: `cron 4f0wr4ynbs80 -s background` 设置定时任务将在指定页面的后台运行
- -o --openType 打开类型，auto-open(自动打开)和open-only(仅打开才执行)，示例: `cron 4f0wr4ynbs80 -o auto-open` 设置定时任务自动打开页面执行任务
- -e --enabled 启用状态，可选值(0, 1)，示例 `cron 4f0wr4ynbs80 -e 0` 禁用定时任务
- -u --url 宿主url，示例 `cron 4f0wr4ynbs80 -u http://www.google.com` 设置定时任务在google页面上执行
- -r --rule 定时器规则，示例 `cron 4f0wr4ynbs80 -r `01 * * * * *` `` 了解更多关于定时器规则 [wiki](https://en.wikipedia.org/wiki/Cron)，crontab精确到分钟，此处精确到秒
- -c --command 任务执行的命令，示例 ``cron 4f0wr4ynbs80 -c `time -t` `` 修改任务执行的命令

### curl
如果你习惯了使用linux curl，那么浏览器端使用curl也一定是你需要的功能，使用方式和linux端大致相同，但只支持常用的参数，正常的需求基本能够满足。  

示例： `` curl http://api.xxx.com -u username:password -d `{"field": "value"}` -i `` 或者 `` curl http://api.xxx.com -u username:password -d k1=v1&k2=v2&k3=v3 -i ``  
-u --user 设置请求账号密码，格式 `-u test:test`  
-H --header 设置请求头部信息，格式 `-H header1:v1 -H header2:v2`
-G --get 设置Get请求，例如 `curl http://api.xxx.com -G`  
　 --timeout 设置超时时间，`curl http://api.xxx.com --timeout`  
-d --data 设置Post数据，格式 ``-d `{"k1":v1,"k2":"v2"}` `` 或则 `` -d `k1=v1&k2=v2` ``  
-i --include 将请求头部信息、发送数据、以及返回结果打印出来，例如 `curl http://api.xxx.com -i`  

### time
作为开发人员时刻需要获取当前时间戳，或者将时间戳格式化，这个命令将能够帮到你。  

示例： `` time `2020-07-04 14:00:00` -t  ``  
-t --timestamp 获取时间戳，精度到秒，例如 ``time `2020-07-04 14:00:00` -t``  
-m --microtimestamp 获取时间戳，精度到微秒，例如 `` time `2020-07-04 14:00:00` -m ``  
-d --date 时间格式化，默认格式YYYY-mm-dd HH:ii:ss，例如 `` time `1593842041976` -d`` 

### browser
浏览器相关的命令，包含子命令：tabs， bookmark，history，notice  
#### tabs
`browser tabs` 查看浏览器已打开的tab  
`` browser tabs `query` `` 匹配tab标题包含query关键字的tab
#### bookmark
`browser bookmark` 查看浏览器最近书签  
`` browser bookmark `query` `` 匹配书签标题或url包含query关键字的书签  
#### history
`browser history` 查看24小时内的浏览记录 
`` browser history `query` `` 匹配24小时内标题或url包含query关键字的历史记录  
#### notice
``browser notice -t basic -i https://developer.chrome.com/webstore/images/reader.png -T `It's test title` -m `main message` -M `content message` `` 执行这个命令后看看会发生什么。 

-t --type 指定通知展示的类型，选项包含(basic, image, list, progress)  
-i --icon Url 发送者头像url，URL可以是数据URL，也可以是Blob URL  
-T --title 通知标题  
-m --message 通知消息主要内容.
-M --context 带有小字体的消息备用通知内容  

### cmd
命令管理工具，通过这个命令使得你可以添加第三方命令或自定义命令，

#### 第三方命令
目前第三方命令统一托管在github [cmdhub](https://github.com/web-terminal/cmdhub) 仓库，添加第三方命令前请确保你的网络能够正常访问github。

示例：添加 qqdoc 命令 
1. `cmd add qqdoc` 添加qqdoc命令.
2. `cmd update qqdoc` 更新qqdoc至最新版本.
3. `cmd delete qqdoc` 删除qqdoc命令.
4. `cmd custom mycommand commandcode ` 添加自定义命令

它是如何运作的  
添加命令成功后，web-terminal 会自动向所有的页面注入命令包含的代码，然后通过终端输入的命令及参数来激活命令，命令可以包含子命令，子命令也可以继续包含子命令，每个命令都有一个执行入口，下面通过示例来讲解。

```
首先命令的命名有个固定的格式即 *Cmd
var qqdocCmd = function() {
    var self = this;
    // 命令的描述信息， help qqdoc 会将描述信息展示给使用者
    this.desc = 'qqdoc commands';
    // 命令依附的站点
    this.site = 'https://docs.qq.com';
    // 命令的配置信息
    this.config = {
        match_url: 'https://docs.qq.com/desktop*',  // 匹配url的规则
        login_url: 'https://docs.qq.com/desktop/',  // 登录url，当你需要在登录后的页面执行命令代码时，如果session过期将会自动跳转到登录页面让用户确认登录
        exec_all_match_url: false,  // 是否在所有匹配的url中执行命令，默认false 仅在匹配的第一个页面执行命令
        auto_open: true, // 是否自动打开
        active_url: false,  // 是否自动激活url tab标签
    };
    // 命令执行入口 
    this.Exec = function(command) {
        return self.subCmds.ls.Exec(command);;
    }
    // 子命令 qqdoc cd ...
    this.subCmds = {
        cd: {
            desc: '切换文件夹或打开文件',
            Exec: function(command) {
                if (command.content.length > 0) {
                    var command_list = [];
                    folders = command.content[0].split('/');
                    folders.forEach((folder) => {
                        command_list.push("qqdoc open " + folder);
                    });
                    return {
                        type: 'command-list',
                        data: command_list
                    }
                } else {
                    return {type: 'html-text', data: 'Please enter sub-folders, use / split between folders.'};
                }
            }
        },
        open: {
            Exec: function(command) {
                if (command.content.length > 0) {
                    var sub = command.content[0].replace('#', '');
                    if (isNumber(sub)) {
                        $('#list-content').find('.list-item:eq('+(parseInt(sub)-1)+') a.item-name-title:first')[0].click();
                    } else if (sub.startsWith('..')) {
                        var len = sub.split('..').length;
                        var current = $('.doclist-content .breadcrumbs-item:last');
                        while(len > 1) {
                            current = current.prev();
                            len--;
                        }
                        current.find('a')[0].click();
                    } else {
                        $('#list-content').find('.list-item a.item-name-title[title="'+command.content[0]+'"]')[0].click();
                    }
                }
            }
        },
        pwd: {
            Exec: function(command) {
                var str = '/';
                $('.doclist-content .breadcrumbs-item').each(function() {
                    str += $(this).find('a').text()+'/';
                });
                return {type: 'html-text', data: str};
            }
        },
        ls: {
            Exec: function(command) {
                if (command.content.length > 0) {
                    var command_data = self.subCmds.cd.Exec(command);
                    command_data.data.push('qqdoc ls');
                    return command_data;
                } else {
                    var list = [];
                    var listContent = $('#list-content').find('.list-item');
                    if (listContent.length > 0) {
                        $('#list-content').find('.list-item').each(function(i) {
                            list.push({
                                title: '#'+(i+1)+' '+$(this).find('.item-name-title').text()+($(this).attr('data-listinfotype') == 2 ? '/' : ''),
                            });
                        });
                    } else {
                        list.push({
                            title: 'please login <a target="_blank" href="'+self.config.login_url+'">docs.qq.com</a> and then try again.',
                        });
                        window.close();
                    }
                    
                    return {type: 'data-list', data: list};
                }
            }
        },
        create: {
            subCmds: {
                doc: {
                    Exec: function() {
                        $('.new-doc-item[aria-label="在线文档"]')[0].click();
                    }
                },
                xls: {
                    Exec: function() {
                        $('.new-doc-item[aria-label="在线表格"]')[0].click();
                    }
                },
                ppt: {
                    Exec: function() {
                        $('.new-doc-item[aria-label="在线幻灯片"]')[0].click();
                    }
                },
                coll: {
                    Exec: function() {
                        $('.new-doc-item[aria-label="在线收集表"]')[0].click();
                    }
                },
            }
        }
    };
    this.TabComplete = function(command) {
        if (command.content.length > 0) {
            var subCmd = command.content.shift();
            switch (subCmd) {
                case 'ls':
                case 'cd':
                    return self.subCmds.ls.Exec(command);
                case 'pwd':
                    return self.subCmds.pwd.Exec(command);
                case 'open':
                    return self.subCmds.ls.Exec(command);
                default:
                    break;
            }
        }
    };
}
```
