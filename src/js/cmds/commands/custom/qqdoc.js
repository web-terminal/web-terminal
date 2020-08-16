var qqdocCmd = function() {
    this.desc = 'qqdoc commands';
    this.config = {
        site: 'https://docs.qq.com',
        match_url: 'https://docs.qq.com/*',
        exec_all_match_url: false,
        active_url: false,
        auto_open: true
    };
    this.subCmds = {
        ls: {
            Exec: function(command, terminal) {
                return [
                    {
                        'url': 'http://www.baidu.com',
                        'title': 'test-001'
                    }
                ];
            }
        }
    };
    this.TabComplete = function() {
        return {
            type: 'tab-complete',
            data: [
                {
                    'title': '测试',
                    'url': 'http://baidu.com',
                    'icon': 'https://www.baidu.com/favicon.ico'
                }
            ]
        }
    };
}