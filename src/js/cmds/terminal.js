// const { trim } = require("jquery");
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

//jQuery实现textarea高度根据内容自适应
$.fn.extend({
  txtaAutoHeight: function () {
    return this.each(function () {
      var $this = $(this);
      if (!$this.attr('initAttrH')) {
        $this.attr('initAttrH', $this.outerHeight());
      }
      setAutoHeight(this).on('input', function () {
        setAutoHeight(this);
      });
      setAutoHeight(this).on('focus', function () {
        setAutoHeight(this);
      });
    });
    function setAutoHeight(elem) {
      var $obj = $(elem);
      return $obj.css({ height: $obj.attr('initAttrH'), 'overflow-y': 'hidden' }).height(elem.scrollHeight);
    }
  }
})

/**
 * Stack for holding previous commands for retrieval with the up arrow. 
 * Stores data in localStorage. Won't push consecutive duplicates.
 *
 * @author   Jake Gully, chimpytk@gmail.com
 * @license  MIT License
 */

/**
 * Constructor
 * @param {string}  id       Unique id for this stack
 * @param {integer} max_size Number of commands to store
 */
function CmdStack(id, max_size) {
  "use strict";

  var instance_id = id,
    cur = 0,
    arr = []; // This is a fairly meaningless name but
  // makes it sound like this function was
  // written by a pirate.  I'm keeping it.

  if (typeof id !== 'string') {
    throw 'Stack error: id should be a string.';
  }

  if (typeof max_size !== 'number') {
    throw 'Stack error: max_size should be a number.';
  }

  function getCmdStackKey() {
    return "cmd_stack_" + instance_id;
  }

  /**
   * Store the array in localstorage
   */
  function setArray(stackList) {
    // localStorage['cmd_stack_' + instance_id] = JSON.stringify(arr);
    let data = {};
    data[getCmdStackKey()] = stackList;
    api_storage_sync_set(data);
  }

  /**
   * Load array from localstorage
   */
  function getArray(callback) {
    api_storage_sync_get(getCmdStackKey(), function (result) {
      if (result.hasOwnProperty(getCmdStackKey())) {
        callback && callback(result[getCmdStackKey()]);
      } else {
        callback && callback([]);
      }
    });
  }

  /**
   * Push a command to the array
   * @param  {string} cmd Command to append to stack
   */
  function push(cmd) {
    getArray(items => {
      arr = items;
      // don't push if same as last command
      if (cmd === arr[arr.length - 1]) {
        return false;
      }
      arr.push(cmd);

      // crop off excess
      while (arr.length > max_size) {
        arr.shift();
      }

      cur = arr.length;
      setArray(arr);
    });
  }

  /**
   * Get previous command from stack (up key)
   * @return {string} Retrieved command string
   */
  function prev() {
    cur -= 1;

    if (cur < 0) {
      cur = 0;
    }

    return arr[cur];
  }

  /**
   * Get next command from stack (down key)
   * @return {string} Retrieved command string
   */
  function next() {
    cur = cur + 1;

    // Return a blank string as last item
    if (cur === arr.length) {
      return "";
    }

    // Limit
    if (cur > (arr.length - 1)) {
      cur = (arr.length - 1);
    }

    return arr[cur];
  }

  /**
   * Move cursor to last element
   */
  function reset() {
    getArray(items => {
      arr = items;
      cur = arr.length;
    });
  }

  /**
   * Empty array and remove from localstorage
   */
  function empty() {
    arr = undefined;
    localStorage.clear();
    api_storage_sync_remove(getCmdStackKey());
    reset();
  }

  /**
   * Get current cursor location
   * @return {integer} Current cursor index
   */
  function getCur() {
    return cur;
  }

  /**
   * Get entire stack array
   * @return {array} The stack array
   */
  function getArr() {
    return arr;
  }

  /**
   * Get size of the stack
   * @return {Integer} Size of stack
   */
  function getSize() {
    return arr.length;
  }

  return {
    push: push,
    prev: prev,
    next: next,
    reset: reset,
    empty: empty,
    getCur: getCur,
    getArr: getArr,
    getSize: getSize
  };
}

function isURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return pattern.test(str);
}

function htmlEncode(str) {
  var s = "";
  if (str.length === 0) {
    return "";
  }
  s = str.replace(/&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  s = s.replace(/ /g, "&nbsp;");
  s = s.replace(/\'/g, "&#39;");//IE下不支持实体名称
  s = s.replace(/\"/g, "&quot;");
  return s;
}

/**
 * HTML5 Command Line Terminal
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.TerminalWin = factory();
  }
}(this, function () {
  "use strict";
  var TerminalWin = function (user_config) {
    this.keys_array = [9, 13, 38, 40, 27],
      this.timeout = 30;
    this.style = 'dark',
      this.output_init = '<code><div>' + api_locales('terminal_desc', api_locales('version')) + '</div></code>',
      this.popup = true,
      this.prompt_str = '$ ',
      this.autofill = '',
      this.tab_nums = 0,
      this.speech_synth_support = ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'),
      this.options = {
        busy_text: 'Communicating...',
        external_processor: function () { },
        filedrop_enabled: false,
        // file_upload_url:     'ajax/uploadfile.php',
        history_id: 'cmd_history',
        selector: '#cmd',
        talk: false,
        typewriter_time: 32
      },
      this.voices = false;
    this.is_extension_page = location.href.startsWith('chrome-extension://') ? true : false;
    this.customcmds = {};
    this.syscmds = Object.keys(syscmds);
    this.all_commands = syscmds;

    $.extend(this.options, user_config);

    var self = this;
    api_send_message({
      type: 'cmdhub',
      method: 'get_cmdhub',
      callback: function (res) {
        if (typeof res == 'object') {
          $.extend(self.customcmds, res.meta.data);
          for (let cmd in self.customcmds) {
            self.all_commands[cmd] = self.customcmds[cmd]['index_func'];
          }
        }
      }
    });

    if (!$(this.options.selector).length) {
      throw 'Cmd err: Invalid selector.';
    }

    this.cmd_stack = new CmdStack(this.options.history_id, 30);

    this.cmd_stack.reset();
    this.setupDOM();
    this.input.focus();
  }

  // ====== Layout / IO / Alter Interface =========

  /**
   * Create DOM elements, add click & key handlers
   */
  TerminalWin.prototype.setupDOM = function () {
    this.wrapper = $(this.options.selector).addClass('cmd-interface');

    this.container = $('<div/>')
      .addClass('cmd-container')
      .appendTo(this.wrapper);

    if (this.options.filedrop_enabled) {
      this.setupFiledrop(''); // adds dropzone div
    }

    this.clearScreen(); // adds output, input and prompt

    $(this.options.selector).on('click', $.proxy(this.focusOnInput, this));
    $(window).resize($.proxy(this.resizeInput, this));

    this.wrapper.keydown($.proxy(this.handleKeyDown, this));
    this.wrapper.keyup($.proxy(this.handleKeyUp, this));
    this.wrapper.keypress($.proxy(this.handleKeyPress, this));

    let self = this;
    this.wrapper.find('.cmd-output').on('click', function (e) {
      e.stopPropagation();
      let selectionTxt = window.getSelection().toString();
      if (!selectionTxt) {
        if (self.input.attr('disabled') == 'disabled') {
          self.enableInput();
        }
        self.focusOnInput();
      }
    })
  }

  /**
   * Changes the input type
   */
  TerminalWin.prototype.showInputType = function (input_type) {
    switch (input_type) {
      case 'password':
        this.input = $('<input/>')
          .attr('type', 'password')
          .attr('maxlength', 512)
          .addClass('cmd-in');
        break;
      case 'input':
        this.input = $('<input/>')
          .attr('type', 'text')
          .attr('maxlength', 512)
          .addClass('cmd-in');
      case 'textarea':
        this.input = $('<textarea/>')
          .addClass('cmd-in');
      default:
        this.input = $('<textarea/>')
          .addClass('cmd-in')
        this.input.off("input");
        this.input.off("focus");
        break;
    }

    this.container.children('.cmd-in').remove();

    this.input.appendTo(this.container).attr('title', 'Terminal input');
    this.input.txtaAutoHeight();


    this.resizeInput();
    // this.focusOnInput();
  }

  TerminalWin.prototype.getErrorOutput = function (cmd_out) {
    return '<span class="red_highlight"> Error: ' + cmd_out + '</span>';
  }

  TerminalWin.prototype.displayErrorOutput = function (cmd_out) {
    this.displayOutput(this.getErrorOutput(cmd_out))
  }

  /**
   * Takes the client's input and the server's output
   * and displays them appropriately.
   *
   * @param   string  cmd_in      The command as entered by the user
   * @param   string  cmd_out     The server output to write to screen
   */
  TerminalWin.prototype.displayOutput = function (cmd_out, encode) {
    switch (typeof cmd_out) {
      case 'object':
        cmd_out = JSON.stringify(cmd_out);
        break;
      case 'string':
      case 'number':
        break;
      default:
        cmd_out = this.getErrorOutput('invalid cmd_out returned. typeof is ' + (typeof cmd_out));
    }

    if (encode) {
      cmd_out = htmlEncode(cmd_out)
    }
    cmd_out && (this.cmd_output = cmd_out);
    cmd_out && this.output.append('<code>' + cmd_out + '</code>');

    if (this.options.talk) {
      this.speakOutput(cmd_out);
    }

    this.input.val(this.autofill).removeAttr('disabled');

    this.enableInput();
    this.focusOnInput();
  }

  /**
   * Take an input string and output it to the screen
   */
  TerminalWin.prototype.displayInput = function (cmd_in) {
    cmd_in = cmd_in.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    this.output.append('<div><span class="prompt">' + this.prompt_str + '</span> ' +
      '<span class="grey_text">' + cmd_in + '</span></div>');
  }

  /**
   * Set the prompt string
   * @param {string} new_prompt The new prompt string
   */
  TerminalWin.prototype.setPrompt = function (new_prompt) {
    if (typeof new_prompt !== 'string') {
      throw 'Cmd error: invalid prompt string.';
    }

    this.prompt_str = new_prompt;
    this.prompt_elem.html(this.prompt_str);
  }

  TerminalWin.prototype.validator = function (command_name) {
    if (this.all_commands.hasOwnProperty(command_name)) {
      if (location.href.startsWith('chrome-extension://')) {
        if (typeof this.all_commands[command_name] == 'string' || command_name == 'js') {
          throw "You can only exec this command at the normal url page, can not exec js at the extension pages.";
        }
      }
    } else {
      throw "Unrecognised command <code>" + command_name + "</code>";
    }
  }

  /**
   * Post-file-drop dropzone reset
   */
  TerminalWin.prototype.resetDropzone = function () {
    dropzone.css('display', 'none');
  }

  /**
   * Add file drop handlers
   */
  TerminalWin.prototype.setupFiledrop = function (wrapper) {
    this.dropzone = $('<div/>')
      .addClass('dropzone')
      .appendTo(wrapper)
      .filedrop({
        url: this.options.file_upload_url,
        paramname: 'dropfile', // POST parameter name used on serverside to reference file
        maxfiles: 10,
        maxfilesize: 2, // MBs
        error: function (err, file) {
          switch (err) {
            case 'BrowserNotSupported':
              alert('Your browser does not support html5 drag and drop.');
              break;
            case 'TooManyFiles':
              this.displayInput('[File Upload]');
              this.displayOutput('Too many files!');
              this.resetDropzone();
              break;
            case 'FileTooLarge':
              // FileTooLarge also has access to the file which was too large
              // use file.name to reference the filename of the culprit file
              this.displayInput('[File Upload]');
              this.displayOutput('File too big!');
              this.resetDropzone();
              break;
            default:
              this.displayInput('[File Upload]');
              this.displayOutput('Fail D:');
              this.resetDropzone();
              break;
          }
        },
        dragOver: function () { // user dragging files over #dropzone
          this.dropzone.css('display', 'block');
        },
        dragLeave: function () { // user dragging files out of #dropzone
          this.resetDropzone();
        },
        docOver: function () { // user dragging files anywhere inside the browser document window
          this.dropzone.css('display', 'block');
        },
        docLeave: function () { // user dragging files out of the browser document window
          this.resetDropzone();
        },
        drop: function () { // user drops file
          this.dropzone.append('<br>File dropped.');
        },
        uploadStarted: function (i, file, len) {
          this.dropzone.append('<br>Upload started...');
          // a file began uploading
          // i = index => 0, 1, 2, 3, 4 etc
          // file is the actual file of the index
          // len = total files user dropped
        },
        uploadFinished: function (i, file, response, time) {
          // response is the data you got back from server in JSON format.
          if (response.error !== '') {
            upload_error = response.error;
          }
          this.dropzone.append('<br>Upload finished! ' + response.result);
        },
        progressUpdated: function (i, file, progress) {
          // this function is used for large files and updates intermittently
          // progress is the integer value of file being uploaded percentage to completion
          this.dropzone.append('<br>File uploading...');
        },
        speedUpdated: function (i, file, speed) { // speed in kb/s
          this.dropzone.append('<br>Upload speed: ' + speed);
        },
        afterAll: function () {
          // runs after all files have been uploaded or otherwise dealt with
          if (upload_error !== '') {
            this.displayInput('[File Upload]');
            this.displayOutput('Error: ' + upload_error);
          } else {
            this.displayInput('[File Upload]');
            this.displayOutput('[File Upload]', 'Success!');
          }

          upload_error = '';

          this.dropzone.css('display', 'none');
          this.resetDropzone();
        }
      });
  }

  /**
   * [invert description]
   * @return {[type]} [description]
   */
  TerminalWin.prototype.invert = function () {
    this.wrapper.toggleClass('inverted');
  }



  // ====== Handlers ==============================

  /**
   * Do something
   */
  TerminalWin.prototype.handleInput = function (input_str, from_remote) {
    var self = this;
    if (input_str) {
      try {
        self.pipelineSeriesCommands(self.splitCommands(input_str), from_remote);
      } catch (err) {
        self.displayOutput(err);
      }
    } else {
      self.displayInput('');
      self.displayOutput('');
    }
  }

  TerminalWin.prototype.pipelineSeriesCommands = function (command_list, from_remote) {
    var self = this;
    var serialExec = function (output, i) {
      if (i < command_list.length) {
        (new Promise(function (resolve, reject) {
          try {
            self.feed_data = window.btoa(encodeURIComponent(output));
            self.ExecCommands(command_list[i], from_remote);
            // 等待命令返回结果
            var times = 0;
            var intervalHandle = setInterval(function () {
              times++;
              // console.log("set interval: ================");
              if (self.cmd_output != -1 || times / 10 >= self.timeout) {
                // console.log("clearInterval: ================", self.cmd_output);
                clearInterval(intervalHandle);
                resolve(self.cmd_output);
              }
            }, 100);
          } catch (e) {
            console.log(e)
            reject(e)
          }
        })).then(function (result) {
          serialExec(result, ++i);
        }, function (error) {
          self.displayOutput(error)
        });
      }
    }

    var i = 0;
    serialExec(null, i);
  }

  TerminalWin.prototype.pipelineParallelCommands = function (command_list, from_remote) {
    for (var i in command_list) {
      this.ExecCommands(command_list[i], from_remote);
    }
  }

  TerminalWin.prototype.ExecCommands = function (command_line, from_remote) {
    var self = this;
    var command = new Command(command_line, self.prompt_str);
    self.cmd_output = -1;
    self.command = command;
    command.Exec(self, from_remote, function (result) {
      self.displayOutput(self.formateOutput(result, from_remote));
    });
  }

  TerminalWin.prototype.splitCommands = function (input_str) {
    let command_list = [];
    let quote = "";
    if (typeof input_str == 'object' && input_str.length > 0) {
      for (let i in input_str) {
        command_list = command_list.concat(this.splitCommands(input_str[i]));
      }
      return command_list;
    }
    for (let i = 0; i < input_str.length; i++) {
      let chr = input_str.charAt(i);
      if (chr == '"' || chr == "'" || chr == "`") {
        // 如果是开头，则开始对字符串进行包裹
        if (!quote) {
          quote = chr;
        } else if (quote && quote == chr && input_str.charCodeAt(i - 1) != 92) {  // 如果是结尾
          quote = "";
        }
      } else if (!quote && chr == '|') {
        command_list.push(input_str.substr(0, i));
        return command_list.concat(this.splitCommands(input_str.substring(i + 1)));
      }
    }
    if (input_str.trim()) {
      command_list.push(input_str);
    }
    return command_list;
  }

  TerminalWin.prototype.formateOutput = function (result, from_remote) {
    var self = this;
    let output = ''
    if (result && result.hasOwnProperty('type')) {
      let data = result.hasOwnProperty('data') ? result.data : [];
      switch (result.type) {
        case 'data-list':
          if (data && typeof data == 'object') {
            for (let i in data) {
              let item = data[i];
              let img = '';
              if (item.hasOwnProperty('icon')) {
                if (item.hasOwnProperty('icon_type') == 'svg') {
                  img = item.icon;
                } else {
                  img = '<img style="max-width:12px;max-height:12px;margin:-1px 10px;" src="' + item.icon + '"/>';
                }
              }
              if (!item.hasOwnProperty('url')) {
                output += '<div><label>' + img + item.title + '</label></div>';
              } else {
                output += '<div><a href="' + item.url + '" target="_blank">' + img + item.title + '</a></div>';
              }
            }
          }
          break;
        case 'html-text':
          output = result.data;
          break;
        case 'command-list':
          if (!from_remote && data && typeof data == 'object' && data.length > 0) {
            self.pipelineSeriesCommands(self.splitCommands(data), from_remote);
          }
          return output;
      }
    } else if (result) {
      output = result;
    }
    return output
  }

  /**
   * Handle JSON responses. Used as callback by external command handler
   * @param  {object} res Chimpcom command object
   */
  TerminalWin.prototype.handleResponse = function (res) {
    if (res.redirect !== undefined) {
      document.location.href = res.redirect;
    }

    if (res.openWindow !== undefined) {
      window.open(res.openWindow, '_blank', res.openWindowSpecs);
    }

    if (res.log !== undefined && res.log !== '') {
      console.log(res.log);
    }

    if (res.show_pass === true) {
      this.showInputType('password');
    } else {
      this.showInputType();
    }

    this.displayOutput(res.cmd_out);

    if (res.cmd_fill !== '') {
      this.wrapper.children('.cmd-container').children('.cmd-in').first().val(res.cmd_fill);
    }
  }

  /**
   * Handle keypresses
   */
  TerminalWin.prototype.handleKeyDown = function (e) {
    var self = this;
    var keyCode = e.keyCode || e.which,
      input_str = this.input.val();
    e.stopPropagation();
    if ($.inArray(keyCode, this.keys_array) > -1) {
      e.preventDefault();
    }

    if (keyCode === 9) { //tab
      this.tabComplete(input_str);
    } else if (e.ctrlKey && keyCode == 67) {
      this.displayInput(input_str + "^C");
      this.input.val("");
      return false;
    } else {
      if (keyCode === 13) { // enter
        this.autofill = '';
        if (input_str.charCodeAt(input_str.length - 1) === 92) {
          input_str = input_str.substr(0, input_str.length - 1) + "\n";
          this.input.val(input_str);
          this.focusOnInput();
        } else {
          if (this.input.attr('disabled')) {
            return false;
          }

          if (e.ctrlKey) {
            if (isURL(input_str)) {
              this.goToURL(input_str);
            } else {
              this.handleInput("search " + input_str);
            }
          } else {
            this.disableInput();
            this.handleInput(input_str);
          }

          // push command to stack if using text input, i.e. no passwords
          if (this.input.get(0).type !== 'password' && input_str) {
            this.cmd_stack.push(input_str);
            setTimeout(function () {
              self.cmd_stack.reset();
            }, 200);
          }
        }

      } else if (keyCode === 38) { // up arrow
        // if (input_str !== "" && this.cmd_stack.getCur() === this.cmd_stack.getSize()) {
        //   this.cmd_stack.push(input_str);
        // }

        this.input.val(this.cmd_stack.prev());
        this.resizeInput();
      } else if (keyCode === 40) { // down arrow
        this.input.val(this.cmd_stack.next());
        this.resizeInput();
      } else if (keyCode === 27) { // esc
        // this.options.selector.toggle();
      }
    }
  }

  /**
   * Prevent default action of special keys
   */
  TerminalWin.prototype.handleKeyUp = function (e) {
    var key = e.keyCode || e.which;
    if (key != 91 && key != 17) {
      e.stopPropagation();
    }

    if ($.inArray(key, this.keys_array) > -1) {
      e.preventDefault();
      return false;
    }
    return true;
  }

  /**
   * Prevent default action of special keys
   */
  TerminalWin.prototype.handleKeyPress = function (e) {
    var key = e.keyCode || e.which;
    e.stopPropagation();
    // if ($.inArray(key, this.keys_array) > -1) {
    //   e.preventDefault();
    //   return false;
    // }
    return true;
  }

  /**
   * Complete command names when tab is pressed
   */
  TerminalWin.prototype.tabComplete = function (input_str, from_remote) {
    let self = this;
    self.tab_nums++;
    setTimeout(function () {
      self.tab_nums = 0;
    }, 300);

    var command = new Command(input_str, this.prompt_str);
    var message = {};

    if (self.tab_nums == 1) {
      command.TabCompleteSystem(self);
    } else if (self.tab_nums == 2) {
      message = command.TabComplete(self, from_remote);
      if (!from_remote) {
        self.displayOutput(self.formateOutput(message, from_remote));
      }
      self.input.val(input_str);
    }


    return message;
  }


  // ====== Helpers ===============================

  /**
   * Takes a user to a given url. Adds "http://" if necessary.
   */
  TerminalWin.prototype.goToURL = function (url) {
    if (!isURL(url)) {
      // this.displayOutput("please type valid url address.");
      // return
    }
    if (url.substr(0, 4) !== 'http' && url.substr(0, 2) !== '//') {
      url = 'http://' + url;
    }

    if (this.popup) {
      window.open(url, '_blank');
      window.focus();
    } else {
      // break out of iframe - used by chrome plugin
      if (top.location !== location) {
        top.location.href = document.location.href;
      }

      location.href = url;
    }
  }

  /**
   * Give focus to the command input and
   * scroll to the bottom of the page
   */
  TerminalWin.prototype.focusOnInput = function () {
    $(this.options.selector).scrollTop($(this.options.selector)[0].scrollHeight);
    this.input.focus();
  }

  /**
   * Make prompt and input fit on one line
   */
  TerminalWin.prototype.resizeInput = function () {
    var cmd_width = this.wrapper.width() - this.wrapper.find('.main-prompt').first().width() - 25 - 10;
    this.input.css('width', cmd_width);
    this.focusOnInput();
  }

  /**
   * Clear the screen
   */
  TerminalWin.prototype.clearScreen = function () {
    this.container.empty();

    this.output = $('<div/>')
      .addClass('cmd-output')
      .append(this.output_init)
      .appendTo(this.container);

    this.prompt_elem = $('<span/>')
      .addClass('main-prompt')
      .addClass('prompt')
      .html(this.prompt_str)
      .appendTo(this.container);

    this.showInputType();

    this.input.val(this.autofill);
  }

  /**
   * Temporarily disable input while runnign commands
   */
  TerminalWin.prototype.disableInput = function () {
    this.input
      .attr('disabled', true)
      .val(this.options.busy_text);
  }

  /**
   * Reenable input after running disableInput()
   */
  TerminalWin.prototype.enableInput = function () {
    this.input
      .removeAttr('disabled')
      .val(this.autofill);
  }

  /**
   * Speak output aloud using speech synthesis API
   *
   * @param {String} output Text to read
   */
  TerminalWin.prototype.speakOutput = function (output) {
    var msg = new SpeechSynthesisUtterance();

    msg.volume = 1; // 0 - 1
    msg.rate = 1; // 0.1 - 10
    msg.pitch = 2; // 0 - 2
    msg.lang = 'en';
    msg.text = $('<code>' + output + '</code>').text();

    window.speechSynthesis.speak(msg);
  }

  return TerminalWin;
}));
