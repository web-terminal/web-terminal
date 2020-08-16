# web-terminal
### Welcome to the web-terminal wiki!
## Start
Global key combination to start `ctrl + shift + 0` for windows or `command + shift + 0` for mac.  
Page key combination to start `double ctrl` for windows or `double command` for mac. The same way to close it.
![](https://github.com/web-terminal/web-terminal/blob/master/js-command.gif)

## Terminal Grammar
input format like linux shell commands  
start with commands and use 

## Commands

### help
First show all available commands through the `help` command.  
Then use `help [command]` to show the usage of `[command]`.  

Example  
 - `help` show all available commands.
 - `help js` show js command doc.
 - `help cron` show cron command doc.

### js
The js command allows you to execute a piece of js code or a remote js file on the specified page, and the js command also supports jquery, which means you can use native js or jquery to manipulate any dom element on the specified page. This will be very useful, and it will be able to help you complete tasks you could not do before. At the same time, you can also combine cron commands to complete some timing tasks.

Example  
- `js 'var a = "hello web-terminal"; alert(a);'`  
Execute this js code on the current page.

- `js 'var a = "hello web-terminal"; alert(a);' -u http://www.github.com`  
Execute this js code on the github page. 

- `js https://buttons.github.io/buttons.js -f`  
Execute this remote js file on the current page. 

- `js '$("body").text();'`  
Get the body text content of the current page.

### cron
You can create timed tasks with this command.  
`cron '* * * * * *' 'js console.log("hello web-terminal!");' -a`
This command will create a timed task that executes the `js console.log("hello web-terminal!")` command every second.

- -l --list Useage: cron -l show all the crontab tasks
- -a --add Useage: cron `00 * * * * *` `js console.log(123);` -a Add a new contab task
- -D --delete Useage: `cron 4f0wr4ynbs80 -D` delete the specified contab task
- -s --showType Useage: `cron 4f0wr4ynbs80 -s` background Update the show type when cron job excute. the options is background or frontend.
- -o --openType Useage: `cron 4f0wr4ynbs80 -o auto-open` Update the show type when cron job excute. the option is auto-open or open-only.
- -e --enabled Useage: `cron 4f0wr4ynbs80 -e 0` Update the enabled status. the options is 0 or 1
- -u --url Useage: `cron 4f0wr4ynbs80 -u http://www.google.com` Update the host page url address.
- -r --rule Useage: `cron 4f0wr4ynbs80 -r '01 * * * * *'` Update the rule of cron.
- -c --command Useage: `cron 4f0wr4ynbs80 -c 'time -t'` Update the executor command.

### cmd
Command manager, which allows you to add and delete and update third-party commands.  
Third-party command warehouse address [cmdhub](https://github.com/web-terminal/cmdhub)

For example, the third-party command github  
1. `cmd add github` add the third-party command github.
2. `cmd update github` update the latest version of github.
3. `cmd delete github` delete the github command.

