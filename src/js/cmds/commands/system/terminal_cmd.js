var terminalCmd = function () {
    this.desc = 'Set window properties <code>terminal max</code>',
    this.subCmds = {
        max: {
            desc: 'Maximize window',
            Exec: function(command, terminal) {
                terminal.options.selector.css({"width": '100%', "height": '100%', "left": "0px", "top": "0px"});
            }
        },
        min: {
            desc: "Minimize window",
            Exec: function(command, terminal) {
                terminal.options.selector.css({"width": '60%', "height": '60%', "left": "20%", "top": "20%"});
            }
        },
        close: {
            desc: "Close and clean the window",
            Exec: function(commands, terminal) {
                terminal.clearScreen();
                toggleCmdWin('hide');
            }
        },
        hide: {
            desc: "Hide the window",
            Exec: function() {
                toggleCmdWin('hide');
            }
        },
        position: {
            desc: "Set the position of the window. <code>terminal position -l 0 -t 0</code> The window is near the upper left corner.",
            options: {
                left: {
                    simple: 'l',
                    desc: 'Distance to the left',
                },
                top: {
                    simple: 't',
                    desc: 'Distance to the top',
                },
                right: {
                    simple: 'r',
                    desc: 'Distance to the right',
                },
                bottom: {
                    simple: 'b',
                    desc: 'Distance to the bottom',
                },
                width: {
                    simple: 'w',
                    desc: 'The width of the window',
                },
                height: {
                    simple: 'h',
                    desc: 'The height of the window',
                },
            },
            Exec: function(commands, terminal) {
                if (commands.options.hasOwnProperty('left')) {
                    terminal.options.selector.css('left', commands.options['left']);
                }
                if (commands.options.hasOwnProperty('top')) {
                    terminal.options.selector.css('top', commands.options['top']);
                }
                if (commands.options.hasOwnProperty('bottom')) {
                    terminal.options.selector.css('bottom', commands.options['bottom']);
                }
                if (commands.options.hasOwnProperty('right')) {
                    terminal.options.selector.css('left', $(window).width() - terminal.options.selector.width() - commands.options['right']);
                }
                if (commands.options.hasOwnProperty('width')) {
                    terminal.options.selector.css('width', commands.options['width']);
                }
                if (commands.options.hasOwnProperty('height')) {
                    terminal.options.selector.css('height', commands.options['height']);
                }
            }
        },
    }
}