# Web terminal
Web Terminal is a web terminal, similar to a Linux shell. You can use js to write scripts to handle some automated tasks. js can control any isolated web resources. At the same time, we provide some effective commands to help you improve your work efficiency, and you can also customize some commands to complete your personalized needs, and you can also add commands provided by third parties. Although there are still few third-party libraries, this Everything is a good start. I hope you can submit the commands you wrote to the [cmdhub](https://github.com/web-terminal/cmdhub) repository to share with others.
Well, let's start to see what amazing features are there.
## Installation
[chrome plugin](https://chrome.google.com/webstore/detail/webterminal/djnneaagmekpmmbmeicecdkgcnkcnhle)
Looking forward to giving a good comment and encouragement.
If your network cannot access the chrome app store, you can install it locally

## Start
After the installation is successful, you can open the web terminal through `ctrl + shift + 0`. At the same time, you can also open the web terminal in any valid web page (the page opened before installation needs to be refreshed to take effect). The double Ctrl key brings up the command line window, which can be closed by the same operation.

![](https://github.com/web-terminal/web-terminal/blob/master/js-command.gif)

## Command line use
The format of the command line is almost the same as that of Linux. Space is an important delimiter. If the input parameter contains spaces, it is recommended to use `` ` ` `` to wrap the string `` cron `* * * * * *` ` js console.log('hello web terminal');` -a ``

## Command

### help
First you will use `help` or `ls` to see what commands are available.
If you want to see how a certain command is used, you can use `help [command]`

Example
 - `help` to view all available commands.  
 - `help js` View js command usage documentation.  
-c --current current page  
-c stands for parameter abbreviation  
--current represents the full name of the parameter  
``js `alert('hello web terminal.')` -c`` is equivalent to ``js `alert('hello web terminal.')` --current``

### js
The js command allows you to execute a piece of js code or a remote js file on a specified page, which is very useful, that is, you can manipulate the content of any page through js commands. The js command has native support for jquery capabilities, which can help you easily manipulate the page dom. If combined with the cron command, some automated tasks can be achieved.

Example
- ``js `var a = "hello web-terminal"; alert(a);` ``
This code will be executed on the current page.

- ``js `var a = "hello web-terminal"; alert(a);` -u http://www.github.com``
Will automatically jump to the github page to execute this code.

- `js https://buttons.github.io/buttons.js -f`
Execute the remote buttons.js file on the current page.

- ``js `$("body").text();` ``
Get the text content of the page.

### cron
cron can help you create timed tasks

``cron `* * * * * *`'js `console.log("hello web-terminal!");`' -a``
The above command will create a task that executes js `console.log("hello web-terminal!");` `` every second.

- -l --list View the task list, through `cron -l` or `cron --list` you can display all the timed tasks  
- -a --add Add timed task instructions, example ``cron `00 * * * * *` `js console.log(123);` -a`` This command will add a line to execute `js console.log every minute (123);`'s timed task.  
- -D --delete delete a timed task, example `cron 4f0wr4ynbs80 -D` delete a timed task with ID 4f0wr4ynbs80  
- -s --showType display type, background (background) and frontend (foreground), example: `cron 4f0wr4ynbs80 -s background` Set the timing task to run in the background of the specified page  
- -o --openType open type, auto-open (automatically open) and open-only (execute only when opened), example: `cron 4f0wr4ynbs80 -o auto-open` to set the timing task to automatically open the page to execute the task
- -e --enabled enabled state, optional value (0, 1), example `cron 4f0wr4ynbs80 -e 0` disables timing tasks  
- -u --url host url, example `cron 4f0wr4ynbs80 -u http://www.google.com` set timing tasks to execute on google page  
- -r --rule timer rules, example `cron 4f0wr4ynbs80 -r `01 * * * * *` `` Learn more about timer rules [wiki](https://en.wikipedia.org/wiki/Cron ), crontab is accurate to the minute, here is accurate to the second  
- -c --command The command executed by the task, example ``cron 4f0wr4ynbs80 -c `time -t` `` modify the command executed by the task

### curl
If you are accustomed to using linux curl, then using curl on the browser side must be the function you need. The usage method is roughly the same as that on the linux side, but only common parameters are supported, and normal needs can basically be met.  

Example: `` curl http://api.xxx.com -u username:password -d `{"field": "value"}` -i `` or `` curl http://api.xxx.com- u username:password -d k1=v1&k2=v2&k3=v3 -i ``  

-u --user Set request account password, format `-u test:test`  
-H --header set request header information, format `-H header1:v1 -H header2:v2`  
-G --get set Get request, for example `curl http://api.xxx.com -G`  
　 --timeout set the timeout, `curl http://api.xxx.com --timeout`  
-d --data set Post data, format ``-d `{"k1":v1,"k2":"v2"}` `` or then `` -d `k1=v1&k2=v2` ``  
-i --include Print the request header information, send data, and return results, for example `curl http://api.xxx.com -i`

### time
As a developer, you always need to get the current timestamp or format the timestamp. This command will help you.

Example: `` time `2020-07-04 14:00:00` -t ``  
-t --timestamp Get the timestamp, the precision is in seconds, for example ``time `2020-07-04 14:00:00` -t``  
-m --microtimestamp Get the timestamp, the precision is in microseconds, for example `` time `2020-07-04 14:00:00` -m ``  
-d --date time format, the default format is YYYY-mm-dd HH:ii:ss, for example `` time `1593842041976` -d``

### browser
Browser-related commands, including subcommands: tabs, bookmark, history, notice.
#### tabs
`browser tabs` View the tabs that the browser has opened  
`` browser tabs `query` `` matches tabs whose title contains the query keyword  
#### bookmark
`browser bookmark` View the browser's recent bookmarks  
`` browser bookmark `query` `` matches bookmarks whose title or URL contains the query keyword
#### history
`browser history` View browsing history within 24 hours  
`` browser history `query` `` matches the history record of the query keyword in the title or URL within 24 hours
#### notice
``browser notice -t basic -i https://developer.chrome.com/webstore/images/reader.png -T `It's test title` -m `main message` -M `content message` `` execute this command Let's see what happens later.

-t --type specifies the type of notification display, options include (basic, image, list, progress)  
-i --icon Url The avatar url of the sender, the URL can be a data URL or a Blob URL  
-T --title Notification title  
-m --message The main content of the notification message.  
-M --context Message backup notification content with small font


### ｜ Pipeline
Pipeline command, multiple commands can be executed continuously through "|", and the last command can get the output of the previous command, which can be passed through the TerminalFeedArgs variable. You can directly use TerminalFeedArgs in the js code or command line parameters to get the previous command The output information.

Open web-terminal on any normal page and enter the following command:
`js $.trim($("#wiki-body").find("h1").text()) -u https://github.com/web-terminal/web-terminal/wiki/%E4%B8%AD%E6%96%87 -a false | js -u https://www.baidu.com/s?wd=TerminalFeedArgs`  

or  

`js $.trim($("#wiki-body").find("h1").text()) -u https://github.com/web-terminal/web-terminal/wiki/%E4%B8%AD%E6%96%87 -a false | js $("#kw").val(TerminalFeedArgs);$("#su").trigger("click"); -u https://www.baidu.com`  
This command realizes that the wiki title content is obtained from this page of `https://github.com/web-terminal/web-terminal/wiki/%E4%B8%AD%E6%96%87`, and then passed to Baidu for automatic search   

This is a very useful feature, cross-page chain programming can be achieved through pipeline commands.


### cmd
Command management tool, through this command you can add third-party commands or custom commands,

#### Third-party commands
At present, the third-party commands are hosted in the github [cmdhub](https://github.com/web-terminal/cmdhub) repository. Please make sure that your network can access github normally before adding third-party commands.

Example: Add the qqdoc command
1. `cmd add qqdoc` Add qqdoc command.
2. `cmd update qqdoc` Update qqdoc to the latest version.
3. `cmd delete qqdoc` delete qqdoc command.
4. `cmd custom mycommand commandcode `add custom command

How it works
After the command is added successfully, web-terminal will automatically inject the code contained in the command into all pages, and then activate the command through the command and parameters entered by the terminal. The command can contain sub-commands, and the sub-commands can also continue to contain sub-commands. Each command There is an execution entry, which is explained by examples below.

```
First, there is a fixed format for the naming of commands, namely *Cmd
var qqdocCmd = function() {
    var self = this;
    // The description of the command, help qqdoc will show the description to the user
    this.desc ='qqdoc commands';
    // The site the command is attached to
    this.site ='https://docs.qq.com';
    // Command configuration information
    this.config = {
        match_url:'https://docs.qq.com/desktop*', // rules for matching url
        login_url:'https://docs.qq.com/desktop/', // Login url, when you need to execute the command code on the login page, if the session expires, it will automatically jump to the login page to let the user confirm login
        exec_all_match_url: false, // Whether to execute the command in all matched urls, the default false is to execute the command only on the first page that matches
        auto_open: true, // Whether to open automatically
        active_url: false, // Whether to automatically activate the url tab
    };
    // Command execution entry
    this.Exec = function(command) {
        return self.subCmds.ls.Exec(command);
    }
    // Subcommand qqdoc cd ...
    this.subCmds = {
        cd: {
            desc:'Switch folder or open file',
            Exec: function(command) {
                if (command.content.length> 0) {
                    var command_list = [];
                    folders = command.content[0].split('/');
                    folders.forEach((folder) => {
                        command_list.push("qqdoc open "+ folder);
                    });
                    return {
                        type:'command-list',
                        data: command_list
                    }
                } else {
                    return {type:'html-text', data:'Please enter sub-folders, use / split between folders.'};
                }
            }
        },
        open: {
            Exec: function(command) {
                if (command.content.length> 0) {
                    var sub = command.content[0].replace('#','');
                    if (isNumber(sub)) {
                        $('#list-content').find('.list-item:eq('+(parseInt(sub)-1)+') a.item-name-title:first')[0].click( );
                    } else if (sub.startsWith('..')) {
                        var len = sub.split('..').length;
                        var current = $('.doclist-content .breadcrumbs-item:last');
                        while(len> 1) {
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
                var str ='/';
                $('.doclist-content .breadcrumbs-item').each(function() {
                    str += $(this).find('a').text()+'/';
                });
                return {type:'html-text', data: str};
            }
        },
        ls: {
            Exec: function(command) {
                if (command.content.length> 0) {
                    var command_data = self.subCmds.cd.Exec(command);
                    command_data.data.push('qqdoc ls');
                    return command_data;
                } else {
                    var list = [];
                    var listContent = $('#list-content').find('.list-item');
                    if (listContent.length> 0) {
                        $('#list-content').find('.list-item').each(function(i) {
                            list.push({
                                title:'#'+(i+1)+''+$(this).find('.item-name-title').text()+($(this).attr('data-listinfotype') == 2?'/':''),
                            });
                        });
                    } else {
                        list.push({
                            title:'please login <a target="_blank" href="'+self.config.login_url+'">docs.qq.com</a> and then try again.',
                        });
                        window.close();
                    }
                    
                    return {type:'data-list', data: list};
                }
            }
        },
        create: {
            subCmds: {
                doc: {
                    Exec: function() {
                        $('.new-doc-item[aria-label="online document"]')[0].click();
                    }
                },
                xls: {
                    Exec: function() {
                        $('.new-doc-item[aria-label="online form"]')[0].click();
                    }
                },
                ppt: {
                    Exec: function() {
                        $('.new-doc-item[aria-label="Online Slideshow"]')[0].click();
                    }
                },
                coll: {
                    Exec: function() {
                        $('.new-doc-item[aria-label="Online Collection Form"]')[0].click();
                    }
                },
            }
        }
    };
    this.TabComplete = function(command) {
        if (command.content.length> 0) {
            var subCmd = command.content.shift();
            switch (subCmd) {
                case'ls':
                case'cd':
                    return self.subCmds.ls.Exec(command);
                case'pwd':
                    return self.subCmds.pwd.Exec(command);
                case'open':
                    return self.subCmds.ls.Exec(command);
                default:
                    break;
            }
        }
    };
}
```