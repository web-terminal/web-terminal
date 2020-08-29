var qqdocCmd = function() {
    var self = this;
    this.desc = 'qqdoc commands';
    this.site = 'https://docs.qq.com';
    this.config = {
        match_url: 'https://docs.qq.com/desktop*',
        exec_all_match_url: false,
        login_url: 'https://docs.qq.com/desktop/',
        active_url: false,
        auto_open: true
    };
    
    this.subCmds = {
        cd: {
            desc: '文件夹切换',
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
            config: {
                active_url: true,
            },
            desc: '打开文件或文件夹',
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
                    var remote_tab = '';
                    // 跨页面事件监听
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
            desc: '创建文件',
            subCmds: {
                doc: {
                    desc: '创建在线文档',
                    Exec: function() {
                        $('.new-doc-item[aria-label="在线文档"]')[0].click();
                    }
                },
                xls: {
                    desc: '创建在线表格',
                    Exec: function() {
                        $('.new-doc-item[aria-label="在线表格"]')[0].click();
                    }
                },
                ppt: {
                    desc: '创建在线幻灯片',
                    Exec: function() {
                        $('.new-doc-item[aria-label="在线幻灯片"]')[0].click();
                    }
                },
                coll: {
                    desc: '创建在线收集表',
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
    this.Exec = function(command) {
        return self.subCmds.ls.Exec(command);;
    }
}