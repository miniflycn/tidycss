/*!
 * css-redundance
 * Copyright (c) 2013 Daniel Yang <miniflycn@justany.net>
 * Copyright (c) 2014 QQEDU TEAM
 * MIT Licensed
 */
module.exports = (function () {
  "use strict";
  var valid = require('url-valid')
    , dom = require('url-dom')
    , cssParse = require('css-parse')
    , compiler = new (require('./compiler'))()
    , noop = function () {}
    , pseudoClasses = /\:hover|\:active/;

  var fs = require('fs');

  function _$(selector, $) {
    try {
      var tmp = $(selector);
    } catch (e) {
      if (selector.match(pseudoClasses)) {
        return _$(selector.replace(pseudoClasses, ''));
      } else {
        return {};
      }
    }
    return tmp;
  }

  function Redundance(url, options) {
    var self = this;
    options = options || {};
    this.url = url;
    this.$ = undefined;
    this.ignore = options.ignore;
    this.dist = options.dist || './';
    this.load(url);
    this.unchecks = {};
    (options.unchecks || []).forEach(function (selector) {
      self.unchecks[selector] = true;
    })
  }
  Redundance.prototype = {
    constructor: Redundance,
    load: function (url) {
      var self = this;
      valid(url).on('check', function (err, valid) {
        if (!err) {
          dom(url).success(function ($) {
            self.$ = $;
            $('link[rel="stylesheet"]').each(function () {
              self.checkCSS($(this).attr('href'));
            });
          });
        }
      });
      // prevent load again
      this.load = noop;
    },
    checkCSS: function (href) {
      // ignore
      if (this.ignore && this.ignore.test(href)) return;
      var self = this
        , selectorList = []
        , ruleMap = {};
      this._loadCSS(href, function (css) {
        // Traversal all rules
        css.stylesheet.rules.forEach(function (item) {
          if (item.type === 'rule') {
            var hasCache = false;
            item.selectors.forEach(function (selector) {
              !ruleMap[selector] &&
                (ruleMap[selector] = []) &&
                  selectorList.push(selector);
              
              !hasCache &&
                (hasCache = true) &&
                  ruleMap[selector].push(item);
            });
          }
        });

        selectorList.forEach(function (selector) {
          var $ = _$(selector, self.$);
          if ($.length || self.unchecks[selector]) {
            ruleMap[selector] = null;
            delete ruleMap[selector];
          } else {
            ruleMap[selector].forEach(function (rule) {
              rule.type = 'missing';
            });
          }
        });

        self._render(css, href, selectorList, ruleMap);
      });
    },
    _loadCSS: function (href, callback) {
      var self = this 
        , buffers = []
        , v = valid(href)
            .on('data', function (err, buffer) {
              if (err) {
                // log a error
                console.error(href + ' not found!');
                return v.destroy();
              }
              buffers.push(buffer);
            })
            .on('end', function () {
              if (buffers.length) {
                callback(cssParse(Buffer.concat(buffers).toString()));
              }
              v.destroy();
            });
    },
    _render: function (css, href, selectorList, ruleMap) {
      var result = [
        '<!DOCTYPE html><html><head><title>CSS冗余Reviewer</title><meta charset="utf-8">',
        '<style>',
        fs.readFileSync(__dirname + '/style.css'),
        '</style>',
        '</head><body>',
        '<h3>' + href + '</h3>',
        '<pre><code class="hljs css">',
        compiler.compile(css),
        '</code></pre></body></html>'
      ];
      fs.writeFileSync(this.dist + href.substring(href.lastIndexOf('/'), href.length) + '.html', result.join(''));
    }
  }

  return function (url, options) {
    return (new Redundance(url, options));
  }

})();