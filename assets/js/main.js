/**
 * what-input - A global utility for tracking the current input method (mouse, keyboard or touch).
 * @version v4.0.6
 * @link https://github.com/ten1seven/what-input
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("whatInput", [], factory);
	else if(typeof exports === 'object')
		exports["whatInput"] = factory();
	else
		root["whatInput"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	module.exports = (function() {

	  /*
	    ---------------
	    Variables
	    ---------------
	  */

	  // cache document.documentElement
	  var docElem = document.documentElement;

	  // last used input type
	  var currentInput = 'initial';

	  // last used input intent
	  var currentIntent = null;

	  // form input types
	  var formInputs = [
	    'input',
	    'select',
	    'textarea'
	  ];

	  // list of modifier keys commonly used with the mouse and
	  // can be safely ignored to prevent false keyboard detection
	  var ignoreMap = [
	    16, // shift
	    17, // control
	    18, // alt
	    91, // Windows key / left Apple cmd
	    93  // Windows menu / right Apple cmd
	  ];

	  // mapping of events to input types
	  var inputMap = {
	    'keyup': 'keyboard',
	    'mousedown': 'mouse',
	    'mousemove': 'mouse',
	    'MSPointerDown': 'pointer',
	    'MSPointerMove': 'pointer',
	    'pointerdown': 'pointer',
	    'pointermove': 'pointer',
	    'touchstart': 'touch'
	  };

	  // array of all used input types
	  var inputTypes = [];

	  // boolean: true if touch buffer timer is running
	  var isBuffering = false;

	  // map of IE 10 pointer events
	  var pointerMap = {
	    2: 'touch',
	    3: 'touch', // treat pen like touch
	    4: 'mouse'
	  };

	  // touch buffer timer
	  var touchTimer = null;


	  /*
	    ---------------
	    Set up
	    ---------------
	  */

	  var setUp = function() {

	    // add correct mouse wheel event mapping to `inputMap`
	    inputMap[detectWheel()] = 'mouse';

	    addListeners();
	    setInput();
	  };


	  /*
	    ---------------
	    Events
	    ---------------
	  */

	  var addListeners = function() {

	    // `pointermove`, `MSPointerMove`, `mousemove` and mouse wheel event binding
	    // can only demonstrate potential, but not actual, interaction
	    // and are treated separately

	    // pointer events (mouse, pen, touch)
	    if (window.PointerEvent) {
	      docElem.addEventListener('pointerdown', updateInput);
	      docElem.addEventListener('pointermove', setIntent);
	    } else if (window.MSPointerEvent) {
	      docElem.addEventListener('MSPointerDown', updateInput);
	      docElem.addEventListener('MSPointerMove', setIntent);
	    } else {

	      // mouse events
	      docElem.addEventListener('mousedown', updateInput);
	      docElem.addEventListener('mousemove', setIntent);

	      // touch events
	      if ('ontouchstart' in window) {
	        docElem.addEventListener('touchstart', touchBuffer);
	      }
	    }

	    // mouse wheel
	    docElem.addEventListener(detectWheel(), setIntent);

	    // keyboard events
	    docElem.addEventListener('keydown', updateInput);
	    docElem.addEventListener('keyup', updateInput);
	  };

	  // checks conditions before updating new input
	  var updateInput = function(event) {

	    // only execute if the touch buffer timer isn't running
	    if (!isBuffering) {
	      var eventKey = event.which;
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (
	        currentInput !== value ||
	        currentIntent !== value
	      ) {

	        var activeElem = document.activeElement;
	        var activeInput = (
	          activeElem &&
	          activeElem.nodeName &&
	          formInputs.indexOf(activeElem.nodeName.toLowerCase()) === -1
	        ) ? true : false;

	        if (
	          value === 'touch' ||

	          // ignore mouse modifier keys
	          (value === 'mouse' && ignoreMap.indexOf(eventKey) === -1) ||

	          // don't switch if the current element is a form input
	          (value === 'keyboard' && activeInput)
	        ) {

	          // set the current and catch-all variable
	          currentInput = currentIntent = value;

	          setInput();
	        }
	      }
	    }
	  };

	  // updates the doc and `inputTypes` array with new input
	  var setInput = function() {
	    docElem.setAttribute('data-whatinput', currentInput);
	    docElem.setAttribute('data-whatintent', currentInput);

	    if (inputTypes.indexOf(currentInput) === -1) {
	      inputTypes.push(currentInput);
	      docElem.className += ' whatinput-types-' + currentInput;
	    }
	  };

	  // updates input intent for `mousemove` and `pointermove`
	  var setIntent = function(event) {

	    // only execute if the touch buffer timer isn't running
	    if (!isBuffering) {
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (currentIntent !== value) {
	        currentIntent = value;

	        docElem.setAttribute('data-whatintent', currentIntent);
	      }
	    }
	  };

	  // buffers touch events because they frequently also fire mouse events
	  var touchBuffer = function(event) {

	    // clear the timer if it happens to be running
	    window.clearTimeout(touchTimer);

	    // set the current input
	    updateInput(event);

	    // set the isBuffering to `true`
	    isBuffering = true;

	    // run the timer
	    touchTimer = window.setTimeout(function() {

	      // if the timer runs out, set isBuffering back to `false`
	      isBuffering = false;
	    }, 200);
	  };


	  /*
	    ---------------
	    Utilities
	    ---------------
	  */

	  var pointerType = function(event) {
	   if (typeof event.pointerType === 'number') {
	      return pointerMap[event.pointerType];
	   } else {
	      return (event.pointerType === 'pen') ? 'touch' : event.pointerType; // treat pen like touch
	   }
	  };

	  // detect version of mouse wheel event to use
	  // via https://developer.mozilla.org/en-US/docs/Web/Events/wheel
	  var detectWheel = function() {
	    return 'onwheel' in document.createElement('div') ?
	      'wheel' : // Modern browsers support "wheel"

	      document.onmousewheel !== undefined ?
	        'mousewheel' : // Webkit and IE support at least "mousewheel"
	        'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox
	  };


	  /*
	    ---------------
	    Init

	    don't start script unless browser cuts the mustard
	    (also passes if polyfills are used)
	    ---------------
	  */

	  if (
	    'addEventListener' in window &&
	    Array.prototype.indexOf
	  ) {
	    setUp();
	  }


	  /*
	    ---------------
	    API
	    ---------------
	  */

	  return {

	    // returns string: the current input type
	    // opt: 'loose'|'strict'
	    // 'strict' (default): returns the same value as the `data-whatinput` attribute
	    // 'loose': includes `data-whatintent` value if it's more current than `data-whatinput`
	    ask: function(opt) { return (opt === 'loose') ? currentIntent : currentInput; },

	    // returns array: all the detected input types
	    types: function() { return inputTypes; }

	  };

	}());


/***/ }
/******/ ])
});
;
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.3.0';

  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
     * Stores initialized plugins.
     */
    _plugins: {},

    /**
     * Stores generated unique ids for plugin instances
     */
    _uuids: [],

    /**
     * Returns a boolean for RTL support
     */
    rtl: function rtl() {
      return $('html').attr('dir') === 'rtl';
    },
    /**
     * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
     * @param {Object} plugin - The constructor of the plugin.
     */
    plugin: function plugin(_plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(_plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = _plugin;
    },
    /**
     * @function
     * Populates the _uuids array with pointers to each individual plugin instance.
     * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
     * Also fires the initialization event for each plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @param {String} name - the name of the plugin, passed as a camelCased string.
     * @fires Plugin#init
     */
    registerPlugin: function registerPlugin(plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {
        plugin.$element.attr('data-' + pluginName, plugin.uuid);
      }
      if (!plugin.$element.data('zfPlugin')) {
        plugin.$element.data('zfPlugin', plugin);
      }
      /**
       * Fires when the plugin has initialized.
       * @event Plugin#init
       */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
     * @function
     * Removes the plugins uuid from the _uuids array.
     * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
     * Also fires the destroyed event for the plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @fires Plugin#destroyed
     */
    unregisterPlugin: function unregisterPlugin(plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      .trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
     * @function
     * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
     * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
     * @default If no argument is passed, reflow all currently active plugins.
     */
    reInit: function reInit(plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins === 'undefined' ? 'undefined' : _typeof(plugins),
              _this = this,
              fns = {
            'object': function object(plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function string() {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function undefined() {
              this['object'](Object.keys(_this._plugins));
            }
          };
          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
     * returns a random base-36 uid with namespacing
     * @function
     * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
     * @param {String} namespace - name of plugin to be incorporated in uid, optional.
     * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
     * @returns {String} - unique id
     */
    GetYoDigits: function GetYoDigits(length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
    },
    /**
     * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
     * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
     * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
     */
    reflow: function reflow(elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      $.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = $(this),
              opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {
                return el.trim();
              });
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function transitionend($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend'
      };
      var elem = document.createElement('div'),
          end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    }
  };

  Foundation.util = {
    /**
     * Function for applying a debounce effect to a function call.
     * @function
     * @param {Function} func - Function to be called at end of timeout.
     * @param {Number} delay - Time in ms to delay the call of `func`.
     * @returns function
     */
    throttle: function throttle(func, delay) {
      var timer = null;

      return function () {
        var context = this,
            args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    }
  };

  // TODO: consider not making this a jQuery function
  // TODO: need way to reflow vs. re-initialize
  /**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
  var foundation = function foundation(method) {
    var type = typeof method === 'undefined' ? 'undefined' : _typeof(method),
        $meta = $('meta.foundation-mq'),
        $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {
      //needs to initialize the Foundation object, or an individual plugin.
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {
      //an individual method to invoke on a plugin or group of plugins
      var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
      var plugClass = this.data('zfPlugin'); //determine the class of plugin

      if (plugClass !== undefined && plugClass[method] !== undefined) {
        //make sure both the class and method exist
        if (this.length === 1) {
          //if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {
            //otherwise loop through the jQuery collection and invoke the method on each
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {
        //error for no class or no method
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {
      //error for invalid argument type
      throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
      return new Date().getTime();
    };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
     * Polyfill for performance.now, required by rAF
     */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function now() {
          return Date.now() - this.start;
        }
      };
    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP = function fNOP() {},
          fBound = function fBound() {
        return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if ('true' === str) return true;else if ('false' === str) return false;else if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}(jQuery);
'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets
  };

  /**
   * Compares the dimensions of an element to a container and determines collision events with container.
   * @function
   * @param {jQuery} element - jQuery object to test for collisions.
   * @param {jQuery} parent - jQuery object to use as bounding container.
   * @param {Boolean} lrOnly - set to true to check left and right values only.
   * @param {Boolean} tbOnly - set to true to check top and bottom values only.
   * @default if no parent object passed, detects collisions with `window`.
   * @returns {Boolean} - true if collision free, false if a collision in any direction.
   */
  function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
        top,
        bottom,
        left,
        right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width + parDims.offset.left;
    } else {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
   * Uses native methods to return an object of dimension values.
   * @function
   * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
   * @returns {Object} - nested object of integer pixel values
   * TODO - if element is window, return only those values.
   */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
        parRect = elem.parentNode.getBoundingClientRect(),
        winRect = document.body.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX
      },
      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX
        }
      },
      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX
        }
      }
    };
  }

  /**
   * Returns an object of top and left integer pixel values for dynamically rendered elements,
   * such as: Tooltip, Reveal, and Dropdown
   * @function
   * @param {jQuery} element - jQuery object for the element being positioned.
   * @param {jQuery} anchor - jQuery object for the element's anchor point.
   * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
   * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
   * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
   * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
   * TODO alter/rewrite to work with `em` values as well/instead of pixels
   */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
        $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top
        };
        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top
        };
        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset
        };
      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top
        };
        break;
      case 'left bottom':
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'right bottom':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left + hOffset,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
    }
  }
}(jQuery);
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN'
  };

  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
     * Parses the (keyboard) event and returns a String that represents its key
     * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
     * @param {Event} event - the event generated by the event handler
     * @return String key - String that represents the key pressed
     */
    parseKey: function parseKey(event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();

      // Remove un-printable characters, e.g. for `fromCharCode` calls for CTRL only events
      key = key.replace(/\W+/, '');

      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;

      // Remove trailing underscore, in case only modifiers were used (e.g. only `CTRL_ALT`)
      key = key.replace(/_$/, '');

      return key;
    },


    /**
     * Handles the given (keyboard) event
     * @param {Event} event - the event generated by the event handler
     * @param {String} component - Foundation component's name, e.g. Slider or Reveal
     * @param {Objects} functions - collection of functions that are to be executed
     */
    handleKey: function handleKey(event, component, functions) {
      var commandList = commands[component],
          keyCode = this.parseKey(event),
          cmds,
          command,
          fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {
        // this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {
        // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
        if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else cmds = $.extend({}, commandList.rtl, commandList.ltr);
      }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {
        // execute function  if exists
        var returnValue = fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {
          // execute function when event was handled
          functions.handled(returnValue);
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {
          // execute function when event was not handled
          functions.unhandled();
        }
      }
    },


    /**
     * Finds all focusable elements within the given `$element`
     * @param {jQuery} $element - jQuery object to search within
     * @return {jQuery} $focusable - all focusable elements within `$element`
     */
    findFocusable: function findFocusable($element) {
      if (!$element) {
        return false;
      }
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {
          return false;
        } //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },


    /**
     * Returns the component name name
     * @param {Object} component - Foundation component, e.g. Slider or Reveal
     * @return String componentName
     */

    register: function register(componentName, cmds) {
      commands[componentName] = cmds;
    },


    /**
     * Traps the focus in the given element.
     * @param  {jQuery} $element  jQuery object to trap the foucs into.
     */
    trapFocus: function trapFocus($element) {
      var $focusable = Foundation.Keyboard.findFocusable($element),
          $firstFocusable = $focusable.eq(0),
          $lastFocusable = $focusable.eq(-1);

      $element.on('keydown.zf.trapfocus', function (event) {
        if (event.target === $lastFocusable[0] && Foundation.Keyboard.parseKey(event) === 'TAB') {
          event.preventDefault();
          $firstFocusable.focus();
        } else if (event.target === $firstFocusable[0] && Foundation.Keyboard.parseKey(event) === 'SHIFT_TAB') {
          event.preventDefault();
          $lastFocusable.focus();
        }
      });
    },

    /**
     * Releases the trapped focus from the given element.
     * @param  {jQuery} $element  jQuery object to release the focus for.
     */
    releaseFocus: function releaseFocus($element) {
      $element.off('keydown.zf.trapfocus');
    }
  };

  /*
   * Constants for easier comparing.
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {
      k[kcs[kc]] = kcs[kc];
    }return k;
  }

  Foundation.Keyboard = Keyboard;
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  var MediaQuery = {
    queries: [],

    current: '',

    /**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
    _init: function _init() {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        if (namedQueries.hasOwnProperty(key)) {
          self.queries.push({
            name: key,
            value: 'only screen and (min-width: ' + namedQueries[key] + ')'
          });
        }
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },


    /**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
    atLeast: function atLeast(size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },


    /**
     * Checks if the screen matches to a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it does not.
     */
    is: function is(size) {
      size = size.trim().split(' ');
      if (size.length > 1 && size[1] === 'only') {
        if (size[0] === this._getCurrentSize()) return true;
      } else {
        return this.atLeast(size[0]);
      }
      return false;
    },


    /**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
    get: function get(size) {
      for (var i in this.queries) {
        if (this.queries.hasOwnProperty(i)) {
          var query = this.queries[i];
          if (size === query.name) return query.value;
        }
      }

      return null;
    },


    /**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
    _getCurrentSize: function _getCurrentSize() {
      var matched;

      for (var i = 0; i < this.queries.length; i++) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if ((typeof matched === 'undefined' ? 'undefined' : _typeof(matched)) === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },


    /**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
    _watcher: function _watcher() {
      var _this = this;

      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize(),
            currentSize = _this.current;

        if (newSize !== currentSize) {
          // Change the current media query
          _this.current = newSize;

          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
        }
      });
    }
  };

  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script && script.parentNode && script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function matchMedium(media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;
}(jQuery);
'use strict';

!function ($) {

  /**
   * Motion module.
   * @module foundation.motion
   */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function animateIn(element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function animateOut(element, animation, cb) {
      animate(false, element, animation, cb);
    }
  };

  function Move(duration, elem, fn) {
    var anim,
        prog,
        start = null;
    // console.log('called');

    if (duration === 0) {
      fn.apply(elem);
      elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      return;
    }

    function move(ts) {
      if (!start) start = ts;
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {
        anim = window.requestAnimationFrame(move, elem);
      } else {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
   * Animates an element in or out using a CSS transition class.
   * @function
   * @private
   * @param {Boolean} isIn - Defines if the animation is in or out.
   * @param {Object} element - jQuery or HTML object to animate.
   * @param {String} animation - CSS class to use.
   * @param {Function} cb - Callback to run when animation is finished.
   */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.addClass(animation).css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.css('transition', '').addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;
}(jQuery);
'use strict';

!function ($) {

  var Nest = {
    Feather: function Feather(menu) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zf';

      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      items.each(function () {
        var $item = $(this),
            $sub = $item.children('ul');

        if ($sub.length) {
          $item.addClass(hasSubClass).attr({
            'aria-haspopup': true,
            'aria-label': $item.children('a:first').text()
          });
          // Note:  Drilldowns behave differently in how they hide, and so need
          // additional attributes.  We should look if this possibly over-generalized
          // utility (Nest) is appropriate when we rework menus in 6.4
          if (type === 'drilldown') {
            $item.attr({ 'aria-expanded': false });
          }

          $sub.addClass('submenu ' + subMenuClass).attr({
            'data-submenu': '',
            'role': 'menu'
          });
          if (type === 'drilldown') {
            $sub.attr({ 'aria-hidden': true });
          }
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },
    Burn: function Burn(menu, type) {
      var //items = menu.find('li'),
      subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('>li, .menu, .menu > li').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    }
  };

  Foundation.Nest = Nest;
}(jQuery);
'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
        duration = options.duration,
        //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
        remain = -1,
        start,
        timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        if (cb && typeof cb === 'function') {
          cb();
        }
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
   * Runs a callback function when images are fully loaded.
   * @param {Object} images - Image(s) to check if loaded.
   * @param {Func} callback - Function to execute when image is fully loaded.
   */
  function onImagesLoaded(images, callback) {
    var self = this,
        unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      // Check if image is loaded
      if (this.complete || this.readyState === 4 || this.readyState === 'complete') {
        singleImageLoaded();
      }
      // Force load the image
      else {
          // fix for IE. See https://css-tricks.com/snippets/jquery/fixing-load-in-ie-for-cached-images/
          var src = $(this).attr('src');
          $(this).attr('src', src + '?' + new Date().getTime());
          $(this).one('load', function () {
            singleImageLoaded();
          });
        }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;
}(jQuery);
'use strict';

//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function ($) {

	$.spotSwipe = {
		version: '1.0.0',
		enabled: 'ontouchstart' in document.documentElement,
		preventDefault: false,
		moveThreshold: 75,
		timeThreshold: 200
	};

	var startPosX,
	    startPosY,
	    startTime,
	    elapsedTime,
	    isMoving = false;

	function onTouchEnd() {
		//  alert(this);
		this.removeEventListener('touchmove', onTouchMove);
		this.removeEventListener('touchend', onTouchEnd);
		isMoving = false;
	}

	function onTouchMove(e) {
		if ($.spotSwipe.preventDefault) {
			e.preventDefault();
		}
		if (isMoving) {
			var x = e.touches[0].pageX;
			var y = e.touches[0].pageY;
			var dx = startPosX - x;
			var dy = startPosY - y;
			var dir;
			elapsedTime = new Date().getTime() - startTime;
			if (Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
				dir = dx > 0 ? 'left' : 'right';
			}
			// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
			//   dir = dy > 0 ? 'down' : 'up';
			// }
			if (dir) {
				e.preventDefault();
				onTouchEnd.call(this);
				$(this).trigger('swipe', dir).trigger('swipe' + dir);
			}
		}
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startPosX = e.touches[0].pageX;
			startPosY = e.touches[0].pageY;
			isMoving = true;
			startTime = new Date().getTime();
			this.addEventListener('touchmove', onTouchMove, false);
			this.addEventListener('touchend', onTouchEnd, false);
		}
	}

	function init() {
		this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
	}

	function teardown() {
		this.removeEventListener('touchstart', onTouchStart);
	}

	$.event.special.swipe = { setup: init };

	$.each(['left', 'up', 'down', 'right'], function () {
		$.event.special['swipe' + this] = { setup: function setup() {
				$(this).on('swipe', $.noop);
			} };
	});
})(jQuery);
/****************************************************
 * Method for adding psuedo drag events to elements *
 ***************************************************/
!function ($) {
	$.fn.addTouch = function () {
		this.each(function (i, el) {
			$(el).bind('touchstart touchmove touchend touchcancel', function () {
				//we pass the original event object because the jQuery event
				//object is normalized to w3c specs and does not provide the TouchList
				handleTouch(event);
			});
		});

		var handleTouch = function handleTouch(event) {
			var touches = event.changedTouches,
			    first = touches[0],
			    eventTypes = {
				touchstart: 'mousedown',
				touchmove: 'mousemove',
				touchend: 'mouseup'
			},
			    type = eventTypes[event.type],
			    simulatedEvent;

			if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
				simulatedEvent = new window.MouseEvent(type, {
					'bubbles': true,
					'cancelable': true,
					'screenX': first.screenX,
					'screenY': first.screenY,
					'clientX': first.clientX,
					'clientY': first.clientY
				});
			} else {
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
			}
			first.target.dispatchEvent(simulatedEvent);
		};
	};
}(jQuery);

//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function triggers(el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    var id = $(this).data('toggle');
    if (id) {
      triggers($(this), 'toggle');
    } else {
      $(this).trigger('toggle.zf.trigger');
    }
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
  * Fires once after all other scripts have loaded
  * @function
  * @private
  */
  $(window).on('load', function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    mutateListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
        plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if ((typeof pluginName === 'undefined' ? 'undefined' : _typeof(pluginName)) === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').on('resize.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').on('scroll.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function mutateListener(debounce) {
    var $nodes = $('[data-mutate]');
    if ($nodes.length && MutationObserver) {
      //trigger all listening elements and signal a mutate event
      //no IE 9 or 10
      $nodes.each(function () {
        $(this).triggerHandler('mutateme.zf.trigger');
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {
      return false;
    }
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function listeningElementsMutation(mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);

      //trigger the event handler for the element depending on type
      switch (mutationRecordsList[0].type) {

        case "attributes":
          if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          }
          if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('resizeme.zf.trigger', [$target]);
          }
          if (mutationRecordsList[0].attributeName === "style") {
            $target.closest("[data-mutate]").attr("data-events", "mutate");
            $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          }
          break;

        case "childList":
          $target.closest("[data-mutate]").attr("data-events", "mutate");
          $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;
}(jQuery);

// function domMutationObserver(debounce) {
//   // !!! This is coming soon and needs more work; not active  !!! //
//   var timer,
//   nodes = document.querySelectorAll('[data-mutate]');
//   //
//   if (nodes.length) {
//     // var MutationObserver = (function () {
//     //   var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
//     //   for (var i=0; i < prefixes.length; i++) {
//     //     if (prefixes[i] + 'MutationObserver' in window) {
//     //       return window[prefixes[i] + 'MutationObserver'];
//     //     }
//     //   }
//     //   return false;
//     // }());
//
//
//     //for the body, we need to listen for all changes effecting the style and class attributes
//     var bodyObserver = new MutationObserver(bodyMutation);
//     bodyObserver.observe(document.body, { attributes: true, childList: true, characterData: false, subtree:true, attributeFilter:["style", "class"]});
//
//
//     //body callback
//     function bodyMutation(mutate) {
//       //trigger all listening elements and signal a mutation event
//       if (timer) { clearTimeout(timer); }
//
//       timer = setTimeout(function() {
//         bodyObserver.disconnect();
//         $('[data-mutate]').attr('data-events',"mutate");
//       }, debounce || 150);
//     }
//   }
// }
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Abide module.
   * @module foundation.abide
   */

  var Abide = function () {
    /**
     * Creates a new instance of Abide.
     * @class
     * @fires Abide#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Abide(element) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Abide);

      this.$element = element;
      this.options = $.extend({}, Abide.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Abide');
    }

    /**
     * Initializes the Abide plugin and calls functions to get Abide functioning on load.
     * @private
     */


    _createClass(Abide, [{
      key: '_init',
      value: function _init() {
        this.$inputs = this.$element.find('input, textarea, select');

        this._events();
      }

      /**
       * Initializes events for Abide.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this2 = this;

        this.$element.off('.abide').on('reset.zf.abide', function () {
          _this2.resetForm();
        }).on('submit.zf.abide', function () {
          return _this2.validateForm();
        });

        if (this.options.validateOn === 'fieldChange') {
          this.$inputs.off('change.zf.abide').on('change.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }

        if (this.options.liveValidate) {
          this.$inputs.off('input.zf.abide').on('input.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }

        if (this.options.validateOnBlur) {
          this.$inputs.off('blur.zf.abide').on('blur.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }
      }

      /**
       * Calls necessary functions to update Abide upon DOM change
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        this._init();
      }

      /**
       * Checks whether or not a form element has the required attribute and if it's checked or not
       * @param {Object} element - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'requiredCheck',
      value: function requiredCheck($el) {
        if (!$el.attr('required')) return true;

        var isGood = true;

        switch ($el[0].type) {
          case 'checkbox':
            isGood = $el[0].checked;
            break;

          case 'select':
          case 'select-one':
          case 'select-multiple':
            var opt = $el.find('option:selected');
            if (!opt.length || !opt.val()) isGood = false;
            break;

          default:
            if (!$el.val() || !$el.val().length) isGood = false;
        }

        return isGood;
      }

      /**
       * Based on $el, get the first element with selector in this order:
       * 1. The element's direct sibling('s).
       * 3. The element's parent's children.
       *
       * This allows for multiple form errors per input, though if none are found, no form errors will be shown.
       *
       * @param {Object} $el - jQuery object to use as reference to find the form error selector.
       * @returns {Object} jQuery object with the selector.
       */

    }, {
      key: 'findFormError',
      value: function findFormError($el) {
        var $error = $el.siblings(this.options.formErrorSelector);

        if (!$error.length) {
          $error = $el.parent().find(this.options.formErrorSelector);
        }

        return $error;
      }

      /**
       * Get the first element in this order:
       * 2. The <label> with the attribute `[for="someInputId"]`
       * 3. The `.closest()` <label>
       *
       * @param {Object} $el - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'findLabel',
      value: function findLabel($el) {
        var id = $el[0].id;
        var $label = this.$element.find('label[for="' + id + '"]');

        if (!$label.length) {
          return $el.closest('label');
        }

        return $label;
      }

      /**
       * Get the set of labels associated with a set of radio els in this order
       * 2. The <label> with the attribute `[for="someInputId"]`
       * 3. The `.closest()` <label>
       *
       * @param {Object} $el - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'findRadioLabels',
      value: function findRadioLabels($els) {
        var _this3 = this;

        var labels = $els.map(function (i, el) {
          var id = el.id;
          var $label = _this3.$element.find('label[for="' + id + '"]');

          if (!$label.length) {
            $label = $(el).closest('label');
          }
          return $label[0];
        });

        return $(labels);
      }

      /**
       * Adds the CSS error class as specified by the Abide settings to the label, input, and the form
       * @param {Object} $el - jQuery object to add the class to
       */

    }, {
      key: 'addErrorClasses',
      value: function addErrorClasses($el) {
        var $label = this.findLabel($el);
        var $formError = this.findFormError($el);

        if ($label.length) {
          $label.addClass(this.options.labelErrorClass);
        }

        if ($formError.length) {
          $formError.addClass(this.options.formErrorClass);
        }

        $el.addClass(this.options.inputErrorClass).attr('data-invalid', '');
      }

      /**
       * Remove CSS error classes etc from an entire radio button group
       * @param {String} groupName - A string that specifies the name of a radio button group
       *
       */

    }, {
      key: 'removeRadioErrorClasses',
      value: function removeRadioErrorClasses(groupName) {
        var $els = this.$element.find(':radio[name="' + groupName + '"]');
        var $labels = this.findRadioLabels($els);
        var $formErrors = this.findFormError($els);

        if ($labels.length) {
          $labels.removeClass(this.options.labelErrorClass);
        }

        if ($formErrors.length) {
          $formErrors.removeClass(this.options.formErrorClass);
        }

        $els.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
      }

      /**
       * Removes CSS error class as specified by the Abide settings from the label, input, and the form
       * @param {Object} $el - jQuery object to remove the class from
       */

    }, {
      key: 'removeErrorClasses',
      value: function removeErrorClasses($el) {
        // radios need to clear all of the els
        if ($el[0].type == 'radio') {
          return this.removeRadioErrorClasses($el.attr('name'));
        }

        var $label = this.findLabel($el);
        var $formError = this.findFormError($el);

        if ($label.length) {
          $label.removeClass(this.options.labelErrorClass);
        }

        if ($formError.length) {
          $formError.removeClass(this.options.formErrorClass);
        }

        $el.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
      }

      /**
       * Goes through a form to find inputs and proceeds to validate them in ways specific to their type
       * @fires Abide#invalid
       * @fires Abide#valid
       * @param {Object} element - jQuery object to validate, should be an HTML input
       * @returns {Boolean} goodToGo - If the input is valid or not.
       */

    }, {
      key: 'validateInput',
      value: function validateInput($el) {
        var clearRequire = this.requiredCheck($el),
            validated = false,
            customValidator = true,
            validator = $el.attr('data-validator'),
            equalTo = true;

        // don't validate ignored inputs or hidden inputs
        if ($el.is('[data-abide-ignore]') || $el.is('[type="hidden"]')) {
          return true;
        }

        switch ($el[0].type) {
          case 'radio':
            validated = this.validateRadio($el.attr('name'));
            break;

          case 'checkbox':
            validated = clearRequire;
            break;

          case 'select':
          case 'select-one':
          case 'select-multiple':
            validated = clearRequire;
            break;

          default:
            validated = this.validateText($el);
        }

        if (validator) {
          customValidator = this.matchValidation($el, validator, $el.attr('required'));
        }

        if ($el.attr('data-equalto')) {
          equalTo = this.options.validators.equalTo($el);
        }

        var goodToGo = [clearRequire, validated, customValidator, equalTo].indexOf(false) === -1;
        var message = (goodToGo ? 'valid' : 'invalid') + '.zf.abide';

        if (goodToGo) {
          // Re-validate inputs that depend on this one with equalto
          var dependentElements = this.$element.find('[data-equalto="' + $el.attr('id') + '"]');
          if (dependentElements.length) {
            var _this = this;
            dependentElements.each(function () {
              if ($(this).val()) {
                _this.validateInput($(this));
              }
            });
          }
        }

        this[goodToGo ? 'removeErrorClasses' : 'addErrorClasses']($el);

        /**
         * Fires when the input is done checking for validation. Event trigger is either `valid.zf.abide` or `invalid.zf.abide`
         * Trigger includes the DOM element of the input.
         * @event Abide#valid
         * @event Abide#invalid
         */
        $el.trigger(message, [$el]);

        return goodToGo;
      }

      /**
       * Goes through a form and if there are any invalid inputs, it will display the form error element
       * @returns {Boolean} noError - true if no errors were detected...
       * @fires Abide#formvalid
       * @fires Abide#forminvalid
       */

    }, {
      key: 'validateForm',
      value: function validateForm() {
        var acc = [];
        var _this = this;

        this.$inputs.each(function () {
          acc.push(_this.validateInput($(this)));
        });

        var noError = acc.indexOf(false) === -1;

        this.$element.find('[data-abide-error]').css('display', noError ? 'none' : 'block');

        /**
         * Fires when the form is finished validating. Event trigger is either `formvalid.zf.abide` or `forminvalid.zf.abide`.
         * Trigger includes the element of the form.
         * @event Abide#formvalid
         * @event Abide#forminvalid
         */
        this.$element.trigger((noError ? 'formvalid' : 'forminvalid') + '.zf.abide', [this.$element]);

        return noError;
      }

      /**
       * Determines whether or a not a text input is valid based on the pattern specified in the attribute. If no matching pattern is found, returns true.
       * @param {Object} $el - jQuery object to validate, should be a text input HTML element
       * @param {String} pattern - string value of one of the RegEx patterns in Abide.options.patterns
       * @returns {Boolean} Boolean value depends on whether or not the input value matches the pattern specified
       */

    }, {
      key: 'validateText',
      value: function validateText($el, pattern) {
        // A pattern can be passed to this function, or it will be infered from the input's "pattern" attribute, or it's "type" attribute
        pattern = pattern || $el.attr('pattern') || $el.attr('type');
        var inputText = $el.val();
        var valid = false;

        if (inputText.length) {
          // If the pattern attribute on the element is in Abide's list of patterns, then test that regexp
          if (this.options.patterns.hasOwnProperty(pattern)) {
            valid = this.options.patterns[pattern].test(inputText);
          }
          // If the pattern name isn't also the type attribute of the field, then test it as a regexp
          else if (pattern !== $el.attr('type')) {
              valid = new RegExp(pattern).test(inputText);
            } else {
              valid = true;
            }
        }
        // An empty field is valid if it's not required
        else if (!$el.prop('required')) {
            valid = true;
          }

        return valid;
      }

      /**
       * Determines whether or a not a radio input is valid based on whether or not it is required and selected. Although the function targets a single `<input>`, it validates by checking the `required` and `checked` properties of all radio buttons in its group.
       * @param {String} groupName - A string that specifies the name of a radio button group
       * @returns {Boolean} Boolean value depends on whether or not at least one radio input has been selected (if it's required)
       */

    }, {
      key: 'validateRadio',
      value: function validateRadio(groupName) {
        // If at least one radio in the group has the `required` attribute, the group is considered required
        // Per W3C spec, all radio buttons in a group should have `required`, but we're being nice
        var $group = this.$element.find(':radio[name="' + groupName + '"]');
        var valid = false,
            required = false;

        // For the group to be required, at least one radio needs to be required
        $group.each(function (i, e) {
          if ($(e).attr('required')) {
            required = true;
          }
        });
        if (!required) valid = true;

        if (!valid) {
          // For the group to be valid, at least one radio needs to be checked
          $group.each(function (i, e) {
            if ($(e).prop('checked')) {
              valid = true;
            }
          });
        };

        return valid;
      }

      /**
       * Determines if a selected input passes a custom validation function. Multiple validations can be used, if passed to the element with `data-validator="foo bar baz"` in a space separated listed.
       * @param {Object} $el - jQuery input element.
       * @param {String} validators - a string of function names matching functions in the Abide.options.validators object.
       * @param {Boolean} required - self explanatory?
       * @returns {Boolean} - true if validations passed.
       */

    }, {
      key: 'matchValidation',
      value: function matchValidation($el, validators, required) {
        var _this4 = this;

        required = required ? true : false;

        var clear = validators.split(' ').map(function (v) {
          return _this4.options.validators[v]($el, required, $el.parent());
        });
        return clear.indexOf(false) === -1;
      }

      /**
       * Resets form inputs and styles
       * @fires Abide#formreset
       */

    }, {
      key: 'resetForm',
      value: function resetForm() {
        var $form = this.$element,
            opts = this.options;

        $('.' + opts.labelErrorClass, $form).not('small').removeClass(opts.labelErrorClass);
        $('.' + opts.inputErrorClass, $form).not('small').removeClass(opts.inputErrorClass);
        $(opts.formErrorSelector + '.' + opts.formErrorClass).removeClass(opts.formErrorClass);
        $form.find('[data-abide-error]').css('display', 'none');
        $(':input', $form).not(':button, :submit, :reset, :hidden, :radio, :checkbox, [data-abide-ignore]').val('').removeAttr('data-invalid');
        $(':input:radio', $form).not('[data-abide-ignore]').prop('checked', false).removeAttr('data-invalid');
        $(':input:checkbox', $form).not('[data-abide-ignore]').prop('checked', false).removeAttr('data-invalid');
        /**
         * Fires when the form has been reset.
         * @event Abide#formreset
         */
        $form.trigger('formreset.zf.abide', [$form]);
      }

      /**
       * Destroys an instance of Abide.
       * Removes error styles and classes from elements, without resetting their values.
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        var _this = this;
        this.$element.off('.abide').find('[data-abide-error]').css('display', 'none');

        this.$inputs.off('.abide').each(function () {
          _this.removeErrorClasses($(this));
        });

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Abide;
  }();

  /**
   * Default settings for plugin
   */


  Abide.defaults = {
    /**
     * The default event to validate inputs. Checkboxes and radios validate immediately.
     * Remove or change this value for manual validation.
     * @option
     * @example 'fieldChange'
     */
    validateOn: 'fieldChange',

    /**
     * Class to be applied to input labels on failed validation.
     * @option
     * @example 'is-invalid-label'
     */
    labelErrorClass: 'is-invalid-label',

    /**
     * Class to be applied to inputs on failed validation.
     * @option
     * @example 'is-invalid-input'
     */
    inputErrorClass: 'is-invalid-input',

    /**
     * Class selector to use to target Form Errors for show/hide.
     * @option
     * @example '.form-error'
     */
    formErrorSelector: '.form-error',

    /**
     * Class added to Form Errors on failed validation.
     * @option
     * @example 'is-visible'
     */
    formErrorClass: 'is-visible',

    /**
     * Set to true to validate text inputs on any value change.
     * @option
     * @example false
     */
    liveValidate: false,

    /**
     * Set to true to validate inputs on blur.
     * @option
     * @example false
     */
    validateOnBlur: false,

    patterns: {
      alpha: /^[a-zA-Z]+$/,
      alpha_numeric: /^[a-zA-Z0-9]+$/,
      integer: /^[-+]?\d+$/,
      number: /^[-+]?\d*(?:[\.\,]\d+)?$/,

      // amex, visa, diners
      card: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
      cvv: /^([0-9]){3,4}$/,

      // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
      email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

      url: /^(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
      // abc.de
      domain: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,8}$/,

      datetime: /^([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))$/,
      // YYYY-MM-DD
      date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/,
      // HH:MM:SS
      time: /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}$/,
      dateISO: /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
      // MM/DD/YYYY
      month_day_year: /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d{4}$/,
      // DD/MM/YYYY
      day_month_year: /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]\d{4}$/,

      // #FFF or #FFFFFF
      color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
    },

    /**
     * Optional validation functions to be used. `equalTo` being the only default included function.
     * Functions should return only a boolean if the input is valid or not. Functions are given the following arguments:
     * el : The jQuery element to validate.
     * required : Boolean value of the required attribute be present or not.
     * parent : The direct parent of the input.
     * @option
     */
    validators: {
      equalTo: function equalTo(el, required, parent) {
        return $('#' + el.attr('data-equalto')).val() === el.val();
      }
    }
  };

  // Window exports
  Foundation.plugin(Abide, 'Abide');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Accordion module.
   * @module foundation.accordion
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   */

  var Accordion = function () {
    /**
     * Creates a new instance of an accordion.
     * @class
     * @fires Accordion#init
     * @param {jQuery} element - jQuery object to make into an accordion.
     * @param {Object} options - a plain object with settings to override the default options.
     */
    function Accordion(element, options) {
      _classCallCheck(this, Accordion);

      this.$element = element;
      this.options = $.extend({}, Accordion.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Accordion');
      Foundation.Keyboard.register('Accordion', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_DOWN': 'next',
        'ARROW_UP': 'previous'
      });
    }

    /**
     * Initializes the accordion by animating the preset active pane(s).
     * @private
     */


    _createClass(Accordion, [{
      key: '_init',
      value: function _init() {
        this.$element.attr('role', 'tablist');
        this.$tabs = this.$element.children('[data-accordion-item]');

        this.$tabs.each(function (idx, el) {
          var $el = $(el),
              $content = $el.children('[data-tab-content]'),
              id = $content[0].id || Foundation.GetYoDigits(6, 'accordion'),
              linkId = el.id || id + '-label';

          $el.find('a:first').attr({
            'aria-controls': id,
            'role': 'tab',
            'id': linkId,
            'aria-expanded': false,
            'aria-selected': false
          });

          $content.attr({ 'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id });
        });
        var $initActive = this.$element.find('.is-active').children('[data-tab-content]');
        if ($initActive.length) {
          this.down($initActive, true);
        }
        this._events();
      }

      /**
       * Adds event handlers for items within the accordion.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$tabs.each(function () {
          var $elem = $(this);
          var $tabContent = $elem.children('[data-tab-content]');
          if ($tabContent.length) {
            $elem.children('a').off('click.zf.accordion keydown.zf.accordion').on('click.zf.accordion', function (e) {
              e.preventDefault();
              _this.toggle($tabContent);
            }).on('keydown.zf.accordion', function (e) {
              Foundation.Keyboard.handleKey(e, 'Accordion', {
                toggle: function toggle() {
                  _this.toggle($tabContent);
                },
                next: function next() {
                  var $a = $elem.next().find('a').focus();
                  if (!_this.options.multiExpand) {
                    $a.trigger('click.zf.accordion');
                  }
                },
                previous: function previous() {
                  var $a = $elem.prev().find('a').focus();
                  if (!_this.options.multiExpand) {
                    $a.trigger('click.zf.accordion');
                  }
                },
                handled: function handled() {
                  e.preventDefault();
                  e.stopPropagation();
                }
              });
            });
          }
        });
      }

      /**
       * Toggles the selected content pane's open/close state.
       * @param {jQuery} $target - jQuery object of the pane to toggle (`.accordion-content`).
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle($target) {
        if ($target.parent().hasClass('is-active')) {
          this.up($target);
        } else {
          this.down($target);
        }
      }

      /**
       * Opens the accordion tab defined by `$target`.
       * @param {jQuery} $target - Accordion pane to open (`.accordion-content`).
       * @param {Boolean} firstTime - flag to determine if reflow should happen.
       * @fires Accordion#down
       * @function
       */

    }, {
      key: 'down',
      value: function down($target, firstTime) {
        var _this2 = this;

        $target.attr('aria-hidden', false).parent('[data-tab-content]').addBack().parent().addClass('is-active');

        if (!this.options.multiExpand && !firstTime) {
          var $currentActive = this.$element.children('.is-active').children('[data-tab-content]');
          if ($currentActive.length) {
            this.up($currentActive.not($target));
          }
        }

        $target.slideDown(this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done opening.
           * @event Accordion#down
           */
          _this2.$element.trigger('down.zf.accordion', [$target]);
        });

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': true,
          'aria-selected': true
        });
      }

      /**
       * Closes the tab defined by `$target`.
       * @param {jQuery} $target - Accordion tab to close (`.accordion-content`).
       * @fires Accordion#up
       * @function
       */

    }, {
      key: 'up',
      value: function up($target) {
        var $aunts = $target.parent().siblings(),
            _this = this;

        if (!this.options.allowAllClosed && !$aunts.hasClass('is-active') || !$target.parent().hasClass('is-active')) {
          return;
        }

        // Foundation.Move(this.options.slideSpeed, $target, function(){
        $target.slideUp(_this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done collapsing up.
           * @event Accordion#up
           */
          _this.$element.trigger('up.zf.accordion', [$target]);
        });
        // });

        $target.attr('aria-hidden', true).parent().removeClass('is-active');

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': false,
          'aria-selected': false
        });
      }

      /**
       * Destroys an instance of an accordion.
       * @fires Accordion#destroyed
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('[data-tab-content]').stop(true).slideUp(0).css('display', '');
        this.$element.find('a').off('.zf.accordion');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Accordion;
  }();

  Accordion.defaults = {
    /**
     * Amount of time to animate the opening of an accordion pane.
     * @option
     * @example 250
     */
    slideSpeed: 250,
    /**
     * Allow the accordion to have multiple open panes.
     * @option
     * @example false
     */
    multiExpand: false,
    /**
     * Allow the accordion to close all panes.
     * @option
     * @example false
     */
    allowAllClosed: false
  };

  // Window exports
  Foundation.plugin(Accordion, 'Accordion');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * AccordionMenu module.
   * @module foundation.accordionMenu
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   * @requires foundation.util.nest
   */

  var AccordionMenu = function () {
    /**
     * Creates a new instance of an accordion menu.
     * @class
     * @fires AccordionMenu#init
     * @param {jQuery} element - jQuery object to make into an accordion menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function AccordionMenu(element, options) {
      _classCallCheck(this, AccordionMenu);

      this.$element = element;
      this.options = $.extend({}, AccordionMenu.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'accordion');

      this._init();

      Foundation.registerPlugin(this, 'AccordionMenu');
      Foundation.Keyboard.register('AccordionMenu', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_RIGHT': 'open',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'close',
        'ESCAPE': 'closeAll'
      });
    }

    /**
     * Initializes the accordion menu by hiding all nested menus.
     * @private
     */


    _createClass(AccordionMenu, [{
      key: '_init',
      value: function _init() {
        this.$element.find('[data-submenu]').not('.is-active').slideUp(0); //.find('a').css('padding-left', '1rem');
        this.$element.attr({
          'role': 'menu',
          'aria-multiselectable': this.options.multiOpen
        });

        this.$menuLinks = this.$element.find('.is-accordion-submenu-parent');
        this.$menuLinks.each(function () {
          var linkId = this.id || Foundation.GetYoDigits(6, 'acc-menu-link'),
              $elem = $(this),
              $sub = $elem.children('[data-submenu]'),
              subId = $sub[0].id || Foundation.GetYoDigits(6, 'acc-menu'),
              isActive = $sub.hasClass('is-active');
          $elem.attr({
            'aria-controls': subId,
            'aria-expanded': isActive,
            'role': 'menuitem',
            'id': linkId
          });
          $sub.attr({
            'aria-labelledby': linkId,
            'aria-hidden': !isActive,
            'role': 'menu',
            'id': subId
          });
        });
        var initPanes = this.$element.find('.is-active');
        if (initPanes.length) {
          var _this = this;
          initPanes.each(function () {
            _this.down($(this));
          });
        }
        this._events();
      }

      /**
       * Adds event handlers for items within the menu.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$element.find('li').each(function () {
          var $submenu = $(this).children('[data-submenu]');

          if ($submenu.length) {
            $(this).children('a').off('click.zf.accordionMenu').on('click.zf.accordionMenu', function (e) {
              e.preventDefault();

              _this.toggle($submenu);
            });
          }
        }).on('keydown.zf.accordionmenu', function (e) {
          var $element = $(this),
              $elements = $element.parent('ul').children('li'),
              $prevElement,
              $nextElement,
              $target = $element.children('[data-submenu]');

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(Math.max(0, i - 1)).find('a').first();
              $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1)).find('a').first();

              if ($(this).children('[data-submenu]:visible').length) {
                // has open sub menu
                $nextElement = $element.find('li:first-child').find('a').first();
              }
              if ($(this).is(':first-child')) {
                // is first element of sub menu
                $prevElement = $element.parents('li').first().find('a').first();
              } else if ($prevElement.parents('li').first().children('[data-submenu]:visible').length) {
                // if previous element has open sub menu
                $prevElement = $prevElement.parents('li').find('li:last-child').find('a').first();
              }
              if ($(this).is(':last-child')) {
                // is last element of sub menu
                $nextElement = $element.parents('li').first().next('li').find('a').first();
              }

              return;
            }
          });

          Foundation.Keyboard.handleKey(e, 'AccordionMenu', {
            open: function open() {
              if ($target.is(':hidden')) {
                _this.down($target);
                $target.find('li').first().find('a').first().focus();
              }
            },
            close: function close() {
              if ($target.length && !$target.is(':hidden')) {
                // close active sub of this item
                _this.up($target);
              } else if ($element.parent('[data-submenu]').length) {
                // close currently open sub
                _this.up($element.parent('[data-submenu]'));
                $element.parents('li').first().find('a').first().focus();
              }
            },
            up: function up() {
              $prevElement.focus();
              return true;
            },
            down: function down() {
              $nextElement.focus();
              return true;
            },
            toggle: function toggle() {
              if ($element.children('[data-submenu]').length) {
                _this.toggle($element.children('[data-submenu]'));
              }
            },
            closeAll: function closeAll() {
              _this.hideAll();
            },
            handled: function handled(preventDefault) {
              if (preventDefault) {
                e.preventDefault();
              }
              e.stopImmediatePropagation();
            }
          });
        }); //.attr('tabindex', 0);
      }

      /**
       * Closes all panes of the menu.
       * @function
       */

    }, {
      key: 'hideAll',
      value: function hideAll() {
        this.up(this.$element.find('[data-submenu]'));
      }

      /**
       * Opens all panes of the menu.
       * @function
       */

    }, {
      key: 'showAll',
      value: function showAll() {
        this.down(this.$element.find('[data-submenu]'));
      }

      /**
       * Toggles the open/close state of a submenu.
       * @function
       * @param {jQuery} $target - the submenu to toggle
       */

    }, {
      key: 'toggle',
      value: function toggle($target) {
        if (!$target.is(':animated')) {
          if (!$target.is(':hidden')) {
            this.up($target);
          } else {
            this.down($target);
          }
        }
      }

      /**
       * Opens the sub-menu defined by `$target`.
       * @param {jQuery} $target - Sub-menu to open.
       * @fires AccordionMenu#down
       */

    }, {
      key: 'down',
      value: function down($target) {
        var _this = this;

        if (!this.options.multiOpen) {
          this.up(this.$element.find('.is-active').not($target.parentsUntil(this.$element).add($target)));
        }

        $target.addClass('is-active').attr({ 'aria-hidden': false }).parent('.is-accordion-submenu-parent').attr({ 'aria-expanded': true });

        //Foundation.Move(this.options.slideSpeed, $target, function() {
        $target.slideDown(_this.options.slideSpeed, function () {
          /**
           * Fires when the menu is done opening.
           * @event AccordionMenu#down
           */
          _this.$element.trigger('down.zf.accordionMenu', [$target]);
        });
        //});
      }

      /**
       * Closes the sub-menu defined by `$target`. All sub-menus inside the target will be closed as well.
       * @param {jQuery} $target - Sub-menu to close.
       * @fires AccordionMenu#up
       */

    }, {
      key: 'up',
      value: function up($target) {
        var _this = this;
        //Foundation.Move(this.options.slideSpeed, $target, function(){
        $target.slideUp(_this.options.slideSpeed, function () {
          /**
           * Fires when the menu is done collapsing up.
           * @event AccordionMenu#up
           */
          _this.$element.trigger('up.zf.accordionMenu', [$target]);
        });
        //});

        var $menus = $target.find('[data-submenu]').slideUp(0).addBack().attr('aria-hidden', true);

        $menus.parent('.is-accordion-submenu-parent').attr('aria-expanded', false);
      }

      /**
       * Destroys an instance of accordion menu.
       * @fires AccordionMenu#destroyed
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('[data-submenu]').slideDown(0).css('display', '');
        this.$element.find('a').off('click.zf.accordionMenu');

        Foundation.Nest.Burn(this.$element, 'accordion');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return AccordionMenu;
  }();

  AccordionMenu.defaults = {
    /**
     * Amount of time to animate the opening of a submenu in ms.
     * @option
     * @example 250
     */
    slideSpeed: 250,
    /**
     * Allow the menu to have multiple open panes.
     * @option
     * @example true
     */
    multiOpen: true
  };

  // Window exports
  Foundation.plugin(AccordionMenu, 'AccordionMenu');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Drilldown module.
   * @module foundation.drilldown
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   * @requires foundation.util.nest
   */

  var Drilldown = function () {
    /**
     * Creates a new instance of a drilldown menu.
     * @class
     * @param {jQuery} element - jQuery object to make into an accordion menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Drilldown(element, options) {
      _classCallCheck(this, Drilldown);

      this.$element = element;
      this.options = $.extend({}, Drilldown.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'drilldown');

      this._init();

      Foundation.registerPlugin(this, 'Drilldown');
      Foundation.Keyboard.register('Drilldown', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close',
        'TAB': 'down',
        'SHIFT_TAB': 'up'
      });
    }

    /**
     * Initializes the drilldown by creating jQuery collections of elements
     * @private
     */


    _createClass(Drilldown, [{
      key: '_init',
      value: function _init() {
        this.$submenuAnchors = this.$element.find('li.is-drilldown-submenu-parent').children('a');
        this.$submenus = this.$submenuAnchors.parent('li').children('[data-submenu]');
        this.$menuItems = this.$element.find('li').not('.js-drilldown-back').attr('role', 'menuitem').find('a');
        this.$element.attr('data-mutate', this.$element.attr('data-drilldown') || Foundation.GetYoDigits(6, 'drilldown'));

        this._prepareMenu();
        this._registerEvents();

        this._keyboardEvents();
      }

      /**
       * prepares drilldown menu by setting attributes to links and elements
       * sets a min height to prevent content jumping
       * wraps the element if not already wrapped
       * @private
       * @function
       */

    }, {
      key: '_prepareMenu',
      value: function _prepareMenu() {
        var _this = this;
        // if(!this.options.holdOpen){
        //   this._menuLinkEvents();
        // }
        this.$submenuAnchors.each(function () {
          var $link = $(this);
          var $sub = $link.parent();
          if (_this.options.parentLink) {
            $link.clone().prependTo($sub.children('[data-submenu]')).wrap('<li class="is-submenu-parent-item is-submenu-item is-drilldown-submenu-item" role="menu-item"></li>');
          }
          $link.data('savedHref', $link.attr('href')).removeAttr('href').attr('tabindex', 0);
          $link.children('[data-submenu]').attr({
            'aria-hidden': true,
            'tabindex': 0,
            'role': 'menu'
          });
          _this._events($link);
        });
        this.$submenus.each(function () {
          var $menu = $(this),
              $back = $menu.find('.js-drilldown-back');
          if (!$back.length) {
            switch (_this.options.backButtonPosition) {
              case "bottom":
                $menu.append(_this.options.backButton);
                break;
              case "top":
                $menu.prepend(_this.options.backButton);
                break;
              default:
                console.error("Unsupported backButtonPosition value '" + _this.options.backButtonPosition + "'");
            }
          }
          _this._back($menu);
        });

        if (!this.options.autoHeight) {
          this.$submenus.addClass('drilldown-submenu-cover-previous');
        }

        if (!this.$element.parent().hasClass('is-drilldown')) {
          this.$wrapper = $(this.options.wrapper).addClass('is-drilldown');
          if (this.options.animateHeight) this.$wrapper.addClass('animate-height');
          this.$wrapper = this.$element.wrap(this.$wrapper).parent().css(this._getMaxDims());
        }
      }
    }, {
      key: '_resize',
      value: function _resize() {
        this.$wrapper.css({ 'max-width': 'none', 'min-height': 'none' });
        // _getMaxDims has side effects (boo) but calling it should update all other necessary heights & widths
        this.$wrapper.css(this._getMaxDims());
      }

      /**
       * Adds event handlers to elements in the menu.
       * @function
       * @private
       * @param {jQuery} $elem - the current menu item to add handlers to.
       */

    }, {
      key: '_events',
      value: function _events($elem) {
        var _this = this;

        $elem.off('click.zf.drilldown').on('click.zf.drilldown', function (e) {
          if ($(e.target).parentsUntil('ul', 'li').hasClass('is-drilldown-submenu-parent')) {
            e.stopImmediatePropagation();
            e.preventDefault();
          }

          // if(e.target !== e.currentTarget.firstElementChild){
          //   return false;
          // }
          _this._show($elem.parent('li'));

          if (_this.options.closeOnClick) {
            var $body = $('body');
            $body.off('.zf.drilldown').on('click.zf.drilldown', function (e) {
              if (e.target === _this.$element[0] || $.contains(_this.$element[0], e.target)) {
                return;
              }
              e.preventDefault();
              _this._hideAll();
              $body.off('.zf.drilldown');
            });
          }
        });
        this.$element.on('mutateme.zf.trigger', this._resize.bind(this));
      }

      /**
       * Adds event handlers to the menu element.
       * @function
       * @private
       */

    }, {
      key: '_registerEvents',
      value: function _registerEvents() {
        if (this.options.scrollTop) {
          this._bindHandler = this._scrollTop.bind(this);
          this.$element.on('open.zf.drilldown hide.zf.drilldown closed.zf.drilldown', this._bindHandler);
        }
      }

      /**
       * Scroll to Top of Element or data-scroll-top-element
       * @function
       * @fires Drilldown#scrollme
       */

    }, {
      key: '_scrollTop',
      value: function _scrollTop() {
        var _this = this;
        var $scrollTopElement = _this.options.scrollTopElement != '' ? $(_this.options.scrollTopElement) : _this.$element,
            scrollPos = parseInt($scrollTopElement.offset().top + _this.options.scrollTopOffset);
        $('html, body').stop(true).animate({ scrollTop: scrollPos }, _this.options.animationDuration, _this.options.animationEasing, function () {
          /**
            * Fires after the menu has scrolled
            * @event Drilldown#scrollme
            */
          if (this === $('html')[0]) _this.$element.trigger('scrollme.zf.drilldown');
        });
      }

      /**
       * Adds keydown event listener to `li`'s in the menu.
       * @private
       */

    }, {
      key: '_keyboardEvents',
      value: function _keyboardEvents() {
        var _this = this;

        this.$menuItems.add(this.$element.find('.js-drilldown-back > a, .is-submenu-parent-item > a')).on('keydown.zf.drilldown', function (e) {
          var $element = $(this),
              $elements = $element.parent('li').parent('ul').children('li').children('a'),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(Math.max(0, i - 1));
              $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              return;
            }
          });

          Foundation.Keyboard.handleKey(e, 'Drilldown', {
            next: function next() {
              if ($element.is(_this.$submenuAnchors)) {
                _this._show($element.parent('li'));
                $element.parent('li').one(Foundation.transitionend($element), function () {
                  $element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
                });
                return true;
              }
            },
            previous: function previous() {
              _this._hide($element.parent('li').parent('ul'));
              $element.parent('li').parent('ul').one(Foundation.transitionend($element), function () {
                setTimeout(function () {
                  $element.parent('li').parent('ul').parent('li').children('a').first().focus();
                }, 1);
              });
              return true;
            },
            up: function up() {
              $prevElement.focus();
              return true;
            },
            down: function down() {
              $nextElement.focus();
              return true;
            },
            close: function close() {
              _this._back();
              //_this.$menuItems.first().focus(); // focus to first element
            },
            open: function open() {
              if (!$element.is(_this.$menuItems)) {
                // not menu item means back button
                _this._hide($element.parent('li').parent('ul'));
                $element.parent('li').parent('ul').one(Foundation.transitionend($element), function () {
                  setTimeout(function () {
                    $element.parent('li').parent('ul').parent('li').children('a').first().focus();
                  }, 1);
                });
                return true;
              } else if ($element.is(_this.$submenuAnchors)) {
                _this._show($element.parent('li'));
                $element.parent('li').one(Foundation.transitionend($element), function () {
                  $element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
                });
                return true;
              }
            },
            handled: function handled(preventDefault) {
              if (preventDefault) {
                e.preventDefault();
              }
              e.stopImmediatePropagation();
            }
          });
        }); // end keyboardAccess
      }

      /**
       * Closes all open elements, and returns to root menu.
       * @function
       * @fires Drilldown#closed
       */

    }, {
      key: '_hideAll',
      value: function _hideAll() {
        var $elem = this.$element.find('.is-drilldown-submenu.is-active').addClass('is-closing');
        if (this.options.autoHeight) this.$wrapper.css({ height: $elem.parent().closest('ul').data('calcHeight') });
        $elem.one(Foundation.transitionend($elem), function (e) {
          $elem.removeClass('is-active is-closing');
        });
        /**
         * Fires when the menu is fully closed.
         * @event Drilldown#closed
         */
        this.$element.trigger('closed.zf.drilldown');
      }

      /**
       * Adds event listener for each `back` button, and closes open menus.
       * @function
       * @fires Drilldown#back
       * @param {jQuery} $elem - the current sub-menu to add `back` event.
       */

    }, {
      key: '_back',
      value: function _back($elem) {
        var _this = this;
        $elem.off('click.zf.drilldown');
        $elem.children('.js-drilldown-back').on('click.zf.drilldown', function (e) {
          e.stopImmediatePropagation();
          // console.log('mouseup on back');
          _this._hide($elem);

          // If there is a parent submenu, call show
          var parentSubMenu = $elem.parent('li').parent('ul').parent('li');
          if (parentSubMenu.length) {
            _this._show(parentSubMenu);
          }
        });
      }

      /**
       * Adds event listener to menu items w/o submenus to close open menus on click.
       * @function
       * @private
       */

    }, {
      key: '_menuLinkEvents',
      value: function _menuLinkEvents() {
        var _this = this;
        this.$menuItems.not('.is-drilldown-submenu-parent').off('click.zf.drilldown').on('click.zf.drilldown', function (e) {
          // e.stopImmediatePropagation();
          setTimeout(function () {
            _this._hideAll();
          }, 0);
        });
      }

      /**
       * Opens a submenu.
       * @function
       * @fires Drilldown#open
       * @param {jQuery} $elem - the current element with a submenu to open, i.e. the `li` tag.
       */

    }, {
      key: '_show',
      value: function _show($elem) {
        if (this.options.autoHeight) this.$wrapper.css({ height: $elem.children('[data-submenu]').data('calcHeight') });
        $elem.attr('aria-expanded', true);
        $elem.children('[data-submenu]').addClass('is-active').attr('aria-hidden', false);
        /**
         * Fires when the submenu has opened.
         * @event Drilldown#open
         */
        this.$element.trigger('open.zf.drilldown', [$elem]);
      }
    }, {
      key: '_hide',


      /**
       * Hides a submenu
       * @function
       * @fires Drilldown#hide
       * @param {jQuery} $elem - the current sub-menu to hide, i.e. the `ul` tag.
       */
      value: function _hide($elem) {
        if (this.options.autoHeight) this.$wrapper.css({ height: $elem.parent().closest('ul').data('calcHeight') });
        var _this = this;
        $elem.parent('li').attr('aria-expanded', false);
        $elem.attr('aria-hidden', true).addClass('is-closing');
        $elem.addClass('is-closing').one(Foundation.transitionend($elem), function () {
          $elem.removeClass('is-active is-closing');
          $elem.blur();
        });
        /**
         * Fires when the submenu has closed.
         * @event Drilldown#hide
         */
        $elem.trigger('hide.zf.drilldown', [$elem]);
      }

      /**
       * Iterates through the nested menus to calculate the min-height, and max-width for the menu.
       * Prevents content jumping.
       * @function
       * @private
       */

    }, {
      key: '_getMaxDims',
      value: function _getMaxDims() {
        var maxHeight = 0,
            result = {},
            _this = this;
        this.$submenus.add(this.$element).each(function () {
          var numOfElems = $(this).children('li').length;
          var height = Foundation.Box.GetDimensions(this).height;
          maxHeight = height > maxHeight ? height : maxHeight;
          if (_this.options.autoHeight) {
            $(this).data('calcHeight', height);
            if (!$(this).hasClass('is-drilldown-submenu')) result['height'] = height;
          }
        });

        if (!this.options.autoHeight) result['min-height'] = maxHeight + 'px';

        result['max-width'] = this.$element[0].getBoundingClientRect().width + 'px';

        return result;
      }

      /**
       * Destroys the Drilldown Menu
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        if (this.options.scrollTop) this.$element.off('.zf.drilldown', this._bindHandler);
        this._hideAll();
        this.$element.off('mutateme.zf.trigger');
        Foundation.Nest.Burn(this.$element, 'drilldown');
        this.$element.unwrap().find('.js-drilldown-back, .is-submenu-parent-item').remove().end().find('.is-active, .is-closing, .is-drilldown-submenu').removeClass('is-active is-closing is-drilldown-submenu').end().find('[data-submenu]').removeAttr('aria-hidden tabindex role');
        this.$submenuAnchors.each(function () {
          $(this).off('.zf.drilldown');
        });

        this.$submenus.removeClass('drilldown-submenu-cover-previous');

        this.$element.find('a').each(function () {
          var $link = $(this);
          $link.removeAttr('tabindex');
          if ($link.data('savedHref')) {
            $link.attr('href', $link.data('savedHref')).removeData('savedHref');
          } else {
            return;
          }
        });
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Drilldown;
  }();

  Drilldown.defaults = {
    /**
     * Markup used for JS generated back button. Prepended  or appended (see backButtonPosition) to submenu lists and deleted on `destroy` method, 'js-drilldown-back' class required. Remove the backslash (`\`) if copy and pasting.
     * @option
     * @example '<\li><\a>Back<\/a><\/li>'
     */
    backButton: '<li class="js-drilldown-back"><a tabindex="0">Back</a></li>',
    /**
     * Position the back button either at the top or bottom of drilldown submenus.
     * @option
     * @example bottom
     */
    backButtonPosition: 'top',
    /**
     * Markup used to wrap drilldown menu. Use a class name for independent styling; the JS applied class: `is-drilldown` is required. Remove the backslash (`\`) if copy and pasting.
     * @option
     * @example '<\div class="is-drilldown"><\/div>'
     */
    wrapper: '<div></div>',
    /**
     * Adds the parent link to the submenu.
     * @option
     * @example false
     */
    parentLink: false,
    /**
     * Allow the menu to return to root list on body click.
     * @option
     * @example false
     */
    closeOnClick: false,
    /**
     * Allow the menu to auto adjust height.
     * @option
     * @example false
     */
    autoHeight: false,
    /**
     * Animate the auto adjust height.
     * @option
     * @example false
     */
    animateHeight: false,
    /**
     * Scroll to the top of the menu after opening a submenu or navigating back using the menu back button
     * @option
     * @example false
     */
    scrollTop: false,
    /**
     * String jquery selector (for example 'body') of element to take offset().top from, if empty string the drilldown menu offset().top is taken
     * @option
     * @example ''
     */
    scrollTopElement: '',
    /**
     * ScrollTop offset
     * @option
     * @example 100
     */
    scrollTopOffset: 0,
    /**
     * Scroll animation duration
     * @option
     * @example 500
     */
    animationDuration: 500,
    /**
     * Scroll animation easing
     * @option
     * @example 'swing'
     */
    animationEasing: 'swing'
    // holdOpen: false
  };

  // Window exports
  Foundation.plugin(Drilldown, 'Drilldown');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Dropdown module.
   * @module foundation.dropdown
   * @requires foundation.util.keyboard
   * @requires foundation.util.box
   * @requires foundation.util.triggers
   */

  var Dropdown = function () {
    /**
     * Creates a new instance of a dropdown.
     * @class
     * @param {jQuery} element - jQuery object to make into a dropdown.
     *        Object should be of the dropdown panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Dropdown(element, options) {
      _classCallCheck(this, Dropdown);

      this.$element = element;
      this.options = $.extend({}, Dropdown.defaults, this.$element.data(), options);
      this._init();

      Foundation.registerPlugin(this, 'Dropdown');
      Foundation.Keyboard.register('Dropdown', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ESCAPE': 'close'
      });
    }

    /**
     * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
     * @function
     * @private
     */


    _createClass(Dropdown, [{
      key: '_init',
      value: function _init() {
        var $id = this.$element.attr('id');

        this.$anchor = $('[data-toggle="' + $id + '"]').length ? $('[data-toggle="' + $id + '"]') : $('[data-open="' + $id + '"]');
        this.$anchor.attr({
          'aria-controls': $id,
          'data-is-focus': false,
          'data-yeti-box': $id,
          'aria-haspopup': true,
          'aria-expanded': false

        });

        if (this.options.parentClass) {
          this.$parent = this.$element.parents('.' + this.options.parentClass);
        } else {
          this.$parent = null;
        }
        this.options.positionClass = this.getPositionClass();
        this.counter = 4;
        this.usedPositions = [];
        this.$element.attr({
          'aria-hidden': 'true',
          'data-yeti-box': $id,
          'data-resize': $id,
          'aria-labelledby': this.$anchor[0].id || Foundation.GetYoDigits(6, 'dd-anchor')
        });
        this._events();
      }

      /**
       * Helper function to determine current orientation of dropdown pane.
       * @function
       * @returns {String} position - string value of a position class.
       */

    }, {
      key: 'getPositionClass',
      value: function getPositionClass() {
        var verticalPosition = this.$element[0].className.match(/(top|left|right|bottom)/g);
        verticalPosition = verticalPosition ? verticalPosition[0] : '';
        var horizontalPosition = /float-(\S+)/.exec(this.$anchor[0].className);
        horizontalPosition = horizontalPosition ? horizontalPosition[1] : '';
        var position = horizontalPosition ? horizontalPosition + ' ' + verticalPosition : verticalPosition;

        return position;
      }

      /**
       * Adjusts the dropdown panes orientation by adding/removing positioning classes.
       * @function
       * @private
       * @param {String} position - position class to remove.
       */

    }, {
      key: '_reposition',
      value: function _reposition(position) {
        this.usedPositions.push(position ? position : 'bottom');
        //default, try switching to opposite side
        if (!position && this.usedPositions.indexOf('top') < 0) {
          this.$element.addClass('top');
        } else if (position === 'top' && this.usedPositions.indexOf('bottom') < 0) {
          this.$element.removeClass(position);
        } else if (position === 'left' && this.usedPositions.indexOf('right') < 0) {
          this.$element.removeClass(position).addClass('right');
        } else if (position === 'right' && this.usedPositions.indexOf('left') < 0) {
          this.$element.removeClass(position).addClass('left');
        }

        //if default change didn't work, try bottom or left first
        else if (!position && this.usedPositions.indexOf('top') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.$element.addClass('left');
          } else if (position === 'top' && this.usedPositions.indexOf('bottom') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.$element.removeClass(position).addClass('left');
          } else if (position === 'left' && this.usedPositions.indexOf('right') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.$element.removeClass(position);
          } else if (position === 'right' && this.usedPositions.indexOf('left') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.$element.removeClass(position);
          }
          //if nothing cleared, set to bottom
          else {
              this.$element.removeClass(position);
            }
        this.classChanged = true;
        this.counter--;
      }

      /**
       * Sets the position and orientation of the dropdown pane, checks for collisions.
       * Recursively calls itself if a collision is detected, with a new position class.
       * @function
       * @private
       */

    }, {
      key: '_setPosition',
      value: function _setPosition() {
        if (this.$anchor.attr('aria-expanded') === 'false') {
          return false;
        }
        var position = this.getPositionClass(),
            $eleDims = Foundation.Box.GetDimensions(this.$element),
            $anchorDims = Foundation.Box.GetDimensions(this.$anchor),
            _this = this,
            direction = position === 'left' ? 'left' : position === 'right' ? 'left' : 'top',
            param = direction === 'top' ? 'height' : 'width',
            offset = param === 'height' ? this.options.vOffset : this.options.hOffset;

        if ($eleDims.width >= $eleDims.windowDims.width || !this.counter && !Foundation.Box.ImNotTouchingYou(this.$element, this.$parent)) {
          var newWidth = $eleDims.windowDims.width,
              parentHOffset = 0;
          if (this.$parent) {
            var $parentDims = Foundation.Box.GetDimensions(this.$parent),
                parentHOffset = $parentDims.offset.left;
            if ($parentDims.width < newWidth) {
              newWidth = $parentDims.width;
            }
          }

          this.$element.offset(Foundation.Box.GetOffsets(this.$element, this.$anchor, 'center bottom', this.options.vOffset, this.options.hOffset + parentHOffset, true)).css({
            'width': newWidth - this.options.hOffset * 2,
            'height': 'auto'
          });
          this.classChanged = true;
          return false;
        }

        this.$element.offset(Foundation.Box.GetOffsets(this.$element, this.$anchor, position, this.options.vOffset, this.options.hOffset));

        while (!Foundation.Box.ImNotTouchingYou(this.$element, this.$parent, true) && this.counter) {
          this._reposition(position);
          this._setPosition();
        }
      }

      /**
       * Adds event listeners to the element utilizing the triggers utility library.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;
        this.$element.on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'resizeme.zf.trigger': this._setPosition.bind(this)
        });

        if (this.options.hover) {
          this.$anchor.off('mouseenter.zf.dropdown mouseleave.zf.dropdown').on('mouseenter.zf.dropdown', function () {
            var bodyData = $('body').data();
            if (typeof bodyData.whatinput === 'undefined' || bodyData.whatinput === 'mouse') {
              clearTimeout(_this.timeout);
              _this.timeout = setTimeout(function () {
                _this.open();
                _this.$anchor.data('hover', true);
              }, _this.options.hoverDelay);
            }
          }).on('mouseleave.zf.dropdown', function () {
            clearTimeout(_this.timeout);
            _this.timeout = setTimeout(function () {
              _this.close();
              _this.$anchor.data('hover', false);
            }, _this.options.hoverDelay);
          });
          if (this.options.hoverPane) {
            this.$element.off('mouseenter.zf.dropdown mouseleave.zf.dropdown').on('mouseenter.zf.dropdown', function () {
              clearTimeout(_this.timeout);
            }).on('mouseleave.zf.dropdown', function () {
              clearTimeout(_this.timeout);
              _this.timeout = setTimeout(function () {
                _this.close();
                _this.$anchor.data('hover', false);
              }, _this.options.hoverDelay);
            });
          }
        }
        this.$anchor.add(this.$element).on('keydown.zf.dropdown', function (e) {

          var $target = $(this),
              visibleFocusableElements = Foundation.Keyboard.findFocusable(_this.$element);

          Foundation.Keyboard.handleKey(e, 'Dropdown', {
            open: function open() {
              if ($target.is(_this.$anchor)) {
                _this.open();
                _this.$element.attr('tabindex', -1).focus();
                e.preventDefault();
              }
            },
            close: function close() {
              _this.close();
              _this.$anchor.focus();
            }
          });
        });
      }

      /**
       * Adds an event handler to the body to close any dropdowns on a click.
       * @function
       * @private
       */

    }, {
      key: '_addBodyHandler',
      value: function _addBodyHandler() {
        var $body = $(document.body).not(this.$element),
            _this = this;
        $body.off('click.zf.dropdown').on('click.zf.dropdown', function (e) {
          if (_this.$anchor.is(e.target) || _this.$anchor.find(e.target).length) {
            return;
          }
          if (_this.$element.find(e.target).length) {
            return;
          }
          _this.close();
          $body.off('click.zf.dropdown');
        });
      }

      /**
       * Opens the dropdown pane, and fires a bubbling event to close other dropdowns.
       * @function
       * @fires Dropdown#closeme
       * @fires Dropdown#show
       */

    }, {
      key: 'open',
      value: function open() {
        // var _this = this;
        /**
         * Fires to close other open dropdowns
         * @event Dropdown#closeme
         */
        this.$element.trigger('closeme.zf.dropdown', this.$element.attr('id'));
        this.$anchor.addClass('hover').attr({ 'aria-expanded': true });
        // this.$element/*.show()*/;
        this._setPosition();
        this.$element.addClass('is-open').attr({ 'aria-hidden': false });

        if (this.options.autoFocus) {
          var $focusable = Foundation.Keyboard.findFocusable(this.$element);
          if ($focusable.length) {
            $focusable.eq(0).focus();
          }
        }

        if (this.options.closeOnClick) {
          this._addBodyHandler();
        }

        if (this.options.trapFocus) {
          Foundation.Keyboard.trapFocus(this.$element);
        }

        /**
         * Fires once the dropdown is visible.
         * @event Dropdown#show
         */
        this.$element.trigger('show.zf.dropdown', [this.$element]);
      }

      /**
       * Closes the open dropdown pane.
       * @function
       * @fires Dropdown#hide
       */

    }, {
      key: 'close',
      value: function close() {
        if (!this.$element.hasClass('is-open')) {
          return false;
        }
        this.$element.removeClass('is-open').attr({ 'aria-hidden': true });

        this.$anchor.removeClass('hover').attr('aria-expanded', false);

        if (this.classChanged) {
          var curPositionClass = this.getPositionClass();
          if (curPositionClass) {
            this.$element.removeClass(curPositionClass);
          }
          this.$element.addClass(this.options.positionClass)
          /*.hide()*/.css({ height: '', width: '' });
          this.classChanged = false;
          this.counter = 4;
          this.usedPositions.length = 0;
        }
        this.$element.trigger('hide.zf.dropdown', [this.$element]);

        if (this.options.trapFocus) {
          Foundation.Keyboard.releaseFocus(this.$element);
        }
      }

      /**
       * Toggles the dropdown pane's visibility.
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        if (this.$element.hasClass('is-open')) {
          if (this.$anchor.data('hover')) return;
          this.close();
        } else {
          this.open();
        }
      }

      /**
       * Destroys the dropdown.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.trigger').hide();
        this.$anchor.off('.zf.dropdown');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Dropdown;
  }();

  Dropdown.defaults = {
    /**
     * Class that designates bounding container of Dropdown (Default: window)
     * @option
     * @example 'dropdown-parent'
     */
    parentClass: null,
    /**
     * Amount of time to delay opening a submenu on hover event.
     * @option
     * @example 250
     */
    hoverDelay: 250,
    /**
     * Allow submenus to open on hover events
     * @option
     * @example false
     */
    hover: false,
    /**
     * Don't close dropdown when hovering over dropdown pane
     * @option
     * @example true
     */
    hoverPane: false,
    /**
     * Number of pixels between the dropdown pane and the triggering element on open.
     * @option
     * @example 1
     */
    vOffset: 1,
    /**
     * Number of pixels between the dropdown pane and the triggering element on open.
     * @option
     * @example 1
     */
    hOffset: 1,
    /**
     * Class applied to adjust open position. JS will test and fill this in.
     * @option
     * @example 'top'
     */
    positionClass: '',
    /**
     * Allow the plugin to trap focus to the dropdown pane if opened with keyboard commands.
     * @option
     * @example false
     */
    trapFocus: false,
    /**
     * Allow the plugin to set focus to the first focusable element within the pane, regardless of method of opening.
     * @option
     * @example true
     */
    autoFocus: false,
    /**
     * Allows a click on the body to close the dropdown.
     * @option
     * @example false
     */
    closeOnClick: false
  };

  // Window exports
  Foundation.plugin(Dropdown, 'Dropdown');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * DropdownMenu module.
   * @module foundation.dropdown-menu
   * @requires foundation.util.keyboard
   * @requires foundation.util.box
   * @requires foundation.util.nest
   */

  var DropdownMenu = function () {
    /**
     * Creates a new instance of DropdownMenu.
     * @class
     * @fires DropdownMenu#init
     * @param {jQuery} element - jQuery object to make into a dropdown menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function DropdownMenu(element, options) {
      _classCallCheck(this, DropdownMenu);

      this.$element = element;
      this.options = $.extend({}, DropdownMenu.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'dropdown');
      this._init();

      Foundation.registerPlugin(this, 'DropdownMenu');
      Foundation.Keyboard.register('DropdownMenu', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close'
      });
    }

    /**
     * Initializes the plugin, and calls _prepareMenu
     * @private
     * @function
     */


    _createClass(DropdownMenu, [{
      key: '_init',
      value: function _init() {
        var subs = this.$element.find('li.is-dropdown-submenu-parent');
        this.$element.children('.is-dropdown-submenu-parent').children('.is-dropdown-submenu').addClass('first-sub');

        this.$menuItems = this.$element.find('[role="menuitem"]');
        this.$tabs = this.$element.children('[role="menuitem"]');
        this.$tabs.find('ul.is-dropdown-submenu').addClass(this.options.verticalClass);

        if (this.$element.hasClass(this.options.rightClass) || this.options.alignment === 'right' || Foundation.rtl() || this.$element.parents('.top-bar-right').is('*')) {
          this.options.alignment = 'right';
          subs.addClass('opens-left');
        } else {
          subs.addClass('opens-right');
        }
        this.changed = false;
        this._events();
      }
    }, {
      key: '_isVertical',
      value: function _isVertical() {
        return this.$tabs.css('display') === 'block';
      }

      /**
       * Adds event listeners to elements within the menu
       * @private
       * @function
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this,
            hasTouch = 'ontouchstart' in window || typeof window.ontouchstart !== 'undefined',
            parClass = 'is-dropdown-submenu-parent';

        // used for onClick and in the keyboard handlers
        var handleClickFn = function handleClickFn(e) {
          var $elem = $(e.target).parentsUntil('ul', '.' + parClass),
              hasSub = $elem.hasClass(parClass),
              hasClicked = $elem.attr('data-is-click') === 'true',
              $sub = $elem.children('.is-dropdown-submenu');

          if (hasSub) {
            if (hasClicked) {
              if (!_this.options.closeOnClick || !_this.options.clickOpen && !hasTouch || _this.options.forceFollow && hasTouch) {
                return;
              } else {
                e.stopImmediatePropagation();
                e.preventDefault();
                _this._hide($elem);
              }
            } else {
              e.preventDefault();
              e.stopImmediatePropagation();
              _this._show($sub);
              $elem.add($elem.parentsUntil(_this.$element, '.' + parClass)).attr('data-is-click', true);
            }
          }
        };

        if (this.options.clickOpen || hasTouch) {
          this.$menuItems.on('click.zf.dropdownmenu touchstart.zf.dropdownmenu', handleClickFn);
        }

        // Handle Leaf element Clicks
        if (_this.options.closeOnClickInside) {
          this.$menuItems.on('click.zf.dropdownmenu touchend.zf.dropdownmenu', function (e) {
            var $elem = $(this),
                hasSub = $elem.hasClass(parClass);
            if (!hasSub) {
              _this._hide();
            }
          });
        }

        if (!this.options.disableHover) {
          this.$menuItems.on('mouseenter.zf.dropdownmenu', function (e) {
            var $elem = $(this),
                hasSub = $elem.hasClass(parClass);

            if (hasSub) {
              clearTimeout($elem.data('_delay'));
              $elem.data('_delay', setTimeout(function () {
                _this._show($elem.children('.is-dropdown-submenu'));
              }, _this.options.hoverDelay));
            }
          }).on('mouseleave.zf.dropdownmenu', function (e) {
            var $elem = $(this),
                hasSub = $elem.hasClass(parClass);
            if (hasSub && _this.options.autoclose) {
              if ($elem.attr('data-is-click') === 'true' && _this.options.clickOpen) {
                return false;
              }

              clearTimeout($elem.data('_delay'));
              $elem.data('_delay', setTimeout(function () {
                _this._hide($elem);
              }, _this.options.closingTime));
            }
          });
        }
        this.$menuItems.on('keydown.zf.dropdownmenu', function (e) {
          var $element = $(e.target).parentsUntil('ul', '[role="menuitem"]'),
              isTab = _this.$tabs.index($element) > -1,
              $elements = isTab ? _this.$tabs : $element.siblings('li').add($element),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(i - 1);
              $nextElement = $elements.eq(i + 1);
              return;
            }
          });

          var nextSibling = function nextSibling() {
            if (!$element.is(':last-child')) {
              $nextElement.children('a:first').focus();
              e.preventDefault();
            }
          },
              prevSibling = function prevSibling() {
            $prevElement.children('a:first').focus();
            e.preventDefault();
          },
              openSub = function openSub() {
            var $sub = $element.children('ul.is-dropdown-submenu');
            if ($sub.length) {
              _this._show($sub);
              $element.find('li > a:first').focus();
              e.preventDefault();
            } else {
              return;
            }
          },
              closeSub = function closeSub() {
            //if ($element.is(':first-child')) {
            var close = $element.parent('ul').parent('li');
            close.children('a:first').focus();
            _this._hide(close);
            e.preventDefault();
            //}
          };
          var functions = {
            open: openSub,
            close: function close() {
              _this._hide(_this.$element);
              _this.$menuItems.find('a:first').focus(); // focus to first element
              e.preventDefault();
            },
            handled: function handled() {
              e.stopImmediatePropagation();
            }
          };

          if (isTab) {
            if (_this._isVertical()) {
              // vertical menu
              if (Foundation.rtl()) {
                // right aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: closeSub,
                  previous: openSub
                });
              } else {
                // left aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: openSub,
                  previous: closeSub
                });
              }
            } else {
              // horizontal menu
              if (Foundation.rtl()) {
                // right aligned
                $.extend(functions, {
                  next: prevSibling,
                  previous: nextSibling,
                  down: openSub,
                  up: closeSub
                });
              } else {
                // left aligned
                $.extend(functions, {
                  next: nextSibling,
                  previous: prevSibling,
                  down: openSub,
                  up: closeSub
                });
              }
            }
          } else {
            // not tabs -> one sub
            if (Foundation.rtl()) {
              // right aligned
              $.extend(functions, {
                next: closeSub,
                previous: openSub,
                down: nextSibling,
                up: prevSibling
              });
            } else {
              // left aligned
              $.extend(functions, {
                next: openSub,
                previous: closeSub,
                down: nextSibling,
                up: prevSibling
              });
            }
          }
          Foundation.Keyboard.handleKey(e, 'DropdownMenu', functions);
        });
      }

      /**
       * Adds an event handler to the body to close any dropdowns on a click.
       * @function
       * @private
       */

    }, {
      key: '_addBodyHandler',
      value: function _addBodyHandler() {
        var $body = $(document.body),
            _this = this;
        $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu').on('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu', function (e) {
          var $link = _this.$element.find(e.target);
          if ($link.length) {
            return;
          }

          _this._hide();
          $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu');
        });
      }

      /**
       * Opens a dropdown pane, and checks for collisions first.
       * @param {jQuery} $sub - ul element that is a submenu to show
       * @function
       * @private
       * @fires DropdownMenu#show
       */

    }, {
      key: '_show',
      value: function _show($sub) {
        var idx = this.$tabs.index(this.$tabs.filter(function (i, el) {
          return $(el).find($sub).length > 0;
        }));
        var $sibs = $sub.parent('li.is-dropdown-submenu-parent').siblings('li.is-dropdown-submenu-parent');
        this._hide($sibs, idx);
        $sub.css('visibility', 'hidden').addClass('js-dropdown-active').parent('li.is-dropdown-submenu-parent').addClass('is-active');
        var clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
        if (!clear) {
          var oldClass = this.options.alignment === 'left' ? '-right' : '-left',
              $parentLi = $sub.parent('.is-dropdown-submenu-parent');
          $parentLi.removeClass('opens' + oldClass).addClass('opens-' + this.options.alignment);
          clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
          if (!clear) {
            $parentLi.removeClass('opens-' + this.options.alignment).addClass('opens-inner');
          }
          this.changed = true;
        }
        $sub.css('visibility', '');
        if (this.options.closeOnClick) {
          this._addBodyHandler();
        }
        /**
         * Fires when the new dropdown pane is visible.
         * @event DropdownMenu#show
         */
        this.$element.trigger('show.zf.dropdownmenu', [$sub]);
      }

      /**
       * Hides a single, currently open dropdown pane, if passed a parameter, otherwise, hides everything.
       * @function
       * @param {jQuery} $elem - element with a submenu to hide
       * @param {Number} idx - index of the $tabs collection to hide
       * @private
       */

    }, {
      key: '_hide',
      value: function _hide($elem, idx) {
        var $toClose;
        if ($elem && $elem.length) {
          $toClose = $elem;
        } else if (idx !== undefined) {
          $toClose = this.$tabs.not(function (i, el) {
            return i === idx;
          });
        } else {
          $toClose = this.$element;
        }
        var somethingToClose = $toClose.hasClass('is-active') || $toClose.find('.is-active').length > 0;

        if (somethingToClose) {
          $toClose.find('li.is-active').add($toClose).attr({
            'data-is-click': false
          }).removeClass('is-active');

          $toClose.find('ul.js-dropdown-active').removeClass('js-dropdown-active');

          if (this.changed || $toClose.find('opens-inner').length) {
            var oldClass = this.options.alignment === 'left' ? 'right' : 'left';
            $toClose.find('li.is-dropdown-submenu-parent').add($toClose).removeClass('opens-inner opens-' + this.options.alignment).addClass('opens-' + oldClass);
            this.changed = false;
          }
          /**
           * Fires when the open menus are closed.
           * @event DropdownMenu#hide
           */
          this.$element.trigger('hide.zf.dropdownmenu', [$toClose]);
        }
      }

      /**
       * Destroys the plugin.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$menuItems.off('.zf.dropdownmenu').removeAttr('data-is-click').removeClass('is-right-arrow is-left-arrow is-down-arrow opens-right opens-left opens-inner');
        $(document.body).off('.zf.dropdownmenu');
        Foundation.Nest.Burn(this.$element, 'dropdown');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return DropdownMenu;
  }();

  /**
   * Default settings for plugin
   */


  DropdownMenu.defaults = {
    /**
     * Disallows hover events from opening submenus
     * @option
     * @example false
     */
    disableHover: false,
    /**
     * Allow a submenu to automatically close on a mouseleave event, if not clicked open.
     * @option
     * @example true
     */
    autoclose: true,
    /**
     * Amount of time to delay opening a submenu on hover event.
     * @option
     * @example 50
     */
    hoverDelay: 50,
    /**
     * Allow a submenu to open/remain open on parent click event. Allows cursor to move away from menu.
     * @option
     * @example true
     */
    clickOpen: false,
    /**
     * Amount of time to delay closing a submenu on a mouseleave event.
     * @option
     * @example 500
     */

    closingTime: 500,
    /**
     * Position of the menu relative to what direction the submenus should open. Handled by JS.
     * @option
     * @example 'left'
     */
    alignment: 'left',
    /**
     * Allow clicks on the body to close any open submenus.
     * @option
     * @example true
     */
    closeOnClick: true,
    /**
     * Allow clicks on leaf anchor links to close any open submenus.
     * @option
     * @example true
     */
    closeOnClickInside: true,
    /**
     * Class applied to vertical oriented menus, Foundation default is `vertical`. Update this if using your own class.
     * @option
     * @example 'vertical'
     */
    verticalClass: 'vertical',
    /**
     * Class applied to right-side oriented menus, Foundation default is `align-right`. Update this if using your own class.
     * @option
     * @example 'align-right'
     */
    rightClass: 'align-right',
    /**
     * Boolean to force overide the clicking of links to perform default action, on second touch event for mobile.
     * @option
     * @example false
     */
    forceFollow: true
  };

  // Window exports
  Foundation.plugin(DropdownMenu, 'DropdownMenu');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * OffCanvas module.
   * @module foundation.offcanvas
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.triggers
   * @requires foundation.util.motion
   */

  var OffCanvas = function () {
    /**
     * Creates a new instance of an off-canvas wrapper.
     * @class
     * @fires OffCanvas#init
     * @param {Object} element - jQuery object to initialize.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function OffCanvas(element, options) {
      _classCallCheck(this, OffCanvas);

      this.$element = element;
      this.options = $.extend({}, OffCanvas.defaults, this.$element.data(), options);
      this.$lastTrigger = $();
      this.$triggers = $();

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'OffCanvas');
      Foundation.Keyboard.register('OffCanvas', {
        'ESCAPE': 'close'
      });
    }

    /**
     * Initializes the off-canvas wrapper by adding the exit overlay (if needed).
     * @function
     * @private
     */


    _createClass(OffCanvas, [{
      key: '_init',
      value: function _init() {
        var id = this.$element.attr('id');

        this.$element.attr('aria-hidden', 'true');

        this.$element.addClass('is-transition-' + this.options.transition);

        // Find triggers that affect this element and add aria-expanded to them
        this.$triggers = $(document).find('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-expanded', 'false').attr('aria-controls', id);

        // Add an overlay over the content if necessary
        if (this.options.contentOverlay === true) {
          var overlay = document.createElement('div');
          var overlayPosition = $(this.$element).css("position") === 'fixed' ? 'is-overlay-fixed' : 'is-overlay-absolute';
          overlay.setAttribute('class', 'js-off-canvas-overlay ' + overlayPosition);
          this.$overlay = $(overlay);
          if (overlayPosition === 'is-overlay-fixed') {
            $('body').append(this.$overlay);
          } else {
            this.$element.siblings('[data-off-canvas-content]').append(this.$overlay);
          }
        }

        this.options.isRevealed = this.options.isRevealed || new RegExp(this.options.revealClass, 'g').test(this.$element[0].className);

        if (this.options.isRevealed === true) {
          this.options.revealOn = this.options.revealOn || this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
          this._setMQChecker();
        }
        if (!this.options.transitionTime === true) {
          this.options.transitionTime = parseFloat(window.getComputedStyle($('[data-off-canvas]')[0]).transitionDuration) * 1000;
        }
      }

      /**
       * Adds event handlers to the off-canvas wrapper and the exit overlay.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this.$element.off('.zf.trigger .zf.offcanvas').on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'keydown.zf.offcanvas': this._handleKeyboard.bind(this)
        });

        if (this.options.closeOnClick === true) {
          var $target = this.options.contentOverlay ? this.$overlay : $('[data-off-canvas-content]');
          $target.on({ 'click.zf.offcanvas': this.close.bind(this) });
        }
      }

      /**
       * Applies event listener for elements that will reveal at certain breakpoints.
       * @private
       */

    }, {
      key: '_setMQChecker',
      value: function _setMQChecker() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          } else {
            _this.reveal(false);
          }
        }).one('load.zf.offcanvas', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          }
        });
      }

      /**
       * Handles the revealing/hiding the off-canvas at breakpoints, not the same as open.
       * @param {Boolean} isRevealed - true if element should be revealed.
       * @function
       */

    }, {
      key: 'reveal',
      value: function reveal(isRevealed) {
        var $closer = this.$element.find('[data-close]');
        if (isRevealed) {
          this.close();
          this.isRevealed = true;
          this.$element.attr('aria-hidden', 'false');
          this.$element.off('open.zf.trigger toggle.zf.trigger');
          if ($closer.length) {
            $closer.hide();
          }
        } else {
          this.isRevealed = false;
          this.$element.attr('aria-hidden', 'true');
          this.$element.on({
            'open.zf.trigger': this.open.bind(this),
            'toggle.zf.trigger': this.toggle.bind(this)
          });
          if ($closer.length) {
            $closer.show();
          }
        }
      }

      /**
       * Stops scrolling of the body when offcanvas is open on mobile Safari and other troublesome browsers.
       * @private
       */

    }, {
      key: '_stopScrolling',
      value: function _stopScrolling(event) {
        return false;
      }

      /**
       * Opens the off-canvas menu.
       * @function
       * @param {Object} event - Event object passed from listener.
       * @param {jQuery} trigger - element that triggered the off-canvas to open.
       * @fires OffCanvas#opened
       */

    }, {
      key: 'open',
      value: function open(event, trigger) {
        if (this.$element.hasClass('is-open') || this.isRevealed) {
          return;
        }
        var _this = this;

        if (trigger) {
          this.$lastTrigger = trigger;
        }

        if (this.options.forceTo === 'top') {
          window.scrollTo(0, 0);
        } else if (this.options.forceTo === 'bottom') {
          window.scrollTo(0, document.body.scrollHeight);
        }

        /**
         * Fires when the off-canvas menu opens.
         * @event OffCanvas#opened
         */
        _this.$element.addClass('is-open');

        this.$triggers.attr('aria-expanded', 'true');
        this.$element.attr('aria-hidden', 'false').trigger('opened.zf.offcanvas');

        // If `contentScroll` is set to false, add class and disable scrolling on touch devices.
        if (this.options.contentScroll === false) {
          $('body').addClass('is-off-canvas-open').on('touchmove', this._stopScrolling);
        }

        if (this.options.contentOverlay === true) {
          this.$overlay.addClass('is-visible');
        }

        if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
          this.$overlay.addClass('is-closable');
        }

        if (this.options.autoFocus === true) {
          this.$element.one(Foundation.transitionend(this.$element), function () {
            _this.$element.find('a, button').eq(0).focus();
          });
        }

        if (this.options.trapFocus === true) {
          this.$element.siblings('[data-off-canvas-content]').attr('tabindex', '-1');
          Foundation.Keyboard.trapFocus(this.$element);
        }
      }

      /**
       * Closes the off-canvas menu.
       * @function
       * @param {Function} cb - optional cb to fire after closure.
       * @fires OffCanvas#closed
       */

    }, {
      key: 'close',
      value: function close(cb) {
        if (!this.$element.hasClass('is-open') || this.isRevealed) {
          return;
        }

        var _this = this;

        _this.$element.removeClass('is-open');

        this.$element.attr('aria-hidden', 'true')
        /**
         * Fires when the off-canvas menu opens.
         * @event OffCanvas#closed
         */
        .trigger('closed.zf.offcanvas');

        // If `contentScroll` is set to false, remove class and re-enable scrolling on touch devices.
        if (this.options.contentScroll === false) {
          $('body').removeClass('is-off-canvas-open').off('touchmove', this._stopScrolling);
        }

        if (this.options.contentOverlay === true) {
          this.$overlay.removeClass('is-visible');
        }

        if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
          this.$overlay.removeClass('is-closable');
        }

        this.$triggers.attr('aria-expanded', 'false');

        if (this.options.trapFocus === true) {
          this.$element.siblings('[data-off-canvas-content]').removeAttr('tabindex');
          Foundation.Keyboard.releaseFocus(this.$element);
        }
      }

      /**
       * Toggles the off-canvas menu open or closed.
       * @function
       * @param {Object} event - Event object passed from listener.
       * @param {jQuery} trigger - element that triggered the off-canvas to open.
       */

    }, {
      key: 'toggle',
      value: function toggle(event, trigger) {
        if (this.$element.hasClass('is-open')) {
          this.close(event, trigger);
        } else {
          this.open(event, trigger);
        }
      }

      /**
       * Handles keyboard input when detected. When the escape key is pressed, the off-canvas menu closes, and focus is restored to the element that opened the menu.
       * @function
       * @private
       */

    }, {
      key: '_handleKeyboard',
      value: function _handleKeyboard(e) {
        var _this2 = this;

        Foundation.Keyboard.handleKey(e, 'OffCanvas', {
          close: function close() {
            _this2.close();
            _this2.$lastTrigger.focus();
            return true;
          },
          handled: function handled() {
            e.stopPropagation();
            e.preventDefault();
          }
        });
      }

      /**
       * Destroys the offcanvas plugin.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.close();
        this.$element.off('.zf.trigger .zf.offcanvas');
        this.$overlay.off('.zf.offcanvas');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return OffCanvas;
  }();

  OffCanvas.defaults = {
    /**
     * Allow the user to click outside of the menu to close it.
     * @option
     * @example true
     */
    closeOnClick: true,

    /**
     * Adds an overlay on top of `[data-off-canvas-content]`.
     * @option
     * @example true
     */
    contentOverlay: true,

    /**
     * Enable/disable scrolling of the main content when an off canvas panel is open.
     * @option
     * @example true
     */
    contentScroll: true,

    /**
     * Amount of time in ms the open and close transition requires. If none selected, pulls from body style.
     * @option
     * @example 500
     */
    transitionTime: 0,

    /**
     * Type of transition for the offcanvas menu. Options are 'push', 'detached' or 'slide'.
     * @option
     * @example push
     */
    transition: 'push',

    /**
     * Force the page to scroll to top or bottom on open.
     * @option
     * @example top
     */
    forceTo: null,

    /**
     * Allow the offcanvas to remain open for certain breakpoints.
     * @option
     * @example false
     */
    isRevealed: false,

    /**
     * Breakpoint at which to reveal. JS will use a RegExp to target standard classes, if changing classnames, pass your class with the `revealClass` option.
     * @option
     * @example reveal-for-large
     */
    revealOn: null,

    /**
     * Force focus to the offcanvas on open. If true, will focus the opening trigger on close.
     * @option
     * @example true
     */
    autoFocus: true,

    /**
     * Class used to force an offcanvas to remain open. Foundation defaults for this are `reveal-for-large` & `reveal-for-medium`.
     * @option
     * TODO improve the regex testing for this.
     * @example reveal-for-large
     */
    revealClass: 'reveal-for-',

    /**
     * Triggers optional focus trapping when opening an offcanvas. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
     * @option
     * @example true
     */
    trapFocus: false
  };

  // Window exports
  Foundation.plugin(OffCanvas, 'OffCanvas');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * ResponsiveMenu module.
   * @module foundation.responsiveMenu
   * @requires foundation.util.triggers
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.accordionMenu
   * @requires foundation.util.drilldown
   * @requires foundation.util.dropdown-menu
   */

  var ResponsiveMenu = function () {
    /**
     * Creates a new instance of a responsive menu.
     * @class
     * @fires ResponsiveMenu#init
     * @param {jQuery} element - jQuery object to make into a dropdown menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function ResponsiveMenu(element, options) {
      _classCallCheck(this, ResponsiveMenu);

      this.$element = $(element);
      this.rules = this.$element.data('responsive-menu');
      this.currentMq = null;
      this.currentPlugin = null;

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'ResponsiveMenu');
    }

    /**
     * Initializes the Menu by parsing the classes from the 'data-ResponsiveMenu' attribute on the element.
     * @function
     * @private
     */


    _createClass(ResponsiveMenu, [{
      key: '_init',
      value: function _init() {
        // The first time an Interchange plugin is initialized, this.rules is converted from a string of "classes" to an object of rules
        if (typeof this.rules === 'string') {
          var rulesTree = {};

          // Parse rules from "classes" pulled from data attribute
          var rules = this.rules.split(' ');

          // Iterate through every rule found
          for (var i = 0; i < rules.length; i++) {
            var rule = rules[i].split('-');
            var ruleSize = rule.length > 1 ? rule[0] : 'small';
            var rulePlugin = rule.length > 1 ? rule[1] : rule[0];

            if (MenuPlugins[rulePlugin] !== null) {
              rulesTree[ruleSize] = MenuPlugins[rulePlugin];
            }
          }

          this.rules = rulesTree;
        }

        if (!$.isEmptyObject(this.rules)) {
          this._checkMediaQueries();
        }
        // Add data-mutate since children may need it.
        this.$element.attr('data-mutate', this.$element.attr('data-mutate') || Foundation.GetYoDigits(6, 'responsive-menu'));
      }

      /**
       * Initializes events for the Menu.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          _this._checkMediaQueries();
        });
        // $(window).on('resize.zf.ResponsiveMenu', function() {
        //   _this._checkMediaQueries();
        // });
      }

      /**
       * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
       * @function
       * @private
       */

    }, {
      key: '_checkMediaQueries',
      value: function _checkMediaQueries() {
        var matchedMq,
            _this = this;
        // Iterate through each rule and find the last matching rule
        $.each(this.rules, function (key) {
          if (Foundation.MediaQuery.atLeast(key)) {
            matchedMq = key;
          }
        });

        // No match? No dice
        if (!matchedMq) return;

        // Plugin already initialized? We good
        if (this.currentPlugin instanceof this.rules[matchedMq].plugin) return;

        // Remove existing plugin-specific CSS classes
        $.each(MenuPlugins, function (key, value) {
          _this.$element.removeClass(value.cssClass);
        });

        // Add the CSS class for the new plugin
        this.$element.addClass(this.rules[matchedMq].cssClass);

        // Create an instance of the new plugin
        if (this.currentPlugin) this.currentPlugin.destroy();
        this.currentPlugin = new this.rules[matchedMq].plugin(this.$element, {});
      }

      /**
       * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.currentPlugin.destroy();
        $(window).off('.zf.ResponsiveMenu');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return ResponsiveMenu;
  }();

  ResponsiveMenu.defaults = {};

  // The plugin matches the plugin classes with these plugin instances.
  var MenuPlugins = {
    dropdown: {
      cssClass: 'dropdown',
      plugin: Foundation._plugins['dropdown-menu'] || null
    },
    drilldown: {
      cssClass: 'drilldown',
      plugin: Foundation._plugins['drilldown'] || null
    },
    accordion: {
      cssClass: 'accordion-menu',
      plugin: Foundation._plugins['accordion-menu'] || null
    }
  };

  // Window exports
  Foundation.plugin(ResponsiveMenu, 'ResponsiveMenu');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * ResponsiveToggle module.
   * @module foundation.responsiveToggle
   * @requires foundation.util.mediaQuery
   */

  var ResponsiveToggle = function () {
    /**
     * Creates a new instance of Tab Bar.
     * @class
     * @fires ResponsiveToggle#init
     * @param {jQuery} element - jQuery object to attach tab bar functionality to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function ResponsiveToggle(element, options) {
      _classCallCheck(this, ResponsiveToggle);

      this.$element = $(element);
      this.options = $.extend({}, ResponsiveToggle.defaults, this.$element.data(), options);

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'ResponsiveToggle');
    }

    /**
     * Initializes the tab bar by finding the target element, toggling element, and running update().
     * @function
     * @private
     */


    _createClass(ResponsiveToggle, [{
      key: '_init',
      value: function _init() {
        var targetID = this.$element.data('responsive-toggle');
        if (!targetID) {
          console.error('Your tab bar needs an ID of a Menu as the value of data-tab-bar.');
        }

        this.$targetMenu = $('#' + targetID);
        this.$toggler = this.$element.find('[data-toggle]');
        this.options = $.extend({}, this.options, this.$targetMenu.data());

        // If they were set, parse the animation classes
        if (this.options.animate) {
          var input = this.options.animate.split(' ');

          this.animationIn = input[0];
          this.animationOut = input[1] || null;
        }

        this._update();
      }

      /**
       * Adds necessary event handlers for the tab bar to work.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this._updateMqHandler = this._update.bind(this);

        $(window).on('changed.zf.mediaquery', this._updateMqHandler);

        this.$toggler.on('click.zf.responsiveToggle', this.toggleMenu.bind(this));
      }

      /**
       * Checks the current media query to determine if the tab bar should be visible or hidden.
       * @function
       * @private
       */

    }, {
      key: '_update',
      value: function _update() {
        // Mobile
        if (!Foundation.MediaQuery.atLeast(this.options.hideFor)) {
          this.$element.show();
          this.$targetMenu.hide();
        }

        // Desktop
        else {
            this.$element.hide();
            this.$targetMenu.show();
          }
      }

      /**
       * Toggles the element attached to the tab bar. The toggle only happens if the screen is small enough to allow it.
       * @function
       * @fires ResponsiveToggle#toggled
       */

    }, {
      key: 'toggleMenu',
      value: function toggleMenu() {
        var _this2 = this;

        if (!Foundation.MediaQuery.atLeast(this.options.hideFor)) {
          if (this.options.animate) {
            if (this.$targetMenu.is(':hidden')) {
              Foundation.Motion.animateIn(this.$targetMenu, this.animationIn, function () {
                /**
                 * Fires when the element attached to the tab bar toggles.
                 * @event ResponsiveToggle#toggled
                 */
                _this2.$element.trigger('toggled.zf.responsiveToggle');
                _this2.$targetMenu.find('[data-mutate]').triggerHandler('mutateme.zf.trigger');
              });
            } else {
              Foundation.Motion.animateOut(this.$targetMenu, this.animationOut, function () {
                /**
                 * Fires when the element attached to the tab bar toggles.
                 * @event ResponsiveToggle#toggled
                 */
                _this2.$element.trigger('toggled.zf.responsiveToggle');
              });
            }
          } else {
            this.$targetMenu.toggle(0);
            this.$targetMenu.find('[data-mutate]').trigger('mutateme.zf.trigger');

            /**
             * Fires when the element attached to the tab bar toggles.
             * @event ResponsiveToggle#toggled
             */
            this.$element.trigger('toggled.zf.responsiveToggle');
          }
        }
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.responsiveToggle');
        this.$toggler.off('.zf.responsiveToggle');

        $(window).off('changed.zf.mediaquery', this._updateMqHandler);

        Foundation.unregisterPlugin(this);
      }
    }]);

    return ResponsiveToggle;
  }();

  ResponsiveToggle.defaults = {
    /**
     * The breakpoint after which the menu is always shown, and the tab bar is hidden.
     * @option
     * @example 'medium'
     */
    hideFor: 'medium',

    /**
     * To decide if the toggle should be animated or not.
     * @option
     * @example false
     */
    animate: false
  };

  // Window exports
  Foundation.plugin(ResponsiveToggle, 'ResponsiveToggle');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Slider module.
   * @module foundation.slider
   * @requires foundation.util.motion
   * @requires foundation.util.triggers
   * @requires foundation.util.keyboard
   * @requires foundation.util.touch
   */

  var Slider = function () {
    /**
     * Creates a new instance of a slider control.
     * @class
     * @param {jQuery} element - jQuery object to make into a slider control.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Slider(element, options) {
      _classCallCheck(this, Slider);

      this.$element = element;
      this.options = $.extend({}, Slider.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Slider');
      Foundation.Keyboard.register('Slider', {
        'ltr': {
          'ARROW_RIGHT': 'increase',
          'ARROW_UP': 'increase',
          'ARROW_DOWN': 'decrease',
          'ARROW_LEFT': 'decrease',
          'SHIFT_ARROW_RIGHT': 'increase_fast',
          'SHIFT_ARROW_UP': 'increase_fast',
          'SHIFT_ARROW_DOWN': 'decrease_fast',
          'SHIFT_ARROW_LEFT': 'decrease_fast'
        },
        'rtl': {
          'ARROW_LEFT': 'increase',
          'ARROW_RIGHT': 'decrease',
          'SHIFT_ARROW_LEFT': 'increase_fast',
          'SHIFT_ARROW_RIGHT': 'decrease_fast'
        }
      });
    }

    /**
     * Initilizes the plugin by reading/setting attributes, creating collections and setting the initial position of the handle(s).
     * @function
     * @private
     */


    _createClass(Slider, [{
      key: '_init',
      value: function _init() {
        this.inputs = this.$element.find('input');
        this.handles = this.$element.find('[data-slider-handle]');

        this.$handle = this.handles.eq(0);
        this.$input = this.inputs.length ? this.inputs.eq(0) : $('#' + this.$handle.attr('aria-controls'));
        this.$fill = this.$element.find('[data-slider-fill]').css(this.options.vertical ? 'height' : 'width', 0);

        var isDbl = false,
            _this = this;
        if (this.options.disabled || this.$element.hasClass(this.options.disabledClass)) {
          this.options.disabled = true;
          this.$element.addClass(this.options.disabledClass);
        }
        if (!this.inputs.length) {
          this.inputs = $().add(this.$input);
          this.options.binding = true;
        }

        this._setInitAttr(0);

        if (this.handles[1]) {
          this.options.doubleSided = true;
          this.$handle2 = this.handles.eq(1);
          this.$input2 = this.inputs.length > 1 ? this.inputs.eq(1) : $('#' + this.$handle2.attr('aria-controls'));

          if (!this.inputs[1]) {
            this.inputs = this.inputs.add(this.$input2);
          }
          isDbl = true;

          // this.$handle.triggerHandler('click.zf.slider');
          this._setInitAttr(1);
        }

        // Set handle positions
        this.setHandles();

        this._events();
      }
    }, {
      key: 'setHandles',
      value: function setHandles() {
        var _this2 = this;

        if (this.handles[1]) {
          this._setHandlePos(this.$handle, this.inputs.eq(0).val(), true, function () {
            _this2._setHandlePos(_this2.$handle2, _this2.inputs.eq(1).val(), true);
          });
        } else {
          this._setHandlePos(this.$handle, this.inputs.eq(0).val(), true);
        }
      }
    }, {
      key: '_reflow',
      value: function _reflow() {
        this.setHandles();
      }
      /**
      * @function
      * @private
      * @param {Number} value - floating point (the value) to be transformed using to a relative position on the slider (the inverse of _value)
      */

    }, {
      key: '_pctOfBar',
      value: function _pctOfBar(value) {
        var pctOfBar = percent(value - this.options.start, this.options.end - this.options.start);

        switch (this.options.positionValueFunction) {
          case "pow":
            pctOfBar = this._logTransform(pctOfBar);
            break;
          case "log":
            pctOfBar = this._powTransform(pctOfBar);
            break;
        }

        return pctOfBar.toFixed(2);
      }

      /**
      * @function
      * @private
      * @param {Number} pctOfBar - floating point, the relative position of the slider (typically between 0-1) to be transformed to a value
      */

    }, {
      key: '_value',
      value: function _value(pctOfBar) {
        switch (this.options.positionValueFunction) {
          case "pow":
            pctOfBar = this._powTransform(pctOfBar);
            break;
          case "log":
            pctOfBar = this._logTransform(pctOfBar);
            break;
        }
        var value = (this.options.end - this.options.start) * pctOfBar + this.options.start;

        return value;
      }

      /**
      * @function
      * @private
      * @param {Number} value - floating point (typically between 0-1) to be transformed using the log function
      */

    }, {
      key: '_logTransform',
      value: function _logTransform(value) {
        return baseLog(this.options.nonLinearBase, value * (this.options.nonLinearBase - 1) + 1);
      }

      /**
      * @function
      * @private
      * @param {Number} value - floating point (typically between 0-1) to be transformed using the power function
      */

    }, {
      key: '_powTransform',
      value: function _powTransform(value) {
        return (Math.pow(this.options.nonLinearBase, value) - 1) / (this.options.nonLinearBase - 1);
      }

      /**
       * Sets the position of the selected handle and fill bar.
       * @function
       * @private
       * @param {jQuery} $hndl - the selected handle to move.
       * @param {Number} location - floating point between the start and end values of the slider bar.
       * @param {Function} cb - callback function to fire on completion.
       * @fires Slider#moved
       * @fires Slider#changed
       */

    }, {
      key: '_setHandlePos',
      value: function _setHandlePos($hndl, location, noInvert, cb) {
        // don't move if the slider has been disabled since its initialization
        if (this.$element.hasClass(this.options.disabledClass)) {
          return;
        }
        //might need to alter that slightly for bars that will have odd number selections.
        location = parseFloat(location); //on input change events, convert string to number...grumble.

        // prevent slider from running out of bounds, if value exceeds the limits set through options, override the value to min/max
        if (location < this.options.start) {
          location = this.options.start;
        } else if (location > this.options.end) {
          location = this.options.end;
        }

        var isDbl = this.options.doubleSided;

        if (isDbl) {
          //this block is to prevent 2 handles from crossing eachother. Could/should be improved.
          if (this.handles.index($hndl) === 0) {
            var h2Val = parseFloat(this.$handle2.attr('aria-valuenow'));
            location = location >= h2Val ? h2Val - this.options.step : location;
          } else {
            var h1Val = parseFloat(this.$handle.attr('aria-valuenow'));
            location = location <= h1Val ? h1Val + this.options.step : location;
          }
        }

        //this is for single-handled vertical sliders, it adjusts the value to account for the slider being "upside-down"
        //for click and drag events, it's weird due to the scale(-1, 1) css property
        if (this.options.vertical && !noInvert) {
          location = this.options.end - location;
        }

        var _this = this,
            vert = this.options.vertical,
            hOrW = vert ? 'height' : 'width',
            lOrT = vert ? 'top' : 'left',
            handleDim = $hndl[0].getBoundingClientRect()[hOrW],
            elemDim = this.$element[0].getBoundingClientRect()[hOrW],

        //percentage of bar min/max value based on click or drag point
        pctOfBar = this._pctOfBar(location),

        //number of actual pixels to shift the handle, based on the percentage obtained above
        pxToMove = (elemDim - handleDim) * pctOfBar,

        //percentage of bar to shift the handle
        movement = (percent(pxToMove, elemDim) * 100).toFixed(this.options.decimal);
        //fixing the decimal value for the location number, is passed to other methods as a fixed floating-point value
        location = parseFloat(location.toFixed(this.options.decimal));
        // declare empty object for css adjustments, only used with 2 handled-sliders
        var css = {};

        this._setValues($hndl, location);

        // TODO update to calculate based on values set to respective inputs??
        if (isDbl) {
          var isLeftHndl = this.handles.index($hndl) === 0,

          //empty variable, will be used for min-height/width for fill bar
          dim,

          //percentage w/h of the handle compared to the slider bar
          handlePct = ~~(percent(handleDim, elemDim) * 100);
          //if left handle, the math is slightly different than if it's the right handle, and the left/top property needs to be changed for the fill bar
          if (isLeftHndl) {
            //left or top percentage value to apply to the fill bar.
            css[lOrT] = movement + '%';
            //calculate the new min-height/width for the fill bar.
            dim = parseFloat(this.$handle2[0].style[lOrT]) - movement + handlePct;
            //this callback is necessary to prevent errors and allow the proper placement and initialization of a 2-handled slider
            //plus, it means we don't care if 'dim' isNaN on init, it won't be in the future.
            if (cb && typeof cb === 'function') {
              cb();
            } //this is only needed for the initialization of 2 handled sliders
          } else {
            //just caching the value of the left/bottom handle's left/top property
            var handlePos = parseFloat(this.$handle[0].style[lOrT]);
            //calculate the new min-height/width for the fill bar. Use isNaN to prevent false positives for numbers <= 0
            //based on the percentage of movement of the handle being manipulated, less the opposing handle's left/top position, plus the percentage w/h of the handle itself
            dim = movement - (isNaN(handlePos) ? (this.options.initialStart - this.options.start) / ((this.options.end - this.options.start) / 100) : handlePos) + handlePct;
          }
          // assign the min-height/width to our css object
          css['min-' + hOrW] = dim + '%';
        }

        this.$element.one('finished.zf.animate', function () {
          /**
           * Fires when the handle is done moving.
           * @event Slider#moved
           */
          _this.$element.trigger('moved.zf.slider', [$hndl]);
        });

        //because we don't know exactly how the handle will be moved, check the amount of time it should take to move.
        var moveTime = this.$element.data('dragging') ? 1000 / 60 : this.options.moveTime;

        Foundation.Move(moveTime, $hndl, function () {
          // adjusting the left/top property of the handle, based on the percentage calculated above
          // if movement isNaN, that is because the slider is hidden and we cannot determine handle width,
          // fall back to next best guess.
          if (isNaN(movement)) {
            $hndl.css(lOrT, pctOfBar * 100 + '%');
          } else {
            $hndl.css(lOrT, movement + '%');
          }

          if (!_this.options.doubleSided) {
            //if single-handled, a simple method to expand the fill bar
            _this.$fill.css(hOrW, pctOfBar * 100 + '%');
          } else {
            //otherwise, use the css object we created above
            _this.$fill.css(css);
          }
        });

        /**
         * Fires when the value has not been change for a given time.
         * @event Slider#changed
         */
        clearTimeout(_this.timeout);
        _this.timeout = setTimeout(function () {
          _this.$element.trigger('changed.zf.slider', [$hndl]);
        }, _this.options.changedDelay);
      }

      /**
       * Sets the initial attribute for the slider element.
       * @function
       * @private
       * @param {Number} idx - index of the current handle/input to use.
       */

    }, {
      key: '_setInitAttr',
      value: function _setInitAttr(idx) {
        var initVal = idx === 0 ? this.options.initialStart : this.options.initialEnd;
        var id = this.inputs.eq(idx).attr('id') || Foundation.GetYoDigits(6, 'slider');
        this.inputs.eq(idx).attr({
          'id': id,
          'max': this.options.end,
          'min': this.options.start,
          'step': this.options.step
        });
        this.inputs.eq(idx).val(initVal);
        this.handles.eq(idx).attr({
          'role': 'slider',
          'aria-controls': id,
          'aria-valuemax': this.options.end,
          'aria-valuemin': this.options.start,
          'aria-valuenow': initVal,
          'aria-orientation': this.options.vertical ? 'vertical' : 'horizontal',
          'tabindex': 0
        });
      }

      /**
       * Sets the input and `aria-valuenow` values for the slider element.
       * @function
       * @private
       * @param {jQuery} $handle - the currently selected handle.
       * @param {Number} val - floating point of the new value.
       */

    }, {
      key: '_setValues',
      value: function _setValues($handle, val) {
        var idx = this.options.doubleSided ? this.handles.index($handle) : 0;
        this.inputs.eq(idx).val(val);
        $handle.attr('aria-valuenow', val);
      }

      /**
       * Handles events on the slider element.
       * Calculates the new location of the current handle.
       * If there are two handles and the bar was clicked, it determines which handle to move.
       * @function
       * @private
       * @param {Object} e - the `event` object passed from the listener.
       * @param {jQuery} $handle - the current handle to calculate for, if selected.
       * @param {Number} val - floating point number for the new value of the slider.
       * TODO clean this up, there's a lot of repeated code between this and the _setHandlePos fn.
       */

    }, {
      key: '_handleEvent',
      value: function _handleEvent(e, $handle, val) {
        var value, hasVal;
        if (!val) {
          //click or drag events
          e.preventDefault();
          var _this = this,
              vertical = this.options.vertical,
              param = vertical ? 'height' : 'width',
              direction = vertical ? 'top' : 'left',
              eventOffset = vertical ? e.pageY : e.pageX,
              halfOfHandle = this.$handle[0].getBoundingClientRect()[param] / 2,
              barDim = this.$element[0].getBoundingClientRect()[param],
              windowScroll = vertical ? $(window).scrollTop() : $(window).scrollLeft();

          var elemOffset = this.$element.offset()[direction];

          // touch events emulated by the touch util give position relative to screen, add window.scroll to event coordinates...
          // best way to guess this is simulated is if clientY == pageY
          if (e.clientY === e.pageY) {
            eventOffset = eventOffset + windowScroll;
          }
          var eventFromBar = eventOffset - elemOffset;
          var barXY;
          if (eventFromBar < 0) {
            barXY = 0;
          } else if (eventFromBar > barDim) {
            barXY = barDim;
          } else {
            barXY = eventFromBar;
          }
          var offsetPct = percent(barXY, barDim);

          value = this._value(offsetPct);

          // turn everything around for RTL, yay math!
          if (Foundation.rtl() && !this.options.vertical) {
            value = this.options.end - value;
          }

          value = _this._adjustValue(null, value);
          //boolean flag for the setHandlePos fn, specifically for vertical sliders
          hasVal = false;

          if (!$handle) {
            //figure out which handle it is, pass it to the next function.
            var firstHndlPos = absPosition(this.$handle, direction, barXY, param),
                secndHndlPos = absPosition(this.$handle2, direction, barXY, param);
            $handle = firstHndlPos <= secndHndlPos ? this.$handle : this.$handle2;
          }
        } else {
          //change event on input
          value = this._adjustValue(null, val);
          hasVal = true;
        }

        this._setHandlePos($handle, value, hasVal);
      }

      /**
       * Adjustes value for handle in regard to step value. returns adjusted value
       * @function
       * @private
       * @param {jQuery} $handle - the selected handle.
       * @param {Number} value - value to adjust. used if $handle is falsy
       */

    }, {
      key: '_adjustValue',
      value: function _adjustValue($handle, value) {
        var val,
            step = this.options.step,
            div = parseFloat(step / 2),
            left,
            prev_val,
            next_val;
        if (!!$handle) {
          val = parseFloat($handle.attr('aria-valuenow'));
        } else {
          val = value;
        }
        left = val % step;
        prev_val = val - left;
        next_val = prev_val + step;
        if (left === 0) {
          return val;
        }
        val = val >= prev_val + div ? next_val : prev_val;
        return val;
      }

      /**
       * Adds event listeners to the slider elements.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this._eventsForHandle(this.$handle);
        if (this.handles[1]) {
          this._eventsForHandle(this.$handle2);
        }
      }

      /**
       * Adds event listeners a particular handle
       * @function
       * @private
       * @param {jQuery} $handle - the current handle to apply listeners to.
       */

    }, {
      key: '_eventsForHandle',
      value: function _eventsForHandle($handle) {
        var _this = this,
            curHandle,
            timer;

        this.inputs.off('change.zf.slider').on('change.zf.slider', function (e) {
          var idx = _this.inputs.index($(this));
          _this._handleEvent(e, _this.handles.eq(idx), $(this).val());
        });

        if (this.options.clickSelect) {
          this.$element.off('click.zf.slider').on('click.zf.slider', function (e) {
            if (_this.$element.data('dragging')) {
              return false;
            }

            if (!$(e.target).is('[data-slider-handle]')) {
              if (_this.options.doubleSided) {
                _this._handleEvent(e);
              } else {
                _this._handleEvent(e, _this.$handle);
              }
            }
          });
        }

        if (this.options.draggable) {
          this.handles.addTouch();

          var $body = $('body');
          $handle.off('mousedown.zf.slider').on('mousedown.zf.slider', function (e) {
            $handle.addClass('is-dragging');
            _this.$fill.addClass('is-dragging'); //
            _this.$element.data('dragging', true);

            curHandle = $(e.currentTarget);

            $body.on('mousemove.zf.slider', function (e) {
              e.preventDefault();
              _this._handleEvent(e, curHandle);
            }).on('mouseup.zf.slider', function (e) {
              _this._handleEvent(e, curHandle);

              $handle.removeClass('is-dragging');
              _this.$fill.removeClass('is-dragging');
              _this.$element.data('dragging', false);

              $body.off('mousemove.zf.slider mouseup.zf.slider');
            });
          })
          // prevent events triggered by touch
          .on('selectstart.zf.slider touchmove.zf.slider', function (e) {
            e.preventDefault();
          });
        }

        $handle.off('keydown.zf.slider').on('keydown.zf.slider', function (e) {
          var _$handle = $(this),
              idx = _this.options.doubleSided ? _this.handles.index(_$handle) : 0,
              oldValue = parseFloat(_this.inputs.eq(idx).val()),
              newValue;

          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Slider', {
            decrease: function decrease() {
              newValue = oldValue - _this.options.step;
            },
            increase: function increase() {
              newValue = oldValue + _this.options.step;
            },
            decrease_fast: function decrease_fast() {
              newValue = oldValue - _this.options.step * 10;
            },
            increase_fast: function increase_fast() {
              newValue = oldValue + _this.options.step * 10;
            },
            handled: function handled() {
              // only set handle pos when event was handled specially
              e.preventDefault();
              _this._setHandlePos(_$handle, newValue, true);
            }
          });
          /*if (newValue) { // if pressed key has special function, update value
            e.preventDefault();
            _this._setHandlePos(_$handle, newValue);
          }*/
        });
      }

      /**
       * Destroys the slider plugin.
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.handles.off('.zf.slider');
        this.inputs.off('.zf.slider');
        this.$element.off('.zf.slider');

        clearTimeout(this.timeout);

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Slider;
  }();

  Slider.defaults = {
    /**
     * Minimum value for the slider scale.
     * @option
     * @example 0
     */
    start: 0,
    /**
     * Maximum value for the slider scale.
     * @option
     * @example 100
     */
    end: 100,
    /**
     * Minimum value change per change event.
     * @option
     * @example 1
     */
    step: 1,
    /**
     * Value at which the handle/input *(left handle/first input)* should be set to on initialization.
     * @option
     * @example 0
     */
    initialStart: 0,
    /**
     * Value at which the right handle/second input should be set to on initialization.
     * @option
     * @example 100
     */
    initialEnd: 100,
    /**
     * Allows the input to be located outside the container and visible. Set to by the JS
     * @option
     * @example false
     */
    binding: false,
    /**
     * Allows the user to click/tap on the slider bar to select a value.
     * @option
     * @example true
     */
    clickSelect: true,
    /**
     * Set to true and use the `vertical` class to change alignment to vertical.
     * @option
     * @example false
     */
    vertical: false,
    /**
     * Allows the user to drag the slider handle(s) to select a value.
     * @option
     * @example true
     */
    draggable: true,
    /**
     * Disables the slider and prevents event listeners from being applied. Double checked by JS with `disabledClass`.
     * @option
     * @example false
     */
    disabled: false,
    /**
     * Allows the use of two handles. Double checked by the JS. Changes some logic handling.
     * @option
     * @example false
     */
    doubleSided: false,
    /**
     * Potential future feature.
     */
    // steps: 100,
    /**
     * Number of decimal places the plugin should go to for floating point precision.
     * @option
     * @example 2
     */
    decimal: 2,
    /**
     * Time delay for dragged elements.
     */
    // dragDelay: 0,
    /**
     * Time, in ms, to animate the movement of a slider handle if user clicks/taps on the bar. Needs to be manually set if updating the transition time in the Sass settings.
     * @option
     * @example 200
     */
    moveTime: 200, //update this if changing the transition time in the sass
    /**
     * Class applied to disabled sliders.
     * @option
     * @example 'disabled'
     */
    disabledClass: 'disabled',
    /**
     * Will invert the default layout for a vertical<span data-tooltip title="who would do this???"> </span>slider.
     * @option
     * @example false
     */
    invertVertical: false,
    /**
     * Milliseconds before the `changed.zf-slider` event is triggered after value change.
     * @option
     * @example 500
     */
    changedDelay: 500,
    /**
    * Basevalue for non-linear sliders
    * @option
    * @example 5
    */
    nonLinearBase: 5,
    /**
    * Basevalue for non-linear sliders, possible values are: 'linear', 'pow' & 'log'. Pow and Log use the nonLinearBase setting.
    * @option
    * @example 'linear'
    */
    positionValueFunction: 'linear'
  };

  function percent(frac, num) {
    return frac / num;
  }
  function absPosition($handle, dir, clickPos, param) {
    return Math.abs($handle.position()[dir] + $handle[param]() / 2 - clickPos);
  }
  function baseLog(base, value) {
    return Math.log(value) / Math.log(base);
  }

  // Window exports
  Foundation.plugin(Slider, 'Slider');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Sticky module.
   * @module foundation.sticky
   * @requires foundation.util.triggers
   * @requires foundation.util.mediaQuery
   */

  var Sticky = function () {
    /**
     * Creates a new instance of a sticky thing.
     * @class
     * @param {jQuery} element - jQuery object to make sticky.
     * @param {Object} options - options object passed when creating the element programmatically.
     */
    function Sticky(element, options) {
      _classCallCheck(this, Sticky);

      this.$element = element;
      this.options = $.extend({}, Sticky.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Sticky');
    }

    /**
     * Initializes the sticky element by adding classes, getting/setting dimensions, breakpoints and attributes
     * @function
     * @private
     */


    _createClass(Sticky, [{
      key: '_init',
      value: function _init() {
        var $parent = this.$element.parent('[data-sticky-container]'),
            id = this.$element[0].id || Foundation.GetYoDigits(6, 'sticky'),
            _this = this;

        if (!$parent.length) {
          this.wasWrapped = true;
        }
        this.$container = $parent.length ? $parent : $(this.options.container).wrapInner(this.$element);
        this.$container.addClass(this.options.containerClass);

        this.$element.addClass(this.options.stickyClass).attr({ 'data-resize': id });

        this.scrollCount = this.options.checkEvery;
        this.isStuck = false;
        $(window).one('load.zf.sticky', function () {
          //We calculate the container height to have correct values for anchor points offset calculation.
          _this.containerHeight = _this.$element.css("display") == "none" ? 0 : _this.$element[0].getBoundingClientRect().height;
          _this.$container.css('height', _this.containerHeight);
          _this.elemHeight = _this.containerHeight;
          if (_this.options.anchor !== '') {
            _this.$anchor = $('#' + _this.options.anchor);
          } else {
            _this._parsePoints();
          }

          _this._setSizes(function () {
            var scroll = window.pageYOffset;
            _this._calc(false, scroll);
            //Unstick the element will ensure that proper classes are set.
            if (!_this.isStuck) {
              _this._removeSticky(scroll >= _this.topPoint ? false : true);
            }
          });
          _this._events(id.split('-').reverse().join('-'));
        });
      }

      /**
       * If using multiple elements as anchors, calculates the top and bottom pixel values the sticky thing should stick and unstick on.
       * @function
       * @private
       */

    }, {
      key: '_parsePoints',
      value: function _parsePoints() {
        var top = this.options.topAnchor == "" ? 1 : this.options.topAnchor,
            btm = this.options.btmAnchor == "" ? document.documentElement.scrollHeight : this.options.btmAnchor,
            pts = [top, btm],
            breaks = {};
        for (var i = 0, len = pts.length; i < len && pts[i]; i++) {
          var pt;
          if (typeof pts[i] === 'number') {
            pt = pts[i];
          } else {
            var place = pts[i].split(':'),
                anchor = $('#' + place[0]);

            pt = anchor.offset().top;
            if (place[1] && place[1].toLowerCase() === 'bottom') {
              pt += anchor[0].getBoundingClientRect().height;
            }
          }
          breaks[i] = pt;
        }

        this.points = breaks;
        return;
      }

      /**
       * Adds event handlers for the scrolling element.
       * @private
       * @param {String} id - psuedo-random id for unique scroll event listener.
       */

    }, {
      key: '_events',
      value: function _events(id) {
        var _this = this,
            scrollListener = this.scrollListener = 'scroll.zf.' + id;
        if (this.isOn) {
          return;
        }
        if (this.canStick) {
          this.isOn = true;
          $(window).off(scrollListener).on(scrollListener, function (e) {
            if (_this.scrollCount === 0) {
              _this.scrollCount = _this.options.checkEvery;
              _this._setSizes(function () {
                _this._calc(false, window.pageYOffset);
              });
            } else {
              _this.scrollCount--;
              _this._calc(false, window.pageYOffset);
            }
          });
        }

        this.$element.off('resizeme.zf.trigger').on('resizeme.zf.trigger', function (e, el) {
          _this._setSizes(function () {
            _this._calc(false);
            if (_this.canStick) {
              if (!_this.isOn) {
                _this._events(id);
              }
            } else if (_this.isOn) {
              _this._pauseListeners(scrollListener);
            }
          });
        });
      }

      /**
       * Removes event handlers for scroll and change events on anchor.
       * @fires Sticky#pause
       * @param {String} scrollListener - unique, namespaced scroll listener attached to `window`
       */

    }, {
      key: '_pauseListeners',
      value: function _pauseListeners(scrollListener) {
        this.isOn = false;
        $(window).off(scrollListener);

        /**
         * Fires when the plugin is paused due to resize event shrinking the view.
         * @event Sticky#pause
         * @private
         */
        this.$element.trigger('pause.zf.sticky');
      }

      /**
       * Called on every `scroll` event and on `_init`
       * fires functions based on booleans and cached values
       * @param {Boolean} checkSizes - true if plugin should recalculate sizes and breakpoints.
       * @param {Number} scroll - current scroll position passed from scroll event cb function. If not passed, defaults to `window.pageYOffset`.
       */

    }, {
      key: '_calc',
      value: function _calc(checkSizes, scroll) {
        if (checkSizes) {
          this._setSizes();
        }

        if (!this.canStick) {
          if (this.isStuck) {
            this._removeSticky(true);
          }
          return false;
        }

        if (!scroll) {
          scroll = window.pageYOffset;
        }

        if (scroll >= this.topPoint) {
          if (scroll <= this.bottomPoint) {
            if (!this.isStuck) {
              this._setSticky();
            }
          } else {
            if (this.isStuck) {
              this._removeSticky(false);
            }
          }
        } else {
          if (this.isStuck) {
            this._removeSticky(true);
          }
        }
      }

      /**
       * Causes the $element to become stuck.
       * Adds `position: fixed;`, and helper classes.
       * @fires Sticky#stuckto
       * @function
       * @private
       */

    }, {
      key: '_setSticky',
      value: function _setSticky() {
        var _this = this,
            stickTo = this.options.stickTo,
            mrgn = stickTo === 'top' ? 'marginTop' : 'marginBottom',
            notStuckTo = stickTo === 'top' ? 'bottom' : 'top',
            css = {};

        css[mrgn] = this.options[mrgn] + 'em';
        css[stickTo] = 0;
        css[notStuckTo] = 'auto';
        this.isStuck = true;
        this.$element.removeClass('is-anchored is-at-' + notStuckTo).addClass('is-stuck is-at-' + stickTo).css(css)
        /**
         * Fires when the $element has become `position: fixed;`
         * Namespaced to `top` or `bottom`, e.g. `sticky.zf.stuckto:top`
         * @event Sticky#stuckto
         */
        .trigger('sticky.zf.stuckto:' + stickTo);
        this.$element.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", function () {
          _this._setSizes();
        });
      }

      /**
       * Causes the $element to become unstuck.
       * Removes `position: fixed;`, and helper classes.
       * Adds other helper classes.
       * @param {Boolean} isTop - tells the function if the $element should anchor to the top or bottom of its $anchor element.
       * @fires Sticky#unstuckfrom
       * @private
       */

    }, {
      key: '_removeSticky',
      value: function _removeSticky(isTop) {
        var stickTo = this.options.stickTo,
            stickToTop = stickTo === 'top',
            css = {},
            anchorPt = (this.points ? this.points[1] - this.points[0] : this.anchorHeight) - this.elemHeight,
            mrgn = stickToTop ? 'marginTop' : 'marginBottom',
            notStuckTo = stickToTop ? 'bottom' : 'top',
            topOrBottom = isTop ? 'top' : 'bottom';

        css[mrgn] = 0;

        css['bottom'] = 'auto';
        if (isTop) {
          css['top'] = 0;
        } else {
          css['top'] = anchorPt;
        }

        this.isStuck = false;
        this.$element.removeClass('is-stuck is-at-' + stickTo).addClass('is-anchored is-at-' + topOrBottom).css(css)
        /**
         * Fires when the $element has become anchored.
         * Namespaced to `top` or `bottom`, e.g. `sticky.zf.unstuckfrom:bottom`
         * @event Sticky#unstuckfrom
         */
        .trigger('sticky.zf.unstuckfrom:' + topOrBottom);
      }

      /**
       * Sets the $element and $container sizes for plugin.
       * Calls `_setBreakPoints`.
       * @param {Function} cb - optional callback function to fire on completion of `_setBreakPoints`.
       * @private
       */

    }, {
      key: '_setSizes',
      value: function _setSizes(cb) {
        this.canStick = Foundation.MediaQuery.is(this.options.stickyOn);
        if (!this.canStick) {
          if (cb && typeof cb === 'function') {
            cb();
          }
        }
        var _this = this,
            newElemWidth = this.$container[0].getBoundingClientRect().width,
            comp = window.getComputedStyle(this.$container[0]),
            pdngl = parseInt(comp['padding-left'], 10),
            pdngr = parseInt(comp['padding-right'], 10);

        if (this.$anchor && this.$anchor.length) {
          this.anchorHeight = this.$anchor[0].getBoundingClientRect().height;
        } else {
          this._parsePoints();
        }

        this.$element.css({
          'max-width': newElemWidth - pdngl - pdngr + 'px'
        });

        var newContainerHeight = this.$element[0].getBoundingClientRect().height || this.containerHeight;
        if (this.$element.css("display") == "none") {
          newContainerHeight = 0;
        }
        this.containerHeight = newContainerHeight;
        this.$container.css({
          height: newContainerHeight
        });
        this.elemHeight = newContainerHeight;

        if (!this.isStuck) {
          if (this.$element.hasClass('is-at-bottom')) {
            var anchorPt = (this.points ? this.points[1] - this.$container.offset().top : this.anchorHeight) - this.elemHeight;
            this.$element.css('top', anchorPt);
          }
        }

        this._setBreakPoints(newContainerHeight, function () {
          if (cb && typeof cb === 'function') {
            cb();
          }
        });
      }

      /**
       * Sets the upper and lower breakpoints for the element to become sticky/unsticky.
       * @param {Number} elemHeight - px value for sticky.$element height, calculated by `_setSizes`.
       * @param {Function} cb - optional callback function to be called on completion.
       * @private
       */

    }, {
      key: '_setBreakPoints',
      value: function _setBreakPoints(elemHeight, cb) {
        if (!this.canStick) {
          if (cb && typeof cb === 'function') {
            cb();
          } else {
            return false;
          }
        }
        var mTop = emCalc(this.options.marginTop),
            mBtm = emCalc(this.options.marginBottom),
            topPoint = this.points ? this.points[0] : this.$anchor.offset().top,
            bottomPoint = this.points ? this.points[1] : topPoint + this.anchorHeight,

        // topPoint = this.$anchor.offset().top || this.points[0],
        // bottomPoint = topPoint + this.anchorHeight || this.points[1],
        winHeight = window.innerHeight;

        if (this.options.stickTo === 'top') {
          topPoint -= mTop;
          bottomPoint -= elemHeight + mTop;
        } else if (this.options.stickTo === 'bottom') {
          topPoint -= winHeight - (elemHeight + mBtm);
          bottomPoint -= winHeight - mBtm;
        } else {
          //this would be the stickTo: both option... tricky
        }

        this.topPoint = topPoint;
        this.bottomPoint = bottomPoint;

        if (cb && typeof cb === 'function') {
          cb();
        }
      }

      /**
       * Destroys the current sticky element.
       * Resets the element to the top position first.
       * Removes event listeners, JS-added css properties and classes, and unwraps the $element if the JS added the $container.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this._removeSticky(true);

        this.$element.removeClass(this.options.stickyClass + ' is-anchored is-at-top').css({
          height: '',
          top: '',
          bottom: '',
          'max-width': ''
        }).off('resizeme.zf.trigger');
        if (this.$anchor && this.$anchor.length) {
          this.$anchor.off('change.zf.sticky');
        }
        $(window).off(this.scrollListener);

        if (this.wasWrapped) {
          this.$element.unwrap();
        } else {
          this.$container.removeClass(this.options.containerClass).css({
            height: ''
          });
        }
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Sticky;
  }();

  Sticky.defaults = {
    /**
     * Customizable container template. Add your own classes for styling and sizing.
     * @option
     * @example '&lt;div data-sticky-container class="small-6 columns"&gt;&lt;/div&gt;'
     */
    container: '<div data-sticky-container></div>',
    /**
     * Location in the view the element sticks to.
     * @option
     * @example 'top'
     */
    stickTo: 'top',
    /**
     * If anchored to a single element, the id of that element.
     * @option
     * @example 'exampleId'
     */
    anchor: '',
    /**
     * If using more than one element as anchor points, the id of the top anchor.
     * @option
     * @example 'exampleId:top'
     */
    topAnchor: '',
    /**
     * If using more than one element as anchor points, the id of the bottom anchor.
     * @option
     * @example 'exampleId:bottom'
     */
    btmAnchor: '',
    /**
     * Margin, in `em`'s to apply to the top of the element when it becomes sticky.
     * @option
     * @example 1
     */
    marginTop: 1,
    /**
     * Margin, in `em`'s to apply to the bottom of the element when it becomes sticky.
     * @option
     * @example 1
     */
    marginBottom: 1,
    /**
     * Breakpoint string that is the minimum screen size an element should become sticky.
     * @option
     * @example 'medium'
     */
    stickyOn: 'medium',
    /**
     * Class applied to sticky element, and removed on destruction. Foundation defaults to `sticky`.
     * @option
     * @example 'sticky'
     */
    stickyClass: 'sticky',
    /**
     * Class applied to sticky container. Foundation defaults to `sticky-container`.
     * @option
     * @example 'sticky-container'
     */
    containerClass: 'sticky-container',
    /**
     * Number of scroll events between the plugin's recalculating sticky points. Setting it to `0` will cause it to recalc every scroll event, setting it to `-1` will prevent recalc on scroll.
     * @option
     * @example 50
     */
    checkEvery: -1
  };

  /**
   * Helper function to calculate em values
   * @param Number {em} - number of em's to calculate into pixels
   */
  function emCalc(em) {
    return parseInt(window.getComputedStyle(document.body, null).fontSize, 10) * em;
  }

  // Window exports
  Foundation.plugin(Sticky, 'Sticky');
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Tabs module.
   * @module foundation.tabs
   * @requires foundation.util.keyboard
   * @requires foundation.util.timerAndImageLoader if tabs contain images
   */

  var Tabs = function () {
    /**
     * Creates a new instance of tabs.
     * @class
     * @fires Tabs#init
     * @param {jQuery} element - jQuery object to make into tabs.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Tabs(element, options) {
      _classCallCheck(this, Tabs);

      this.$element = element;
      this.options = $.extend({}, Tabs.defaults, this.$element.data(), options);

      this._init();
      Foundation.registerPlugin(this, 'Tabs');
      Foundation.Keyboard.register('Tabs', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'previous',
        'ARROW_DOWN': 'next',
        'ARROW_LEFT': 'previous'
        // 'TAB': 'next',
        // 'SHIFT_TAB': 'previous'
      });
    }

    /**
     * Initializes the tabs by showing and focusing (if autoFocus=true) the preset active tab.
     * @private
     */


    _createClass(Tabs, [{
      key: '_init',
      value: function _init() {
        var _this = this;

        this.$element.attr({ 'role': 'tablist' });
        this.$tabTitles = this.$element.find('.' + this.options.linkClass);
        this.$tabContent = $('[data-tabs-content="' + this.$element[0].id + '"]');

        this.$tabTitles.each(function () {
          var $elem = $(this),
              $link = $elem.find('a'),
              isActive = $elem.hasClass('' + _this.options.linkActiveClass),
              hash = $link[0].hash.slice(1),
              linkId = $link[0].id ? $link[0].id : hash + '-label',
              $tabContent = $('#' + hash);

          $elem.attr({ 'role': 'presentation' });

          $link.attr({
            'role': 'tab',
            'aria-controls': hash,
            'aria-selected': isActive,
            'id': linkId
          });

          $tabContent.attr({
            'role': 'tabpanel',
            'aria-hidden': !isActive,
            'aria-labelledby': linkId
          });

          if (isActive && _this.options.autoFocus) {
            $(window).load(function () {
              $('html, body').animate({ scrollTop: $elem.offset().top }, _this.options.deepLinkSmudgeDelay, function () {
                $link.focus();
              });
            });
          }

          //use browser to open a tab, if it exists in this tabset
          if (_this.options.deepLink) {
            var anchor = window.location.hash;
            //need a hash and a relevant anchor in this tabset
            if (anchor.length) {
              var $link = $elem.find('[href="' + anchor + '"]');
              if ($link.length) {
                _this.selectTab($(anchor));

                //roll up a little to show the titles
                if (_this.options.deepLinkSmudge) {
                  $(window).load(function () {
                    var offset = $elem.offset();
                    $('html, body').animate({ scrollTop: offset.top }, _this.options.deepLinkSmudgeDelay);
                  });
                }

                /**
                  * Fires when the zplugin has deeplinked at pageload
                  * @event Tabs#deeplink
                  */
                $elem.trigger('deeplink.zf.tabs', [$link, $(anchor)]);
              }
            }
          }
        });

        if (this.options.matchHeight) {
          var $images = this.$tabContent.find('img');

          if ($images.length) {
            Foundation.onImagesLoaded($images, this._setHeight.bind(this));
          } else {
            this._setHeight();
          }
        }

        this._events();
      }

      /**
       * Adds event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this._addKeyHandler();
        this._addClickHandler();
        this._setHeightMqHandler = null;

        if (this.options.matchHeight) {
          this._setHeightMqHandler = this._setHeight.bind(this);

          $(window).on('changed.zf.mediaquery', this._setHeightMqHandler);
        }
      }

      /**
       * Adds click handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addClickHandler',
      value: function _addClickHandler() {
        var _this = this;

        this.$element.off('click.zf.tabs').on('click.zf.tabs', '.' + this.options.linkClass, function (e) {
          e.preventDefault();
          e.stopPropagation();
          _this._handleTabChange($(this));
        });
      }

      /**
       * Adds keyboard event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addKeyHandler',
      value: function _addKeyHandler() {
        var _this = this;

        this.$tabTitles.off('keydown.zf.tabs').on('keydown.zf.tabs', function (e) {
          if (e.which === 9) return;

          var $element = $(this),
              $elements = $element.parent('ul').children('li'),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              if (_this.options.wrapOnKeys) {
                $prevElement = i === 0 ? $elements.last() : $elements.eq(i - 1);
                $nextElement = i === $elements.length - 1 ? $elements.first() : $elements.eq(i + 1);
              } else {
                $prevElement = $elements.eq(Math.max(0, i - 1));
                $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              }
              return;
            }
          });

          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Tabs', {
            open: function open() {
              $element.find('[role="tab"]').focus();
              _this._handleTabChange($element);
            },
            previous: function previous() {
              $prevElement.find('[role="tab"]').focus();
              _this._handleTabChange($prevElement);
            },
            next: function next() {
              $nextElement.find('[role="tab"]').focus();
              _this._handleTabChange($nextElement);
            },
            handled: function handled() {
              e.stopPropagation();
              e.preventDefault();
            }
          });
        });
      }

      /**
       * Opens the tab `$targetContent` defined by `$target`. Collapses active tab.
       * @param {jQuery} $target - Tab to open.
       * @fires Tabs#change
       * @function
       */

    }, {
      key: '_handleTabChange',
      value: function _handleTabChange($target) {

        /**
         * Check for active class on target. Collapse if exists.
         */
        if ($target.hasClass('' + this.options.linkActiveClass)) {
          if (this.options.activeCollapse) {
            this._collapseTab($target);

            /**
             * Fires when the zplugin has successfully collapsed tabs.
             * @event Tabs#collapse
             */
            this.$element.trigger('collapse.zf.tabs', [$target]);
          }
          return;
        }

        var $oldTab = this.$element.find('.' + this.options.linkClass + '.' + this.options.linkActiveClass),
            $tabLink = $target.find('[role="tab"]'),
            hash = $tabLink[0].hash,
            $targetContent = this.$tabContent.find(hash);

        //close old tab
        this._collapseTab($oldTab);

        //open new tab
        this._openTab($target);

        //either replace or update browser history
        if (this.options.deepLink) {
          var anchor = $target.find('a').attr('href');

          if (this.options.updateHistory) {
            history.pushState({}, '', anchor);
          } else {
            history.replaceState({}, '', anchor);
          }
        }

        /**
         * Fires when the plugin has successfully changed tabs.
         * @event Tabs#change
         */
        this.$element.trigger('change.zf.tabs', [$target, $targetContent]);

        //fire to children a mutation event
        $targetContent.find("[data-mutate]").trigger("mutateme.zf.trigger");
      }

      /**
       * Opens the tab `$targetContent` defined by `$target`.
       * @param {jQuery} $target - Tab to Open.
       * @function
       */

    }, {
      key: '_openTab',
      value: function _openTab($target) {
        var $tabLink = $target.find('[role="tab"]'),
            hash = $tabLink[0].hash,
            $targetContent = this.$tabContent.find(hash);

        $target.addClass('' + this.options.linkActiveClass);

        $tabLink.attr({ 'aria-selected': 'true' });

        $targetContent.addClass('' + this.options.panelActiveClass).attr({ 'aria-hidden': 'false' });
      }

      /**
       * Collapses `$targetContent` defined by `$target`.
       * @param {jQuery} $target - Tab to Open.
       * @function
       */

    }, {
      key: '_collapseTab',
      value: function _collapseTab($target) {
        var $target_anchor = $target.removeClass('' + this.options.linkActiveClass).find('[role="tab"]').attr({ 'aria-selected': 'false' });

        $('#' + $target_anchor.attr('aria-controls')).removeClass('' + this.options.panelActiveClass).attr({ 'aria-hidden': 'true' });
      }

      /**
       * Public method for selecting a content pane to display.
       * @param {jQuery | String} elem - jQuery object or string of the id of the pane to display.
       * @function
       */

    }, {
      key: 'selectTab',
      value: function selectTab(elem) {
        var idStr;

        if ((typeof elem === 'undefined' ? 'undefined' : _typeof(elem)) === 'object') {
          idStr = elem[0].id;
        } else {
          idStr = elem;
        }

        if (idStr.indexOf('#') < 0) {
          idStr = '#' + idStr;
        }

        var $target = this.$tabTitles.find('[href="' + idStr + '"]').parent('.' + this.options.linkClass);

        this._handleTabChange($target);
      }
    }, {
      key: '_setHeight',

      /**
       * Sets the height of each panel to the height of the tallest panel.
       * If enabled in options, gets called on media query change.
       * If loading content via external source, can be called directly or with _reflow.
       * @function
       * @private
       */
      value: function _setHeight() {
        var max = 0;
        this.$tabContent.find('.' + this.options.panelClass).css('height', '').each(function () {
          var panel = $(this),
              isActive = panel.hasClass('' + this.options.panelActiveClass);

          if (!isActive) {
            panel.css({ 'visibility': 'hidden', 'display': 'block' });
          }

          var temp = this.getBoundingClientRect().height;

          if (!isActive) {
            panel.css({
              'visibility': '',
              'display': ''
            });
          }

          max = temp > max ? temp : max;
        }).css('height', max + 'px');
      }

      /**
       * Destroys an instance of an tabs.
       * @fires Tabs#destroyed
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('.' + this.options.linkClass).off('.zf.tabs').hide().end().find('.' + this.options.panelClass).hide();

        if (this.options.matchHeight) {
          if (this._setHeightMqHandler != null) {
            $(window).off('changed.zf.mediaquery', this._setHeightMqHandler);
          }
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Tabs;
  }();

  Tabs.defaults = {
    /**
     * Allows the window to scroll to content of pane specified by hash anchor
     * @option
     * @example false
     */
    deepLink: false,

    /**
     * Adjust the deep link scroll to make sure the top of the tab panel is visible
     * @option
     * @example false
     */
    deepLinkSmudge: false,

    /**
     * Animation time (ms) for the deep link adjustment
     * @option
     * @example 300
     */
    deepLinkSmudgeDelay: 300,

    /**
     * Update the browser history with the open tab
     * @option
     * @example false
     */
    updateHistory: false,

    /**
     * Allows the window to scroll to content of active pane on load if set to true.
     * Not recommended if more than one tab panel per page.
     * @option
     * @example false
     */
    autoFocus: false,

    /**
     * Allows keyboard input to 'wrap' around the tab links.
     * @option
     * @example true
     */
    wrapOnKeys: true,

    /**
     * Allows the tab content panes to match heights if set to true.
     * @option
     * @example false
     */
    matchHeight: false,

    /**
     * Allows active tabs to collapse when clicked.
     * @option
     * @example false
     */
    activeCollapse: false,

    /**
     * Class applied to `li`'s in tab link list.
     * @option
     * @example 'tabs-title'
     */
    linkClass: 'tabs-title',

    /**
     * Class applied to the active `li` in tab link list.
     * @option
     * @example 'is-active'
     */
    linkActiveClass: 'is-active',

    /**
     * Class applied to the content containers.
     * @option
     * @example 'tabs-panel'
     */
    panelClass: 'tabs-panel',

    /**
     * Class applied to the active content container.
     * @option
     * @example 'is-active'
     */
    panelActiveClass: 'is-active'
  };

  // Window exports
  Foundation.plugin(Tabs, 'Tabs');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Toggler module.
   * @module foundation.toggler
   * @requires foundation.util.motion
   * @requires foundation.util.triggers
   */

  var Toggler = function () {
    /**
     * Creates a new instance of Toggler.
     * @class
     * @fires Toggler#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Toggler(element, options) {
      _classCallCheck(this, Toggler);

      this.$element = element;
      this.options = $.extend({}, Toggler.defaults, element.data(), options);
      this.className = '';

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'Toggler');
    }

    /**
     * Initializes the Toggler plugin by parsing the toggle class from data-toggler, or animation classes from data-animate.
     * @function
     * @private
     */


    _createClass(Toggler, [{
      key: '_init',
      value: function _init() {
        var input;
        // Parse animation classes if they were set
        if (this.options.animate) {
          input = this.options.animate.split(' ');

          this.animationIn = input[0];
          this.animationOut = input[1] || null;
        }
        // Otherwise, parse toggle class
        else {
            input = this.$element.data('toggler');
            // Allow for a . at the beginning of the string
            this.className = input[0] === '.' ? input.slice(1) : input;
          }

        // Add ARIA attributes to triggers
        var id = this.$element[0].id;
        $('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-controls', id);
        // If the target is hidden, add aria-hidden
        this.$element.attr('aria-expanded', this.$element.is(':hidden') ? false : true);
      }

      /**
       * Initializes events for the toggle trigger.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this.$element.off('toggle.zf.trigger').on('toggle.zf.trigger', this.toggle.bind(this));
      }

      /**
       * Toggles the target class on the target element. An event is fired from the original trigger depending on if the resultant state was "on" or "off".
       * @function
       * @fires Toggler#on
       * @fires Toggler#off
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        this[this.options.animate ? '_toggleAnimate' : '_toggleClass']();
      }
    }, {
      key: '_toggleClass',
      value: function _toggleClass() {
        this.$element.toggleClass(this.className);

        var isOn = this.$element.hasClass(this.className);
        if (isOn) {
          /**
           * Fires if the target element has the class after a toggle.
           * @event Toggler#on
           */
          this.$element.trigger('on.zf.toggler');
        } else {
          /**
           * Fires if the target element does not have the class after a toggle.
           * @event Toggler#off
           */
          this.$element.trigger('off.zf.toggler');
        }

        this._updateARIA(isOn);
        this.$element.find('[data-mutate]').trigger('mutateme.zf.trigger');
      }
    }, {
      key: '_toggleAnimate',
      value: function _toggleAnimate() {
        var _this = this;

        if (this.$element.is(':hidden')) {
          Foundation.Motion.animateIn(this.$element, this.animationIn, function () {
            _this._updateARIA(true);
            this.trigger('on.zf.toggler');
            this.find('[data-mutate]').trigger('mutateme.zf.trigger');
          });
        } else {
          Foundation.Motion.animateOut(this.$element, this.animationOut, function () {
            _this._updateARIA(false);
            this.trigger('off.zf.toggler');
            this.find('[data-mutate]').trigger('mutateme.zf.trigger');
          });
        }
      }
    }, {
      key: '_updateARIA',
      value: function _updateARIA(isOn) {
        this.$element.attr('aria-expanded', isOn ? true : false);
      }

      /**
       * Destroys the instance of Toggler on the element.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.toggler');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Toggler;
  }();

  Toggler.defaults = {
    /**
     * Tells the plugin if the element should animated when toggled.
     * @option
     * @example false
     */
    animate: false
  };

  // Window exports
  Foundation.plugin(Toggler, 'Toggler');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Tooltip module.
   * @module foundation.tooltip
   * @requires foundation.util.box
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.triggers
   */

  var Tooltip = function () {
    /**
     * Creates a new instance of a Tooltip.
     * @class
     * @fires Tooltip#init
     * @param {jQuery} element - jQuery object to attach a tooltip to.
     * @param {Object} options - object to extend the default configuration.
     */
    function Tooltip(element, options) {
      _classCallCheck(this, Tooltip);

      this.$element = element;
      this.options = $.extend({}, Tooltip.defaults, this.$element.data(), options);

      this.isActive = false;
      this.isClick = false;
      this._init();

      Foundation.registerPlugin(this, 'Tooltip');
    }

    /**
     * Initializes the tooltip by setting the creating the tip element, adding it's text, setting private variables and setting attributes on the anchor.
     * @private
     */


    _createClass(Tooltip, [{
      key: '_init',
      value: function _init() {
        var elemId = this.$element.attr('aria-describedby') || Foundation.GetYoDigits(6, 'tooltip');

        this.options.positionClass = this.options.positionClass || this._getPositionClass(this.$element);
        this.options.tipText = this.options.tipText || this.$element.attr('title');
        this.template = this.options.template ? $(this.options.template) : this._buildTemplate(elemId);

        if (this.options.allowHtml) {
          this.template.appendTo(document.body).html(this.options.tipText).hide();
        } else {
          this.template.appendTo(document.body).text(this.options.tipText).hide();
        }

        this.$element.attr({
          'title': '',
          'aria-describedby': elemId,
          'data-yeti-box': elemId,
          'data-toggle': elemId,
          'data-resize': elemId
        }).addClass(this.options.triggerClass);

        //helper variables to track movement on collisions
        this.usedPositions = [];
        this.counter = 4;
        this.classChanged = false;

        this._events();
      }

      /**
       * Grabs the current positioning class, if present, and returns the value or an empty string.
       * @private
       */

    }, {
      key: '_getPositionClass',
      value: function _getPositionClass(element) {
        if (!element) {
          return '';
        }
        // var position = element.attr('class').match(/top|left|right/g);
        var position = element[0].className.match(/\b(top|left|right)\b/g);
        position = position ? position[0] : '';
        return position;
      }
    }, {
      key: '_buildTemplate',

      /**
       * builds the tooltip element, adds attributes, and returns the template.
       * @private
       */
      value: function _buildTemplate(id) {
        var templateClasses = (this.options.tooltipClass + ' ' + this.options.positionClass + ' ' + this.options.templateClasses).trim();
        var $template = $('<div></div>').addClass(templateClasses).attr({
          'role': 'tooltip',
          'aria-hidden': true,
          'data-is-active': false,
          'data-is-focus': false,
          'id': id
        });
        return $template;
      }

      /**
       * Function that gets called if a collision event is detected.
       * @param {String} position - positioning class to try
       * @private
       */

    }, {
      key: '_reposition',
      value: function _reposition(position) {
        this.usedPositions.push(position ? position : 'bottom');

        //default, try switching to opposite side
        if (!position && this.usedPositions.indexOf('top') < 0) {
          this.template.addClass('top');
        } else if (position === 'top' && this.usedPositions.indexOf('bottom') < 0) {
          this.template.removeClass(position);
        } else if (position === 'left' && this.usedPositions.indexOf('right') < 0) {
          this.template.removeClass(position).addClass('right');
        } else if (position === 'right' && this.usedPositions.indexOf('left') < 0) {
          this.template.removeClass(position).addClass('left');
        }

        //if default change didn't work, try bottom or left first
        else if (!position && this.usedPositions.indexOf('top') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.template.addClass('left');
          } else if (position === 'top' && this.usedPositions.indexOf('bottom') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.template.removeClass(position).addClass('left');
          } else if (position === 'left' && this.usedPositions.indexOf('right') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.template.removeClass(position);
          } else if (position === 'right' && this.usedPositions.indexOf('left') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.template.removeClass(position);
          }
          //if nothing cleared, set to bottom
          else {
              this.template.removeClass(position);
            }
        this.classChanged = true;
        this.counter--;
      }

      /**
       * sets the position class of an element and recursively calls itself until there are no more possible positions to attempt, or the tooltip element is no longer colliding.
       * if the tooltip is larger than the screen width, default to full width - any user selected margin
       * @private
       */

    }, {
      key: '_setPosition',
      value: function _setPosition() {
        var position = this._getPositionClass(this.template),
            $tipDims = Foundation.Box.GetDimensions(this.template),
            $anchorDims = Foundation.Box.GetDimensions(this.$element),
            direction = position === 'left' ? 'left' : position === 'right' ? 'left' : 'top',
            param = direction === 'top' ? 'height' : 'width',
            offset = param === 'height' ? this.options.vOffset : this.options.hOffset,
            _this = this;

        if ($tipDims.width >= $tipDims.windowDims.width || !this.counter && !Foundation.Box.ImNotTouchingYou(this.template)) {
          this.template.offset(Foundation.Box.GetOffsets(this.template, this.$element, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
            // this.$element.offset(Foundation.GetOffsets(this.template, this.$element, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
            'width': $anchorDims.windowDims.width - this.options.hOffset * 2,
            'height': 'auto'
          });
          return false;
        }

        this.template.offset(Foundation.Box.GetOffsets(this.template, this.$element, 'center ' + (position || 'bottom'), this.options.vOffset, this.options.hOffset));

        while (!Foundation.Box.ImNotTouchingYou(this.template) && this.counter) {
          this._reposition(position);
          this._setPosition();
        }
      }

      /**
       * reveals the tooltip, and fires an event to close any other open tooltips on the page
       * @fires Tooltip#closeme
       * @fires Tooltip#show
       * @function
       */

    }, {
      key: 'show',
      value: function show() {
        if (this.options.showOn !== 'all' && !Foundation.MediaQuery.is(this.options.showOn)) {
          // console.error('The screen is too small to display this tooltip');
          return false;
        }

        var _this = this;
        this.template.css('visibility', 'hidden').show();
        this._setPosition();

        /**
         * Fires to close all other open tooltips on the page
         * @event Closeme#tooltip
         */
        this.$element.trigger('closeme.zf.tooltip', this.template.attr('id'));

        this.template.attr({
          'data-is-active': true,
          'aria-hidden': false
        });
        _this.isActive = true;
        // console.log(this.template);
        this.template.stop().hide().css('visibility', '').fadeIn(this.options.fadeInDuration, function () {
          //maybe do stuff?
        });
        /**
         * Fires when the tooltip is shown
         * @event Tooltip#show
         */
        this.$element.trigger('show.zf.tooltip');
      }

      /**
       * Hides the current tooltip, and resets the positioning class if it was changed due to collision
       * @fires Tooltip#hide
       * @function
       */

    }, {
      key: 'hide',
      value: function hide() {
        // console.log('hiding', this.$element.data('yeti-box'));
        var _this = this;
        this.template.stop().attr({
          'aria-hidden': true,
          'data-is-active': false
        }).fadeOut(this.options.fadeOutDuration, function () {
          _this.isActive = false;
          _this.isClick = false;
          if (_this.classChanged) {
            _this.template.removeClass(_this._getPositionClass(_this.template)).addClass(_this.options.positionClass);

            _this.usedPositions = [];
            _this.counter = 4;
            _this.classChanged = false;
          }
        });
        /**
         * fires when the tooltip is hidden
         * @event Tooltip#hide
         */
        this.$element.trigger('hide.zf.tooltip');
      }

      /**
       * adds event listeners for the tooltip and its anchor
       * TODO combine some of the listeners like focus and mouseenter, etc.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;
        var $template = this.template;
        var isFocus = false;

        if (!this.options.disableHover) {

          this.$element.on('mouseenter.zf.tooltip', function (e) {
            if (!_this.isActive) {
              _this.timeout = setTimeout(function () {
                _this.show();
              }, _this.options.hoverDelay);
            }
          }).on('mouseleave.zf.tooltip', function (e) {
            clearTimeout(_this.timeout);
            if (!isFocus || _this.isClick && !_this.options.clickOpen) {
              _this.hide();
            }
          });
        }

        if (this.options.clickOpen) {
          this.$element.on('mousedown.zf.tooltip', function (e) {
            e.stopImmediatePropagation();
            if (_this.isClick) {
              //_this.hide();
              // _this.isClick = false;
            } else {
              _this.isClick = true;
              if ((_this.options.disableHover || !_this.$element.attr('tabindex')) && !_this.isActive) {
                _this.show();
              }
            }
          });
        } else {
          this.$element.on('mousedown.zf.tooltip', function (e) {
            e.stopImmediatePropagation();
            _this.isClick = true;
          });
        }

        if (!this.options.disableForTouch) {
          this.$element.on('tap.zf.tooltip touchend.zf.tooltip', function (e) {
            _this.isActive ? _this.hide() : _this.show();
          });
        }

        this.$element.on({
          // 'toggle.zf.trigger': this.toggle.bind(this),
          // 'close.zf.trigger': this.hide.bind(this)
          'close.zf.trigger': this.hide.bind(this)
        });

        this.$element.on('focus.zf.tooltip', function (e) {
          isFocus = true;
          if (_this.isClick) {
            // If we're not showing open on clicks, we need to pretend a click-launched focus isn't
            // a real focus, otherwise on hover and come back we get bad behavior
            if (!_this.options.clickOpen) {
              isFocus = false;
            }
            return false;
          } else {
            _this.show();
          }
        }).on('focusout.zf.tooltip', function (e) {
          isFocus = false;
          _this.isClick = false;
          _this.hide();
        }).on('resizeme.zf.trigger', function () {
          if (_this.isActive) {
            _this._setPosition();
          }
        });
      }

      /**
       * adds a toggle method, in addition to the static show() & hide() functions
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        if (this.isActive) {
          this.hide();
        } else {
          this.show();
        }
      }

      /**
       * Destroys an instance of tooltip, removes template element from the view.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.attr('title', this.template.text()).off('.zf.trigger .zf.tooltip').removeClass('has-tip top right left').removeAttr('aria-describedby aria-haspopup data-disable-hover data-resize data-toggle data-tooltip data-yeti-box');

        this.template.remove();

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Tooltip;
  }();

  Tooltip.defaults = {
    disableForTouch: false,
    /**
     * Time, in ms, before a tooltip should open on hover.
     * @option
     * @example 200
     */
    hoverDelay: 200,
    /**
     * Time, in ms, a tooltip should take to fade into view.
     * @option
     * @example 150
     */
    fadeInDuration: 150,
    /**
     * Time, in ms, a tooltip should take to fade out of view.
     * @option
     * @example 150
     */
    fadeOutDuration: 150,
    /**
     * Disables hover events from opening the tooltip if set to true
     * @option
     * @example false
     */
    disableHover: false,
    /**
     * Optional addtional classes to apply to the tooltip template on init.
     * @option
     * @example 'my-cool-tip-class'
     */
    templateClasses: '',
    /**
     * Non-optional class added to tooltip templates. Foundation default is 'tooltip'.
     * @option
     * @example 'tooltip'
     */
    tooltipClass: 'tooltip',
    /**
     * Class applied to the tooltip anchor element.
     * @option
     * @example 'has-tip'
     */
    triggerClass: 'has-tip',
    /**
     * Minimum breakpoint size at which to open the tooltip.
     * @option
     * @example 'small'
     */
    showOn: 'small',
    /**
     * Custom template to be used to generate markup for tooltip.
     * @option
     * @example '&lt;div class="tooltip"&gt;&lt;/div&gt;'
     */
    template: '',
    /**
     * Text displayed in the tooltip template on open.
     * @option
     * @example 'Some cool space fact here.'
     */
    tipText: '',
    touchCloseText: 'Tap to close.',
    /**
     * Allows the tooltip to remain open if triggered with a click or touch event.
     * @option
     * @example true
     */
    clickOpen: true,
    /**
     * Additional positioning classes, set by the JS
     * @option
     * @example 'top'
     */
    positionClass: '',
    /**
     * Distance, in pixels, the template should push away from the anchor on the Y axis.
     * @option
     * @example 10
     */
    vOffset: 10,
    /**
     * Distance, in pixels, the template should push away from the anchor on the X axis, if aligned to a side.
     * @option
     * @example 12
     */
    hOffset: 12,
    /**
    * Allow HTML in tooltip. Warning: If you are loading user-generated content into tooltips,
    * allowing HTML may open yourself up to XSS attacks.
    * @option
    * @example false
    */
    allowHtml: false
  };

  /**
   * TODO utilize resize event trigger
   */

  // Window exports
  Foundation.plugin(Tooltip, 'Tooltip');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * ResponsiveAccordionTabs module.
   * @module foundation.responsiveAccordionTabs
   * @requires foundation.util.keyboard
   * @requires foundation.util.timerAndImageLoader
   * @requires foundation.util.motion
   * @requires foundation.accordion
   * @requires foundation.tabs
   */

  var ResponsiveAccordionTabs = function () {
    /**
     * Creates a new instance of a responsive accordion tabs.
     * @class
     * @fires ResponsiveAccordionTabs#init
     * @param {jQuery} element - jQuery object to make into a dropdown menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function ResponsiveAccordionTabs(element, options) {
      _classCallCheck(this, ResponsiveAccordionTabs);

      this.$element = $(element);
      this.options = $.extend({}, this.$element.data(), options);
      this.rules = this.$element.data('responsive-accordion-tabs');
      this.currentMq = null;
      this.currentPlugin = null;
      if (!this.$element.attr('id')) {
        this.$element.attr('id', Foundation.GetYoDigits(6, 'responsiveaccordiontabs'));
      };

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'ResponsiveAccordionTabs');
    }

    /**
     * Initializes the Menu by parsing the classes from the 'data-responsive-accordion-tabs' attribute on the element.
     * @function
     * @private
     */


    _createClass(ResponsiveAccordionTabs, [{
      key: '_init',
      value: function _init() {
        // The first time an Interchange plugin is initialized, this.rules is converted from a string of "classes" to an object of rules
        if (typeof this.rules === 'string') {
          var rulesTree = {};

          // Parse rules from "classes" pulled from data attribute
          var rules = this.rules.split(' ');

          // Iterate through every rule found
          for (var i = 0; i < rules.length; i++) {
            var rule = rules[i].split('-');
            var ruleSize = rule.length > 1 ? rule[0] : 'small';
            var rulePlugin = rule.length > 1 ? rule[1] : rule[0];

            if (MenuPlugins[rulePlugin] !== null) {
              rulesTree[ruleSize] = MenuPlugins[rulePlugin];
            }
          }

          this.rules = rulesTree;
        }

        this._getAllOptions();

        if (!$.isEmptyObject(this.rules)) {
          this._checkMediaQueries();
        }
      }
    }, {
      key: '_getAllOptions',
      value: function _getAllOptions() {
        //get all defaults and options
        var _this = this;
        _this.allOptions = {};
        for (var key in MenuPlugins) {
          if (MenuPlugins.hasOwnProperty(key)) {
            var obj = MenuPlugins[key];
            try {
              var dummyPlugin = $('<ul></ul>');
              var tmpPlugin = new obj.plugin(dummyPlugin, _this.options);
              for (var keyKey in tmpPlugin.options) {
                if (tmpPlugin.options.hasOwnProperty(keyKey) && keyKey !== 'zfPlugin') {
                  var objObj = tmpPlugin.options[keyKey];
                  _this.allOptions[keyKey] = objObj;
                }
              }
              tmpPlugin.destroy();
            } catch (e) {}
          }
        }
      }

      /**
       * Initializes events for the Menu.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          _this._checkMediaQueries();
        });
      }

      /**
       * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
       * @function
       * @private
       */

    }, {
      key: '_checkMediaQueries',
      value: function _checkMediaQueries() {
        var matchedMq,
            _this = this;
        // Iterate through each rule and find the last matching rule
        $.each(this.rules, function (key) {
          if (Foundation.MediaQuery.atLeast(key)) {
            matchedMq = key;
          }
        });

        // No match? No dice
        if (!matchedMq) return;

        // Plugin already initialized? We good
        if (this.currentPlugin instanceof this.rules[matchedMq].plugin) return;

        // Remove existing plugin-specific CSS classes
        $.each(MenuPlugins, function (key, value) {
          _this.$element.removeClass(value.cssClass);
        });

        // Add the CSS class for the new plugin
        this.$element.addClass(this.rules[matchedMq].cssClass);

        // Create an instance of the new plugin
        if (this.currentPlugin) {
          //don't know why but on nested elements data zfPlugin get's lost
          if (!this.currentPlugin.$element.data('zfPlugin') && this.storezfData) this.currentPlugin.$element.data('zfPlugin', this.storezfData);
          this.currentPlugin.destroy();
        }
        this._handleMarkup(this.rules[matchedMq].cssClass);
        this.currentPlugin = new this.rules[matchedMq].plugin(this.$element, {});
        this.storezfData = this.currentPlugin.$element.data('zfPlugin');
      }
    }, {
      key: '_handleMarkup',
      value: function _handleMarkup(toSet) {
        var _this = this,
            fromString = 'accordion';
        var $panels = $('[data-tabs-content=' + this.$element.attr('id') + ']');
        if ($panels.length) fromString = 'tabs';
        if (fromString === toSet) {
          return;
        };

        var tabsTitle = _this.allOptions.linkClass ? _this.allOptions.linkClass : 'tabs-title';
        var tabsPanel = _this.allOptions.panelClass ? _this.allOptions.panelClass : 'tabs-panel';

        this.$element.removeAttr('role');
        var $liHeads = this.$element.children('.' + tabsTitle + ',[data-accordion-item]').removeClass(tabsTitle).removeClass('accordion-item').removeAttr('data-accordion-item');
        var $liHeadsA = $liHeads.children('a').removeClass('accordion-title');

        if (fromString === 'tabs') {
          $panels = $panels.children('.' + tabsPanel).removeClass(tabsPanel).removeAttr('role').removeAttr('aria-hidden').removeAttr('aria-labelledby');
          $panels.children('a').removeAttr('role').removeAttr('aria-controls').removeAttr('aria-selected');
        } else {
          $panels = $liHeads.children('[data-tab-content]').removeClass('accordion-content');
        };

        $panels.css({ display: '', visibility: '' });
        $liHeads.css({ display: '', visibility: '' });
        if (toSet === 'accordion') {
          $panels.each(function (key, value) {
            $(value).appendTo($liHeads.get(key)).addClass('accordion-content').attr('data-tab-content', '').removeClass('is-active').css({ height: '' });
            $('[data-tabs-content=' + _this.$element.attr('id') + ']').after('<div id="tabs-placeholder-' + _this.$element.attr('id') + '"></div>').remove();
            $liHeads.addClass('accordion-item').attr('data-accordion-item', '');
            $liHeadsA.addClass('accordion-title');
          });
        } else if (toSet === 'tabs') {
          var $tabsContent = $('[data-tabs-content=' + _this.$element.attr('id') + ']');
          var $placeholder = $('#tabs-placeholder-' + _this.$element.attr('id'));
          if ($placeholder.length) {
            $tabsContent = $('<div class="tabs-content"></div>').insertAfter($placeholder).attr('data-tabs-content', _this.$element.attr('id'));
            $placeholder.remove();
          } else {
            $tabsContent = $('<div class="tabs-content"></div>').insertAfter(_this.$element).attr('data-tabs-content', _this.$element.attr('id'));
          };
          $panels.each(function (key, value) {
            var tempValue = $(value).appendTo($tabsContent).addClass(tabsPanel);
            var hash = $liHeadsA.get(key).hash.slice(1);
            var id = $(value).attr('id') || Foundation.GetYoDigits(6, 'accordion');
            if (hash !== id) {
              if (hash !== '') {
                $(value).attr('id', hash);
              } else {
                hash = id;
                $(value).attr('id', hash);
                $($liHeadsA.get(key)).attr('href', $($liHeadsA.get(key)).attr('href').replace('#', '') + '#' + hash);
              };
            };
            var isActive = $($liHeads.get(key)).hasClass('is-active');
            if (isActive) {
              tempValue.addClass('is-active');
            };
          });
          $liHeads.addClass(tabsTitle);
        };
      }

      /**
       * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        if (this.currentPlugin) this.currentPlugin.destroy();
        $(window).off('.zf.ResponsiveAccordionTabs');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return ResponsiveAccordionTabs;
  }();

  ResponsiveAccordionTabs.defaults = {};

  // The plugin matches the plugin classes with these plugin instances.
  var MenuPlugins = {
    tabs: {
      cssClass: 'tabs',
      plugin: Foundation._plugins.tabs || null
    },
    accordion: {
      cssClass: 'accordion',
      plugin: Foundation._plugins.accordion || null
    }
  };

  // Window exports
  Foundation.plugin(ResponsiveAccordionTabs, 'ResponsiveAccordionTabs');
}(jQuery);
"use strict";

$(document).foundation();
'use strict';

/* ****************************************
Business
**************************************** */

/***** Case Studies: START *****/

// Define additional functions for tabbedContent
function caseStudies() {
    // Change case title
    $('.title-container .title h5').text($('.task-types .nav[data-active]').text());
    if ($(window).outerWidth() < 1024) {
        $('.task-types .caret').css({
            'top': 'auto',
            'bottom': '-5px',
            'right': 'auto'
        });
        var leftVal = $('.task-types .nav[data-active]').attr('data-id') * 25 - 12.5;
        $('.task-types .caret').css('left', leftVal + '%');
    } else {
        $('.task-types .caret').css({
            'bottom': 'auto',
            'left': 'auto',
            'right': '0'
        });
        $('.task-types .caret').css('top', $('.task-types .nav[data-active]').position().top);
    };
    $('.graphic-container .graphic').removeAttr('data-active').hide();
    $('.graphic-container .graphic' + ':nth-child(' + $('.nav[data-active]').attr('data-id') + ')').fadeIn(300).attr('data-active', '');
}

/***** Case Studies: END *****/

/***** Project Flow: START *****/

function projectFlow() {
    // Graphic slider
    $(".pf-graphic-container").slick({
        slide: '.pf-graphic',
        dots: false,
        appendDots: '.dots-container.pf-dots',
        arrows: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '.pf-desc-container',
        prevArrow: '<svg id="prev-arrow"><use xlink:href="#icon-angle-left" /></svg>',
        nextArrow: '<svg id="next-arrow"><use xlink:href="#icon-angle-right" /></svg>',
        responsive: [{
            breakpoint: 640,
            settings: {
                arrows: false,
                dots: true
            }
        }]
    });

    // Description change
    $(".pf-desc-container").slick({
        slide: '.description',
        dots: false,
        arrows: false,
        infinite: true,
        draggable: false,
        swipe: false,
        fade: true,
        speed: 300,
        cssEase: 'linear',
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '.pf-graphic-container'
    });

    // Timeline
    var flowWidth = [3.574, 15.933, 40.082, 51.838, 63.895, 75.802, 100];
    var fill = $('.pf-timeline .fill img');

    $(".pf-graphic-container").on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        fill.css('-webkit-clip-path', 'polygon(0% 0%, ' + flowWidth[nextSlide] + '% 0%, ' + flowWidth[nextSlide] + '% 100%, 0% 100%)');
    });
    // // Event handler for mobile
    $('.pf-graphic-container').on('afterChange', function (event, slick, currentSlide) {
        fill.css('-webkit-clip-path', 'polygon(0% 0%, ' + flowWidth[currentSlide] + '% 0%, ' + flowWidth[currentSlide] + '% 100%, 0% 100%)');
    });
}

/***** Project Flow: END *****/

/***** Initialize on Load: START *****/

$(function () {
    if ($('body').is('.business-page')) {
        // Case studies tabbed content & autoplay
        tabbedContent('.nav', '.case', caseStudies);
        // Project flow slick slider
        projectFlow();
        // Testimonial
        testimonial();
    }
});

/***** Initialize on Load: END *****/
"use strict";
'use strict';

/* ****************************************
Index
**************************************** */

/***** Before & After: START  *****/

function drags(dragElement, resizeElement, container) {
    // Initialize the dragging event on mousedown.
    dragElement.on('mousedown touchstart', function (e) {
        dragElement.addClass('ba-draggable');
        resizeElement.addClass('ba-resizable');

        // Check if it's a mouse or touch event and pass along the correct value
        var startX = e.pageX ? e.pageX : e.originalEvent.touches[0].pageX;

        // Get the initial position
        var dragWidth = dragElement.outerWidth(),
            posX = dragElement.offset().left + dragWidth - startX,
            containerOffset = container.offset().left,
            containerWidth = container.outerWidth();

        // Set limits
        minLeft = $('.ba-limit').offset().left - 10;
        maxLeft = $('.ba-limit').offset().left + $('.ba-limit').outerWidth() + 10;

        // Calculate the dragging distance on mousemove.
        dragElement.parents().on("mousemove touchmove", function (e) {

            // Check if it's a mouse or touch event and pass along the correct value
            var moveX = e.pageX ? e.pageX : e.originalEvent.touches[0].pageX;
            leftValue = moveX + posX - dragWidth;

            // Prevent going off limits
            if (leftValue < minLeft) {
                leftValue = minLeft;
            } else if (leftValue > maxLeft) {
                leftValue = maxLeft;
            }

            // Translate the handle's left value to masked divs width.
            widthValue = (leftValue + dragWidth / 2 - containerOffset) * 100 / containerWidth + '%';

            // Set the new values for the slider and the handle.
            // Bind mouseup events to stop dragging.
            $('.ba-draggable').css('left', widthValue).on('mouseup touchend touchcancel', function () {
                $(this).removeClass('ba-draggable');
                resizeElement.removeClass('.ba-resizable');
            });
            $('.ba-resizable').css('width', widthValue);

            // Toggle switch on minLeft & maxLeft
            if ($('.ba-draggable').offset().left <= $('.ba-limit').offset().left - 10) {
                $('.switch-base').removeClass('switch-on');
            } else if ($('.ba-draggable').offset().left >= $('.ba-limit').offset().left + $('.ba-limit').outerWidth()) {
                $('.switch-base').addClass('switch-on');
            }
        }).on('mouseup touchend touchcancel', function () {
            dragElement.removeClass('ba-draggable');
            resizeElement.removeClass('ba-resizable');
        });
        e.preventDefault();
    }).on('mouseup touchend touchcancel', function (e) {
        dragElement.removeClass('ba-draggable');
        resizeElement.removeClass('ba-resizable');
    });
}

/* Switch */
$('.switch-base').on('mousedown tap', function (e) {
    var baOffset = $('.ba-limit').offset().left;
    var handleLeft = $('.handle').offset().left - $('.handle').position().left;
    var minLeft = baOffset - 15 - handleLeft;
    var maxLeft = baOffset + $('.ba-limit').width() + 15 - handleLeft;

    $('.switch-base').toggleClass('switch-on');

    if ($('.switch-base').hasClass('switch-on')) {
        $('.handle').animate({
            left: maxLeft
        });
        $('.resize').animate({
            width: maxLeft + 'px'
        });
    } else {
        $('.handle').animate({
            left: minLeft
        });
        $('.resize').animate({
            width: minLeft + 'px'
        });
    }
});

// Define plugin
$.fn.beforeAfter = function () {
    var cur = this;

    // Adjust the slider
    var width = cur.width() + 'px';
    cur.find('.resize img').css('width', width);

    // Bind dragging events
    drags(cur.find('.handle'), cur.find('.resize'), cur);

    // Update sliders on resize.
    $(window).resize(function () {
        var width = cur.width() + 'px';
        cur.find('.resize img').css('width', width);
    });
};

/***** Before & After: END  *****/

/***** Expertise: START *****/

// Make as global function
function tabbedContent(navElement, contentElement, customFunc) {
    // Define on dataChange functions
    function dataChange() {
        // Change expertise content
        $(contentElement).removeAttr('data-active').hide();
        $(contentElement + ':nth-child(' + $(navElement + '[data-active]').attr('data-id') + ')').fadeIn(300).attr('data-active', '');
        if (customFunc) {
            customFunc();
        }
    }

    /* Button */
    $(navElement).on('mousedown tap', function (e) {
        autoplayStop();
        $(navElement).removeAttr('data-active');
        $(this).attr('data-active', '');
        dataChange();
    });

    /* Autoplay */
    // Set up interval
    var autoplay;

    function autoplayStop() {
        clearInterval(autoplay);
    }

    function autoplayStart() {
        autoplay = setInterval(function () {
            autoplayFunc();
        }, 6000);
    }

    // Set up autoplay function
    function autoplayFunc() {
        var nextID = $(navElement + '[data-active]').index() + 2;
        $(navElement).removeAttr('data-active');
        // If exceeds length, loop back to 1
        if (nextID > $(navElement).length) {
            $(navElement + '[data-id="1"]').attr('data-active', '');
        } else {
            $(navElement + '[data-id="' + nextID + '"]').attr('data-active', '');
        }
        dataChange();
    }
    autoplayStart();
}

/***** Expertise: END *****/

/***** Testimonial: START  *****/

function testimonial() {
    $(".testimonial-container").slick({
        slide: '.testimonial',
        dots: false,
        appendDots: '.dots-container.testimonial-dots',
        arrows: true,
        infinite: true,
        slidesToShow: 2,
        slidesToScroll: 1,
        prevArrow: '<svg id="prev-arrow"><use xlink:href="#icon-angle-left" /></svg>',
        nextArrow: '<svg id="next-arrow"><use xlink:href="#icon-angle-right" /></svg>',
        responsive: [{
            breakpoint: 800,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                arrows: false,
                dots: true
            }
        }]
    });
}

/***** Testimonial: END  *****/

/***** Equalize Height Function: START  *****/

function equalizeHeight(elementName) {
    function resizeHeight() {
        var heights = $(elementName).map(function () {
            return $(this).height();
        }).get(),
            maxHeight = Math.max.apply(null, heights);
        $(elementName).height(maxHeight);
    }
}

/***** Equalize Height Function: END  *****/

/***** Initialize on Load: START *****/

$(function () {
    if ($('body').is('.index-page')) {
        // Before & After
        $('.ba-slider').beforeAfter();
        // Tabbed content & autoplay
        tabbedContent('.expertise-nav', '.content');
        // Testimonial slider
        testimonial();
    }
});

/***** Initialize on Load: END *****/
'use strict';

/* ****************************************
SupaAgent
**************************************** */

/***** Scroll Trigger: START *****/

function scrollTrigger(sectionClass, addHeight, customFunc) {
    var triggered = false;
    $(window).scroll(function () {
        var hT = $(sectionClass).offset().top + addHeight,
            wS = $(this).scrollTop();
        if (wS > hT && !triggered) {
            customFunc();
            triggered = true;
        }
    });
}

/***** Scroll Trigger: END *****/

/***** Demography Slider: START *****/

function demographySlider() {
    $(".scene-background").slick({
        slide: '.scene-bg',
        dots: false,
        arrows: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: '<svg id="prev-arrow"><use xlink:href="#icon-angle-left" /></svg>',
        nextArrow: '<svg id="next-arrow"><use xlink:href="#icon-angle-right" /></svg>',
        asNavFor: '.scene-foreground',
        responsive: [{
            breakpoint: 640,
            settings: {
                arrows: false,
                dots: true,
                appendDots: '.dots-container.demography-dots'
            }
        }]
    });

    $(".scene-foreground").slick({
        slide: '.scene-fg',
        dots: false,
        arrows: false,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: '<svg id="prev-arrow"><use xlink:href="#icon-angle-left" /></svg>',
        nextArrow: '<svg id="next-arrow"><use xlink:href="#icon-angle-right" /></svg>',
        asNavFor: '.scene-background'
    });
}

/***** Demography Slider: END *****/

/***** ScrollNav: START *****/

function scrollNav() {
    var sections = [['.header-section', 0], ['.benefits-section', 5], ['.role-section', 100], ['.tasks-section', 5], ['.demography-section', 0], ['.cta-section', 50]];

    $('.scrollnav-button').on('mousedown tap', function (e) {
        var currIndex = $(this).index();
        $('.scrollnav-button').removeAttr('data-active');
        $(this).attr('data-active', '');
        $('html, body').animate({
            scrollTop: $(sections[currIndex][0]).offset().top + sections[currIndex][1]
        }, 500);
    });
}

/***** ScrollNav: END *****/

/***** Initialize on Load: START *****/

$(function () {
    if ($('body').is('.supaagent-page')) {

        // Reset scroll position when page is reloaded
        $(window).on('beforeunload', function () {
            $(window).scrollTop(0);
        });

        // Header-to-Benefit Trigger
        // If screen is large up
        if ($('.show-for-large').is(':visible')) {
            scrollTrigger('.benefits-section', null, function () {
                $('#sa-female1-frame').css('position', 'absolute').prependTo('.benefits-section');
                $('#sa-female1-before').fadeOut(500);
                $('#sa-female1-after').fadeIn(500);
                $('#sa-male').fadeIn(500);
            });
        }
        // If screen is medium down
        else {
                scrollTrigger('.benefits-section', 320, function () {
                    $('#sa-female1-frame').css('position', 'absolute').css('bottom', '75px').prependTo('.benefits-section');
                    $('#sa-female1-before').fadeOut(500);
                    $('#sa-female1-after').fadeIn(500);
                    $('#sa-male').fadeIn(500);
                });
            }

        // Role-to-Tasks Trigger
        // If screen is large up
        if ($('.show-for-large').is(':visible')) {
            scrollTrigger('.tasks-section', null, function () {
                $('#sa-male-frame').fadeOut(500);
                $('#new-accesscard').css('display', 'flex').hide().fadeIn(500, function () {
                    $(this).animate({
                        top: '0'
                    }, 500);
                    $('#new-accesscard .button.secondary').fadeIn(500);
                });
            });
        }
        // If screen is medium down
        else {
                scrollTrigger('.tasks-section', -150, function () {
                    $('#sa-male-frame').fadeOut(500);
                    $('#new-accesscard').css('display', 'flex').hide().fadeIn(500, function () {
                        $(this).animate({
                            top: '0'
                        }, 500);
                        $('#new-accesscard .button.secondary').fadeIn(500);
                    });
                });
            }

        // Demography Trigger
        // If screen is large up
        if ($('.show-for-large').is(':visible')) {
            scrollTrigger('.demography-section', 60, function () {
                $('#sa-female2-frame').css('position', 'fixed').appendTo('.avatar-container');
            });
        }
        // If screen is medium down
        else {
                scrollTrigger('.demography-section', -150, function () {
                    $('#sa-female2-frame').css('position', 'fixed').appendTo('.avatar-container');
                });
            }

        // CTA Avatar
        // If screen is large up
        if ($('.show-for-large').is(':visible')) {
            scrollTrigger('.cta-section', 40, function () {
                $('#sa-female2-frame').css('position', 'absolute').css('margin-top', '40px').prependTo('.cta-section');
                $('#sa-female2-before').fadeOut(500);
                $('#sa-female2-after').fadeIn(500);
            });
        }
        // If screen is medium down
        else {
                scrollTrigger('.cta-section', -190, function () {
                    $('#sa-female2-frame').css('position', 'absolute').css('margin-top', '40px').prependTo('.cta-section');
                    $('#sa-female2-before').fadeOut(500);
                    $('#sa-female2-after').fadeIn(500);
                });
            }

        // Demography Slider
        demographySlider();

        // ScrollNav
        scrollNav();
    }
});

/***** Initialize on Load: END *****/
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsImZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24uYWJpZGUuanMiLCJmb3VuZGF0aW9uLmFjY29yZGlvbi5qcyIsImZvdW5kYXRpb24uYWNjb3JkaW9uTWVudS5qcyIsImZvdW5kYXRpb24uZHJpbGxkb3duLmpzIiwiZm91bmRhdGlvbi5kcm9wZG93bi5qcyIsImZvdW5kYXRpb24uZHJvcGRvd25NZW51LmpzIiwiZm91bmRhdGlvbi5vZmZjYW52YXMuanMiLCJmb3VuZGF0aW9uLnJlc3BvbnNpdmVNZW51LmpzIiwiZm91bmRhdGlvbi5yZXNwb25zaXZlVG9nZ2xlLmpzIiwiZm91bmRhdGlvbi5zbGlkZXIuanMiLCJmb3VuZGF0aW9uLnN0aWNreS5qcyIsImZvdW5kYXRpb24udGFicy5qcyIsImZvdW5kYXRpb24udG9nZ2xlci5qcyIsImZvdW5kYXRpb24udG9vbHRpcC5qcyIsImZvdW5kYXRpb24uemYucmVzcG9uc2l2ZUFjY29yZGlvblRhYnMuanMiLCJtYWluLmpzIiwiYnVzaW5lc3MuanMiLCJmYXEuanMiLCJpbmRleC5qcyIsInN1cGFhZ2VudC5qcyJdLCJuYW1lcyI6WyIkIiwiRk9VTkRBVElPTl9WRVJTSU9OIiwiRm91bmRhdGlvbiIsInZlcnNpb24iLCJfcGx1Z2lucyIsIl91dWlkcyIsInJ0bCIsImF0dHIiLCJwbHVnaW4iLCJuYW1lIiwiY2xhc3NOYW1lIiwiZnVuY3Rpb25OYW1lIiwiYXR0ck5hbWUiLCJoeXBoZW5hdGUiLCJyZWdpc3RlclBsdWdpbiIsInBsdWdpbk5hbWUiLCJjb25zdHJ1Y3RvciIsInRvTG93ZXJDYXNlIiwidXVpZCIsIkdldFlvRGlnaXRzIiwiJGVsZW1lbnQiLCJkYXRhIiwidHJpZ2dlciIsInB1c2giLCJ1bnJlZ2lzdGVyUGx1Z2luIiwic3BsaWNlIiwiaW5kZXhPZiIsInJlbW92ZUF0dHIiLCJyZW1vdmVEYXRhIiwicHJvcCIsInJlSW5pdCIsInBsdWdpbnMiLCJpc0pRIiwiZWFjaCIsIl9pbml0IiwidHlwZSIsIl90aGlzIiwiZm5zIiwicGxncyIsImZvckVhY2giLCJwIiwiZm91bmRhdGlvbiIsIk9iamVjdCIsImtleXMiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJsZW5ndGgiLCJuYW1lc3BhY2UiLCJNYXRoIiwicm91bmQiLCJwb3ciLCJyYW5kb20iLCJ0b1N0cmluZyIsInNsaWNlIiwicmVmbG93IiwiZWxlbSIsImkiLCIkZWxlbSIsImZpbmQiLCJhZGRCYWNrIiwiJGVsIiwib3B0cyIsIndhcm4iLCJ0aGluZyIsInNwbGl0IiwiZSIsIm9wdCIsIm1hcCIsImVsIiwidHJpbSIsInBhcnNlVmFsdWUiLCJlciIsImdldEZuTmFtZSIsInRyYW5zaXRpb25lbmQiLCJ0cmFuc2l0aW9ucyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImVuZCIsInQiLCJzdHlsZSIsInNldFRpbWVvdXQiLCJ0cmlnZ2VySGFuZGxlciIsInV0aWwiLCJ0aHJvdHRsZSIsImZ1bmMiLCJkZWxheSIsInRpbWVyIiwiY29udGV4dCIsImFyZ3MiLCJhcmd1bWVudHMiLCJhcHBseSIsIm1ldGhvZCIsIiRtZXRhIiwiJG5vSlMiLCJhcHBlbmRUbyIsImhlYWQiLCJyZW1vdmVDbGFzcyIsIk1lZGlhUXVlcnkiLCJBcnJheSIsInByb3RvdHlwZSIsImNhbGwiLCJwbHVnQ2xhc3MiLCJ1bmRlZmluZWQiLCJSZWZlcmVuY2VFcnJvciIsIlR5cGVFcnJvciIsIndpbmRvdyIsImZuIiwiRGF0ZSIsIm5vdyIsImdldFRpbWUiLCJ2ZW5kb3JzIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwidnAiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsInRlc3QiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJsYXN0VGltZSIsImNhbGxiYWNrIiwibmV4dFRpbWUiLCJtYXgiLCJjbGVhclRpbWVvdXQiLCJwZXJmb3JtYW5jZSIsInN0YXJ0IiwiRnVuY3Rpb24iLCJiaW5kIiwib1RoaXMiLCJhQXJncyIsImZUb0JpbmQiLCJmTk9QIiwiZkJvdW5kIiwiY29uY2F0IiwiZnVuY05hbWVSZWdleCIsInJlc3VsdHMiLCJleGVjIiwic3RyIiwiaXNOYU4iLCJwYXJzZUZsb2F0IiwicmVwbGFjZSIsImpRdWVyeSIsIkJveCIsIkltTm90VG91Y2hpbmdZb3UiLCJHZXREaW1lbnNpb25zIiwiR2V0T2Zmc2V0cyIsImVsZW1lbnQiLCJwYXJlbnQiLCJsck9ubHkiLCJ0Yk9ubHkiLCJlbGVEaW1zIiwidG9wIiwiYm90dG9tIiwibGVmdCIsInJpZ2h0IiwicGFyRGltcyIsIm9mZnNldCIsImhlaWdodCIsIndpZHRoIiwid2luZG93RGltcyIsImFsbERpcnMiLCJFcnJvciIsInJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJwYXJSZWN0IiwicGFyZW50Tm9kZSIsIndpblJlY3QiLCJib2R5Iiwid2luWSIsInBhZ2VZT2Zmc2V0Iiwid2luWCIsInBhZ2VYT2Zmc2V0IiwicGFyZW50RGltcyIsImFuY2hvciIsInBvc2l0aW9uIiwidk9mZnNldCIsImhPZmZzZXQiLCJpc092ZXJmbG93IiwiJGVsZURpbXMiLCIkYW5jaG9yRGltcyIsImtleUNvZGVzIiwiY29tbWFuZHMiLCJLZXlib2FyZCIsImdldEtleUNvZGVzIiwicGFyc2VLZXkiLCJldmVudCIsImtleSIsIndoaWNoIiwia2V5Q29kZSIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsInRvVXBwZXJDYXNlIiwic2hpZnRLZXkiLCJjdHJsS2V5IiwiYWx0S2V5IiwiaGFuZGxlS2V5IiwiY29tcG9uZW50IiwiZnVuY3Rpb25zIiwiY29tbWFuZExpc3QiLCJjbWRzIiwiY29tbWFuZCIsImx0ciIsImV4dGVuZCIsInJldHVyblZhbHVlIiwiaGFuZGxlZCIsInVuaGFuZGxlZCIsImZpbmRGb2N1c2FibGUiLCJmaWx0ZXIiLCJpcyIsInJlZ2lzdGVyIiwiY29tcG9uZW50TmFtZSIsInRyYXBGb2N1cyIsIiRmb2N1c2FibGUiLCIkZmlyc3RGb2N1c2FibGUiLCJlcSIsIiRsYXN0Rm9jdXNhYmxlIiwib24iLCJ0YXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsImZvY3VzIiwicmVsZWFzZUZvY3VzIiwib2ZmIiwia2NzIiwiayIsImtjIiwiZGVmYXVsdFF1ZXJpZXMiLCJsYW5kc2NhcGUiLCJwb3J0cmFpdCIsInJldGluYSIsInF1ZXJpZXMiLCJjdXJyZW50Iiwic2VsZiIsImV4dHJhY3RlZFN0eWxlcyIsImNzcyIsIm5hbWVkUXVlcmllcyIsInBhcnNlU3R5bGVUb09iamVjdCIsImhhc093blByb3BlcnR5IiwidmFsdWUiLCJfZ2V0Q3VycmVudFNpemUiLCJfd2F0Y2hlciIsImF0TGVhc3QiLCJzaXplIiwicXVlcnkiLCJnZXQiLCJtYXRjaE1lZGlhIiwibWF0Y2hlcyIsIm1hdGNoZWQiLCJuZXdTaXplIiwiY3VycmVudFNpemUiLCJzdHlsZU1lZGlhIiwibWVkaWEiLCJzY3JpcHQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImluZm8iLCJpZCIsImluc2VydEJlZm9yZSIsImdldENvbXB1dGVkU3R5bGUiLCJjdXJyZW50U3R5bGUiLCJtYXRjaE1lZGl1bSIsInRleHQiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsInRleHRDb250ZW50Iiwic3R5bGVPYmplY3QiLCJyZWR1Y2UiLCJyZXQiLCJwYXJhbSIsInBhcnRzIiwidmFsIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiaXNBcnJheSIsImluaXRDbGFzc2VzIiwiYWN0aXZlQ2xhc3NlcyIsIk1vdGlvbiIsImFuaW1hdGVJbiIsImFuaW1hdGlvbiIsImNiIiwiYW5pbWF0ZSIsImFuaW1hdGVPdXQiLCJNb3ZlIiwiZHVyYXRpb24iLCJhbmltIiwicHJvZyIsIm1vdmUiLCJ0cyIsImlzSW4iLCJpbml0Q2xhc3MiLCJhY3RpdmVDbGFzcyIsInJlc2V0IiwiYWRkQ2xhc3MiLCJzaG93Iiwib2Zmc2V0V2lkdGgiLCJvbmUiLCJmaW5pc2giLCJoaWRlIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiTmVzdCIsIkZlYXRoZXIiLCJtZW51IiwiaXRlbXMiLCJzdWJNZW51Q2xhc3MiLCJzdWJJdGVtQ2xhc3MiLCJoYXNTdWJDbGFzcyIsIiRpdGVtIiwiJHN1YiIsImNoaWxkcmVuIiwiQnVybiIsIlRpbWVyIiwib3B0aW9ucyIsIm5hbWVTcGFjZSIsInJlbWFpbiIsImlzUGF1c2VkIiwicmVzdGFydCIsImluZmluaXRlIiwicGF1c2UiLCJvbkltYWdlc0xvYWRlZCIsImltYWdlcyIsInVubG9hZGVkIiwiY29tcGxldGUiLCJyZWFkeVN0YXRlIiwic2luZ2xlSW1hZ2VMb2FkZWQiLCJzcmMiLCJzcG90U3dpcGUiLCJlbmFibGVkIiwiZG9jdW1lbnRFbGVtZW50IiwibW92ZVRocmVzaG9sZCIsInRpbWVUaHJlc2hvbGQiLCJzdGFydFBvc1giLCJzdGFydFBvc1kiLCJzdGFydFRpbWUiLCJlbGFwc2VkVGltZSIsImlzTW92aW5nIiwib25Ub3VjaEVuZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvblRvdWNoTW92ZSIsIngiLCJ0b3VjaGVzIiwicGFnZVgiLCJ5IiwicGFnZVkiLCJkeCIsImR5IiwiZGlyIiwiYWJzIiwib25Ub3VjaFN0YXJ0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImluaXQiLCJ0ZWFyZG93biIsInNwZWNpYWwiLCJzd2lwZSIsInNldHVwIiwibm9vcCIsImFkZFRvdWNoIiwiaGFuZGxlVG91Y2giLCJjaGFuZ2VkVG91Y2hlcyIsImZpcnN0IiwiZXZlbnRUeXBlcyIsInRvdWNoc3RhcnQiLCJ0b3VjaG1vdmUiLCJ0b3VjaGVuZCIsInNpbXVsYXRlZEV2ZW50IiwiTW91c2VFdmVudCIsInNjcmVlblgiLCJzY3JlZW5ZIiwiY2xpZW50WCIsImNsaWVudFkiLCJjcmVhdGVFdmVudCIsImluaXRNb3VzZUV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJwcmVmaXhlcyIsInRyaWdnZXJzIiwic3RvcFByb3BhZ2F0aW9uIiwiZmFkZU91dCIsImNoZWNrTGlzdGVuZXJzIiwiZXZlbnRzTGlzdGVuZXIiLCJyZXNpemVMaXN0ZW5lciIsInNjcm9sbExpc3RlbmVyIiwibXV0YXRlTGlzdGVuZXIiLCJjbG9zZW1lTGlzdGVuZXIiLCJ5ZXRpQm94ZXMiLCJwbHVnTmFtZXMiLCJsaXN0ZW5lcnMiLCJqb2luIiwicGx1Z2luSWQiLCJub3QiLCJkZWJvdW5jZSIsIiRub2RlcyIsIm5vZGVzIiwicXVlcnlTZWxlY3RvckFsbCIsImxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24iLCJtdXRhdGlvblJlY29yZHNMaXN0IiwiJHRhcmdldCIsImF0dHJpYnV0ZU5hbWUiLCJjbG9zZXN0IiwiZWxlbWVudE9ic2VydmVyIiwib2JzZXJ2ZSIsImF0dHJpYnV0ZXMiLCJjaGlsZExpc3QiLCJjaGFyYWN0ZXJEYXRhIiwic3VidHJlZSIsImF0dHJpYnV0ZUZpbHRlciIsIklIZWFyWW91IiwiQWJpZGUiLCJkZWZhdWx0cyIsIiRpbnB1dHMiLCJfZXZlbnRzIiwicmVzZXRGb3JtIiwidmFsaWRhdGVGb3JtIiwidmFsaWRhdGVPbiIsInZhbGlkYXRlSW5wdXQiLCJsaXZlVmFsaWRhdGUiLCJ2YWxpZGF0ZU9uQmx1ciIsImlzR29vZCIsImNoZWNrZWQiLCIkZXJyb3IiLCJzaWJsaW5ncyIsImZvcm1FcnJvclNlbGVjdG9yIiwiJGxhYmVsIiwiJGVscyIsImxhYmVscyIsImZpbmRMYWJlbCIsIiRmb3JtRXJyb3IiLCJmaW5kRm9ybUVycm9yIiwibGFiZWxFcnJvckNsYXNzIiwiZm9ybUVycm9yQ2xhc3MiLCJpbnB1dEVycm9yQ2xhc3MiLCJncm91cE5hbWUiLCIkbGFiZWxzIiwiZmluZFJhZGlvTGFiZWxzIiwiJGZvcm1FcnJvcnMiLCJyZW1vdmVSYWRpb0Vycm9yQ2xhc3NlcyIsImNsZWFyUmVxdWlyZSIsInJlcXVpcmVkQ2hlY2siLCJ2YWxpZGF0ZWQiLCJjdXN0b21WYWxpZGF0b3IiLCJ2YWxpZGF0b3IiLCJlcXVhbFRvIiwidmFsaWRhdGVSYWRpbyIsInZhbGlkYXRlVGV4dCIsIm1hdGNoVmFsaWRhdGlvbiIsInZhbGlkYXRvcnMiLCJnb29kVG9HbyIsIm1lc3NhZ2UiLCJkZXBlbmRlbnRFbGVtZW50cyIsImFjYyIsIm5vRXJyb3IiLCJwYXR0ZXJuIiwiaW5wdXRUZXh0IiwidmFsaWQiLCJwYXR0ZXJucyIsIlJlZ0V4cCIsIiRncm91cCIsInJlcXVpcmVkIiwiY2xlYXIiLCJ2IiwiJGZvcm0iLCJyZW1vdmVFcnJvckNsYXNzZXMiLCJhbHBoYSIsImFscGhhX251bWVyaWMiLCJpbnRlZ2VyIiwibnVtYmVyIiwiY2FyZCIsImN2diIsImVtYWlsIiwidXJsIiwiZG9tYWluIiwiZGF0ZXRpbWUiLCJkYXRlIiwidGltZSIsImRhdGVJU08iLCJtb250aF9kYXlfeWVhciIsImRheV9tb250aF95ZWFyIiwiY29sb3IiLCJBY2NvcmRpb24iLCIkdGFicyIsImlkeCIsIiRjb250ZW50IiwibGlua0lkIiwiJGluaXRBY3RpdmUiLCJkb3duIiwiJHRhYkNvbnRlbnQiLCJ0b2dnbGUiLCJuZXh0IiwiJGEiLCJtdWx0aUV4cGFuZCIsInByZXZpb3VzIiwicHJldiIsImhhc0NsYXNzIiwidXAiLCJmaXJzdFRpbWUiLCIkY3VycmVudEFjdGl2ZSIsInNsaWRlRG93biIsInNsaWRlU3BlZWQiLCIkYXVudHMiLCJhbGxvd0FsbENsb3NlZCIsInNsaWRlVXAiLCJzdG9wIiwiQWNjb3JkaW9uTWVudSIsIm11bHRpT3BlbiIsIiRtZW51TGlua3MiLCJzdWJJZCIsImlzQWN0aXZlIiwiaW5pdFBhbmVzIiwiJHN1Ym1lbnUiLCIkZWxlbWVudHMiLCIkcHJldkVsZW1lbnQiLCIkbmV4dEVsZW1lbnQiLCJtaW4iLCJwYXJlbnRzIiwib3BlbiIsImNsb3NlIiwiY2xvc2VBbGwiLCJoaWRlQWxsIiwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIiwicGFyZW50c1VudGlsIiwiYWRkIiwiJG1lbnVzIiwiRHJpbGxkb3duIiwiJHN1Ym1lbnVBbmNob3JzIiwiJHN1Ym1lbnVzIiwiJG1lbnVJdGVtcyIsIl9wcmVwYXJlTWVudSIsIl9yZWdpc3RlckV2ZW50cyIsIl9rZXlib2FyZEV2ZW50cyIsIiRsaW5rIiwicGFyZW50TGluayIsImNsb25lIiwicHJlcGVuZFRvIiwid3JhcCIsIiRtZW51IiwiJGJhY2siLCJiYWNrQnV0dG9uUG9zaXRpb24iLCJhcHBlbmQiLCJiYWNrQnV0dG9uIiwicHJlcGVuZCIsIl9iYWNrIiwiYXV0b0hlaWdodCIsIiR3cmFwcGVyIiwid3JhcHBlciIsImFuaW1hdGVIZWlnaHQiLCJfZ2V0TWF4RGltcyIsIl9zaG93IiwiY2xvc2VPbkNsaWNrIiwiJGJvZHkiLCJjb250YWlucyIsIl9oaWRlQWxsIiwiX3Jlc2l6ZSIsInNjcm9sbFRvcCIsIl9iaW5kSGFuZGxlciIsIl9zY3JvbGxUb3AiLCIkc2Nyb2xsVG9wRWxlbWVudCIsInNjcm9sbFRvcEVsZW1lbnQiLCJzY3JvbGxQb3MiLCJwYXJzZUludCIsInNjcm9sbFRvcE9mZnNldCIsImFuaW1hdGlvbkR1cmF0aW9uIiwiYW5pbWF0aW9uRWFzaW5nIiwiX2hpZGUiLCJwYXJlbnRTdWJNZW51IiwiYmx1ciIsIm1heEhlaWdodCIsInJlc3VsdCIsIm51bU9mRWxlbXMiLCJ1bndyYXAiLCJyZW1vdmUiLCJEcm9wZG93biIsIiRpZCIsIiRhbmNob3IiLCJwYXJlbnRDbGFzcyIsIiRwYXJlbnQiLCJwb3NpdGlvbkNsYXNzIiwiZ2V0UG9zaXRpb25DbGFzcyIsImNvdW50ZXIiLCJ1c2VkUG9zaXRpb25zIiwidmVydGljYWxQb3NpdGlvbiIsIm1hdGNoIiwiaG9yaXpvbnRhbFBvc2l0aW9uIiwiY2xhc3NDaGFuZ2VkIiwiZGlyZWN0aW9uIiwibmV3V2lkdGgiLCJwYXJlbnRIT2Zmc2V0IiwiJHBhcmVudERpbXMiLCJfcmVwb3NpdGlvbiIsIl9zZXRQb3NpdGlvbiIsImhvdmVyIiwiYm9keURhdGEiLCJ3aGF0aW5wdXQiLCJ0aW1lb3V0IiwiaG92ZXJEZWxheSIsImhvdmVyUGFuZSIsInZpc2libGVGb2N1c2FibGVFbGVtZW50cyIsImF1dG9Gb2N1cyIsIl9hZGRCb2R5SGFuZGxlciIsImN1clBvc2l0aW9uQ2xhc3MiLCJEcm9wZG93bk1lbnUiLCJzdWJzIiwidmVydGljYWxDbGFzcyIsInJpZ2h0Q2xhc3MiLCJhbGlnbm1lbnQiLCJjaGFuZ2VkIiwiaGFzVG91Y2giLCJvbnRvdWNoc3RhcnQiLCJwYXJDbGFzcyIsImhhbmRsZUNsaWNrRm4iLCJoYXNTdWIiLCJoYXNDbGlja2VkIiwiY2xpY2tPcGVuIiwiZm9yY2VGb2xsb3ciLCJjbG9zZU9uQ2xpY2tJbnNpZGUiLCJkaXNhYmxlSG92ZXIiLCJhdXRvY2xvc2UiLCJjbG9zaW5nVGltZSIsImlzVGFiIiwiaW5kZXgiLCJuZXh0U2libGluZyIsInByZXZTaWJsaW5nIiwib3BlblN1YiIsImNsb3NlU3ViIiwiX2lzVmVydGljYWwiLCIkc2licyIsIm9sZENsYXNzIiwiJHBhcmVudExpIiwiJHRvQ2xvc2UiLCJzb21ldGhpbmdUb0Nsb3NlIiwiT2ZmQ2FudmFzIiwiJGxhc3RUcmlnZ2VyIiwiJHRyaWdnZXJzIiwidHJhbnNpdGlvbiIsImNvbnRlbnRPdmVybGF5Iiwib3ZlcmxheSIsIm92ZXJsYXlQb3NpdGlvbiIsInNldEF0dHJpYnV0ZSIsIiRvdmVybGF5IiwiaXNSZXZlYWxlZCIsInJldmVhbENsYXNzIiwicmV2ZWFsT24iLCJfc2V0TVFDaGVja2VyIiwidHJhbnNpdGlvblRpbWUiLCJfaGFuZGxlS2V5Ym9hcmQiLCJyZXZlYWwiLCIkY2xvc2VyIiwiZm9yY2VUbyIsInNjcm9sbFRvIiwic2Nyb2xsSGVpZ2h0IiwiY29udGVudFNjcm9sbCIsIl9zdG9wU2Nyb2xsaW5nIiwiUmVzcG9uc2l2ZU1lbnUiLCJydWxlcyIsImN1cnJlbnRNcSIsImN1cnJlbnRQbHVnaW4iLCJydWxlc1RyZWUiLCJydWxlIiwicnVsZVNpemUiLCJydWxlUGx1Z2luIiwiTWVudVBsdWdpbnMiLCJpc0VtcHR5T2JqZWN0IiwiX2NoZWNrTWVkaWFRdWVyaWVzIiwibWF0Y2hlZE1xIiwiY3NzQ2xhc3MiLCJkZXN0cm95IiwiZHJvcGRvd24iLCJkcmlsbGRvd24iLCJhY2NvcmRpb24iLCJSZXNwb25zaXZlVG9nZ2xlIiwidGFyZ2V0SUQiLCIkdGFyZ2V0TWVudSIsIiR0b2dnbGVyIiwiaW5wdXQiLCJhbmltYXRpb25JbiIsImFuaW1hdGlvbk91dCIsIl91cGRhdGUiLCJfdXBkYXRlTXFIYW5kbGVyIiwidG9nZ2xlTWVudSIsImhpZGVGb3IiLCJTbGlkZXIiLCJpbnB1dHMiLCJoYW5kbGVzIiwiJGhhbmRsZSIsIiRpbnB1dCIsIiRmaWxsIiwidmVydGljYWwiLCJpc0RibCIsImRpc2FibGVkIiwiZGlzYWJsZWRDbGFzcyIsImJpbmRpbmciLCJfc2V0SW5pdEF0dHIiLCJkb3VibGVTaWRlZCIsIiRoYW5kbGUyIiwiJGlucHV0MiIsInNldEhhbmRsZXMiLCJfc2V0SGFuZGxlUG9zIiwicGN0T2ZCYXIiLCJwZXJjZW50IiwicG9zaXRpb25WYWx1ZUZ1bmN0aW9uIiwiX2xvZ1RyYW5zZm9ybSIsIl9wb3dUcmFuc2Zvcm0iLCJ0b0ZpeGVkIiwiYmFzZUxvZyIsIm5vbkxpbmVhckJhc2UiLCIkaG5kbCIsImxvY2F0aW9uIiwibm9JbnZlcnQiLCJoMlZhbCIsInN0ZXAiLCJoMVZhbCIsInZlcnQiLCJoT3JXIiwibE9yVCIsImhhbmRsZURpbSIsImVsZW1EaW0iLCJfcGN0T2ZCYXIiLCJweFRvTW92ZSIsIm1vdmVtZW50IiwiZGVjaW1hbCIsIl9zZXRWYWx1ZXMiLCJpc0xlZnRIbmRsIiwiZGltIiwiaGFuZGxlUGN0IiwiaGFuZGxlUG9zIiwiaW5pdGlhbFN0YXJ0IiwibW92ZVRpbWUiLCJjaGFuZ2VkRGVsYXkiLCJpbml0VmFsIiwiaW5pdGlhbEVuZCIsImhhc1ZhbCIsImV2ZW50T2Zmc2V0IiwiaGFsZk9mSGFuZGxlIiwiYmFyRGltIiwid2luZG93U2Nyb2xsIiwic2Nyb2xsTGVmdCIsImVsZW1PZmZzZXQiLCJldmVudEZyb21CYXIiLCJiYXJYWSIsIm9mZnNldFBjdCIsIl92YWx1ZSIsIl9hZGp1c3RWYWx1ZSIsImZpcnN0SG5kbFBvcyIsImFic1Bvc2l0aW9uIiwic2VjbmRIbmRsUG9zIiwiZGl2IiwicHJldl92YWwiLCJuZXh0X3ZhbCIsIl9ldmVudHNGb3JIYW5kbGUiLCJjdXJIYW5kbGUiLCJfaGFuZGxlRXZlbnQiLCJjbGlja1NlbGVjdCIsImRyYWdnYWJsZSIsImN1cnJlbnRUYXJnZXQiLCJfJGhhbmRsZSIsIm9sZFZhbHVlIiwibmV3VmFsdWUiLCJkZWNyZWFzZSIsImluY3JlYXNlIiwiZGVjcmVhc2VfZmFzdCIsImluY3JlYXNlX2Zhc3QiLCJpbnZlcnRWZXJ0aWNhbCIsImZyYWMiLCJudW0iLCJjbGlja1BvcyIsImJhc2UiLCJsb2ciLCJTdGlja3kiLCJ3YXNXcmFwcGVkIiwiJGNvbnRhaW5lciIsImNvbnRhaW5lciIsIndyYXBJbm5lciIsImNvbnRhaW5lckNsYXNzIiwic3RpY2t5Q2xhc3MiLCJzY3JvbGxDb3VudCIsImNoZWNrRXZlcnkiLCJpc1N0dWNrIiwiY29udGFpbmVySGVpZ2h0IiwiZWxlbUhlaWdodCIsIl9wYXJzZVBvaW50cyIsIl9zZXRTaXplcyIsInNjcm9sbCIsIl9jYWxjIiwiX3JlbW92ZVN0aWNreSIsInRvcFBvaW50IiwicmV2ZXJzZSIsInRvcEFuY2hvciIsImJ0bSIsImJ0bUFuY2hvciIsInB0cyIsImJyZWFrcyIsImxlbiIsInB0IiwicGxhY2UiLCJwb2ludHMiLCJpc09uIiwiY2FuU3RpY2siLCJfcGF1c2VMaXN0ZW5lcnMiLCJjaGVja1NpemVzIiwiYm90dG9tUG9pbnQiLCJfc2V0U3RpY2t5Iiwic3RpY2tUbyIsIm1yZ24iLCJub3RTdHVja1RvIiwiaXNUb3AiLCJzdGlja1RvVG9wIiwiYW5jaG9yUHQiLCJhbmNob3JIZWlnaHQiLCJ0b3BPckJvdHRvbSIsInN0aWNreU9uIiwibmV3RWxlbVdpZHRoIiwiY29tcCIsInBkbmdsIiwicGRuZ3IiLCJuZXdDb250YWluZXJIZWlnaHQiLCJfc2V0QnJlYWtQb2ludHMiLCJtVG9wIiwiZW1DYWxjIiwibWFyZ2luVG9wIiwibUJ0bSIsIm1hcmdpbkJvdHRvbSIsIndpbkhlaWdodCIsImlubmVySGVpZ2h0IiwiZW0iLCJmb250U2l6ZSIsIlRhYnMiLCIkdGFiVGl0bGVzIiwibGlua0NsYXNzIiwibGlua0FjdGl2ZUNsYXNzIiwiaGFzaCIsImxvYWQiLCJkZWVwTGlua1NtdWRnZURlbGF5IiwiZGVlcExpbmsiLCJzZWxlY3RUYWIiLCJkZWVwTGlua1NtdWRnZSIsIm1hdGNoSGVpZ2h0IiwiJGltYWdlcyIsIl9zZXRIZWlnaHQiLCJfYWRkS2V5SGFuZGxlciIsIl9hZGRDbGlja0hhbmRsZXIiLCJfc2V0SGVpZ2h0TXFIYW5kbGVyIiwiX2hhbmRsZVRhYkNoYW5nZSIsIndyYXBPbktleXMiLCJsYXN0IiwiYWN0aXZlQ29sbGFwc2UiLCJfY29sbGFwc2VUYWIiLCIkb2xkVGFiIiwiJHRhYkxpbmsiLCIkdGFyZ2V0Q29udGVudCIsIl9vcGVuVGFiIiwidXBkYXRlSGlzdG9yeSIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJyZXBsYWNlU3RhdGUiLCJwYW5lbEFjdGl2ZUNsYXNzIiwiJHRhcmdldF9hbmNob3IiLCJpZFN0ciIsInBhbmVsQ2xhc3MiLCJwYW5lbCIsInRlbXAiLCJUb2dnbGVyIiwidG9nZ2xlQ2xhc3MiLCJfdXBkYXRlQVJJQSIsIlRvb2x0aXAiLCJpc0NsaWNrIiwiZWxlbUlkIiwiX2dldFBvc2l0aW9uQ2xhc3MiLCJ0aXBUZXh0IiwidGVtcGxhdGUiLCJfYnVpbGRUZW1wbGF0ZSIsImFsbG93SHRtbCIsImh0bWwiLCJ0cmlnZ2VyQ2xhc3MiLCJ0ZW1wbGF0ZUNsYXNzZXMiLCJ0b29sdGlwQ2xhc3MiLCIkdGVtcGxhdGUiLCIkdGlwRGltcyIsInNob3dPbiIsImZhZGVJbiIsImZhZGVJbkR1cmF0aW9uIiwiZmFkZU91dER1cmF0aW9uIiwiaXNGb2N1cyIsImRpc2FibGVGb3JUb3VjaCIsInRvdWNoQ2xvc2VUZXh0IiwiUmVzcG9uc2l2ZUFjY29yZGlvblRhYnMiLCJfZ2V0QWxsT3B0aW9ucyIsImFsbE9wdGlvbnMiLCJvYmoiLCJkdW1teVBsdWdpbiIsInRtcFBsdWdpbiIsImtleUtleSIsIm9iak9iaiIsInN0b3JlemZEYXRhIiwiX2hhbmRsZU1hcmt1cCIsInRvU2V0IiwiZnJvbVN0cmluZyIsIiRwYW5lbHMiLCJ0YWJzVGl0bGUiLCJ0YWJzUGFuZWwiLCIkbGlIZWFkcyIsIiRsaUhlYWRzQSIsImRpc3BsYXkiLCJ2aXNpYmlsaXR5IiwiYWZ0ZXIiLCIkdGFic0NvbnRlbnQiLCIkcGxhY2Vob2xkZXIiLCJpbnNlcnRBZnRlciIsInRlbXBWYWx1ZSIsInRhYnMiLCJjYXNlU3R1ZGllcyIsIm91dGVyV2lkdGgiLCJsZWZ0VmFsIiwicHJvamVjdEZsb3ciLCJzbGljayIsInNsaWRlIiwiZG90cyIsImFwcGVuZERvdHMiLCJhcnJvd3MiLCJzbGlkZXNUb1Nob3ciLCJzbGlkZXNUb1Njcm9sbCIsImFzTmF2Rm9yIiwicHJldkFycm93IiwibmV4dEFycm93IiwicmVzcG9uc2l2ZSIsImJyZWFrcG9pbnQiLCJzZXR0aW5ncyIsImZhZGUiLCJzcGVlZCIsImNzc0Vhc2UiLCJmbG93V2lkdGgiLCJmaWxsIiwiY3VycmVudFNsaWRlIiwibmV4dFNsaWRlIiwidGFiYmVkQ29udGVudCIsInRlc3RpbW9uaWFsIiwiZHJhZ3MiLCJkcmFnRWxlbWVudCIsInJlc2l6ZUVsZW1lbnQiLCJzdGFydFgiLCJvcmlnaW5hbEV2ZW50IiwiZHJhZ1dpZHRoIiwicG9zWCIsImNvbnRhaW5lck9mZnNldCIsImNvbnRhaW5lcldpZHRoIiwibWluTGVmdCIsIm1heExlZnQiLCJtb3ZlWCIsImxlZnRWYWx1ZSIsIndpZHRoVmFsdWUiLCJiYU9mZnNldCIsImhhbmRsZUxlZnQiLCJiZWZvcmVBZnRlciIsImN1ciIsInJlc2l6ZSIsIm5hdkVsZW1lbnQiLCJjb250ZW50RWxlbWVudCIsImN1c3RvbUZ1bmMiLCJkYXRhQ2hhbmdlIiwiYXV0b3BsYXlTdG9wIiwiYXV0b3BsYXkiLCJjbGVhckludGVydmFsIiwiYXV0b3BsYXlTdGFydCIsInNldEludGVydmFsIiwiYXV0b3BsYXlGdW5jIiwibmV4dElEIiwiZXF1YWxpemVIZWlnaHQiLCJlbGVtZW50TmFtZSIsInJlc2l6ZUhlaWdodCIsImhlaWdodHMiLCJzY3JvbGxUcmlnZ2VyIiwic2VjdGlvbkNsYXNzIiwiYWRkSGVpZ2h0IiwidHJpZ2dlcmVkIiwiaFQiLCJ3UyIsImRlbW9ncmFwaHlTbGlkZXIiLCJzY3JvbGxOYXYiLCJzZWN0aW9ucyIsImN1cnJJbmRleCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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Rzs7QUFFQTtBQUNBQztBQUNIO0FBQ0osQ0E1RkQ7O0FBOEZBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIHdoYXQtaW5wdXQgLSBBIGdsb2JhbCB1dGlsaXR5IGZvciB0cmFja2luZyB0aGUgY3VycmVudCBpbnB1dCBtZXRob2QgKG1vdXNlLCBrZXlib2FyZCBvciB0b3VjaCkuXG4gKiBAdmVyc2lvbiB2NC4wLjZcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS90ZW4xc2V2ZW4vd2hhdC1pbnB1dFxuICogQGxpY2Vuc2UgTUlUXG4gKi9cbihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwid2hhdElucHV0XCIsIFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIndoYXRJbnB1dFwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJ3aGF0SW5wdXRcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fSxcbi8qKioqKiovIFx0XHRcdGlkOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGxvYWRlZDogZmFsc2Vcbi8qKioqKiovIFx0XHR9O1xuXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuXG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0bW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBWYXJpYWJsZXNcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICAvLyBjYWNoZSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcblx0ICB2YXIgZG9jRWxlbSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuXHQgIC8vIGxhc3QgdXNlZCBpbnB1dCB0eXBlXG5cdCAgdmFyIGN1cnJlbnRJbnB1dCA9ICdpbml0aWFsJztcblxuXHQgIC8vIGxhc3QgdXNlZCBpbnB1dCBpbnRlbnRcblx0ICB2YXIgY3VycmVudEludGVudCA9IG51bGw7XG5cblx0ICAvLyBmb3JtIGlucHV0IHR5cGVzXG5cdCAgdmFyIGZvcm1JbnB1dHMgPSBbXG5cdCAgICAnaW5wdXQnLFxuXHQgICAgJ3NlbGVjdCcsXG5cdCAgICAndGV4dGFyZWEnXG5cdCAgXTtcblxuXHQgIC8vIGxpc3Qgb2YgbW9kaWZpZXIga2V5cyBjb21tb25seSB1c2VkIHdpdGggdGhlIG1vdXNlIGFuZFxuXHQgIC8vIGNhbiBiZSBzYWZlbHkgaWdub3JlZCB0byBwcmV2ZW50IGZhbHNlIGtleWJvYXJkIGRldGVjdGlvblxuXHQgIHZhciBpZ25vcmVNYXAgPSBbXG5cdCAgICAxNiwgLy8gc2hpZnRcblx0ICAgIDE3LCAvLyBjb250cm9sXG5cdCAgICAxOCwgLy8gYWx0XG5cdCAgICA5MSwgLy8gV2luZG93cyBrZXkgLyBsZWZ0IEFwcGxlIGNtZFxuXHQgICAgOTMgIC8vIFdpbmRvd3MgbWVudSAvIHJpZ2h0IEFwcGxlIGNtZFxuXHQgIF07XG5cblx0ICAvLyBtYXBwaW5nIG9mIGV2ZW50cyB0byBpbnB1dCB0eXBlc1xuXHQgIHZhciBpbnB1dE1hcCA9IHtcblx0ICAgICdrZXl1cCc6ICdrZXlib2FyZCcsXG5cdCAgICAnbW91c2Vkb3duJzogJ21vdXNlJyxcblx0ICAgICdtb3VzZW1vdmUnOiAnbW91c2UnLFxuXHQgICAgJ01TUG9pbnRlckRvd24nOiAncG9pbnRlcicsXG5cdCAgICAnTVNQb2ludGVyTW92ZSc6ICdwb2ludGVyJyxcblx0ICAgICdwb2ludGVyZG93bic6ICdwb2ludGVyJyxcblx0ICAgICdwb2ludGVybW92ZSc6ICdwb2ludGVyJyxcblx0ICAgICd0b3VjaHN0YXJ0JzogJ3RvdWNoJ1xuXHQgIH07XG5cblx0ICAvLyBhcnJheSBvZiBhbGwgdXNlZCBpbnB1dCB0eXBlc1xuXHQgIHZhciBpbnB1dFR5cGVzID0gW107XG5cblx0ICAvLyBib29sZWFuOiB0cnVlIGlmIHRvdWNoIGJ1ZmZlciB0aW1lciBpcyBydW5uaW5nXG5cdCAgdmFyIGlzQnVmZmVyaW5nID0gZmFsc2U7XG5cblx0ICAvLyBtYXAgb2YgSUUgMTAgcG9pbnRlciBldmVudHNcblx0ICB2YXIgcG9pbnRlck1hcCA9IHtcblx0ICAgIDI6ICd0b3VjaCcsXG5cdCAgICAzOiAndG91Y2gnLCAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuXHQgICAgNDogJ21vdXNlJ1xuXHQgIH07XG5cblx0ICAvLyB0b3VjaCBidWZmZXIgdGltZXJcblx0ICB2YXIgdG91Y2hUaW1lciA9IG51bGw7XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIFNldCB1cFxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIHZhciBzZXRVcCA9IGZ1bmN0aW9uKCkge1xuXG5cdCAgICAvLyBhZGQgY29ycmVjdCBtb3VzZSB3aGVlbCBldmVudCBtYXBwaW5nIHRvIGBpbnB1dE1hcGBcblx0ICAgIGlucHV0TWFwW2RldGVjdFdoZWVsKCldID0gJ21vdXNlJztcblxuXHQgICAgYWRkTGlzdGVuZXJzKCk7XG5cdCAgICBzZXRJbnB1dCgpO1xuXHQgIH07XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIEV2ZW50c1xuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIHZhciBhZGRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcblxuXHQgICAgLy8gYHBvaW50ZXJtb3ZlYCwgYE1TUG9pbnRlck1vdmVgLCBgbW91c2Vtb3ZlYCBhbmQgbW91c2Ugd2hlZWwgZXZlbnQgYmluZGluZ1xuXHQgICAgLy8gY2FuIG9ubHkgZGVtb25zdHJhdGUgcG90ZW50aWFsLCBidXQgbm90IGFjdHVhbCwgaW50ZXJhY3Rpb25cblx0ICAgIC8vIGFuZCBhcmUgdHJlYXRlZCBzZXBhcmF0ZWx5XG5cblx0ICAgIC8vIHBvaW50ZXIgZXZlbnRzIChtb3VzZSwgcGVuLCB0b3VjaClcblx0ICAgIGlmICh3aW5kb3cuUG9pbnRlckV2ZW50KSB7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzZXRJbnRlbnQpO1xuXHQgICAgfSBlbHNlIGlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQpIHtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJEb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlck1vdmUnLCBzZXRJbnRlbnQpO1xuXHQgICAgfSBlbHNlIHtcblxuXHQgICAgICAvLyBtb3VzZSBldmVudHNcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgc2V0SW50ZW50KTtcblxuXHQgICAgICAvLyB0b3VjaCBldmVudHNcblx0ICAgICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykge1xuXHQgICAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRvdWNoQnVmZmVyKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXG5cdCAgICAvLyBtb3VzZSB3aGVlbFxuXHQgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKGRldGVjdFdoZWVsKCksIHNldEludGVudCk7XG5cblx0ICAgIC8vIGtleWJvYXJkIGV2ZW50c1xuXHQgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwZGF0ZUlucHV0KTtcblx0ICB9O1xuXG5cdCAgLy8gY2hlY2tzIGNvbmRpdGlvbnMgYmVmb3JlIHVwZGF0aW5nIG5ldyBpbnB1dFxuXHQgIHZhciB1cGRhdGVJbnB1dCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0ICAgIC8vIG9ubHkgZXhlY3V0ZSBpZiB0aGUgdG91Y2ggYnVmZmVyIHRpbWVyIGlzbid0IHJ1bm5pbmdcblx0ICAgIGlmICghaXNCdWZmZXJpbmcpIHtcblx0ICAgICAgdmFyIGV2ZW50S2V5ID0gZXZlbnQud2hpY2g7XG5cdCAgICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuXHQgICAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykgdmFsdWUgPSBwb2ludGVyVHlwZShldmVudCk7XG5cblx0ICAgICAgaWYgKFxuXHQgICAgICAgIGN1cnJlbnRJbnB1dCAhPT0gdmFsdWUgfHxcblx0ICAgICAgICBjdXJyZW50SW50ZW50ICE9PSB2YWx1ZVxuXHQgICAgICApIHtcblxuXHQgICAgICAgIHZhciBhY3RpdmVFbGVtID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblx0ICAgICAgICB2YXIgYWN0aXZlSW5wdXQgPSAoXG5cdCAgICAgICAgICBhY3RpdmVFbGVtICYmXG5cdCAgICAgICAgICBhY3RpdmVFbGVtLm5vZGVOYW1lICYmXG5cdCAgICAgICAgICBmb3JtSW5wdXRzLmluZGV4T2YoYWN0aXZlRWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTFcblx0ICAgICAgICApID8gdHJ1ZSA6IGZhbHNlO1xuXG5cdCAgICAgICAgaWYgKFxuXHQgICAgICAgICAgdmFsdWUgPT09ICd0b3VjaCcgfHxcblxuXHQgICAgICAgICAgLy8gaWdub3JlIG1vdXNlIG1vZGlmaWVyIGtleXNcblx0ICAgICAgICAgICh2YWx1ZSA9PT0gJ21vdXNlJyAmJiBpZ25vcmVNYXAuaW5kZXhPZihldmVudEtleSkgPT09IC0xKSB8fFxuXG5cdCAgICAgICAgICAvLyBkb24ndCBzd2l0Y2ggaWYgdGhlIGN1cnJlbnQgZWxlbWVudCBpcyBhIGZvcm0gaW5wdXRcblx0ICAgICAgICAgICh2YWx1ZSA9PT0gJ2tleWJvYXJkJyAmJiBhY3RpdmVJbnB1dClcblx0ICAgICAgICApIHtcblxuXHQgICAgICAgICAgLy8gc2V0IHRoZSBjdXJyZW50IGFuZCBjYXRjaC1hbGwgdmFyaWFibGVcblx0ICAgICAgICAgIGN1cnJlbnRJbnB1dCA9IGN1cnJlbnRJbnRlbnQgPSB2YWx1ZTtcblxuXHQgICAgICAgICAgc2V0SW5wdXQoKTtcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gdXBkYXRlcyB0aGUgZG9jIGFuZCBgaW5wdXRUeXBlc2AgYXJyYXkgd2l0aCBuZXcgaW5wdXRcblx0ICB2YXIgc2V0SW5wdXQgPSBmdW5jdGlvbigpIHtcblx0ICAgIGRvY0VsZW0uc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnB1dCcsIGN1cnJlbnRJbnB1dCk7XG5cdCAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW50ZW50JywgY3VycmVudElucHV0KTtcblxuXHQgICAgaWYgKGlucHV0VHlwZXMuaW5kZXhPZihjdXJyZW50SW5wdXQpID09PSAtMSkge1xuXHQgICAgICBpbnB1dFR5cGVzLnB1c2goY3VycmVudElucHV0KTtcblx0ICAgICAgZG9jRWxlbS5jbGFzc05hbWUgKz0gJyB3aGF0aW5wdXQtdHlwZXMtJyArIGN1cnJlbnRJbnB1dDtcblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gdXBkYXRlcyBpbnB1dCBpbnRlbnQgZm9yIGBtb3VzZW1vdmVgIGFuZCBgcG9pbnRlcm1vdmVgXG5cdCAgdmFyIHNldEludGVudCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0ICAgIC8vIG9ubHkgZXhlY3V0ZSBpZiB0aGUgdG91Y2ggYnVmZmVyIHRpbWVyIGlzbid0IHJ1bm5pbmdcblx0ICAgIGlmICghaXNCdWZmZXJpbmcpIHtcblx0ICAgICAgdmFyIHZhbHVlID0gaW5wdXRNYXBbZXZlbnQudHlwZV07XG5cdCAgICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcblxuXHQgICAgICBpZiAoY3VycmVudEludGVudCAhPT0gdmFsdWUpIHtcblx0ICAgICAgICBjdXJyZW50SW50ZW50ID0gdmFsdWU7XG5cblx0ICAgICAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW50ZW50JywgY3VycmVudEludGVudCk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gYnVmZmVycyB0b3VjaCBldmVudHMgYmVjYXVzZSB0aGV5IGZyZXF1ZW50bHkgYWxzbyBmaXJlIG1vdXNlIGV2ZW50c1xuXHQgIHZhciB0b3VjaEJ1ZmZlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0ICAgIC8vIGNsZWFyIHRoZSB0aW1lciBpZiBpdCBoYXBwZW5zIHRvIGJlIHJ1bm5pbmdcblx0ICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodG91Y2hUaW1lcik7XG5cblx0ICAgIC8vIHNldCB0aGUgY3VycmVudCBpbnB1dFxuXHQgICAgdXBkYXRlSW5wdXQoZXZlbnQpO1xuXG5cdCAgICAvLyBzZXQgdGhlIGlzQnVmZmVyaW5nIHRvIGB0cnVlYFxuXHQgICAgaXNCdWZmZXJpbmcgPSB0cnVlO1xuXG5cdCAgICAvLyBydW4gdGhlIHRpbWVyXG5cdCAgICB0b3VjaFRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cblx0ICAgICAgLy8gaWYgdGhlIHRpbWVyIHJ1bnMgb3V0LCBzZXQgaXNCdWZmZXJpbmcgYmFjayB0byBgZmFsc2VgXG5cdCAgICAgIGlzQnVmZmVyaW5nID0gZmFsc2U7XG5cdCAgICB9LCAyMDApO1xuXHQgIH07XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIFV0aWxpdGllc1xuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIHZhciBwb2ludGVyVHlwZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdCAgIGlmICh0eXBlb2YgZXZlbnQucG9pbnRlclR5cGUgPT09ICdudW1iZXInKSB7XG5cdCAgICAgIHJldHVybiBwb2ludGVyTWFwW2V2ZW50LnBvaW50ZXJUeXBlXTtcblx0ICAgfSBlbHNlIHtcblx0ICAgICAgcmV0dXJuIChldmVudC5wb2ludGVyVHlwZSA9PT0gJ3BlbicpID8gJ3RvdWNoJyA6IGV2ZW50LnBvaW50ZXJUeXBlOyAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuXHQgICB9XG5cdCAgfTtcblxuXHQgIC8vIGRldGVjdCB2ZXJzaW9uIG9mIG1vdXNlIHdoZWVsIGV2ZW50IHRvIHVzZVxuXHQgIC8vIHZpYSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9FdmVudHMvd2hlZWxcblx0ICB2YXIgZGV0ZWN0V2hlZWwgPSBmdW5jdGlvbigpIHtcblx0ICAgIHJldHVybiAnb253aGVlbCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykgP1xuXHQgICAgICAnd2hlZWwnIDogLy8gTW9kZXJuIGJyb3dzZXJzIHN1cHBvcnQgXCJ3aGVlbFwiXG5cblx0ICAgICAgZG9jdW1lbnQub25tb3VzZXdoZWVsICE9PSB1bmRlZmluZWQgP1xuXHQgICAgICAgICdtb3VzZXdoZWVsJyA6IC8vIFdlYmtpdCBhbmQgSUUgc3VwcG9ydCBhdCBsZWFzdCBcIm1vdXNld2hlZWxcIlxuXHQgICAgICAgICdET01Nb3VzZVNjcm9sbCc7IC8vIGxldCdzIGFzc3VtZSB0aGF0IHJlbWFpbmluZyBicm93c2VycyBhcmUgb2xkZXIgRmlyZWZveFxuXHQgIH07XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIEluaXRcblxuXHQgICAgZG9uJ3Qgc3RhcnQgc2NyaXB0IHVubGVzcyBicm93c2VyIGN1dHMgdGhlIG11c3RhcmRcblx0ICAgIChhbHNvIHBhc3NlcyBpZiBwb2x5ZmlsbHMgYXJlIHVzZWQpXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgaWYgKFxuXHQgICAgJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdyAmJlxuXHQgICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2Zcblx0ICApIHtcblx0ICAgIHNldFVwKCk7XG5cdCAgfVxuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBBUElcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICByZXR1cm4ge1xuXG5cdCAgICAvLyByZXR1cm5zIHN0cmluZzogdGhlIGN1cnJlbnQgaW5wdXQgdHlwZVxuXHQgICAgLy8gb3B0OiAnbG9vc2UnfCdzdHJpY3QnXG5cdCAgICAvLyAnc3RyaWN0JyAoZGVmYXVsdCk6IHJldHVybnMgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIGBkYXRhLXdoYXRpbnB1dGAgYXR0cmlidXRlXG5cdCAgICAvLyAnbG9vc2UnOiBpbmNsdWRlcyBgZGF0YS13aGF0aW50ZW50YCB2YWx1ZSBpZiBpdCdzIG1vcmUgY3VycmVudCB0aGFuIGBkYXRhLXdoYXRpbnB1dGBcblx0ICAgIGFzazogZnVuY3Rpb24ob3B0KSB7IHJldHVybiAob3B0ID09PSAnbG9vc2UnKSA/IGN1cnJlbnRJbnRlbnQgOiBjdXJyZW50SW5wdXQ7IH0sXG5cblx0ICAgIC8vIHJldHVybnMgYXJyYXk6IGFsbCB0aGUgZGV0ZWN0ZWQgaW5wdXQgdHlwZXNcblx0ICAgIHR5cGVzOiBmdW5jdGlvbigpIHsgcmV0dXJuIGlucHV0VHlwZXM7IH1cblxuXHQgIH07XG5cblx0fSgpKTtcblxuXG4vKioqLyB9XG4vKioqKioqLyBdKVxufSk7XG47IiwiIWZ1bmN0aW9uKCQpIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBGT1VOREFUSU9OX1ZFUlNJT04gPSAnNi4zLjAnO1xuXG4vLyBHbG9iYWwgRm91bmRhdGlvbiBvYmplY3Rcbi8vIFRoaXMgaXMgYXR0YWNoZWQgdG8gdGhlIHdpbmRvdywgb3IgdXNlZCBhcyBhIG1vZHVsZSBmb3IgQU1EL0Jyb3dzZXJpZnlcbnZhciBGb3VuZGF0aW9uID0ge1xuICB2ZXJzaW9uOiBGT1VOREFUSU9OX1ZFUlNJT04sXG5cbiAgLyoqXG4gICAqIFN0b3JlcyBpbml0aWFsaXplZCBwbHVnaW5zLlxuICAgKi9cbiAgX3BsdWdpbnM6IHt9LFxuXG4gIC8qKlxuICAgKiBTdG9yZXMgZ2VuZXJhdGVkIHVuaXF1ZSBpZHMgZm9yIHBsdWdpbiBpbnN0YW5jZXNcbiAgICovXG4gIF91dWlkczogW10sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBib29sZWFuIGZvciBSVEwgc3VwcG9ydFxuICAgKi9cbiAgcnRsOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiAkKCdodG1sJykuYXR0cignZGlyJykgPT09ICdydGwnO1xuICB9LFxuICAvKipcbiAgICogRGVmaW5lcyBhIEZvdW5kYXRpb24gcGx1Z2luLCBhZGRpbmcgaXQgdG8gdGhlIGBGb3VuZGF0aW9uYCBuYW1lc3BhY2UgYW5kIHRoZSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZSB3aGVuIHJlZmxvd2luZy5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgcGx1Z2luLlxuICAgKi9cbiAgcGx1Z2luOiBmdW5jdGlvbihwbHVnaW4sIG5hbWUpIHtcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIGFkZGluZyB0byBnbG9iYWwgRm91bmRhdGlvbiBvYmplY3RcbiAgICAvLyBFeGFtcGxlczogRm91bmRhdGlvbi5SZXZlYWwsIEZvdW5kYXRpb24uT2ZmQ2FudmFzXG4gICAgdmFyIGNsYXNzTmFtZSA9IChuYW1lIHx8IGZ1bmN0aW9uTmFtZShwbHVnaW4pKTtcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIHN0b3JpbmcgdGhlIHBsdWdpbiwgYWxzbyB1c2VkIHRvIGNyZWF0ZSB0aGUgaWRlbnRpZnlpbmcgZGF0YSBhdHRyaWJ1dGUgZm9yIHRoZSBwbHVnaW5cbiAgICAvLyBFeGFtcGxlczogZGF0YS1yZXZlYWwsIGRhdGEtb2ZmLWNhbnZhc1xuICAgIHZhciBhdHRyTmFtZSAgPSBoeXBoZW5hdGUoY2xhc3NOYW1lKTtcblxuICAgIC8vIEFkZCB0byB0aGUgRm91bmRhdGlvbiBvYmplY3QgYW5kIHRoZSBwbHVnaW5zIGxpc3QgKGZvciByZWZsb3dpbmcpXG4gICAgdGhpcy5fcGx1Z2luc1thdHRyTmFtZV0gPSB0aGlzW2NsYXNzTmFtZV0gPSBwbHVnaW47XG4gIH0sXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogUG9wdWxhdGVzIHRoZSBfdXVpZHMgYXJyYXkgd2l0aCBwb2ludGVycyB0byBlYWNoIGluZGl2aWR1YWwgcGx1Z2luIGluc3RhbmNlLlxuICAgKiBBZGRzIHRoZSBgemZQbHVnaW5gIGRhdGEtYXR0cmlidXRlIHRvIHByb2dyYW1tYXRpY2FsbHkgY3JlYXRlZCBwbHVnaW5zIHRvIGFsbG93IHVzZSBvZiAkKHNlbGVjdG9yKS5mb3VuZGF0aW9uKG1ldGhvZCkgY2FsbHMuXG4gICAqIEFsc28gZmlyZXMgdGhlIGluaXRpYWxpemF0aW9uIGV2ZW50IGZvciBlYWNoIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSB0aGUgbmFtZSBvZiB0aGUgcGx1Z2luLCBwYXNzZWQgYXMgYSBjYW1lbENhc2VkIHN0cmluZy5cbiAgICogQGZpcmVzIFBsdWdpbiNpbml0XG4gICAqL1xuICByZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKXtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IG5hbWUgPyBoeXBoZW5hdGUobmFtZSkgOiBmdW5jdGlvbk5hbWUocGx1Z2luLmNvbnN0cnVjdG9yKS50b0xvd2VyQ2FzZSgpO1xuICAgIHBsdWdpbi51dWlkID0gdGhpcy5HZXRZb0RpZ2l0cyg2LCBwbHVnaW5OYW1lKTtcblxuICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuYXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkpeyBwbHVnaW4uJGVsZW1lbnQuYXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCwgcGx1Z2luLnV1aWQpOyB9XG4gICAgaWYoIXBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpKXsgcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJywgcGx1Z2luKTsgfVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgaW5pdGlhbGl6ZWQuXG4gICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNpbml0XG4gICAgICAgICAgICovXG4gICAgcGx1Z2luLiRlbGVtZW50LnRyaWdnZXIoYGluaXQuemYuJHtwbHVnaW5OYW1lfWApO1xuXG4gICAgdGhpcy5fdXVpZHMucHVzaChwbHVnaW4udXVpZCk7XG5cbiAgICByZXR1cm47XG4gIH0sXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogUmVtb3ZlcyB0aGUgcGx1Z2lucyB1dWlkIGZyb20gdGhlIF91dWlkcyBhcnJheS5cbiAgICogUmVtb3ZlcyB0aGUgemZQbHVnaW4gZGF0YSBhdHRyaWJ1dGUsIGFzIHdlbGwgYXMgdGhlIGRhdGEtcGx1Z2luLW5hbWUgYXR0cmlidXRlLlxuICAgKiBBbHNvIGZpcmVzIHRoZSBkZXN0cm95ZWQgZXZlbnQgZm9yIHRoZSBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAqIEBmaXJlcyBQbHVnaW4jZGVzdHJveWVkXG4gICAqL1xuICB1bnJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4pe1xuICAgIHZhciBwbHVnaW5OYW1lID0gaHlwaGVuYXRlKGZ1bmN0aW9uTmFtZShwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKS5jb25zdHJ1Y3RvcikpO1xuXG4gICAgdGhpcy5fdXVpZHMuc3BsaWNlKHRoaXMuX3V1aWRzLmluZGV4T2YocGx1Z2luLnV1aWQpLCAxKTtcbiAgICBwbHVnaW4uJGVsZW1lbnQucmVtb3ZlQXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkucmVtb3ZlRGF0YSgnemZQbHVnaW4nKVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNkZXN0cm95ZWRcbiAgICAgICAgICAgKi9cbiAgICAgICAgICAudHJpZ2dlcihgZGVzdHJveWVkLnpmLiR7cGx1Z2luTmFtZX1gKTtcbiAgICBmb3IodmFyIHByb3AgaW4gcGx1Z2luKXtcbiAgICAgIHBsdWdpbltwcm9wXSA9IG51bGw7Ly9jbGVhbiB1cCBzY3JpcHQgdG8gcHJlcCBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuICAgIH1cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBDYXVzZXMgb25lIG9yIG1vcmUgYWN0aXZlIHBsdWdpbnMgdG8gcmUtaW5pdGlhbGl6ZSwgcmVzZXR0aW5nIGV2ZW50IGxpc3RlbmVycywgcmVjYWxjdWxhdGluZyBwb3NpdGlvbnMsIGV0Yy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBsdWdpbnMgLSBvcHRpb25hbCBzdHJpbmcgb2YgYW4gaW5kaXZpZHVhbCBwbHVnaW4ga2V5LCBhdHRhaW5lZCBieSBjYWxsaW5nIGAkKGVsZW1lbnQpLmRhdGEoJ3BsdWdpbk5hbWUnKWAsIG9yIHN0cmluZyBvZiBhIHBsdWdpbiBjbGFzcyBpLmUuIGAnZHJvcGRvd24nYFxuICAgKiBAZGVmYXVsdCBJZiBubyBhcmd1bWVudCBpcyBwYXNzZWQsIHJlZmxvdyBhbGwgY3VycmVudGx5IGFjdGl2ZSBwbHVnaW5zLlxuICAgKi9cbiAgIHJlSW5pdDogZnVuY3Rpb24ocGx1Z2lucyl7XG4gICAgIHZhciBpc0pRID0gcGx1Z2lucyBpbnN0YW5jZW9mICQ7XG4gICAgIHRyeXtcbiAgICAgICBpZihpc0pRKXtcbiAgICAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3pmUGx1Z2luJykuX2luaXQoKTtcbiAgICAgICAgIH0pO1xuICAgICAgIH1lbHNle1xuICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgcGx1Z2lucyxcbiAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgIGZucyA9IHtcbiAgICAgICAgICAgJ29iamVjdCc6IGZ1bmN0aW9uKHBsZ3Mpe1xuICAgICAgICAgICAgIHBsZ3MuZm9yRWFjaChmdW5jdGlvbihwKXtcbiAgICAgICAgICAgICAgIHAgPSBoeXBoZW5hdGUocCk7XG4gICAgICAgICAgICAgICAkKCdbZGF0YS0nKyBwICsnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgICAgfSk7XG4gICAgICAgICAgIH0sXG4gICAgICAgICAgICdzdHJpbmcnOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgIHBsdWdpbnMgPSBoeXBoZW5hdGUocGx1Z2lucyk7XG4gICAgICAgICAgICAgJCgnW2RhdGEtJysgcGx1Z2lucyArJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICAndW5kZWZpbmVkJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICB0aGlzWydvYmplY3QnXShPYmplY3Qua2V5cyhfdGhpcy5fcGx1Z2lucykpO1xuICAgICAgICAgICB9XG4gICAgICAgICB9O1xuICAgICAgICAgZm5zW3R5cGVdKHBsdWdpbnMpO1xuICAgICAgIH1cbiAgICAgfWNhdGNoKGVycil7XG4gICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICB9ZmluYWxseXtcbiAgICAgICByZXR1cm4gcGx1Z2lucztcbiAgICAgfVxuICAgfSxcblxuICAvKipcbiAgICogcmV0dXJucyBhIHJhbmRvbSBiYXNlLTM2IHVpZCB3aXRoIG5hbWVzcGFjaW5nXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIC0gbnVtYmVyIG9mIHJhbmRvbSBiYXNlLTM2IGRpZ2l0cyBkZXNpcmVkLiBJbmNyZWFzZSBmb3IgbW9yZSByYW5kb20gc3RyaW5ncy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSAtIG5hbWUgb2YgcGx1Z2luIHRvIGJlIGluY29ycG9yYXRlZCBpbiB1aWQsIG9wdGlvbmFsLlxuICAgKiBAZGVmYXVsdCB7U3RyaW5nfSAnJyAtIGlmIG5vIHBsdWdpbiBuYW1lIGlzIHByb3ZpZGVkLCBub3RoaW5nIGlzIGFwcGVuZGVkIHRvIHRoZSB1aWQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IC0gdW5pcXVlIGlkXG4gICAqL1xuICBHZXRZb0RpZ2l0czogZnVuY3Rpb24obGVuZ3RoLCBuYW1lc3BhY2Upe1xuICAgIGxlbmd0aCA9IGxlbmd0aCB8fCA2O1xuICAgIHJldHVybiBNYXRoLnJvdW5kKChNYXRoLnBvdygzNiwgbGVuZ3RoICsgMSkgLSBNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMzYsIGxlbmd0aCkpKS50b1N0cmluZygzNikuc2xpY2UoMSkgKyAobmFtZXNwYWNlID8gYC0ke25hbWVzcGFjZX1gIDogJycpO1xuICB9LFxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBwbHVnaW5zIG9uIGFueSBlbGVtZW50cyB3aXRoaW4gYGVsZW1gIChhbmQgYGVsZW1gIGl0c2VsZikgdGhhdCBhcmVuJ3QgYWxyZWFkeSBpbml0aWFsaXplZC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQgdG8gY2hlY2sgaW5zaWRlLiBBbHNvIGNoZWNrcyB0aGUgZWxlbWVudCBpdHNlbGYsIHVubGVzcyBpdCdzIHRoZSBgZG9jdW1lbnRgIG9iamVjdC5cbiAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHBsdWdpbnMgLSBBIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplLiBMZWF2ZSB0aGlzIG91dCB0byBpbml0aWFsaXplIGV2ZXJ5dGhpbmcuXG4gICAqL1xuICByZWZsb3c6IGZ1bmN0aW9uKGVsZW0sIHBsdWdpbnMpIHtcblxuICAgIC8vIElmIHBsdWdpbnMgaXMgdW5kZWZpbmVkLCBqdXN0IGdyYWIgZXZlcnl0aGluZ1xuICAgIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBsdWdpbnMgPSBPYmplY3Qua2V5cyh0aGlzLl9wbHVnaW5zKTtcbiAgICB9XG4gICAgLy8gSWYgcGx1Z2lucyBpcyBhIHN0cmluZywgY29udmVydCBpdCB0byBhbiBhcnJheSB3aXRoIG9uZSBpdGVtXG4gICAgZWxzZSBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwbHVnaW5zID0gW3BsdWdpbnNdO1xuICAgIH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBwbHVnaW5cbiAgICAkLmVhY2gocGx1Z2lucywgZnVuY3Rpb24oaSwgbmFtZSkge1xuICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHBsdWdpblxuICAgICAgdmFyIHBsdWdpbiA9IF90aGlzLl9wbHVnaW5zW25hbWVdO1xuXG4gICAgICAvLyBMb2NhbGl6ZSB0aGUgc2VhcmNoIHRvIGFsbCBlbGVtZW50cyBpbnNpZGUgZWxlbSwgYXMgd2VsbCBhcyBlbGVtIGl0c2VsZiwgdW5sZXNzIGVsZW0gPT09IGRvY3VtZW50XG4gICAgICB2YXIgJGVsZW0gPSAkKGVsZW0pLmZpbmQoJ1tkYXRhLScrbmFtZSsnXScpLmFkZEJhY2soJ1tkYXRhLScrbmFtZSsnXScpO1xuXG4gICAgICAvLyBGb3IgZWFjaCBwbHVnaW4gZm91bmQsIGluaXRpYWxpemUgaXRcbiAgICAgICRlbGVtLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkZWwgPSAkKHRoaXMpLFxuICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICAvLyBEb24ndCBkb3VibGUtZGlwIG9uIHBsdWdpbnNcbiAgICAgICAgaWYgKCRlbC5kYXRhKCd6ZlBsdWdpbicpKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiVHJpZWQgdG8gaW5pdGlhbGl6ZSBcIituYW1lK1wiIG9uIGFuIGVsZW1lbnQgdGhhdCBhbHJlYWR5IGhhcyBhIEZvdW5kYXRpb24gcGx1Z2luLlwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZigkZWwuYXR0cignZGF0YS1vcHRpb25zJykpe1xuICAgICAgICAgIHZhciB0aGluZyA9ICRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKS5zcGxpdCgnOycpLmZvckVhY2goZnVuY3Rpb24oZSwgaSl7XG4gICAgICAgICAgICB2YXIgb3B0ID0gZS5zcGxpdCgnOicpLm1hcChmdW5jdGlvbihlbCl7IHJldHVybiBlbC50cmltKCk7IH0pO1xuICAgICAgICAgICAgaWYob3B0WzBdKSBvcHRzW29wdFswXV0gPSBwYXJzZVZhbHVlKG9wdFsxXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5e1xuICAgICAgICAgICRlbC5kYXRhKCd6ZlBsdWdpbicsIG5ldyBwbHVnaW4oJCh0aGlzKSwgb3B0cykpO1xuICAgICAgICB9Y2F0Y2goZXIpe1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXIpO1xuICAgICAgICB9ZmluYWxseXtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuICBnZXRGbk5hbWU6IGZ1bmN0aW9uTmFtZSxcbiAgdHJhbnNpdGlvbmVuZDogZnVuY3Rpb24oJGVsZW0pe1xuICAgIHZhciB0cmFuc2l0aW9ucyA9IHtcbiAgICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICdPVHJhbnNpdGlvbic6ICdvdHJhbnNpdGlvbmVuZCdcbiAgICB9O1xuICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgIGVuZDtcblxuICAgIGZvciAodmFyIHQgaW4gdHJhbnNpdGlvbnMpe1xuICAgICAgaWYgKHR5cGVvZiBlbGVtLnN0eWxlW3RdICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGVuZCA9IHRyYW5zaXRpb25zW3RdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZihlbmQpe1xuICAgICAgcmV0dXJuIGVuZDtcbiAgICB9ZWxzZXtcbiAgICAgIGVuZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgJGVsZW0udHJpZ2dlckhhbmRsZXIoJ3RyYW5zaXRpb25lbmQnLCBbJGVsZW1dKTtcbiAgICAgIH0sIDEpO1xuICAgICAgcmV0dXJuICd0cmFuc2l0aW9uZW5kJztcbiAgICB9XG4gIH1cbn07XG5cbkZvdW5kYXRpb24udXRpbCA9IHtcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGZvciBhcHBseWluZyBhIGRlYm91bmNlIGVmZmVjdCB0byBhIGZ1bmN0aW9uIGNhbGwuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIC0gRnVuY3Rpb24gdG8gYmUgY2FsbGVkIGF0IGVuZCBvZiB0aW1lb3V0LlxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsYXkgLSBUaW1lIGluIG1zIHRvIGRlbGF5IHRoZSBjYWxsIG9mIGBmdW5jYC5cbiAgICogQHJldHVybnMgZnVuY3Rpb25cbiAgICovXG4gIHRocm90dGxlOiBmdW5jdGlvbiAoZnVuYywgZGVsYXkpIHtcbiAgICB2YXIgdGltZXIgPSBudWxsO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgaWYgKHRpbWVyID09PSBudWxsKSB7XG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICB0aW1lciA9IG51bGw7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuXG4vLyBUT0RPOiBjb25zaWRlciBub3QgbWFraW5nIHRoaXMgYSBqUXVlcnkgZnVuY3Rpb25cbi8vIFRPRE86IG5lZWQgd2F5IHRvIHJlZmxvdyB2cy4gcmUtaW5pdGlhbGl6ZVxuLyoqXG4gKiBUaGUgRm91bmRhdGlvbiBqUXVlcnkgbWV0aG9kLlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IG1ldGhvZCAtIEFuIGFjdGlvbiB0byBwZXJmb3JtIG9uIHRoZSBjdXJyZW50IGpRdWVyeSBvYmplY3QuXG4gKi9cbnZhciBmb3VuZGF0aW9uID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIG1ldGhvZCxcbiAgICAgICRtZXRhID0gJCgnbWV0YS5mb3VuZGF0aW9uLW1xJyksXG4gICAgICAkbm9KUyA9ICQoJy5uby1qcycpO1xuXG4gIGlmKCEkbWV0YS5sZW5ndGgpe1xuICAgICQoJzxtZXRhIGNsYXNzPVwiZm91bmRhdGlvbi1tcVwiPicpLmFwcGVuZFRvKGRvY3VtZW50LmhlYWQpO1xuICB9XG4gIGlmKCRub0pTLmxlbmd0aCl7XG4gICAgJG5vSlMucmVtb3ZlQ2xhc3MoJ25vLWpzJyk7XG4gIH1cblxuICBpZih0eXBlID09PSAndW5kZWZpbmVkJyl7Ly9uZWVkcyB0byBpbml0aWFsaXplIHRoZSBGb3VuZGF0aW9uIG9iamVjdCwgb3IgYW4gaW5kaXZpZHVhbCBwbHVnaW4uXG4gICAgRm91bmRhdGlvbi5NZWRpYVF1ZXJ5Ll9pbml0KCk7XG4gICAgRm91bmRhdGlvbi5yZWZsb3codGhpcyk7XG4gIH1lbHNlIGlmKHR5cGUgPT09ICdzdHJpbmcnKXsvL2FuIGluZGl2aWR1YWwgbWV0aG9kIHRvIGludm9rZSBvbiBhIHBsdWdpbiBvciBncm91cCBvZiBwbHVnaW5zXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpOy8vY29sbGVjdCBhbGwgdGhlIGFyZ3VtZW50cywgaWYgbmVjZXNzYXJ5XG4gICAgdmFyIHBsdWdDbGFzcyA9IHRoaXMuZGF0YSgnemZQbHVnaW4nKTsvL2RldGVybWluZSB0aGUgY2xhc3Mgb2YgcGx1Z2luXG5cbiAgICBpZihwbHVnQ2xhc3MgIT09IHVuZGVmaW5lZCAmJiBwbHVnQ2xhc3NbbWV0aG9kXSAhPT0gdW5kZWZpbmVkKXsvL21ha2Ugc3VyZSBib3RoIHRoZSBjbGFzcyBhbmQgbWV0aG9kIGV4aXN0XG4gICAgICBpZih0aGlzLmxlbmd0aCA9PT0gMSl7Ly9pZiB0aGVyZSdzIG9ubHkgb25lLCBjYWxsIGl0IGRpcmVjdGx5LlxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KHBsdWdDbGFzcywgYXJncyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGVsKXsvL290aGVyd2lzZSBsb29wIHRocm91Z2ggdGhlIGpRdWVyeSBjb2xsZWN0aW9uIGFuZCBpbnZva2UgdGhlIG1ldGhvZCBvbiBlYWNoXG4gICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkoJChlbCkuZGF0YSgnemZQbHVnaW4nKSwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1lbHNley8vZXJyb3IgZm9yIG5vIGNsYXNzIG9yIG5vIG1ldGhvZFxuICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiV2UncmUgc29ycnksICdcIiArIG1ldGhvZCArIFwiJyBpcyBub3QgYW4gYXZhaWxhYmxlIG1ldGhvZCBmb3IgXCIgKyAocGx1Z0NsYXNzID8gZnVuY3Rpb25OYW1lKHBsdWdDbGFzcykgOiAndGhpcyBlbGVtZW50JykgKyAnLicpO1xuICAgIH1cbiAgfWVsc2V7Ly9lcnJvciBmb3IgaW52YWxpZCBhcmd1bWVudCB0eXBlXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgV2UncmUgc29ycnksICR7dHlwZX0gaXMgbm90IGEgdmFsaWQgcGFyYW1ldGVyLiBZb3UgbXVzdCB1c2UgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBtZXRob2QgeW91IHdpc2ggdG8gaW52b2tlLmApO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxud2luZG93LkZvdW5kYXRpb24gPSBGb3VuZGF0aW9uO1xuJC5mbi5mb3VuZGF0aW9uID0gZm91bmRhdGlvbjtcblxuLy8gUG9seWZpbGwgZm9yIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuKGZ1bmN0aW9uKCkge1xuICBpZiAoIURhdGUubm93IHx8ICF3aW5kb3cuRGF0ZS5ub3cpXG4gICAgd2luZG93LkRhdGUubm93ID0gRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xuXG4gIHZhciB2ZW5kb3JzID0gWyd3ZWJraXQnLCAnbW96J107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsraSkge1xuICAgICAgdmFyIHZwID0gdmVuZG9yc1tpXTtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnArJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKHdpbmRvd1t2cCsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZwKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXSk7XG4gIH1cbiAgaWYgKC9pUChhZHxob25lfG9kKS4qT1MgNi8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICB8fCAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAhd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIHZhciBuZXh0VGltZSA9IE1hdGgubWF4KGxhc3RUaW1lICsgMTYsIG5vdyk7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhsYXN0VGltZSA9IG5leHRUaW1lKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRpbWUgLSBub3cpO1xuICAgIH07XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gY2xlYXJUaW1lb3V0O1xuICB9XG4gIC8qKlxuICAgKiBQb2x5ZmlsbCBmb3IgcGVyZm9ybWFuY2Uubm93LCByZXF1aXJlZCBieSByQUZcbiAgICovXG4gIGlmKCF3aW5kb3cucGVyZm9ybWFuY2UgfHwgIXdpbmRvdy5wZXJmb3JtYW5jZS5ub3cpe1xuICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHtcbiAgICAgIHN0YXJ0OiBEYXRlLm5vdygpLFxuICAgICAgbm93OiBmdW5jdGlvbigpeyByZXR1cm4gRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnQ7IH1cbiAgICB9O1xuICB9XG59KSgpO1xuaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xuICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKG9UaGlzKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcbiAgICAgIC8vIGludGVybmFsIElzQ2FsbGFibGUgZnVuY3Rpb25cbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XG4gICAgfVxuXG4gICAgdmFyIGFBcmdzICAgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICBmVG9CaW5kID0gdGhpcyxcbiAgICAgICAgZk5PUCAgICA9IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIGZCb3VuZCAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUFxuICAgICAgICAgICAgICAgICA/IHRoaXNcbiAgICAgICAgICAgICAgICAgOiBvVGhpcyxcbiAgICAgICAgICAgICAgICAgYUFyZ3MuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgICAgfTtcblxuICAgIGlmICh0aGlzLnByb3RvdHlwZSkge1xuICAgICAgLy8gbmF0aXZlIGZ1bmN0aW9ucyBkb24ndCBoYXZlIGEgcHJvdG90eXBlXG4gICAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xuICAgIH1cbiAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcblxuICAgIHJldHVybiBmQm91bmQ7XG4gIH07XG59XG4vLyBQb2x5ZmlsbCB0byBnZXQgdGhlIG5hbWUgb2YgYSBmdW5jdGlvbiBpbiBJRTlcbmZ1bmN0aW9uIGZ1bmN0aW9uTmFtZShmbikge1xuICBpZiAoRnVuY3Rpb24ucHJvdG90eXBlLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKFteKF17MSx9KVxcKC87XG4gICAgdmFyIHJlc3VsdHMgPSAoZnVuY05hbWVSZWdleCkuZXhlYygoZm4pLnRvU3RyaW5nKCkpO1xuICAgIHJldHVybiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpID8gcmVzdWx0c1sxXS50cmltKCkgOiBcIlwiO1xuICB9XG4gIGVsc2UgaWYgKGZuLnByb3RvdHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGZuLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGZuLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG59XG5mdW5jdGlvbiBwYXJzZVZhbHVlKHN0cil7XG4gIGlmICgndHJ1ZScgPT09IHN0cikgcmV0dXJuIHRydWU7XG4gIGVsc2UgaWYgKCdmYWxzZScgPT09IHN0cikgcmV0dXJuIGZhbHNlO1xuICBlbHNlIGlmICghaXNOYU4oc3RyICogMSkpIHJldHVybiBwYXJzZUZsb2F0KHN0cik7XG4gIHJldHVybiBzdHI7XG59XG4vLyBDb252ZXJ0IFBhc2NhbENhc2UgdG8ga2ViYWItY2FzZVxuLy8gVGhhbmsgeW91OiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS84OTU1NTgwXG5mdW5jdGlvbiBoeXBoZW5hdGUoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbn1cblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5Gb3VuZGF0aW9uLkJveCA9IHtcbiAgSW1Ob3RUb3VjaGluZ1lvdTogSW1Ob3RUb3VjaGluZ1lvdSxcbiAgR2V0RGltZW5zaW9uczogR2V0RGltZW5zaW9ucyxcbiAgR2V0T2Zmc2V0czogR2V0T2Zmc2V0c1xufVxuXG4vKipcbiAqIENvbXBhcmVzIHRoZSBkaW1lbnNpb25zIG9mIGFuIGVsZW1lbnQgdG8gYSBjb250YWluZXIgYW5kIGRldGVybWluZXMgY29sbGlzaW9uIGV2ZW50cyB3aXRoIGNvbnRhaW5lci5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHRlc3QgZm9yIGNvbGxpc2lvbnMuXG4gKiBAcGFyYW0ge2pRdWVyeX0gcGFyZW50IC0galF1ZXJ5IG9iamVjdCB0byB1c2UgYXMgYm91bmRpbmcgY29udGFpbmVyLlxuICogQHBhcmFtIHtCb29sZWFufSBsck9ubHkgLSBzZXQgdG8gdHJ1ZSB0byBjaGVjayBsZWZ0IGFuZCByaWdodCB2YWx1ZXMgb25seS5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgdG9wIGFuZCBib3R0b20gdmFsdWVzIG9ubHkuXG4gKiBAZGVmYXVsdCBpZiBubyBwYXJlbnQgb2JqZWN0IHBhc3NlZCwgZGV0ZWN0cyBjb2xsaXNpb25zIHdpdGggYHdpbmRvd2AuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gLSB0cnVlIGlmIGNvbGxpc2lvbiBmcmVlLCBmYWxzZSBpZiBhIGNvbGxpc2lvbiBpbiBhbnkgZGlyZWN0aW9uLlxuICovXG5mdW5jdGlvbiBJbU5vdFRvdWNoaW5nWW91KGVsZW1lbnQsIHBhcmVudCwgbHJPbmx5LCB0Yk9ubHkpIHtcbiAgdmFyIGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgdG9wLCBib3R0b20sIGxlZnQsIHJpZ2h0O1xuXG4gIGlmIChwYXJlbnQpIHtcbiAgICB2YXIgcGFyRGltcyA9IEdldERpbWVuc2lvbnMocGFyZW50KTtcblxuICAgIGJvdHRvbSA9IChlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBwYXJEaW1zLmhlaWdodCArIHBhckRpbXMub2Zmc2V0LnRvcCk7XG4gICAgdG9wICAgID0gKGVsZURpbXMub2Zmc2V0LnRvcCA+PSBwYXJEaW1zLm9mZnNldC50b3ApO1xuICAgIGxlZnQgICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ID49IHBhckRpbXMub2Zmc2V0LmxlZnQpO1xuICAgIHJpZ2h0ICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBwYXJEaW1zLndpZHRoICsgcGFyRGltcy5vZmZzZXQubGVmdCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgYm90dG9tID0gKGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0IDw9IGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgKyBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCk7XG4gICAgdG9wICAgID0gKGVsZURpbXMub2Zmc2V0LnRvcCA+PSBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCk7XG4gICAgbGVmdCAgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0KTtcbiAgICByaWdodCAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gZWxlRGltcy53aW5kb3dEaW1zLndpZHRoKTtcbiAgfVxuXG4gIHZhciBhbGxEaXJzID0gW2JvdHRvbSwgdG9wLCBsZWZ0LCByaWdodF07XG5cbiAgaWYgKGxyT25seSkge1xuICAgIHJldHVybiBsZWZ0ID09PSByaWdodCA9PT0gdHJ1ZTtcbiAgfVxuXG4gIGlmICh0Yk9ubHkpIHtcbiAgICByZXR1cm4gdG9wID09PSBib3R0b20gPT09IHRydWU7XG4gIH1cblxuICByZXR1cm4gYWxsRGlycy5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG59O1xuXG4vKipcbiAqIFVzZXMgbmF0aXZlIG1ldGhvZHMgdG8gcmV0dXJuIGFuIG9iamVjdCBvZiBkaW1lbnNpb24gdmFsdWVzLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeSB8fCBIVE1MfSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBvciBET00gZWxlbWVudCBmb3Igd2hpY2ggdG8gZ2V0IHRoZSBkaW1lbnNpb25zLiBDYW4gYmUgYW55IGVsZW1lbnQgb3RoZXIgdGhhdCBkb2N1bWVudCBvciB3aW5kb3cuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAtIG5lc3RlZCBvYmplY3Qgb2YgaW50ZWdlciBwaXhlbCB2YWx1ZXNcbiAqIFRPRE8gLSBpZiBlbGVtZW50IGlzIHdpbmRvdywgcmV0dXJuIG9ubHkgdGhvc2UgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBHZXREaW1lbnNpb25zKGVsZW0sIHRlc3Qpe1xuICBlbGVtID0gZWxlbS5sZW5ndGggPyBlbGVtWzBdIDogZWxlbTtcblxuICBpZiAoZWxlbSA9PT0gd2luZG93IHx8IGVsZW0gPT09IGRvY3VtZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSSdtIHNvcnJ5LCBEYXZlLiBJJ20gYWZyYWlkIEkgY2FuJ3QgZG8gdGhhdC5cIik7XG4gIH1cblxuICB2YXIgcmVjdCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICBwYXJSZWN0ID0gZWxlbS5wYXJlbnROb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgd2luUmVjdCA9IGRvY3VtZW50LmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICB3aW5ZID0gd2luZG93LnBhZ2VZT2Zmc2V0LFxuICAgICAgd2luWCA9IHdpbmRvdy5wYWdlWE9mZnNldDtcblxuICByZXR1cm4ge1xuICAgIHdpZHRoOiByZWN0LndpZHRoLFxuICAgIGhlaWdodDogcmVjdC5oZWlnaHQsXG4gICAgb2Zmc2V0OiB7XG4gICAgICB0b3A6IHJlY3QudG9wICsgd2luWSxcbiAgICAgIGxlZnQ6IHJlY3QubGVmdCArIHdpblhcbiAgICB9LFxuICAgIHBhcmVudERpbXM6IHtcbiAgICAgIHdpZHRoOiBwYXJSZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiBwYXJSZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHBhclJlY3QudG9wICsgd2luWSxcbiAgICAgICAgbGVmdDogcGFyUmVjdC5sZWZ0ICsgd2luWFxuICAgICAgfVxuICAgIH0sXG4gICAgd2luZG93RGltczoge1xuICAgICAgd2lkdGg6IHdpblJlY3Qud2lkdGgsXG4gICAgICBoZWlnaHQ6IHdpblJlY3QuaGVpZ2h0LFxuICAgICAgb2Zmc2V0OiB7XG4gICAgICAgIHRvcDogd2luWSxcbiAgICAgICAgbGVmdDogd2luWFxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IG9mIHRvcCBhbmQgbGVmdCBpbnRlZ2VyIHBpeGVsIHZhbHVlcyBmb3IgZHluYW1pY2FsbHkgcmVuZGVyZWQgZWxlbWVudHMsXG4gKiBzdWNoIGFzOiBUb29sdGlwLCBSZXZlYWwsIGFuZCBEcm9wZG93blxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50IGJlaW5nIHBvc2l0aW9uZWQuXG4gKiBAcGFyYW0ge2pRdWVyeX0gYW5jaG9yIC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQncyBhbmNob3IgcG9pbnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gcG9zaXRpb24gLSBhIHN0cmluZyByZWxhdGluZyB0byB0aGUgZGVzaXJlZCBwb3NpdGlvbiBvZiB0aGUgZWxlbWVudCwgcmVsYXRpdmUgdG8gaXQncyBhbmNob3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB2T2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIHZlcnRpY2FsIHNlcGFyYXRpb24gYmV0d2VlbiBhbmNob3IgYW5kIGVsZW1lbnQuXG4gKiBAcGFyYW0ge051bWJlcn0gaE9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCBob3Jpem9udGFsIHNlcGFyYXRpb24gYmV0d2VlbiBhbmNob3IgYW5kIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzT3ZlcmZsb3cgLSBpZiBhIGNvbGxpc2lvbiBldmVudCBpcyBkZXRlY3RlZCwgc2V0cyB0byB0cnVlIHRvIGRlZmF1bHQgdGhlIGVsZW1lbnQgdG8gZnVsbCB3aWR0aCAtIGFueSBkZXNpcmVkIG9mZnNldC5cbiAqIFRPRE8gYWx0ZXIvcmV3cml0ZSB0byB3b3JrIHdpdGggYGVtYCB2YWx1ZXMgYXMgd2VsbC9pbnN0ZWFkIG9mIHBpeGVsc1xuICovXG5mdW5jdGlvbiBHZXRPZmZzZXRzKGVsZW1lbnQsIGFuY2hvciwgcG9zaXRpb24sIHZPZmZzZXQsIGhPZmZzZXQsIGlzT3ZlcmZsb3cpIHtcbiAgdmFyICRlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgICRhbmNob3JEaW1zID0gYW5jaG9yID8gR2V0RGltZW5zaW9ucyhhbmNob3IpIDogbnVsbDtcblxuICBzd2l0Y2ggKHBvc2l0aW9uKSB7XG4gICAgY2FzZSAndG9wJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IChGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgLSAoJGVsZURpbXMuaGVpZ2h0ICsgdk9mZnNldClcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgdG9wJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICgkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICgkYW5jaG9yRGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgLSAoJGVsZURpbXMuaGVpZ2h0ICsgdk9mZnNldClcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciBib3R0b20nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogaXNPdmVyZmxvdyA/IGhPZmZzZXQgOiAoKCRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgKCRhbmNob3JEaW1zLndpZHRoIC8gMikpIC0gKCRlbGVEaW1zLndpZHRoIC8gMikpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgbGVmdCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxuICAgICAgICB0b3A6ICgkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgKCRhbmNob3JEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIHJpZ2h0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0ICsgMSxcbiAgICAgICAgdG9wOiAoJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICgkYW5jaG9yRGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlcic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCArICgkZWxlRGltcy53aW5kb3dEaW1zLndpZHRoIC8gMikpIC0gKCRlbGVEaW1zLndpZHRoIC8gMiksXG4gICAgICAgIHRvcDogKCRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCArICgkZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmV2ZWFsJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICgkZWxlRGltcy53aW5kb3dEaW1zLndpZHRoIC0gJGVsZURpbXMud2lkdGgpIC8gMixcbiAgICAgICAgdG9wOiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyB2T2Zmc2V0XG4gICAgICB9XG4gICAgY2FzZSAncmV2ZWFsIGZ1bGwnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgdG9wOiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xlZnQgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0LFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0IC0gJGVsZURpbXMud2lkdGgsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH07XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArIGhPZmZzZXQpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9XG4gIH1cbn1cblxufShqUXVlcnkpO1xuIiwiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKiBUaGlzIHV0aWwgd2FzIGNyZWF0ZWQgYnkgTWFyaXVzIE9sYmVydHogKlxuICogUGxlYXNlIHRoYW5rIE1hcml1cyBvbiBHaXRIdWIgL293bGJlcnR6ICpcbiAqIG9yIHRoZSB3ZWIgaHR0cDovL3d3dy5tYXJpdXNvbGJlcnR6LmRlLyAqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBrZXlDb2RlcyA9IHtcbiAgOTogJ1RBQicsXG4gIDEzOiAnRU5URVInLFxuICAyNzogJ0VTQ0FQRScsXG4gIDMyOiAnU1BBQ0UnLFxuICAzNzogJ0FSUk9XX0xFRlQnLFxuICAzODogJ0FSUk9XX1VQJyxcbiAgMzk6ICdBUlJPV19SSUdIVCcsXG4gIDQwOiAnQVJST1dfRE9XTidcbn1cblxudmFyIGNvbW1hbmRzID0ge31cblxudmFyIEtleWJvYXJkID0ge1xuICBrZXlzOiBnZXRLZXlDb2RlcyhrZXlDb2RlcyksXG5cbiAgLyoqXG4gICAqIFBhcnNlcyB0aGUgKGtleWJvYXJkKSBldmVudCBhbmQgcmV0dXJucyBhIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgaXRzIGtleVxuICAgKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSB0aGUgZXZlbnQgZ2VuZXJhdGVkIGJ5IHRoZSBldmVudCBoYW5kbGVyXG4gICAqIEByZXR1cm4gU3RyaW5nIGtleSAtIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgdGhlIGtleSBwcmVzc2VkXG4gICAqL1xuICBwYXJzZUtleShldmVudCkge1xuICAgIHZhciBrZXkgPSBrZXlDb2Rlc1tldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LndoaWNoKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgLy8gUmVtb3ZlIHVuLXByaW50YWJsZSBjaGFyYWN0ZXJzLCBlLmcuIGZvciBgZnJvbUNoYXJDb2RlYCBjYWxscyBmb3IgQ1RSTCBvbmx5IGV2ZW50c1xuICAgIGtleSA9IGtleS5yZXBsYWNlKC9cXFcrLywgJycpO1xuXG4gICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSBrZXkgPSBgU0hJRlRfJHtrZXl9YDtcbiAgICBpZiAoZXZlbnQuY3RybEtleSkga2V5ID0gYENUUkxfJHtrZXl9YDtcbiAgICBpZiAoZXZlbnQuYWx0S2V5KSBrZXkgPSBgQUxUXyR7a2V5fWA7XG5cbiAgICAvLyBSZW1vdmUgdHJhaWxpbmcgdW5kZXJzY29yZSwgaW4gY2FzZSBvbmx5IG1vZGlmaWVycyB3ZXJlIHVzZWQgKGUuZy4gb25seSBgQ1RSTF9BTFRgKVxuICAgIGtleSA9IGtleS5yZXBsYWNlKC9fJC8sICcnKTtcblxuICAgIHJldHVybiBrZXk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIGdpdmVuIChrZXlib2FyZCkgZXZlbnRcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSB0aGUgZXZlbnQgZ2VuZXJhdGVkIGJ5IHRoZSBldmVudCBoYW5kbGVyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCdzIG5hbWUsIGUuZy4gU2xpZGVyIG9yIFJldmVhbFxuICAgKiBAcGFyYW0ge09iamVjdHN9IGZ1bmN0aW9ucyAtIGNvbGxlY3Rpb24gb2YgZnVuY3Rpb25zIHRoYXQgYXJlIHRvIGJlIGV4ZWN1dGVkXG4gICAqL1xuICBoYW5kbGVLZXkoZXZlbnQsIGNvbXBvbmVudCwgZnVuY3Rpb25zKSB7XG4gICAgdmFyIGNvbW1hbmRMaXN0ID0gY29tbWFuZHNbY29tcG9uZW50XSxcbiAgICAgIGtleUNvZGUgPSB0aGlzLnBhcnNlS2V5KGV2ZW50KSxcbiAgICAgIGNtZHMsXG4gICAgICBjb21tYW5kLFxuICAgICAgZm47XG5cbiAgICBpZiAoIWNvbW1hbmRMaXN0KSByZXR1cm4gY29uc29sZS53YXJuKCdDb21wb25lbnQgbm90IGRlZmluZWQhJyk7XG5cbiAgICBpZiAodHlwZW9mIGNvbW1hbmRMaXN0Lmx0ciA9PT0gJ3VuZGVmaW5lZCcpIHsgLy8gdGhpcyBjb21wb25lbnQgZG9lcyBub3QgZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGx0ciBhbmQgcnRsXG4gICAgICAgIGNtZHMgPSBjb21tYW5kTGlzdDsgLy8gdXNlIHBsYWluIGxpc3RcbiAgICB9IGVsc2UgeyAvLyBtZXJnZSBsdHIgYW5kIHJ0bDogaWYgZG9jdW1lbnQgaXMgcnRsLCBydGwgb3ZlcndyaXRlcyBsdHIgYW5kIHZpY2UgdmVyc2FcbiAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIGNtZHMgPSAkLmV4dGVuZCh7fSwgY29tbWFuZExpc3QubHRyLCBjb21tYW5kTGlzdC5ydGwpO1xuXG4gICAgICAgIGVsc2UgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5ydGwsIGNvbW1hbmRMaXN0Lmx0cik7XG4gICAgfVxuICAgIGNvbW1hbmQgPSBjbWRzW2tleUNvZGVdO1xuXG4gICAgZm4gPSBmdW5jdGlvbnNbY29tbWFuZF07XG4gICAgaWYgKGZuICYmIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uICBpZiBleGlzdHNcbiAgICAgIHZhciByZXR1cm5WYWx1ZSA9IGZuLmFwcGx5KCk7XG4gICAgICBpZiAoZnVuY3Rpb25zLmhhbmRsZWQgfHwgdHlwZW9mIGZ1bmN0aW9ucy5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgaGFuZGxlZFxuICAgICAgICAgIGZ1bmN0aW9ucy5oYW5kbGVkKHJldHVyblZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGZ1bmN0aW9ucy51bmhhbmRsZWQgfHwgdHlwZW9mIGZ1bmN0aW9ucy51bmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBub3QgaGFuZGxlZFxuICAgICAgICAgIGZ1bmN0aW9ucy51bmhhbmRsZWQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZpbmRzIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIHRoZSBnaXZlbiBgJGVsZW1lbnRgXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gc2VhcmNoIHdpdGhpblxuICAgKiBAcmV0dXJuIHtqUXVlcnl9ICRmb2N1c2FibGUgLSBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiBgJGVsZW1lbnRgXG4gICAqL1xuICBmaW5kRm9jdXNhYmxlKCRlbGVtZW50KSB7XG4gICAgaWYoISRlbGVtZW50KSB7cmV0dXJuIGZhbHNlOyB9XG4gICAgcmV0dXJuICRlbGVtZW50LmZpbmQoJ2FbaHJlZl0sIGFyZWFbaHJlZl0sIGlucHV0Om5vdChbZGlzYWJsZWRdKSwgc2VsZWN0Om5vdChbZGlzYWJsZWRdKSwgdGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pLCBidXR0b246bm90KFtkaXNhYmxlZF0pLCBpZnJhbWUsIG9iamVjdCwgZW1iZWQsICpbdGFiaW5kZXhdLCAqW2NvbnRlbnRlZGl0YWJsZV0nKS5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISQodGhpcykuaXMoJzp2aXNpYmxlJykgfHwgJCh0aGlzKS5hdHRyKCd0YWJpbmRleCcpIDwgMCkgeyByZXR1cm4gZmFsc2U7IH0gLy9vbmx5IGhhdmUgdmlzaWJsZSBlbGVtZW50cyBhbmQgdGhvc2UgdGhhdCBoYXZlIGEgdGFiaW5kZXggZ3JlYXRlciBvciBlcXVhbCAwXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY29tcG9uZW50IG5hbWUgbmFtZVxuICAgKiBAcGFyYW0ge09iamVjdH0gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQsIGUuZy4gU2xpZGVyIG9yIFJldmVhbFxuICAgKiBAcmV0dXJuIFN0cmluZyBjb21wb25lbnROYW1lXG4gICAqL1xuXG4gIHJlZ2lzdGVyKGNvbXBvbmVudE5hbWUsIGNtZHMpIHtcbiAgICBjb21tYW5kc1tjb21wb25lbnROYW1lXSA9IGNtZHM7XG4gIH0sICBcblxuICAvKipcbiAgICogVHJhcHMgdGhlIGZvY3VzIGluIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKiBAcGFyYW0gIHtqUXVlcnl9ICRlbGVtZW50ICBqUXVlcnkgb2JqZWN0IHRvIHRyYXAgdGhlIGZvdWNzIGludG8uXG4gICAqL1xuICB0cmFwRm9jdXMoJGVsZW1lbnQpIHtcbiAgICB2YXIgJGZvY3VzYWJsZSA9IEZvdW5kYXRpb24uS2V5Ym9hcmQuZmluZEZvY3VzYWJsZSgkZWxlbWVudCksXG4gICAgICAgICRmaXJzdEZvY3VzYWJsZSA9ICRmb2N1c2FibGUuZXEoMCksXG4gICAgICAgICRsYXN0Rm9jdXNhYmxlID0gJGZvY3VzYWJsZS5lcSgtMSk7XG5cbiAgICAkZWxlbWVudC5vbigna2V5ZG93bi56Zi50cmFwZm9jdXMnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGxhc3RGb2N1c2FibGVbMF0gJiYgRm91bmRhdGlvbi5LZXlib2FyZC5wYXJzZUtleShldmVudCkgPT09ICdUQUInKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICRmaXJzdEZvY3VzYWJsZS5mb2N1cygpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoZXZlbnQudGFyZ2V0ID09PSAkZmlyc3RGb2N1c2FibGVbMF0gJiYgRm91bmRhdGlvbi5LZXlib2FyZC5wYXJzZUtleShldmVudCkgPT09ICdTSElGVF9UQUInKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICRsYXN0Rm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIC8qKlxuICAgKiBSZWxlYXNlcyB0aGUgdHJhcHBlZCBmb2N1cyBmcm9tIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKiBAcGFyYW0gIHtqUXVlcnl9ICRlbGVtZW50ICBqUXVlcnkgb2JqZWN0IHRvIHJlbGVhc2UgdGhlIGZvY3VzIGZvci5cbiAgICovXG4gIHJlbGVhc2VGb2N1cygkZWxlbWVudCkge1xuICAgICRlbGVtZW50Lm9mZigna2V5ZG93bi56Zi50cmFwZm9jdXMnKTtcbiAgfVxufVxuXG4vKlxuICogQ29uc3RhbnRzIGZvciBlYXNpZXIgY29tcGFyaW5nLlxuICogQ2FuIGJlIHVzZWQgbGlrZSBGb3VuZGF0aW9uLnBhcnNlS2V5KGV2ZW50KSA9PT0gRm91bmRhdGlvbi5rZXlzLlNQQUNFXG4gKi9cbmZ1bmN0aW9uIGdldEtleUNvZGVzKGtjcykge1xuICB2YXIgayA9IHt9O1xuICBmb3IgKHZhciBrYyBpbiBrY3MpIGtba2NzW2tjXV0gPSBrY3Nba2NdO1xuICByZXR1cm4gaztcbn1cblxuRm91bmRhdGlvbi5LZXlib2FyZCA9IEtleWJvYXJkO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8vIERlZmF1bHQgc2V0IG9mIG1lZGlhIHF1ZXJpZXNcbmNvbnN0IGRlZmF1bHRRdWVyaWVzID0ge1xuICAnZGVmYXVsdCcgOiAnb25seSBzY3JlZW4nLFxuICBsYW5kc2NhcGUgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gIHBvcnRyYWl0IDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IHBvcnRyYWl0KScsXG4gIHJldGluYSA6ICdvbmx5IHNjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxOTJkcGkpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG59O1xuXG52YXIgTWVkaWFRdWVyeSA9IHtcbiAgcXVlcmllczogW10sXG5cbiAgY3VycmVudDogJycsXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtZWRpYSBxdWVyeSBoZWxwZXIsIGJ5IGV4dHJhY3RpbmcgdGhlIGJyZWFrcG9pbnQgbGlzdCBmcm9tIHRoZSBDU1MgYW5kIGFjdGl2YXRpbmcgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlci5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGV4dHJhY3RlZFN0eWxlcyA9ICQoJy5mb3VuZGF0aW9uLW1xJykuY3NzKCdmb250LWZhbWlseScpO1xuICAgIHZhciBuYW1lZFF1ZXJpZXM7XG5cbiAgICBuYW1lZFF1ZXJpZXMgPSBwYXJzZVN0eWxlVG9PYmplY3QoZXh0cmFjdGVkU3R5bGVzKTtcblxuICAgIGZvciAodmFyIGtleSBpbiBuYW1lZFF1ZXJpZXMpIHtcbiAgICAgIGlmKG5hbWVkUXVlcmllcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHNlbGYucXVlcmllcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgICAgdmFsdWU6IGBvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogJHtuYW1lZFF1ZXJpZXNba2V5XX0pYFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xuXG4gICAgdGhpcy5fd2F0Y2hlcigpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHNjcmVlbiBpcyBhdCBsZWFzdCBhcyB3aWRlIGFzIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjay5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0J3Mgc21hbGxlci5cbiAgICovXG4gIGF0TGVhc3Qoc2l6ZSkge1xuICAgIHZhciBxdWVyeSA9IHRoaXMuZ2V0KHNpemUpO1xuXG4gICAgaWYgKHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEocXVlcnkpLm1hdGNoZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHNjcmVlbiBtYXRjaGVzIHRvIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjaywgZWl0aGVyICdzbWFsbCBvbmx5JyBvciAnc21hbGwnLiBPbWl0dGluZyAnb25seScgZmFsbHMgYmFjayB0byB1c2luZyBhdExlYXN0KCkgbWV0aG9kLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQgZG9lcyBub3QuXG4gICAqL1xuICBpcyhzaXplKSB7XG4gICAgc2l6ZSA9IHNpemUudHJpbSgpLnNwbGl0KCcgJyk7XG4gICAgaWYoc2l6ZS5sZW5ndGggPiAxICYmIHNpemVbMV0gPT09ICdvbmx5Jykge1xuICAgICAgaWYoc2l6ZVswXSA9PT0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKSkgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmF0TGVhc3Qoc2l6ZVswXSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgbWVkaWEgcXVlcnkgb2YgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGdldC5cbiAgICogQHJldHVybnMge1N0cmluZ3xudWxsfSAtIFRoZSBtZWRpYSBxdWVyeSBvZiB0aGUgYnJlYWtwb2ludCwgb3IgYG51bGxgIGlmIHRoZSBicmVha3BvaW50IGRvZXNuJ3QgZXhpc3QuXG4gICAqL1xuICBnZXQoc2l6ZSkge1xuICAgIGZvciAodmFyIGkgaW4gdGhpcy5xdWVyaWVzKSB7XG4gICAgICBpZih0aGlzLnF1ZXJpZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgICBpZiAoc2l6ZSA9PT0gcXVlcnkubmFtZSkgcmV0dXJuIHF1ZXJ5LnZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQgbmFtZSBieSB0ZXN0aW5nIGV2ZXJ5IGJyZWFrcG9pbnQgYW5kIHJldHVybmluZyB0aGUgbGFzdCBvbmUgdG8gbWF0Y2ggKHRoZSBiaWdnZXN0IG9uZSkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBOYW1lIG9mIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQuXG4gICAqL1xuICBfZ2V0Q3VycmVudFNpemUoKSB7XG4gICAgdmFyIG1hdGNoZWQ7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuXG4gICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEocXVlcnkudmFsdWUpLm1hdGNoZXMpIHtcbiAgICAgICAgbWF0Y2hlZCA9IHF1ZXJ5O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbWF0Y2hlZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBtYXRjaGVkLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBtYXRjaGVkO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQWN0aXZhdGVzIHRoZSBicmVha3BvaW50IHdhdGNoZXIsIHdoaWNoIGZpcmVzIGFuIGV2ZW50IG9uIHRoZSB3aW5kb3cgd2hlbmV2ZXIgdGhlIGJyZWFrcG9pbnQgY2hhbmdlcy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfd2F0Y2hlcigpIHtcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5tZWRpYXF1ZXJ5JywgKCkgPT4ge1xuICAgICAgdmFyIG5ld1NpemUgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpLCBjdXJyZW50U2l6ZSA9IHRoaXMuY3VycmVudDtcblxuICAgICAgaWYgKG5ld1NpemUgIT09IGN1cnJlbnRTaXplKSB7XG4gICAgICAgIC8vIENoYW5nZSB0aGUgY3VycmVudCBtZWRpYSBxdWVyeVxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBuZXdTaXplO1xuXG4gICAgICAgIC8vIEJyb2FkY2FzdCB0aGUgbWVkaWEgcXVlcnkgY2hhbmdlIG9uIHRoZSB3aW5kb3dcbiAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIFtuZXdTaXplLCBjdXJyZW50U2l6ZV0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5Gb3VuZGF0aW9uLk1lZGlhUXVlcnkgPSBNZWRpYVF1ZXJ5O1xuXG4vLyBtYXRjaE1lZGlhKCkgcG9seWZpbGwgLSBUZXN0IGEgQ1NTIG1lZGlhIHR5cGUvcXVlcnkgaW4gSlMuXG4vLyBBdXRob3JzICYgY29weXJpZ2h0IChjKSAyMDEyOiBTY290dCBKZWhsLCBQYXVsIElyaXNoLCBOaWNob2xhcyBaYWthcywgRGF2aWQgS25pZ2h0LiBEdWFsIE1JVC9CU0QgbGljZW5zZVxud2luZG93Lm1hdGNoTWVkaWEgfHwgKHdpbmRvdy5tYXRjaE1lZGlhID0gZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBGb3IgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IG1hdGNoTWVkaXVtIGFwaSBzdWNoIGFzIElFIDkgYW5kIHdlYmtpdFxuICB2YXIgc3R5bGVNZWRpYSA9ICh3aW5kb3cuc3R5bGVNZWRpYSB8fCB3aW5kb3cubWVkaWEpO1xuXG4gIC8vIEZvciB0aG9zZSB0aGF0IGRvbid0IHN1cHBvcnQgbWF0Y2hNZWRpdW1cbiAgaWYgKCFzdHlsZU1lZGlhKSB7XG4gICAgdmFyIHN0eWxlICAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpLFxuICAgIHNjcmlwdCAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdLFxuICAgIGluZm8gICAgICAgID0gbnVsbDtcblxuICAgIHN0eWxlLnR5cGUgID0gJ3RleHQvY3NzJztcbiAgICBzdHlsZS5pZCAgICA9ICdtYXRjaG1lZGlhanMtdGVzdCc7XG5cbiAgICBzY3JpcHQgJiYgc2NyaXB0LnBhcmVudE5vZGUgJiYgc2NyaXB0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHN0eWxlLCBzY3JpcHQpO1xuXG4gICAgLy8gJ3N0eWxlLmN1cnJlbnRTdHlsZScgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnd2luZG93LmdldENvbXB1dGVkU3R5bGUnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICBpbmZvID0gKCdnZXRDb21wdXRlZFN0eWxlJyBpbiB3aW5kb3cpICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHN0eWxlLCBudWxsKSB8fCBzdHlsZS5jdXJyZW50U3R5bGU7XG5cbiAgICBzdHlsZU1lZGlhID0ge1xuICAgICAgbWF0Y2hNZWRpdW0obWVkaWEpIHtcbiAgICAgICAgdmFyIHRleHQgPSBgQG1lZGlhICR7bWVkaWF9eyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH1gO1xuXG4gICAgICAgIC8vICdzdHlsZS5zdHlsZVNoZWV0JyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICdzdHlsZS50ZXh0Q29udGVudCcgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGVzdCBpZiBtZWRpYSBxdWVyeSBpcyB0cnVlIG9yIGZhbHNlXG4gICAgICAgIHJldHVybiBpbmZvLndpZHRoID09PSAnMXB4JztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24obWVkaWEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hlczogc3R5bGVNZWRpYS5tYXRjaE1lZGl1bShtZWRpYSB8fCAnYWxsJyksXG4gICAgICBtZWRpYTogbWVkaWEgfHwgJ2FsbCdcbiAgICB9O1xuICB9XG59KCkpO1xuXG4vLyBUaGFuayB5b3U6IGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvcXVlcnktc3RyaW5nXG5mdW5jdGlvbiBwYXJzZVN0eWxlVG9PYmplY3Qoc3RyKSB7XG4gIHZhciBzdHlsZU9iamVjdCA9IHt9O1xuXG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0ciA9IHN0ci50cmltKCkuc2xpY2UoMSwgLTEpOyAvLyBicm93c2VycyByZS1xdW90ZSBzdHJpbmcgc3R5bGUgdmFsdWVzXG5cbiAgaWYgKCFzdHIpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHlsZU9iamVjdCA9IHN0ci5zcGxpdCgnJicpLnJlZHVjZShmdW5jdGlvbihyZXQsIHBhcmFtKSB7XG4gICAgdmFyIHBhcnRzID0gcGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykuc3BsaXQoJz0nKTtcbiAgICB2YXIga2V5ID0gcGFydHNbMF07XG4gICAgdmFyIHZhbCA9IHBhcnRzWzFdO1xuICAgIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChrZXkpO1xuXG4gICAgLy8gbWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcbiAgICAvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG4gICAgdmFsID0gdmFsID09PSB1bmRlZmluZWQgPyBudWxsIDogZGVjb2RlVVJJQ29tcG9uZW50KHZhbCk7XG5cbiAgICBpZiAoIXJldC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXRba2V5XSA9IHZhbDtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmV0W2tleV0pKSB7XG4gICAgICByZXRba2V5XS5wdXNoKHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldFtrZXldID0gW3JldFtrZXldLCB2YWxdO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9LCB7fSk7XG5cbiAgcmV0dXJuIHN0eWxlT2JqZWN0O1xufVxuXG5Gb3VuZGF0aW9uLk1lZGlhUXVlcnkgPSBNZWRpYVF1ZXJ5O1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogTW90aW9uIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5tb3Rpb25cbiAqL1xuXG5jb25zdCBpbml0Q2xhc3NlcyAgID0gWydtdWktZW50ZXInLCAnbXVpLWxlYXZlJ107XG5jb25zdCBhY3RpdmVDbGFzc2VzID0gWydtdWktZW50ZXItYWN0aXZlJywgJ211aS1sZWF2ZS1hY3RpdmUnXTtcblxuY29uc3QgTW90aW9uID0ge1xuICBhbmltYXRlSW46IGZ1bmN0aW9uKGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICBhbmltYXRlKHRydWUsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICB9LFxuXG4gIGFuaW1hdGVPdXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICBhbmltYXRlKGZhbHNlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNb3ZlKGR1cmF0aW9uLCBlbGVtLCBmbil7XG4gIHZhciBhbmltLCBwcm9nLCBzdGFydCA9IG51bGw7XG4gIC8vIGNvbnNvbGUubG9nKCdjYWxsZWQnKTtcblxuICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICBmbi5hcHBseShlbGVtKTtcbiAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBtb3ZlKHRzKXtcbiAgICBpZighc3RhcnQpIHN0YXJ0ID0gdHM7XG4gICAgLy8gY29uc29sZS5sb2coc3RhcnQsIHRzKTtcbiAgICBwcm9nID0gdHMgLSBzdGFydDtcbiAgICBmbi5hcHBseShlbGVtKTtcblxuICAgIGlmKHByb2cgPCBkdXJhdGlvbil7IGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUsIGVsZW0pOyB9XG4gICAgZWxzZXtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShhbmltKTtcbiAgICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xuICAgIH1cbiAgfVxuICBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlKTtcbn1cblxuLyoqXG4gKiBBbmltYXRlcyBhbiBlbGVtZW50IGluIG9yIG91dCB1c2luZyBhIENTUyB0cmFuc2l0aW9uIGNsYXNzLlxuICogQGZ1bmN0aW9uXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtCb29sZWFufSBpc0luIC0gRGVmaW5lcyBpZiB0aGUgYW5pbWF0aW9uIGlzIGluIG9yIG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9yIEhUTUwgb2JqZWN0IHRvIGFuaW1hdGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gYW5pbWF0aW9uIC0gQ1NTIGNsYXNzIHRvIHVzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gQ2FsbGJhY2sgdG8gcnVuIHdoZW4gYW5pbWF0aW9uIGlzIGZpbmlzaGVkLlxuICovXG5mdW5jdGlvbiBhbmltYXRlKGlzSW4sIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgZWxlbWVudCA9ICQoZWxlbWVudCkuZXEoMCk7XG5cbiAgaWYgKCFlbGVtZW50Lmxlbmd0aCkgcmV0dXJuO1xuXG4gIHZhciBpbml0Q2xhc3MgPSBpc0luID8gaW5pdENsYXNzZXNbMF0gOiBpbml0Q2xhc3Nlc1sxXTtcbiAgdmFyIGFjdGl2ZUNsYXNzID0gaXNJbiA/IGFjdGl2ZUNsYXNzZXNbMF0gOiBhY3RpdmVDbGFzc2VzWzFdO1xuXG4gIC8vIFNldCB1cCB0aGUgYW5pbWF0aW9uXG4gIHJlc2V0KCk7XG5cbiAgZWxlbWVudFxuICAgIC5hZGRDbGFzcyhhbmltYXRpb24pXG4gICAgLmNzcygndHJhbnNpdGlvbicsICdub25lJyk7XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBlbGVtZW50LmFkZENsYXNzKGluaXRDbGFzcyk7XG4gICAgaWYgKGlzSW4pIGVsZW1lbnQuc2hvdygpO1xuICB9KTtcblxuICAvLyBTdGFydCB0aGUgYW5pbWF0aW9uXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgZWxlbWVudFswXS5vZmZzZXRXaWR0aDtcbiAgICBlbGVtZW50XG4gICAgICAuY3NzKCd0cmFuc2l0aW9uJywgJycpXG4gICAgICAuYWRkQ2xhc3MoYWN0aXZlQ2xhc3MpO1xuICB9KTtcblxuICAvLyBDbGVhbiB1cCB0aGUgYW5pbWF0aW9uIHdoZW4gaXQgZmluaXNoZXNcbiAgZWxlbWVudC5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKGVsZW1lbnQpLCBmaW5pc2gpO1xuXG4gIC8vIEhpZGVzIHRoZSBlbGVtZW50IChmb3Igb3V0IGFuaW1hdGlvbnMpLCByZXNldHMgdGhlIGVsZW1lbnQsIGFuZCBydW5zIGEgY2FsbGJhY2tcbiAgZnVuY3Rpb24gZmluaXNoKCkge1xuICAgIGlmICghaXNJbikgZWxlbWVudC5oaWRlKCk7XG4gICAgcmVzZXQoKTtcbiAgICBpZiAoY2IpIGNiLmFwcGx5KGVsZW1lbnQpO1xuICB9XG5cbiAgLy8gUmVzZXRzIHRyYW5zaXRpb25zIGFuZCByZW1vdmVzIG1vdGlvbi1zcGVjaWZpYyBjbGFzc2VzXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGVsZW1lbnRbMF0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gMDtcbiAgICBlbGVtZW50LnJlbW92ZUNsYXNzKGAke2luaXRDbGFzc30gJHthY3RpdmVDbGFzc30gJHthbmltYXRpb259YCk7XG4gIH1cbn1cblxuRm91bmRhdGlvbi5Nb3ZlID0gTW92ZTtcbkZvdW5kYXRpb24uTW90aW9uID0gTW90aW9uO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IE5lc3QgPSB7XG4gIEZlYXRoZXIobWVudSwgdHlwZSA9ICd6ZicpIHtcbiAgICBtZW51LmF0dHIoJ3JvbGUnLCAnbWVudWJhcicpO1xuXG4gICAgdmFyIGl0ZW1zID0gbWVudS5maW5kKCdsaScpLmF0dHIoeydyb2xlJzogJ21lbnVpdGVtJ30pLFxuICAgICAgICBzdWJNZW51Q2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51YCxcbiAgICAgICAgc3ViSXRlbUNsYXNzID0gYCR7c3ViTWVudUNsYXNzfS1pdGVtYCxcbiAgICAgICAgaGFzU3ViQ2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51LXBhcmVudGA7XG5cbiAgICBpdGVtcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRpdGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAkc3ViID0gJGl0ZW0uY2hpbGRyZW4oJ3VsJyk7XG5cbiAgICAgIGlmICgkc3ViLmxlbmd0aCkge1xuICAgICAgICAkaXRlbVxuICAgICAgICAgIC5hZGRDbGFzcyhoYXNTdWJDbGFzcylcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oYXNwb3B1cCc6IHRydWUsXG4gICAgICAgICAgICAnYXJpYS1sYWJlbCc6ICRpdGVtLmNoaWxkcmVuKCdhOmZpcnN0JykudGV4dCgpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gTm90ZTogIERyaWxsZG93bnMgYmVoYXZlIGRpZmZlcmVudGx5IGluIGhvdyB0aGV5IGhpZGUsIGFuZCBzbyBuZWVkXG4gICAgICAgICAgLy8gYWRkaXRpb25hbCBhdHRyaWJ1dGVzLiAgV2Ugc2hvdWxkIGxvb2sgaWYgdGhpcyBwb3NzaWJseSBvdmVyLWdlbmVyYWxpemVkXG4gICAgICAgICAgLy8gdXRpbGl0eSAoTmVzdCkgaXMgYXBwcm9wcmlhdGUgd2hlbiB3ZSByZXdvcmsgbWVudXMgaW4gNi40XG4gICAgICAgICAgaWYodHlwZSA9PT0gJ2RyaWxsZG93bicpIHtcbiAgICAgICAgICAgICRpdGVtLmF0dHIoeydhcmlhLWV4cGFuZGVkJzogZmFsc2V9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgJHN1YlxuICAgICAgICAgIC5hZGRDbGFzcyhgc3VibWVudSAke3N1Yk1lbnVDbGFzc31gKVxuICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICdkYXRhLXN1Ym1lbnUnOiAnJyxcbiAgICAgICAgICAgICdyb2xlJzogJ21lbnUnXG4gICAgICAgICAgfSk7XG4gICAgICAgIGlmKHR5cGUgPT09ICdkcmlsbGRvd24nKSB7XG4gICAgICAgICAgJHN1Yi5hdHRyKHsnYXJpYS1oaWRkZW4nOiB0cnVlfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpIHtcbiAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoYGlzLXN1Ym1lbnUtaXRlbSAke3N1Ykl0ZW1DbGFzc31gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybjtcbiAgfSxcblxuICBCdXJuKG1lbnUsIHR5cGUpIHtcbiAgICB2YXIgLy9pdGVtcyA9IG1lbnUuZmluZCgnbGknKSxcbiAgICAgICAgc3ViTWVudUNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudWAsXG4gICAgICAgIHN1Ykl0ZW1DbGFzcyA9IGAke3N1Yk1lbnVDbGFzc30taXRlbWAsXG4gICAgICAgIGhhc1N1YkNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudS1wYXJlbnRgO1xuXG4gICAgbWVudVxuICAgICAgLmZpbmQoJz5saSwgLm1lbnUsIC5tZW51ID4gbGknKVxuICAgICAgLnJlbW92ZUNsYXNzKGAke3N1Yk1lbnVDbGFzc30gJHtzdWJJdGVtQ2xhc3N9ICR7aGFzU3ViQ2xhc3N9IGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51IGlzLWFjdGl2ZWApXG4gICAgICAucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykuY3NzKCdkaXNwbGF5JywgJycpO1xuXG4gICAgLy8gY29uc29sZS5sb2coICAgICAgbWVudS5maW5kKCcuJyArIHN1Yk1lbnVDbGFzcyArICcsIC4nICsgc3ViSXRlbUNsYXNzICsgJywgLmhhcy1zdWJtZW51LCAuaXMtc3VibWVudS1pdGVtLCAuc3VibWVudSwgW2RhdGEtc3VibWVudV0nKVxuICAgIC8vICAgICAgICAgICAucmVtb3ZlQ2xhc3Moc3ViTWVudUNsYXNzICsgJyAnICsgc3ViSXRlbUNsYXNzICsgJyBoYXMtc3VibWVudSBpcy1zdWJtZW51LWl0ZW0gc3VibWVudScpXG4gICAgLy8gICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKSk7XG4gICAgLy8gaXRlbXMuZWFjaChmdW5jdGlvbigpe1xuICAgIC8vICAgdmFyICRpdGVtID0gJCh0aGlzKSxcbiAgICAvLyAgICAgICAkc3ViID0gJGl0ZW0uY2hpbGRyZW4oJ3VsJyk7XG4gICAgLy8gICBpZigkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKXtcbiAgICAvLyAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ2lzLXN1Ym1lbnUtaXRlbSAnICsgc3ViSXRlbUNsYXNzKTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIGlmKCRzdWIubGVuZ3RoKXtcbiAgICAvLyAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ2hhcy1zdWJtZW51Jyk7XG4gICAgLy8gICAgICRzdWIucmVtb3ZlQ2xhc3MoJ3N1Ym1lbnUgJyArIHN1Yk1lbnVDbGFzcykucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51Jyk7XG4gICAgLy8gICB9XG4gICAgLy8gfSk7XG4gIH1cbn1cblxuRm91bmRhdGlvbi5OZXN0ID0gTmVzdDtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5mdW5jdGlvbiBUaW1lcihlbGVtLCBvcHRpb25zLCBjYikge1xuICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uLC8vb3B0aW9ucyBpcyBhbiBvYmplY3QgZm9yIGVhc2lseSBhZGRpbmcgZmVhdHVyZXMgbGF0ZXIuXG4gICAgICBuYW1lU3BhY2UgPSBPYmplY3Qua2V5cyhlbGVtLmRhdGEoKSlbMF0gfHwgJ3RpbWVyJyxcbiAgICAgIHJlbWFpbiA9IC0xLFxuICAgICAgc3RhcnQsXG4gICAgICB0aW1lcjtcblxuICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG5cbiAgdGhpcy5yZXN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmVtYWluID0gLTE7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH1cblxuICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuICAgIC8vIGlmKCFlbGVtLmRhdGEoJ3BhdXNlZCcpKXsgcmV0dXJuIGZhbHNlOyB9Ly9tYXliZSBpbXBsZW1lbnQgdGhpcyBzYW5pdHkgY2hlY2sgaWYgdXNlZCBmb3Igb3RoZXIgdGhpbmdzLlxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgcmVtYWluID0gcmVtYWluIDw9IDAgPyBkdXJhdGlvbiA6IHJlbWFpbjtcbiAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIGZhbHNlKTtcbiAgICBzdGFydCA9IERhdGUubm93KCk7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBpZihvcHRpb25zLmluZmluaXRlKXtcbiAgICAgICAgX3RoaXMucmVzdGFydCgpOy8vcmVydW4gdGhlIHRpbWVyLlxuICAgICAgfVxuICAgICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgeyBjYigpOyB9XG4gICAgfSwgcmVtYWluKTtcbiAgICBlbGVtLnRyaWdnZXIoYHRpbWVyc3RhcnQuemYuJHtuYW1lU3BhY2V9YCk7XG4gIH1cblxuICB0aGlzLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pc1BhdXNlZCA9IHRydWU7XG4gICAgLy9pZihlbGVtLmRhdGEoJ3BhdXNlZCcpKXsgcmV0dXJuIGZhbHNlOyB9Ly9tYXliZSBpbXBsZW1lbnQgdGhpcyBzYW5pdHkgY2hlY2sgaWYgdXNlZCBmb3Igb3RoZXIgdGhpbmdzLlxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgZWxlbS5kYXRhKCdwYXVzZWQnLCB0cnVlKTtcbiAgICB2YXIgZW5kID0gRGF0ZS5ub3coKTtcbiAgICByZW1haW4gPSByZW1haW4gLSAoZW5kIC0gc3RhcnQpO1xuICAgIGVsZW0udHJpZ2dlcihgdGltZXJwYXVzZWQuemYuJHtuYW1lU3BhY2V9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSdW5zIGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBpbWFnZXMgYXJlIGZ1bGx5IGxvYWRlZC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBpbWFnZXMgLSBJbWFnZShzKSB0byBjaGVjayBpZiBsb2FkZWQuXG4gKiBAcGFyYW0ge0Z1bmN9IGNhbGxiYWNrIC0gRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGltYWdlIGlzIGZ1bGx5IGxvYWRlZC5cbiAqL1xuZnVuY3Rpb24gb25JbWFnZXNMb2FkZWQoaW1hZ2VzLCBjYWxsYmFjayl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHVubG9hZGVkID0gaW1hZ2VzLmxlbmd0aDtcblxuICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICBjYWxsYmFjaygpO1xuICB9XG5cbiAgaW1hZ2VzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgLy8gQ2hlY2sgaWYgaW1hZ2UgaXMgbG9hZGVkXG4gICAgaWYgKHRoaXMuY29tcGxldGUgfHwgKHRoaXMucmVhZHlTdGF0ZSA9PT0gNCkgfHwgKHRoaXMucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykpIHtcbiAgICAgIHNpbmdsZUltYWdlTG9hZGVkKCk7XG4gICAgfVxuICAgIC8vIEZvcmNlIGxvYWQgdGhlIGltYWdlXG4gICAgZWxzZSB7XG4gICAgICAvLyBmaXggZm9yIElFLiBTZWUgaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9zbmlwcGV0cy9qcXVlcnkvZml4aW5nLWxvYWQtaW4taWUtZm9yLWNhY2hlZC1pbWFnZXMvXG4gICAgICB2YXIgc3JjID0gJCh0aGlzKS5hdHRyKCdzcmMnKTtcbiAgICAgICQodGhpcykuYXR0cignc3JjJywgc3JjICsgJz8nICsgKG5ldyBEYXRlKCkuZ2V0VGltZSgpKSk7XG4gICAgICAkKHRoaXMpLm9uZSgnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBzaW5nbGVJbWFnZUxvYWRlZCgpIHtcbiAgICB1bmxvYWRlZC0tO1xuICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cbn1cblxuRm91bmRhdGlvbi5UaW1lciA9IFRpbWVyO1xuRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCA9IG9uSW1hZ2VzTG9hZGVkO1xuXG59KGpRdWVyeSk7XG4iLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqV29yayBpbnNwaXJlZCBieSBtdWx0aXBsZSBqcXVlcnkgc3dpcGUgcGx1Z2lucyoqXG4vLyoqRG9uZSBieSBZb2hhaSBBcmFyYXQgKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4oZnVuY3Rpb24oJCkge1xuXG4gICQuc3BvdFN3aXBlID0ge1xuICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgZW5hYmxlZDogJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZSxcbiAgICBtb3ZlVGhyZXNob2xkOiA3NSxcbiAgICB0aW1lVGhyZXNob2xkOiAyMDBcbiAgfTtcblxuICB2YXIgICBzdGFydFBvc1gsXG4gICAgICAgIHN0YXJ0UG9zWSxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbGFwc2VkVGltZSxcbiAgICAgICAgaXNNb3ZpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xuICAgIC8vICBhbGVydCh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG4gICAgaXNNb3ZpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hNb3ZlKGUpIHtcbiAgICBpZiAoJC5zcG90U3dpcGUucHJldmVudERlZmF1bHQpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB9XG4gICAgaWYoaXNNb3ZpbmcpIHtcbiAgICAgIHZhciB4ID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgdmFyIHkgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICB2YXIgZHggPSBzdGFydFBvc1ggLSB4O1xuICAgICAgdmFyIGR5ID0gc3RhcnRQb3NZIC0geTtcbiAgICAgIHZhciBkaXI7XG4gICAgICBlbGFwc2VkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lO1xuICAgICAgaWYoTWF0aC5hYnMoZHgpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgICBkaXIgPSBkeCA+IDAgPyAnbGVmdCcgOiAncmlnaHQnO1xuICAgICAgfVxuICAgICAgLy8gZWxzZSBpZihNYXRoLmFicyhkeSkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG4gICAgICAvLyAgIGRpciA9IGR5ID4gMCA/ICdkb3duJyA6ICd1cCc7XG4gICAgICAvLyB9XG4gICAgICBpZihkaXIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvblRvdWNoRW5kLmNhbGwodGhpcyk7XG4gICAgICAgICQodGhpcykudHJpZ2dlcignc3dpcGUnLCBkaXIpLnRyaWdnZXIoYHN3aXBlJHtkaXJ9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGUpIHtcbiAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICBzdGFydFBvc1ggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICBzdGFydFBvc1kgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICBpc01vdmluZyA9IHRydWU7XG4gICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIgJiYgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG4gIH1cblxuICBmdW5jdGlvbiB0ZWFyZG93bigpIHtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQpO1xuICB9XG5cbiAgJC5ldmVudC5zcGVjaWFsLnN3aXBlID0geyBzZXR1cDogaW5pdCB9O1xuXG4gICQuZWFjaChbJ2xlZnQnLCAndXAnLCAnZG93bicsICdyaWdodCddLCBmdW5jdGlvbiAoKSB7XG4gICAgJC5ldmVudC5zcGVjaWFsW2Bzd2lwZSR7dGhpc31gXSA9IHsgc2V0dXA6IGZ1bmN0aW9uKCl7XG4gICAgICAkKHRoaXMpLm9uKCdzd2lwZScsICQubm9vcCk7XG4gICAgfSB9O1xuICB9KTtcbn0pKGpRdWVyeSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTWV0aG9kIGZvciBhZGRpbmcgcHN1ZWRvIGRyYWcgZXZlbnRzIHRvIGVsZW1lbnRzICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4hZnVuY3Rpb24oJCl7XG4gICQuZm4uYWRkVG91Y2ggPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLGVsKXtcbiAgICAgICQoZWwpLmJpbmQoJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJyxmdW5jdGlvbigpe1xuICAgICAgICAvL3dlIHBhc3MgdGhlIG9yaWdpbmFsIGV2ZW50IG9iamVjdCBiZWNhdXNlIHRoZSBqUXVlcnkgZXZlbnRcbiAgICAgICAgLy9vYmplY3QgaXMgbm9ybWFsaXplZCB0byB3M2Mgc3BlY3MgYW5kIGRvZXMgbm90IHByb3ZpZGUgdGhlIFRvdWNoTGlzdFxuICAgICAgICBoYW5kbGVUb3VjaChldmVudCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBoYW5kbGVUb3VjaCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIHZhciB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG4gICAgICAgICAgZmlyc3QgPSB0b3VjaGVzWzBdLFxuICAgICAgICAgIGV2ZW50VHlwZXMgPSB7XG4gICAgICAgICAgICB0b3VjaHN0YXJ0OiAnbW91c2Vkb3duJyxcbiAgICAgICAgICAgIHRvdWNobW92ZTogJ21vdXNlbW92ZScsXG4gICAgICAgICAgICB0b3VjaGVuZDogJ21vdXNldXAnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0eXBlID0gZXZlbnRUeXBlc1tldmVudC50eXBlXSxcbiAgICAgICAgICBzaW11bGF0ZWRFdmVudFxuICAgICAgICA7XG5cbiAgICAgIGlmKCdNb3VzZUV2ZW50JyBpbiB3aW5kb3cgJiYgdHlwZW9mIHdpbmRvdy5Nb3VzZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gbmV3IHdpbmRvdy5Nb3VzZUV2ZW50KHR5cGUsIHtcbiAgICAgICAgICAnYnViYmxlcyc6IHRydWUsXG4gICAgICAgICAgJ2NhbmNlbGFibGUnOiB0cnVlLFxuICAgICAgICAgICdzY3JlZW5YJzogZmlyc3Quc2NyZWVuWCxcbiAgICAgICAgICAnc2NyZWVuWSc6IGZpcnN0LnNjcmVlblksXG4gICAgICAgICAgJ2NsaWVudFgnOiBmaXJzdC5jbGllbnRYLFxuICAgICAgICAgICdjbGllbnRZJzogZmlyc3QuY2xpZW50WVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQuaW5pdE1vdXNlRXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCBmaXJzdC5zY3JlZW5YLCBmaXJzdC5zY3JlZW5ZLCBmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMC8qbGVmdCovLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGZpcnN0LnRhcmdldC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcbiAgICB9O1xuICB9O1xufShqUXVlcnkpO1xuXG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKkZyb20gdGhlIGpRdWVyeSBNb2JpbGUgTGlicmFyeSoqXG4vLyoqbmVlZCB0byByZWNyZWF0ZSBmdW5jdGlvbmFsaXR5Kipcbi8vKiphbmQgdHJ5IHRvIGltcHJvdmUgaWYgcG9zc2libGUqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbi8qIFJlbW92aW5nIHRoZSBqUXVlcnkgZnVuY3Rpb24gKioqKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbihmdW5jdGlvbiggJCwgd2luZG93LCB1bmRlZmluZWQgKSB7XG5cblx0dmFyICRkb2N1bWVudCA9ICQoIGRvY3VtZW50ICksXG5cdFx0Ly8gc3VwcG9ydFRvdWNoID0gJC5tb2JpbGUuc3VwcG9ydC50b3VjaCxcblx0XHR0b3VjaFN0YXJ0RXZlbnQgPSAndG91Y2hzdGFydCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hzdGFydFwiIDogXCJtb3VzZWRvd25cIixcblx0XHR0b3VjaFN0b3BFdmVudCA9ICd0b3VjaGVuZCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hlbmRcIiA6IFwibW91c2V1cFwiLFxuXHRcdHRvdWNoTW92ZUV2ZW50ID0gJ3RvdWNobW92ZScvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2htb3ZlXCIgOiBcIm1vdXNlbW92ZVwiO1xuXG5cdC8vIHNldHVwIG5ldyBldmVudCBzaG9ydGN1dHNcblx0JC5lYWNoKCAoIFwidG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgXCIgK1xuXHRcdFwic3dpcGUgc3dpcGVsZWZ0IHN3aXBlcmlnaHRcIiApLnNwbGl0KCBcIiBcIiApLCBmdW5jdGlvbiggaSwgbmFtZSApIHtcblxuXHRcdCQuZm5bIG5hbWUgXSA9IGZ1bmN0aW9uKCBmbiApIHtcblx0XHRcdHJldHVybiBmbiA/IHRoaXMuYmluZCggbmFtZSwgZm4gKSA6IHRoaXMudHJpZ2dlciggbmFtZSApO1xuXHRcdH07XG5cblx0XHQvLyBqUXVlcnkgPCAxLjhcblx0XHRpZiAoICQuYXR0ckZuICkge1xuXHRcdFx0JC5hdHRyRm5bIG5hbWUgXSA9IHRydWU7XG5cdFx0fVxuXHR9KTtcblxuXHRmdW5jdGlvbiB0cmlnZ2VyQ3VzdG9tRXZlbnQoIG9iaiwgZXZlbnRUeXBlLCBldmVudCwgYnViYmxlICkge1xuXHRcdHZhciBvcmlnaW5hbFR5cGUgPSBldmVudC50eXBlO1xuXHRcdGV2ZW50LnR5cGUgPSBldmVudFR5cGU7XG5cdFx0aWYgKCBidWJibGUgKSB7XG5cdFx0XHQkLmV2ZW50LnRyaWdnZXIoIGV2ZW50LCB1bmRlZmluZWQsIG9iaiApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkLmV2ZW50LmRpc3BhdGNoLmNhbGwoIG9iaiwgZXZlbnQgKTtcblx0XHR9XG5cdFx0ZXZlbnQudHlwZSA9IG9yaWdpbmFsVHlwZTtcblx0fVxuXG5cdC8vIGFsc28gaGFuZGxlcyB0YXBob2xkXG5cblx0Ly8gQWxzbyBoYW5kbGVzIHN3aXBlbGVmdCwgc3dpcGVyaWdodFxuXHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7XG5cblx0XHQvLyBNb3JlIHRoYW4gdGhpcyBob3Jpem9udGFsIGRpc3BsYWNlbWVudCwgYW5kIHdlIHdpbGwgc3VwcHJlc3Mgc2Nyb2xsaW5nLlxuXHRcdHNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQ6IDMwLFxuXG5cdFx0Ly8gTW9yZSB0aW1lIHRoYW4gdGhpcywgYW5kIGl0IGlzbid0IGEgc3dpcGUuXG5cdFx0ZHVyYXRpb25UaHJlc2hvbGQ6IDEwMDAsXG5cblx0XHQvLyBTd2lwZSBob3Jpem9udGFsIGRpc3BsYWNlbWVudCBtdXN0IGJlIG1vcmUgdGhhbiB0aGlzLlxuXHRcdGhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHQvLyBTd2lwZSB2ZXJ0aWNhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBsZXNzIHRoYW4gdGhpcy5cblx0XHR2ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcblxuXHRcdGdldExvY2F0aW9uOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0dmFyIHdpblBhZ2VYID0gd2luZG93LnBhZ2VYT2Zmc2V0LFxuXHRcdFx0XHR3aW5QYWdlWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcblx0XHRcdFx0eCA9IGV2ZW50LmNsaWVudFgsXG5cdFx0XHRcdHkgPSBldmVudC5jbGllbnRZO1xuXG5cdFx0XHRpZiAoIGV2ZW50LnBhZ2VZID09PSAwICYmIE1hdGguZmxvb3IoIHkgKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VZICkgfHxcblx0XHRcdFx0ZXZlbnQucGFnZVggPT09IDAgJiYgTWF0aC5mbG9vciggeCApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBpT1M0IGNsaWVudFgvY2xpZW50WSBoYXZlIHRoZSB2YWx1ZSB0aGF0IHNob3VsZCBoYXZlIGJlZW5cblx0XHRcdFx0Ly8gaW4gcGFnZVgvcGFnZVkuIFdoaWxlIHBhZ2VYL3BhZ2UvIGhhdmUgdGhlIHZhbHVlIDBcblx0XHRcdFx0eCA9IHggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IHkgLSB3aW5QYWdlWTtcblx0XHRcdH0gZWxzZSBpZiAoIHkgPCAoIGV2ZW50LnBhZ2VZIC0gd2luUGFnZVkpIHx8IHggPCAoIGV2ZW50LnBhZ2VYIC0gd2luUGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBTb21lIEFuZHJvaWQgYnJvd3NlcnMgaGF2ZSB0b3RhbGx5IGJvZ3VzIHZhbHVlcyBmb3IgY2xpZW50WC9ZXG5cdFx0XHRcdC8vIHdoZW4gc2Nyb2xsaW5nL3pvb21pbmcgYSBwYWdlLiBEZXRlY3RhYmxlIHNpbmNlIGNsaWVudFgvY2xpZW50WVxuXHRcdFx0XHQvLyBzaG91bGQgbmV2ZXIgYmUgc21hbGxlciB0aGFuIHBhZ2VYL3BhZ2VZIG1pbnVzIHBhZ2Ugc2Nyb2xsXG5cdFx0XHRcdHggPSBldmVudC5wYWdlWCAtIHdpblBhZ2VYO1xuXHRcdFx0XHR5ID0gZXZlbnQucGFnZVkgLSB3aW5QYWdlWTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDogeCxcblx0XHRcdFx0eTogeVxuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF0sXG5cdFx0XHRcdFx0XHRvcmlnaW46ICQoIGV2ZW50LnRhcmdldCApXG5cdFx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RvcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xuXHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1sgMCBdIDogZXZlbnQsXG5cdFx0XHRcdGxvY2F0aW9uID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmdldExvY2F0aW9uKCBkYXRhICk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGltZTogKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpLFxuXHRcdFx0XHRcdFx0Y29vcmRzOiBbIGxvY2F0aW9uLngsIGxvY2F0aW9uLnkgXVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdGhhbmRsZVN3aXBlOiBmdW5jdGlvbiggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKSB7XG5cdFx0XHRpZiAoIHN0b3AudGltZSAtIHN0YXJ0LnRpbWUgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZHVyYXRpb25UaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZCAmJlxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAxIF0gLSBzdG9wLmNvb3Jkc1sgMSBdICkgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUudmVydGljYWxEaXN0YW5jZVRocmVzaG9sZCApIHtcblx0XHRcdFx0dmFyIGRpcmVjdGlvbiA9IHN0YXJ0LmNvb3Jkc1swXSA+IHN0b3AuY29vcmRzWyAwIF0gPyBcInN3aXBlbGVmdFwiIDogXCJzd2lwZXJpZ2h0XCI7XG5cblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBcInN3aXBlXCIsICQuRXZlbnQoIFwic3dpcGVcIiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSksIHRydWUgKTtcblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBkaXJlY3Rpb24sJC5FdmVudCggZGlyZWN0aW9uLCB7IHRhcmdldDogb3JpZ1RhcmdldCwgc3dpcGVzdGFydDogc3RhcnQsIHN3aXBlc3RvcDogc3RvcCB9ICksIHRydWUgKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9LFxuXG5cdFx0Ly8gVGhpcyBzZXJ2ZXMgYXMgYSBmbGFnIHRvIGVuc3VyZSB0aGF0IGF0IG1vc3Qgb25lIHN3aXBlIGV2ZW50IGV2ZW50IGlzXG5cdFx0Ly8gaW4gd29yayBhdCBhbnkgZ2l2ZW4gdGltZVxuXHRcdGV2ZW50SW5Qcm9ncmVzczogZmFsc2UsXG5cblx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZXZlbnRzLFxuXHRcdFx0XHR0aGlzT2JqZWN0ID0gdGhpcyxcblx0XHRcdFx0JHRoaXMgPSAkKCB0aGlzT2JqZWN0ICksXG5cdFx0XHRcdGNvbnRleHQgPSB7fTtcblxuXHRcdFx0Ly8gUmV0cmlldmUgdGhlIGV2ZW50cyBkYXRhIGZvciB0aGlzIGVsZW1lbnQgYW5kIGFkZCB0aGUgc3dpcGUgY29udGV4dFxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCAhZXZlbnRzICkge1xuXHRcdFx0XHRldmVudHMgPSB7IGxlbmd0aDogMCB9O1xuXHRcdFx0XHQkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiLCBldmVudHMgKTtcblx0XHRcdH1cblx0XHRcdGV2ZW50cy5sZW5ndGgrKztcblx0XHRcdGV2ZW50cy5zd2lwZSA9IGNvbnRleHQ7XG5cblx0XHRcdGNvbnRleHQuc3RhcnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHRcdFx0Ly8gQmFpbCBpZiB3ZSdyZSBhbHJlYWR5IHdvcmtpbmcgb24gYSBzd2lwZSBldmVudFxuXHRcdFx0XHRpZiAoICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSB0cnVlO1xuXG5cdFx0XHRcdHZhciBzdG9wLFxuXHRcdFx0XHRcdHN0YXJ0ID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0YXJ0KCBldmVudCApLFxuXHRcdFx0XHRcdG9yaWdUYXJnZXQgPSBldmVudC50YXJnZXQsXG5cdFx0XHRcdFx0ZW1pdHRlZCA9IGZhbHNlO1xuXG5cdFx0XHRcdGNvbnRleHQubW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRpZiAoICFzdGFydCB8fCBldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSApIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzdG9wID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0b3AoIGV2ZW50ICk7XG5cdFx0XHRcdFx0aWYgKCAhZW1pdHRlZCApIHtcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuaGFuZGxlU3dpcGUoIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICk7XG5cdFx0XHRcdFx0XHRpZiAoIGVtaXR0ZWQgKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gcHJldmVudCBzY3JvbGxpbmdcblx0XHRcdFx0XHRpZiAoIE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkICkge1xuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Y29udGV4dC5zdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBudWxsO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdCRkb2N1bWVudC5vbiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApXG5cdFx0XHRcdFx0Lm9uZSggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0fTtcblx0XHRcdCR0aGlzLm9uKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHR9LFxuXG5cdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cywgY29udGV4dDtcblxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCBldmVudHMgKSB7XG5cdFx0XHRcdGNvbnRleHQgPSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGRlbGV0ZSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGV2ZW50cy5sZW5ndGgtLTtcblx0XHRcdFx0aWYgKCBldmVudHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0XHRcdCQucmVtb3ZlRGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGNvbnRleHQgKSB7XG5cdFx0XHRcdGlmICggY29udGV4dC5zdGFydCApIHtcblx0XHRcdFx0XHQkKCB0aGlzICkub2ZmKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbnRleHQubW92ZSApIHtcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0LnN0b3AgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHQkLmVhY2goe1xuXHRcdHN3aXBlbGVmdDogXCJzd2lwZS5sZWZ0XCIsXG5cdFx0c3dpcGVyaWdodDogXCJzd2lwZS5yaWdodFwiXG5cdH0sIGZ1bmN0aW9uKCBldmVudCwgc291cmNlRXZlbnQgKSB7XG5cblx0XHQkLmV2ZW50LnNwZWNpYWxbIGV2ZW50IF0gPSB7XG5cdFx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS5iaW5kKCBzb3VyY2VFdmVudCwgJC5ub29wICk7XG5cdFx0XHR9LFxuXHRcdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkudW5iaW5kKCBzb3VyY2VFdmVudCApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xufSkoIGpRdWVyeSwgdGhpcyApO1xuKi9cbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3QgTXV0YXRpb25PYnNlcnZlciA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChgJHtwcmVmaXhlc1tpXX1NdXRhdGlvbk9ic2VydmVyYCBpbiB3aW5kb3cpIHtcbiAgICAgIHJldHVybiB3aW5kb3dbYCR7cHJlZml4ZXNbaV19TXV0YXRpb25PYnNlcnZlcmBdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59KCkpO1xuXG5jb25zdCB0cmlnZ2VycyA9IChlbCwgdHlwZSkgPT4ge1xuICBlbC5kYXRhKHR5cGUpLnNwbGl0KCcgJykuZm9yRWFjaChpZCA9PiB7XG4gICAgJChgIyR7aWR9YClbIHR5cGUgPT09ICdjbG9zZScgPyAndHJpZ2dlcicgOiAndHJpZ2dlckhhbmRsZXInXShgJHt0eXBlfS56Zi50cmlnZ2VyYCwgW2VsXSk7XG4gIH0pO1xufTtcbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtb3Blbl0gd2lsbCByZXZlYWwgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1vcGVuXScsIGZ1bmN0aW9uKCkge1xuICB0cmlnZ2VycygkKHRoaXMpLCAnb3BlbicpO1xufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2VdIHdpbGwgY2xvc2UgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4vLyBJZiB1c2VkIHdpdGhvdXQgYSB2YWx1ZSBvbiBbZGF0YS1jbG9zZV0sIHRoZSBldmVudCB3aWxsIGJ1YmJsZSwgYWxsb3dpbmcgaXQgdG8gY2xvc2UgYSBwYXJlbnQgY29tcG9uZW50LlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2VdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgnY2xvc2UnKTtcbiAgaWYgKGlkKSB7XG4gICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ2Nsb3NlJyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZS56Zi50cmlnZ2VyJyk7XG4gIH1cbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLXRvZ2dsZV0gd2lsbCB0b2dnbGUgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGVdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlJyk7XG4gIGlmIChpZCkge1xuICAgIHRyaWdnZXJzKCQodGhpcyksICd0b2dnbGUnKTtcbiAgfSBlbHNlIHtcbiAgICAkKHRoaXMpLnRyaWdnZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJyk7XG4gIH1cbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NhYmxlXSB3aWxsIHJlc3BvbmQgdG8gY2xvc2UuemYudHJpZ2dlciBldmVudHMuXG4kKGRvY3VtZW50KS5vbignY2xvc2UuemYudHJpZ2dlcicsICdbZGF0YS1jbG9zYWJsZV0nLCBmdW5jdGlvbihlKXtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgbGV0IGFuaW1hdGlvbiA9ICQodGhpcykuZGF0YSgnY2xvc2FibGUnKTtcblxuICBpZihhbmltYXRpb24gIT09ICcnKXtcbiAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KCQodGhpcyksIGFuaW1hdGlvbiwgZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICAgIH0pO1xuICB9ZWxzZXtcbiAgICAkKHRoaXMpLmZhZGVPdXQoKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgfVxufSk7XG5cbiQoZG9jdW1lbnQpLm9uKCdmb2N1cy56Zi50cmlnZ2VyIGJsdXIuemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGUtZm9jdXNdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlLWZvY3VzJyk7XG4gICQoYCMke2lkfWApLnRyaWdnZXJIYW5kbGVyKCd0b2dnbGUuemYudHJpZ2dlcicsIFskKHRoaXMpXSk7XG59KTtcblxuLyoqXG4qIEZpcmVzIG9uY2UgYWZ0ZXIgYWxsIG90aGVyIHNjcmlwdHMgaGF2ZSBsb2FkZWRcbiogQGZ1bmN0aW9uXG4qIEBwcml2YXRlXG4qL1xuJCh3aW5kb3cpLm9uKCdsb2FkJywgKCkgPT4ge1xuICBjaGVja0xpc3RlbmVycygpO1xufSk7XG5cbmZ1bmN0aW9uIGNoZWNrTGlzdGVuZXJzKCkge1xuICBldmVudHNMaXN0ZW5lcigpO1xuICByZXNpemVMaXN0ZW5lcigpO1xuICBzY3JvbGxMaXN0ZW5lcigpO1xuICBtdXRhdGVMaXN0ZW5lcigpO1xuICBjbG9zZW1lTGlzdGVuZXIoKTtcbn1cblxuLy8qKioqKioqKiBvbmx5IGZpcmVzIHRoaXMgZnVuY3Rpb24gb25jZSBvbiBsb2FkLCBpZiB0aGVyZSdzIHNvbWV0aGluZyB0byB3YXRjaCAqKioqKioqKlxuZnVuY3Rpb24gY2xvc2VtZUxpc3RlbmVyKHBsdWdpbk5hbWUpIHtcbiAgdmFyIHlldGlCb3hlcyA9ICQoJ1tkYXRhLXlldGktYm94XScpLFxuICAgICAgcGx1Z05hbWVzID0gWydkcm9wZG93bicsICd0b29sdGlwJywgJ3JldmVhbCddO1xuXG4gIGlmKHBsdWdpbk5hbWUpe1xuICAgIGlmKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnc3RyaW5nJyl7XG4gICAgICBwbHVnTmFtZXMucHVzaChwbHVnaW5OYW1lKTtcbiAgICB9ZWxzZSBpZih0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHBsdWdpbk5hbWVbMF0gPT09ICdzdHJpbmcnKXtcbiAgICAgIHBsdWdOYW1lcy5jb25jYXQocGx1Z2luTmFtZSk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmVycm9yKCdQbHVnaW4gbmFtZXMgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICB9XG4gIGlmKHlldGlCb3hlcy5sZW5ndGgpe1xuICAgIGxldCBsaXN0ZW5lcnMgPSBwbHVnTmFtZXMubWFwKChuYW1lKSA9PiB7XG4gICAgICByZXR1cm4gYGNsb3NlbWUuemYuJHtuYW1lfWA7XG4gICAgfSkuam9pbignICcpO1xuXG4gICAgJCh3aW5kb3cpLm9mZihsaXN0ZW5lcnMpLm9uKGxpc3RlbmVycywgZnVuY3Rpb24oZSwgcGx1Z2luSWQpe1xuICAgICAgbGV0IHBsdWdpbiA9IGUubmFtZXNwYWNlLnNwbGl0KCcuJylbMF07XG4gICAgICBsZXQgcGx1Z2lucyA9ICQoYFtkYXRhLSR7cGx1Z2lufV1gKS5ub3QoYFtkYXRhLXlldGktYm94PVwiJHtwbHVnaW5JZH1cIl1gKTtcblxuICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIGxldCBfdGhpcyA9ICQodGhpcyk7XG5cbiAgICAgICAgX3RoaXMudHJpZ2dlckhhbmRsZXIoJ2Nsb3NlLnpmLnRyaWdnZXInLCBbX3RoaXNdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlc2l6ZUxpc3RlbmVyKGRlYm91bmNlKXtcbiAgbGV0IHRpbWVyLFxuICAgICAgJG5vZGVzID0gJCgnW2RhdGEtcmVzaXplXScpO1xuICBpZigkbm9kZXMubGVuZ3RoKXtcbiAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuemYudHJpZ2dlcicpXG4gICAgLm9uKCdyZXNpemUuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICh0aW1lcikgeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG5cbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgcmVzaXplIGV2ZW50XG4gICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwicmVzaXplXCIpO1xuICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgcmVzaXplIGV2ZW50XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2Nyb2xsTGlzdGVuZXIoZGVib3VuY2Upe1xuICBsZXQgdGltZXIsXG4gICAgICAkbm9kZXMgPSAkKCdbZGF0YS1zY3JvbGxdJyk7XG4gIGlmKCRub2Rlcy5sZW5ndGgpe1xuICAgICQod2luZG93KS5vZmYoJ3Njcm9sbC56Zi50cmlnZ2VyJylcbiAgICAub24oJ3Njcm9sbC56Zi50cmlnZ2VyJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZih0aW1lcil7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cblxuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpey8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBzY3JvbGwgZXZlbnRcbiAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJzY3JvbGxcIik7XG4gICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7Ly9kZWZhdWx0IHRpbWUgdG8gZW1pdCBzY3JvbGwgZXZlbnRcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtdXRhdGVMaXN0ZW5lcihkZWJvdW5jZSkge1xuICAgIGxldCAkbm9kZXMgPSAkKCdbZGF0YS1tdXRhdGVdJyk7XG4gICAgaWYgKCRub2Rlcy5sZW5ndGggJiYgTXV0YXRpb25PYnNlcnZlcil7XG5cdFx0XHQvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgbXV0YXRlIGV2ZW50XG4gICAgICAvL25vIElFIDkgb3IgMTBcblx0XHRcdCRub2Rlcy5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicpO1xuXHRcdFx0fSk7XG4gICAgfVxuIH1cblxuZnVuY3Rpb24gZXZlbnRzTGlzdGVuZXIoKSB7XG4gIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsgcmV0dXJuIGZhbHNlOyB9XG4gIGxldCBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXJlc2l6ZV0sIFtkYXRhLXNjcm9sbF0sIFtkYXRhLW11dGF0ZV0nKTtcblxuICAvL2VsZW1lbnQgY2FsbGJhY2tcbiAgdmFyIGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24gPSBmdW5jdGlvbiAobXV0YXRpb25SZWNvcmRzTGlzdCkge1xuICAgICAgdmFyICR0YXJnZXQgPSAkKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udGFyZ2V0KTtcblxuXHQgIC8vdHJpZ2dlciB0aGUgZXZlbnQgaGFuZGxlciBmb3IgdGhlIGVsZW1lbnQgZGVwZW5kaW5nIG9uIHR5cGVcbiAgICAgIHN3aXRjaCAobXV0YXRpb25SZWNvcmRzTGlzdFswXS50eXBlKSB7XG5cbiAgICAgICAgY2FzZSBcImF0dHJpYnV0ZXNcIjpcbiAgICAgICAgICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwic2Nyb2xsXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcblx0XHQgIFx0JHRhcmdldC50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LCB3aW5kb3cucGFnZVlPZmZzZXRdKTtcblx0XHQgIH1cblx0XHQgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJyZXNpemVcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuXHRcdCAgXHQkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXRdKTtcblx0XHQgICB9XG5cdFx0ICBpZiAobXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcInN0eWxlXCIpIHtcblx0XHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIixcIm11dGF0ZVwiKTtcblx0XHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG5cdFx0ICB9XG5cdFx0ICBicmVhaztcblxuICAgICAgICBjYXNlIFwiY2hpbGRMaXN0XCI6XG5cdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpO1xuXHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vbm90aGluZ1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAobm9kZXMubGVuZ3RoKSB7XG4gICAgICAvL2ZvciBlYWNoIGVsZW1lbnQgdGhhdCBuZWVkcyB0byBsaXN0ZW4gZm9yIHJlc2l6aW5nLCBzY3JvbGxpbmcsIG9yIG11dGF0aW9uIGFkZCBhIHNpbmdsZSBvYnNlcnZlclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gbm9kZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIHZhciBlbGVtZW50T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uKTtcbiAgICAgICAgZWxlbWVudE9ic2VydmVyLm9ic2VydmUobm9kZXNbaV0sIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlRmlsdGVyOiBbXCJkYXRhLWV2ZW50c1wiLCBcInN0eWxlXCJdIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gW1BIXVxuLy8gRm91bmRhdGlvbi5DaGVja1dhdGNoZXJzID0gY2hlY2tXYXRjaGVycztcbkZvdW5kYXRpb24uSUhlYXJZb3UgPSBjaGVja0xpc3RlbmVycztcbi8vIEZvdW5kYXRpb24uSVNlZVlvdSA9IHNjcm9sbExpc3RlbmVyO1xuLy8gRm91bmRhdGlvbi5JRmVlbFlvdSA9IGNsb3NlbWVMaXN0ZW5lcjtcblxufShqUXVlcnkpO1xuXG4vLyBmdW5jdGlvbiBkb21NdXRhdGlvbk9ic2VydmVyKGRlYm91bmNlKSB7XG4vLyAgIC8vICEhISBUaGlzIGlzIGNvbWluZyBzb29uIGFuZCBuZWVkcyBtb3JlIHdvcms7IG5vdCBhY3RpdmUgICEhISAvL1xuLy8gICB2YXIgdGltZXIsXG4vLyAgIG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtbXV0YXRlXScpO1xuLy8gICAvL1xuLy8gICBpZiAobm9kZXMubGVuZ3RoKSB7XG4vLyAgICAgLy8gdmFyIE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24gKCkge1xuLy8gICAgIC8vICAgdmFyIHByZWZpeGVzID0gWydXZWJLaXQnLCAnTW96JywgJ08nLCAnTXMnLCAnJ107XG4vLyAgICAgLy8gICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuLy8gICAgIC8vICAgICBpZiAocHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlcicgaW4gd2luZG93KSB7XG4vLyAgICAgLy8gICAgICAgcmV0dXJuIHdpbmRvd1twcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJ107XG4vLyAgICAgLy8gICAgIH1cbi8vICAgICAvLyAgIH1cbi8vICAgICAvLyAgIHJldHVybiBmYWxzZTtcbi8vICAgICAvLyB9KCkpO1xuLy9cbi8vXG4vLyAgICAgLy9mb3IgdGhlIGJvZHksIHdlIG5lZWQgdG8gbGlzdGVuIGZvciBhbGwgY2hhbmdlcyBlZmZlY3RpbmcgdGhlIHN0eWxlIGFuZCBjbGFzcyBhdHRyaWJ1dGVzXG4vLyAgICAgdmFyIGJvZHlPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGJvZHlNdXRhdGlvbik7XG4vLyAgICAgYm9keU9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBhdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOnRydWUsIGF0dHJpYnV0ZUZpbHRlcjpbXCJzdHlsZVwiLCBcImNsYXNzXCJdfSk7XG4vL1xuLy9cbi8vICAgICAvL2JvZHkgY2FsbGJhY2tcbi8vICAgICBmdW5jdGlvbiBib2R5TXV0YXRpb24obXV0YXRlKSB7XG4vLyAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgbXV0YXRpb24gZXZlbnRcbi8vICAgICAgIGlmICh0aW1lcikgeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG4vL1xuLy8gICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuLy8gICAgICAgICBib2R5T2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuLy8gICAgICAgICAkKCdbZGF0YS1tdXRhdGVdJykuYXR0cignZGF0YS1ldmVudHMnLFwibXV0YXRlXCIpO1xuLy8gICAgICAgfSwgZGVib3VuY2UgfHwgMTUwKTtcbi8vICAgICB9XG4vLyAgIH1cbi8vIH1cbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBBYmlkZSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uYWJpZGVcbiAqL1xuXG5jbGFzcyBBYmlkZSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIEFiaWRlLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIEFiaWRlI2luaXRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGFkZCB0aGUgdHJpZ2dlciB0by5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zICA9ICQuZXh0ZW5kKHt9LCBBYmlkZS5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnQWJpZGUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgQWJpZGUgcGx1Z2luIGFuZCBjYWxscyBmdW5jdGlvbnMgdG8gZ2V0IEFiaWRlIGZ1bmN0aW9uaW5nIG9uIGxvYWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLiRpbnB1dHMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0Jyk7XG5cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIEFiaWRlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLmFiaWRlJylcbiAgICAgIC5vbigncmVzZXQuemYuYWJpZGUnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMucmVzZXRGb3JtKCk7XG4gICAgICB9KVxuICAgICAgLm9uKCdzdWJtaXQuemYuYWJpZGUnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlRm9ybSgpO1xuICAgICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnZhbGlkYXRlT24gPT09ICdmaWVsZENoYW5nZScpIHtcbiAgICAgIHRoaXMuJGlucHV0c1xuICAgICAgICAub2ZmKCdjaGFuZ2UuemYuYWJpZGUnKVxuICAgICAgICAub24oJ2NoYW5nZS56Zi5hYmlkZScsIChlKSA9PiB7XG4gICAgICAgICAgdGhpcy52YWxpZGF0ZUlucHV0KCQoZS50YXJnZXQpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5saXZlVmFsaWRhdGUpIHtcbiAgICAgIHRoaXMuJGlucHV0c1xuICAgICAgICAub2ZmKCdpbnB1dC56Zi5hYmlkZScpXG4gICAgICAgIC5vbignaW5wdXQuemYuYWJpZGUnLCAoZSkgPT4ge1xuICAgICAgICAgIHRoaXMudmFsaWRhdGVJbnB1dCgkKGUudGFyZ2V0KSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMudmFsaWRhdGVPbkJsdXIpIHtcbiAgICAgIHRoaXMuJGlucHV0c1xuICAgICAgICAub2ZmKCdibHVyLnpmLmFiaWRlJylcbiAgICAgICAgLm9uKCdibHVyLnpmLmFiaWRlJywgKGUpID0+IHtcbiAgICAgICAgICB0aGlzLnZhbGlkYXRlSW5wdXQoJChlLnRhcmdldCkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB0byB1cGRhdGUgQWJpZGUgdXBvbiBET00gY2hhbmdlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcmVmbG93KCkge1xuICAgIHRoaXMuX2luaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciBvciBub3QgYSBmb3JtIGVsZW1lbnQgaGFzIHRoZSByZXF1aXJlZCBhdHRyaWJ1dGUgYW5kIGlmIGl0J3MgY2hlY2tlZCBvciBub3RcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGNoZWNrIGZvciByZXF1aXJlZCBhdHRyaWJ1dGVcbiAgICogQHJldHVybnMge0Jvb2xlYW59IEJvb2xlYW4gdmFsdWUgZGVwZW5kcyBvbiB3aGV0aGVyIG9yIG5vdCBhdHRyaWJ1dGUgaXMgY2hlY2tlZCBvciBlbXB0eVxuICAgKi9cbiAgcmVxdWlyZWRDaGVjaygkZWwpIHtcbiAgICBpZiAoISRlbC5hdHRyKCdyZXF1aXJlZCcpKSByZXR1cm4gdHJ1ZTtcblxuICAgIHZhciBpc0dvb2QgPSB0cnVlO1xuXG4gICAgc3dpdGNoICgkZWxbMF0udHlwZSkge1xuICAgICAgY2FzZSAnY2hlY2tib3gnOlxuICAgICAgICBpc0dvb2QgPSAkZWxbMF0uY2hlY2tlZDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICBjYXNlICdzZWxlY3Qtb25lJzpcbiAgICAgIGNhc2UgJ3NlbGVjdC1tdWx0aXBsZSc6XG4gICAgICAgIHZhciBvcHQgPSAkZWwuZmluZCgnb3B0aW9uOnNlbGVjdGVkJyk7XG4gICAgICAgIGlmICghb3B0Lmxlbmd0aCB8fCAhb3B0LnZhbCgpKSBpc0dvb2QgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmKCEkZWwudmFsKCkgfHwgISRlbC52YWwoKS5sZW5ndGgpIGlzR29vZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBpc0dvb2Q7XG4gIH1cblxuICAvKipcbiAgICogQmFzZWQgb24gJGVsLCBnZXQgdGhlIGZpcnN0IGVsZW1lbnQgd2l0aCBzZWxlY3RvciBpbiB0aGlzIG9yZGVyOlxuICAgKiAxLiBUaGUgZWxlbWVudCdzIGRpcmVjdCBzaWJsaW5nKCdzKS5cbiAgICogMy4gVGhlIGVsZW1lbnQncyBwYXJlbnQncyBjaGlsZHJlbi5cbiAgICpcbiAgICogVGhpcyBhbGxvd3MgZm9yIG11bHRpcGxlIGZvcm0gZXJyb3JzIHBlciBpbnB1dCwgdGhvdWdoIGlmIG5vbmUgYXJlIGZvdW5kLCBubyBmb3JtIGVycm9ycyB3aWxsIGJlIHNob3duLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byB1c2UgYXMgcmVmZXJlbmNlIHRvIGZpbmQgdGhlIGZvcm0gZXJyb3Igc2VsZWN0b3IuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IGpRdWVyeSBvYmplY3Qgd2l0aCB0aGUgc2VsZWN0b3IuXG4gICAqL1xuICBmaW5kRm9ybUVycm9yKCRlbCkge1xuICAgIHZhciAkZXJyb3IgPSAkZWwuc2libGluZ3ModGhpcy5vcHRpb25zLmZvcm1FcnJvclNlbGVjdG9yKTtcblxuICAgIGlmICghJGVycm9yLmxlbmd0aCkge1xuICAgICAgJGVycm9yID0gJGVsLnBhcmVudCgpLmZpbmQodGhpcy5vcHRpb25zLmZvcm1FcnJvclNlbGVjdG9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gJGVycm9yO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGlzIG9yZGVyOlxuICAgKiAyLiBUaGUgPGxhYmVsPiB3aXRoIHRoZSBhdHRyaWJ1dGUgYFtmb3I9XCJzb21lSW5wdXRJZFwiXWBcbiAgICogMy4gVGhlIGAuY2xvc2VzdCgpYCA8bGFiZWw+XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgb2JqZWN0IHRvIGNoZWNrIGZvciByZXF1aXJlZCBhdHRyaWJ1dGVcbiAgICogQHJldHVybnMge0Jvb2xlYW59IEJvb2xlYW4gdmFsdWUgZGVwZW5kcyBvbiB3aGV0aGVyIG9yIG5vdCBhdHRyaWJ1dGUgaXMgY2hlY2tlZCBvciBlbXB0eVxuICAgKi9cbiAgZmluZExhYmVsKCRlbCkge1xuICAgIHZhciBpZCA9ICRlbFswXS5pZDtcbiAgICB2YXIgJGxhYmVsID0gdGhpcy4kZWxlbWVudC5maW5kKGBsYWJlbFtmb3I9XCIke2lkfVwiXWApO1xuXG4gICAgaWYgKCEkbGFiZWwubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gJGVsLmNsb3Nlc3QoJ2xhYmVsJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuICRsYWJlbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHNldCBvZiBsYWJlbHMgYXNzb2NpYXRlZCB3aXRoIGEgc2V0IG9mIHJhZGlvIGVscyBpbiB0aGlzIG9yZGVyXG4gICAqIDIuIFRoZSA8bGFiZWw+IHdpdGggdGhlIGF0dHJpYnV0ZSBgW2Zvcj1cInNvbWVJbnB1dElkXCJdYFxuICAgKiAzLiBUaGUgYC5jbG9zZXN0KClgIDxsYWJlbD5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gY2hlY2sgZm9yIHJlcXVpcmVkIGF0dHJpYnV0ZVxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IGF0dHJpYnV0ZSBpcyBjaGVja2VkIG9yIGVtcHR5XG4gICAqL1xuICBmaW5kUmFkaW9MYWJlbHMoJGVscykge1xuICAgIHZhciBsYWJlbHMgPSAkZWxzLm1hcCgoaSwgZWwpID0+IHtcbiAgICAgIHZhciBpZCA9IGVsLmlkO1xuICAgICAgdmFyICRsYWJlbCA9IHRoaXMuJGVsZW1lbnQuZmluZChgbGFiZWxbZm9yPVwiJHtpZH1cIl1gKTtcblxuICAgICAgaWYgKCEkbGFiZWwubGVuZ3RoKSB7XG4gICAgICAgICRsYWJlbCA9ICQoZWwpLmNsb3Nlc3QoJ2xhYmVsJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gJGxhYmVsWzBdO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuICQobGFiZWxzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBDU1MgZXJyb3IgY2xhc3MgYXMgc3BlY2lmaWVkIGJ5IHRoZSBBYmlkZSBzZXR0aW5ncyB0byB0aGUgbGFiZWwsIGlucHV0LCBhbmQgdGhlIGZvcm1cbiAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSBjbGFzcyB0b1xuICAgKi9cbiAgYWRkRXJyb3JDbGFzc2VzKCRlbCkge1xuICAgIHZhciAkbGFiZWwgPSB0aGlzLmZpbmRMYWJlbCgkZWwpO1xuICAgIHZhciAkZm9ybUVycm9yID0gdGhpcy5maW5kRm9ybUVycm9yKCRlbCk7XG5cbiAgICBpZiAoJGxhYmVsLmxlbmd0aCkge1xuICAgICAgJGxhYmVsLmFkZENsYXNzKHRoaXMub3B0aW9ucy5sYWJlbEVycm9yQ2xhc3MpO1xuICAgIH1cblxuICAgIGlmICgkZm9ybUVycm9yLmxlbmd0aCkge1xuICAgICAgJGZvcm1FcnJvci5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuZm9ybUVycm9yQ2xhc3MpO1xuICAgIH1cblxuICAgICRlbC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuaW5wdXRFcnJvckNsYXNzKS5hdHRyKCdkYXRhLWludmFsaWQnLCAnJyk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIENTUyBlcnJvciBjbGFzc2VzIGV0YyBmcm9tIGFuIGVudGlyZSByYWRpbyBidXR0b24gZ3JvdXBcbiAgICogQHBhcmFtIHtTdHJpbmd9IGdyb3VwTmFtZSAtIEEgc3RyaW5nIHRoYXQgc3BlY2lmaWVzIHRoZSBuYW1lIG9mIGEgcmFkaW8gYnV0dG9uIGdyb3VwXG4gICAqXG4gICAqL1xuXG4gIHJlbW92ZVJhZGlvRXJyb3JDbGFzc2VzKGdyb3VwTmFtZSkge1xuICAgIHZhciAkZWxzID0gdGhpcy4kZWxlbWVudC5maW5kKGA6cmFkaW9bbmFtZT1cIiR7Z3JvdXBOYW1lfVwiXWApO1xuICAgIHZhciAkbGFiZWxzID0gdGhpcy5maW5kUmFkaW9MYWJlbHMoJGVscyk7XG4gICAgdmFyICRmb3JtRXJyb3JzID0gdGhpcy5maW5kRm9ybUVycm9yKCRlbHMpO1xuXG4gICAgaWYgKCRsYWJlbHMubGVuZ3RoKSB7XG4gICAgICAkbGFiZWxzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5sYWJlbEVycm9yQ2xhc3MpO1xuICAgIH1cblxuICAgIGlmICgkZm9ybUVycm9ycy5sZW5ndGgpIHtcbiAgICAgICRmb3JtRXJyb3JzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5mb3JtRXJyb3JDbGFzcyk7XG4gICAgfVxuXG4gICAgJGVscy5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuaW5wdXRFcnJvckNsYXNzKS5yZW1vdmVBdHRyKCdkYXRhLWludmFsaWQnKTtcblxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgQ1NTIGVycm9yIGNsYXNzIGFzIHNwZWNpZmllZCBieSB0aGUgQWJpZGUgc2V0dGluZ3MgZnJvbSB0aGUgbGFiZWwsIGlucHV0LCBhbmQgdGhlIGZvcm1cbiAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gcmVtb3ZlIHRoZSBjbGFzcyBmcm9tXG4gICAqL1xuICByZW1vdmVFcnJvckNsYXNzZXMoJGVsKSB7XG4gICAgLy8gcmFkaW9zIG5lZWQgdG8gY2xlYXIgYWxsIG9mIHRoZSBlbHNcbiAgICBpZigkZWxbMF0udHlwZSA9PSAncmFkaW8nKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW1vdmVSYWRpb0Vycm9yQ2xhc3NlcygkZWwuYXR0cignbmFtZScpKTtcbiAgICB9XG5cbiAgICB2YXIgJGxhYmVsID0gdGhpcy5maW5kTGFiZWwoJGVsKTtcbiAgICB2YXIgJGZvcm1FcnJvciA9IHRoaXMuZmluZEZvcm1FcnJvcigkZWwpO1xuXG4gICAgaWYgKCRsYWJlbC5sZW5ndGgpIHtcbiAgICAgICRsYWJlbC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMubGFiZWxFcnJvckNsYXNzKTtcbiAgICB9XG5cbiAgICBpZiAoJGZvcm1FcnJvci5sZW5ndGgpIHtcbiAgICAgICRmb3JtRXJyb3IucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmZvcm1FcnJvckNsYXNzKTtcbiAgICB9XG5cbiAgICAkZWwucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmlucHV0RXJyb3JDbGFzcykucmVtb3ZlQXR0cignZGF0YS1pbnZhbGlkJyk7XG4gIH1cblxuICAvKipcbiAgICogR29lcyB0aHJvdWdoIGEgZm9ybSB0byBmaW5kIGlucHV0cyBhbmQgcHJvY2VlZHMgdG8gdmFsaWRhdGUgdGhlbSBpbiB3YXlzIHNwZWNpZmljIHRvIHRoZWlyIHR5cGVcbiAgICogQGZpcmVzIEFiaWRlI2ludmFsaWRcbiAgICogQGZpcmVzIEFiaWRlI3ZhbGlkXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB2YWxpZGF0ZSwgc2hvdWxkIGJlIGFuIEhUTUwgaW5wdXRcbiAgICogQHJldHVybnMge0Jvb2xlYW59IGdvb2RUb0dvIC0gSWYgdGhlIGlucHV0IGlzIHZhbGlkIG9yIG5vdC5cbiAgICovXG4gIHZhbGlkYXRlSW5wdXQoJGVsKSB7XG4gICAgdmFyIGNsZWFyUmVxdWlyZSA9IHRoaXMucmVxdWlyZWRDaGVjaygkZWwpLFxuICAgICAgICB2YWxpZGF0ZWQgPSBmYWxzZSxcbiAgICAgICAgY3VzdG9tVmFsaWRhdG9yID0gdHJ1ZSxcbiAgICAgICAgdmFsaWRhdG9yID0gJGVsLmF0dHIoJ2RhdGEtdmFsaWRhdG9yJyksXG4gICAgICAgIGVxdWFsVG8gPSB0cnVlO1xuXG4gICAgLy8gZG9uJ3QgdmFsaWRhdGUgaWdub3JlZCBpbnB1dHMgb3IgaGlkZGVuIGlucHV0c1xuICAgIGlmICgkZWwuaXMoJ1tkYXRhLWFiaWRlLWlnbm9yZV0nKSB8fCAkZWwuaXMoJ1t0eXBlPVwiaGlkZGVuXCJdJykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHN3aXRjaCAoJGVsWzBdLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgICAgdmFsaWRhdGVkID0gdGhpcy52YWxpZGF0ZVJhZGlvKCRlbC5hdHRyKCduYW1lJykpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnY2hlY2tib3gnOlxuICAgICAgICB2YWxpZGF0ZWQgPSBjbGVhclJlcXVpcmU7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgY2FzZSAnc2VsZWN0LW9uZSc6XG4gICAgICBjYXNlICdzZWxlY3QtbXVsdGlwbGUnOlxuICAgICAgICB2YWxpZGF0ZWQgPSBjbGVhclJlcXVpcmU7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YWxpZGF0ZWQgPSB0aGlzLnZhbGlkYXRlVGV4dCgkZWwpO1xuICAgIH1cblxuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIGN1c3RvbVZhbGlkYXRvciA9IHRoaXMubWF0Y2hWYWxpZGF0aW9uKCRlbCwgdmFsaWRhdG9yLCAkZWwuYXR0cigncmVxdWlyZWQnKSk7XG4gICAgfVxuXG4gICAgaWYgKCRlbC5hdHRyKCdkYXRhLWVxdWFsdG8nKSkge1xuICAgICAgZXF1YWxUbyA9IHRoaXMub3B0aW9ucy52YWxpZGF0b3JzLmVxdWFsVG8oJGVsKTtcbiAgICB9XG5cblxuICAgIHZhciBnb29kVG9HbyA9IFtjbGVhclJlcXVpcmUsIHZhbGlkYXRlZCwgY3VzdG9tVmFsaWRhdG9yLCBlcXVhbFRvXS5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG4gICAgdmFyIG1lc3NhZ2UgPSAoZ29vZFRvR28gPyAndmFsaWQnIDogJ2ludmFsaWQnKSArICcuemYuYWJpZGUnO1xuXG4gICAgaWYgKGdvb2RUb0dvKSB7XG4gICAgICAvLyBSZS12YWxpZGF0ZSBpbnB1dHMgdGhhdCBkZXBlbmQgb24gdGhpcyBvbmUgd2l0aCBlcXVhbHRvXG4gICAgICBjb25zdCBkZXBlbmRlbnRFbGVtZW50cyA9IHRoaXMuJGVsZW1lbnQuZmluZChgW2RhdGEtZXF1YWx0bz1cIiR7JGVsLmF0dHIoJ2lkJyl9XCJdYCk7XG4gICAgICBpZiAoZGVwZW5kZW50RWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgIGxldCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGRlcGVuZGVudEVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCQodGhpcykudmFsKCkpIHtcbiAgICAgICAgICAgIF90aGlzLnZhbGlkYXRlSW5wdXQoJCh0aGlzKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzW2dvb2RUb0dvID8gJ3JlbW92ZUVycm9yQ2xhc3NlcycgOiAnYWRkRXJyb3JDbGFzc2VzJ10oJGVsKTtcblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIGlucHV0IGlzIGRvbmUgY2hlY2tpbmcgZm9yIHZhbGlkYXRpb24uIEV2ZW50IHRyaWdnZXIgaXMgZWl0aGVyIGB2YWxpZC56Zi5hYmlkZWAgb3IgYGludmFsaWQuemYuYWJpZGVgXG4gICAgICogVHJpZ2dlciBpbmNsdWRlcyB0aGUgRE9NIGVsZW1lbnQgb2YgdGhlIGlucHV0LlxuICAgICAqIEBldmVudCBBYmlkZSN2YWxpZFxuICAgICAqIEBldmVudCBBYmlkZSNpbnZhbGlkXG4gICAgICovXG4gICAgJGVsLnRyaWdnZXIobWVzc2FnZSwgWyRlbF0pO1xuXG4gICAgcmV0dXJuIGdvb2RUb0dvO1xuICB9XG5cbiAgLyoqXG4gICAqIEdvZXMgdGhyb3VnaCBhIGZvcm0gYW5kIGlmIHRoZXJlIGFyZSBhbnkgaW52YWxpZCBpbnB1dHMsIGl0IHdpbGwgZGlzcGxheSB0aGUgZm9ybSBlcnJvciBlbGVtZW50XG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBub0Vycm9yIC0gdHJ1ZSBpZiBubyBlcnJvcnMgd2VyZSBkZXRlY3RlZC4uLlxuICAgKiBAZmlyZXMgQWJpZGUjZm9ybXZhbGlkXG4gICAqIEBmaXJlcyBBYmlkZSNmb3JtaW52YWxpZFxuICAgKi9cbiAgdmFsaWRhdGVGb3JtKCkge1xuICAgIHZhciBhY2MgPSBbXTtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kaW5wdXRzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICBhY2MucHVzaChfdGhpcy52YWxpZGF0ZUlucHV0KCQodGhpcykpKTtcbiAgICB9KTtcblxuICAgIHZhciBub0Vycm9yID0gYWNjLmluZGV4T2YoZmFsc2UpID09PSAtMTtcblxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtYWJpZGUtZXJyb3JdJykuY3NzKCdkaXNwbGF5JywgKG5vRXJyb3IgPyAnbm9uZScgOiAnYmxvY2snKSk7XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBmb3JtIGlzIGZpbmlzaGVkIHZhbGlkYXRpbmcuIEV2ZW50IHRyaWdnZXIgaXMgZWl0aGVyIGBmb3JtdmFsaWQuemYuYWJpZGVgIG9yIGBmb3JtaW52YWxpZC56Zi5hYmlkZWAuXG4gICAgICogVHJpZ2dlciBpbmNsdWRlcyB0aGUgZWxlbWVudCBvZiB0aGUgZm9ybS5cbiAgICAgKiBAZXZlbnQgQWJpZGUjZm9ybXZhbGlkXG4gICAgICogQGV2ZW50IEFiaWRlI2Zvcm1pbnZhbGlkXG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKChub0Vycm9yID8gJ2Zvcm12YWxpZCcgOiAnZm9ybWludmFsaWQnKSArICcuemYuYWJpZGUnLCBbdGhpcy4kZWxlbWVudF0pO1xuXG4gICAgcmV0dXJuIG5vRXJyb3I7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIGEgbm90IGEgdGV4dCBpbnB1dCBpcyB2YWxpZCBiYXNlZCBvbiB0aGUgcGF0dGVybiBzcGVjaWZpZWQgaW4gdGhlIGF0dHJpYnV0ZS4gSWYgbm8gbWF0Y2hpbmcgcGF0dGVybiBpcyBmb3VuZCwgcmV0dXJucyB0cnVlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byB2YWxpZGF0ZSwgc2hvdWxkIGJlIGEgdGV4dCBpbnB1dCBIVE1MIGVsZW1lbnRcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdHRlcm4gLSBzdHJpbmcgdmFsdWUgb2Ygb25lIG9mIHRoZSBSZWdFeCBwYXR0ZXJucyBpbiBBYmlkZS5vcHRpb25zLnBhdHRlcm5zXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBCb29sZWFuIHZhbHVlIGRlcGVuZHMgb24gd2hldGhlciBvciBub3QgdGhlIGlucHV0IHZhbHVlIG1hdGNoZXMgdGhlIHBhdHRlcm4gc3BlY2lmaWVkXG4gICAqL1xuICB2YWxpZGF0ZVRleHQoJGVsLCBwYXR0ZXJuKSB7XG4gICAgLy8gQSBwYXR0ZXJuIGNhbiBiZSBwYXNzZWQgdG8gdGhpcyBmdW5jdGlvbiwgb3IgaXQgd2lsbCBiZSBpbmZlcmVkIGZyb20gdGhlIGlucHV0J3MgXCJwYXR0ZXJuXCIgYXR0cmlidXRlLCBvciBpdCdzIFwidHlwZVwiIGF0dHJpYnV0ZVxuICAgIHBhdHRlcm4gPSAocGF0dGVybiB8fCAkZWwuYXR0cigncGF0dGVybicpIHx8ICRlbC5hdHRyKCd0eXBlJykpO1xuICAgIHZhciBpbnB1dFRleHQgPSAkZWwudmFsKCk7XG4gICAgdmFyIHZhbGlkID0gZmFsc2U7XG5cbiAgICBpZiAoaW5wdXRUZXh0Lmxlbmd0aCkge1xuICAgICAgLy8gSWYgdGhlIHBhdHRlcm4gYXR0cmlidXRlIG9uIHRoZSBlbGVtZW50IGlzIGluIEFiaWRlJ3MgbGlzdCBvZiBwYXR0ZXJucywgdGhlbiB0ZXN0IHRoYXQgcmVnZXhwXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnBhdHRlcm5zLmhhc093blByb3BlcnR5KHBhdHRlcm4pKSB7XG4gICAgICAgIHZhbGlkID0gdGhpcy5vcHRpb25zLnBhdHRlcm5zW3BhdHRlcm5dLnRlc3QoaW5wdXRUZXh0KTtcbiAgICAgIH1cbiAgICAgIC8vIElmIHRoZSBwYXR0ZXJuIG5hbWUgaXNuJ3QgYWxzbyB0aGUgdHlwZSBhdHRyaWJ1dGUgb2YgdGhlIGZpZWxkLCB0aGVuIHRlc3QgaXQgYXMgYSByZWdleHBcbiAgICAgIGVsc2UgaWYgKHBhdHRlcm4gIT09ICRlbC5hdHRyKCd0eXBlJykpIHtcbiAgICAgICAgdmFsaWQgPSBuZXcgUmVnRXhwKHBhdHRlcm4pLnRlc3QoaW5wdXRUZXh0KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEFuIGVtcHR5IGZpZWxkIGlzIHZhbGlkIGlmIGl0J3Mgbm90IHJlcXVpcmVkXG4gICAgZWxzZSBpZiAoISRlbC5wcm9wKCdyZXF1aXJlZCcpKSB7XG4gICAgICB2YWxpZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkO1xuICAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgb3IgYSBub3QgYSByYWRpbyBpbnB1dCBpcyB2YWxpZCBiYXNlZCBvbiB3aGV0aGVyIG9yIG5vdCBpdCBpcyByZXF1aXJlZCBhbmQgc2VsZWN0ZWQuIEFsdGhvdWdoIHRoZSBmdW5jdGlvbiB0YXJnZXRzIGEgc2luZ2xlIGA8aW5wdXQ+YCwgaXQgdmFsaWRhdGVzIGJ5IGNoZWNraW5nIHRoZSBgcmVxdWlyZWRgIGFuZCBgY2hlY2tlZGAgcHJvcGVydGllcyBvZiBhbGwgcmFkaW8gYnV0dG9ucyBpbiBpdHMgZ3JvdXAuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cE5hbWUgLSBBIHN0cmluZyB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZSBvZiBhIHJhZGlvIGJ1dHRvbiBncm91cFxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IGF0IGxlYXN0IG9uZSByYWRpbyBpbnB1dCBoYXMgYmVlbiBzZWxlY3RlZCAoaWYgaXQncyByZXF1aXJlZClcbiAgICovXG4gIHZhbGlkYXRlUmFkaW8oZ3JvdXBOYW1lKSB7XG4gICAgLy8gSWYgYXQgbGVhc3Qgb25lIHJhZGlvIGluIHRoZSBncm91cCBoYXMgdGhlIGByZXF1aXJlZGAgYXR0cmlidXRlLCB0aGUgZ3JvdXAgaXMgY29uc2lkZXJlZCByZXF1aXJlZFxuICAgIC8vIFBlciBXM0Mgc3BlYywgYWxsIHJhZGlvIGJ1dHRvbnMgaW4gYSBncm91cCBzaG91bGQgaGF2ZSBgcmVxdWlyZWRgLCBidXQgd2UncmUgYmVpbmcgbmljZVxuICAgIHZhciAkZ3JvdXAgPSB0aGlzLiRlbGVtZW50LmZpbmQoYDpyYWRpb1tuYW1lPVwiJHtncm91cE5hbWV9XCJdYCk7XG4gICAgdmFyIHZhbGlkID0gZmFsc2UsIHJlcXVpcmVkID0gZmFsc2U7XG5cbiAgICAvLyBGb3IgdGhlIGdyb3VwIHRvIGJlIHJlcXVpcmVkLCBhdCBsZWFzdCBvbmUgcmFkaW8gbmVlZHMgdG8gYmUgcmVxdWlyZWRcbiAgICAkZ3JvdXAuZWFjaCgoaSwgZSkgPT4ge1xuICAgICAgaWYgKCQoZSkuYXR0cigncmVxdWlyZWQnKSkge1xuICAgICAgICByZXF1aXJlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYoIXJlcXVpcmVkKSB2YWxpZD10cnVlO1xuXG4gICAgaWYgKCF2YWxpZCkge1xuICAgICAgLy8gRm9yIHRoZSBncm91cCB0byBiZSB2YWxpZCwgYXQgbGVhc3Qgb25lIHJhZGlvIG5lZWRzIHRvIGJlIGNoZWNrZWRcbiAgICAgICRncm91cC5lYWNoKChpLCBlKSA9PiB7XG4gICAgICAgIGlmICgkKGUpLnByb3AoJ2NoZWNrZWQnKSkge1xuICAgICAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiB2YWxpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIGEgc2VsZWN0ZWQgaW5wdXQgcGFzc2VzIGEgY3VzdG9tIHZhbGlkYXRpb24gZnVuY3Rpb24uIE11bHRpcGxlIHZhbGlkYXRpb25zIGNhbiBiZSB1c2VkLCBpZiBwYXNzZWQgdG8gdGhlIGVsZW1lbnQgd2l0aCBgZGF0YS12YWxpZGF0b3I9XCJmb28gYmFyIGJhelwiYCBpbiBhIHNwYWNlIHNlcGFyYXRlZCBsaXN0ZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgaW5wdXQgZWxlbWVudC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHZhbGlkYXRvcnMgLSBhIHN0cmluZyBvZiBmdW5jdGlvbiBuYW1lcyBtYXRjaGluZyBmdW5jdGlvbnMgaW4gdGhlIEFiaWRlLm9wdGlvbnMudmFsaWRhdG9ycyBvYmplY3QuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVxdWlyZWQgLSBzZWxmIGV4cGxhbmF0b3J5P1xuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gLSB0cnVlIGlmIHZhbGlkYXRpb25zIHBhc3NlZC5cbiAgICovXG4gIG1hdGNoVmFsaWRhdGlvbigkZWwsIHZhbGlkYXRvcnMsIHJlcXVpcmVkKSB7XG4gICAgcmVxdWlyZWQgPSByZXF1aXJlZCA/IHRydWUgOiBmYWxzZTtcblxuICAgIHZhciBjbGVhciA9IHZhbGlkYXRvcnMuc3BsaXQoJyAnKS5tYXAoKHYpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMudmFsaWRhdG9yc1t2XSgkZWwsIHJlcXVpcmVkLCAkZWwucGFyZW50KCkpO1xuICAgIH0pO1xuICAgIHJldHVybiBjbGVhci5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIGZvcm0gaW5wdXRzIGFuZCBzdHlsZXNcbiAgICogQGZpcmVzIEFiaWRlI2Zvcm1yZXNldFxuICAgKi9cbiAgcmVzZXRGb3JtKCkge1xuICAgIHZhciAkZm9ybSA9IHRoaXMuJGVsZW1lbnQsXG4gICAgICAgIG9wdHMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAkKGAuJHtvcHRzLmxhYmVsRXJyb3JDbGFzc31gLCAkZm9ybSkubm90KCdzbWFsbCcpLnJlbW92ZUNsYXNzKG9wdHMubGFiZWxFcnJvckNsYXNzKTtcbiAgICAkKGAuJHtvcHRzLmlucHV0RXJyb3JDbGFzc31gLCAkZm9ybSkubm90KCdzbWFsbCcpLnJlbW92ZUNsYXNzKG9wdHMuaW5wdXRFcnJvckNsYXNzKTtcbiAgICAkKGAke29wdHMuZm9ybUVycm9yU2VsZWN0b3J9LiR7b3B0cy5mb3JtRXJyb3JDbGFzc31gKS5yZW1vdmVDbGFzcyhvcHRzLmZvcm1FcnJvckNsYXNzKTtcbiAgICAkZm9ybS5maW5kKCdbZGF0YS1hYmlkZS1lcnJvcl0nKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICQoJzppbnB1dCcsICRmb3JtKS5ub3QoJzpidXR0b24sIDpzdWJtaXQsIDpyZXNldCwgOmhpZGRlbiwgOnJhZGlvLCA6Y2hlY2tib3gsIFtkYXRhLWFiaWRlLWlnbm9yZV0nKS52YWwoJycpLnJlbW92ZUF0dHIoJ2RhdGEtaW52YWxpZCcpO1xuICAgICQoJzppbnB1dDpyYWRpbycsICRmb3JtKS5ub3QoJ1tkYXRhLWFiaWRlLWlnbm9yZV0nKS5wcm9wKCdjaGVja2VkJyxmYWxzZSkucmVtb3ZlQXR0cignZGF0YS1pbnZhbGlkJyk7XG4gICAgJCgnOmlucHV0OmNoZWNrYm94JywgJGZvcm0pLm5vdCgnW2RhdGEtYWJpZGUtaWdub3JlXScpLnByb3AoJ2NoZWNrZWQnLGZhbHNlKS5yZW1vdmVBdHRyKCdkYXRhLWludmFsaWQnKTtcbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBmb3JtIGhhcyBiZWVuIHJlc2V0LlxuICAgICAqIEBldmVudCBBYmlkZSNmb3JtcmVzZXRcbiAgICAgKi9cbiAgICAkZm9ybS50cmlnZ2VyKCdmb3JtcmVzZXQuemYuYWJpZGUnLCBbJGZvcm1dKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBBYmlkZS5cbiAgICogUmVtb3ZlcyBlcnJvciBzdHlsZXMgYW5kIGNsYXNzZXMgZnJvbSBlbGVtZW50cywgd2l0aG91dCByZXNldHRpbmcgdGhlaXIgdmFsdWVzLlxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5vZmYoJy5hYmlkZScpXG4gICAgICAuZmluZCgnW2RhdGEtYWJpZGUtZXJyb3JdJylcbiAgICAgICAgLmNzcygnZGlzcGxheScsICdub25lJyk7XG5cbiAgICB0aGlzLiRpbnB1dHNcbiAgICAgIC5vZmYoJy5hYmlkZScpXG4gICAgICAuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMucmVtb3ZlRXJyb3JDbGFzc2VzKCQodGhpcykpO1xuICAgICAgfSk7XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cbiAqL1xuQWJpZGUuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBUaGUgZGVmYXVsdCBldmVudCB0byB2YWxpZGF0ZSBpbnB1dHMuIENoZWNrYm94ZXMgYW5kIHJhZGlvcyB2YWxpZGF0ZSBpbW1lZGlhdGVseS5cbiAgICogUmVtb3ZlIG9yIGNoYW5nZSB0aGlzIHZhbHVlIGZvciBtYW51YWwgdmFsaWRhdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnZmllbGRDaGFuZ2UnXG4gICAqL1xuICB2YWxpZGF0ZU9uOiAnZmllbGRDaGFuZ2UnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyB0byBiZSBhcHBsaWVkIHRvIGlucHV0IGxhYmVscyBvbiBmYWlsZWQgdmFsaWRhdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnaXMtaW52YWxpZC1sYWJlbCdcbiAgICovXG4gIGxhYmVsRXJyb3JDbGFzczogJ2lzLWludmFsaWQtbGFiZWwnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyB0byBiZSBhcHBsaWVkIHRvIGlucHV0cyBvbiBmYWlsZWQgdmFsaWRhdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnaXMtaW52YWxpZC1pbnB1dCdcbiAgICovXG4gIGlucHV0RXJyb3JDbGFzczogJ2lzLWludmFsaWQtaW5wdXQnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBzZWxlY3RvciB0byB1c2UgdG8gdGFyZ2V0IEZvcm0gRXJyb3JzIGZvciBzaG93L2hpZGUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJy5mb3JtLWVycm9yJ1xuICAgKi9cbiAgZm9ybUVycm9yU2VsZWN0b3I6ICcuZm9ybS1lcnJvcicsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFkZGVkIHRvIEZvcm0gRXJyb3JzIG9uIGZhaWxlZCB2YWxpZGF0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdpcy12aXNpYmxlJ1xuICAgKi9cbiAgZm9ybUVycm9yQ2xhc3M6ICdpcy12aXNpYmxlJyxcblxuICAvKipcbiAgICogU2V0IHRvIHRydWUgdG8gdmFsaWRhdGUgdGV4dCBpbnB1dHMgb24gYW55IHZhbHVlIGNoYW5nZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgbGl2ZVZhbGlkYXRlOiBmYWxzZSxcblxuICAvKipcbiAgICogU2V0IHRvIHRydWUgdG8gdmFsaWRhdGUgaW5wdXRzIG9uIGJsdXIuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIHZhbGlkYXRlT25CbHVyOiBmYWxzZSxcblxuICBwYXR0ZXJuczoge1xuICAgIGFscGhhIDogL15bYS16QS1aXSskLyxcbiAgICBhbHBoYV9udW1lcmljIDogL15bYS16QS1aMC05XSskLyxcbiAgICBpbnRlZ2VyIDogL15bLStdP1xcZCskLyxcbiAgICBudW1iZXIgOiAvXlstK10/XFxkKig/OltcXC5cXCxdXFxkKyk/JC8sXG5cbiAgICAvLyBhbWV4LCB2aXNhLCBkaW5lcnNcbiAgICBjYXJkIDogL14oPzo0WzAtOV17MTJ9KD86WzAtOV17M30pP3w1WzEtNV1bMC05XXsxNH18Nig/OjAxMXw1WzAtOV1bMC05XSlbMC05XXsxMn18M1s0N11bMC05XXsxM318Myg/OjBbMC01XXxbNjhdWzAtOV0pWzAtOV17MTF9fCg/OjIxMzF8MTgwMHwzNVxcZHszfSlcXGR7MTF9KSQvLFxuICAgIGN2diA6IC9eKFswLTldKXszLDR9JC8sXG5cbiAgICAvLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS9zdGF0ZXMtb2YtdGhlLXR5cGUtYXR0cmlidXRlLmh0bWwjdmFsaWQtZS1tYWlsLWFkZHJlc3NcbiAgICBlbWFpbCA6IC9eW2EtekEtWjAtOS4hIyQlJicqK1xcLz0/Xl9ge3x9fi1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKyQvLFxuXG4gICAgdXJsIDogL14oaHR0cHM/fGZ0cHxmaWxlfHNzaCk6XFwvXFwvKCgoKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDopKkApPygoKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKSl8KCgoW2EtekEtWl18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpBLVpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpBLVpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLikrKChbYS16QS1aXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16QS1aXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpBLVpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuPykoOlxcZCopPykoXFwvKCgoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKSsoXFwvKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApKikqKT8pPyhcXD8oKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApfFtcXHVFMDAwLVxcdUY4RkZdfFxcL3xcXD8pKik/KFxcIygoKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCl8XFwvfFxcPykqKT8kLyxcbiAgICAvLyBhYmMuZGVcbiAgICBkb21haW4gOiAvXihbYS16QS1aMC05XShbYS16QS1aMC05XFwtXXswLDYxfVthLXpBLVowLTldKT9cXC4pK1thLXpBLVpdezIsOH0kLyxcblxuICAgIGRhdGV0aW1lIDogL14oWzAtMl1bMC05XXszfSlcXC0oWzAtMV1bMC05XSlcXC0oWzAtM11bMC05XSlUKFswLTVdWzAtOV0pXFw6KFswLTVdWzAtOV0pXFw6KFswLTVdWzAtOV0pKFp8KFtcXC1cXCtdKFswLTFdWzAtOV0pXFw6MDApKSQvLFxuICAgIC8vIFlZWVktTU0tRERcbiAgICBkYXRlIDogLyg/OjE5fDIwKVswLTldezJ9LSg/Oig/OjBbMS05XXwxWzAtMl0pLSg/OjBbMS05XXwxWzAtOV18MlswLTldKXwoPzooPyEwMikoPzowWzEtOV18MVswLTJdKS0oPzozMCkpfCg/Oig/OjBbMTM1NzhdfDFbMDJdKS0zMSkpJC8sXG4gICAgLy8gSEg6TU06U1NcbiAgICB0aW1lIDogL14oMFswLTldfDFbMC05XXwyWzAtM10pKDpbMC01XVswLTldKXsyfSQvLFxuICAgIGRhdGVJU08gOiAvXlxcZHs0fVtcXC9cXC1dXFxkezEsMn1bXFwvXFwtXVxcZHsxLDJ9JC8sXG4gICAgLy8gTU0vREQvWVlZWVxuICAgIG1vbnRoX2RheV95ZWFyIDogL14oMFsxLTldfDFbMDEyXSlbLSBcXC8uXSgwWzEtOV18WzEyXVswLTldfDNbMDFdKVstIFxcLy5dXFxkezR9JC8sXG4gICAgLy8gREQvTU0vWVlZWVxuICAgIGRheV9tb250aF95ZWFyIDogL14oMFsxLTldfFsxMl1bMC05XXwzWzAxXSlbLSBcXC8uXSgwWzEtOV18MVswMTJdKVstIFxcLy5dXFxkezR9JC8sXG5cbiAgICAvLyAjRkZGIG9yICNGRkZGRkZcbiAgICBjb2xvciA6IC9eIz8oW2EtZkEtRjAtOV17Nn18W2EtZkEtRjAtOV17M30pJC9cbiAgfSxcblxuICAvKipcbiAgICogT3B0aW9uYWwgdmFsaWRhdGlvbiBmdW5jdGlvbnMgdG8gYmUgdXNlZC4gYGVxdWFsVG9gIGJlaW5nIHRoZSBvbmx5IGRlZmF1bHQgaW5jbHVkZWQgZnVuY3Rpb24uXG4gICAqIEZ1bmN0aW9ucyBzaG91bGQgcmV0dXJuIG9ubHkgYSBib29sZWFuIGlmIHRoZSBpbnB1dCBpcyB2YWxpZCBvciBub3QuIEZ1bmN0aW9ucyBhcmUgZ2l2ZW4gdGhlIGZvbGxvd2luZyBhcmd1bWVudHM6XG4gICAqIGVsIDogVGhlIGpRdWVyeSBlbGVtZW50IHRvIHZhbGlkYXRlLlxuICAgKiByZXF1aXJlZCA6IEJvb2xlYW4gdmFsdWUgb2YgdGhlIHJlcXVpcmVkIGF0dHJpYnV0ZSBiZSBwcmVzZW50IG9yIG5vdC5cbiAgICogcGFyZW50IDogVGhlIGRpcmVjdCBwYXJlbnQgb2YgdGhlIGlucHV0LlxuICAgKiBAb3B0aW9uXG4gICAqL1xuICB2YWxpZGF0b3JzOiB7XG4gICAgZXF1YWxUbzogZnVuY3Rpb24gKGVsLCByZXF1aXJlZCwgcGFyZW50KSB7XG4gICAgICByZXR1cm4gJChgIyR7ZWwuYXR0cignZGF0YS1lcXVhbHRvJyl9YCkudmFsKCkgPT09IGVsLnZhbCgpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oQWJpZGUsICdBYmlkZScpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogQWNjb3JkaW9uIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5hY2NvcmRpb25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKi9cblxuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gYWNjb3JkaW9uLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIEFjY29yZGlvbiNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYW4gYWNjb3JkaW9uLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIGEgcGxhaW4gb2JqZWN0IHdpdGggc2V0dGluZ3MgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQWNjb3JkaW9uLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdBY2NvcmRpb24nKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdBY2NvcmRpb24nLCB7XG4gICAgICAnRU5URVInOiAndG9nZ2xlJyxcbiAgICAgICdTUEFDRSc6ICd0b2dnbGUnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGFjY29yZGlvbiBieSBhbmltYXRpbmcgdGhlIHByZXNldCBhY3RpdmUgcGFuZShzKS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cigncm9sZScsICd0YWJsaXN0Jyk7XG4gICAgdGhpcy4kdGFicyA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJ1tkYXRhLWFjY29yZGlvbi1pdGVtXScpO1xuXG4gICAgdGhpcy4kdGFicy5lYWNoKGZ1bmN0aW9uKGlkeCwgZWwpIHtcbiAgICAgIHZhciAkZWwgPSAkKGVsKSxcbiAgICAgICAgICAkY29udGVudCA9ICRlbC5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyksXG4gICAgICAgICAgaWQgPSAkY29udGVudFswXS5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdhY2NvcmRpb24nKSxcbiAgICAgICAgICBsaW5rSWQgPSBlbC5pZCB8fCBgJHtpZH0tbGFiZWxgO1xuXG4gICAgICAkZWwuZmluZCgnYTpmaXJzdCcpLmF0dHIoe1xuICAgICAgICAnYXJpYS1jb250cm9scyc6IGlkLFxuICAgICAgICAncm9sZSc6ICd0YWInLFxuICAgICAgICAnaWQnOiBsaW5rSWQsXG4gICAgICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2UsXG4gICAgICAgICdhcmlhLXNlbGVjdGVkJzogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICAkY29udGVudC5hdHRyKHsncm9sZSc6ICd0YWJwYW5lbCcsICdhcmlhLWxhYmVsbGVkYnknOiBsaW5rSWQsICdhcmlhLWhpZGRlbic6IHRydWUsICdpZCc6IGlkfSk7XG4gICAgfSk7XG4gICAgdmFyICRpbml0QWN0aXZlID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXMtYWN0aXZlJykuY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xuICAgIGlmKCRpbml0QWN0aXZlLmxlbmd0aCl7XG4gICAgICB0aGlzLmRvd24oJGluaXRBY3RpdmUsIHRydWUpO1xuICAgIH1cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIGFjY29yZGlvbi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJHRhYnMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkZWxlbSA9ICQodGhpcyk7XG4gICAgICB2YXIgJHRhYkNvbnRlbnQgPSAkZWxlbS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgICBpZiAoJHRhYkNvbnRlbnQubGVuZ3RoKSB7XG4gICAgICAgICRlbGVtLmNoaWxkcmVuKCdhJykub2ZmKCdjbGljay56Zi5hY2NvcmRpb24ga2V5ZG93bi56Zi5hY2NvcmRpb24nKVxuICAgICAgICAgICAgICAgLm9uKCdjbGljay56Zi5hY2NvcmRpb24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIF90aGlzLnRvZ2dsZSgkdGFiQ29udGVudCk7XG4gICAgICAgIH0pLm9uKCdrZXlkb3duLnpmLmFjY29yZGlvbicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdBY2NvcmRpb24nLCB7XG4gICAgICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBfdGhpcy50b2dnbGUoJHRhYkNvbnRlbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgJGEgPSAkZWxlbS5uZXh0KCkuZmluZCgnYScpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIGlmICghX3RoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCkge1xuICAgICAgICAgICAgICAgICRhLnRyaWdnZXIoJ2NsaWNrLnpmLmFjY29yZGlvbicpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciAkYSA9ICRlbGVtLnByZXYoKS5maW5kKCdhJykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgaWYgKCFfdGhpcy5vcHRpb25zLm11bHRpRXhwYW5kKSB7XG4gICAgICAgICAgICAgICAgJGEudHJpZ2dlcignY2xpY2suemYuYWNjb3JkaW9uJylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIHNlbGVjdGVkIGNvbnRlbnQgcGFuZSdzIG9wZW4vY2xvc2Ugc3RhdGUuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0galF1ZXJ5IG9iamVjdCBvZiB0aGUgcGFuZSB0byB0b2dnbGUgKGAuYWNjb3JkaW9uLWNvbnRlbnRgKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICB0b2dnbGUoJHRhcmdldCkge1xuICAgIGlmKCR0YXJnZXQucGFyZW50KCkuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICB0aGlzLnVwKCR0YXJnZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRvd24oJHRhcmdldCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSBhY2NvcmRpb24gdGFiIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIEFjY29yZGlvbiBwYW5lIHRvIG9wZW4gKGAuYWNjb3JkaW9uLWNvbnRlbnRgKS5cbiAgICogQHBhcmFtIHtCb29sZWFufSBmaXJzdFRpbWUgLSBmbGFnIHRvIGRldGVybWluZSBpZiByZWZsb3cgc2hvdWxkIGhhcHBlbi5cbiAgICogQGZpcmVzIEFjY29yZGlvbiNkb3duXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZG93bigkdGFyZ2V0LCBmaXJzdFRpbWUpIHtcbiAgICAkdGFyZ2V0XG4gICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCBmYWxzZSlcbiAgICAgIC5wYXJlbnQoJ1tkYXRhLXRhYi1jb250ZW50XScpXG4gICAgICAuYWRkQmFjaygpXG4gICAgICAucGFyZW50KCkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMubXVsdGlFeHBhbmQgJiYgIWZpcnN0VGltZSkge1xuICAgICAgdmFyICRjdXJyZW50QWN0aXZlID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignLmlzLWFjdGl2ZScpLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKTtcbiAgICAgIGlmICgkY3VycmVudEFjdGl2ZS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy51cCgkY3VycmVudEFjdGl2ZS5ub3QoJHRhcmdldCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgICR0YXJnZXQuc2xpZGVEb3duKHRoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCAoKSA9PiB7XG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHRhYiBpcyBkb25lIG9wZW5pbmcuXG4gICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uI2Rvd25cbiAgICAgICAqL1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdkb3duLnpmLmFjY29yZGlvbicsIFskdGFyZ2V0XSk7XG4gICAgfSk7XG5cbiAgICAkKGAjJHskdGFyZ2V0LmF0dHIoJ2FyaWEtbGFiZWxsZWRieScpfWApLmF0dHIoe1xuICAgICAgJ2FyaWEtZXhwYW5kZWQnOiB0cnVlLFxuICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSB0YWIgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gQWNjb3JkaW9uIHRhYiB0byBjbG9zZSAoYC5hY2NvcmRpb24tY29udGVudGApLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI3VwXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgdXAoJHRhcmdldCkge1xuICAgIHZhciAkYXVudHMgPSAkdGFyZ2V0LnBhcmVudCgpLnNpYmxpbmdzKCksXG4gICAgICAgIF90aGlzID0gdGhpcztcblxuICAgIGlmKCghdGhpcy5vcHRpb25zLmFsbG93QWxsQ2xvc2VkICYmICEkYXVudHMuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB8fCAhJHRhcmdldC5wYXJlbnQoKS5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBGb3VuZGF0aW9uLk1vdmUodGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsICR0YXJnZXQsIGZ1bmN0aW9uKCl7XG4gICAgICAkdGFyZ2V0LnNsaWRlVXAoX3RoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB0YWIgaXMgZG9uZSBjb2xsYXBzaW5nIHVwLlxuICAgICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uI3VwXG4gICAgICAgICAqL1xuICAgICAgICBfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCd1cC56Zi5hY2NvcmRpb24nLCBbJHRhcmdldF0pO1xuICAgICAgfSk7XG4gICAgLy8gfSk7XG5cbiAgICAkdGFyZ2V0LmF0dHIoJ2FyaWEtaGlkZGVuJywgdHJ1ZSlcbiAgICAgICAgICAgLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcblxuICAgICQoYCMkeyR0YXJnZXQuYXR0cignYXJpYS1sYWJlbGxlZGJ5Jyl9YCkuYXR0cih7XG4gICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2UsXG4gICAgICdhcmlhLXNlbGVjdGVkJzogZmFsc2VcbiAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGFuIGFjY29yZGlvbi5cbiAgICogQGZpcmVzIEFjY29yZGlvbiNkZXN0cm95ZWRcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtdGFiLWNvbnRlbnRdJykuc3RvcCh0cnVlKS5zbGlkZVVwKDApLmNzcygnZGlzcGxheScsICcnKTtcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ2EnKS5vZmYoJy56Zi5hY2NvcmRpb24nKTtcblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5BY2NvcmRpb24uZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSB0byBhbmltYXRlIHRoZSBvcGVuaW5nIG9mIGFuIGFjY29yZGlvbiBwYW5lLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDI1MFxuICAgKi9cbiAgc2xpZGVTcGVlZDogMjUwLFxuICAvKipcbiAgICogQWxsb3cgdGhlIGFjY29yZGlvbiB0byBoYXZlIG11bHRpcGxlIG9wZW4gcGFuZXMuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIG11bHRpRXhwYW5kOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93IHRoZSBhY2NvcmRpb24gdG8gY2xvc2UgYWxsIHBhbmVzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBhbGxvd0FsbENsb3NlZDogZmFsc2Vcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihBY2NvcmRpb24sICdBY2NvcmRpb24nKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIEFjY29yZGlvbk1lbnUgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmFjY29yZGlvbk1lbnVcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm5lc3RcbiAqL1xuXG5jbGFzcyBBY2NvcmRpb25NZW51IHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gYWNjb3JkaW9uIG1lbnUuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgQWNjb3JkaW9uTWVudSNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYW4gYWNjb3JkaW9uIG1lbnUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQWNjb3JkaW9uTWVudS5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgRm91bmRhdGlvbi5OZXN0LkZlYXRoZXIodGhpcy4kZWxlbWVudCwgJ2FjY29yZGlvbicpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnQWNjb3JkaW9uTWVudScpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ0FjY29yZGlvbk1lbnUnLCB7XG4gICAgICAnRU5URVInOiAndG9nZ2xlJyxcbiAgICAgICdTUEFDRSc6ICd0b2dnbGUnLFxuICAgICAgJ0FSUk9XX1JJR0hUJzogJ29wZW4nLFxuICAgICAgJ0FSUk9XX1VQJzogJ3VwJyxcbiAgICAgICdBUlJPV19ET1dOJzogJ2Rvd24nLFxuICAgICAgJ0FSUk9XX0xFRlQnOiAnY2xvc2UnLFxuICAgICAgJ0VTQ0FQRSc6ICdjbG9zZUFsbCdcbiAgICB9KTtcbiAgfVxuXG5cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGFjY29yZGlvbiBtZW51IGJ5IGhpZGluZyBhbGwgbmVzdGVkIG1lbnVzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1zdWJtZW51XScpLm5vdCgnLmlzLWFjdGl2ZScpLnNsaWRlVXAoMCk7Ly8uZmluZCgnYScpLmNzcygncGFkZGluZy1sZWZ0JywgJzFyZW0nKTtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoe1xuICAgICAgJ3JvbGUnOiAnbWVudScsXG4gICAgICAnYXJpYS1tdWx0aXNlbGVjdGFibGUnOiB0aGlzLm9wdGlvbnMubXVsdGlPcGVuXG4gICAgfSk7XG5cbiAgICB0aGlzLiRtZW51TGlua3MgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5pcy1hY2NvcmRpb24tc3VibWVudS1wYXJlbnQnKTtcbiAgICB0aGlzLiRtZW51TGlua3MuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyIGxpbmtJZCA9IHRoaXMuaWQgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAnYWNjLW1lbnUtbGluaycpLFxuICAgICAgICAgICRlbGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAkc3ViID0gJGVsZW0uY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJyksXG4gICAgICAgICAgc3ViSWQgPSAkc3ViWzBdLmlkIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ2FjYy1tZW51JyksXG4gICAgICAgICAgaXNBY3RpdmUgPSAkc3ViLmhhc0NsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICRlbGVtLmF0dHIoe1xuICAgICAgICAnYXJpYS1jb250cm9scyc6IHN1YklkLFxuICAgICAgICAnYXJpYS1leHBhbmRlZCc6IGlzQWN0aXZlLFxuICAgICAgICAncm9sZSc6ICdtZW51aXRlbScsXG4gICAgICAgICdpZCc6IGxpbmtJZFxuICAgICAgfSk7XG4gICAgICAkc3ViLmF0dHIoe1xuICAgICAgICAnYXJpYS1sYWJlbGxlZGJ5JzogbGlua0lkLFxuICAgICAgICAnYXJpYS1oaWRkZW4nOiAhaXNBY3RpdmUsXG4gICAgICAgICdyb2xlJzogJ21lbnUnLFxuICAgICAgICAnaWQnOiBzdWJJZFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdmFyIGluaXRQYW5lcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWFjdGl2ZScpO1xuICAgIGlmKGluaXRQYW5lcy5sZW5ndGgpe1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgIGluaXRQYW5lcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIF90aGlzLmRvd24oJCh0aGlzKSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSBtZW51LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdsaScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJHN1Ym1lbnUgPSAkKHRoaXMpLmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XScpO1xuXG4gICAgICBpZiAoJHN1Ym1lbnUubGVuZ3RoKSB7XG4gICAgICAgICQodGhpcykuY2hpbGRyZW4oJ2EnKS5vZmYoJ2NsaWNrLnpmLmFjY29yZGlvbk1lbnUnKS5vbignY2xpY2suemYuYWNjb3JkaW9uTWVudScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICBfdGhpcy50b2dnbGUoJHN1Ym1lbnUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KS5vbigna2V5ZG93bi56Zi5hY2NvcmRpb25tZW51JywgZnVuY3Rpb24oZSl7XG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAgICRlbGVtZW50cyA9ICRlbGVtZW50LnBhcmVudCgndWwnKS5jaGlsZHJlbignbGknKSxcbiAgICAgICAgICAkcHJldkVsZW1lbnQsXG4gICAgICAgICAgJG5leHRFbGVtZW50LFxuICAgICAgICAgICR0YXJnZXQgPSAkZWxlbWVudC5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKTtcblxuICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICBpZiAoJCh0aGlzKS5pcygkZWxlbWVudCkpIHtcbiAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5tYXgoMCwgaS0xKSkuZmluZCgnYScpLmZpcnN0KCk7XG4gICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKE1hdGgubWluKGkrMSwgJGVsZW1lbnRzLmxlbmd0aC0xKSkuZmluZCgnYScpLmZpcnN0KCk7XG5cbiAgICAgICAgICBpZiAoJCh0aGlzKS5jaGlsZHJlbignW2RhdGEtc3VibWVudV06dmlzaWJsZScpLmxlbmd0aCkgeyAvLyBoYXMgb3BlbiBzdWIgbWVudVxuICAgICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnQuZmluZCgnbGk6Zmlyc3QtY2hpbGQnKS5maW5kKCdhJykuZmlyc3QoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCQodGhpcykuaXMoJzpmaXJzdC1jaGlsZCcpKSB7IC8vIGlzIGZpcnN0IGVsZW1lbnQgb2Ygc3ViIG1lbnVcbiAgICAgICAgICAgICRwcmV2RWxlbWVudCA9ICRlbGVtZW50LnBhcmVudHMoJ2xpJykuZmlyc3QoKS5maW5kKCdhJykuZmlyc3QoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCRwcmV2RWxlbWVudC5wYXJlbnRzKCdsaScpLmZpcnN0KCkuY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdOnZpc2libGUnKS5sZW5ndGgpIHsgLy8gaWYgcHJldmlvdXMgZWxlbWVudCBoYXMgb3BlbiBzdWIgbWVudVxuICAgICAgICAgICAgJHByZXZFbGVtZW50ID0gJHByZXZFbGVtZW50LnBhcmVudHMoJ2xpJykuZmluZCgnbGk6bGFzdC1jaGlsZCcpLmZpbmQoJ2EnKS5maXJzdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJCh0aGlzKS5pcygnOmxhc3QtY2hpbGQnKSkgeyAvLyBpcyBsYXN0IGVsZW1lbnQgb2Ygc3ViIG1lbnVcbiAgICAgICAgICAgICRuZXh0RWxlbWVudCA9ICRlbGVtZW50LnBhcmVudHMoJ2xpJykuZmlyc3QoKS5uZXh0KCdsaScpLmZpbmQoJ2EnKS5maXJzdCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdBY2NvcmRpb25NZW51Jywge1xuICAgICAgICBvcGVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoJHRhcmdldC5pcygnOmhpZGRlbicpKSB7XG4gICAgICAgICAgICBfdGhpcy5kb3duKCR0YXJnZXQpO1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKCdsaScpLmZpcnN0KCkuZmluZCgnYScpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoJHRhcmdldC5sZW5ndGggJiYgISR0YXJnZXQuaXMoJzpoaWRkZW4nKSkgeyAvLyBjbG9zZSBhY3RpdmUgc3ViIG9mIHRoaXMgaXRlbVxuICAgICAgICAgICAgX3RoaXMudXAoJHRhcmdldCk7XG4gICAgICAgICAgfSBlbHNlIGlmICgkZWxlbWVudC5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKSB7IC8vIGNsb3NlIGN1cnJlbnRseSBvcGVuIHN1YlxuICAgICAgICAgICAgX3RoaXMudXAoJGVsZW1lbnQucGFyZW50KCdbZGF0YS1zdWJtZW51XScpKTtcbiAgICAgICAgICAgICRlbGVtZW50LnBhcmVudHMoJ2xpJykuZmlyc3QoKS5maW5kKCdhJykuZmlyc3QoKS5mb2N1cygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRwcmV2RWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9nZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoJGVsZW1lbnQuY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKSB7XG4gICAgICAgICAgICBfdGhpcy50b2dnbGUoJGVsZW1lbnQuY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2VBbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF90aGlzLmhpZGVBbGwoKTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24ocHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICBpZiAocHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7Ly8uYXR0cigndGFiaW5kZXgnLCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgYWxsIHBhbmVzIG9mIHRoZSBtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGhpZGVBbGwoKSB7XG4gICAgdGhpcy51cCh0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXN1Ym1lbnVdJykpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIGFsbCBwYW5lcyBvZiB0aGUgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBzaG93QWxsKCkge1xuICAgIHRoaXMuZG93bih0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXN1Ym1lbnVdJykpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIG9wZW4vY2xvc2Ugc3RhdGUgb2YgYSBzdWJtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSB0aGUgc3VibWVudSB0byB0b2dnbGVcbiAgICovXG4gIHRvZ2dsZSgkdGFyZ2V0KXtcbiAgICBpZighJHRhcmdldC5pcygnOmFuaW1hdGVkJykpIHtcbiAgICAgIGlmICghJHRhcmdldC5pcygnOmhpZGRlbicpKSB7XG4gICAgICAgIHRoaXMudXAoJHRhcmdldCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5kb3duKCR0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgc3ViLW1lbnUgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gU3ViLW1lbnUgdG8gb3Blbi5cbiAgICogQGZpcmVzIEFjY29yZGlvbk1lbnUjZG93blxuICAgKi9cbiAgZG93bigkdGFyZ2V0KSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmKCF0aGlzLm9wdGlvbnMubXVsdGlPcGVuKSB7XG4gICAgICB0aGlzLnVwKHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWFjdGl2ZScpLm5vdCgkdGFyZ2V0LnBhcmVudHNVbnRpbCh0aGlzLiRlbGVtZW50KS5hZGQoJHRhcmdldCkpKTtcbiAgICB9XG5cbiAgICAkdGFyZ2V0LmFkZENsYXNzKCdpcy1hY3RpdmUnKS5hdHRyKHsnYXJpYS1oaWRkZW4nOiBmYWxzZX0pXG4gICAgICAucGFyZW50KCcuaXMtYWNjb3JkaW9uLXN1Ym1lbnUtcGFyZW50JykuYXR0cih7J2FyaWEtZXhwYW5kZWQnOiB0cnVlfSk7XG5cbiAgICAgIC8vRm91bmRhdGlvbi5Nb3ZlKHRoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCAkdGFyZ2V0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgJHRhcmdldC5zbGlkZURvd24oX3RoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgbWVudSBpcyBkb25lIG9wZW5pbmcuXG4gICAgICAgICAgICogQGV2ZW50IEFjY29yZGlvbk1lbnUjZG93blxuICAgICAgICAgICAqL1xuICAgICAgICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Rvd24uemYuYWNjb3JkaW9uTWVudScsIFskdGFyZ2V0XSk7XG4gICAgICAgIH0pO1xuICAgICAgLy99KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIHN1Yi1tZW51IGRlZmluZWQgYnkgYCR0YXJnZXRgLiBBbGwgc3ViLW1lbnVzIGluc2lkZSB0aGUgdGFyZ2V0IHdpbGwgYmUgY2xvc2VkIGFzIHdlbGwuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gU3ViLW1lbnUgdG8gY2xvc2UuXG4gICAqIEBmaXJlcyBBY2NvcmRpb25NZW51I3VwXG4gICAqL1xuICB1cCgkdGFyZ2V0KSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAvL0ZvdW5kYXRpb24uTW92ZSh0aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgJHRhcmdldCwgZnVuY3Rpb24oKXtcbiAgICAgICR0YXJnZXQuc2xpZGVVcChfdGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG1lbnUgaXMgZG9uZSBjb2xsYXBzaW5nIHVwLlxuICAgICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uTWVudSN1cFxuICAgICAgICAgKi9cbiAgICAgICAgX3RoaXMuJGVsZW1lbnQudHJpZ2dlcigndXAuemYuYWNjb3JkaW9uTWVudScsIFskdGFyZ2V0XSk7XG4gICAgICB9KTtcbiAgICAvL30pO1xuXG4gICAgdmFyICRtZW51cyA9ICR0YXJnZXQuZmluZCgnW2RhdGEtc3VibWVudV0nKS5zbGlkZVVwKDApLmFkZEJhY2soKS5hdHRyKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuXG4gICAgJG1lbnVzLnBhcmVudCgnLmlzLWFjY29yZGlvbi1zdWJtZW51LXBhcmVudCcpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgYWNjb3JkaW9uIG1lbnUuXG4gICAqIEBmaXJlcyBBY2NvcmRpb25NZW51I2Rlc3Ryb3llZFxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXN1Ym1lbnVdJykuc2xpZGVEb3duKDApLmNzcygnZGlzcGxheScsICcnKTtcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ2EnKS5vZmYoJ2NsaWNrLnpmLmFjY29yZGlvbk1lbnUnKTtcblxuICAgIEZvdW5kYXRpb24uTmVzdC5CdXJuKHRoaXMuJGVsZW1lbnQsICdhY2NvcmRpb24nKTtcbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuQWNjb3JkaW9uTWVudS5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIHRvIGFuaW1hdGUgdGhlIG9wZW5pbmcgb2YgYSBzdWJtZW51IGluIG1zLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDI1MFxuICAgKi9cbiAgc2xpZGVTcGVlZDogMjUwLFxuICAvKipcbiAgICogQWxsb3cgdGhlIG1lbnUgdG8gaGF2ZSBtdWx0aXBsZSBvcGVuIHBhbmVzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIHRydWVcbiAgICovXG4gIG11bHRpT3BlbjogdHJ1ZVxufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKEFjY29yZGlvbk1lbnUsICdBY2NvcmRpb25NZW51Jyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBEcmlsbGRvd24gbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmRyaWxsZG93blxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubmVzdFxuICovXG5cbmNsYXNzIERyaWxsZG93biB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGEgZHJpbGxkb3duIG1lbnUuXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGFuIGFjY29yZGlvbiBtZW51LlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIERyaWxsZG93bi5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgRm91bmRhdGlvbi5OZXN0LkZlYXRoZXIodGhpcy4kZWxlbWVudCwgJ2RyaWxsZG93bicpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnRHJpbGxkb3duJyk7XG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignRHJpbGxkb3duJywge1xuICAgICAgJ0VOVEVSJzogJ29wZW4nLFxuICAgICAgJ1NQQUNFJzogJ29wZW4nLFxuICAgICAgJ0FSUk9XX1JJR0hUJzogJ25leHQnLFxuICAgICAgJ0FSUk9XX1VQJzogJ3VwJyxcbiAgICAgICdBUlJPV19ET1dOJzogJ2Rvd24nLFxuICAgICAgJ0FSUk9XX0xFRlQnOiAncHJldmlvdXMnLFxuICAgICAgJ0VTQ0FQRSc6ICdjbG9zZScsXG4gICAgICAnVEFCJzogJ2Rvd24nLFxuICAgICAgJ1NISUZUX1RBQic6ICd1cCdcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgZHJpbGxkb3duIGJ5IGNyZWF0aW5nIGpRdWVyeSBjb2xsZWN0aW9ucyBvZiBlbGVtZW50c1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy4kc3VibWVudUFuY2hvcnMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2xpLmlzLWRyaWxsZG93bi1zdWJtZW51LXBhcmVudCcpLmNoaWxkcmVuKCdhJyk7XG4gICAgdGhpcy4kc3VibWVudXMgPSB0aGlzLiRzdWJtZW51QW5jaG9ycy5wYXJlbnQoJ2xpJykuY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJyk7XG4gICAgdGhpcy4kbWVudUl0ZW1zID0gdGhpcy4kZWxlbWVudC5maW5kKCdsaScpLm5vdCgnLmpzLWRyaWxsZG93bi1iYWNrJykuYXR0cigncm9sZScsICdtZW51aXRlbScpLmZpbmQoJ2EnKTtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGEtbXV0YXRlJywgKHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YS1kcmlsbGRvd24nKSB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdkcmlsbGRvd24nKSkpO1xuXG4gICAgdGhpcy5fcHJlcGFyZU1lbnUoKTtcbiAgICB0aGlzLl9yZWdpc3RlckV2ZW50cygpO1xuXG4gICAgdGhpcy5fa2V5Ym9hcmRFdmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBwcmVwYXJlcyBkcmlsbGRvd24gbWVudSBieSBzZXR0aW5nIGF0dHJpYnV0ZXMgdG8gbGlua3MgYW5kIGVsZW1lbnRzXG4gICAqIHNldHMgYSBtaW4gaGVpZ2h0IHRvIHByZXZlbnQgY29udGVudCBqdW1waW5nXG4gICAqIHdyYXBzIHRoZSBlbGVtZW50IGlmIG5vdCBhbHJlYWR5IHdyYXBwZWRcbiAgICogQHByaXZhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfcHJlcGFyZU1lbnUoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAvLyBpZighdGhpcy5vcHRpb25zLmhvbGRPcGVuKXtcbiAgICAvLyAgIHRoaXMuX21lbnVMaW5rRXZlbnRzKCk7XG4gICAgLy8gfVxuICAgIHRoaXMuJHN1Ym1lbnVBbmNob3JzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkbGluayA9ICQodGhpcyk7XG4gICAgICB2YXIgJHN1YiA9ICRsaW5rLnBhcmVudCgpO1xuICAgICAgaWYoX3RoaXMub3B0aW9ucy5wYXJlbnRMaW5rKXtcbiAgICAgICAgJGxpbmsuY2xvbmUoKS5wcmVwZW5kVG8oJHN1Yi5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKSkud3JhcCgnPGxpIGNsYXNzPVwiaXMtc3VibWVudS1wYXJlbnQtaXRlbSBpcy1zdWJtZW51LWl0ZW0gaXMtZHJpbGxkb3duLXN1Ym1lbnUtaXRlbVwiIHJvbGU9XCJtZW51LWl0ZW1cIj48L2xpPicpO1xuICAgICAgfVxuICAgICAgJGxpbmsuZGF0YSgnc2F2ZWRIcmVmJywgJGxpbmsuYXR0cignaHJlZicpKS5yZW1vdmVBdHRyKCdocmVmJykuYXR0cigndGFiaW5kZXgnLCAwKTtcbiAgICAgICRsaW5rLmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XScpXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogdHJ1ZSxcbiAgICAgICAgICAgICd0YWJpbmRleCc6IDAsXG4gICAgICAgICAgICAncm9sZSc6ICdtZW51J1xuICAgICAgICAgIH0pO1xuICAgICAgX3RoaXMuX2V2ZW50cygkbGluayk7XG4gICAgfSk7XG4gICAgdGhpcy4kc3VibWVudXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyICRtZW51ID0gJCh0aGlzKSxcbiAgICAgICAgICAkYmFjayA9ICRtZW51LmZpbmQoJy5qcy1kcmlsbGRvd24tYmFjaycpO1xuICAgICAgaWYoISRiYWNrLmxlbmd0aCl7XG4gICAgICAgIHN3aXRjaCAoX3RoaXMub3B0aW9ucy5iYWNrQnV0dG9uUG9zaXRpb24pIHtcbiAgICAgICAgICBjYXNlIFwiYm90dG9tXCI6XG4gICAgICAgICAgICAkbWVudS5hcHBlbmQoX3RoaXMub3B0aW9ucy5iYWNrQnV0dG9uKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJ0b3BcIjpcbiAgICAgICAgICAgICRtZW51LnByZXBlbmQoX3RoaXMub3B0aW9ucy5iYWNrQnV0dG9uKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVW5zdXBwb3J0ZWQgYmFja0J1dHRvblBvc2l0aW9uIHZhbHVlICdcIiArIF90aGlzLm9wdGlvbnMuYmFja0J1dHRvblBvc2l0aW9uICsgXCInXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBfdGhpcy5fYmFjaygkbWVudSk7XG4gICAgfSk7XG5cbiAgICBpZighdGhpcy5vcHRpb25zLmF1dG9IZWlnaHQpIHtcbiAgICAgIHRoaXMuJHN1Ym1lbnVzLmFkZENsYXNzKCdkcmlsbGRvd24tc3VibWVudS1jb3Zlci1wcmV2aW91cycpO1xuICAgIH1cblxuICAgIGlmKCF0aGlzLiRlbGVtZW50LnBhcmVudCgpLmhhc0NsYXNzKCdpcy1kcmlsbGRvd24nKSl7XG4gICAgICB0aGlzLiR3cmFwcGVyID0gJCh0aGlzLm9wdGlvbnMud3JhcHBlcikuYWRkQ2xhc3MoJ2lzLWRyaWxsZG93bicpO1xuICAgICAgaWYodGhpcy5vcHRpb25zLmFuaW1hdGVIZWlnaHQpIHRoaXMuJHdyYXBwZXIuYWRkQ2xhc3MoJ2FuaW1hdGUtaGVpZ2h0Jyk7XG4gICAgICB0aGlzLiR3cmFwcGVyID0gdGhpcy4kZWxlbWVudC53cmFwKHRoaXMuJHdyYXBwZXIpLnBhcmVudCgpLmNzcyh0aGlzLl9nZXRNYXhEaW1zKCkpO1xuICAgIH1cbiAgfVxuXG4gIF9yZXNpemUoKSB7XG4gICAgdGhpcy4kd3JhcHBlci5jc3MoeydtYXgtd2lkdGgnOiAnbm9uZScsICdtaW4taGVpZ2h0JzogJ25vbmUnfSk7XG4gICAgLy8gX2dldE1heERpbXMgaGFzIHNpZGUgZWZmZWN0cyAoYm9vKSBidXQgY2FsbGluZyBpdCBzaG91bGQgdXBkYXRlIGFsbCBvdGhlciBuZWNlc3NhcnkgaGVpZ2h0cyAmIHdpZHRoc1xuICAgIHRoaXMuJHdyYXBwZXIuY3NzKHRoaXMuX2dldE1heERpbXMoKSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyB0byBlbGVtZW50cyBpbiB0aGUgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIHRoZSBjdXJyZW50IG1lbnUgaXRlbSB0byBhZGQgaGFuZGxlcnMgdG8uXG4gICAqL1xuICBfZXZlbnRzKCRlbGVtKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICRlbGVtLm9mZignY2xpY2suemYuZHJpbGxkb3duJylcbiAgICAub24oJ2NsaWNrLnpmLmRyaWxsZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgaWYoJChlLnRhcmdldCkucGFyZW50c1VudGlsKCd1bCcsICdsaScpLmhhc0NsYXNzKCdpcy1kcmlsbGRvd24tc3VibWVudS1wYXJlbnQnKSl7XG4gICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYoZS50YXJnZXQgIT09IGUuY3VycmVudFRhcmdldC5maXJzdEVsZW1lbnRDaGlsZCl7XG4gICAgICAvLyAgIHJldHVybiBmYWxzZTtcbiAgICAgIC8vIH1cbiAgICAgIF90aGlzLl9zaG93KCRlbGVtLnBhcmVudCgnbGknKSk7XG5cbiAgICAgIGlmKF90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKXtcbiAgICAgICAgdmFyICRib2R5ID0gJCgnYm9keScpO1xuICAgICAgICAkYm9keS5vZmYoJy56Zi5kcmlsbGRvd24nKS5vbignY2xpY2suemYuZHJpbGxkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgaWYgKGUudGFyZ2V0ID09PSBfdGhpcy4kZWxlbWVudFswXSB8fCAkLmNvbnRhaW5zKF90aGlzLiRlbGVtZW50WzBdLCBlLnRhcmdldCkpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIF90aGlzLl9oaWRlQWxsKCk7XG4gICAgICAgICAgJGJvZHkub2ZmKCcuemYuZHJpbGxkb3duJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXHQgIHRoaXMuJGVsZW1lbnQub24oJ211dGF0ZW1lLnpmLnRyaWdnZXInLCB0aGlzLl9yZXNpemUuYmluZCh0aGlzKSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyB0byB0aGUgbWVudSBlbGVtZW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9yZWdpc3RlckV2ZW50cygpIHtcbiAgICBpZih0aGlzLm9wdGlvbnMuc2Nyb2xsVG9wKXtcbiAgICAgIHRoaXMuX2JpbmRIYW5kbGVyID0gdGhpcy5fc2Nyb2xsVG9wLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdvcGVuLnpmLmRyaWxsZG93biBoaWRlLnpmLmRyaWxsZG93biBjbG9zZWQuemYuZHJpbGxkb3duJyx0aGlzLl9iaW5kSGFuZGxlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjcm9sbCB0byBUb3Agb2YgRWxlbWVudCBvciBkYXRhLXNjcm9sbC10b3AtZWxlbWVudFxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIERyaWxsZG93biNzY3JvbGxtZVxuICAgKi9cbiAgX3Njcm9sbFRvcCgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciAkc2Nyb2xsVG9wRWxlbWVudCA9IF90aGlzLm9wdGlvbnMuc2Nyb2xsVG9wRWxlbWVudCE9Jyc/JChfdGhpcy5vcHRpb25zLnNjcm9sbFRvcEVsZW1lbnQpOl90aGlzLiRlbGVtZW50LFxuICAgICAgICBzY3JvbGxQb3MgPSBwYXJzZUludCgkc2Nyb2xsVG9wRWxlbWVudC5vZmZzZXQoKS50b3ArX3RoaXMub3B0aW9ucy5zY3JvbGxUb3BPZmZzZXQpO1xuICAgICQoJ2h0bWwsIGJvZHknKS5zdG9wKHRydWUpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IHNjcm9sbFBvcyB9LCBfdGhpcy5vcHRpb25zLmFuaW1hdGlvbkR1cmF0aW9uLCBfdGhpcy5vcHRpb25zLmFuaW1hdGlvbkVhc2luZyxmdW5jdGlvbigpe1xuICAgICAgLyoqXG4gICAgICAgICogRmlyZXMgYWZ0ZXIgdGhlIG1lbnUgaGFzIHNjcm9sbGVkXG4gICAgICAgICogQGV2ZW50IERyaWxsZG93biNzY3JvbGxtZVxuICAgICAgICAqL1xuICAgICAgaWYodGhpcz09PSQoJ2h0bWwnKVswXSlfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzY3JvbGxtZS56Zi5kcmlsbGRvd24nKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGtleWRvd24gZXZlbnQgbGlzdGVuZXIgdG8gYGxpYCdzIGluIHRoZSBtZW51LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2tleWJvYXJkRXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiRtZW51SXRlbXMuYWRkKHRoaXMuJGVsZW1lbnQuZmluZCgnLmpzLWRyaWxsZG93bi1iYWNrID4gYSwgLmlzLXN1Ym1lbnUtcGFyZW50LWl0ZW0gPiBhJykpLm9uKCdrZXlkb3duLnpmLmRyaWxsZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgICAkZWxlbWVudHMgPSAkZWxlbWVudC5wYXJlbnQoJ2xpJykucGFyZW50KCd1bCcpLmNoaWxkcmVuKCdsaScpLmNoaWxkcmVuKCdhJyksXG4gICAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAgICRuZXh0RWxlbWVudDtcblxuICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICBpZiAoJCh0aGlzKS5pcygkZWxlbWVudCkpIHtcbiAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5tYXgoMCwgaS0xKSk7XG4gICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKE1hdGgubWluKGkrMSwgJGVsZW1lbnRzLmxlbmd0aC0xKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0RyaWxsZG93bicsIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCRlbGVtZW50LmlzKF90aGlzLiRzdWJtZW51QW5jaG9ycykpIHtcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtZW50LnBhcmVudCgnbGknKSk7XG4gICAgICAgICAgICAkZWxlbWVudC5wYXJlbnQoJ2xpJykub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5maW5kKCd1bCBsaSBhJykuZmlsdGVyKF90aGlzLiRtZW51SXRlbXMpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKSk7XG4gICAgICAgICAgJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKS5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKCRlbGVtZW50KSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpLmNoaWxkcmVuKCdhJykuZmlyc3QoKS5mb2N1cygpO1xuICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkcHJldkVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJG5leHRFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBfdGhpcy5fYmFjaygpO1xuICAgICAgICAgIC8vX3RoaXMuJG1lbnVJdGVtcy5maXJzdCgpLmZvY3VzKCk7IC8vIGZvY3VzIHRvIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgfSxcbiAgICAgICAgb3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCEkZWxlbWVudC5pcyhfdGhpcy4kbWVudUl0ZW1zKSkgeyAvLyBub3QgbWVudSBpdGVtIG1lYW5zIGJhY2sgYnV0dG9uXG4gICAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbWVudC5wYXJlbnQoJ2xpJykucGFyZW50KCd1bCcpKTtcbiAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKS5wYXJlbnQoJ2xpJykuY2hpbGRyZW4oJ2EnKS5maXJzdCgpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIH0sIDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCRlbGVtZW50LmlzKF90aGlzLiRzdWJtZW51QW5jaG9ycykpIHtcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtZW50LnBhcmVudCgnbGknKSk7XG4gICAgICAgICAgICAkZWxlbWVudC5wYXJlbnQoJ2xpJykub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5maW5kKCd1bCBsaSBhJykuZmlsdGVyKF90aGlzLiRtZW51SXRlbXMpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbihwcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgIGlmIChwcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTsgLy8gZW5kIGtleWJvYXJkQWNjZXNzXG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIGFsbCBvcGVuIGVsZW1lbnRzLCBhbmQgcmV0dXJucyB0byByb290IG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgRHJpbGxkb3duI2Nsb3NlZFxuICAgKi9cbiAgX2hpZGVBbGwoKSB7XG4gICAgdmFyICRlbGVtID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXMtZHJpbGxkb3duLXN1Ym1lbnUuaXMtYWN0aXZlJykuYWRkQ2xhc3MoJ2lzLWNsb3NpbmcnKTtcbiAgICBpZih0aGlzLm9wdGlvbnMuYXV0b0hlaWdodCkgdGhpcy4kd3JhcHBlci5jc3Moe2hlaWdodDokZWxlbS5wYXJlbnQoKS5jbG9zZXN0KCd1bCcpLmRhdGEoJ2NhbGNIZWlnaHQnKX0pO1xuICAgICRlbGVtLm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoJGVsZW0pLCBmdW5jdGlvbihlKXtcbiAgICAgICRlbGVtLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtY2xvc2luZycpO1xuICAgIH0pO1xuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgbWVudSBpcyBmdWxseSBjbG9zZWQuXG4gICAgICAgICAqIEBldmVudCBEcmlsbGRvd24jY2xvc2VkXG4gICAgICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2xvc2VkLnpmLmRyaWxsZG93bicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgbGlzdGVuZXIgZm9yIGVhY2ggYGJhY2tgIGJ1dHRvbiwgYW5kIGNsb3NlcyBvcGVuIG1lbnVzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIERyaWxsZG93biNiYWNrXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIHRoZSBjdXJyZW50IHN1Yi1tZW51IHRvIGFkZCBgYmFja2AgZXZlbnQuXG4gICAqL1xuICBfYmFjaygkZWxlbSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgJGVsZW0ub2ZmKCdjbGljay56Zi5kcmlsbGRvd24nKTtcbiAgICAkZWxlbS5jaGlsZHJlbignLmpzLWRyaWxsZG93bi1iYWNrJylcbiAgICAgIC5vbignY2xpY2suemYuZHJpbGxkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3VzZXVwIG9uIGJhY2snKTtcbiAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW0pO1xuXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgcGFyZW50IHN1Ym1lbnUsIGNhbGwgc2hvd1xuICAgICAgICBsZXQgcGFyZW50U3ViTWVudSA9ICRlbGVtLnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpO1xuICAgICAgICBpZiAocGFyZW50U3ViTWVudS5sZW5ndGgpIHtcbiAgICAgICAgICBfdGhpcy5fc2hvdyhwYXJlbnRTdWJNZW51KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBsaXN0ZW5lciB0byBtZW51IGl0ZW1zIHcvbyBzdWJtZW51cyB0byBjbG9zZSBvcGVuIG1lbnVzIG9uIGNsaWNrLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9tZW51TGlua0V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuJG1lbnVJdGVtcy5ub3QoJy5pcy1kcmlsbGRvd24tc3VibWVudS1wYXJlbnQnKVxuICAgICAgICAub2ZmKCdjbGljay56Zi5kcmlsbGRvd24nKVxuICAgICAgICAub24oJ2NsaWNrLnpmLmRyaWxsZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIC8vIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgX3RoaXMuX2hpZGVBbGwoKTtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIGEgc3VibWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBmaXJlcyBEcmlsbGRvd24jb3BlblxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW0gLSB0aGUgY3VycmVudCBlbGVtZW50IHdpdGggYSBzdWJtZW51IHRvIG9wZW4sIGkuZS4gdGhlIGBsaWAgdGFnLlxuICAgKi9cbiAgX3Nob3coJGVsZW0pIHtcbiAgICBpZih0aGlzLm9wdGlvbnMuYXV0b0hlaWdodCkgdGhpcy4kd3JhcHBlci5jc3Moe2hlaWdodDokZWxlbS5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKS5kYXRhKCdjYWxjSGVpZ2h0Jyl9KTtcbiAgICAkZWxlbS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSk7XG4gICAgJGVsZW0uY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJykuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpLmF0dHIoJ2FyaWEtaGlkZGVuJywgZmFsc2UpO1xuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIHN1Ym1lbnUgaGFzIG9wZW5lZC5cbiAgICAgKiBAZXZlbnQgRHJpbGxkb3duI29wZW5cbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ29wZW4uemYuZHJpbGxkb3duJywgWyRlbGVtXSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhpZGVzIGEgc3VibWVudVxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIERyaWxsZG93biNoaWRlXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIHRoZSBjdXJyZW50IHN1Yi1tZW51IHRvIGhpZGUsIGkuZS4gdGhlIGB1bGAgdGFnLlxuICAgKi9cbiAgX2hpZGUoJGVsZW0pIHtcbiAgICBpZih0aGlzLm9wdGlvbnMuYXV0b0hlaWdodCkgdGhpcy4kd3JhcHBlci5jc3Moe2hlaWdodDokZWxlbS5wYXJlbnQoKS5jbG9zZXN0KCd1bCcpLmRhdGEoJ2NhbGNIZWlnaHQnKX0pO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgJGVsZW0ucGFyZW50KCdsaScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSk7XG4gICAgJGVsZW0uYXR0cignYXJpYS1oaWRkZW4nLCB0cnVlKS5hZGRDbGFzcygnaXMtY2xvc2luZycpXG4gICAgJGVsZW0uYWRkQ2xhc3MoJ2lzLWNsb3NpbmcnKVxuICAgICAgICAgLm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoJGVsZW0pLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAkZWxlbS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLWNsb3NpbmcnKTtcbiAgICAgICAgICAgJGVsZW0uYmx1cigpO1xuICAgICAgICAgfSk7XG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgc3VibWVudSBoYXMgY2xvc2VkLlxuICAgICAqIEBldmVudCBEcmlsbGRvd24jaGlkZVxuICAgICAqL1xuICAgICRlbGVtLnRyaWdnZXIoJ2hpZGUuemYuZHJpbGxkb3duJywgWyRlbGVtXSk7XG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZXMgdGhyb3VnaCB0aGUgbmVzdGVkIG1lbnVzIHRvIGNhbGN1bGF0ZSB0aGUgbWluLWhlaWdodCwgYW5kIG1heC13aWR0aCBmb3IgdGhlIG1lbnUuXG4gICAqIFByZXZlbnRzIGNvbnRlbnQganVtcGluZy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZ2V0TWF4RGltcygpIHtcbiAgICB2YXIgIG1heEhlaWdodCA9IDAsIHJlc3VsdCA9IHt9LCBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy4kc3VibWVudXMuYWRkKHRoaXMuJGVsZW1lbnQpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciBudW1PZkVsZW1zID0gJCh0aGlzKS5jaGlsZHJlbignbGknKS5sZW5ndGg7XG4gICAgICB2YXIgaGVpZ2h0ID0gRm91bmRhdGlvbi5Cb3guR2V0RGltZW5zaW9ucyh0aGlzKS5oZWlnaHQ7XG4gICAgICBtYXhIZWlnaHQgPSBoZWlnaHQgPiBtYXhIZWlnaHQgPyBoZWlnaHQgOiBtYXhIZWlnaHQ7XG4gICAgICBpZihfdGhpcy5vcHRpb25zLmF1dG9IZWlnaHQpIHtcbiAgICAgICAgJCh0aGlzKS5kYXRhKCdjYWxjSGVpZ2h0JyxoZWlnaHQpO1xuICAgICAgICBpZiAoISQodGhpcykuaGFzQ2xhc3MoJ2lzLWRyaWxsZG93bi1zdWJtZW51JykpIHJlc3VsdFsnaGVpZ2h0J10gPSBoZWlnaHQ7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZighdGhpcy5vcHRpb25zLmF1dG9IZWlnaHQpIHJlc3VsdFsnbWluLWhlaWdodCddID0gYCR7bWF4SGVpZ2h0fXB4YDtcblxuICAgIHJlc3VsdFsnbWF4LXdpZHRoJ10gPSBgJHt0aGlzLiRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRofXB4YDtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIERyaWxsZG93biBNZW51XG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICBpZih0aGlzLm9wdGlvbnMuc2Nyb2xsVG9wKSB0aGlzLiRlbGVtZW50Lm9mZignLnpmLmRyaWxsZG93bicsdGhpcy5fYmluZEhhbmRsZXIpO1xuICAgIHRoaXMuX2hpZGVBbGwoKTtcblx0ICB0aGlzLiRlbGVtZW50Lm9mZignbXV0YXRlbWUuemYudHJpZ2dlcicpO1xuICAgIEZvdW5kYXRpb24uTmVzdC5CdXJuKHRoaXMuJGVsZW1lbnQsICdkcmlsbGRvd24nKTtcbiAgICB0aGlzLiRlbGVtZW50LnVud3JhcCgpXG4gICAgICAgICAgICAgICAgIC5maW5kKCcuanMtZHJpbGxkb3duLWJhY2ssIC5pcy1zdWJtZW51LXBhcmVudC1pdGVtJykucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgLmVuZCgpLmZpbmQoJy5pcy1hY3RpdmUsIC5pcy1jbG9zaW5nLCAuaXMtZHJpbGxkb3duLXN1Ym1lbnUnKS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLWNsb3NpbmcgaXMtZHJpbGxkb3duLXN1Ym1lbnUnKVxuICAgICAgICAgICAgICAgICAuZW5kKCkuZmluZCgnW2RhdGEtc3VibWVudV0nKS5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiB0YWJpbmRleCByb2xlJyk7XG4gICAgdGhpcy4kc3VibWVudUFuY2hvcnMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcykub2ZmKCcuemYuZHJpbGxkb3duJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLiRzdWJtZW51cy5yZW1vdmVDbGFzcygnZHJpbGxkb3duLXN1Ym1lbnUtY292ZXItcHJldmlvdXMnKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnYScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkbGluayA9ICQodGhpcyk7XG4gICAgICAkbGluay5yZW1vdmVBdHRyKCd0YWJpbmRleCcpO1xuICAgICAgaWYoJGxpbmsuZGF0YSgnc2F2ZWRIcmVmJykpe1xuICAgICAgICAkbGluay5hdHRyKCdocmVmJywgJGxpbmsuZGF0YSgnc2F2ZWRIcmVmJykpLnJlbW92ZURhdGEoJ3NhdmVkSHJlZicpO1xuICAgICAgfWVsc2V7IHJldHVybjsgfVxuICAgIH0pO1xuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfTtcbn1cblxuRHJpbGxkb3duLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogTWFya3VwIHVzZWQgZm9yIEpTIGdlbmVyYXRlZCBiYWNrIGJ1dHRvbi4gUHJlcGVuZGVkICBvciBhcHBlbmRlZCAoc2VlIGJhY2tCdXR0b25Qb3NpdGlvbikgdG8gc3VibWVudSBsaXN0cyBhbmQgZGVsZXRlZCBvbiBgZGVzdHJveWAgbWV0aG9kLCAnanMtZHJpbGxkb3duLWJhY2snIGNsYXNzIHJlcXVpcmVkLiBSZW1vdmUgdGhlIGJhY2tzbGFzaCAoYFxcYCkgaWYgY29weSBhbmQgcGFzdGluZy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnPFxcbGk+PFxcYT5CYWNrPFxcL2E+PFxcL2xpPidcbiAgICovXG4gIGJhY2tCdXR0b246ICc8bGkgY2xhc3M9XCJqcy1kcmlsbGRvd24tYmFja1wiPjxhIHRhYmluZGV4PVwiMFwiPkJhY2s8L2E+PC9saT4nLFxuICAvKipcbiAgICogUG9zaXRpb24gdGhlIGJhY2sgYnV0dG9uIGVpdGhlciBhdCB0aGUgdG9wIG9yIGJvdHRvbSBvZiBkcmlsbGRvd24gc3VibWVudXMuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgYm90dG9tXG4gICAqL1xuICBiYWNrQnV0dG9uUG9zaXRpb246ICd0b3AnLFxuICAvKipcbiAgICogTWFya3VwIHVzZWQgdG8gd3JhcCBkcmlsbGRvd24gbWVudS4gVXNlIGEgY2xhc3MgbmFtZSBmb3IgaW5kZXBlbmRlbnQgc3R5bGluZzsgdGhlIEpTIGFwcGxpZWQgY2xhc3M6IGBpcy1kcmlsbGRvd25gIGlzIHJlcXVpcmVkLiBSZW1vdmUgdGhlIGJhY2tzbGFzaCAoYFxcYCkgaWYgY29weSBhbmQgcGFzdGluZy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnPFxcZGl2IGNsYXNzPVwiaXMtZHJpbGxkb3duXCI+PFxcL2Rpdj4nXG4gICAqL1xuICB3cmFwcGVyOiAnPGRpdj48L2Rpdj4nLFxuICAvKipcbiAgICogQWRkcyB0aGUgcGFyZW50IGxpbmsgdG8gdGhlIHN1Ym1lbnUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIHBhcmVudExpbms6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3cgdGhlIG1lbnUgdG8gcmV0dXJuIHRvIHJvb3QgbGlzdCBvbiBib2R5IGNsaWNrLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2s6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3cgdGhlIG1lbnUgdG8gYXV0byBhZGp1c3QgaGVpZ2h0LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBhdXRvSGVpZ2h0OiBmYWxzZSxcbiAgLyoqXG4gICAqIEFuaW1hdGUgdGhlIGF1dG8gYWRqdXN0IGhlaWdodC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgYW5pbWF0ZUhlaWdodDogZmFsc2UsXG4gIC8qKlxuICAgKiBTY3JvbGwgdG8gdGhlIHRvcCBvZiB0aGUgbWVudSBhZnRlciBvcGVuaW5nIGEgc3VibWVudSBvciBuYXZpZ2F0aW5nIGJhY2sgdXNpbmcgdGhlIG1lbnUgYmFjayBidXR0b25cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgc2Nyb2xsVG9wOiBmYWxzZSxcbiAgLyoqXG4gICAqIFN0cmluZyBqcXVlcnkgc2VsZWN0b3IgKGZvciBleGFtcGxlICdib2R5Jykgb2YgZWxlbWVudCB0byB0YWtlIG9mZnNldCgpLnRvcCBmcm9tLCBpZiBlbXB0eSBzdHJpbmcgdGhlIGRyaWxsZG93biBtZW51IG9mZnNldCgpLnRvcCBpcyB0YWtlblxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICcnXG4gICAqL1xuICBzY3JvbGxUb3BFbGVtZW50OiAnJyxcbiAgLyoqXG4gICAqIFNjcm9sbFRvcCBvZmZzZXRcbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxMDBcbiAgICovXG4gIHNjcm9sbFRvcE9mZnNldDogMCxcbiAgLyoqXG4gICAqIFNjcm9sbCBhbmltYXRpb24gZHVyYXRpb25cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSA1MDBcbiAgICovXG4gIGFuaW1hdGlvbkR1cmF0aW9uOiA1MDAsXG4gIC8qKlxuICAgKiBTY3JvbGwgYW5pbWF0aW9uIGVhc2luZ1xuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdzd2luZydcbiAgICovXG4gIGFuaW1hdGlvbkVhc2luZzogJ3N3aW5nJ1xuICAvLyBob2xkT3BlbjogZmFsc2Vcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihEcmlsbGRvd24sICdEcmlsbGRvd24nKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIERyb3Bkb3duIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5kcm9wZG93blxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5ib3hcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAqL1xuXG5jbGFzcyBEcm9wZG93biB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGEgZHJvcGRvd24uXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgZHJvcGRvd24uXG4gICAqICAgICAgICBPYmplY3Qgc2hvdWxkIGJlIG9mIHRoZSBkcm9wZG93biBwYW5lbCwgcmF0aGVyIHRoYW4gaXRzIGFuY2hvci5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBEcm9wZG93bi5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0Ryb3Bkb3duJyk7XG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignRHJvcGRvd24nLCB7XG4gICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAnRVNDQVBFJzogJ2Nsb3NlJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4gYnkgc2V0dGluZy9jaGVja2luZyBvcHRpb25zIGFuZCBhdHRyaWJ1dGVzLCBhZGRpbmcgaGVscGVyIHZhcmlhYmxlcywgYW5kIHNhdmluZyB0aGUgYW5jaG9yLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciAkaWQgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJyk7XG5cbiAgICB0aGlzLiRhbmNob3IgPSAkKGBbZGF0YS10b2dnbGU9XCIkeyRpZH1cIl1gKS5sZW5ndGggPyAkKGBbZGF0YS10b2dnbGU9XCIkeyRpZH1cIl1gKSA6ICQoYFtkYXRhLW9wZW49XCIkeyRpZH1cIl1gKTtcbiAgICB0aGlzLiRhbmNob3IuYXR0cih7XG4gICAgICAnYXJpYS1jb250cm9scyc6ICRpZCxcbiAgICAgICdkYXRhLWlzLWZvY3VzJzogZmFsc2UsXG4gICAgICAnZGF0YS15ZXRpLWJveCc6ICRpZCxcbiAgICAgICdhcmlhLWhhc3BvcHVwJzogdHJ1ZSxcbiAgICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2VcblxuICAgIH0pO1xuXG4gICAgaWYodGhpcy5vcHRpb25zLnBhcmVudENsYXNzKXtcbiAgICAgIHRoaXMuJHBhcmVudCA9IHRoaXMuJGVsZW1lbnQucGFyZW50cygnLicgKyB0aGlzLm9wdGlvbnMucGFyZW50Q2xhc3MpO1xuICAgIH1lbHNle1xuICAgICAgdGhpcy4kcGFyZW50ID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5vcHRpb25zLnBvc2l0aW9uQ2xhc3MgPSB0aGlzLmdldFBvc2l0aW9uQ2xhc3MoKTtcbiAgICB0aGlzLmNvdW50ZXIgPSA0O1xuICAgIHRoaXMudXNlZFBvc2l0aW9ucyA9IFtdO1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cih7XG4gICAgICAnYXJpYS1oaWRkZW4nOiAndHJ1ZScsXG4gICAgICAnZGF0YS15ZXRpLWJveCc6ICRpZCxcbiAgICAgICdkYXRhLXJlc2l6ZSc6ICRpZCxcbiAgICAgICdhcmlhLWxhYmVsbGVkYnknOiB0aGlzLiRhbmNob3JbMF0uaWQgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAnZGQtYW5jaG9yJylcbiAgICB9KTtcbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGN1cnJlbnQgb3JpZW50YXRpb24gb2YgZHJvcGRvd24gcGFuZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IHBvc2l0aW9uIC0gc3RyaW5nIHZhbHVlIG9mIGEgcG9zaXRpb24gY2xhc3MuXG4gICAqL1xuICBnZXRQb3NpdGlvbkNsYXNzKCkge1xuICAgIHZhciB2ZXJ0aWNhbFBvc2l0aW9uID0gdGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUubWF0Y2goLyh0b3B8bGVmdHxyaWdodHxib3R0b20pL2cpO1xuICAgICAgICB2ZXJ0aWNhbFBvc2l0aW9uID0gdmVydGljYWxQb3NpdGlvbiA/IHZlcnRpY2FsUG9zaXRpb25bMF0gOiAnJztcbiAgICB2YXIgaG9yaXpvbnRhbFBvc2l0aW9uID0gL2Zsb2F0LShcXFMrKS8uZXhlYyh0aGlzLiRhbmNob3JbMF0uY2xhc3NOYW1lKTtcbiAgICAgICAgaG9yaXpvbnRhbFBvc2l0aW9uID0gaG9yaXpvbnRhbFBvc2l0aW9uID8gaG9yaXpvbnRhbFBvc2l0aW9uWzFdIDogJyc7XG4gICAgdmFyIHBvc2l0aW9uID0gaG9yaXpvbnRhbFBvc2l0aW9uID8gaG9yaXpvbnRhbFBvc2l0aW9uICsgJyAnICsgdmVydGljYWxQb3NpdGlvbiA6IHZlcnRpY2FsUG9zaXRpb247XG5cbiAgICByZXR1cm4gcG9zaXRpb247XG4gIH1cblxuICAvKipcbiAgICogQWRqdXN0cyB0aGUgZHJvcGRvd24gcGFuZXMgb3JpZW50YXRpb24gYnkgYWRkaW5nL3JlbW92aW5nIHBvc2l0aW9uaW5nIGNsYXNzZXMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gcG9zaXRpb24gLSBwb3NpdGlvbiBjbGFzcyB0byByZW1vdmUuXG4gICAqL1xuICBfcmVwb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHRoaXMudXNlZFBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uID8gcG9zaXRpb24gOiAnYm90dG9tJyk7XG4gICAgLy9kZWZhdWx0LCB0cnkgc3dpdGNoaW5nIHRvIG9wcG9zaXRlIHNpZGVcbiAgICBpZighcG9zaXRpb24gJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCd0b3AnKSA8IDApKXtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ3RvcCcpO1xuICAgIH1lbHNlIGlmKHBvc2l0aW9uID09PSAndG9wJyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2JvdHRvbScpIDwgMCkpe1xuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhwb3NpdGlvbik7XG4gICAgfWVsc2UgaWYocG9zaXRpb24gPT09ICdsZWZ0JyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ3JpZ2h0JykgPCAwKSl7XG4gICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHBvc2l0aW9uKVxuICAgICAgICAgIC5hZGRDbGFzcygncmlnaHQnKTtcbiAgICB9ZWxzZSBpZihwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2xlZnQnKSA8IDApKXtcbiAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MocG9zaXRpb24pXG4gICAgICAgICAgLmFkZENsYXNzKCdsZWZ0Jyk7XG4gICAgfVxuXG4gICAgLy9pZiBkZWZhdWx0IGNoYW5nZSBkaWRuJ3Qgd29yaywgdHJ5IGJvdHRvbSBvciBsZWZ0IGZpcnN0XG4gICAgZWxzZSBpZighcG9zaXRpb24gJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCd0b3AnKSA+IC0xKSAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2xlZnQnKSA8IDApKXtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2xlZnQnKTtcbiAgICB9ZWxzZSBpZihwb3NpdGlvbiA9PT0gJ3RvcCcgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdib3R0b20nKSA+IC0xKSAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2xlZnQnKSA8IDApKXtcbiAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MocG9zaXRpb24pXG4gICAgICAgICAgLmFkZENsYXNzKCdsZWZ0Jyk7XG4gICAgfWVsc2UgaWYocG9zaXRpb24gPT09ICdsZWZ0JyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ3JpZ2h0JykgPiAtMSkgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdib3R0b20nKSA8IDApKXtcbiAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MocG9zaXRpb24pO1xuICAgIH1lbHNlIGlmKHBvc2l0aW9uID09PSAncmlnaHQnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignbGVmdCcpID4gLTEpICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignYm90dG9tJykgPCAwKSl7XG4gICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHBvc2l0aW9uKTtcbiAgICB9XG4gICAgLy9pZiBub3RoaW5nIGNsZWFyZWQsIHNldCB0byBib3R0b21cbiAgICBlbHNle1xuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhwb3NpdGlvbik7XG4gICAgfVxuICAgIHRoaXMuY2xhc3NDaGFuZ2VkID0gdHJ1ZTtcbiAgICB0aGlzLmNvdW50ZXItLTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBhbmQgb3JpZW50YXRpb24gb2YgdGhlIGRyb3Bkb3duIHBhbmUsIGNoZWNrcyBmb3IgY29sbGlzaW9ucy5cbiAgICogUmVjdXJzaXZlbHkgY2FsbHMgaXRzZWxmIGlmIGEgY29sbGlzaW9uIGlzIGRldGVjdGVkLCB3aXRoIGEgbmV3IHBvc2l0aW9uIGNsYXNzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRQb3NpdGlvbigpIHtcbiAgICBpZih0aGlzLiRhbmNob3IuYXR0cignYXJpYS1leHBhbmRlZCcpID09PSAnZmFsc2UnKXsgcmV0dXJuIGZhbHNlOyB9XG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5nZXRQb3NpdGlvbkNsYXNzKCksXG4gICAgICAgICRlbGVEaW1zID0gRm91bmRhdGlvbi5Cb3guR2V0RGltZW5zaW9ucyh0aGlzLiRlbGVtZW50KSxcbiAgICAgICAgJGFuY2hvckRpbXMgPSBGb3VuZGF0aW9uLkJveC5HZXREaW1lbnNpb25zKHRoaXMuJGFuY2hvciksXG4gICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgZGlyZWN0aW9uID0gKHBvc2l0aW9uID09PSAnbGVmdCcgPyAnbGVmdCcgOiAoKHBvc2l0aW9uID09PSAncmlnaHQnKSA/ICdsZWZ0JyA6ICd0b3AnKSksXG4gICAgICAgIHBhcmFtID0gKGRpcmVjdGlvbiA9PT0gJ3RvcCcpID8gJ2hlaWdodCcgOiAnd2lkdGgnLFxuICAgICAgICBvZmZzZXQgPSAocGFyYW0gPT09ICdoZWlnaHQnKSA/IHRoaXMub3B0aW9ucy52T2Zmc2V0IDogdGhpcy5vcHRpb25zLmhPZmZzZXQ7XG5cbiAgICBpZigoJGVsZURpbXMud2lkdGggPj0gJGVsZURpbXMud2luZG93RGltcy53aWR0aCkgfHwgKCF0aGlzLmNvdW50ZXIgJiYgIUZvdW5kYXRpb24uQm94LkltTm90VG91Y2hpbmdZb3UodGhpcy4kZWxlbWVudCwgdGhpcy4kcGFyZW50KSkpe1xuICAgICAgdmFyIG5ld1dpZHRoID0gJGVsZURpbXMud2luZG93RGltcy53aWR0aCxcbiAgICAgICAgICBwYXJlbnRIT2Zmc2V0ID0gMDtcbiAgICAgIGlmKHRoaXMuJHBhcmVudCl7XG4gICAgICAgIHZhciAkcGFyZW50RGltcyA9IEZvdW5kYXRpb24uQm94LkdldERpbWVuc2lvbnModGhpcy4kcGFyZW50KSxcbiAgICAgICAgICAgIHBhcmVudEhPZmZzZXQgPSAkcGFyZW50RGltcy5vZmZzZXQubGVmdDtcbiAgICAgICAgaWYgKCRwYXJlbnREaW1zLndpZHRoIDwgbmV3V2lkdGgpe1xuICAgICAgICAgIG5ld1dpZHRoID0gJHBhcmVudERpbXMud2lkdGg7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy4kZWxlbWVudC5vZmZzZXQoRm91bmRhdGlvbi5Cb3guR2V0T2Zmc2V0cyh0aGlzLiRlbGVtZW50LCB0aGlzLiRhbmNob3IsICdjZW50ZXIgYm90dG9tJywgdGhpcy5vcHRpb25zLnZPZmZzZXQsIHRoaXMub3B0aW9ucy5oT2Zmc2V0ICsgcGFyZW50SE9mZnNldCwgdHJ1ZSkpLmNzcyh7XG4gICAgICAgICd3aWR0aCc6IG5ld1dpZHRoIC0gKHRoaXMub3B0aW9ucy5oT2Zmc2V0ICogMiksXG4gICAgICAgICdoZWlnaHQnOiAnYXV0bydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5jbGFzc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuJGVsZW1lbnQub2Zmc2V0KEZvdW5kYXRpb24uQm94LkdldE9mZnNldHModGhpcy4kZWxlbWVudCwgdGhpcy4kYW5jaG9yLCBwb3NpdGlvbiwgdGhpcy5vcHRpb25zLnZPZmZzZXQsIHRoaXMub3B0aW9ucy5oT2Zmc2V0KSk7XG5cbiAgICB3aGlsZSghRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSh0aGlzLiRlbGVtZW50LCB0aGlzLiRwYXJlbnQsIHRydWUpICYmIHRoaXMuY291bnRlcil7XG4gICAgICB0aGlzLl9yZXBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgICAgIHRoaXMuX3NldFBvc2l0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBlbGVtZW50IHV0aWxpemluZyB0aGUgdHJpZ2dlcnMgdXRpbGl0eSBsaWJyYXJ5LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLiRlbGVtZW50Lm9uKHtcbiAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICAgICdjbG9zZS56Zi50cmlnZ2VyJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpLFxuICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKSxcbiAgICAgICdyZXNpemVtZS56Zi50cmlnZ2VyJzogdGhpcy5fc2V0UG9zaXRpb24uYmluZCh0aGlzKVxuICAgIH0pO1xuXG4gICAgaWYodGhpcy5vcHRpb25zLmhvdmVyKXtcbiAgICAgIHRoaXMuJGFuY2hvci5vZmYoJ21vdXNlZW50ZXIuemYuZHJvcGRvd24gbW91c2VsZWF2ZS56Zi5kcm9wZG93bicpXG4gICAgICAub24oJ21vdXNlZW50ZXIuemYuZHJvcGRvd24nLCBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgYm9keURhdGEgPSAkKCdib2R5JykuZGF0YSgpO1xuICAgICAgICBpZih0eXBlb2YoYm9keURhdGEud2hhdGlucHV0KSA9PT0gJ3VuZGVmaW5lZCcgfHwgYm9keURhdGEud2hhdGlucHV0ID09PSAnbW91c2UnKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KF90aGlzLnRpbWVvdXQpO1xuICAgICAgICAgIF90aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBfdGhpcy5vcGVuKCk7XG4gICAgICAgICAgICBfdGhpcy4kYW5jaG9yLmRhdGEoJ2hvdmVyJywgdHJ1ZSk7XG4gICAgICAgICAgfSwgX3RoaXMub3B0aW9ucy5ob3ZlckRlbGF5KTtcbiAgICAgICAgfVxuICAgICAgfSkub24oJ21vdXNlbGVhdmUuemYuZHJvcGRvd24nLCBmdW5jdGlvbigpe1xuICAgICAgICBjbGVhclRpbWVvdXQoX3RoaXMudGltZW91dCk7XG4gICAgICAgIF90aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgX3RoaXMuY2xvc2UoKTtcbiAgICAgICAgICBfdGhpcy4kYW5jaG9yLmRhdGEoJ2hvdmVyJywgZmFsc2UpO1xuICAgICAgICB9LCBfdGhpcy5vcHRpb25zLmhvdmVyRGVsYXkpO1xuICAgICAgfSk7XG4gICAgICBpZih0aGlzLm9wdGlvbnMuaG92ZXJQYW5lKXtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ21vdXNlZW50ZXIuemYuZHJvcGRvd24gbW91c2VsZWF2ZS56Zi5kcm9wZG93bicpXG4gICAgICAgICAgICAub24oJ21vdXNlZW50ZXIuemYuZHJvcGRvd24nLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoX3RoaXMudGltZW91dCk7XG4gICAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZS56Zi5kcm9wZG93bicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dChfdGhpcy50aW1lb3V0KTtcbiAgICAgICAgICAgICAgX3RoaXMudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBfdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIF90aGlzLiRhbmNob3IuZGF0YSgnaG92ZXInLCBmYWxzZSk7XG4gICAgICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuaG92ZXJEZWxheSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy4kYW5jaG9yLmFkZCh0aGlzLiRlbGVtZW50KS5vbigna2V5ZG93bi56Zi5kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcblxuICAgICAgdmFyICR0YXJnZXQgPSAkKHRoaXMpLFxuICAgICAgICB2aXNpYmxlRm9jdXNhYmxlRWxlbWVudHMgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUoX3RoaXMuJGVsZW1lbnQpO1xuXG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnRHJvcGRvd24nLCB7XG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICgkdGFyZ2V0LmlzKF90aGlzLiRhbmNob3IpKSB7XG4gICAgICAgICAgICBfdGhpcy5vcGVuKCk7XG4gICAgICAgICAgICBfdGhpcy4kZWxlbWVudC5hdHRyKCd0YWJpbmRleCcsIC0xKS5mb2N1cygpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF90aGlzLmNsb3NlKCk7XG4gICAgICAgICAgX3RoaXMuJGFuY2hvci5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGV2ZW50IGhhbmRsZXIgdG8gdGhlIGJvZHkgdG8gY2xvc2UgYW55IGRyb3Bkb3ducyBvbiBhIGNsaWNrLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRCb2R5SGFuZGxlcigpIHtcbiAgICAgdmFyICRib2R5ID0gJChkb2N1bWVudC5ib2R5KS5ub3QodGhpcy4kZWxlbWVudCksXG4gICAgICAgICBfdGhpcyA9IHRoaXM7XG4gICAgICRib2R5Lm9mZignY2xpY2suemYuZHJvcGRvd24nKVxuICAgICAgICAgIC5vbignY2xpY2suemYuZHJvcGRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGlmKF90aGlzLiRhbmNob3IuaXMoZS50YXJnZXQpIHx8IF90aGlzLiRhbmNob3IuZmluZChlLnRhcmdldCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKF90aGlzLiRlbGVtZW50LmZpbmQoZS50YXJnZXQpLmxlbmd0aCkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgJGJvZHkub2ZmKCdjbGljay56Zi5kcm9wZG93bicpO1xuICAgICAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSBkcm9wZG93biBwYW5lLCBhbmQgZmlyZXMgYSBidWJibGluZyBldmVudCB0byBjbG9zZSBvdGhlciBkcm9wZG93bnMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgRHJvcGRvd24jY2xvc2VtZVxuICAgKiBAZmlyZXMgRHJvcGRvd24jc2hvd1xuICAgKi9cbiAgb3BlbigpIHtcbiAgICAvLyB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIC8qKlxuICAgICAqIEZpcmVzIHRvIGNsb3NlIG90aGVyIG9wZW4gZHJvcGRvd25zXG4gICAgICogQGV2ZW50IERyb3Bkb3duI2Nsb3NlbWVcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Nsb3NlbWUuemYuZHJvcGRvd24nLCB0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJykpO1xuICAgIHRoaXMuJGFuY2hvci5hZGRDbGFzcygnaG92ZXInKVxuICAgICAgICAuYXR0cih7J2FyaWEtZXhwYW5kZWQnOiB0cnVlfSk7XG4gICAgLy8gdGhpcy4kZWxlbWVudC8qLnNob3coKSovO1xuICAgIHRoaXMuX3NldFBvc2l0aW9uKCk7XG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnaXMtb3BlbicpXG4gICAgICAgIC5hdHRyKHsnYXJpYS1oaWRkZW4nOiBmYWxzZX0pO1xuXG4gICAgaWYodGhpcy5vcHRpb25zLmF1dG9Gb2N1cyl7XG4gICAgICB2YXIgJGZvY3VzYWJsZSA9IEZvdW5kYXRpb24uS2V5Ym9hcmQuZmluZEZvY3VzYWJsZSh0aGlzLiRlbGVtZW50KTtcbiAgICAgIGlmKCRmb2N1c2FibGUubGVuZ3RoKXtcbiAgICAgICAgJGZvY3VzYWJsZS5lcSgwKS5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2speyB0aGlzLl9hZGRCb2R5SGFuZGxlcigpOyB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cykge1xuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC50cmFwRm9jdXModGhpcy4kZWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgb25jZSB0aGUgZHJvcGRvd24gaXMgdmlzaWJsZS5cbiAgICAgKiBAZXZlbnQgRHJvcGRvd24jc2hvd1xuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2hvdy56Zi5kcm9wZG93bicsIFt0aGlzLiRlbGVtZW50XSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSBvcGVuIGRyb3Bkb3duIHBhbmUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgRHJvcGRvd24jaGlkZVxuICAgKi9cbiAgY2xvc2UoKSB7XG4gICAgaWYoIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSl7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKVxuICAgICAgICAuYXR0cih7J2FyaWEtaGlkZGVuJzogdHJ1ZX0pO1xuXG4gICAgdGhpcy4kYW5jaG9yLnJlbW92ZUNsYXNzKCdob3ZlcicpXG4gICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpO1xuXG4gICAgaWYodGhpcy5jbGFzc0NoYW5nZWQpe1xuICAgICAgdmFyIGN1clBvc2l0aW9uQ2xhc3MgPSB0aGlzLmdldFBvc2l0aW9uQ2xhc3MoKTtcbiAgICAgIGlmKGN1clBvc2l0aW9uQ2xhc3Mpe1xuICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKGN1clBvc2l0aW9uQ2xhc3MpO1xuICAgICAgfVxuICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMucG9zaXRpb25DbGFzcylcbiAgICAgICAgICAvKi5oaWRlKCkqLy5jc3Moe2hlaWdodDogJycsIHdpZHRoOiAnJ30pO1xuICAgICAgdGhpcy5jbGFzc0NoYW5nZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuY291bnRlciA9IDQ7XG4gICAgICB0aGlzLnVzZWRQb3NpdGlvbnMubGVuZ3RoID0gMDtcbiAgICB9XG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdoaWRlLnpmLmRyb3Bkb3duJywgW3RoaXMuJGVsZW1lbnRdKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzKSB7XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlbGVhc2VGb2N1cyh0aGlzLiRlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgZHJvcGRvd24gcGFuZSdzIHZpc2liaWxpdHkuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgdG9nZ2xlKCkge1xuICAgIGlmKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSl7XG4gICAgICBpZih0aGlzLiRhbmNob3IuZGF0YSgnaG92ZXInKSkgcmV0dXJuO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1lbHNle1xuICAgICAgdGhpcy5vcGVuKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBkcm9wZG93bi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudHJpZ2dlcicpLmhpZGUoKTtcbiAgICB0aGlzLiRhbmNob3Iub2ZmKCcuemYuZHJvcGRvd24nKTtcblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5Ecm9wZG93bi5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIENsYXNzIHRoYXQgZGVzaWduYXRlcyBib3VuZGluZyBjb250YWluZXIgb2YgRHJvcGRvd24gKERlZmF1bHQ6IHdpbmRvdylcbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnZHJvcGRvd24tcGFyZW50J1xuICAgKi9cbiAgcGFyZW50Q2xhc3M6IG51bGwsXG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSB0byBkZWxheSBvcGVuaW5nIGEgc3VibWVudSBvbiBob3ZlciBldmVudC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAyNTBcbiAgICovXG4gIGhvdmVyRGVsYXk6IDI1MCxcbiAgLyoqXG4gICAqIEFsbG93IHN1Ym1lbnVzIHRvIG9wZW4gb24gaG92ZXIgZXZlbnRzXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGhvdmVyOiBmYWxzZSxcbiAgLyoqXG4gICAqIERvbid0IGNsb3NlIGRyb3Bkb3duIHdoZW4gaG92ZXJpbmcgb3ZlciBkcm9wZG93biBwYW5lXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgaG92ZXJQYW5lOiBmYWxzZSxcbiAgLyoqXG4gICAqIE51bWJlciBvZiBwaXhlbHMgYmV0d2VlbiB0aGUgZHJvcGRvd24gcGFuZSBhbmQgdGhlIHRyaWdnZXJpbmcgZWxlbWVudCBvbiBvcGVuLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDFcbiAgICovXG4gIHZPZmZzZXQ6IDEsXG4gIC8qKlxuICAgKiBOdW1iZXIgb2YgcGl4ZWxzIGJldHdlZW4gdGhlIGRyb3Bkb3duIHBhbmUgYW5kIHRoZSB0cmlnZ2VyaW5nIGVsZW1lbnQgb24gb3Blbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxXG4gICAqL1xuICBoT2Zmc2V0OiAxLFxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byBhZGp1c3Qgb3BlbiBwb3NpdGlvbi4gSlMgd2lsbCB0ZXN0IGFuZCBmaWxsIHRoaXMgaW4uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ3RvcCdcbiAgICovXG4gIHBvc2l0aW9uQ2xhc3M6ICcnLFxuICAvKipcbiAgICogQWxsb3cgdGhlIHBsdWdpbiB0byB0cmFwIGZvY3VzIHRvIHRoZSBkcm9wZG93biBwYW5lIGlmIG9wZW5lZCB3aXRoIGtleWJvYXJkIGNvbW1hbmRzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICB0cmFwRm9jdXM6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3cgdGhlIHBsdWdpbiB0byBzZXQgZm9jdXMgdG8gdGhlIGZpcnN0IGZvY3VzYWJsZSBlbGVtZW50IHdpdGhpbiB0aGUgcGFuZSwgcmVnYXJkbGVzcyBvZiBtZXRob2Qgb2Ygb3BlbmluZy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBhdXRvRm9jdXM6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3dzIGEgY2xpY2sgb24gdGhlIGJvZHkgdG8gY2xvc2UgdGhlIGRyb3Bkb3duLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2s6IGZhbHNlXG59XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihEcm9wZG93biwgJ0Ryb3Bkb3duJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBEcm9wZG93bk1lbnUgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmRyb3Bkb3duLW1lbnVcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuYm94XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm5lc3RcbiAqL1xuXG5jbGFzcyBEcm9wZG93bk1lbnUge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEcm9wZG93bk1lbnUuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgRHJvcGRvd25NZW51I2luaXRcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGRyb3Bkb3duIG1lbnUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgRHJvcGRvd25NZW51LmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICBGb3VuZGF0aW9uLk5lc3QuRmVhdGhlcih0aGlzLiRlbGVtZW50LCAnZHJvcGRvd24nKTtcbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdEcm9wZG93bk1lbnUnKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdEcm9wZG93bk1lbnUnLCB7XG4gICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAndXAnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnZG93bicsXG4gICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cycsXG4gICAgICAnRVNDQVBFJzogJ2Nsb3NlJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4sIGFuZCBjYWxscyBfcHJlcGFyZU1lbnVcbiAgICogQHByaXZhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgc3VicyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKS5hZGRDbGFzcygnZmlyc3Qtc3ViJyk7XG5cbiAgICB0aGlzLiRtZW51SXRlbXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tyb2xlPVwibWVudWl0ZW1cIl0nKTtcbiAgICB0aGlzLiR0YWJzID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignW3JvbGU9XCJtZW51aXRlbVwiXScpO1xuICAgIHRoaXMuJHRhYnMuZmluZCgndWwuaXMtZHJvcGRvd24tc3VibWVudScpLmFkZENsYXNzKHRoaXMub3B0aW9ucy52ZXJ0aWNhbENsYXNzKTtcblxuICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKHRoaXMub3B0aW9ucy5yaWdodENsYXNzKSB8fCB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAncmlnaHQnIHx8IEZvdW5kYXRpb24ucnRsKCkgfHwgdGhpcy4kZWxlbWVudC5wYXJlbnRzKCcudG9wLWJhci1yaWdodCcpLmlzKCcqJykpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPSAncmlnaHQnO1xuICAgICAgc3Vicy5hZGRDbGFzcygnb3BlbnMtbGVmdCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWJzLmFkZENsYXNzKCdvcGVucy1yaWdodCcpO1xuICAgIH1cbiAgICB0aGlzLmNoYW5nZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfTtcblxuICBfaXNWZXJ0aWNhbCgpIHtcbiAgICByZXR1cm4gdGhpcy4kdGFicy5jc3MoJ2Rpc3BsYXknKSA9PT0gJ2Jsb2NrJztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byBlbGVtZW50cyB3aXRoaW4gdGhlIG1lbnVcbiAgICogQHByaXZhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgIGhhc1RvdWNoID0gJ29udG91Y2hzdGFydCcgaW4gd2luZG93IHx8ICh0eXBlb2Ygd2luZG93Lm9udG91Y2hzdGFydCAhPT0gJ3VuZGVmaW5lZCcpLFxuICAgICAgICBwYXJDbGFzcyA9ICdpcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCc7XG5cbiAgICAvLyB1c2VkIGZvciBvbkNsaWNrIGFuZCBpbiB0aGUga2V5Ym9hcmQgaGFuZGxlcnNcbiAgICB2YXIgaGFuZGxlQ2xpY2tGbiA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciAkZWxlbSA9ICQoZS50YXJnZXQpLnBhcmVudHNVbnRpbCgndWwnLCBgLiR7cGFyQ2xhc3N9YCksXG4gICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpLFxuICAgICAgICAgIGhhc0NsaWNrZWQgPSAkZWxlbS5hdHRyKCdkYXRhLWlzLWNsaWNrJykgPT09ICd0cnVlJyxcbiAgICAgICAgICAkc3ViID0gJGVsZW0uY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51Jyk7XG5cbiAgICAgIGlmIChoYXNTdWIpIHtcbiAgICAgICAgaWYgKGhhc0NsaWNrZWQpIHtcbiAgICAgICAgICBpZiAoIV90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrIHx8ICghX3RoaXMub3B0aW9ucy5jbGlja09wZW4gJiYgIWhhc1RvdWNoKSB8fCAoX3RoaXMub3B0aW9ucy5mb3JjZUZvbGxvdyAmJiBoYXNUb3VjaCkpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBfdGhpcy5fc2hvdygkc3ViKTtcbiAgICAgICAgICAkZWxlbS5hZGQoJGVsZW0ucGFyZW50c1VudGlsKF90aGlzLiRlbGVtZW50LCBgLiR7cGFyQ2xhc3N9YCkpLmF0dHIoJ2RhdGEtaXMtY2xpY2snLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsaWNrT3BlbiB8fCBoYXNUb3VjaCkge1xuICAgICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdjbGljay56Zi5kcm9wZG93bm1lbnUgdG91Y2hzdGFydC56Zi5kcm9wZG93bm1lbnUnLCBoYW5kbGVDbGlja0ZuKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgTGVhZiBlbGVtZW50IENsaWNrc1xuICAgIGlmKF90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrSW5zaWRlKXtcbiAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignY2xpY2suemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICRlbGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGhhc1N1YiA9ICRlbGVtLmhhc0NsYXNzKHBhckNsYXNzKTtcbiAgICAgICAgaWYoIWhhc1N1Yil7XG4gICAgICAgICAgX3RoaXMuX2hpZGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuZGlzYWJsZUhvdmVyKSB7XG4gICAgICB0aGlzLiRtZW51SXRlbXMub24oJ21vdXNlZW50ZXIuemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpO1xuXG4gICAgICAgIGlmIChoYXNTdWIpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoJGVsZW0uZGF0YSgnX2RlbGF5JykpO1xuICAgICAgICAgICRlbGVtLmRhdGEoJ19kZWxheScsIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfdGhpcy5fc2hvdygkZWxlbS5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKSk7XG4gICAgICAgICAgfSwgX3RoaXMub3B0aW9ucy5ob3ZlckRlbGF5KSk7XG4gICAgICAgIH1cbiAgICAgIH0pLm9uKCdtb3VzZWxlYXZlLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICRlbGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGhhc1N1YiA9ICRlbGVtLmhhc0NsYXNzKHBhckNsYXNzKTtcbiAgICAgICAgaWYgKGhhc1N1YiAmJiBfdGhpcy5vcHRpb25zLmF1dG9jbG9zZSkge1xuICAgICAgICAgIGlmICgkZWxlbS5hdHRyKCdkYXRhLWlzLWNsaWNrJykgPT09ICd0cnVlJyAmJiBfdGhpcy5vcHRpb25zLmNsaWNrT3BlbikgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgICAgICAgIGNsZWFyVGltZW91dCgkZWxlbS5kYXRhKCdfZGVsYXknKSk7XG4gICAgICAgICAgJGVsZW0uZGF0YSgnX2RlbGF5Jywgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLl9oaWRlKCRlbGVtKTtcbiAgICAgICAgICB9LCBfdGhpcy5vcHRpb25zLmNsb3NpbmdUaW1lKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLiRtZW51SXRlbXMub24oJ2tleWRvd24uemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyICRlbGVtZW50ID0gJChlLnRhcmdldCkucGFyZW50c1VudGlsKCd1bCcsICdbcm9sZT1cIm1lbnVpdGVtXCJdJyksXG4gICAgICAgICAgaXNUYWIgPSBfdGhpcy4kdGFicy5pbmRleCgkZWxlbWVudCkgPiAtMSxcbiAgICAgICAgICAkZWxlbWVudHMgPSBpc1RhYiA/IF90aGlzLiR0YWJzIDogJGVsZW1lbnQuc2libGluZ3MoJ2xpJykuYWRkKCRlbGVtZW50KSxcbiAgICAgICAgICAkcHJldkVsZW1lbnQsXG4gICAgICAgICAgJG5leHRFbGVtZW50O1xuXG4gICAgICAkZWxlbWVudHMuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgIGlmICgkKHRoaXMpLmlzKCRlbGVtZW50KSkge1xuICAgICAgICAgICRwcmV2RWxlbWVudCA9ICRlbGVtZW50cy5lcShpLTEpO1xuICAgICAgICAgICRuZXh0RWxlbWVudCA9ICRlbGVtZW50cy5lcShpKzEpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBuZXh0U2libGluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoISRlbGVtZW50LmlzKCc6bGFzdC1jaGlsZCcpKSB7XG4gICAgICAgICAgJG5leHRFbGVtZW50LmNoaWxkcmVuKCdhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHByZXZTaWJsaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICRwcmV2RWxlbWVudC5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH0sIG9wZW5TdWIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRzdWIgPSAkZWxlbWVudC5jaGlsZHJlbigndWwuaXMtZHJvcGRvd24tc3VibWVudScpO1xuICAgICAgICBpZiAoJHN1Yi5sZW5ndGgpIHtcbiAgICAgICAgICBfdGhpcy5fc2hvdygkc3ViKTtcbiAgICAgICAgICAkZWxlbWVudC5maW5kKCdsaSA+IGE6Zmlyc3QnKS5mb2N1cygpO1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSBlbHNlIHsgcmV0dXJuOyB9XG4gICAgICB9LCBjbG9zZVN1YiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL2lmICgkZWxlbWVudC5pcygnOmZpcnN0LWNoaWxkJykpIHtcbiAgICAgICAgdmFyIGNsb3NlID0gJGVsZW1lbnQucGFyZW50KCd1bCcpLnBhcmVudCgnbGknKTtcbiAgICAgICAgY2xvc2UuY2hpbGRyZW4oJ2E6Zmlyc3QnKS5mb2N1cygpO1xuICAgICAgICBfdGhpcy5faGlkZShjbG9zZSk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgLy99XG4gICAgICB9O1xuICAgICAgdmFyIGZ1bmN0aW9ucyA9IHtcbiAgICAgICAgb3Blbjogb3BlblN1YixcbiAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF90aGlzLl9oaWRlKF90aGlzLiRlbGVtZW50KTtcbiAgICAgICAgICBfdGhpcy4kbWVudUl0ZW1zLmZpbmQoJ2E6Zmlyc3QnKS5mb2N1cygpOyAvLyBmb2N1cyB0byBmaXJzdCBlbGVtZW50XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBpZiAoaXNUYWIpIHtcbiAgICAgICAgaWYgKF90aGlzLl9pc1ZlcnRpY2FsKCkpIHsgLy8gdmVydGljYWwgbWVudVxuICAgICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSB7IC8vIHJpZ2h0IGFsaWduZWRcbiAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICBuZXh0OiBjbG9zZVN1YixcbiAgICAgICAgICAgICAgcHJldmlvdXM6IG9wZW5TdWJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7IC8vIGxlZnQgYWxpZ25lZFxuICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICB1cDogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgIG5leHQ6IG9wZW5TdWIsXG4gICAgICAgICAgICAgIHByZXZpb3VzOiBjbG9zZVN1YlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgeyAvLyBob3Jpem9udGFsIG1lbnVcbiAgICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkgeyAvLyByaWdodCBhbGlnbmVkXG4gICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgbmV4dDogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgIHByZXZpb3VzOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgZG93bjogb3BlblN1YixcbiAgICAgICAgICAgICAgdXA6IGNsb3NlU3ViXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgeyAvLyBsZWZ0IGFsaWduZWRcbiAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICBuZXh0OiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgcHJldmlvdXM6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICBkb3duOiBvcGVuU3ViLFxuICAgICAgICAgICAgICB1cDogY2xvc2VTdWJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHsgLy8gbm90IHRhYnMgLT4gb25lIHN1YlxuICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkgeyAvLyByaWdodCBhbGlnbmVkXG4gICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICBuZXh0OiBjbG9zZVN1YixcbiAgICAgICAgICAgIHByZXZpb3VzOiBvcGVuU3ViLFxuICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICB1cDogcHJldlNpYmxpbmdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHsgLy8gbGVmdCBhbGlnbmVkXG4gICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICBuZXh0OiBvcGVuU3ViLFxuICAgICAgICAgICAgcHJldmlvdXM6IGNsb3NlU3ViLFxuICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICB1cDogcHJldlNpYmxpbmdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0Ryb3Bkb3duTWVudScsIGZ1bmN0aW9ucyk7XG5cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGV2ZW50IGhhbmRsZXIgdG8gdGhlIGJvZHkgdG8gY2xvc2UgYW55IGRyb3Bkb3ducyBvbiBhIGNsaWNrLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRCb2R5SGFuZGxlcigpIHtcbiAgICB2YXIgJGJvZHkgPSAkKGRvY3VtZW50LmJvZHkpLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG4gICAgJGJvZHkub2ZmKCdtb3VzZXVwLnpmLmRyb3Bkb3dubWVudSB0b3VjaGVuZC56Zi5kcm9wZG93bm1lbnUnKVxuICAgICAgICAgLm9uKCdtb3VzZXVwLnpmLmRyb3Bkb3dubWVudSB0b3VjaGVuZC56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgIHZhciAkbGluayA9IF90aGlzLiRlbGVtZW50LmZpbmQoZS50YXJnZXQpO1xuICAgICAgICAgICBpZiAoJGxpbmsubGVuZ3RoKSB7IHJldHVybjsgfVxuXG4gICAgICAgICAgIF90aGlzLl9oaWRlKCk7XG4gICAgICAgICAgICRib2R5Lm9mZignbW91c2V1cC56Zi5kcm9wZG93bm1lbnUgdG91Y2hlbmQuemYuZHJvcGRvd25tZW51Jyk7XG4gICAgICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyBhIGRyb3Bkb3duIHBhbmUsIGFuZCBjaGVja3MgZm9yIGNvbGxpc2lvbnMgZmlyc3QuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkc3ViIC0gdWwgZWxlbWVudCB0aGF0IGlzIGEgc3VibWVudSB0byBzaG93XG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAZmlyZXMgRHJvcGRvd25NZW51I3Nob3dcbiAgICovXG4gIF9zaG93KCRzdWIpIHtcbiAgICB2YXIgaWR4ID0gdGhpcy4kdGFicy5pbmRleCh0aGlzLiR0YWJzLmZpbHRlcihmdW5jdGlvbihpLCBlbCkge1xuICAgICAgcmV0dXJuICQoZWwpLmZpbmQoJHN1YikubGVuZ3RoID4gMDtcbiAgICB9KSk7XG4gICAgdmFyICRzaWJzID0gJHN1Yi5wYXJlbnQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50Jykuc2libGluZ3MoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50Jyk7XG4gICAgdGhpcy5faGlkZSgkc2licywgaWR4KTtcbiAgICAkc3ViLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKS5hZGRDbGFzcygnanMtZHJvcGRvd24tYWN0aXZlJylcbiAgICAgICAgLnBhcmVudCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgdmFyIGNsZWFyID0gRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSgkc3ViLCBudWxsLCB0cnVlKTtcbiAgICBpZiAoIWNsZWFyKSB7XG4gICAgICB2YXIgb2xkQ2xhc3MgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAnbGVmdCcgPyAnLXJpZ2h0JyA6ICctbGVmdCcsXG4gICAgICAgICAgJHBhcmVudExpID0gJHN1Yi5wYXJlbnQoJy5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpO1xuICAgICAgJHBhcmVudExpLnJlbW92ZUNsYXNzKGBvcGVucyR7b2xkQ2xhc3N9YCkuYWRkQ2xhc3MoYG9wZW5zLSR7dGhpcy5vcHRpb25zLmFsaWdubWVudH1gKTtcbiAgICAgIGNsZWFyID0gRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSgkc3ViLCBudWxsLCB0cnVlKTtcbiAgICAgIGlmICghY2xlYXIpIHtcbiAgICAgICAgJHBhcmVudExpLnJlbW92ZUNsYXNzKGBvcGVucy0ke3RoaXMub3B0aW9ucy5hbGlnbm1lbnR9YCkuYWRkQ2xhc3MoJ29wZW5zLWlubmVyJyk7XG4gICAgICB9XG4gICAgICB0aGlzLmNoYW5nZWQgPSB0cnVlO1xuICAgIH1cbiAgICAkc3ViLmNzcygndmlzaWJpbGl0eScsICcnKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljaykgeyB0aGlzLl9hZGRCb2R5SGFuZGxlcigpOyB9XG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgbmV3IGRyb3Bkb3duIHBhbmUgaXMgdmlzaWJsZS5cbiAgICAgKiBAZXZlbnQgRHJvcGRvd25NZW51I3Nob3dcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3Nob3cuemYuZHJvcGRvd25tZW51JywgWyRzdWJdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWRlcyBhIHNpbmdsZSwgY3VycmVudGx5IG9wZW4gZHJvcGRvd24gcGFuZSwgaWYgcGFzc2VkIGEgcGFyYW1ldGVyLCBvdGhlcndpc2UsIGhpZGVzIGV2ZXJ5dGhpbmcuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW0gLSBlbGVtZW50IHdpdGggYSBzdWJtZW51IHRvIGhpZGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIGluZGV4IG9mIHRoZSAkdGFicyBjb2xsZWN0aW9uIHRvIGhpZGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9oaWRlKCRlbGVtLCBpZHgpIHtcbiAgICB2YXIgJHRvQ2xvc2U7XG4gICAgaWYgKCRlbGVtICYmICRlbGVtLmxlbmd0aCkge1xuICAgICAgJHRvQ2xvc2UgPSAkZWxlbTtcbiAgICB9IGVsc2UgaWYgKGlkeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAkdG9DbG9zZSA9IHRoaXMuJHRhYnMubm90KGZ1bmN0aW9uKGksIGVsKSB7XG4gICAgICAgIHJldHVybiBpID09PSBpZHg7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAkdG9DbG9zZSA9IHRoaXMuJGVsZW1lbnQ7XG4gICAgfVxuICAgIHZhciBzb21ldGhpbmdUb0Nsb3NlID0gJHRvQ2xvc2UuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpIHx8ICR0b0Nsb3NlLmZpbmQoJy5pcy1hY3RpdmUnKS5sZW5ndGggPiAwO1xuXG4gICAgaWYgKHNvbWV0aGluZ1RvQ2xvc2UpIHtcbiAgICAgICR0b0Nsb3NlLmZpbmQoJ2xpLmlzLWFjdGl2ZScpLmFkZCgkdG9DbG9zZSkuYXR0cih7XG4gICAgICAgICdkYXRhLWlzLWNsaWNrJzogZmFsc2VcbiAgICAgIH0pLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcblxuICAgICAgJHRvQ2xvc2UuZmluZCgndWwuanMtZHJvcGRvd24tYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2pzLWRyb3Bkb3duLWFjdGl2ZScpO1xuXG4gICAgICBpZiAodGhpcy5jaGFuZ2VkIHx8ICR0b0Nsb3NlLmZpbmQoJ29wZW5zLWlubmVyJykubGVuZ3RoKSB7XG4gICAgICAgIHZhciBvbGRDbGFzcyA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdsZWZ0JyA/ICdyaWdodCcgOiAnbGVmdCc7XG4gICAgICAgICR0b0Nsb3NlLmZpbmQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JykuYWRkKCR0b0Nsb3NlKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhgb3BlbnMtaW5uZXIgb3BlbnMtJHt0aGlzLm9wdGlvbnMuYWxpZ25tZW50fWApXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKGBvcGVucy0ke29sZENsYXNzfWApO1xuICAgICAgICB0aGlzLmNoYW5nZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgb3BlbiBtZW51cyBhcmUgY2xvc2VkLlxuICAgICAgICogQGV2ZW50IERyb3Bkb3duTWVudSNoaWRlXG4gICAgICAgKi9cbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaGlkZS56Zi5kcm9wZG93bm1lbnUnLCBbJHRvQ2xvc2VdKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIHBsdWdpbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJG1lbnVJdGVtcy5vZmYoJy56Zi5kcm9wZG93bm1lbnUnKS5yZW1vdmVBdHRyKCdkYXRhLWlzLWNsaWNrJylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdpcy1yaWdodC1hcnJvdyBpcy1sZWZ0LWFycm93IGlzLWRvd24tYXJyb3cgb3BlbnMtcmlnaHQgb3BlbnMtbGVmdCBvcGVucy1pbm5lcicpO1xuICAgICQoZG9jdW1lbnQuYm9keSkub2ZmKCcuemYuZHJvcGRvd25tZW51Jyk7XG4gICAgRm91bmRhdGlvbi5OZXN0LkJ1cm4odGhpcy4kZWxlbWVudCwgJ2Ryb3Bkb3duJyk7XG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCBzZXR0aW5ncyBmb3IgcGx1Z2luXG4gKi9cbkRyb3Bkb3duTWVudS5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIERpc2FsbG93cyBob3ZlciBldmVudHMgZnJvbSBvcGVuaW5nIHN1Ym1lbnVzXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGRpc2FibGVIb3ZlcjogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvdyBhIHN1Ym1lbnUgdG8gYXV0b21hdGljYWxseSBjbG9zZSBvbiBhIG1vdXNlbGVhdmUgZXZlbnQsIGlmIG5vdCBjbGlja2VkIG9wZW4uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgYXV0b2Nsb3NlOiB0cnVlLFxuICAvKipcbiAgICogQW1vdW50IG9mIHRpbWUgdG8gZGVsYXkgb3BlbmluZyBhIHN1Ym1lbnUgb24gaG92ZXIgZXZlbnQuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgNTBcbiAgICovXG4gIGhvdmVyRGVsYXk6IDUwLFxuICAvKipcbiAgICogQWxsb3cgYSBzdWJtZW51IHRvIG9wZW4vcmVtYWluIG9wZW4gb24gcGFyZW50IGNsaWNrIGV2ZW50LiBBbGxvd3MgY3Vyc29yIHRvIG1vdmUgYXdheSBmcm9tIG1lbnUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgY2xpY2tPcGVuOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIHRvIGRlbGF5IGNsb3NpbmcgYSBzdWJtZW51IG9uIGEgbW91c2VsZWF2ZSBldmVudC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSA1MDBcbiAgICovXG5cbiAgY2xvc2luZ1RpbWU6IDUwMCxcbiAgLyoqXG4gICAqIFBvc2l0aW9uIG9mIHRoZSBtZW51IHJlbGF0aXZlIHRvIHdoYXQgZGlyZWN0aW9uIHRoZSBzdWJtZW51cyBzaG91bGQgb3Blbi4gSGFuZGxlZCBieSBKUy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnbGVmdCdcbiAgICovXG4gIGFsaWdubWVudDogJ2xlZnQnLFxuICAvKipcbiAgICogQWxsb3cgY2xpY2tzIG9uIHRoZSBib2R5IHRvIGNsb3NlIGFueSBvcGVuIHN1Ym1lbnVzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIHRydWVcbiAgICovXG4gIGNsb3NlT25DbGljazogdHJ1ZSxcbiAgLyoqXG4gICAqIEFsbG93IGNsaWNrcyBvbiBsZWFmIGFuY2hvciBsaW5rcyB0byBjbG9zZSBhbnkgb3BlbiBzdWJtZW51cy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2tJbnNpZGU6IHRydWUsXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHZlcnRpY2FsIG9yaWVudGVkIG1lbnVzLCBGb3VuZGF0aW9uIGRlZmF1bHQgaXMgYHZlcnRpY2FsYC4gVXBkYXRlIHRoaXMgaWYgdXNpbmcgeW91ciBvd24gY2xhc3MuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ3ZlcnRpY2FsJ1xuICAgKi9cbiAgdmVydGljYWxDbGFzczogJ3ZlcnRpY2FsJyxcbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gcmlnaHQtc2lkZSBvcmllbnRlZCBtZW51cywgRm91bmRhdGlvbiBkZWZhdWx0IGlzIGBhbGlnbi1yaWdodGAuIFVwZGF0ZSB0aGlzIGlmIHVzaW5nIHlvdXIgb3duIGNsYXNzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdhbGlnbi1yaWdodCdcbiAgICovXG4gIHJpZ2h0Q2xhc3M6ICdhbGlnbi1yaWdodCcsXG4gIC8qKlxuICAgKiBCb29sZWFuIHRvIGZvcmNlIG92ZXJpZGUgdGhlIGNsaWNraW5nIG9mIGxpbmtzIHRvIHBlcmZvcm0gZGVmYXVsdCBhY3Rpb24sIG9uIHNlY29uZCB0b3VjaCBldmVudCBmb3IgbW9iaWxlLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBmb3JjZUZvbGxvdzogdHJ1ZVxufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKERyb3Bkb3duTWVudSwgJ0Ryb3Bkb3duTWVudScpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogT2ZmQ2FudmFzIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5vZmZjYW52YXNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cbiAqL1xuXG5jbGFzcyBPZmZDYW52YXMge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhbiBvZmYtY2FudmFzIHdyYXBwZXIuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgT2ZmQ2FudmFzI2luaXRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGluaXRpYWxpemUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgT2ZmQ2FudmFzLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgdGhpcy4kbGFzdFRyaWdnZXIgPSAkKCk7XG4gICAgdGhpcy4kdHJpZ2dlcnMgPSAkKCk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdPZmZDYW52YXMnKVxuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ09mZkNhbnZhcycsIHtcbiAgICAgICdFU0NBUEUnOiAnY2xvc2UnXG4gICAgfSk7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgb2ZmLWNhbnZhcyB3cmFwcGVyIGJ5IGFkZGluZyB0aGUgZXhpdCBvdmVybGF5IChpZiBuZWVkZWQpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBpZCA9IHRoaXMuJGVsZW1lbnQuYXR0cignaWQnKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyhgaXMtdHJhbnNpdGlvbi0ke3RoaXMub3B0aW9ucy50cmFuc2l0aW9ufWApO1xuXG4gICAgLy8gRmluZCB0cmlnZ2VycyB0aGF0IGFmZmVjdCB0aGlzIGVsZW1lbnQgYW5kIGFkZCBhcmlhLWV4cGFuZGVkIHRvIHRoZW1cbiAgICB0aGlzLiR0cmlnZ2VycyA9ICQoZG9jdW1lbnQpXG4gICAgICAuZmluZCgnW2RhdGEtb3Blbj1cIicraWQrJ1wiXSwgW2RhdGEtY2xvc2U9XCInK2lkKydcIl0sIFtkYXRhLXRvZ2dsZT1cIicraWQrJ1wiXScpXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpXG4gICAgICAuYXR0cignYXJpYS1jb250cm9scycsIGlkKTtcblxuICAgIC8vIEFkZCBhbiBvdmVybGF5IG92ZXIgdGhlIGNvbnRlbnQgaWYgbmVjZXNzYXJ5XG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHZhciBvdmVybGF5UG9zaXRpb24gPSAkKHRoaXMuJGVsZW1lbnQpLmNzcyhcInBvc2l0aW9uXCIpID09PSAnZml4ZWQnID8gJ2lzLW92ZXJsYXktZml4ZWQnIDogJ2lzLW92ZXJsYXktYWJzb2x1dGUnO1xuICAgICAgb3ZlcmxheS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2pzLW9mZi1jYW52YXMtb3ZlcmxheSAnICsgb3ZlcmxheVBvc2l0aW9uKTtcbiAgICAgIHRoaXMuJG92ZXJsYXkgPSAkKG92ZXJsYXkpO1xuICAgICAgaWYob3ZlcmxheVBvc2l0aW9uID09PSAnaXMtb3ZlcmxheS1maXhlZCcpIHtcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZCh0aGlzLiRvdmVybGF5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuc2libGluZ3MoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5hcHBlbmQodGhpcy4kb3ZlcmxheSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgPSB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCB8fCBuZXcgUmVnRXhwKHRoaXMub3B0aW9ucy5yZXZlYWxDbGFzcywgJ2cnKS50ZXN0KHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5vcHRpb25zLnJldmVhbE9uID0gdGhpcy5vcHRpb25zLnJldmVhbE9uIHx8IHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lLm1hdGNoKC8ocmV2ZWFsLWZvci1tZWRpdW18cmV2ZWFsLWZvci1sYXJnZSkvZylbMF0uc3BsaXQoJy0nKVsyXTtcbiAgICAgIHRoaXMuX3NldE1RQ2hlY2tlcigpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMub3B0aW9ucy50cmFuc2l0aW9uVGltZSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lID0gcGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSgkKCdbZGF0YS1vZmYtY2FudmFzXScpWzBdKS50cmFuc2l0aW9uRHVyYXRpb24pICogMTAwMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyB0byB0aGUgb2ZmLWNhbnZhcyB3cmFwcGVyIGFuZCB0aGUgZXhpdCBvdmVybGF5LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi50cmlnZ2VyIC56Zi5vZmZjYW52YXMnKS5vbih7XG4gICAgICAnb3Blbi56Zi50cmlnZ2VyJzogdGhpcy5vcGVuLmJpbmQodGhpcyksXG4gICAgICAnY2xvc2UuemYudHJpZ2dlcic6IHRoaXMuY2xvc2UuYmluZCh0aGlzKSxcbiAgICAgICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcyksXG4gICAgICAna2V5ZG93bi56Zi5vZmZjYW52YXMnOiB0aGlzLl9oYW5kbGVLZXlib2FyZC5iaW5kKHRoaXMpXG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSkge1xuICAgICAgdmFyICR0YXJnZXQgPSB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPyB0aGlzLiRvdmVybGF5IDogJCgnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpO1xuICAgICAgJHRhcmdldC5vbih7J2NsaWNrLnpmLm9mZmNhbnZhcyc6IHRoaXMuY2xvc2UuYmluZCh0aGlzKX0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGV2ZW50IGxpc3RlbmVyIGZvciBlbGVtZW50cyB0aGF0IHdpbGwgcmV2ZWFsIGF0IGNlcnRhaW4gYnJlYWtwb2ludHMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0TVFDaGVja2VyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF90aGlzLnJldmVhbChmYWxzZSk7XG4gICAgICB9XG4gICAgfSkub25lKCdsb2FkLnpmLm9mZmNhbnZhcycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSByZXZlYWxpbmcvaGlkaW5nIHRoZSBvZmYtY2FudmFzIGF0IGJyZWFrcG9pbnRzLCBub3QgdGhlIHNhbWUgYXMgb3Blbi5cbiAgICogQHBhcmFtIHtCb29sZWFufSBpc1JldmVhbGVkIC0gdHJ1ZSBpZiBlbGVtZW50IHNob3VsZCBiZSByZXZlYWxlZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICByZXZlYWwoaXNSZXZlYWxlZCkge1xuICAgIHZhciAkY2xvc2VyID0gdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1jbG9zZV0nKTtcbiAgICBpZiAoaXNSZXZlYWxlZCkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgdGhpcy5pc1JldmVhbGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdvcGVuLnpmLnRyaWdnZXIgdG9nZ2xlLnpmLnRyaWdnZXInKTtcbiAgICAgIGlmICgkY2xvc2VyLmxlbmd0aCkgeyAkY2xvc2VyLmhpZGUoKTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmlzUmV2ZWFsZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vbih7XG4gICAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKVxuICAgICAgfSk7XG4gICAgICBpZiAoJGNsb3Nlci5sZW5ndGgpIHtcbiAgICAgICAgJGNsb3Nlci5zaG93KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIHNjcm9sbGluZyBvZiB0aGUgYm9keSB3aGVuIG9mZmNhbnZhcyBpcyBvcGVuIG9uIG1vYmlsZSBTYWZhcmkgYW5kIG90aGVyIHRyb3VibGVzb21lIGJyb3dzZXJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3N0b3BTY3JvbGxpbmcoZXZlbnQpIHtcbiAgXHRyZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjb3BlbmVkXG4gICAqL1xuICBvcGVuKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICB0aGlzLiRsYXN0VHJpZ2dlciA9IHRyaWdnZXI7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvID09PSAndG9wJykge1xuICAgICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG8gPT09ICdib3R0b20nKSB7XG4gICAgICB3aW5kb3cuc2Nyb2xsVG8oMCxkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW5zLlxuICAgICAqIEBldmVudCBPZmZDYW52YXMjb3BlbmVkXG4gICAgICovXG4gICAgX3RoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2lzLW9wZW4nKVxuXG4gICAgdGhpcy4kdHJpZ2dlcnMuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpXG4gICAgICAgIC50cmlnZ2VyKCdvcGVuZWQuemYub2ZmY2FudmFzJyk7XG5cbiAgICAvLyBJZiBgY29udGVudFNjcm9sbGAgaXMgc2V0IHRvIGZhbHNlLCBhZGQgY2xhc3MgYW5kIGRpc2FibGUgc2Nyb2xsaW5nIG9uIHRvdWNoIGRldmljZXMuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50U2Nyb2xsID09PSBmYWxzZSkge1xuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdpcy1vZmYtY2FudmFzLW9wZW4nKS5vbigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbGluZyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5hZGRDbGFzcygnaXMtdmlzaWJsZScpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlICYmIHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5hZGRDbGFzcygnaXMtY2xvc2FibGUnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9Gb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKHRoaXMuJGVsZW1lbnQpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuJGVsZW1lbnQuZmluZCgnYSwgYnV0dG9uJykuZXEoMCkuZm9jdXMoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykuYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQudHJhcEZvY3VzKHRoaXMuJGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gb3B0aW9uYWwgY2IgdG8gZmlyZSBhZnRlciBjbG9zdXJlLlxuICAgKiBAZmlyZXMgT2ZmQ2FudmFzI2Nsb3NlZFxuICAgKi9cbiAgY2xvc2UoY2IpIHtcbiAgICBpZiAoIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHsgcmV0dXJuOyB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgX3RoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpXG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG9mZi1jYW52YXMgbWVudSBvcGVucy5cbiAgICAgICAqIEBldmVudCBPZmZDYW52YXMjY2xvc2VkXG4gICAgICAgKi9cbiAgICAgICAgLnRyaWdnZXIoJ2Nsb3NlZC56Zi5vZmZjYW52YXMnKTtcblxuICAgIC8vIElmIGBjb250ZW50U2Nyb2xsYCBpcyBzZXQgdG8gZmFsc2UsIHJlbW92ZSBjbGFzcyBhbmQgcmUtZW5hYmxlIHNjcm9sbGluZyBvbiB0b3VjaCBkZXZpY2VzLlxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudFNjcm9sbCA9PT0gZmFsc2UpIHtcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnaXMtb2ZmLWNhbnZhcy1vcGVuJykub2ZmKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsaW5nKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy12aXNpYmxlJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgPT09IHRydWUgJiYgdGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy1jbG9zYWJsZScpO1xuICAgIH1cblxuICAgIHRoaXMuJHRyaWdnZXJzLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVsZWFzZUZvY3VzKHRoaXMuJGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbiBvciBjbG9zZWQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBFdmVudCBvYmplY3QgcGFzc2VkIGZyb20gbGlzdGVuZXIuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSB0cmlnZ2VyIC0gZWxlbWVudCB0aGF0IHRyaWdnZXJlZCB0aGUgb2ZmLWNhbnZhcyB0byBvcGVuLlxuICAgKi9cbiAgdG9nZ2xlKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSkge1xuICAgICAgdGhpcy5jbG9zZShldmVudCwgdHJpZ2dlcik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5vcGVuKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBrZXlib2FyZCBpbnB1dCB3aGVuIGRldGVjdGVkLiBXaGVuIHRoZSBlc2NhcGUga2V5IGlzIHByZXNzZWQsIHRoZSBvZmYtY2FudmFzIG1lbnUgY2xvc2VzLCBhbmQgZm9jdXMgaXMgcmVzdG9yZWQgdG8gdGhlIGVsZW1lbnQgdGhhdCBvcGVuZWQgdGhlIG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2hhbmRsZUtleWJvYXJkKGUpIHtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnT2ZmQ2FudmFzJywge1xuICAgICAgY2xvc2U6ICgpID0+IHtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB0aGlzLiRsYXN0VHJpZ2dlci5mb2N1cygpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0sXG4gICAgICBoYW5kbGVkOiAoKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgb2ZmY2FudmFzIHBsdWdpbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpO1xuICAgIHRoaXMuJG92ZXJsYXkub2ZmKCcuemYub2ZmY2FudmFzJyk7XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuT2ZmQ2FudmFzLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQWxsb3cgdGhlIHVzZXIgdG8gY2xpY2sgb3V0c2lkZSBvZiB0aGUgbWVudSB0byBjbG9zZSBpdC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2s6IHRydWUsXG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gb3ZlcmxheSBvbiB0b3Agb2YgYFtkYXRhLW9mZi1jYW52YXMtY29udGVudF1gLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIHRydWVcbiAgICovXG4gIGNvbnRlbnRPdmVybGF5OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBFbmFibGUvZGlzYWJsZSBzY3JvbGxpbmcgb2YgdGhlIG1haW4gY29udGVudCB3aGVuIGFuIG9mZiBjYW52YXMgcGFuZWwgaXMgb3Blbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBjb250ZW50U2Nyb2xsOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSBpbiBtcyB0aGUgb3BlbiBhbmQgY2xvc2UgdHJhbnNpdGlvbiByZXF1aXJlcy4gSWYgbm9uZSBzZWxlY3RlZCwgcHVsbHMgZnJvbSBib2R5IHN0eWxlLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDUwMFxuICAgKi9cbiAgdHJhbnNpdGlvblRpbWU6IDAsXG5cbiAgLyoqXG4gICAqIFR5cGUgb2YgdHJhbnNpdGlvbiBmb3IgdGhlIG9mZmNhbnZhcyBtZW51LiBPcHRpb25zIGFyZSAncHVzaCcsICdkZXRhY2hlZCcgb3IgJ3NsaWRlJy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBwdXNoXG4gICAqL1xuICB0cmFuc2l0aW9uOiAncHVzaCcsXG5cbiAgLyoqXG4gICAqIEZvcmNlIHRoZSBwYWdlIHRvIHNjcm9sbCB0byB0b3Agb3IgYm90dG9tIG9uIG9wZW4uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdG9wXG4gICAqL1xuICBmb3JjZVRvOiBudWxsLFxuXG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgb2ZmY2FudmFzIHRvIHJlbWFpbiBvcGVuIGZvciBjZXJ0YWluIGJyZWFrcG9pbnRzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBpc1JldmVhbGVkOiBmYWxzZSxcblxuICAvKipcbiAgICogQnJlYWtwb2ludCBhdCB3aGljaCB0byByZXZlYWwuIEpTIHdpbGwgdXNlIGEgUmVnRXhwIHRvIHRhcmdldCBzdGFuZGFyZCBjbGFzc2VzLCBpZiBjaGFuZ2luZyBjbGFzc25hbWVzLCBwYXNzIHlvdXIgY2xhc3Mgd2l0aCB0aGUgYHJldmVhbENsYXNzYCBvcHRpb24uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgcmV2ZWFsLWZvci1sYXJnZVxuICAgKi9cbiAgcmV2ZWFsT246IG51bGwsXG5cbiAgLyoqXG4gICAqIEZvcmNlIGZvY3VzIHRvIHRoZSBvZmZjYW52YXMgb24gb3Blbi4gSWYgdHJ1ZSwgd2lsbCBmb2N1cyB0aGUgb3BlbmluZyB0cmlnZ2VyIG9uIGNsb3NlLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIHRydWVcbiAgICovXG4gIGF1dG9Gb2N1czogdHJ1ZSxcblxuICAvKipcbiAgICogQ2xhc3MgdXNlZCB0byBmb3JjZSBhbiBvZmZjYW52YXMgdG8gcmVtYWluIG9wZW4uIEZvdW5kYXRpb24gZGVmYXVsdHMgZm9yIHRoaXMgYXJlIGByZXZlYWwtZm9yLWxhcmdlYCAmIGByZXZlYWwtZm9yLW1lZGl1bWAuXG4gICAqIEBvcHRpb25cbiAgICogVE9ETyBpbXByb3ZlIHRoZSByZWdleCB0ZXN0aW5nIGZvciB0aGlzLlxuICAgKiBAZXhhbXBsZSByZXZlYWwtZm9yLWxhcmdlXG4gICAqL1xuICByZXZlYWxDbGFzczogJ3JldmVhbC1mb3ItJyxcblxuICAvKipcbiAgICogVHJpZ2dlcnMgb3B0aW9uYWwgZm9jdXMgdHJhcHBpbmcgd2hlbiBvcGVuaW5nIGFuIG9mZmNhbnZhcy4gU2V0cyB0YWJpbmRleCBvZiBbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdIHRvIC0xIGZvciBhY2Nlc3NpYmlsaXR5IHB1cnBvc2VzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIHRydWVcbiAgICovXG4gIHRyYXBGb2N1czogZmFsc2Vcbn1cblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKE9mZkNhbnZhcywgJ09mZkNhbnZhcycpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogUmVzcG9uc2l2ZU1lbnUgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLnJlc3BvbnNpdmVNZW51XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuYWNjb3JkaW9uTWVudVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5kcmlsbGRvd25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuZHJvcGRvd24tbWVudVxuICovXG5cbmNsYXNzIFJlc3BvbnNpdmVNZW51IHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSByZXNwb25zaXZlIG1lbnUuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgUmVzcG9uc2l2ZU1lbnUjaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgZHJvcGRvd24gbWVudS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgIHRoaXMucnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ3Jlc3BvbnNpdmUtbWVudScpO1xuICAgIHRoaXMuY3VycmVudE1xID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRQbHVnaW4gPSBudWxsO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnUmVzcG9uc2l2ZU1lbnUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgTWVudSBieSBwYXJzaW5nIHRoZSBjbGFzc2VzIGZyb20gdGhlICdkYXRhLVJlc3BvbnNpdmVNZW51JyBhdHRyaWJ1dGUgb24gdGhlIGVsZW1lbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgLy8gVGhlIGZpcnN0IHRpbWUgYW4gSW50ZXJjaGFuZ2UgcGx1Z2luIGlzIGluaXRpYWxpemVkLCB0aGlzLnJ1bGVzIGlzIGNvbnZlcnRlZCBmcm9tIGEgc3RyaW5nIG9mIFwiY2xhc3Nlc1wiIHRvIGFuIG9iamVjdCBvZiBydWxlc1xuICAgIGlmICh0eXBlb2YgdGhpcy5ydWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGxldCBydWxlc1RyZWUgPSB7fTtcblxuICAgICAgLy8gUGFyc2UgcnVsZXMgZnJvbSBcImNsYXNzZXNcIiBwdWxsZWQgZnJvbSBkYXRhIGF0dHJpYnV0ZVxuICAgICAgbGV0IHJ1bGVzID0gdGhpcy5ydWxlcy5zcGxpdCgnICcpO1xuXG4gICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZXZlcnkgcnVsZSBmb3VuZFxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcnVsZSA9IHJ1bGVzW2ldLnNwbGl0KCctJyk7XG4gICAgICAgIGxldCBydWxlU2l6ZSA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMF0gOiAnc21hbGwnO1xuICAgICAgICBsZXQgcnVsZVBsdWdpbiA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMV0gOiBydWxlWzBdO1xuXG4gICAgICAgIGlmIChNZW51UGx1Z2luc1tydWxlUGx1Z2luXSAhPT0gbnVsbCkge1xuICAgICAgICAgIHJ1bGVzVHJlZVtydWxlU2l6ZV0gPSBNZW51UGx1Z2luc1tydWxlUGx1Z2luXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnJ1bGVzID0gcnVsZXNUcmVlO1xuICAgIH1cblxuICAgIGlmICghJC5pc0VtcHR5T2JqZWN0KHRoaXMucnVsZXMpKSB7XG4gICAgICB0aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgIH1cbiAgICAvLyBBZGQgZGF0YS1tdXRhdGUgc2luY2UgY2hpbGRyZW4gbWF5IG5lZWQgaXQuXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLW11dGF0ZScsICh0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGEtbXV0YXRlJykgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAncmVzcG9uc2l2ZS1tZW51JykpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIHRoZSBNZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5fY2hlY2tNZWRpYVF1ZXJpZXMoKTtcbiAgICB9KTtcbiAgICAvLyAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5SZXNwb25zaXZlTWVudScsIGZ1bmN0aW9uKCkge1xuICAgIC8vICAgX3RoaXMuX2NoZWNrTWVkaWFRdWVyaWVzKCk7XG4gICAgLy8gfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBjdXJyZW50IHNjcmVlbiB3aWR0aCBhZ2FpbnN0IGF2YWlsYWJsZSBtZWRpYSBxdWVyaWVzLiBJZiB0aGUgbWVkaWEgcXVlcnkgaGFzIGNoYW5nZWQsIGFuZCB0aGUgcGx1Z2luIG5lZWRlZCBoYXMgY2hhbmdlZCwgdGhlIHBsdWdpbnMgd2lsbCBzd2FwIG91dC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfY2hlY2tNZWRpYVF1ZXJpZXMoKSB7XG4gICAgdmFyIG1hdGNoZWRNcSwgX3RoaXMgPSB0aGlzO1xuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHJ1bGUgYW5kIGZpbmQgdGhlIGxhc3QgbWF0Y2hpbmcgcnVsZVxuICAgICQuZWFjaCh0aGlzLnJ1bGVzLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChrZXkpKSB7XG4gICAgICAgIG1hdGNoZWRNcSA9IGtleTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE5vIG1hdGNoPyBObyBkaWNlXG4gICAgaWYgKCFtYXRjaGVkTXEpIHJldHVybjtcblxuICAgIC8vIFBsdWdpbiBhbHJlYWR5IGluaXRpYWxpemVkPyBXZSBnb29kXG4gICAgaWYgKHRoaXMuY3VycmVudFBsdWdpbiBpbnN0YW5jZW9mIHRoaXMucnVsZXNbbWF0Y2hlZE1xXS5wbHVnaW4pIHJldHVybjtcblxuICAgIC8vIFJlbW92ZSBleGlzdGluZyBwbHVnaW4tc3BlY2lmaWMgQ1NTIGNsYXNzZXNcbiAgICAkLmVhY2goTWVudVBsdWdpbnMsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIF90aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHZhbHVlLmNzc0NsYXNzKTtcbiAgICB9KTtcblxuICAgIC8vIEFkZCB0aGUgQ1NTIGNsYXNzIGZvciB0aGUgbmV3IHBsdWdpblxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5ydWxlc1ttYXRjaGVkTXFdLmNzc0NsYXNzKTtcblxuICAgIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgbmV3IHBsdWdpblxuICAgIGlmICh0aGlzLmN1cnJlbnRQbHVnaW4pIHRoaXMuY3VycmVudFBsdWdpbi5kZXN0cm95KCk7XG4gICAgdGhpcy5jdXJyZW50UGx1Z2luID0gbmV3IHRoaXMucnVsZXNbbWF0Y2hlZE1xXS5wbHVnaW4odGhpcy4kZWxlbWVudCwge30pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBpbnN0YW5jZSBvZiB0aGUgY3VycmVudCBwbHVnaW4gb24gdGhpcyBlbGVtZW50LCBhcyB3ZWxsIGFzIHRoZSB3aW5kb3cgcmVzaXplIGhhbmRsZXIgdGhhdCBzd2l0Y2hlcyB0aGUgcGx1Z2lucyBvdXQuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmN1cnJlbnRQbHVnaW4uZGVzdHJveSgpO1xuICAgICQod2luZG93KS5vZmYoJy56Zi5SZXNwb25zaXZlTWVudScpO1xuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5SZXNwb25zaXZlTWVudS5kZWZhdWx0cyA9IHt9O1xuXG4vLyBUaGUgcGx1Z2luIG1hdGNoZXMgdGhlIHBsdWdpbiBjbGFzc2VzIHdpdGggdGhlc2UgcGx1Z2luIGluc3RhbmNlcy5cbnZhciBNZW51UGx1Z2lucyA9IHtcbiAgZHJvcGRvd246IHtcbiAgICBjc3NDbGFzczogJ2Ryb3Bkb3duJyxcbiAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2Ryb3Bkb3duLW1lbnUnXSB8fCBudWxsXG4gIH0sXG4gZHJpbGxkb3duOiB7XG4gICAgY3NzQ2xhc3M6ICdkcmlsbGRvd24nLFxuICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snZHJpbGxkb3duJ10gfHwgbnVsbFxuICB9LFxuICBhY2NvcmRpb246IHtcbiAgICBjc3NDbGFzczogJ2FjY29yZGlvbi1tZW51JyxcbiAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2FjY29yZGlvbi1tZW51J10gfHwgbnVsbFxuICB9XG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oUmVzcG9uc2l2ZU1lbnUsICdSZXNwb25zaXZlTWVudScpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogUmVzcG9uc2l2ZVRvZ2dsZSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ucmVzcG9uc2l2ZVRvZ2dsZVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gKi9cblxuY2xhc3MgUmVzcG9uc2l2ZVRvZ2dsZSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIFRhYiBCYXIuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgUmVzcG9uc2l2ZVRvZ2dsZSNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBhdHRhY2ggdGFiIGJhciBmdW5jdGlvbmFsaXR5IHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFJlc3BvbnNpdmVUb2dnbGUuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1Jlc3BvbnNpdmVUb2dnbGUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgdGFiIGJhciBieSBmaW5kaW5nIHRoZSB0YXJnZXQgZWxlbWVudCwgdG9nZ2xpbmcgZWxlbWVudCwgYW5kIHJ1bm5pbmcgdXBkYXRlKCkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIHRhcmdldElEID0gdGhpcy4kZWxlbWVudC5kYXRhKCdyZXNwb25zaXZlLXRvZ2dsZScpO1xuICAgIGlmICghdGFyZ2V0SUQpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1lvdXIgdGFiIGJhciBuZWVkcyBhbiBJRCBvZiBhIE1lbnUgYXMgdGhlIHZhbHVlIG9mIGRhdGEtdGFiLWJhci4nKTtcbiAgICB9XG5cbiAgICB0aGlzLiR0YXJnZXRNZW51ID0gJChgIyR7dGFyZ2V0SUR9YCk7XG4gICAgdGhpcy4kdG9nZ2xlciA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtdG9nZ2xlXScpO1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIHRoaXMuJHRhcmdldE1lbnUuZGF0YSgpKTtcblxuICAgIC8vIElmIHRoZXkgd2VyZSBzZXQsIHBhcnNlIHRoZSBhbmltYXRpb24gY2xhc3Nlc1xuICAgIGlmKHRoaXMub3B0aW9ucy5hbmltYXRlKSB7XG4gICAgICBsZXQgaW5wdXQgPSB0aGlzLm9wdGlvbnMuYW5pbWF0ZS5zcGxpdCgnICcpO1xuXG4gICAgICB0aGlzLmFuaW1hdGlvbkluID0gaW5wdXRbMF07XG4gICAgICB0aGlzLmFuaW1hdGlvbk91dCA9IGlucHV0WzFdIHx8IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBuZWNlc3NhcnkgZXZlbnQgaGFuZGxlcnMgZm9yIHRoZSB0YWIgYmFyIHRvIHdvcmsuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5fdXBkYXRlTXFIYW5kbGVyID0gdGhpcy5fdXBkYXRlLmJpbmQodGhpcyk7XG5cbiAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX3VwZGF0ZU1xSGFuZGxlcik7XG5cbiAgICB0aGlzLiR0b2dnbGVyLm9uKCdjbGljay56Zi5yZXNwb25zaXZlVG9nZ2xlJywgdGhpcy50b2dnbGVNZW51LmJpbmQodGhpcykpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGUgY3VycmVudCBtZWRpYSBxdWVyeSB0byBkZXRlcm1pbmUgaWYgdGhlIHRhYiBiYXIgc2hvdWxkIGJlIHZpc2libGUgb3IgaGlkZGVuLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF91cGRhdGUoKSB7XG4gICAgLy8gTW9iaWxlXG4gICAgaWYgKCFGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdCh0aGlzLm9wdGlvbnMuaGlkZUZvcikpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuc2hvdygpO1xuICAgICAgdGhpcy4kdGFyZ2V0TWVudS5oaWRlKCk7XG4gICAgfVxuXG4gICAgLy8gRGVza3RvcFxuICAgIGVsc2Uge1xuICAgICAgdGhpcy4kZWxlbWVudC5oaWRlKCk7XG4gICAgICB0aGlzLiR0YXJnZXRNZW51LnNob3coKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgZWxlbWVudCBhdHRhY2hlZCB0byB0aGUgdGFiIGJhci4gVGhlIHRvZ2dsZSBvbmx5IGhhcHBlbnMgaWYgdGhlIHNjcmVlbiBpcyBzbWFsbCBlbm91Z2ggdG8gYWxsb3cgaXQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgUmVzcG9uc2l2ZVRvZ2dsZSN0b2dnbGVkXG4gICAqL1xuICB0b2dnbGVNZW51KCkge1xuICAgIGlmICghRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QodGhpcy5vcHRpb25zLmhpZGVGb3IpKSB7XG4gICAgICBpZih0aGlzLm9wdGlvbnMuYW5pbWF0ZSkge1xuICAgICAgICBpZiAodGhpcy4kdGFyZ2V0TWVudS5pcygnOmhpZGRlbicpKSB7XG4gICAgICAgICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZUluKHRoaXMuJHRhcmdldE1lbnUsIHRoaXMuYW5pbWF0aW9uSW4sICgpID0+IHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgZWxlbWVudCBhdHRhY2hlZCB0byB0aGUgdGFiIGJhciB0b2dnbGVzLlxuICAgICAgICAgICAgICogQGV2ZW50IFJlc3BvbnNpdmVUb2dnbGUjdG9nZ2xlZFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3RvZ2dsZWQuemYucmVzcG9uc2l2ZVRvZ2dsZScpO1xuICAgICAgICAgICAgdGhpcy4kdGFyZ2V0TWVudS5maW5kKCdbZGF0YS1tdXRhdGVdJykudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KHRoaXMuJHRhcmdldE1lbnUsIHRoaXMuYW5pbWF0aW9uT3V0LCAoKSA9PiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIGVsZW1lbnQgYXR0YWNoZWQgdG8gdGhlIHRhYiBiYXIgdG9nZ2xlcy5cbiAgICAgICAgICAgICAqIEBldmVudCBSZXNwb25zaXZlVG9nZ2xlI3RvZ2dsZWRcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCd0b2dnbGVkLnpmLnJlc3BvbnNpdmVUb2dnbGUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuJHRhcmdldE1lbnUudG9nZ2xlKDApO1xuICAgICAgICB0aGlzLiR0YXJnZXRNZW51LmZpbmQoJ1tkYXRhLW11dGF0ZV0nKS50cmlnZ2VyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIGVsZW1lbnQgYXR0YWNoZWQgdG8gdGhlIHRhYiBiYXIgdG9nZ2xlcy5cbiAgICAgICAgICogQGV2ZW50IFJlc3BvbnNpdmVUb2dnbGUjdG9nZ2xlZFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCd0b2dnbGVkLnpmLnJlc3BvbnNpdmVUb2dnbGUnKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnJlc3BvbnNpdmVUb2dnbGUnKTtcbiAgICB0aGlzLiR0b2dnbGVyLm9mZignLnpmLnJlc3BvbnNpdmVUb2dnbGUnKTtcblxuICAgICQod2luZG93KS5vZmYoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX3VwZGF0ZU1xSGFuZGxlcik7XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuUmVzcG9uc2l2ZVRvZ2dsZS5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIFRoZSBicmVha3BvaW50IGFmdGVyIHdoaWNoIHRoZSBtZW51IGlzIGFsd2F5cyBzaG93biwgYW5kIHRoZSB0YWIgYmFyIGlzIGhpZGRlbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnbWVkaXVtJ1xuICAgKi9cbiAgaGlkZUZvcjogJ21lZGl1bScsXG5cbiAgLyoqXG4gICAqIFRvIGRlY2lkZSBpZiB0aGUgdG9nZ2xlIHNob3VsZCBiZSBhbmltYXRlZCBvciBub3QuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGFuaW1hdGU6IGZhbHNlXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oUmVzcG9uc2l2ZVRvZ2dsZSwgJ1Jlc3BvbnNpdmVUb2dnbGUnKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIFNsaWRlciBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uc2xpZGVyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50b3VjaFxuICovXG5cbmNsYXNzIFNsaWRlciB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGEgc2xpZGVyIGNvbnRyb2wuXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgc2xpZGVyIGNvbnRyb2wuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgU2xpZGVyLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdTbGlkZXInKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdTbGlkZXInLCB7XG4gICAgICAnbHRyJzoge1xuICAgICAgICAnQVJST1dfUklHSFQnOiAnaW5jcmVhc2UnLFxuICAgICAgICAnQVJST1dfVVAnOiAnaW5jcmVhc2UnLFxuICAgICAgICAnQVJST1dfRE9XTic6ICdkZWNyZWFzZScsXG4gICAgICAgICdBUlJPV19MRUZUJzogJ2RlY3JlYXNlJyxcbiAgICAgICAgJ1NISUZUX0FSUk9XX1JJR0hUJzogJ2luY3JlYXNlX2Zhc3QnLFxuICAgICAgICAnU0hJRlRfQVJST1dfVVAnOiAnaW5jcmVhc2VfZmFzdCcsXG4gICAgICAgICdTSElGVF9BUlJPV19ET1dOJzogJ2RlY3JlYXNlX2Zhc3QnLFxuICAgICAgICAnU0hJRlRfQVJST1dfTEVGVCc6ICdkZWNyZWFzZV9mYXN0J1xuICAgICAgfSxcbiAgICAgICdydGwnOiB7XG4gICAgICAgICdBUlJPV19MRUZUJzogJ2luY3JlYXNlJyxcbiAgICAgICAgJ0FSUk9XX1JJR0hUJzogJ2RlY3JlYXNlJyxcbiAgICAgICAgJ1NISUZUX0FSUk9XX0xFRlQnOiAnaW5jcmVhc2VfZmFzdCcsXG4gICAgICAgICdTSElGVF9BUlJPV19SSUdIVCc6ICdkZWNyZWFzZV9mYXN0J1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpbGl6ZXMgdGhlIHBsdWdpbiBieSByZWFkaW5nL3NldHRpbmcgYXR0cmlidXRlcywgY3JlYXRpbmcgY29sbGVjdGlvbnMgYW5kIHNldHRpbmcgdGhlIGluaXRpYWwgcG9zaXRpb24gb2YgdGhlIGhhbmRsZShzKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLmlucHV0cyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnaW5wdXQnKTtcbiAgICB0aGlzLmhhbmRsZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXNsaWRlci1oYW5kbGVdJyk7XG5cbiAgICB0aGlzLiRoYW5kbGUgPSB0aGlzLmhhbmRsZXMuZXEoMCk7XG4gICAgdGhpcy4kaW5wdXQgPSB0aGlzLmlucHV0cy5sZW5ndGggPyB0aGlzLmlucHV0cy5lcSgwKSA6ICQoYCMke3RoaXMuJGhhbmRsZS5hdHRyKCdhcmlhLWNvbnRyb2xzJyl9YCk7XG4gICAgdGhpcy4kZmlsbCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtc2xpZGVyLWZpbGxdJykuY3NzKHRoaXMub3B0aW9ucy52ZXJ0aWNhbCA/ICdoZWlnaHQnIDogJ3dpZHRoJywgMCk7XG5cbiAgICB2YXIgaXNEYmwgPSBmYWxzZSxcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZGlzYWJsZWQgfHwgdGhpcy4kZWxlbWVudC5oYXNDbGFzcyh0aGlzLm9wdGlvbnMuZGlzYWJsZWRDbGFzcykpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5kaXNhYmxlZCA9IHRydWU7XG4gICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKHRoaXMub3B0aW9ucy5kaXNhYmxlZENsYXNzKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmlucHV0cy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuaW5wdXRzID0gJCgpLmFkZCh0aGlzLiRpbnB1dCk7XG4gICAgICB0aGlzLm9wdGlvbnMuYmluZGluZyA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5fc2V0SW5pdEF0dHIoMCk7XG5cbiAgICBpZiAodGhpcy5oYW5kbGVzWzFdKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuZG91YmxlU2lkZWQgPSB0cnVlO1xuICAgICAgdGhpcy4kaGFuZGxlMiA9IHRoaXMuaGFuZGxlcy5lcSgxKTtcbiAgICAgIHRoaXMuJGlucHV0MiA9IHRoaXMuaW5wdXRzLmxlbmd0aCA+IDEgPyB0aGlzLmlucHV0cy5lcSgxKSA6ICQoYCMke3RoaXMuJGhhbmRsZTIuYXR0cignYXJpYS1jb250cm9scycpfWApO1xuXG4gICAgICBpZiAoIXRoaXMuaW5wdXRzWzFdKSB7XG4gICAgICAgIHRoaXMuaW5wdXRzID0gdGhpcy5pbnB1dHMuYWRkKHRoaXMuJGlucHV0Mik7XG4gICAgICB9XG4gICAgICBpc0RibCA9IHRydWU7XG5cbiAgICAgIC8vIHRoaXMuJGhhbmRsZS50cmlnZ2VySGFuZGxlcignY2xpY2suemYuc2xpZGVyJyk7XG4gICAgICB0aGlzLl9zZXRJbml0QXR0cigxKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgaGFuZGxlIHBvc2l0aW9uc1xuICAgIHRoaXMuc2V0SGFuZGxlcygpO1xuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICBzZXRIYW5kbGVzKCkge1xuICAgIGlmKHRoaXMuaGFuZGxlc1sxXSkge1xuICAgICAgdGhpcy5fc2V0SGFuZGxlUG9zKHRoaXMuJGhhbmRsZSwgdGhpcy5pbnB1dHMuZXEoMCkudmFsKCksIHRydWUsICgpID0+IHtcbiAgICAgICAgdGhpcy5fc2V0SGFuZGxlUG9zKHRoaXMuJGhhbmRsZTIsIHRoaXMuaW5wdXRzLmVxKDEpLnZhbCgpLCB0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZXRIYW5kbGVQb3ModGhpcy4kaGFuZGxlLCB0aGlzLmlucHV0cy5lcSgwKS52YWwoKSwgdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgX3JlZmxvdygpIHtcbiAgICB0aGlzLnNldEhhbmRsZXMoKTtcbiAgfVxuICAvKipcbiAgKiBAZnVuY3Rpb25cbiAgKiBAcHJpdmF0ZVxuICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZSAtIGZsb2F0aW5nIHBvaW50ICh0aGUgdmFsdWUpIHRvIGJlIHRyYW5zZm9ybWVkIHVzaW5nIHRvIGEgcmVsYXRpdmUgcG9zaXRpb24gb24gdGhlIHNsaWRlciAodGhlIGludmVyc2Ugb2YgX3ZhbHVlKVxuICAqL1xuICBfcGN0T2ZCYXIodmFsdWUpIHtcbiAgICB2YXIgcGN0T2ZCYXIgPSBwZXJjZW50KHZhbHVlIC0gdGhpcy5vcHRpb25zLnN0YXJ0LCB0aGlzLm9wdGlvbnMuZW5kIC0gdGhpcy5vcHRpb25zLnN0YXJ0KVxuXG4gICAgc3dpdGNoKHRoaXMub3B0aW9ucy5wb3NpdGlvblZhbHVlRnVuY3Rpb24pIHtcbiAgICBjYXNlIFwicG93XCI6XG4gICAgICBwY3RPZkJhciA9IHRoaXMuX2xvZ1RyYW5zZm9ybShwY3RPZkJhcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwibG9nXCI6XG4gICAgICBwY3RPZkJhciA9IHRoaXMuX3Bvd1RyYW5zZm9ybShwY3RPZkJhcik7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gcGN0T2ZCYXIudG9GaXhlZCgyKVxuICB9XG5cbiAgLyoqXG4gICogQGZ1bmN0aW9uXG4gICogQHByaXZhdGVcbiAgKiBAcGFyYW0ge051bWJlcn0gcGN0T2ZCYXIgLSBmbG9hdGluZyBwb2ludCwgdGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSBzbGlkZXIgKHR5cGljYWxseSBiZXR3ZWVuIDAtMSkgdG8gYmUgdHJhbnNmb3JtZWQgdG8gYSB2YWx1ZVxuICAqL1xuICBfdmFsdWUocGN0T2ZCYXIpIHtcbiAgICBzd2l0Y2godGhpcy5vcHRpb25zLnBvc2l0aW9uVmFsdWVGdW5jdGlvbikge1xuICAgIGNhc2UgXCJwb3dcIjpcbiAgICAgIHBjdE9mQmFyID0gdGhpcy5fcG93VHJhbnNmb3JtKHBjdE9mQmFyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJsb2dcIjpcbiAgICAgIHBjdE9mQmFyID0gdGhpcy5fbG9nVHJhbnNmb3JtKHBjdE9mQmFyKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB2YXIgdmFsdWUgPSAodGhpcy5vcHRpb25zLmVuZCAtIHRoaXMub3B0aW9ucy5zdGFydCkgKiBwY3RPZkJhciArIHRoaXMub3B0aW9ucy5zdGFydDtcblxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLyoqXG4gICogQGZ1bmN0aW9uXG4gICogQHByaXZhdGVcbiAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWUgLSBmbG9hdGluZyBwb2ludCAodHlwaWNhbGx5IGJldHdlZW4gMC0xKSB0byBiZSB0cmFuc2Zvcm1lZCB1c2luZyB0aGUgbG9nIGZ1bmN0aW9uXG4gICovXG4gIF9sb2dUcmFuc2Zvcm0odmFsdWUpIHtcbiAgICByZXR1cm4gYmFzZUxvZyh0aGlzLm9wdGlvbnMubm9uTGluZWFyQmFzZSwgKCh2YWx1ZSoodGhpcy5vcHRpb25zLm5vbkxpbmVhckJhc2UtMSkpKzEpKVxuICB9XG5cbiAgLyoqXG4gICogQGZ1bmN0aW9uXG4gICogQHByaXZhdGVcbiAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWUgLSBmbG9hdGluZyBwb2ludCAodHlwaWNhbGx5IGJldHdlZW4gMC0xKSB0byBiZSB0cmFuc2Zvcm1lZCB1c2luZyB0aGUgcG93ZXIgZnVuY3Rpb25cbiAgKi9cbiAgX3Bvd1RyYW5zZm9ybSh2YWx1ZSkge1xuICAgIHJldHVybiAoTWF0aC5wb3codGhpcy5vcHRpb25zLm5vbkxpbmVhckJhc2UsIHZhbHVlKSAtIDEpIC8gKHRoaXMub3B0aW9ucy5ub25MaW5lYXJCYXNlIC0gMSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgc2VsZWN0ZWQgaGFuZGxlIGFuZCBmaWxsIGJhci5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkaG5kbCAtIHRoZSBzZWxlY3RlZCBoYW5kbGUgdG8gbW92ZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxvY2F0aW9uIC0gZmxvYXRpbmcgcG9pbnQgYmV0d2VlbiB0aGUgc3RhcnQgYW5kIGVuZCB2YWx1ZXMgb2YgdGhlIHNsaWRlciBiYXIuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZmlyZSBvbiBjb21wbGV0aW9uLlxuICAgKiBAZmlyZXMgU2xpZGVyI21vdmVkXG4gICAqIEBmaXJlcyBTbGlkZXIjY2hhbmdlZFxuICAgKi9cbiAgX3NldEhhbmRsZVBvcygkaG5kbCwgbG9jYXRpb24sIG5vSW52ZXJ0LCBjYikge1xuICAgIC8vIGRvbid0IG1vdmUgaWYgdGhlIHNsaWRlciBoYXMgYmVlbiBkaXNhYmxlZCBzaW5jZSBpdHMgaW5pdGlhbGl6YXRpb25cbiAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcyh0aGlzLm9wdGlvbnMuZGlzYWJsZWRDbGFzcykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy9taWdodCBuZWVkIHRvIGFsdGVyIHRoYXQgc2xpZ2h0bHkgZm9yIGJhcnMgdGhhdCB3aWxsIGhhdmUgb2RkIG51bWJlciBzZWxlY3Rpb25zLlxuICAgIGxvY2F0aW9uID0gcGFyc2VGbG9hdChsb2NhdGlvbik7Ly9vbiBpbnB1dCBjaGFuZ2UgZXZlbnRzLCBjb252ZXJ0IHN0cmluZyB0byBudW1iZXIuLi5ncnVtYmxlLlxuXG4gICAgLy8gcHJldmVudCBzbGlkZXIgZnJvbSBydW5uaW5nIG91dCBvZiBib3VuZHMsIGlmIHZhbHVlIGV4Y2VlZHMgdGhlIGxpbWl0cyBzZXQgdGhyb3VnaCBvcHRpb25zLCBvdmVycmlkZSB0aGUgdmFsdWUgdG8gbWluL21heFxuICAgIGlmIChsb2NhdGlvbiA8IHRoaXMub3B0aW9ucy5zdGFydCkgeyBsb2NhdGlvbiA9IHRoaXMub3B0aW9ucy5zdGFydDsgfVxuICAgIGVsc2UgaWYgKGxvY2F0aW9uID4gdGhpcy5vcHRpb25zLmVuZCkgeyBsb2NhdGlvbiA9IHRoaXMub3B0aW9ucy5lbmQ7IH1cblxuICAgIHZhciBpc0RibCA9IHRoaXMub3B0aW9ucy5kb3VibGVTaWRlZDtcblxuICAgIGlmIChpc0RibCkgeyAvL3RoaXMgYmxvY2sgaXMgdG8gcHJldmVudCAyIGhhbmRsZXMgZnJvbSBjcm9zc2luZyBlYWNob3RoZXIuIENvdWxkL3Nob3VsZCBiZSBpbXByb3ZlZC5cbiAgICAgIGlmICh0aGlzLmhhbmRsZXMuaW5kZXgoJGhuZGwpID09PSAwKSB7XG4gICAgICAgIHZhciBoMlZhbCA9IHBhcnNlRmxvYXQodGhpcy4kaGFuZGxlMi5hdHRyKCdhcmlhLXZhbHVlbm93JykpO1xuICAgICAgICBsb2NhdGlvbiA9IGxvY2F0aW9uID49IGgyVmFsID8gaDJWYWwgLSB0aGlzLm9wdGlvbnMuc3RlcCA6IGxvY2F0aW9uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGgxVmFsID0gcGFyc2VGbG9hdCh0aGlzLiRoYW5kbGUuYXR0cignYXJpYS12YWx1ZW5vdycpKTtcbiAgICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiA8PSBoMVZhbCA/IGgxVmFsICsgdGhpcy5vcHRpb25zLnN0ZXAgOiBsb2NhdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL3RoaXMgaXMgZm9yIHNpbmdsZS1oYW5kbGVkIHZlcnRpY2FsIHNsaWRlcnMsIGl0IGFkanVzdHMgdGhlIHZhbHVlIHRvIGFjY291bnQgZm9yIHRoZSBzbGlkZXIgYmVpbmcgXCJ1cHNpZGUtZG93blwiXG4gICAgLy9mb3IgY2xpY2sgYW5kIGRyYWcgZXZlbnRzLCBpdCdzIHdlaXJkIGR1ZSB0byB0aGUgc2NhbGUoLTEsIDEpIGNzcyBwcm9wZXJ0eVxuICAgIGlmICh0aGlzLm9wdGlvbnMudmVydGljYWwgJiYgIW5vSW52ZXJ0KSB7XG4gICAgICBsb2NhdGlvbiA9IHRoaXMub3B0aW9ucy5lbmQgLSBsb2NhdGlvbjtcbiAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICB2ZXJ0ID0gdGhpcy5vcHRpb25zLnZlcnRpY2FsLFxuICAgICAgICBoT3JXID0gdmVydCA/ICdoZWlnaHQnIDogJ3dpZHRoJyxcbiAgICAgICAgbE9yVCA9IHZlcnQgPyAndG9wJyA6ICdsZWZ0JyxcbiAgICAgICAgaGFuZGxlRGltID0gJGhuZGxbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClbaE9yV10sXG4gICAgICAgIGVsZW1EaW0gPSB0aGlzLiRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpW2hPclddLFxuICAgICAgICAvL3BlcmNlbnRhZ2Ugb2YgYmFyIG1pbi9tYXggdmFsdWUgYmFzZWQgb24gY2xpY2sgb3IgZHJhZyBwb2ludFxuICAgICAgICBwY3RPZkJhciA9IHRoaXMuX3BjdE9mQmFyKGxvY2F0aW9uKSxcbiAgICAgICAgLy9udW1iZXIgb2YgYWN0dWFsIHBpeGVscyB0byBzaGlmdCB0aGUgaGFuZGxlLCBiYXNlZCBvbiB0aGUgcGVyY2VudGFnZSBvYnRhaW5lZCBhYm92ZVxuICAgICAgICBweFRvTW92ZSA9IChlbGVtRGltIC0gaGFuZGxlRGltKSAqIHBjdE9mQmFyLFxuICAgICAgICAvL3BlcmNlbnRhZ2Ugb2YgYmFyIHRvIHNoaWZ0IHRoZSBoYW5kbGVcbiAgICAgICAgbW92ZW1lbnQgPSAocGVyY2VudChweFRvTW92ZSwgZWxlbURpbSkgKiAxMDApLnRvRml4ZWQodGhpcy5vcHRpb25zLmRlY2ltYWwpO1xuICAgICAgICAvL2ZpeGluZyB0aGUgZGVjaW1hbCB2YWx1ZSBmb3IgdGhlIGxvY2F0aW9uIG51bWJlciwgaXMgcGFzc2VkIHRvIG90aGVyIG1ldGhvZHMgYXMgYSBmaXhlZCBmbG9hdGluZy1wb2ludCB2YWx1ZVxuICAgICAgICBsb2NhdGlvbiA9IHBhcnNlRmxvYXQobG9jYXRpb24udG9GaXhlZCh0aGlzLm9wdGlvbnMuZGVjaW1hbCkpO1xuICAgICAgICAvLyBkZWNsYXJlIGVtcHR5IG9iamVjdCBmb3IgY3NzIGFkanVzdG1lbnRzLCBvbmx5IHVzZWQgd2l0aCAyIGhhbmRsZWQtc2xpZGVyc1xuICAgIHZhciBjc3MgPSB7fTtcblxuICAgIHRoaXMuX3NldFZhbHVlcygkaG5kbCwgbG9jYXRpb24pO1xuXG4gICAgLy8gVE9ETyB1cGRhdGUgdG8gY2FsY3VsYXRlIGJhc2VkIG9uIHZhbHVlcyBzZXQgdG8gcmVzcGVjdGl2ZSBpbnB1dHM/P1xuICAgIGlmIChpc0RibCkge1xuICAgICAgdmFyIGlzTGVmdEhuZGwgPSB0aGlzLmhhbmRsZXMuaW5kZXgoJGhuZGwpID09PSAwLFxuICAgICAgICAgIC8vZW1wdHkgdmFyaWFibGUsIHdpbGwgYmUgdXNlZCBmb3IgbWluLWhlaWdodC93aWR0aCBmb3IgZmlsbCBiYXJcbiAgICAgICAgICBkaW0sXG4gICAgICAgICAgLy9wZXJjZW50YWdlIHcvaCBvZiB0aGUgaGFuZGxlIGNvbXBhcmVkIHRvIHRoZSBzbGlkZXIgYmFyXG4gICAgICAgICAgaGFuZGxlUGN0ID0gIH5+KHBlcmNlbnQoaGFuZGxlRGltLCBlbGVtRGltKSAqIDEwMCk7XG4gICAgICAvL2lmIGxlZnQgaGFuZGxlLCB0aGUgbWF0aCBpcyBzbGlnaHRseSBkaWZmZXJlbnQgdGhhbiBpZiBpdCdzIHRoZSByaWdodCBoYW5kbGUsIGFuZCB0aGUgbGVmdC90b3AgcHJvcGVydHkgbmVlZHMgdG8gYmUgY2hhbmdlZCBmb3IgdGhlIGZpbGwgYmFyXG4gICAgICBpZiAoaXNMZWZ0SG5kbCkge1xuICAgICAgICAvL2xlZnQgb3IgdG9wIHBlcmNlbnRhZ2UgdmFsdWUgdG8gYXBwbHkgdG8gdGhlIGZpbGwgYmFyLlxuICAgICAgICBjc3NbbE9yVF0gPSBgJHttb3ZlbWVudH0lYDtcbiAgICAgICAgLy9jYWxjdWxhdGUgdGhlIG5ldyBtaW4taGVpZ2h0L3dpZHRoIGZvciB0aGUgZmlsbCBiYXIuXG4gICAgICAgIGRpbSA9IHBhcnNlRmxvYXQodGhpcy4kaGFuZGxlMlswXS5zdHlsZVtsT3JUXSkgLSBtb3ZlbWVudCArIGhhbmRsZVBjdDtcbiAgICAgICAgLy90aGlzIGNhbGxiYWNrIGlzIG5lY2Vzc2FyeSB0byBwcmV2ZW50IGVycm9ycyBhbmQgYWxsb3cgdGhlIHByb3BlciBwbGFjZW1lbnQgYW5kIGluaXRpYWxpemF0aW9uIG9mIGEgMi1oYW5kbGVkIHNsaWRlclxuICAgICAgICAvL3BsdXMsIGl0IG1lYW5zIHdlIGRvbid0IGNhcmUgaWYgJ2RpbScgaXNOYU4gb24gaW5pdCwgaXQgd29uJ3QgYmUgaW4gdGhlIGZ1dHVyZS5cbiAgICAgICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgeyBjYigpOyB9Ly90aGlzIGlzIG9ubHkgbmVlZGVkIGZvciB0aGUgaW5pdGlhbGl6YXRpb24gb2YgMiBoYW5kbGVkIHNsaWRlcnNcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vanVzdCBjYWNoaW5nIHRoZSB2YWx1ZSBvZiB0aGUgbGVmdC9ib3R0b20gaGFuZGxlJ3MgbGVmdC90b3AgcHJvcGVydHlcbiAgICAgICAgdmFyIGhhbmRsZVBvcyA9IHBhcnNlRmxvYXQodGhpcy4kaGFuZGxlWzBdLnN0eWxlW2xPclRdKTtcbiAgICAgICAgLy9jYWxjdWxhdGUgdGhlIG5ldyBtaW4taGVpZ2h0L3dpZHRoIGZvciB0aGUgZmlsbCBiYXIuIFVzZSBpc05hTiB0byBwcmV2ZW50IGZhbHNlIHBvc2l0aXZlcyBmb3IgbnVtYmVycyA8PSAwXG4gICAgICAgIC8vYmFzZWQgb24gdGhlIHBlcmNlbnRhZ2Ugb2YgbW92ZW1lbnQgb2YgdGhlIGhhbmRsZSBiZWluZyBtYW5pcHVsYXRlZCwgbGVzcyB0aGUgb3Bwb3NpbmcgaGFuZGxlJ3MgbGVmdC90b3AgcG9zaXRpb24sIHBsdXMgdGhlIHBlcmNlbnRhZ2Ugdy9oIG9mIHRoZSBoYW5kbGUgaXRzZWxmXG4gICAgICAgIGRpbSA9IG1vdmVtZW50IC0gKGlzTmFOKGhhbmRsZVBvcykgPyAodGhpcy5vcHRpb25zLmluaXRpYWxTdGFydCAtIHRoaXMub3B0aW9ucy5zdGFydCkvKCh0aGlzLm9wdGlvbnMuZW5kLXRoaXMub3B0aW9ucy5zdGFydCkvMTAwKSA6IGhhbmRsZVBvcykgKyBoYW5kbGVQY3Q7XG4gICAgICB9XG4gICAgICAvLyBhc3NpZ24gdGhlIG1pbi1oZWlnaHQvd2lkdGggdG8gb3VyIGNzcyBvYmplY3RcbiAgICAgIGNzc1tgbWluLSR7aE9yV31gXSA9IGAke2RpbX0lYDtcbiAgICB9XG5cbiAgICB0aGlzLiRlbGVtZW50Lm9uZSgnZmluaXNoZWQuemYuYW5pbWF0ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgaGFuZGxlIGlzIGRvbmUgbW92aW5nLlxuICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgU2xpZGVyI21vdmVkXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdtb3ZlZC56Zi5zbGlkZXInLCBbJGhuZGxdKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgIC8vYmVjYXVzZSB3ZSBkb24ndCBrbm93IGV4YWN0bHkgaG93IHRoZSBoYW5kbGUgd2lsbCBiZSBtb3ZlZCwgY2hlY2sgdGhlIGFtb3VudCBvZiB0aW1lIGl0IHNob3VsZCB0YWtlIHRvIG1vdmUuXG4gICAgdmFyIG1vdmVUaW1lID0gdGhpcy4kZWxlbWVudC5kYXRhKCdkcmFnZ2luZycpID8gMTAwMC82MCA6IHRoaXMub3B0aW9ucy5tb3ZlVGltZTtcblxuICAgIEZvdW5kYXRpb24uTW92ZShtb3ZlVGltZSwgJGhuZGwsIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYWRqdXN0aW5nIHRoZSBsZWZ0L3RvcCBwcm9wZXJ0eSBvZiB0aGUgaGFuZGxlLCBiYXNlZCBvbiB0aGUgcGVyY2VudGFnZSBjYWxjdWxhdGVkIGFib3ZlXG4gICAgICAvLyBpZiBtb3ZlbWVudCBpc05hTiwgdGhhdCBpcyBiZWNhdXNlIHRoZSBzbGlkZXIgaXMgaGlkZGVuIGFuZCB3ZSBjYW5ub3QgZGV0ZXJtaW5lIGhhbmRsZSB3aWR0aCxcbiAgICAgIC8vIGZhbGwgYmFjayB0byBuZXh0IGJlc3QgZ3Vlc3MuXG4gICAgICBpZiAoaXNOYU4obW92ZW1lbnQpKSB7XG4gICAgICAgICRobmRsLmNzcyhsT3JULCBgJHtwY3RPZkJhciAqIDEwMH0lYCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgJGhuZGwuY3NzKGxPclQsIGAke21vdmVtZW50fSVgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFfdGhpcy5vcHRpb25zLmRvdWJsZVNpZGVkKSB7XG4gICAgICAgIC8vaWYgc2luZ2xlLWhhbmRsZWQsIGEgc2ltcGxlIG1ldGhvZCB0byBleHBhbmQgdGhlIGZpbGwgYmFyXG4gICAgICAgIF90aGlzLiRmaWxsLmNzcyhoT3JXLCBgJHtwY3RPZkJhciAqIDEwMH0lYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL290aGVyd2lzZSwgdXNlIHRoZSBjc3Mgb2JqZWN0IHdlIGNyZWF0ZWQgYWJvdmVcbiAgICAgICAgX3RoaXMuJGZpbGwuY3NzKGNzcyk7XG4gICAgICB9XG4gICAgfSk7XG5cblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIHZhbHVlIGhhcyBub3QgYmVlbiBjaGFuZ2UgZm9yIGEgZ2l2ZW4gdGltZS5cbiAgICAgKiBAZXZlbnQgU2xpZGVyI2NoYW5nZWRcbiAgICAgKi9cbiAgICBjbGVhclRpbWVvdXQoX3RoaXMudGltZW91dCk7XG4gICAgX3RoaXMudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NoYW5nZWQuemYuc2xpZGVyJywgWyRobmRsXSk7XG4gICAgfSwgX3RoaXMub3B0aW9ucy5jaGFuZ2VkRGVsYXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGluaXRpYWwgYXR0cmlidXRlIGZvciB0aGUgc2xpZGVyIGVsZW1lbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gaW5kZXggb2YgdGhlIGN1cnJlbnQgaGFuZGxlL2lucHV0IHRvIHVzZS5cbiAgICovXG4gIF9zZXRJbml0QXR0cihpZHgpIHtcbiAgICB2YXIgaW5pdFZhbCA9IChpZHggPT09IDAgPyB0aGlzLm9wdGlvbnMuaW5pdGlhbFN0YXJ0IDogdGhpcy5vcHRpb25zLmluaXRpYWxFbmQpXG4gICAgdmFyIGlkID0gdGhpcy5pbnB1dHMuZXEoaWR4KS5hdHRyKCdpZCcpIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ3NsaWRlcicpO1xuICAgIHRoaXMuaW5wdXRzLmVxKGlkeCkuYXR0cih7XG4gICAgICAnaWQnOiBpZCxcbiAgICAgICdtYXgnOiB0aGlzLm9wdGlvbnMuZW5kLFxuICAgICAgJ21pbic6IHRoaXMub3B0aW9ucy5zdGFydCxcbiAgICAgICdzdGVwJzogdGhpcy5vcHRpb25zLnN0ZXBcbiAgICB9KTtcbiAgICB0aGlzLmlucHV0cy5lcShpZHgpLnZhbChpbml0VmFsKTtcbiAgICB0aGlzLmhhbmRsZXMuZXEoaWR4KS5hdHRyKHtcbiAgICAgICdyb2xlJzogJ3NsaWRlcicsXG4gICAgICAnYXJpYS1jb250cm9scyc6IGlkLFxuICAgICAgJ2FyaWEtdmFsdWVtYXgnOiB0aGlzLm9wdGlvbnMuZW5kLFxuICAgICAgJ2FyaWEtdmFsdWVtaW4nOiB0aGlzLm9wdGlvbnMuc3RhcnQsXG4gICAgICAnYXJpYS12YWx1ZW5vdyc6IGluaXRWYWwsXG4gICAgICAnYXJpYS1vcmllbnRhdGlvbic6IHRoaXMub3B0aW9ucy52ZXJ0aWNhbCA/ICd2ZXJ0aWNhbCcgOiAnaG9yaXpvbnRhbCcsXG4gICAgICAndGFiaW5kZXgnOiAwXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgaW5wdXQgYW5kIGBhcmlhLXZhbHVlbm93YCB2YWx1ZXMgZm9yIHRoZSBzbGlkZXIgZWxlbWVudC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkaGFuZGxlIC0gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBoYW5kbGUuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWwgLSBmbG9hdGluZyBwb2ludCBvZiB0aGUgbmV3IHZhbHVlLlxuICAgKi9cbiAgX3NldFZhbHVlcygkaGFuZGxlLCB2YWwpIHtcbiAgICB2YXIgaWR4ID0gdGhpcy5vcHRpb25zLmRvdWJsZVNpZGVkID8gdGhpcy5oYW5kbGVzLmluZGV4KCRoYW5kbGUpIDogMDtcbiAgICB0aGlzLmlucHV0cy5lcShpZHgpLnZhbCh2YWwpO1xuICAgICRoYW5kbGUuYXR0cignYXJpYS12YWx1ZW5vdycsIHZhbCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBldmVudHMgb24gdGhlIHNsaWRlciBlbGVtZW50LlxuICAgKiBDYWxjdWxhdGVzIHRoZSBuZXcgbG9jYXRpb24gb2YgdGhlIGN1cnJlbnQgaGFuZGxlLlxuICAgKiBJZiB0aGVyZSBhcmUgdHdvIGhhbmRsZXMgYW5kIHRoZSBiYXIgd2FzIGNsaWNrZWQsIGl0IGRldGVybWluZXMgd2hpY2ggaGFuZGxlIHRvIG1vdmUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gZSAtIHRoZSBgZXZlbnRgIG9iamVjdCBwYXNzZWQgZnJvbSB0aGUgbGlzdGVuZXIuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkaGFuZGxlIC0gdGhlIGN1cnJlbnQgaGFuZGxlIHRvIGNhbGN1bGF0ZSBmb3IsIGlmIHNlbGVjdGVkLlxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsIC0gZmxvYXRpbmcgcG9pbnQgbnVtYmVyIGZvciB0aGUgbmV3IHZhbHVlIG9mIHRoZSBzbGlkZXIuXG4gICAqIFRPRE8gY2xlYW4gdGhpcyB1cCwgdGhlcmUncyBhIGxvdCBvZiByZXBlYXRlZCBjb2RlIGJldHdlZW4gdGhpcyBhbmQgdGhlIF9zZXRIYW5kbGVQb3MgZm4uXG4gICAqL1xuICBfaGFuZGxlRXZlbnQoZSwgJGhhbmRsZSwgdmFsKSB7XG4gICAgdmFyIHZhbHVlLCBoYXNWYWw7XG4gICAgaWYgKCF2YWwpIHsvL2NsaWNrIG9yIGRyYWcgZXZlbnRzXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgIHZlcnRpY2FsID0gdGhpcy5vcHRpb25zLnZlcnRpY2FsLFxuICAgICAgICAgIHBhcmFtID0gdmVydGljYWwgPyAnaGVpZ2h0JyA6ICd3aWR0aCcsXG4gICAgICAgICAgZGlyZWN0aW9uID0gdmVydGljYWwgPyAndG9wJyA6ICdsZWZ0JyxcbiAgICAgICAgICBldmVudE9mZnNldCA9IHZlcnRpY2FsID8gZS5wYWdlWSA6IGUucGFnZVgsXG4gICAgICAgICAgaGFsZk9mSGFuZGxlID0gdGhpcy4kaGFuZGxlWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpW3BhcmFtXSAvIDIsXG4gICAgICAgICAgYmFyRGltID0gdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVtwYXJhbV0sXG4gICAgICAgICAgd2luZG93U2Nyb2xsID0gdmVydGljYWwgPyAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgOiAkKHdpbmRvdykuc2Nyb2xsTGVmdCgpO1xuXG5cbiAgICAgIHZhciBlbGVtT2Zmc2V0ID0gdGhpcy4kZWxlbWVudC5vZmZzZXQoKVtkaXJlY3Rpb25dO1xuXG4gICAgICAvLyB0b3VjaCBldmVudHMgZW11bGF0ZWQgYnkgdGhlIHRvdWNoIHV0aWwgZ2l2ZSBwb3NpdGlvbiByZWxhdGl2ZSB0byBzY3JlZW4sIGFkZCB3aW5kb3cuc2Nyb2xsIHRvIGV2ZW50IGNvb3JkaW5hdGVzLi4uXG4gICAgICAvLyBiZXN0IHdheSB0byBndWVzcyB0aGlzIGlzIHNpbXVsYXRlZCBpcyBpZiBjbGllbnRZID09IHBhZ2VZXG4gICAgICBpZiAoZS5jbGllbnRZID09PSBlLnBhZ2VZKSB7IGV2ZW50T2Zmc2V0ID0gZXZlbnRPZmZzZXQgKyB3aW5kb3dTY3JvbGw7IH1cbiAgICAgIHZhciBldmVudEZyb21CYXIgPSBldmVudE9mZnNldCAtIGVsZW1PZmZzZXQ7XG4gICAgICB2YXIgYmFyWFk7XG4gICAgICBpZiAoZXZlbnRGcm9tQmFyIDwgMCkge1xuICAgICAgICBiYXJYWSA9IDA7XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50RnJvbUJhciA+IGJhckRpbSkge1xuICAgICAgICBiYXJYWSA9IGJhckRpbTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJhclhZID0gZXZlbnRGcm9tQmFyO1xuICAgICAgfVxuICAgICAgdmFyIG9mZnNldFBjdCA9IHBlcmNlbnQoYmFyWFksIGJhckRpbSk7XG5cbiAgICAgIHZhbHVlID0gdGhpcy5fdmFsdWUob2Zmc2V0UGN0KTtcblxuICAgICAgLy8gdHVybiBldmVyeXRoaW5nIGFyb3VuZCBmb3IgUlRMLCB5YXkgbWF0aCFcbiAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpICYmICF0aGlzLm9wdGlvbnMudmVydGljYWwpIHt2YWx1ZSA9IHRoaXMub3B0aW9ucy5lbmQgLSB2YWx1ZTt9XG5cbiAgICAgIHZhbHVlID0gX3RoaXMuX2FkanVzdFZhbHVlKG51bGwsIHZhbHVlKTtcbiAgICAgIC8vYm9vbGVhbiBmbGFnIGZvciB0aGUgc2V0SGFuZGxlUG9zIGZuLCBzcGVjaWZpY2FsbHkgZm9yIHZlcnRpY2FsIHNsaWRlcnNcbiAgICAgIGhhc1ZhbCA9IGZhbHNlO1xuXG4gICAgICBpZiAoISRoYW5kbGUpIHsvL2ZpZ3VyZSBvdXQgd2hpY2ggaGFuZGxlIGl0IGlzLCBwYXNzIGl0IHRvIHRoZSBuZXh0IGZ1bmN0aW9uLlxuICAgICAgICB2YXIgZmlyc3RIbmRsUG9zID0gYWJzUG9zaXRpb24odGhpcy4kaGFuZGxlLCBkaXJlY3Rpb24sIGJhclhZLCBwYXJhbSksXG4gICAgICAgICAgICBzZWNuZEhuZGxQb3MgPSBhYnNQb3NpdGlvbih0aGlzLiRoYW5kbGUyLCBkaXJlY3Rpb24sIGJhclhZLCBwYXJhbSk7XG4gICAgICAgICAgICAkaGFuZGxlID0gZmlyc3RIbmRsUG9zIDw9IHNlY25kSG5kbFBvcyA/IHRoaXMuJGhhbmRsZSA6IHRoaXMuJGhhbmRsZTI7XG4gICAgICB9XG5cbiAgICB9IGVsc2Ugey8vY2hhbmdlIGV2ZW50IG9uIGlucHV0XG4gICAgICB2YWx1ZSA9IHRoaXMuX2FkanVzdFZhbHVlKG51bGwsIHZhbCk7XG4gICAgICBoYXNWYWwgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuX3NldEhhbmRsZVBvcygkaGFuZGxlLCB2YWx1ZSwgaGFzVmFsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGp1c3RlcyB2YWx1ZSBmb3IgaGFuZGxlIGluIHJlZ2FyZCB0byBzdGVwIHZhbHVlLiByZXR1cm5zIGFkanVzdGVkIHZhbHVlXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGhhbmRsZSAtIHRoZSBzZWxlY3RlZCBoYW5kbGUuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZSAtIHZhbHVlIHRvIGFkanVzdC4gdXNlZCBpZiAkaGFuZGxlIGlzIGZhbHN5XG4gICAqL1xuICBfYWRqdXN0VmFsdWUoJGhhbmRsZSwgdmFsdWUpIHtcbiAgICB2YXIgdmFsLFxuICAgICAgc3RlcCA9IHRoaXMub3B0aW9ucy5zdGVwLFxuICAgICAgZGl2ID0gcGFyc2VGbG9hdChzdGVwLzIpLFxuICAgICAgbGVmdCwgcHJldl92YWwsIG5leHRfdmFsO1xuICAgIGlmICghISRoYW5kbGUpIHtcbiAgICAgIHZhbCA9IHBhcnNlRmxvYXQoJGhhbmRsZS5hdHRyKCdhcmlhLXZhbHVlbm93JykpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhbCA9IHZhbHVlO1xuICAgIH1cbiAgICBsZWZ0ID0gdmFsICUgc3RlcDtcbiAgICBwcmV2X3ZhbCA9IHZhbCAtIGxlZnQ7XG4gICAgbmV4dF92YWwgPSBwcmV2X3ZhbCArIHN0ZXA7XG4gICAgaWYgKGxlZnQgPT09IDApIHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHZhbCA9IHZhbCA+PSBwcmV2X3ZhbCArIGRpdiA/IG5leHRfdmFsIDogcHJldl92YWw7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byB0aGUgc2xpZGVyIGVsZW1lbnRzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdGhpcy5fZXZlbnRzRm9ySGFuZGxlKHRoaXMuJGhhbmRsZSk7XG4gICAgaWYodGhpcy5oYW5kbGVzWzFdKSB7XG4gICAgICB0aGlzLl9ldmVudHNGb3JIYW5kbGUodGhpcy4kaGFuZGxlMik7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgYSBwYXJ0aWN1bGFyIGhhbmRsZVxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRoYW5kbGUgLSB0aGUgY3VycmVudCBoYW5kbGUgdG8gYXBwbHkgbGlzdGVuZXJzIHRvLlxuICAgKi9cbiAgX2V2ZW50c0ZvckhhbmRsZSgkaGFuZGxlKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgY3VySGFuZGxlLFxuICAgICAgICB0aW1lcjtcblxuICAgICAgdGhpcy5pbnB1dHMub2ZmKCdjaGFuZ2UuemYuc2xpZGVyJykub24oJ2NoYW5nZS56Zi5zbGlkZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBpZHggPSBfdGhpcy5pbnB1dHMuaW5kZXgoJCh0aGlzKSk7XG4gICAgICAgIF90aGlzLl9oYW5kbGVFdmVudChlLCBfdGhpcy5oYW5kbGVzLmVxKGlkeCksICQodGhpcykudmFsKCkpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2xpY2tTZWxlY3QpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ2NsaWNrLnpmLnNsaWRlcicpLm9uKCdjbGljay56Zi5zbGlkZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgaWYgKF90aGlzLiRlbGVtZW50LmRhdGEoJ2RyYWdnaW5nJykpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgICBpZiAoISQoZS50YXJnZXQpLmlzKCdbZGF0YS1zbGlkZXItaGFuZGxlXScpKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy5kb3VibGVTaWRlZCkge1xuICAgICAgICAgICAgICBfdGhpcy5faGFuZGxlRXZlbnQoZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBfdGhpcy5faGFuZGxlRXZlbnQoZSwgX3RoaXMuJGhhbmRsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZHJhZ2dhYmxlKSB7XG4gICAgICB0aGlzLmhhbmRsZXMuYWRkVG91Y2goKTtcblxuICAgICAgdmFyICRib2R5ID0gJCgnYm9keScpO1xuICAgICAgJGhhbmRsZVxuICAgICAgICAub2ZmKCdtb3VzZWRvd24uemYuc2xpZGVyJylcbiAgICAgICAgLm9uKCdtb3VzZWRvd24uemYuc2xpZGVyJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICRoYW5kbGUuYWRkQ2xhc3MoJ2lzLWRyYWdnaW5nJyk7XG4gICAgICAgICAgX3RoaXMuJGZpbGwuYWRkQ2xhc3MoJ2lzLWRyYWdnaW5nJyk7Ly9cbiAgICAgICAgICBfdGhpcy4kZWxlbWVudC5kYXRhKCdkcmFnZ2luZycsIHRydWUpO1xuXG4gICAgICAgICAgY3VySGFuZGxlID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuXG4gICAgICAgICAgJGJvZHkub24oJ21vdXNlbW92ZS56Zi5zbGlkZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBfdGhpcy5faGFuZGxlRXZlbnQoZSwgY3VySGFuZGxlKTtcblxuICAgICAgICAgIH0pLm9uKCdtb3VzZXVwLnpmLnNsaWRlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIF90aGlzLl9oYW5kbGVFdmVudChlLCBjdXJIYW5kbGUpO1xuXG4gICAgICAgICAgICAkaGFuZGxlLnJlbW92ZUNsYXNzKCdpcy1kcmFnZ2luZycpO1xuICAgICAgICAgICAgX3RoaXMuJGZpbGwucmVtb3ZlQ2xhc3MoJ2lzLWRyYWdnaW5nJyk7XG4gICAgICAgICAgICBfdGhpcy4kZWxlbWVudC5kYXRhKCdkcmFnZ2luZycsIGZhbHNlKTtcblxuICAgICAgICAgICAgJGJvZHkub2ZmKCdtb3VzZW1vdmUuemYuc2xpZGVyIG1vdXNldXAuemYuc2xpZGVyJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLy8gcHJldmVudCBldmVudHMgdHJpZ2dlcmVkIGJ5IHRvdWNoXG4gICAgICAub24oJ3NlbGVjdHN0YXJ0LnpmLnNsaWRlciB0b3VjaG1vdmUuemYuc2xpZGVyJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAkaGFuZGxlLm9mZigna2V5ZG93bi56Zi5zbGlkZXInKS5vbigna2V5ZG93bi56Zi5zbGlkZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgXyRoYW5kbGUgPSAkKHRoaXMpLFxuICAgICAgICAgIGlkeCA9IF90aGlzLm9wdGlvbnMuZG91YmxlU2lkZWQgPyBfdGhpcy5oYW5kbGVzLmluZGV4KF8kaGFuZGxlKSA6IDAsXG4gICAgICAgICAgb2xkVmFsdWUgPSBwYXJzZUZsb2F0KF90aGlzLmlucHV0cy5lcShpZHgpLnZhbCgpKSxcbiAgICAgICAgICBuZXdWYWx1ZTtcblxuICAgICAgLy8gaGFuZGxlIGtleWJvYXJkIGV2ZW50IHdpdGgga2V5Ym9hcmQgdXRpbFxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ1NsaWRlcicsIHtcbiAgICAgICAgZGVjcmVhc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIG5ld1ZhbHVlID0gb2xkVmFsdWUgLSBfdGhpcy5vcHRpb25zLnN0ZXA7XG4gICAgICAgIH0sXG4gICAgICAgIGluY3JlYXNlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBuZXdWYWx1ZSA9IG9sZFZhbHVlICsgX3RoaXMub3B0aW9ucy5zdGVwO1xuICAgICAgICB9LFxuICAgICAgICBkZWNyZWFzZV9mYXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBuZXdWYWx1ZSA9IG9sZFZhbHVlIC0gX3RoaXMub3B0aW9ucy5zdGVwICogMTA7XG4gICAgICAgIH0sXG4gICAgICAgIGluY3JlYXNlX2Zhc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIG5ld1ZhbHVlID0gb2xkVmFsdWUgKyBfdGhpcy5vcHRpb25zLnN0ZXAgKiAxMDtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7IC8vIG9ubHkgc2V0IGhhbmRsZSBwb3Mgd2hlbiBldmVudCB3YXMgaGFuZGxlZCBzcGVjaWFsbHlcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgX3RoaXMuX3NldEhhbmRsZVBvcyhfJGhhbmRsZSwgbmV3VmFsdWUsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8qaWYgKG5ld1ZhbHVlKSB7IC8vIGlmIHByZXNzZWQga2V5IGhhcyBzcGVjaWFsIGZ1bmN0aW9uLCB1cGRhdGUgdmFsdWVcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBfdGhpcy5fc2V0SGFuZGxlUG9zKF8kaGFuZGxlLCBuZXdWYWx1ZSk7XG4gICAgICB9Ki9cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgc2xpZGVyIHBsdWdpbi5cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5oYW5kbGVzLm9mZignLnpmLnNsaWRlcicpO1xuICAgIHRoaXMuaW5wdXRzLm9mZignLnpmLnNsaWRlcicpO1xuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYuc2xpZGVyJyk7XG5cbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5TbGlkZXIuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBNaW5pbXVtIHZhbHVlIGZvciB0aGUgc2xpZGVyIHNjYWxlLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDBcbiAgICovXG4gIHN0YXJ0OiAwLFxuICAvKipcbiAgICogTWF4aW11bSB2YWx1ZSBmb3IgdGhlIHNsaWRlciBzY2FsZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxMDBcbiAgICovXG4gIGVuZDogMTAwLFxuICAvKipcbiAgICogTWluaW11bSB2YWx1ZSBjaGFuZ2UgcGVyIGNoYW5nZSBldmVudC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxXG4gICAqL1xuICBzdGVwOiAxLFxuICAvKipcbiAgICogVmFsdWUgYXQgd2hpY2ggdGhlIGhhbmRsZS9pbnB1dCAqKGxlZnQgaGFuZGxlL2ZpcnN0IGlucHV0KSogc2hvdWxkIGJlIHNldCB0byBvbiBpbml0aWFsaXphdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAwXG4gICAqL1xuICBpbml0aWFsU3RhcnQ6IDAsXG4gIC8qKlxuICAgKiBWYWx1ZSBhdCB3aGljaCB0aGUgcmlnaHQgaGFuZGxlL3NlY29uZCBpbnB1dCBzaG91bGQgYmUgc2V0IHRvIG9uIGluaXRpYWxpemF0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDEwMFxuICAgKi9cbiAgaW5pdGlhbEVuZDogMTAwLFxuICAvKipcbiAgICogQWxsb3dzIHRoZSBpbnB1dCB0byBiZSBsb2NhdGVkIG91dHNpZGUgdGhlIGNvbnRhaW5lciBhbmQgdmlzaWJsZS4gU2V0IHRvIGJ5IHRoZSBKU1xuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBiaW5kaW5nOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgdXNlciB0byBjbGljay90YXAgb24gdGhlIHNsaWRlciBiYXIgdG8gc2VsZWN0IGEgdmFsdWUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgY2xpY2tTZWxlY3Q6IHRydWUsXG4gIC8qKlxuICAgKiBTZXQgdG8gdHJ1ZSBhbmQgdXNlIHRoZSBgdmVydGljYWxgIGNsYXNzIHRvIGNoYW5nZSBhbGlnbm1lbnQgdG8gdmVydGljYWwuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIHZlcnRpY2FsOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgdXNlciB0byBkcmFnIHRoZSBzbGlkZXIgaGFuZGxlKHMpIHRvIHNlbGVjdCBhIHZhbHVlLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIHRydWVcbiAgICovXG4gIGRyYWdnYWJsZTogdHJ1ZSxcbiAgLyoqXG4gICAqIERpc2FibGVzIHRoZSBzbGlkZXIgYW5kIHByZXZlbnRzIGV2ZW50IGxpc3RlbmVycyBmcm9tIGJlaW5nIGFwcGxpZWQuIERvdWJsZSBjaGVja2VkIGJ5IEpTIHdpdGggYGRpc2FibGVkQ2xhc3NgLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBkaXNhYmxlZDogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHVzZSBvZiB0d28gaGFuZGxlcy4gRG91YmxlIGNoZWNrZWQgYnkgdGhlIEpTLiBDaGFuZ2VzIHNvbWUgbG9naWMgaGFuZGxpbmcuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGRvdWJsZVNpZGVkOiBmYWxzZSxcbiAgLyoqXG4gICAqIFBvdGVudGlhbCBmdXR1cmUgZmVhdHVyZS5cbiAgICovXG4gIC8vIHN0ZXBzOiAxMDAsXG4gIC8qKlxuICAgKiBOdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdGhlIHBsdWdpbiBzaG91bGQgZ28gdG8gZm9yIGZsb2F0aW5nIHBvaW50IHByZWNpc2lvbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAyXG4gICAqL1xuICBkZWNpbWFsOiAyLFxuICAvKipcbiAgICogVGltZSBkZWxheSBmb3IgZHJhZ2dlZCBlbGVtZW50cy5cbiAgICovXG4gIC8vIGRyYWdEZWxheTogMCxcbiAgLyoqXG4gICAqIFRpbWUsIGluIG1zLCB0byBhbmltYXRlIHRoZSBtb3ZlbWVudCBvZiBhIHNsaWRlciBoYW5kbGUgaWYgdXNlciBjbGlja3MvdGFwcyBvbiB0aGUgYmFyLiBOZWVkcyB0byBiZSBtYW51YWxseSBzZXQgaWYgdXBkYXRpbmcgdGhlIHRyYW5zaXRpb24gdGltZSBpbiB0aGUgU2FzcyBzZXR0aW5ncy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAyMDBcbiAgICovXG4gIG1vdmVUaW1lOiAyMDAsLy91cGRhdGUgdGhpcyBpZiBjaGFuZ2luZyB0aGUgdHJhbnNpdGlvbiB0aW1lIGluIHRoZSBzYXNzXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIGRpc2FibGVkIHNsaWRlcnMuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2Rpc2FibGVkJ1xuICAgKi9cbiAgZGlzYWJsZWRDbGFzczogJ2Rpc2FibGVkJyxcbiAgLyoqXG4gICAqIFdpbGwgaW52ZXJ0IHRoZSBkZWZhdWx0IGxheW91dCBmb3IgYSB2ZXJ0aWNhbDxzcGFuIGRhdGEtdG9vbHRpcCB0aXRsZT1cIndobyB3b3VsZCBkbyB0aGlzPz8/XCI+IDwvc3Bhbj5zbGlkZXIuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGludmVydFZlcnRpY2FsOiBmYWxzZSxcbiAgLyoqXG4gICAqIE1pbGxpc2Vjb25kcyBiZWZvcmUgdGhlIGBjaGFuZ2VkLnpmLXNsaWRlcmAgZXZlbnQgaXMgdHJpZ2dlcmVkIGFmdGVyIHZhbHVlIGNoYW5nZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSA1MDBcbiAgICovXG4gIGNoYW5nZWREZWxheTogNTAwLFxuICAvKipcbiAgKiBCYXNldmFsdWUgZm9yIG5vbi1saW5lYXIgc2xpZGVyc1xuICAqIEBvcHRpb25cbiAgKiBAZXhhbXBsZSA1XG4gICovXG4gIG5vbkxpbmVhckJhc2U6IDUsXG4gIC8qKlxuICAqIEJhc2V2YWx1ZSBmb3Igbm9uLWxpbmVhciBzbGlkZXJzLCBwb3NzaWJsZSB2YWx1ZXMgYXJlOiAnbGluZWFyJywgJ3BvdycgJiAnbG9nJy4gUG93IGFuZCBMb2cgdXNlIHRoZSBub25MaW5lYXJCYXNlIHNldHRpbmcuXG4gICogQG9wdGlvblxuICAqIEBleGFtcGxlICdsaW5lYXInXG4gICovXG4gIHBvc2l0aW9uVmFsdWVGdW5jdGlvbjogJ2xpbmVhcicsXG59O1xuXG5mdW5jdGlvbiBwZXJjZW50KGZyYWMsIG51bSkge1xuICByZXR1cm4gKGZyYWMgLyBudW0pO1xufVxuZnVuY3Rpb24gYWJzUG9zaXRpb24oJGhhbmRsZSwgZGlyLCBjbGlja1BvcywgcGFyYW0pIHtcbiAgcmV0dXJuIE1hdGguYWJzKCgkaGFuZGxlLnBvc2l0aW9uKClbZGlyXSArICgkaGFuZGxlW3BhcmFtXSgpIC8gMikpIC0gY2xpY2tQb3MpO1xufVxuZnVuY3Rpb24gYmFzZUxvZyhiYXNlLCB2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5sb2codmFsdWUpL01hdGgubG9nKGJhc2UpXG59XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihTbGlkZXIsICdTbGlkZXInKTtcblxufShqUXVlcnkpO1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogU3RpY2t5IG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5zdGlja3lcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICovXG5cbmNsYXNzIFN0aWNreSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGEgc3RpY2t5IHRoaW5nLlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2Ugc3RpY2t5LlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIG9wdGlvbnMgb2JqZWN0IHBhc3NlZCB3aGVuIGNyZWF0aW5nIHRoZSBlbGVtZW50IHByb2dyYW1tYXRpY2FsbHkuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFN0aWNreS5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnU3RpY2t5Jyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHN0aWNreSBlbGVtZW50IGJ5IGFkZGluZyBjbGFzc2VzLCBnZXR0aW5nL3NldHRpbmcgZGltZW5zaW9ucywgYnJlYWtwb2ludHMgYW5kIGF0dHJpYnV0ZXNcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgJHBhcmVudCA9IHRoaXMuJGVsZW1lbnQucGFyZW50KCdbZGF0YS1zdGlja3ktY29udGFpbmVyXScpLFxuICAgICAgICBpZCA9IHRoaXMuJGVsZW1lbnRbMF0uaWQgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAnc3RpY2t5JyksXG4gICAgICAgIF90aGlzID0gdGhpcztcblxuICAgIGlmICghJHBhcmVudC5sZW5ndGgpIHtcbiAgICAgIHRoaXMud2FzV3JhcHBlZCA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lciA9ICRwYXJlbnQubGVuZ3RoID8gJHBhcmVudCA6ICQodGhpcy5vcHRpb25zLmNvbnRhaW5lcikud3JhcElubmVyKHRoaXMuJGVsZW1lbnQpO1xuICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY29udGFpbmVyQ2xhc3MpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuc3RpY2t5Q2xhc3MpXG4gICAgICAgICAgICAgICAgIC5hdHRyKHsnZGF0YS1yZXNpemUnOiBpZH0pO1xuXG4gICAgdGhpcy5zY3JvbGxDb3VudCA9IHRoaXMub3B0aW9ucy5jaGVja0V2ZXJ5O1xuICAgIHRoaXMuaXNTdHVjayA9IGZhbHNlO1xuICAgICQod2luZG93KS5vbmUoJ2xvYWQuemYuc3RpY2t5JywgZnVuY3Rpb24oKXtcbiAgICAgIC8vV2UgY2FsY3VsYXRlIHRoZSBjb250YWluZXIgaGVpZ2h0IHRvIGhhdmUgY29ycmVjdCB2YWx1ZXMgZm9yIGFuY2hvciBwb2ludHMgb2Zmc2V0IGNhbGN1bGF0aW9uLlxuICAgICAgX3RoaXMuY29udGFpbmVySGVpZ2h0ID0gX3RoaXMuJGVsZW1lbnQuY3NzKFwiZGlzcGxheVwiKSA9PSBcIm5vbmVcIiA/IDAgOiBfdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICBfdGhpcy4kY29udGFpbmVyLmNzcygnaGVpZ2h0JywgX3RoaXMuY29udGFpbmVySGVpZ2h0KTtcbiAgICAgIF90aGlzLmVsZW1IZWlnaHQgPSBfdGhpcy5jb250YWluZXJIZWlnaHQ7XG4gICAgICBpZihfdGhpcy5vcHRpb25zLmFuY2hvciAhPT0gJycpe1xuICAgICAgICBfdGhpcy4kYW5jaG9yID0gJCgnIycgKyBfdGhpcy5vcHRpb25zLmFuY2hvcik7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgX3RoaXMuX3BhcnNlUG9pbnRzKCk7XG4gICAgICB9XG5cbiAgICAgIF90aGlzLl9zZXRTaXplcyhmdW5jdGlvbigpe1xuICAgICAgICB2YXIgc2Nyb2xsID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgICAgICBfdGhpcy5fY2FsYyhmYWxzZSwgc2Nyb2xsKTtcbiAgICAgICAgLy9VbnN0aWNrIHRoZSBlbGVtZW50IHdpbGwgZW5zdXJlIHRoYXQgcHJvcGVyIGNsYXNzZXMgYXJlIHNldC5cbiAgICAgICAgaWYgKCFfdGhpcy5pc1N0dWNrKSB7XG4gICAgICAgICAgX3RoaXMuX3JlbW92ZVN0aWNreSgoc2Nyb2xsID49IF90aGlzLnRvcFBvaW50KSA/IGZhbHNlIDogdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgX3RoaXMuX2V2ZW50cyhpZC5zcGxpdCgnLScpLnJldmVyc2UoKS5qb2luKCctJykpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHVzaW5nIG11bHRpcGxlIGVsZW1lbnRzIGFzIGFuY2hvcnMsIGNhbGN1bGF0ZXMgdGhlIHRvcCBhbmQgYm90dG9tIHBpeGVsIHZhbHVlcyB0aGUgc3RpY2t5IHRoaW5nIHNob3VsZCBzdGljayBhbmQgdW5zdGljayBvbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcGFyc2VQb2ludHMoKSB7XG4gICAgdmFyIHRvcCA9IHRoaXMub3B0aW9ucy50b3BBbmNob3IgPT0gXCJcIiA/IDEgOiB0aGlzLm9wdGlvbnMudG9wQW5jaG9yLFxuICAgICAgICBidG0gPSB0aGlzLm9wdGlvbnMuYnRtQW5jaG9yPT0gXCJcIiA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQgOiB0aGlzLm9wdGlvbnMuYnRtQW5jaG9yLFxuICAgICAgICBwdHMgPSBbdG9wLCBidG1dLFxuICAgICAgICBicmVha3MgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcHRzLmxlbmd0aDsgaSA8IGxlbiAmJiBwdHNbaV07IGkrKykge1xuICAgICAgdmFyIHB0O1xuICAgICAgaWYgKHR5cGVvZiBwdHNbaV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgIHB0ID0gcHRzW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHBsYWNlID0gcHRzW2ldLnNwbGl0KCc6JyksXG4gICAgICAgICAgICBhbmNob3IgPSAkKGAjJHtwbGFjZVswXX1gKTtcblxuICAgICAgICBwdCA9IGFuY2hvci5vZmZzZXQoKS50b3A7XG4gICAgICAgIGlmIChwbGFjZVsxXSAmJiBwbGFjZVsxXS50b0xvd2VyQ2FzZSgpID09PSAnYm90dG9tJykge1xuICAgICAgICAgIHB0ICs9IGFuY2hvclswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJyZWFrc1tpXSA9IHB0O1xuICAgIH1cblxuXG4gICAgdGhpcy5wb2ludHMgPSBicmVha3M7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIHRoZSBzY3JvbGxpbmcgZWxlbWVudC5cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gcHN1ZWRvLXJhbmRvbSBpZCBmb3IgdW5pcXVlIHNjcm9sbCBldmVudCBsaXN0ZW5lci5cbiAgICovXG4gIF9ldmVudHMoaWQpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICBzY3JvbGxMaXN0ZW5lciA9IHRoaXMuc2Nyb2xsTGlzdGVuZXIgPSBgc2Nyb2xsLnpmLiR7aWR9YDtcbiAgICBpZiAodGhpcy5pc09uKSB7IHJldHVybjsgfVxuICAgIGlmICh0aGlzLmNhblN0aWNrKSB7XG4gICAgICB0aGlzLmlzT24gPSB0cnVlO1xuICAgICAgJCh3aW5kb3cpLm9mZihzY3JvbGxMaXN0ZW5lcilcbiAgICAgICAgICAgICAgIC5vbihzY3JvbGxMaXN0ZW5lciwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICBpZiAoX3RoaXMuc2Nyb2xsQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICBfdGhpcy5zY3JvbGxDb3VudCA9IF90aGlzLm9wdGlvbnMuY2hlY2tFdmVyeTtcbiAgICAgICAgICAgICAgICAgICBfdGhpcy5fc2V0U2l6ZXMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICBfdGhpcy5fY2FsYyhmYWxzZSwgd2luZG93LnBhZ2VZT2Zmc2V0KTtcbiAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICBfdGhpcy5zY3JvbGxDb3VudC0tO1xuICAgICAgICAgICAgICAgICAgIF90aGlzLl9jYWxjKGZhbHNlLCB3aW5kb3cucGFnZVlPZmZzZXQpO1xuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdyZXNpemVtZS56Zi50cmlnZ2VyJylcbiAgICAgICAgICAgICAgICAgLm9uKCdyZXNpemVtZS56Zi50cmlnZ2VyJywgZnVuY3Rpb24oZSwgZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9zZXRTaXplcyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2NhbGMoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMuY2FuU3RpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIV90aGlzLmlzT24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9ldmVudHMoaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChfdGhpcy5pc09uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3BhdXNlTGlzdGVuZXJzKHNjcm9sbExpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBldmVudCBoYW5kbGVycyBmb3Igc2Nyb2xsIGFuZCBjaGFuZ2UgZXZlbnRzIG9uIGFuY2hvci5cbiAgICogQGZpcmVzIFN0aWNreSNwYXVzZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2Nyb2xsTGlzdGVuZXIgLSB1bmlxdWUsIG5hbWVzcGFjZWQgc2Nyb2xsIGxpc3RlbmVyIGF0dGFjaGVkIHRvIGB3aW5kb3dgXG4gICAqL1xuICBfcGF1c2VMaXN0ZW5lcnMoc2Nyb2xsTGlzdGVuZXIpIHtcbiAgICB0aGlzLmlzT24gPSBmYWxzZTtcbiAgICAkKHdpbmRvdykub2ZmKHNjcm9sbExpc3RlbmVyKTtcblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBpcyBwYXVzZWQgZHVlIHRvIHJlc2l6ZSBldmVudCBzaHJpbmtpbmcgdGhlIHZpZXcuXG4gICAgICogQGV2ZW50IFN0aWNreSNwYXVzZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigncGF1c2UuemYuc3RpY2t5Jyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIG9uIGV2ZXJ5IGBzY3JvbGxgIGV2ZW50IGFuZCBvbiBgX2luaXRgXG4gICAqIGZpcmVzIGZ1bmN0aW9ucyBiYXNlZCBvbiBib29sZWFucyBhbmQgY2FjaGVkIHZhbHVlc1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGNoZWNrU2l6ZXMgLSB0cnVlIGlmIHBsdWdpbiBzaG91bGQgcmVjYWxjdWxhdGUgc2l6ZXMgYW5kIGJyZWFrcG9pbnRzLlxuICAgKiBAcGFyYW0ge051bWJlcn0gc2Nyb2xsIC0gY3VycmVudCBzY3JvbGwgcG9zaXRpb24gcGFzc2VkIGZyb20gc2Nyb2xsIGV2ZW50IGNiIGZ1bmN0aW9uLiBJZiBub3QgcGFzc2VkLCBkZWZhdWx0cyB0byBgd2luZG93LnBhZ2VZT2Zmc2V0YC5cbiAgICovXG4gIF9jYWxjKGNoZWNrU2l6ZXMsIHNjcm9sbCkge1xuICAgIGlmIChjaGVja1NpemVzKSB7IHRoaXMuX3NldFNpemVzKCk7IH1cblxuICAgIGlmICghdGhpcy5jYW5TdGljaykge1xuICAgICAgaWYgKHRoaXMuaXNTdHVjaykge1xuICAgICAgICB0aGlzLl9yZW1vdmVTdGlja3kodHJ1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFzY3JvbGwpIHsgc2Nyb2xsID0gd2luZG93LnBhZ2VZT2Zmc2V0OyB9XG5cbiAgICBpZiAoc2Nyb2xsID49IHRoaXMudG9wUG9pbnQpIHtcbiAgICAgIGlmIChzY3JvbGwgPD0gdGhpcy5ib3R0b21Qb2ludCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNTdHVjaykge1xuICAgICAgICAgIHRoaXMuX3NldFN0aWNreSgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5pc1N0dWNrKSB7XG4gICAgICAgICAgdGhpcy5fcmVtb3ZlU3RpY2t5KGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5pc1N0dWNrKSB7XG4gICAgICAgIHRoaXMuX3JlbW92ZVN0aWNreSh0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2F1c2VzIHRoZSAkZWxlbWVudCB0byBiZWNvbWUgc3R1Y2suXG4gICAqIEFkZHMgYHBvc2l0aW9uOiBmaXhlZDtgLCBhbmQgaGVscGVyIGNsYXNzZXMuXG4gICAqIEBmaXJlcyBTdGlja3kjc3R1Y2t0b1xuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRTdGlja3koKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgc3RpY2tUbyA9IHRoaXMub3B0aW9ucy5zdGlja1RvLFxuICAgICAgICBtcmduID0gc3RpY2tUbyA9PT0gJ3RvcCcgPyAnbWFyZ2luVG9wJyA6ICdtYXJnaW5Cb3R0b20nLFxuICAgICAgICBub3RTdHVja1RvID0gc3RpY2tUbyA9PT0gJ3RvcCcgPyAnYm90dG9tJyA6ICd0b3AnLFxuICAgICAgICBjc3MgPSB7fTtcblxuICAgIGNzc1ttcmduXSA9IGAke3RoaXMub3B0aW9uc1ttcmduXX1lbWA7XG4gICAgY3NzW3N0aWNrVG9dID0gMDtcbiAgICBjc3Nbbm90U3R1Y2tUb10gPSAnYXV0byc7XG4gICAgdGhpcy5pc1N0dWNrID0gdHJ1ZTtcbiAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKGBpcy1hbmNob3JlZCBpcy1hdC0ke25vdFN0dWNrVG99YClcbiAgICAgICAgICAgICAgICAgLmFkZENsYXNzKGBpcy1zdHVjayBpcy1hdC0ke3N0aWNrVG99YClcbiAgICAgICAgICAgICAgICAgLmNzcyhjc3MpXG4gICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSAkZWxlbWVudCBoYXMgYmVjb21lIGBwb3NpdGlvbjogZml4ZWQ7YFxuICAgICAgICAgICAgICAgICAgKiBOYW1lc3BhY2VkIHRvIGB0b3BgIG9yIGBib3R0b21gLCBlLmcuIGBzdGlja3kuemYuc3R1Y2t0bzp0b3BgXG4gICAgICAgICAgICAgICAgICAqIEBldmVudCBTdGlja3kjc3R1Y2t0b1xuICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgLnRyaWdnZXIoYHN0aWNreS56Zi5zdHVja3RvOiR7c3RpY2tUb31gKTtcbiAgICB0aGlzLiRlbGVtZW50Lm9uKFwidHJhbnNpdGlvbmVuZCB3ZWJraXRUcmFuc2l0aW9uRW5kIG9UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kIE1TVHJhbnNpdGlvbkVuZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgIF90aGlzLl9zZXRTaXplcygpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENhdXNlcyB0aGUgJGVsZW1lbnQgdG8gYmVjb21lIHVuc3R1Y2suXG4gICAqIFJlbW92ZXMgYHBvc2l0aW9uOiBmaXhlZDtgLCBhbmQgaGVscGVyIGNsYXNzZXMuXG4gICAqIEFkZHMgb3RoZXIgaGVscGVyIGNsYXNzZXMuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNUb3AgLSB0ZWxscyB0aGUgZnVuY3Rpb24gaWYgdGhlICRlbGVtZW50IHNob3VsZCBhbmNob3IgdG8gdGhlIHRvcCBvciBib3R0b20gb2YgaXRzICRhbmNob3IgZWxlbWVudC5cbiAgICogQGZpcmVzIFN0aWNreSN1bnN0dWNrZnJvbVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3JlbW92ZVN0aWNreShpc1RvcCkge1xuICAgIHZhciBzdGlja1RvID0gdGhpcy5vcHRpb25zLnN0aWNrVG8sXG4gICAgICAgIHN0aWNrVG9Ub3AgPSBzdGlja1RvID09PSAndG9wJyxcbiAgICAgICAgY3NzID0ge30sXG4gICAgICAgIGFuY2hvclB0ID0gKHRoaXMucG9pbnRzID8gdGhpcy5wb2ludHNbMV0gLSB0aGlzLnBvaW50c1swXSA6IHRoaXMuYW5jaG9ySGVpZ2h0KSAtIHRoaXMuZWxlbUhlaWdodCxcbiAgICAgICAgbXJnbiA9IHN0aWNrVG9Ub3AgPyAnbWFyZ2luVG9wJyA6ICdtYXJnaW5Cb3R0b20nLFxuICAgICAgICBub3RTdHVja1RvID0gc3RpY2tUb1RvcCA/ICdib3R0b20nIDogJ3RvcCcsXG4gICAgICAgIHRvcE9yQm90dG9tID0gaXNUb3AgPyAndG9wJyA6ICdib3R0b20nO1xuXG4gICAgY3NzW21yZ25dID0gMDtcblxuICAgIGNzc1snYm90dG9tJ10gPSAnYXV0byc7XG4gICAgaWYoaXNUb3ApIHtcbiAgICAgIGNzc1sndG9wJ10gPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBjc3NbJ3RvcCddID0gYW5jaG9yUHQ7XG4gICAgfVxuXG4gICAgdGhpcy5pc1N0dWNrID0gZmFsc2U7XG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhgaXMtc3R1Y2sgaXMtYXQtJHtzdGlja1RvfWApXG4gICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhgaXMtYW5jaG9yZWQgaXMtYXQtJHt0b3BPckJvdHRvbX1gKVxuICAgICAgICAgICAgICAgICAuY3NzKGNzcylcbiAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlICRlbGVtZW50IGhhcyBiZWNvbWUgYW5jaG9yZWQuXG4gICAgICAgICAgICAgICAgICAqIE5hbWVzcGFjZWQgdG8gYHRvcGAgb3IgYGJvdHRvbWAsIGUuZy4gYHN0aWNreS56Zi51bnN0dWNrZnJvbTpib3R0b21gXG4gICAgICAgICAgICAgICAgICAqIEBldmVudCBTdGlja3kjdW5zdHVja2Zyb21cbiAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgIC50cmlnZ2VyKGBzdGlja3kuemYudW5zdHVja2Zyb206JHt0b3BPckJvdHRvbX1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSAkZWxlbWVudCBhbmQgJGNvbnRhaW5lciBzaXplcyBmb3IgcGx1Z2luLlxuICAgKiBDYWxscyBgX3NldEJyZWFrUG9pbnRzYC5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB0byBmaXJlIG9uIGNvbXBsZXRpb24gb2YgYF9zZXRCcmVha1BvaW50c2AuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0U2l6ZXMoY2IpIHtcbiAgICB0aGlzLmNhblN0aWNrID0gRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmlzKHRoaXMub3B0aW9ucy5zdGlja3lPbik7XG4gICAgaWYgKCF0aGlzLmNhblN0aWNrKSB7XG4gICAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7IGNiKCk7IH1cbiAgICB9XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgbmV3RWxlbVdpZHRoID0gdGhpcy4kY29udGFpbmVyWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoLFxuICAgICAgICBjb21wID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy4kY29udGFpbmVyWzBdKSxcbiAgICAgICAgcGRuZ2wgPSBwYXJzZUludChjb21wWydwYWRkaW5nLWxlZnQnXSwgMTApLFxuICAgICAgICBwZG5nciA9IHBhcnNlSW50KGNvbXBbJ3BhZGRpbmctcmlnaHQnXSwgMTApO1xuXG4gICAgaWYgKHRoaXMuJGFuY2hvciAmJiB0aGlzLiRhbmNob3IubGVuZ3RoKSB7XG4gICAgICB0aGlzLmFuY2hvckhlaWdodCA9IHRoaXMuJGFuY2hvclswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BhcnNlUG9pbnRzKCk7XG4gICAgfVxuXG4gICAgdGhpcy4kZWxlbWVudC5jc3Moe1xuICAgICAgJ21heC13aWR0aCc6IGAke25ld0VsZW1XaWR0aCAtIHBkbmdsIC0gcGRuZ3J9cHhgXG4gICAgfSk7XG5cbiAgICB2YXIgbmV3Q29udGFpbmVySGVpZ2h0ID0gdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgfHwgdGhpcy5jb250YWluZXJIZWlnaHQ7XG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuY3NzKFwiZGlzcGxheVwiKSA9PSBcIm5vbmVcIikge1xuICAgICAgbmV3Q29udGFpbmVySGVpZ2h0ID0gMDtcbiAgICB9XG4gICAgdGhpcy5jb250YWluZXJIZWlnaHQgPSBuZXdDb250YWluZXJIZWlnaHQ7XG4gICAgdGhpcy4kY29udGFpbmVyLmNzcyh7XG4gICAgICBoZWlnaHQ6IG5ld0NvbnRhaW5lckhlaWdodFxuICAgIH0pO1xuICAgIHRoaXMuZWxlbUhlaWdodCA9IG5ld0NvbnRhaW5lckhlaWdodDtcblxuICAgIGlmICghdGhpcy5pc1N0dWNrKSB7XG4gICAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtYXQtYm90dG9tJykpIHtcbiAgICAgICAgdmFyIGFuY2hvclB0ID0gKHRoaXMucG9pbnRzID8gdGhpcy5wb2ludHNbMV0gLSB0aGlzLiRjb250YWluZXIub2Zmc2V0KCkudG9wIDogdGhpcy5hbmNob3JIZWlnaHQpIC0gdGhpcy5lbGVtSGVpZ2h0O1xuICAgICAgICB0aGlzLiRlbGVtZW50LmNzcygndG9wJywgYW5jaG9yUHQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3NldEJyZWFrUG9pbnRzKG5ld0NvbnRhaW5lckhlaWdodCwgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7IGNiKCk7IH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB1cHBlciBhbmQgbG93ZXIgYnJlYWtwb2ludHMgZm9yIHRoZSBlbGVtZW50IHRvIGJlY29tZSBzdGlja3kvdW5zdGlja3kuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBlbGVtSGVpZ2h0IC0gcHggdmFsdWUgZm9yIHN0aWNreS4kZWxlbWVudCBoZWlnaHQsIGNhbGN1bGF0ZWQgYnkgYF9zZXRTaXplc2AuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGNvbXBsZXRpb24uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0QnJlYWtQb2ludHMoZWxlbUhlaWdodCwgY2IpIHtcbiAgICBpZiAoIXRoaXMuY2FuU3RpY2spIHtcbiAgICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHsgY2IoKTsgfVxuICAgICAgZWxzZSB7IHJldHVybiBmYWxzZTsgfVxuICAgIH1cbiAgICB2YXIgbVRvcCA9IGVtQ2FsYyh0aGlzLm9wdGlvbnMubWFyZ2luVG9wKSxcbiAgICAgICAgbUJ0bSA9IGVtQ2FsYyh0aGlzLm9wdGlvbnMubWFyZ2luQm90dG9tKSxcbiAgICAgICAgdG9wUG9pbnQgPSB0aGlzLnBvaW50cyA/IHRoaXMucG9pbnRzWzBdIDogdGhpcy4kYW5jaG9yLm9mZnNldCgpLnRvcCxcbiAgICAgICAgYm90dG9tUG9pbnQgPSB0aGlzLnBvaW50cyA/IHRoaXMucG9pbnRzWzFdIDogdG9wUG9pbnQgKyB0aGlzLmFuY2hvckhlaWdodCxcbiAgICAgICAgLy8gdG9wUG9pbnQgPSB0aGlzLiRhbmNob3Iub2Zmc2V0KCkudG9wIHx8IHRoaXMucG9pbnRzWzBdLFxuICAgICAgICAvLyBib3R0b21Qb2ludCA9IHRvcFBvaW50ICsgdGhpcy5hbmNob3JIZWlnaHQgfHwgdGhpcy5wb2ludHNbMV0sXG4gICAgICAgIHdpbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuc3RpY2tUbyA9PT0gJ3RvcCcpIHtcbiAgICAgIHRvcFBvaW50IC09IG1Ub3A7XG4gICAgICBib3R0b21Qb2ludCAtPSAoZWxlbUhlaWdodCArIG1Ub3ApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLnN0aWNrVG8gPT09ICdib3R0b20nKSB7XG4gICAgICB0b3BQb2ludCAtPSAod2luSGVpZ2h0IC0gKGVsZW1IZWlnaHQgKyBtQnRtKSk7XG4gICAgICBib3R0b21Qb2ludCAtPSAod2luSGVpZ2h0IC0gbUJ0bSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vdGhpcyB3b3VsZCBiZSB0aGUgc3RpY2tUbzogYm90aCBvcHRpb24uLi4gdHJpY2t5XG4gICAgfVxuXG4gICAgdGhpcy50b3BQb2ludCA9IHRvcFBvaW50O1xuICAgIHRoaXMuYm90dG9tUG9pbnQgPSBib3R0b21Qb2ludDtcblxuICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHsgY2IoKTsgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBjdXJyZW50IHN0aWNreSBlbGVtZW50LlxuICAgKiBSZXNldHMgdGhlIGVsZW1lbnQgdG8gdGhlIHRvcCBwb3NpdGlvbiBmaXJzdC5cbiAgICogUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnMsIEpTLWFkZGVkIGNzcyBwcm9wZXJ0aWVzIGFuZCBjbGFzc2VzLCBhbmQgdW53cmFwcyB0aGUgJGVsZW1lbnQgaWYgdGhlIEpTIGFkZGVkIHRoZSAkY29udGFpbmVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fcmVtb3ZlU3RpY2t5KHRydWUpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhgJHt0aGlzLm9wdGlvbnMuc3RpY2t5Q2xhc3N9IGlzLWFuY2hvcmVkIGlzLWF0LXRvcGApXG4gICAgICAgICAgICAgICAgIC5jc3Moe1xuICAgICAgICAgICAgICAgICAgIGhlaWdodDogJycsXG4gICAgICAgICAgICAgICAgICAgdG9wOiAnJyxcbiAgICAgICAgICAgICAgICAgICBib3R0b206ICcnLFxuICAgICAgICAgICAgICAgICAgICdtYXgtd2lkdGgnOiAnJ1xuICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAub2ZmKCdyZXNpemVtZS56Zi50cmlnZ2VyJyk7XG4gICAgaWYgKHRoaXMuJGFuY2hvciAmJiB0aGlzLiRhbmNob3IubGVuZ3RoKSB7XG4gICAgICB0aGlzLiRhbmNob3Iub2ZmKCdjaGFuZ2UuemYuc3RpY2t5Jyk7XG4gICAgfVxuICAgICQod2luZG93KS5vZmYodGhpcy5zY3JvbGxMaXN0ZW5lcik7XG5cbiAgICBpZiAodGhpcy53YXNXcmFwcGVkKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnVud3JhcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNvbnRhaW5lckNsYXNzKVxuICAgICAgICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJydcbiAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuU3RpY2t5LmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQ3VzdG9taXphYmxlIGNvbnRhaW5lciB0ZW1wbGF0ZS4gQWRkIHlvdXIgb3duIGNsYXNzZXMgZm9yIHN0eWxpbmcgYW5kIHNpemluZy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnJmx0O2RpdiBkYXRhLXN0aWNreS1jb250YWluZXIgY2xhc3M9XCJzbWFsbC02IGNvbHVtbnNcIiZndDsmbHQ7L2RpdiZndDsnXG4gICAqL1xuICBjb250YWluZXI6ICc8ZGl2IGRhdGEtc3RpY2t5LWNvbnRhaW5lcj48L2Rpdj4nLFxuICAvKipcbiAgICogTG9jYXRpb24gaW4gdGhlIHZpZXcgdGhlIGVsZW1lbnQgc3RpY2tzIHRvLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICd0b3AnXG4gICAqL1xuICBzdGlja1RvOiAndG9wJyxcbiAgLyoqXG4gICAqIElmIGFuY2hvcmVkIHRvIGEgc2luZ2xlIGVsZW1lbnQsIHRoZSBpZCBvZiB0aGF0IGVsZW1lbnQuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2V4YW1wbGVJZCdcbiAgICovXG4gIGFuY2hvcjogJycsXG4gIC8qKlxuICAgKiBJZiB1c2luZyBtb3JlIHRoYW4gb25lIGVsZW1lbnQgYXMgYW5jaG9yIHBvaW50cywgdGhlIGlkIG9mIHRoZSB0b3AgYW5jaG9yLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdleGFtcGxlSWQ6dG9wJ1xuICAgKi9cbiAgdG9wQW5jaG9yOiAnJyxcbiAgLyoqXG4gICAqIElmIHVzaW5nIG1vcmUgdGhhbiBvbmUgZWxlbWVudCBhcyBhbmNob3IgcG9pbnRzLCB0aGUgaWQgb2YgdGhlIGJvdHRvbSBhbmNob3IuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2V4YW1wbGVJZDpib3R0b20nXG4gICAqL1xuICBidG1BbmNob3I6ICcnLFxuICAvKipcbiAgICogTWFyZ2luLCBpbiBgZW1gJ3MgdG8gYXBwbHkgdG8gdGhlIHRvcCBvZiB0aGUgZWxlbWVudCB3aGVuIGl0IGJlY29tZXMgc3RpY2t5LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDFcbiAgICovXG4gIG1hcmdpblRvcDogMSxcbiAgLyoqXG4gICAqIE1hcmdpbiwgaW4gYGVtYCdzIHRvIGFwcGx5IHRvIHRoZSBib3R0b20gb2YgdGhlIGVsZW1lbnQgd2hlbiBpdCBiZWNvbWVzIHN0aWNreS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxXG4gICAqL1xuICBtYXJnaW5Cb3R0b206IDEsXG4gIC8qKlxuICAgKiBCcmVha3BvaW50IHN0cmluZyB0aGF0IGlzIHRoZSBtaW5pbXVtIHNjcmVlbiBzaXplIGFuIGVsZW1lbnQgc2hvdWxkIGJlY29tZSBzdGlja3kuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ21lZGl1bSdcbiAgICovXG4gIHN0aWNreU9uOiAnbWVkaXVtJyxcbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gc3RpY2t5IGVsZW1lbnQsIGFuZCByZW1vdmVkIG9uIGRlc3RydWN0aW9uLiBGb3VuZGF0aW9uIGRlZmF1bHRzIHRvIGBzdGlja3lgLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdzdGlja3knXG4gICAqL1xuICBzdGlja3lDbGFzczogJ3N0aWNreScsXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHN0aWNreSBjb250YWluZXIuIEZvdW5kYXRpb24gZGVmYXVsdHMgdG8gYHN0aWNreS1jb250YWluZXJgLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdzdGlja3ktY29udGFpbmVyJ1xuICAgKi9cbiAgY29udGFpbmVyQ2xhc3M6ICdzdGlja3ktY29udGFpbmVyJyxcbiAgLyoqXG4gICAqIE51bWJlciBvZiBzY3JvbGwgZXZlbnRzIGJldHdlZW4gdGhlIHBsdWdpbidzIHJlY2FsY3VsYXRpbmcgc3RpY2t5IHBvaW50cy4gU2V0dGluZyBpdCB0byBgMGAgd2lsbCBjYXVzZSBpdCB0byByZWNhbGMgZXZlcnkgc2Nyb2xsIGV2ZW50LCBzZXR0aW5nIGl0IHRvIGAtMWAgd2lsbCBwcmV2ZW50IHJlY2FsYyBvbiBzY3JvbGwuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgNTBcbiAgICovXG4gIGNoZWNrRXZlcnk6IC0xXG59O1xuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjYWxjdWxhdGUgZW0gdmFsdWVzXG4gKiBAcGFyYW0gTnVtYmVyIHtlbX0gLSBudW1iZXIgb2YgZW0ncyB0byBjYWxjdWxhdGUgaW50byBwaXhlbHNcbiAqL1xuZnVuY3Rpb24gZW1DYWxjKGVtKSB7XG4gIHJldHVybiBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5LCBudWxsKS5mb250U2l6ZSwgMTApICogZW07XG59XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihTdGlja3ksICdTdGlja3knKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIFRhYnMgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLnRhYnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlciBpZiB0YWJzIGNvbnRhaW4gaW1hZ2VzXG4gKi9cblxuY2xhc3MgVGFicyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRhYnMuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgVGFicyNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gdGFicy5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBUYWJzLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnVGFicycpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ1RhYnMnLCB7XG4gICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnbmV4dCcsXG4gICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cydcbiAgICAgIC8vICdUQUInOiAnbmV4dCcsXG4gICAgICAvLyAnU0hJRlRfVEFCJzogJ3ByZXZpb3VzJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSB0YWJzIGJ5IHNob3dpbmcgYW5kIGZvY3VzaW5nIChpZiBhdXRvRm9jdXM9dHJ1ZSkgdGhlIHByZXNldCBhY3RpdmUgdGFiLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cih7J3JvbGUnOiAndGFibGlzdCd9KTtcbiAgICB0aGlzLiR0YWJUaXRsZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCk7XG4gICAgdGhpcy4kdGFiQ29udGVudCA9ICQoYFtkYXRhLXRhYnMtY29udGVudD1cIiR7dGhpcy4kZWxlbWVudFswXS5pZH1cIl1gKTtcblxuICAgIHRoaXMuJHRhYlRpdGxlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICRsaW5rID0gJGVsZW0uZmluZCgnYScpLFxuICAgICAgICAgIGlzQWN0aXZlID0gJGVsZW0uaGFzQ2xhc3MoYCR7X3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCksXG4gICAgICAgICAgaGFzaCA9ICRsaW5rWzBdLmhhc2guc2xpY2UoMSksXG4gICAgICAgICAgbGlua0lkID0gJGxpbmtbMF0uaWQgPyAkbGlua1swXS5pZCA6IGAke2hhc2h9LWxhYmVsYCxcbiAgICAgICAgICAkdGFiQ29udGVudCA9ICQoYCMke2hhc2h9YCk7XG5cbiAgICAgICRlbGVtLmF0dHIoeydyb2xlJzogJ3ByZXNlbnRhdGlvbid9KTtcblxuICAgICAgJGxpbmsuYXR0cih7XG4gICAgICAgICdyb2xlJzogJ3RhYicsXG4gICAgICAgICdhcmlhLWNvbnRyb2xzJzogaGFzaCxcbiAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBpc0FjdGl2ZSxcbiAgICAgICAgJ2lkJzogbGlua0lkXG4gICAgICB9KTtcblxuICAgICAgJHRhYkNvbnRlbnQuYXR0cih7XG4gICAgICAgICdyb2xlJzogJ3RhYnBhbmVsJyxcbiAgICAgICAgJ2FyaWEtaGlkZGVuJzogIWlzQWN0aXZlLFxuICAgICAgICAnYXJpYS1sYWJlbGxlZGJ5JzogbGlua0lkXG4gICAgICB9KTtcblxuICAgICAgaWYoaXNBY3RpdmUgJiYgX3RoaXMub3B0aW9ucy5hdXRvRm9jdXMpe1xuICAgICAgICAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogJGVsZW0ub2Zmc2V0KCkudG9wIH0sIF90aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2VEZWxheSwgKCkgPT4ge1xuICAgICAgICAgICAgJGxpbmsuZm9jdXMoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vdXNlIGJyb3dzZXIgdG8gb3BlbiBhIHRhYiwgaWYgaXQgZXhpc3RzIGluIHRoaXMgdGFic2V0XG4gICAgICBpZiAoX3RoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgICB2YXIgYW5jaG9yID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICAgIC8vbmVlZCBhIGhhc2ggYW5kIGEgcmVsZXZhbnQgYW5jaG9yIGluIHRoaXMgdGFic2V0XG4gICAgICAgIGlmKGFuY2hvci5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgJGxpbmsgPSAkZWxlbS5maW5kKCdbaHJlZj1cIicrYW5jaG9yKydcIl0nKTtcbiAgICAgICAgICBpZiAoJGxpbmsubGVuZ3RoKSB7XG4gICAgICAgICAgICBfdGhpcy5zZWxlY3RUYWIoJChhbmNob3IpKTtcblxuICAgICAgICAgICAgLy9yb2xsIHVwIGEgbGl0dGxlIHRvIHNob3cgdGhlIHRpdGxlc1xuICAgICAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2UpIHtcbiAgICAgICAgICAgICAgJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9ICRlbGVtLm9mZnNldCgpO1xuICAgICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBvZmZzZXQudG9wIH0sIF90aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2VEZWxheSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB6cGx1Z2luIGhhcyBkZWVwbGlua2VkIGF0IHBhZ2Vsb2FkXG4gICAgICAgICAgICAgICogQGV2ZW50IFRhYnMjZGVlcGxpbmtcbiAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAkZWxlbS50cmlnZ2VyKCdkZWVwbGluay56Zi50YWJzJywgWyRsaW5rLCAkKGFuY2hvcildKTtcbiAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZih0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgIHZhciAkaW1hZ2VzID0gdGhpcy4kdGFiQ29udGVudC5maW5kKCdpbWcnKTtcblxuICAgICAgaWYgKCRpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgIEZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQoJGltYWdlcywgdGhpcy5fc2V0SGVpZ2h0LmJpbmQodGhpcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc2V0SGVpZ2h0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB0aGlzLl9hZGRLZXlIYW5kbGVyKCk7XG4gICAgdGhpcy5fYWRkQ2xpY2tIYW5kbGVyKCk7XG4gICAgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyID0gbnVsbDtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlciA9IHRoaXMuX3NldEhlaWdodC5iaW5kKHRoaXMpO1xuXG4gICAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgY2xpY2sgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRDbGlja0hhbmRsZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5vZmYoJ2NsaWNrLnpmLnRhYnMnKVxuICAgICAgLm9uKCdjbGljay56Zi50YWJzJywgYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCwgZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkKHRoaXMpKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMga2V5Ym9hcmQgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRLZXlIYW5kbGVyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiR0YWJUaXRsZXMub2ZmKCdrZXlkb3duLnpmLnRhYnMnKS5vbigna2V5ZG93bi56Zi50YWJzJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZiAoZS53aGljaCA9PT0gOSkgcmV0dXJuO1xuXG5cbiAgICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICRlbGVtZW50cyA9ICRlbGVtZW50LnBhcmVudCgndWwnKS5jaGlsZHJlbignbGknKSxcbiAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAkbmV4dEVsZW1lbnQ7XG5cbiAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgaWYgKCQodGhpcykuaXMoJGVsZW1lbnQpKSB7XG4gICAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMud3JhcE9uS2V5cykge1xuICAgICAgICAgICAgJHByZXZFbGVtZW50ID0gaSA9PT0gMCA/ICRlbGVtZW50cy5sYXN0KCkgOiAkZWxlbWVudHMuZXEoaS0xKTtcbiAgICAgICAgICAgICRuZXh0RWxlbWVudCA9IGkgPT09ICRlbGVtZW50cy5sZW5ndGggLTEgPyAkZWxlbWVudHMuZmlyc3QoKSA6ICRlbGVtZW50cy5lcShpKzEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5tYXgoMCwgaS0xKSk7XG4gICAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5taW4oaSsxLCAkZWxlbWVudHMubGVuZ3RoLTEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gaGFuZGxlIGtleWJvYXJkIGV2ZW50IHdpdGgga2V5Ym9hcmQgdXRpbFxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ1RhYnMnLCB7XG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRlbGVtZW50LmZpbmQoJ1tyb2xlPVwidGFiXCJdJykuZm9jdXMoKTtcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRlbGVtZW50KTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRwcmV2RWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XG4gICAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkcHJldkVsZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKS5mb2N1cygpO1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJG5leHRFbGVtZW50KTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSB0YWIgYCR0YXJnZXRDb250ZW50YCBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC4gQ29sbGFwc2VzIGFjdGl2ZSB0YWIuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gVGFiIHRvIG9wZW4uXG4gICAqIEBmaXJlcyBUYWJzI2NoYW5nZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9oYW5kbGVUYWJDaGFuZ2UoJHRhcmdldCkge1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgZm9yIGFjdGl2ZSBjbGFzcyBvbiB0YXJnZXQuIENvbGxhcHNlIGlmIGV4aXN0cy5cbiAgICAgKi9cbiAgICBpZiAoJHRhcmdldC5oYXNDbGFzcyhgJHt0aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApKSB7XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5hY3RpdmVDb2xsYXBzZSkge1xuICAgICAgICAgICAgdGhpcy5fY29sbGFwc2VUYWIoJHRhcmdldCk7XG5cbiAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHpwbHVnaW4gaGFzIHN1Y2Nlc3NmdWxseSBjb2xsYXBzZWQgdGFicy5cbiAgICAgICAgICAgICogQGV2ZW50IFRhYnMjY29sbGFwc2VcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NvbGxhcHNlLnpmLnRhYnMnLCBbJHRhcmdldF0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgJG9sZFRhYiA9IHRoaXMuJGVsZW1lbnQuXG4gICAgICAgICAgZmluZChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc30uJHt0aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApLFxuICAgICAgICAgICR0YWJMaW5rID0gJHRhcmdldC5maW5kKCdbcm9sZT1cInRhYlwiXScpLFxuICAgICAgICAgIGhhc2ggPSAkdGFiTGlua1swXS5oYXNoLFxuICAgICAgICAgICR0YXJnZXRDb250ZW50ID0gdGhpcy4kdGFiQ29udGVudC5maW5kKGhhc2gpO1xuXG4gICAgLy9jbG9zZSBvbGQgdGFiXG4gICAgdGhpcy5fY29sbGFwc2VUYWIoJG9sZFRhYik7XG5cbiAgICAvL29wZW4gbmV3IHRhYlxuICAgIHRoaXMuX29wZW5UYWIoJHRhcmdldCk7XG5cbiAgICAvL2VpdGhlciByZXBsYWNlIG9yIHVwZGF0ZSBicm93c2VyIGhpc3RvcnlcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB2YXIgYW5jaG9yID0gJHRhcmdldC5maW5kKCdhJykuYXR0cignaHJlZicpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwZGF0ZUhpc3RvcnkpIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgc3VjY2Vzc2Z1bGx5IGNoYW5nZWQgdGFicy5cbiAgICAgKiBAZXZlbnQgVGFicyNjaGFuZ2VcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NoYW5nZS56Zi50YWJzJywgWyR0YXJnZXQsICR0YXJnZXRDb250ZW50XSk7XG5cbiAgICAvL2ZpcmUgdG8gY2hpbGRyZW4gYSBtdXRhdGlvbiBldmVudFxuICAgICR0YXJnZXRDb250ZW50LmZpbmQoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXIoXCJtdXRhdGVtZS56Zi50cmlnZ2VyXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSB0YWIgYCR0YXJnZXRDb250ZW50YCBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBUYWIgdG8gT3Blbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfb3BlblRhYigkdGFyZ2V0KSB7XG4gICAgICB2YXIgJHRhYkxpbmsgPSAkdGFyZ2V0LmZpbmQoJ1tyb2xlPVwidGFiXCJdJyksXG4gICAgICAgICAgaGFzaCA9ICR0YWJMaW5rWzBdLmhhc2gsXG4gICAgICAgICAgJHRhcmdldENvbnRlbnQgPSB0aGlzLiR0YWJDb250ZW50LmZpbmQoaGFzaCk7XG5cbiAgICAgICR0YXJnZXQuYWRkQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKTtcblxuICAgICAgJHRhYkxpbmsuYXR0cih7J2FyaWEtc2VsZWN0ZWQnOiAndHJ1ZSd9KTtcblxuICAgICAgJHRhcmdldENvbnRlbnRcbiAgICAgICAgLmFkZENsYXNzKGAke3RoaXMub3B0aW9ucy5wYW5lbEFjdGl2ZUNsYXNzfWApXG4gICAgICAgIC5hdHRyKHsnYXJpYS1oaWRkZW4nOiAnZmFsc2UnfSk7XG4gIH1cblxuICAvKipcbiAgICogQ29sbGFwc2VzIGAkdGFyZ2V0Q29udGVudGAgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gVGFiIHRvIE9wZW4uXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgX2NvbGxhcHNlVGFiKCR0YXJnZXQpIHtcbiAgICB2YXIgJHRhcmdldF9hbmNob3IgPSAkdGFyZ2V0XG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKVxuICAgICAgLmZpbmQoJ1tyb2xlPVwidGFiXCJdJylcbiAgICAgIC5hdHRyKHsgJ2FyaWEtc2VsZWN0ZWQnOiAnZmFsc2UnIH0pO1xuXG4gICAgJChgIyR7JHRhcmdldF9hbmNob3IuYXR0cignYXJpYS1jb250cm9scycpfWApXG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7dGhpcy5vcHRpb25zLnBhbmVsQWN0aXZlQ2xhc3N9YClcbiAgICAgIC5hdHRyKHsgJ2FyaWEtaGlkZGVuJzogJ3RydWUnIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFB1YmxpYyBtZXRob2QgZm9yIHNlbGVjdGluZyBhIGNvbnRlbnQgcGFuZSB0byBkaXNwbGF5LlxuICAgKiBAcGFyYW0ge2pRdWVyeSB8IFN0cmluZ30gZWxlbSAtIGpRdWVyeSBvYmplY3Qgb3Igc3RyaW5nIG9mIHRoZSBpZCBvZiB0aGUgcGFuZSB0byBkaXNwbGF5LlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHNlbGVjdFRhYihlbGVtKSB7XG4gICAgdmFyIGlkU3RyO1xuXG4gICAgaWYgKHR5cGVvZiBlbGVtID09PSAnb2JqZWN0Jykge1xuICAgICAgaWRTdHIgPSBlbGVtWzBdLmlkO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZFN0ciA9IGVsZW07XG4gICAgfVxuXG4gICAgaWYgKGlkU3RyLmluZGV4T2YoJyMnKSA8IDApIHtcbiAgICAgIGlkU3RyID0gYCMke2lkU3RyfWA7XG4gICAgfVxuXG4gICAgdmFyICR0YXJnZXQgPSB0aGlzLiR0YWJUaXRsZXMuZmluZChgW2hyZWY9XCIke2lkU3RyfVwiXWApLnBhcmVudChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKTtcblxuICAgIHRoaXMuX2hhbmRsZVRhYkNoYW5nZSgkdGFyZ2V0KTtcbiAgfTtcbiAgLyoqXG4gICAqIFNldHMgdGhlIGhlaWdodCBvZiBlYWNoIHBhbmVsIHRvIHRoZSBoZWlnaHQgb2YgdGhlIHRhbGxlc3QgcGFuZWwuXG4gICAqIElmIGVuYWJsZWQgaW4gb3B0aW9ucywgZ2V0cyBjYWxsZWQgb24gbWVkaWEgcXVlcnkgY2hhbmdlLlxuICAgKiBJZiBsb2FkaW5nIGNvbnRlbnQgdmlhIGV4dGVybmFsIHNvdXJjZSwgY2FuIGJlIGNhbGxlZCBkaXJlY3RseSBvciB3aXRoIF9yZWZsb3cuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3NldEhlaWdodCgpIHtcbiAgICB2YXIgbWF4ID0gMDtcbiAgICB0aGlzLiR0YWJDb250ZW50XG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLnBhbmVsQ2xhc3N9YClcbiAgICAgIC5jc3MoJ2hlaWdodCcsICcnKVxuICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYW5lbCA9ICQodGhpcyksXG4gICAgICAgICAgICBpc0FjdGl2ZSA9IHBhbmVsLmhhc0NsYXNzKGAke3RoaXMub3B0aW9ucy5wYW5lbEFjdGl2ZUNsYXNzfWApO1xuXG4gICAgICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgICAgICBwYW5lbC5jc3Moeyd2aXNpYmlsaXR5JzogJ2hpZGRlbicsICdkaXNwbGF5JzogJ2Jsb2NrJ30pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRlbXAgPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcblxuICAgICAgICBpZiAoIWlzQWN0aXZlKSB7XG4gICAgICAgICAgcGFuZWwuY3NzKHtcbiAgICAgICAgICAgICd2aXNpYmlsaXR5JzogJycsXG4gICAgICAgICAgICAnZGlzcGxheSc6ICcnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBtYXggPSB0ZW1wID4gbWF4ID8gdGVtcCA6IG1heDtcbiAgICAgIH0pXG4gICAgICAuY3NzKCdoZWlnaHQnLCBgJHttYXh9cHhgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBhbiB0YWJzLlxuICAgKiBAZmlyZXMgVGFicyNkZXN0cm95ZWRcbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLmZpbmQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YClcbiAgICAgIC5vZmYoJy56Zi50YWJzJykuaGlkZSgpLmVuZCgpXG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLnBhbmVsQ2xhc3N9YClcbiAgICAgIC5oaWRlKCk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLm1hdGNoSGVpZ2h0KSB7XG4gICAgICBpZiAodGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyICE9IG51bGwpIHtcbiAgICAgICAgICQod2luZG93KS5vZmYoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cblRhYnMuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHdpbmRvdyB0byBzY3JvbGwgdG8gY29udGVudCBvZiBwYW5lIHNwZWNpZmllZCBieSBoYXNoIGFuY2hvclxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBkZWVwTGluazogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFkanVzdCB0aGUgZGVlcCBsaW5rIHNjcm9sbCB0byBtYWtlIHN1cmUgdGhlIHRvcCBvZiB0aGUgdGFiIHBhbmVsIGlzIHZpc2libGVcbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgZGVlcExpbmtTbXVkZ2U6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbmltYXRpb24gdGltZSAobXMpIGZvciB0aGUgZGVlcCBsaW5rIGFkanVzdG1lbnRcbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAzMDBcbiAgICovXG4gIGRlZXBMaW5rU211ZGdlRGVsYXk6IDMwMCxcblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBicm93c2VyIGhpc3Rvcnkgd2l0aCB0aGUgb3BlbiB0YWJcbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgdXBkYXRlSGlzdG9yeTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgd2luZG93IHRvIHNjcm9sbCB0byBjb250ZW50IG9mIGFjdGl2ZSBwYW5lIG9uIGxvYWQgaWYgc2V0IHRvIHRydWUuXG4gICAqIE5vdCByZWNvbW1lbmRlZCBpZiBtb3JlIHRoYW4gb25lIHRhYiBwYW5lbCBwZXIgcGFnZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgYXV0b0ZvY3VzOiBmYWxzZSxcblxuICAvKipcbiAgICogQWxsb3dzIGtleWJvYXJkIGlucHV0IHRvICd3cmFwJyBhcm91bmQgdGhlIHRhYiBsaW5rcy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICB3cmFwT25LZXlzOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHRhYiBjb250ZW50IHBhbmVzIHRvIG1hdGNoIGhlaWdodHMgaWYgc2V0IHRvIHRydWUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIG1hdGNoSGVpZ2h0OiBmYWxzZSxcblxuICAvKipcbiAgICogQWxsb3dzIGFjdGl2ZSB0YWJzIHRvIGNvbGxhcHNlIHdoZW4gY2xpY2tlZC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgYWN0aXZlQ29sbGFwc2U6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIGBsaWAncyBpbiB0YWIgbGluayBsaXN0LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICd0YWJzLXRpdGxlJ1xuICAgKi9cbiAgbGlua0NsYXNzOiAndGFicy10aXRsZScsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGFjdGl2ZSBgbGlgIGluIHRhYiBsaW5rIGxpc3QuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ2lzLWFjdGl2ZSdcbiAgICovXG4gIGxpbmtBY3RpdmVDbGFzczogJ2lzLWFjdGl2ZScsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGNvbnRlbnQgY29udGFpbmVycy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAndGFicy1wYW5lbCdcbiAgICovXG4gIHBhbmVsQ2xhc3M6ICd0YWJzLXBhbmVsJyxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYWN0aXZlIGNvbnRlbnQgY29udGFpbmVyLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdpcy1hY3RpdmUnXG4gICAqL1xuICBwYW5lbEFjdGl2ZUNsYXNzOiAnaXMtYWN0aXZlJ1xufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKFRhYnMsICdUYWJzJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBUb2dnbGVyIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi50b2dnbGVyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICovXG5cbmNsYXNzIFRvZ2dsZXIge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBUb2dnbGVyLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIFRvZ2dsZXIjaW5pdFxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSB0cmlnZ2VyIHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFRvZ2dsZXIuZGVmYXVsdHMsIGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcbiAgICB0aGlzLmNsYXNzTmFtZSA9ICcnO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnVG9nZ2xlcicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBUb2dnbGVyIHBsdWdpbiBieSBwYXJzaW5nIHRoZSB0b2dnbGUgY2xhc3MgZnJvbSBkYXRhLXRvZ2dsZXIsIG9yIGFuaW1hdGlvbiBjbGFzc2VzIGZyb20gZGF0YS1hbmltYXRlLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBpbnB1dDtcbiAgICAvLyBQYXJzZSBhbmltYXRpb24gY2xhc3NlcyBpZiB0aGV5IHdlcmUgc2V0XG4gICAgaWYgKHRoaXMub3B0aW9ucy5hbmltYXRlKSB7XG4gICAgICBpbnB1dCA9IHRoaXMub3B0aW9ucy5hbmltYXRlLnNwbGl0KCcgJyk7XG5cbiAgICAgIHRoaXMuYW5pbWF0aW9uSW4gPSBpbnB1dFswXTtcbiAgICAgIHRoaXMuYW5pbWF0aW9uT3V0ID0gaW5wdXRbMV0gfHwgbnVsbDtcbiAgICB9XG4gICAgLy8gT3RoZXJ3aXNlLCBwYXJzZSB0b2dnbGUgY2xhc3NcbiAgICBlbHNlIHtcbiAgICAgIGlucHV0ID0gdGhpcy4kZWxlbWVudC5kYXRhKCd0b2dnbGVyJyk7XG4gICAgICAvLyBBbGxvdyBmb3IgYSAuIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZ1xuICAgICAgdGhpcy5jbGFzc05hbWUgPSBpbnB1dFswXSA9PT0gJy4nID8gaW5wdXQuc2xpY2UoMSkgOiBpbnB1dDtcbiAgICB9XG5cbiAgICAvLyBBZGQgQVJJQSBhdHRyaWJ1dGVzIHRvIHRyaWdnZXJzXG4gICAgdmFyIGlkID0gdGhpcy4kZWxlbWVudFswXS5pZDtcbiAgICAkKGBbZGF0YS1vcGVuPVwiJHtpZH1cIl0sIFtkYXRhLWNsb3NlPVwiJHtpZH1cIl0sIFtkYXRhLXRvZ2dsZT1cIiR7aWR9XCJdYClcbiAgICAgIC5hdHRyKCdhcmlhLWNvbnRyb2xzJywgaWQpO1xuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgaGlkZGVuLCBhZGQgYXJpYS1oaWRkZW5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0aGlzLiRlbGVtZW50LmlzKCc6aGlkZGVuJykgPyBmYWxzZSA6IHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgdGhlIHRvZ2dsZSB0cmlnZ2VyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJ3RvZ2dsZS56Zi50cmlnZ2VyJykub24oJ3RvZ2dsZS56Zi50cmlnZ2VyJywgdGhpcy50b2dnbGUuYmluZCh0aGlzKSk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgdGFyZ2V0IGNsYXNzIG9uIHRoZSB0YXJnZXQgZWxlbWVudC4gQW4gZXZlbnQgaXMgZmlyZWQgZnJvbSB0aGUgb3JpZ2luYWwgdHJpZ2dlciBkZXBlbmRpbmcgb24gaWYgdGhlIHJlc3VsdGFudCBzdGF0ZSB3YXMgXCJvblwiIG9yIFwib2ZmXCIuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgVG9nZ2xlciNvblxuICAgKiBAZmlyZXMgVG9nZ2xlciNvZmZcbiAgICovXG4gIHRvZ2dsZSgpIHtcbiAgICB0aGlzWyB0aGlzLm9wdGlvbnMuYW5pbWF0ZSA/ICdfdG9nZ2xlQW5pbWF0ZScgOiAnX3RvZ2dsZUNsYXNzJ10oKTtcbiAgfVxuXG4gIF90b2dnbGVDbGFzcygpIHtcbiAgICB0aGlzLiRlbGVtZW50LnRvZ2dsZUNsYXNzKHRoaXMuY2xhc3NOYW1lKTtcblxuICAgIHZhciBpc09uID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcyh0aGlzLmNsYXNzTmFtZSk7XG4gICAgaWYgKGlzT24pIHtcbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgaWYgdGhlIHRhcmdldCBlbGVtZW50IGhhcyB0aGUgY2xhc3MgYWZ0ZXIgYSB0b2dnbGUuXG4gICAgICAgKiBAZXZlbnQgVG9nZ2xlciNvblxuICAgICAgICovXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ29uLnpmLnRvZ2dsZXInKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIGlmIHRoZSB0YXJnZXQgZWxlbWVudCBkb2VzIG5vdCBoYXZlIHRoZSBjbGFzcyBhZnRlciBhIHRvZ2dsZS5cbiAgICAgICAqIEBldmVudCBUb2dnbGVyI29mZlxuICAgICAgICovXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ29mZi56Zi50b2dnbGVyJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlQVJJQShpc09uKTtcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLW11dGF0ZV0nKS50cmlnZ2VyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJyk7XG4gIH1cblxuICBfdG9nZ2xlQW5pbWF0ZSgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaXMoJzpoaWRkZW4nKSkge1xuICAgICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZUluKHRoaXMuJGVsZW1lbnQsIHRoaXMuYW5pbWF0aW9uSW4sIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5fdXBkYXRlQVJJQSh0cnVlKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKCdvbi56Zi50b2dnbGVyJyk7XG4gICAgICAgIHRoaXMuZmluZCgnW2RhdGEtbXV0YXRlXScpLnRyaWdnZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQodGhpcy4kZWxlbWVudCwgdGhpcy5hbmltYXRpb25PdXQsIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5fdXBkYXRlQVJJQShmYWxzZSk7XG4gICAgICAgIHRoaXMudHJpZ2dlcignb2ZmLnpmLnRvZ2dsZXInKTtcbiAgICAgICAgdGhpcy5maW5kKCdbZGF0YS1tdXRhdGVdJykudHJpZ2dlcignbXV0YXRlbWUuemYudHJpZ2dlcicpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZUFSSUEoaXNPbikge1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1leHBhbmRlZCcsIGlzT24gPyB0cnVlIDogZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBpbnN0YW5jZSBvZiBUb2dnbGVyIG9uIHRoZSBlbGVtZW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi50b2dnbGVyJyk7XG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cblRvZ2dsZXIuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBUZWxscyB0aGUgcGx1Z2luIGlmIHRoZSBlbGVtZW50IHNob3VsZCBhbmltYXRlZCB3aGVuIHRvZ2dsZWQuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIGFuaW1hdGU6IGZhbHNlXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oVG9nZ2xlciwgJ1RvZ2dsZXInKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIFRvb2x0aXAgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLnRvb2x0aXBcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuYm94XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAqL1xuXG5jbGFzcyBUb29sdGlwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSBUb29sdGlwLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIFRvb2x0aXAjaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYXR0YWNoIGEgdG9vbHRpcCB0by5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBvYmplY3QgdG8gZXh0ZW5kIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFRvb2x0aXAuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLmlzQ2xpY2sgPSBmYWxzZTtcbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdUb29sdGlwJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHRvb2x0aXAgYnkgc2V0dGluZyB0aGUgY3JlYXRpbmcgdGhlIHRpcCBlbGVtZW50LCBhZGRpbmcgaXQncyB0ZXh0LCBzZXR0aW5nIHByaXZhdGUgdmFyaWFibGVzIGFuZCBzZXR0aW5nIGF0dHJpYnV0ZXMgb24gdGhlIGFuY2hvci5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBlbGVtSWQgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtZGVzY3JpYmVkYnknKSB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICd0b29sdGlwJyk7XG5cbiAgICB0aGlzLm9wdGlvbnMucG9zaXRpb25DbGFzcyA9IHRoaXMub3B0aW9ucy5wb3NpdGlvbkNsYXNzIHx8IHRoaXMuX2dldFBvc2l0aW9uQ2xhc3ModGhpcy4kZWxlbWVudCk7XG4gICAgdGhpcy5vcHRpb25zLnRpcFRleHQgPSB0aGlzLm9wdGlvbnMudGlwVGV4dCB8fCB0aGlzLiRlbGVtZW50LmF0dHIoJ3RpdGxlJyk7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRoaXMub3B0aW9ucy50ZW1wbGF0ZSA/ICQodGhpcy5vcHRpb25zLnRlbXBsYXRlKSA6IHRoaXMuX2J1aWxkVGVtcGxhdGUoZWxlbUlkKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYWxsb3dIdG1sKSB7XG4gICAgICB0aGlzLnRlbXBsYXRlLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpXG4gICAgICAgIC5odG1sKHRoaXMub3B0aW9ucy50aXBUZXh0KVxuICAgICAgICAuaGlkZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRlbXBsYXRlLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpXG4gICAgICAgIC50ZXh0KHRoaXMub3B0aW9ucy50aXBUZXh0KVxuICAgICAgICAuaGlkZSgpO1xuICAgIH1cblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cih7XG4gICAgICAndGl0bGUnOiAnJyxcbiAgICAgICdhcmlhLWRlc2NyaWJlZGJ5JzogZWxlbUlkLFxuICAgICAgJ2RhdGEteWV0aS1ib3gnOiBlbGVtSWQsXG4gICAgICAnZGF0YS10b2dnbGUnOiBlbGVtSWQsXG4gICAgICAnZGF0YS1yZXNpemUnOiBlbGVtSWRcbiAgICB9KS5hZGRDbGFzcyh0aGlzLm9wdGlvbnMudHJpZ2dlckNsYXNzKTtcblxuICAgIC8vaGVscGVyIHZhcmlhYmxlcyB0byB0cmFjayBtb3ZlbWVudCBvbiBjb2xsaXNpb25zXG4gICAgdGhpcy51c2VkUG9zaXRpb25zID0gW107XG4gICAgdGhpcy5jb3VudGVyID0gNDtcbiAgICB0aGlzLmNsYXNzQ2hhbmdlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogR3JhYnMgdGhlIGN1cnJlbnQgcG9zaXRpb25pbmcgY2xhc3MsIGlmIHByZXNlbnQsIGFuZCByZXR1cm5zIHRoZSB2YWx1ZSBvciBhbiBlbXB0eSBzdHJpbmcuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZ2V0UG9zaXRpb25DbGFzcyhlbGVtZW50KSB7XG4gICAgaWYgKCFlbGVtZW50KSB7IHJldHVybiAnJzsgfVxuICAgIC8vIHZhciBwb3NpdGlvbiA9IGVsZW1lbnQuYXR0cignY2xhc3MnKS5tYXRjaCgvdG9wfGxlZnR8cmlnaHQvZyk7XG4gICAgdmFyIHBvc2l0aW9uID0gZWxlbWVudFswXS5jbGFzc05hbWUubWF0Y2goL1xcYih0b3B8bGVmdHxyaWdodClcXGIvZyk7XG4gICAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gPyBwb3NpdGlvblswXSA6ICcnO1xuICAgIHJldHVybiBwb3NpdGlvbjtcbiAgfTtcbiAgLyoqXG4gICAqIGJ1aWxkcyB0aGUgdG9vbHRpcCBlbGVtZW50LCBhZGRzIGF0dHJpYnV0ZXMsIGFuZCByZXR1cm5zIHRoZSB0ZW1wbGF0ZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9idWlsZFRlbXBsYXRlKGlkKSB7XG4gICAgdmFyIHRlbXBsYXRlQ2xhc3NlcyA9IChgJHt0aGlzLm9wdGlvbnMudG9vbHRpcENsYXNzfSAke3RoaXMub3B0aW9ucy5wb3NpdGlvbkNsYXNzfSAke3RoaXMub3B0aW9ucy50ZW1wbGF0ZUNsYXNzZXN9YCkudHJpbSgpO1xuICAgIHZhciAkdGVtcGxhdGUgPSAgJCgnPGRpdj48L2Rpdj4nKS5hZGRDbGFzcyh0ZW1wbGF0ZUNsYXNzZXMpLmF0dHIoe1xuICAgICAgJ3JvbGUnOiAndG9vbHRpcCcsXG4gICAgICAnYXJpYS1oaWRkZW4nOiB0cnVlLFxuICAgICAgJ2RhdGEtaXMtYWN0aXZlJzogZmFsc2UsXG4gICAgICAnZGF0YS1pcy1mb2N1cyc6IGZhbHNlLFxuICAgICAgJ2lkJzogaWRcbiAgICB9KTtcbiAgICByZXR1cm4gJHRlbXBsYXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgaWYgYSBjb2xsaXNpb24gZXZlbnQgaXMgZGV0ZWN0ZWQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwb3NpdGlvbiAtIHBvc2l0aW9uaW5nIGNsYXNzIHRvIHRyeVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3JlcG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICB0aGlzLnVzZWRQb3NpdGlvbnMucHVzaChwb3NpdGlvbiA/IHBvc2l0aW9uIDogJ2JvdHRvbScpO1xuXG4gICAgLy9kZWZhdWx0LCB0cnkgc3dpdGNoaW5nIHRvIG9wcG9zaXRlIHNpZGVcbiAgICBpZiAoIXBvc2l0aW9uICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZigndG9wJykgPCAwKSkge1xuICAgICAgdGhpcy50ZW1wbGF0ZS5hZGRDbGFzcygndG9wJyk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdib3R0b20nKSA8IDApKSB7XG4gICAgICB0aGlzLnRlbXBsYXRlLnJlbW92ZUNsYXNzKHBvc2l0aW9uKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAnbGVmdCcgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdyaWdodCcpIDwgMCkpIHtcbiAgICAgIHRoaXMudGVtcGxhdGUucmVtb3ZlQ2xhc3MocG9zaXRpb24pXG4gICAgICAgICAgLmFkZENsYXNzKCdyaWdodCcpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICdyaWdodCcgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdsZWZ0JykgPCAwKSkge1xuICAgICAgdGhpcy50ZW1wbGF0ZS5yZW1vdmVDbGFzcyhwb3NpdGlvbilcbiAgICAgICAgICAuYWRkQ2xhc3MoJ2xlZnQnKTtcbiAgICB9XG5cbiAgICAvL2lmIGRlZmF1bHQgY2hhbmdlIGRpZG4ndCB3b3JrLCB0cnkgYm90dG9tIG9yIGxlZnQgZmlyc3RcbiAgICBlbHNlIGlmICghcG9zaXRpb24gJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCd0b3AnKSA+IC0xKSAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2xlZnQnKSA8IDApKSB7XG4gICAgICB0aGlzLnRlbXBsYXRlLmFkZENsYXNzKCdsZWZ0Jyk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdib3R0b20nKSA+IC0xKSAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2xlZnQnKSA8IDApKSB7XG4gICAgICB0aGlzLnRlbXBsYXRlLnJlbW92ZUNsYXNzKHBvc2l0aW9uKVxuICAgICAgICAgIC5hZGRDbGFzcygnbGVmdCcpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICdsZWZ0JyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ3JpZ2h0JykgPiAtMSkgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdib3R0b20nKSA8IDApKSB7XG4gICAgICB0aGlzLnRlbXBsYXRlLnJlbW92ZUNsYXNzKHBvc2l0aW9uKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAncmlnaHQnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignbGVmdCcpID4gLTEpICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignYm90dG9tJykgPCAwKSkge1xuICAgICAgdGhpcy50ZW1wbGF0ZS5yZW1vdmVDbGFzcyhwb3NpdGlvbik7XG4gICAgfVxuICAgIC8vaWYgbm90aGluZyBjbGVhcmVkLCBzZXQgdG8gYm90dG9tXG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnRlbXBsYXRlLnJlbW92ZUNsYXNzKHBvc2l0aW9uKTtcbiAgICB9XG4gICAgdGhpcy5jbGFzc0NoYW5nZWQgPSB0cnVlO1xuICAgIHRoaXMuY291bnRlci0tO1xuICB9XG5cbiAgLyoqXG4gICAqIHNldHMgdGhlIHBvc2l0aW9uIGNsYXNzIG9mIGFuIGVsZW1lbnQgYW5kIHJlY3Vyc2l2ZWx5IGNhbGxzIGl0c2VsZiB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBwb3NzaWJsZSBwb3NpdGlvbnMgdG8gYXR0ZW1wdCwgb3IgdGhlIHRvb2x0aXAgZWxlbWVudCBpcyBubyBsb25nZXIgY29sbGlkaW5nLlxuICAgKiBpZiB0aGUgdG9vbHRpcCBpcyBsYXJnZXIgdGhhbiB0aGUgc2NyZWVuIHdpZHRoLCBkZWZhdWx0IHRvIGZ1bGwgd2lkdGggLSBhbnkgdXNlciBzZWxlY3RlZCBtYXJnaW5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRQb3NpdGlvbigpIHtcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLl9nZXRQb3NpdGlvbkNsYXNzKHRoaXMudGVtcGxhdGUpLFxuICAgICAgICAkdGlwRGltcyA9IEZvdW5kYXRpb24uQm94LkdldERpbWVuc2lvbnModGhpcy50ZW1wbGF0ZSksXG4gICAgICAgICRhbmNob3JEaW1zID0gRm91bmRhdGlvbi5Cb3guR2V0RGltZW5zaW9ucyh0aGlzLiRlbGVtZW50KSxcbiAgICAgICAgZGlyZWN0aW9uID0gKHBvc2l0aW9uID09PSAnbGVmdCcgPyAnbGVmdCcgOiAoKHBvc2l0aW9uID09PSAncmlnaHQnKSA/ICdsZWZ0JyA6ICd0b3AnKSksXG4gICAgICAgIHBhcmFtID0gKGRpcmVjdGlvbiA9PT0gJ3RvcCcpID8gJ2hlaWdodCcgOiAnd2lkdGgnLFxuICAgICAgICBvZmZzZXQgPSAocGFyYW0gPT09ICdoZWlnaHQnKSA/IHRoaXMub3B0aW9ucy52T2Zmc2V0IDogdGhpcy5vcHRpb25zLmhPZmZzZXQsXG4gICAgICAgIF90aGlzID0gdGhpcztcblxuICAgIGlmICgoJHRpcERpbXMud2lkdGggPj0gJHRpcERpbXMud2luZG93RGltcy53aWR0aCkgfHwgKCF0aGlzLmNvdW50ZXIgJiYgIUZvdW5kYXRpb24uQm94LkltTm90VG91Y2hpbmdZb3UodGhpcy50ZW1wbGF0ZSkpKSB7XG4gICAgICB0aGlzLnRlbXBsYXRlLm9mZnNldChGb3VuZGF0aW9uLkJveC5HZXRPZmZzZXRzKHRoaXMudGVtcGxhdGUsIHRoaXMuJGVsZW1lbnQsICdjZW50ZXIgYm90dG9tJywgdGhpcy5vcHRpb25zLnZPZmZzZXQsIHRoaXMub3B0aW9ucy5oT2Zmc2V0LCB0cnVlKSkuY3NzKHtcbiAgICAgIC8vIHRoaXMuJGVsZW1lbnQub2Zmc2V0KEZvdW5kYXRpb24uR2V0T2Zmc2V0cyh0aGlzLnRlbXBsYXRlLCB0aGlzLiRlbGVtZW50LCAnY2VudGVyIGJvdHRvbScsIHRoaXMub3B0aW9ucy52T2Zmc2V0LCB0aGlzLm9wdGlvbnMuaE9mZnNldCwgdHJ1ZSkpLmNzcyh7XG4gICAgICAgICd3aWR0aCc6ICRhbmNob3JEaW1zLndpbmRvd0RpbXMud2lkdGggLSAodGhpcy5vcHRpb25zLmhPZmZzZXQgKiAyKSxcbiAgICAgICAgJ2hlaWdodCc6ICdhdXRvJ1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy50ZW1wbGF0ZS5vZmZzZXQoRm91bmRhdGlvbi5Cb3guR2V0T2Zmc2V0cyh0aGlzLnRlbXBsYXRlLCB0aGlzLiRlbGVtZW50LCdjZW50ZXIgJyArIChwb3NpdGlvbiB8fCAnYm90dG9tJyksIHRoaXMub3B0aW9ucy52T2Zmc2V0LCB0aGlzLm9wdGlvbnMuaE9mZnNldCkpO1xuXG4gICAgd2hpbGUoIUZvdW5kYXRpb24uQm94LkltTm90VG91Y2hpbmdZb3UodGhpcy50ZW1wbGF0ZSkgJiYgdGhpcy5jb3VudGVyKSB7XG4gICAgICB0aGlzLl9yZXBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgICAgIHRoaXMuX3NldFBvc2l0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHJldmVhbHMgdGhlIHRvb2x0aXAsIGFuZCBmaXJlcyBhbiBldmVudCB0byBjbG9zZSBhbnkgb3RoZXIgb3BlbiB0b29sdGlwcyBvbiB0aGUgcGFnZVxuICAgKiBAZmlyZXMgVG9vbHRpcCNjbG9zZW1lXG4gICAqIEBmaXJlcyBUb29sdGlwI3Nob3dcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBzaG93KCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd09uICE9PSAnYWxsJyAmJiAhRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmlzKHRoaXMub3B0aW9ucy5zaG93T24pKSB7XG4gICAgICAvLyBjb25zb2xlLmVycm9yKCdUaGUgc2NyZWVuIGlzIHRvbyBzbWFsbCB0byBkaXNwbGF5IHRoaXMgdG9vbHRpcCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy50ZW1wbGF0ZS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJykuc2hvdygpO1xuICAgIHRoaXMuX3NldFBvc2l0aW9uKCk7XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB0byBjbG9zZSBhbGwgb3RoZXIgb3BlbiB0b29sdGlwcyBvbiB0aGUgcGFnZVxuICAgICAqIEBldmVudCBDbG9zZW1lI3Rvb2x0aXBcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Nsb3NlbWUuemYudG9vbHRpcCcsIHRoaXMudGVtcGxhdGUuYXR0cignaWQnKSk7XG5cblxuICAgIHRoaXMudGVtcGxhdGUuYXR0cih7XG4gICAgICAnZGF0YS1pcy1hY3RpdmUnOiB0cnVlLFxuICAgICAgJ2FyaWEtaGlkZGVuJzogZmFsc2VcbiAgICB9KTtcbiAgICBfdGhpcy5pc0FjdGl2ZSA9IHRydWU7XG4gICAgLy8gY29uc29sZS5sb2codGhpcy50ZW1wbGF0ZSk7XG4gICAgdGhpcy50ZW1wbGF0ZS5zdG9wKCkuaGlkZSgpLmNzcygndmlzaWJpbGl0eScsICcnKS5mYWRlSW4odGhpcy5vcHRpb25zLmZhZGVJbkR1cmF0aW9uLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vbWF5YmUgZG8gc3R1ZmY/XG4gICAgfSk7XG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgdG9vbHRpcCBpcyBzaG93blxuICAgICAqIEBldmVudCBUb29sdGlwI3Nob3dcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3Nob3cuemYudG9vbHRpcCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGVzIHRoZSBjdXJyZW50IHRvb2x0aXAsIGFuZCByZXNldHMgdGhlIHBvc2l0aW9uaW5nIGNsYXNzIGlmIGl0IHdhcyBjaGFuZ2VkIGR1ZSB0byBjb2xsaXNpb25cbiAgICogQGZpcmVzIFRvb2x0aXAjaGlkZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGhpZGUoKSB7XG4gICAgLy8gY29uc29sZS5sb2coJ2hpZGluZycsIHRoaXMuJGVsZW1lbnQuZGF0YSgneWV0aS1ib3gnKSk7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLnRlbXBsYXRlLnN0b3AoKS5hdHRyKHtcbiAgICAgICdhcmlhLWhpZGRlbic6IHRydWUsXG4gICAgICAnZGF0YS1pcy1hY3RpdmUnOiBmYWxzZVxuICAgIH0pLmZhZGVPdXQodGhpcy5vcHRpb25zLmZhZGVPdXREdXJhdGlvbiwgZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgX3RoaXMuaXNDbGljayA9IGZhbHNlO1xuICAgICAgaWYgKF90aGlzLmNsYXNzQ2hhbmdlZCkge1xuICAgICAgICBfdGhpcy50ZW1wbGF0ZVxuICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhfdGhpcy5fZ2V0UG9zaXRpb25DbGFzcyhfdGhpcy50ZW1wbGF0ZSkpXG4gICAgICAgICAgICAgLmFkZENsYXNzKF90aGlzLm9wdGlvbnMucG9zaXRpb25DbGFzcyk7XG5cbiAgICAgICBfdGhpcy51c2VkUG9zaXRpb25zID0gW107XG4gICAgICAgX3RoaXMuY291bnRlciA9IDQ7XG4gICAgICAgX3RoaXMuY2xhc3NDaGFuZ2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gICAgLyoqXG4gICAgICogZmlyZXMgd2hlbiB0aGUgdG9vbHRpcCBpcyBoaWRkZW5cbiAgICAgKiBAZXZlbnQgVG9vbHRpcCNoaWRlXG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdoaWRlLnpmLnRvb2x0aXAnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBhZGRzIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIHRvb2x0aXAgYW5kIGl0cyBhbmNob3JcbiAgICogVE9ETyBjb21iaW5lIHNvbWUgb2YgdGhlIGxpc3RlbmVycyBsaWtlIGZvY3VzIGFuZCBtb3VzZWVudGVyLCBldGMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdmFyICR0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7XG4gICAgdmFyIGlzRm9jdXMgPSBmYWxzZTtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLmRpc2FibGVIb3Zlcikge1xuXG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAub24oJ21vdXNlZW50ZXIuemYudG9vbHRpcCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKCFfdGhpcy5pc0FjdGl2ZSkge1xuICAgICAgICAgIF90aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMuc2hvdygpO1xuICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuaG92ZXJEZWxheSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNlbGVhdmUuemYudG9vbHRpcCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KF90aGlzLnRpbWVvdXQpO1xuICAgICAgICBpZiAoIWlzRm9jdXMgfHwgKF90aGlzLmlzQ2xpY2sgJiYgIV90aGlzLm9wdGlvbnMuY2xpY2tPcGVuKSkge1xuICAgICAgICAgIF90aGlzLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbGlja09wZW4pIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ21vdXNlZG93bi56Zi50b29sdGlwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICBpZiAoX3RoaXMuaXNDbGljaykge1xuICAgICAgICAgIC8vX3RoaXMuaGlkZSgpO1xuICAgICAgICAgIC8vIF90aGlzLmlzQ2xpY2sgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfdGhpcy5pc0NsaWNrID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoKF90aGlzLm9wdGlvbnMuZGlzYWJsZUhvdmVyIHx8ICFfdGhpcy4kZWxlbWVudC5hdHRyKCd0YWJpbmRleCcpKSAmJiAhX3RoaXMuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgIF90aGlzLnNob3coKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdtb3VzZWRvd24uemYudG9vbHRpcCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgX3RoaXMuaXNDbGljayA9IHRydWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXNhYmxlRm9yVG91Y2gpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5vbigndGFwLnpmLnRvb2x0aXAgdG91Y2hlbmQuemYudG9vbHRpcCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgX3RoaXMuaXNBY3RpdmUgPyBfdGhpcy5oaWRlKCkgOiBfdGhpcy5zaG93KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLiRlbGVtZW50Lm9uKHtcbiAgICAgIC8vICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcyksXG4gICAgICAvLyAnY2xvc2UuemYudHJpZ2dlcic6IHRoaXMuaGlkZS5iaW5kKHRoaXMpXG4gICAgICAnY2xvc2UuemYudHJpZ2dlcic6IHRoaXMuaGlkZS5iaW5kKHRoaXMpXG4gICAgfSk7XG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAub24oJ2ZvY3VzLnpmLnRvb2x0aXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlzRm9jdXMgPSB0cnVlO1xuICAgICAgICBpZiAoX3RoaXMuaXNDbGljaykge1xuICAgICAgICAgIC8vIElmIHdlJ3JlIG5vdCBzaG93aW5nIG9wZW4gb24gY2xpY2tzLCB3ZSBuZWVkIHRvIHByZXRlbmQgYSBjbGljay1sYXVuY2hlZCBmb2N1cyBpc24ndFxuICAgICAgICAgIC8vIGEgcmVhbCBmb2N1cywgb3RoZXJ3aXNlIG9uIGhvdmVyIGFuZCBjb21lIGJhY2sgd2UgZ2V0IGJhZCBiZWhhdmlvclxuICAgICAgICAgIGlmKCFfdGhpcy5vcHRpb25zLmNsaWNrT3BlbikgeyBpc0ZvY3VzID0gZmFsc2U7IH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3RoaXMuc2hvdygpO1xuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAub24oJ2ZvY3Vzb3V0LnpmLnRvb2x0aXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlzRm9jdXMgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMuaXNDbGljayA9IGZhbHNlO1xuICAgICAgICBfdGhpcy5oaWRlKCk7XG4gICAgICB9KVxuXG4gICAgICAub24oJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKF90aGlzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgX3RoaXMuX3NldFBvc2l0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGFkZHMgYSB0b2dnbGUgbWV0aG9kLCBpbiBhZGRpdGlvbiB0byB0aGUgc3RhdGljIHNob3coKSAmIGhpZGUoKSBmdW5jdGlvbnNcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMuaXNBY3RpdmUpIHtcbiAgICAgIHRoaXMuaGlkZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNob3coKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgdG9vbHRpcCwgcmVtb3ZlcyB0ZW1wbGF0ZSBlbGVtZW50IGZyb20gdGhlIHZpZXcuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3RpdGxlJywgdGhpcy50ZW1wbGF0ZS50ZXh0KCkpXG4gICAgICAgICAgICAgICAgIC5vZmYoJy56Zi50cmlnZ2VyIC56Zi50b29sdGlwJylcbiAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdoYXMtdGlwIHRvcCByaWdodCBsZWZ0JylcbiAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtZGVzY3JpYmVkYnkgYXJpYS1oYXNwb3B1cCBkYXRhLWRpc2FibGUtaG92ZXIgZGF0YS1yZXNpemUgZGF0YS10b2dnbGUgZGF0YS10b29sdGlwIGRhdGEteWV0aS1ib3gnKTtcblxuICAgIHRoaXMudGVtcGxhdGUucmVtb3ZlKCk7XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuVG9vbHRpcC5kZWZhdWx0cyA9IHtcbiAgZGlzYWJsZUZvclRvdWNoOiBmYWxzZSxcbiAgLyoqXG4gICAqIFRpbWUsIGluIG1zLCBiZWZvcmUgYSB0b29sdGlwIHNob3VsZCBvcGVuIG9uIGhvdmVyLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDIwMFxuICAgKi9cbiAgaG92ZXJEZWxheTogMjAwLFxuICAvKipcbiAgICogVGltZSwgaW4gbXMsIGEgdG9vbHRpcCBzaG91bGQgdGFrZSB0byBmYWRlIGludG8gdmlldy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxNTBcbiAgICovXG4gIGZhZGVJbkR1cmF0aW9uOiAxNTAsXG4gIC8qKlxuICAgKiBUaW1lLCBpbiBtcywgYSB0b29sdGlwIHNob3VsZCB0YWtlIHRvIGZhZGUgb3V0IG9mIHZpZXcuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgMTUwXG4gICAqL1xuICBmYWRlT3V0RHVyYXRpb246IDE1MCxcbiAgLyoqXG4gICAqIERpc2FibGVzIGhvdmVyIGV2ZW50cyBmcm9tIG9wZW5pbmcgdGhlIHRvb2x0aXAgaWYgc2V0IHRvIHRydWVcbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgZGlzYWJsZUhvdmVyOiBmYWxzZSxcbiAgLyoqXG4gICAqIE9wdGlvbmFsIGFkZHRpb25hbCBjbGFzc2VzIHRvIGFwcGx5IHRvIHRoZSB0b29sdGlwIHRlbXBsYXRlIG9uIGluaXQuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ215LWNvb2wtdGlwLWNsYXNzJ1xuICAgKi9cbiAgdGVtcGxhdGVDbGFzc2VzOiAnJyxcbiAgLyoqXG4gICAqIE5vbi1vcHRpb25hbCBjbGFzcyBhZGRlZCB0byB0b29sdGlwIHRlbXBsYXRlcy4gRm91bmRhdGlvbiBkZWZhdWx0IGlzICd0b29sdGlwJy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAndG9vbHRpcCdcbiAgICovXG4gIHRvb2x0aXBDbGFzczogJ3Rvb2x0aXAnLFxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgdG9vbHRpcCBhbmNob3IgZWxlbWVudC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnaGFzLXRpcCdcbiAgICovXG4gIHRyaWdnZXJDbGFzczogJ2hhcy10aXAnLFxuICAvKipcbiAgICogTWluaW11bSBicmVha3BvaW50IHNpemUgYXQgd2hpY2ggdG8gb3BlbiB0aGUgdG9vbHRpcC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnc21hbGwnXG4gICAqL1xuICBzaG93T246ICdzbWFsbCcsXG4gIC8qKlxuICAgKiBDdXN0b20gdGVtcGxhdGUgdG8gYmUgdXNlZCB0byBnZW5lcmF0ZSBtYXJrdXAgZm9yIHRvb2x0aXAuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJyZsdDtkaXYgY2xhc3M9XCJ0b29sdGlwXCImZ3Q7Jmx0Oy9kaXYmZ3Q7J1xuICAgKi9cbiAgdGVtcGxhdGU6ICcnLFxuICAvKipcbiAgICogVGV4dCBkaXNwbGF5ZWQgaW4gdGhlIHRvb2x0aXAgdGVtcGxhdGUgb24gb3Blbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnU29tZSBjb29sIHNwYWNlIGZhY3QgaGVyZS4nXG4gICAqL1xuICB0aXBUZXh0OiAnJyxcbiAgdG91Y2hDbG9zZVRleHQ6ICdUYXAgdG8gY2xvc2UuJyxcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgdG9vbHRpcCB0byByZW1haW4gb3BlbiBpZiB0cmlnZ2VyZWQgd2l0aCBhIGNsaWNrIG9yIHRvdWNoIGV2ZW50LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIHRydWVcbiAgICovXG4gIGNsaWNrT3BlbjogdHJ1ZSxcbiAgLyoqXG4gICAqIEFkZGl0aW9uYWwgcG9zaXRpb25pbmcgY2xhc3Nlcywgc2V0IGJ5IHRoZSBKU1xuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICd0b3AnXG4gICAqL1xuICBwb3NpdGlvbkNsYXNzOiAnJyxcbiAgLyoqXG4gICAqIERpc3RhbmNlLCBpbiBwaXhlbHMsIHRoZSB0ZW1wbGF0ZSBzaG91bGQgcHVzaCBhd2F5IGZyb20gdGhlIGFuY2hvciBvbiB0aGUgWSBheGlzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDEwXG4gICAqL1xuICB2T2Zmc2V0OiAxMCxcbiAgLyoqXG4gICAqIERpc3RhbmNlLCBpbiBwaXhlbHMsIHRoZSB0ZW1wbGF0ZSBzaG91bGQgcHVzaCBhd2F5IGZyb20gdGhlIGFuY2hvciBvbiB0aGUgWCBheGlzLCBpZiBhbGlnbmVkIHRvIGEgc2lkZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxMlxuICAgKi9cbiAgaE9mZnNldDogMTIsXG4gICAgLyoqXG4gICAqIEFsbG93IEhUTUwgaW4gdG9vbHRpcC4gV2FybmluZzogSWYgeW91IGFyZSBsb2FkaW5nIHVzZXItZ2VuZXJhdGVkIGNvbnRlbnQgaW50byB0b29sdGlwcyxcbiAgICogYWxsb3dpbmcgSFRNTCBtYXkgb3BlbiB5b3Vyc2VsZiB1cCB0byBYU1MgYXR0YWNrcy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgYWxsb3dIdG1sOiBmYWxzZVxufTtcblxuLyoqXG4gKiBUT0RPIHV0aWxpemUgcmVzaXplIGV2ZW50IHRyaWdnZXJcbiAqL1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oVG9vbHRpcCwgJ1Rvb2x0aXAnKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIFJlc3BvbnNpdmVBY2NvcmRpb25UYWJzIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5yZXNwb25zaXZlQWNjb3JkaW9uVGFic1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24uYWNjb3JkaW9uXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi50YWJzXG4gKi9cblxuY2xhc3MgUmVzcG9uc2l2ZUFjY29yZGlvblRhYnMge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIHJlc3BvbnNpdmUgYWNjb3JkaW9uIHRhYnMuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgUmVzcG9uc2l2ZUFjY29yZGlvblRhYnMjaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgZHJvcGRvd24gbWVudS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgIHRoaXMub3B0aW9ucyAgPSAkLmV4dGVuZCh7fSwgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgIHRoaXMucnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ3Jlc3BvbnNpdmUtYWNjb3JkaW9uLXRhYnMnKTtcbiAgICB0aGlzLmN1cnJlbnRNcSA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50UGx1Z2luID0gbnVsbDtcbiAgICBpZiAoIXRoaXMuJGVsZW1lbnQuYXR0cignaWQnKSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcsRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAncmVzcG9uc2l2ZWFjY29yZGlvbnRhYnMnKSk7XG4gICAgfTtcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1Jlc3BvbnNpdmVBY2NvcmRpb25UYWJzJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIE1lbnUgYnkgcGFyc2luZyB0aGUgY2xhc3NlcyBmcm9tIHRoZSAnZGF0YS1yZXNwb25zaXZlLWFjY29yZGlvbi10YWJzJyBhdHRyaWJ1dGUgb24gdGhlIGVsZW1lbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgLy8gVGhlIGZpcnN0IHRpbWUgYW4gSW50ZXJjaGFuZ2UgcGx1Z2luIGlzIGluaXRpYWxpemVkLCB0aGlzLnJ1bGVzIGlzIGNvbnZlcnRlZCBmcm9tIGEgc3RyaW5nIG9mIFwiY2xhc3Nlc1wiIHRvIGFuIG9iamVjdCBvZiBydWxlc1xuICAgIGlmICh0eXBlb2YgdGhpcy5ydWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGxldCBydWxlc1RyZWUgPSB7fTtcblxuICAgICAgLy8gUGFyc2UgcnVsZXMgZnJvbSBcImNsYXNzZXNcIiBwdWxsZWQgZnJvbSBkYXRhIGF0dHJpYnV0ZVxuICAgICAgbGV0IHJ1bGVzID0gdGhpcy5ydWxlcy5zcGxpdCgnICcpO1xuXG4gICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZXZlcnkgcnVsZSBmb3VuZFxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcnVsZSA9IHJ1bGVzW2ldLnNwbGl0KCctJyk7XG4gICAgICAgIGxldCBydWxlU2l6ZSA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMF0gOiAnc21hbGwnO1xuICAgICAgICBsZXQgcnVsZVBsdWdpbiA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMV0gOiBydWxlWzBdO1xuXG4gICAgICAgIGlmIChNZW51UGx1Z2luc1tydWxlUGx1Z2luXSAhPT0gbnVsbCkge1xuICAgICAgICAgIHJ1bGVzVHJlZVtydWxlU2l6ZV0gPSBNZW51UGx1Z2luc1tydWxlUGx1Z2luXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnJ1bGVzID0gcnVsZXNUcmVlO1xuICAgIH1cblxuICAgIHRoaXMuX2dldEFsbE9wdGlvbnMoKTtcblxuICAgIGlmICghJC5pc0VtcHR5T2JqZWN0KHRoaXMucnVsZXMpKSB7XG4gICAgICB0aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRBbGxPcHRpb25zKCkge1xuICAgIC8vZ2V0IGFsbCBkZWZhdWx0cyBhbmQgb3B0aW9uc1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgX3RoaXMuYWxsT3B0aW9ucyA9IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBNZW51UGx1Z2lucykge1xuICAgICAgaWYgKE1lbnVQbHVnaW5zLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgdmFyIG9iaiA9IE1lbnVQbHVnaW5zW2tleV07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIGR1bW15UGx1Z2luID0gJCgnPHVsPjwvdWw+Jyk7XG4gICAgICAgICAgdmFyIHRtcFBsdWdpbiA9IG5ldyBvYmoucGx1Z2luKGR1bW15UGx1Z2luLF90aGlzLm9wdGlvbnMpO1xuICAgICAgICAgIGZvciAodmFyIGtleUtleSBpbiB0bXBQbHVnaW4ub3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKHRtcFBsdWdpbi5vcHRpb25zLmhhc093blByb3BlcnR5KGtleUtleSkgJiYga2V5S2V5ICE9PSAnemZQbHVnaW4nKSB7XG4gICAgICAgICAgICAgIHZhciBvYmpPYmogPSB0bXBQbHVnaW4ub3B0aW9uc1trZXlLZXldO1xuICAgICAgICAgICAgICBfdGhpcy5hbGxPcHRpb25zW2tleUtleV0gPSBvYmpPYmo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRtcFBsdWdpbi5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgdGhlIE1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbigpIHtcbiAgICAgIF90aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGUgY3VycmVudCBzY3JlZW4gd2lkdGggYWdhaW5zdCBhdmFpbGFibGUgbWVkaWEgcXVlcmllcy4gSWYgdGhlIG1lZGlhIHF1ZXJ5IGhhcyBjaGFuZ2VkLCBhbmQgdGhlIHBsdWdpbiBuZWVkZWQgaGFzIGNoYW5nZWQsIHRoZSBwbHVnaW5zIHdpbGwgc3dhcCBvdXQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2NoZWNrTWVkaWFRdWVyaWVzKCkge1xuICAgIHZhciBtYXRjaGVkTXEsIF90aGlzID0gdGhpcztcbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBydWxlIGFuZCBmaW5kIHRoZSBsYXN0IG1hdGNoaW5nIHJ1bGVcbiAgICAkLmVhY2godGhpcy5ydWxlcywgZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3Qoa2V5KSkge1xuICAgICAgICBtYXRjaGVkTXEgPSBrZXk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBObyBtYXRjaD8gTm8gZGljZVxuICAgIGlmICghbWF0Y2hlZE1xKSByZXR1cm47XG5cbiAgICAvLyBQbHVnaW4gYWxyZWFkeSBpbml0aWFsaXplZD8gV2UgZ29vZFxuICAgIGlmICh0aGlzLmN1cnJlbnRQbHVnaW4gaW5zdGFuY2VvZiB0aGlzLnJ1bGVzW21hdGNoZWRNcV0ucGx1Z2luKSByZXR1cm47XG5cbiAgICAvLyBSZW1vdmUgZXhpc3RpbmcgcGx1Z2luLXNwZWNpZmljIENTUyBjbGFzc2VzXG4gICAgJC5lYWNoKE1lbnVQbHVnaW5zLCBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICBfdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyh2YWx1ZS5jc3NDbGFzcyk7XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgdGhlIENTUyBjbGFzcyBmb3IgdGhlIG5ldyBwbHVnaW5cbiAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKHRoaXMucnVsZXNbbWF0Y2hlZE1xXS5jc3NDbGFzcyk7XG5cbiAgICAvLyBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIG5ldyBwbHVnaW5cbiAgICBpZiAodGhpcy5jdXJyZW50UGx1Z2luKSB7XG4gICAgICAvL2Rvbid0IGtub3cgd2h5IGJ1dCBvbiBuZXN0ZWQgZWxlbWVudHMgZGF0YSB6ZlBsdWdpbiBnZXQncyBsb3N0XG4gICAgICBpZiAoIXRoaXMuY3VycmVudFBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpICYmIHRoaXMuc3RvcmV6ZkRhdGEpIHRoaXMuY3VycmVudFBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicsdGhpcy5zdG9yZXpmRGF0YSk7XG4gICAgICB0aGlzLmN1cnJlbnRQbHVnaW4uZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLl9oYW5kbGVNYXJrdXAodGhpcy5ydWxlc1ttYXRjaGVkTXFdLmNzc0NsYXNzKTtcbiAgICB0aGlzLmN1cnJlbnRQbHVnaW4gPSBuZXcgdGhpcy5ydWxlc1ttYXRjaGVkTXFdLnBsdWdpbih0aGlzLiRlbGVtZW50LCB7fSk7XG4gICAgdGhpcy5zdG9yZXpmRGF0YSA9IHRoaXMuY3VycmVudFBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpO1xuXG4gIH1cblxuICBfaGFuZGxlTWFya3VwKHRvU2V0KXtcbiAgICB2YXIgX3RoaXMgPSB0aGlzLCBmcm9tU3RyaW5nID0gJ2FjY29yZGlvbic7XG4gICAgdmFyICRwYW5lbHMgPSAkKCdbZGF0YS10YWJzLWNvbnRlbnQ9Jyt0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJykrJ10nKTtcbiAgICBpZiAoJHBhbmVscy5sZW5ndGgpIGZyb21TdHJpbmcgPSAndGFicyc7XG4gICAgaWYgKGZyb21TdHJpbmcgPT09IHRvU2V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfTtcblxuICAgIHZhciB0YWJzVGl0bGUgPSBfdGhpcy5hbGxPcHRpb25zLmxpbmtDbGFzcz9fdGhpcy5hbGxPcHRpb25zLmxpbmtDbGFzczondGFicy10aXRsZSc7XG4gICAgdmFyIHRhYnNQYW5lbCA9IF90aGlzLmFsbE9wdGlvbnMucGFuZWxDbGFzcz9fdGhpcy5hbGxPcHRpb25zLnBhbmVsQ2xhc3M6J3RhYnMtcGFuZWwnO1xuXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVBdHRyKCdyb2xlJyk7XG4gICAgdmFyICRsaUhlYWRzID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignLicrdGFic1RpdGxlKycsW2RhdGEtYWNjb3JkaW9uLWl0ZW1dJykucmVtb3ZlQ2xhc3ModGFic1RpdGxlKS5yZW1vdmVDbGFzcygnYWNjb3JkaW9uLWl0ZW0nKS5yZW1vdmVBdHRyKCdkYXRhLWFjY29yZGlvbi1pdGVtJyk7XG4gICAgdmFyICRsaUhlYWRzQSA9ICRsaUhlYWRzLmNoaWxkcmVuKCdhJykucmVtb3ZlQ2xhc3MoJ2FjY29yZGlvbi10aXRsZScpO1xuXG4gICAgaWYgKGZyb21TdHJpbmcgPT09ICd0YWJzJykge1xuICAgICAgJHBhbmVscyA9ICRwYW5lbHMuY2hpbGRyZW4oJy4nK3RhYnNQYW5lbCkucmVtb3ZlQ2xhc3ModGFic1BhbmVsKS5yZW1vdmVBdHRyKCdyb2xlJykucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4nKS5yZW1vdmVBdHRyKCdhcmlhLWxhYmVsbGVkYnknKTtcbiAgICAgICRwYW5lbHMuY2hpbGRyZW4oJ2EnKS5yZW1vdmVBdHRyKCdyb2xlJykucmVtb3ZlQXR0cignYXJpYS1jb250cm9scycpLnJlbW92ZUF0dHIoJ2FyaWEtc2VsZWN0ZWQnKTtcbiAgICB9ZWxzZXtcbiAgICAgICRwYW5lbHMgPSAkbGlIZWFkcy5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJykucmVtb3ZlQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50Jyk7XG4gICAgfTtcblxuICAgICRwYW5lbHMuY3NzKHtkaXNwbGF5OicnLHZpc2liaWxpdHk6Jyd9KTtcbiAgICAkbGlIZWFkcy5jc3Moe2Rpc3BsYXk6JycsdmlzaWJpbGl0eTonJ30pO1xuICAgIGlmICh0b1NldCA9PT0gJ2FjY29yZGlvbicpIHtcbiAgICAgICRwYW5lbHMuZWFjaChmdW5jdGlvbihrZXksdmFsdWUpe1xuICAgICAgICAkKHZhbHVlKS5hcHBlbmRUbygkbGlIZWFkcy5nZXQoa2V5KSkuYWRkQ2xhc3MoJ2FjY29yZGlvbi1jb250ZW50JykuYXR0cignZGF0YS10YWItY29udGVudCcsJycpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKS5jc3Moe2hlaWdodDonJ30pO1xuICAgICAgICAkKCdbZGF0YS10YWJzLWNvbnRlbnQ9JytfdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcpKyddJykuYWZ0ZXIoJzxkaXYgaWQ9XCJ0YWJzLXBsYWNlaG9sZGVyLScrX3RoaXMuJGVsZW1lbnQuYXR0cignaWQnKSsnXCI+PC9kaXY+JykucmVtb3ZlKCk7XG4gICAgICAgICRsaUhlYWRzLmFkZENsYXNzKCdhY2NvcmRpb24taXRlbScpLmF0dHIoJ2RhdGEtYWNjb3JkaW9uLWl0ZW0nLCcnKTtcbiAgICAgICAgJGxpSGVhZHNBLmFkZENsYXNzKCdhY2NvcmRpb24tdGl0bGUnKTtcbiAgICAgIH0pO1xuICAgIH1lbHNlIGlmICh0b1NldCA9PT0gJ3RhYnMnKXtcbiAgICAgIHZhciAkdGFic0NvbnRlbnQgPSAkKCdbZGF0YS10YWJzLWNvbnRlbnQ9JytfdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcpKyddJyk7XG4gICAgICB2YXIgJHBsYWNlaG9sZGVyID0gJCgnI3RhYnMtcGxhY2Vob2xkZXItJytfdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcpKTtcbiAgICAgIGlmICgkcGxhY2Vob2xkZXIubGVuZ3RoKSB7XG4gICAgICAgICR0YWJzQ29udGVudCA9ICQoJzxkaXYgY2xhc3M9XCJ0YWJzLWNvbnRlbnRcIj48L2Rpdj4nKS5pbnNlcnRBZnRlcigkcGxhY2Vob2xkZXIpLmF0dHIoJ2RhdGEtdGFicy1jb250ZW50JyxfdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcpKTtcbiAgICAgICAgJHBsYWNlaG9sZGVyLnJlbW92ZSgpO1xuICAgICAgfWVsc2V7XG4gICAgICAgICR0YWJzQ29udGVudCA9ICQoJzxkaXYgY2xhc3M9XCJ0YWJzLWNvbnRlbnRcIj48L2Rpdj4nKS5pbnNlcnRBZnRlcihfdGhpcy4kZWxlbWVudCkuYXR0cignZGF0YS10YWJzLWNvbnRlbnQnLF90aGlzLiRlbGVtZW50LmF0dHIoJ2lkJykpO1xuICAgICAgfTtcbiAgICAgICRwYW5lbHMuZWFjaChmdW5jdGlvbihrZXksdmFsdWUpe1xuICAgICAgICB2YXIgdGVtcFZhbHVlID0gJCh2YWx1ZSkuYXBwZW5kVG8oJHRhYnNDb250ZW50KS5hZGRDbGFzcyh0YWJzUGFuZWwpO1xuICAgICAgICB2YXIgaGFzaCA9ICRsaUhlYWRzQS5nZXQoa2V5KS5oYXNoLnNsaWNlKDEpO1xuICAgICAgICB2YXIgaWQgPSAkKHZhbHVlKS5hdHRyKCdpZCcpIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ2FjY29yZGlvbicpO1xuICAgICAgICBpZiAoaGFzaCAhPT0gaWQpIHtcbiAgICAgICAgICBpZiAoaGFzaCAhPT0gJycpIHtcbiAgICAgICAgICAgICQodmFsdWUpLmF0dHIoJ2lkJyxoYXNoKTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGhhc2ggPSBpZDtcbiAgICAgICAgICAgICQodmFsdWUpLmF0dHIoJ2lkJyxoYXNoKTtcbiAgICAgICAgICAgICQoJGxpSGVhZHNBLmdldChrZXkpKS5hdHRyKCdocmVmJywkKCRsaUhlYWRzQS5nZXQoa2V5KSkuYXR0cignaHJlZicpLnJlcGxhY2UoJyMnLCcnKSsnIycraGFzaCk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGlzQWN0aXZlID0gJCgkbGlIZWFkcy5nZXQoa2V5KSkuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICBpZiAoaXNBY3RpdmUpIHtcbiAgICAgICAgICB0ZW1wVmFsdWUuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICAkbGlIZWFkcy5hZGRDbGFzcyh0YWJzVGl0bGUpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGluc3RhbmNlIG9mIHRoZSBjdXJyZW50IHBsdWdpbiBvbiB0aGlzIGVsZW1lbnQsIGFzIHdlbGwgYXMgdGhlIHdpbmRvdyByZXNpemUgaGFuZGxlciB0aGF0IHN3aXRjaGVzIHRoZSBwbHVnaW5zIG91dC5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmN1cnJlbnRQbHVnaW4pIHRoaXMuY3VycmVudFBsdWdpbi5kZXN0cm95KCk7XG4gICAgJCh3aW5kb3cpLm9mZignLnpmLlJlc3BvbnNpdmVBY2NvcmRpb25UYWJzJyk7XG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cblJlc3BvbnNpdmVBY2NvcmRpb25UYWJzLmRlZmF1bHRzID0ge307XG5cbi8vIFRoZSBwbHVnaW4gbWF0Y2hlcyB0aGUgcGx1Z2luIGNsYXNzZXMgd2l0aCB0aGVzZSBwbHVnaW4gaW5zdGFuY2VzLlxudmFyIE1lbnVQbHVnaW5zID0ge1xuICB0YWJzOiB7XG4gICAgY3NzQ2xhc3M6ICd0YWJzJyxcbiAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnMudGFicyB8fCBudWxsXG4gIH0sXG4gIGFjY29yZGlvbjoge1xuICAgIGNzc0NsYXNzOiAnYWNjb3JkaW9uJyxcbiAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnMuYWNjb3JkaW9uIHx8IG51bGxcbiAgfVxufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKFJlc3BvbnNpdmVBY2NvcmRpb25UYWJzLCAnUmVzcG9uc2l2ZUFjY29yZGlvblRhYnMnKTtcblxufShqUXVlcnkpO1xuIiwiJChkb2N1bWVudCkuZm91bmRhdGlvbigpOyIsIi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbkJ1c2luZXNzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cbi8qKioqKiBDYXNlIFN0dWRpZXM6IFNUQVJUICoqKioqL1xuXG4vLyBEZWZpbmUgYWRkaXRpb25hbCBmdW5jdGlvbnMgZm9yIHRhYmJlZENvbnRlbnRcbmZ1bmN0aW9uIGNhc2VTdHVkaWVzKCkge1xuICAgIC8vIENoYW5nZSBjYXNlIHRpdGxlXG4gICAgJCgnLnRpdGxlLWNvbnRhaW5lciAudGl0bGUgaDUnKS50ZXh0KCQoJy50YXNrLXR5cGVzIC5uYXZbZGF0YS1hY3RpdmVdJykudGV4dCgpKTtcbiAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IDEwMjQpIHtcbiAgICAgICAgJCgnLnRhc2stdHlwZXMgLmNhcmV0JykuY3NzKHtcbiAgICAgICAgICAgICd0b3AnOiAnYXV0bycsXG4gICAgICAgICAgICAnYm90dG9tJzogJy01cHgnLFxuICAgICAgICAgICAgJ3JpZ2h0JzogJ2F1dG8nXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgbGVmdFZhbCA9ICgkKCcudGFzay10eXBlcyAubmF2W2RhdGEtYWN0aXZlXScpLmF0dHIoJ2RhdGEtaWQnKSAqIDI1KSAtIDEyLjU7XG4gICAgICAgICQoJy50YXNrLXR5cGVzIC5jYXJldCcpLmNzcygnbGVmdCcsIGxlZnRWYWwgKyAnJScpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgICQoJy50YXNrLXR5cGVzIC5jYXJldCcpLmNzcyh7XG4gICAgICAgICAgICAnYm90dG9tJzogJ2F1dG8nLFxuICAgICAgICAgICAgJ2xlZnQnOiAnYXV0bycsXG4gICAgICAgICAgICAncmlnaHQnOiAnMCdcbiAgICAgICAgfSk7XG4gICAgICAgICQoJy50YXNrLXR5cGVzIC5jYXJldCcpLmNzcygndG9wJywgJCgnLnRhc2stdHlwZXMgLm5hdltkYXRhLWFjdGl2ZV0nKS5wb3NpdGlvbigpLnRvcCk7XG4gICAgfTtcbiAgICAkKCcuZ3JhcGhpYy1jb250YWluZXIgLmdyYXBoaWMnKS5yZW1vdmVBdHRyKCdkYXRhLWFjdGl2ZScpLmhpZGUoKTtcbiAgICAkKCcuZ3JhcGhpYy1jb250YWluZXIgLmdyYXBoaWMnICsgJzpudGgtY2hpbGQoJyArICQoJy5uYXZbZGF0YS1hY3RpdmVdJykuYXR0cignZGF0YS1pZCcpICsgJyknKVxuICAgICAgICAuZmFkZUluKDMwMClcbiAgICAgICAgLmF0dHIoJ2RhdGEtYWN0aXZlJywgJycpO1xufVxuXG4vKioqKiogQ2FzZSBTdHVkaWVzOiBFTkQgKioqKiovXG5cblxuLyoqKioqIFByb2plY3QgRmxvdzogU1RBUlQgKioqKiovXG5cbmZ1bmN0aW9uIHByb2plY3RGbG93KCkge1xuICAgIC8vIEdyYXBoaWMgc2xpZGVyXG4gICAgJChcIi5wZi1ncmFwaGljLWNvbnRhaW5lclwiKS5zbGljayh7XG4gICAgICAgIHNsaWRlOiAnLnBmLWdyYXBoaWMnLFxuICAgICAgICBkb3RzOiBmYWxzZSxcbiAgICAgICAgYXBwZW5kRG90czogJy5kb3RzLWNvbnRhaW5lci5wZi1kb3RzJyxcbiAgICAgICAgYXJyb3dzOiB0cnVlLFxuICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgYXNOYXZGb3I6ICcucGYtZGVzYy1jb250YWluZXInLFxuICAgICAgICBwcmV2QXJyb3c6ICc8c3ZnIGlkPVwicHJldi1hcnJvd1wiPjx1c2UgeGxpbms6aHJlZj1cIiNpY29uLWFuZ2xlLWxlZnRcIiAvPjwvc3ZnPicsXG4gICAgICAgIG5leHRBcnJvdzogJzxzdmcgaWQ9XCJuZXh0LWFycm93XCI+PHVzZSB4bGluazpocmVmPVwiI2ljb24tYW5nbGUtcmlnaHRcIiAvPjwvc3ZnPicsXG4gICAgICAgIHJlc3BvbnNpdmU6IFt7XG4gICAgICAgICAgICBicmVha3BvaW50OiA2NDAsXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgIGFycm93czogZmFsc2UsXG4gICAgICAgICAgICAgICAgZG90czogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XVxuICAgIH0pO1xuXG4gICAgLy8gRGVzY3JpcHRpb24gY2hhbmdlXG4gICAgJChcIi5wZi1kZXNjLWNvbnRhaW5lclwiKS5zbGljayh7XG4gICAgICAgIHNsaWRlOiAnLmRlc2NyaXB0aW9uJyxcbiAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgIGFycm93czogZmFsc2UsXG4gICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxuICAgICAgICBzd2lwZTogZmFsc2UsXG4gICAgICAgIGZhZGU6IHRydWUsXG4gICAgICAgIHNwZWVkOiAzMDAsXG4gICAgICAgIGNzc0Vhc2U6ICdsaW5lYXInLFxuICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICBhc05hdkZvcjogJy5wZi1ncmFwaGljLWNvbnRhaW5lcidcbiAgICB9KTtcblxuICAgIC8vIFRpbWVsaW5lXG4gICAgdmFyIGZsb3dXaWR0aCA9IFszLjU3NCwgMTUuOTMzLCA0MC4wODIsIDUxLjgzOCwgNjMuODk1LCA3NS44MDIsIDEwMF07XG4gICAgdmFyIGZpbGwgPSAkKCcucGYtdGltZWxpbmUgLmZpbGwgaW1nJyk7XG5cbiAgICAkKFwiLnBmLWdyYXBoaWMtY29udGFpbmVyXCIpLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xuICAgICAgICBmaWxsLmNzcygnLXdlYmtpdC1jbGlwLXBhdGgnLCAncG9seWdvbigwJSAwJSwgJyArIGZsb3dXaWR0aFtuZXh0U2xpZGVdICsgJyUgMCUsICcgKyBmbG93V2lkdGhbbmV4dFNsaWRlXSArICclIDEwMCUsIDAlIDEwMCUpJyk7XG4gICAgfSk7XG4gICAgLy8gLy8gRXZlbnQgaGFuZGxlciBmb3IgbW9iaWxlXG4gICAgJCgnLnBmLWdyYXBoaWMtY29udGFpbmVyJykub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XG4gICAgICAgIGZpbGwuY3NzKCctd2Via2l0LWNsaXAtcGF0aCcsICdwb2x5Z29uKDAlIDAlLCAnICsgZmxvd1dpZHRoW2N1cnJlbnRTbGlkZV0gKyAnJSAwJSwgJyArIGZsb3dXaWR0aFtjdXJyZW50U2xpZGVdICsgJyUgMTAwJSwgMCUgMTAwJSknKTtcbiAgICB9KTtcbn1cblxuLyoqKioqIFByb2plY3QgRmxvdzogRU5EICoqKioqL1xuXG4vKioqKiogSW5pdGlhbGl6ZSBvbiBMb2FkOiBTVEFSVCAqKioqKi9cblxuJChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCQoJ2JvZHknKS5pcygnLmJ1c2luZXNzLXBhZ2UnKSkge1xuICAgICAgICAvLyBDYXNlIHN0dWRpZXMgdGFiYmVkIGNvbnRlbnQgJiBhdXRvcGxheVxuICAgICAgICB0YWJiZWRDb250ZW50KCcubmF2JywgJy5jYXNlJywgY2FzZVN0dWRpZXMpO1xuICAgICAgICAvLyBQcm9qZWN0IGZsb3cgc2xpY2sgc2xpZGVyXG4gICAgICAgIHByb2plY3RGbG93KCk7XG4gICAgICAgIC8vIFRlc3RpbW9uaWFsXG4gICAgICAgIHRlc3RpbW9uaWFsKCk7XG4gICAgfVxufSk7XG5cbi8qKioqKiBJbml0aWFsaXplIG9uIExvYWQ6IEVORCAqKioqKi8iLCIiLCIvKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5JbmRleFxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG4vKioqKiogQmVmb3JlICYgQWZ0ZXI6IFNUQVJUICAqKioqKi9cblxuZnVuY3Rpb24gZHJhZ3MoZHJhZ0VsZW1lbnQsIHJlc2l6ZUVsZW1lbnQsIGNvbnRhaW5lcikge1xuICAgIC8vIEluaXRpYWxpemUgdGhlIGRyYWdnaW5nIGV2ZW50IG9uIG1vdXNlZG93bi5cbiAgICBkcmFnRWxlbWVudC5vbignbW91c2Vkb3duIHRvdWNoc3RhcnQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBkcmFnRWxlbWVudC5hZGRDbGFzcygnYmEtZHJhZ2dhYmxlJyk7XG4gICAgICAgIHJlc2l6ZUVsZW1lbnQuYWRkQ2xhc3MoJ2JhLXJlc2l6YWJsZScpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIGl0J3MgYSBtb3VzZSBvciB0b3VjaCBldmVudCBhbmQgcGFzcyBhbG9uZyB0aGUgY29ycmVjdCB2YWx1ZVxuICAgICAgICB2YXIgc3RhcnRYID0gKGUucGFnZVgpID8gZS5wYWdlWCA6IGUub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLnBhZ2VYO1xuXG4gICAgICAgIC8vIEdldCB0aGUgaW5pdGlhbCBwb3NpdGlvblxuICAgICAgICB2YXIgZHJhZ1dpZHRoID0gZHJhZ0VsZW1lbnQub3V0ZXJXaWR0aCgpLFxuICAgICAgICAgICAgcG9zWCA9IGRyYWdFbGVtZW50Lm9mZnNldCgpLmxlZnQgKyBkcmFnV2lkdGggLSBzdGFydFgsXG4gICAgICAgICAgICBjb250YWluZXJPZmZzZXQgPSBjb250YWluZXIub2Zmc2V0KCkubGVmdCxcbiAgICAgICAgICAgIGNvbnRhaW5lcldpZHRoID0gY29udGFpbmVyLm91dGVyV2lkdGgoKTtcblxuICAgICAgICAvLyBTZXQgbGltaXRzXG4gICAgICAgIG1pbkxlZnQgPSAkKCcuYmEtbGltaXQnKS5vZmZzZXQoKS5sZWZ0IC0gMTA7XG4gICAgICAgIG1heExlZnQgPSAkKCcuYmEtbGltaXQnKS5vZmZzZXQoKS5sZWZ0ICsgJCgnLmJhLWxpbWl0Jykub3V0ZXJXaWR0aCgpICsgMTA7XG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBkcmFnZ2luZyBkaXN0YW5jZSBvbiBtb3VzZW1vdmUuXG4gICAgICAgIGRyYWdFbGVtZW50LnBhcmVudHMoKS5vbihcIm1vdXNlbW92ZSB0b3VjaG1vdmVcIiwgZnVuY3Rpb24gKGUpIHtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBhIG1vdXNlIG9yIHRvdWNoIGV2ZW50IGFuZCBwYXNzIGFsb25nIHRoZSBjb3JyZWN0IHZhbHVlXG4gICAgICAgICAgICB2YXIgbW92ZVggPSAoZS5wYWdlWCkgPyBlLnBhZ2VYIDogZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICAgICAgICBsZWZ0VmFsdWUgPSBtb3ZlWCArIHBvc1ggLSBkcmFnV2lkdGg7XG5cbiAgICAgICAgICAgIC8vIFByZXZlbnQgZ29pbmcgb2ZmIGxpbWl0c1xuICAgICAgICAgICAgaWYgKGxlZnRWYWx1ZSA8IG1pbkxlZnQpIHtcbiAgICAgICAgICAgICAgICBsZWZ0VmFsdWUgPSBtaW5MZWZ0O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsZWZ0VmFsdWUgPiBtYXhMZWZ0KSB7XG4gICAgICAgICAgICAgICAgbGVmdFZhbHVlID0gbWF4TGVmdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVHJhbnNsYXRlIHRoZSBoYW5kbGUncyBsZWZ0IHZhbHVlIHRvIG1hc2tlZCBkaXZzIHdpZHRoLlxuICAgICAgICAgICAgd2lkdGhWYWx1ZSA9IChsZWZ0VmFsdWUgKyBkcmFnV2lkdGggLyAyIC0gY29udGFpbmVyT2Zmc2V0KSAqIDEwMCAvIGNvbnRhaW5lcldpZHRoICsgJyUnO1xuXG4gICAgICAgICAgICAvLyBTZXQgdGhlIG5ldyB2YWx1ZXMgZm9yIHRoZSBzbGlkZXIgYW5kIHRoZSBoYW5kbGUuXG4gICAgICAgICAgICAvLyBCaW5kIG1vdXNldXAgZXZlbnRzIHRvIHN0b3AgZHJhZ2dpbmcuXG4gICAgICAgICAgICAkKCcuYmEtZHJhZ2dhYmxlJykuY3NzKCdsZWZ0Jywgd2lkdGhWYWx1ZSkub24oJ21vdXNldXAgdG91Y2hlbmQgdG91Y2hjYW5jZWwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYmEtZHJhZ2dhYmxlJyk7XG4gICAgICAgICAgICAgICAgcmVzaXplRWxlbWVudC5yZW1vdmVDbGFzcygnLmJhLXJlc2l6YWJsZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkKCcuYmEtcmVzaXphYmxlJykuY3NzKCd3aWR0aCcsIHdpZHRoVmFsdWUpO1xuXG4gICAgICAgICAgICAvLyBUb2dnbGUgc3dpdGNoIG9uIG1pbkxlZnQgJiBtYXhMZWZ0XG4gICAgICAgICAgICBpZiAoJCgnLmJhLWRyYWdnYWJsZScpLm9mZnNldCgpLmxlZnQgPD0gJCgnLmJhLWxpbWl0Jykub2Zmc2V0KCkubGVmdCAtIDEwKSB7XG4gICAgICAgICAgICAgICAgJCgnLnN3aXRjaC1iYXNlJykucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vbicpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgkKCcuYmEtZHJhZ2dhYmxlJykub2Zmc2V0KCkubGVmdCA+PSAkKCcuYmEtbGltaXQnKS5vZmZzZXQoKS5sZWZ0ICsgJCgnLmJhLWxpbWl0Jykub3V0ZXJXaWR0aCgpKSB7XG4gICAgICAgICAgICAgICAgJCgnLnN3aXRjaC1iYXNlJykuYWRkQ2xhc3MoJ3N3aXRjaC1vbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5vbignbW91c2V1cCB0b3VjaGVuZCB0b3VjaGNhbmNlbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGRyYWdFbGVtZW50LnJlbW92ZUNsYXNzKCdiYS1kcmFnZ2FibGUnKTtcbiAgICAgICAgICAgIHJlc2l6ZUVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2JhLXJlc2l6YWJsZScpO1xuICAgICAgICB9KTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pLm9uKCdtb3VzZXVwIHRvdWNoZW5kIHRvdWNoY2FuY2VsJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZHJhZ0VsZW1lbnQucmVtb3ZlQ2xhc3MoJ2JhLWRyYWdnYWJsZScpO1xuICAgICAgICByZXNpemVFbGVtZW50LnJlbW92ZUNsYXNzKCdiYS1yZXNpemFibGUnKTtcbiAgICB9KTtcbn1cblxuLyogU3dpdGNoICovXG4kKCcuc3dpdGNoLWJhc2UnKS5vbignbW91c2Vkb3duIHRhcCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIGJhT2Zmc2V0ID0gJCgnLmJhLWxpbWl0Jykub2Zmc2V0KCkubGVmdDtcbiAgICB2YXIgaGFuZGxlTGVmdCA9ICQoJy5oYW5kbGUnKS5vZmZzZXQoKS5sZWZ0IC0gJCgnLmhhbmRsZScpLnBvc2l0aW9uKCkubGVmdDtcbiAgICB2YXIgbWluTGVmdCA9IGJhT2Zmc2V0IC0gMTUgLSBoYW5kbGVMZWZ0O1xuICAgIHZhciBtYXhMZWZ0ID0gYmFPZmZzZXQgKyAkKCcuYmEtbGltaXQnKS53aWR0aCgpICsgMTUgLSBoYW5kbGVMZWZ0O1xuXG4gICAgJCgnLnN3aXRjaC1iYXNlJykudG9nZ2xlQ2xhc3MoJ3N3aXRjaC1vbicpO1xuXG4gICAgaWYgKCQoJy5zd2l0Y2gtYmFzZScpLmhhc0NsYXNzKCdzd2l0Y2gtb24nKSkge1xuICAgICAgICAkKCcuaGFuZGxlJykuYW5pbWF0ZSh7XG4gICAgICAgICAgICBsZWZ0OiBtYXhMZWZ0XG4gICAgICAgIH0pO1xuICAgICAgICAkKCcucmVzaXplJykuYW5pbWF0ZSh7XG4gICAgICAgICAgICB3aWR0aDogbWF4TGVmdCArICdweCdcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCgnLmhhbmRsZScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgbGVmdDogbWluTGVmdFxuICAgICAgICB9KTtcbiAgICAgICAgJCgnLnJlc2l6ZScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgd2lkdGg6IG1pbkxlZnQgKyAncHgnXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG4vLyBEZWZpbmUgcGx1Z2luXG4kLmZuLmJlZm9yZUFmdGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjdXIgPSB0aGlzO1xuXG4gICAgLy8gQWRqdXN0IHRoZSBzbGlkZXJcbiAgICB2YXIgd2lkdGggPSBjdXIud2lkdGgoKSArICdweCc7XG4gICAgY3VyLmZpbmQoJy5yZXNpemUgaW1nJykuY3NzKCd3aWR0aCcsIHdpZHRoKTtcblxuICAgIC8vIEJpbmQgZHJhZ2dpbmcgZXZlbnRzXG4gICAgZHJhZ3MoY3VyLmZpbmQoJy5oYW5kbGUnKSwgY3VyLmZpbmQoJy5yZXNpemUnKSwgY3VyKTtcblxuICAgIC8vIFVwZGF0ZSBzbGlkZXJzIG9uIHJlc2l6ZS5cbiAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHdpZHRoID0gY3VyLndpZHRoKCkgKyAncHgnO1xuICAgICAgICBjdXIuZmluZCgnLnJlc2l6ZSBpbWcnKS5jc3MoJ3dpZHRoJywgd2lkdGgpO1xuICAgIH0pO1xufVxuXG4vKioqKiogQmVmb3JlICYgQWZ0ZXI6IEVORCAgKioqKiovXG5cblxuLyoqKioqIEV4cGVydGlzZTogU1RBUlQgKioqKiovXG5cbi8vIE1ha2UgYXMgZ2xvYmFsIGZ1bmN0aW9uXG5mdW5jdGlvbiB0YWJiZWRDb250ZW50KG5hdkVsZW1lbnQsIGNvbnRlbnRFbGVtZW50LCBjdXN0b21GdW5jKSB7XG4gICAgLy8gRGVmaW5lIG9uIGRhdGFDaGFuZ2UgZnVuY3Rpb25zXG4gICAgZnVuY3Rpb24gZGF0YUNoYW5nZSgpIHtcbiAgICAgICAgLy8gQ2hhbmdlIGV4cGVydGlzZSBjb250ZW50XG4gICAgICAgICQoY29udGVudEVsZW1lbnQpLnJlbW92ZUF0dHIoJ2RhdGEtYWN0aXZlJykuaGlkZSgpO1xuICAgICAgICAkKGNvbnRlbnRFbGVtZW50ICsgJzpudGgtY2hpbGQoJyArICQobmF2RWxlbWVudCArICdbZGF0YS1hY3RpdmVdJykuYXR0cignZGF0YS1pZCcpICsgJyknKS5mYWRlSW4oMzAwKS5hdHRyKCdkYXRhLWFjdGl2ZScsICcnKTtcbiAgICAgICAgaWYgKGN1c3RvbUZ1bmMpIHtcbiAgICAgICAgICAgIGN1c3RvbUZ1bmMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIEJ1dHRvbiAqL1xuICAgICQobmF2RWxlbWVudCkub24oJ21vdXNlZG93biB0YXAnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBhdXRvcGxheVN0b3AoKTtcbiAgICAgICAgJChuYXZFbGVtZW50KS5yZW1vdmVBdHRyKCdkYXRhLWFjdGl2ZScpO1xuICAgICAgICAkKHRoaXMpLmF0dHIoJ2RhdGEtYWN0aXZlJywgJycpO1xuICAgICAgICBkYXRhQ2hhbmdlKCk7XG4gICAgfSk7XG5cbiAgICAvKiBBdXRvcGxheSAqL1xuICAgIC8vIFNldCB1cCBpbnRlcnZhbFxuICAgIHZhciBhdXRvcGxheTtcblxuICAgIGZ1bmN0aW9uIGF1dG9wbGF5U3RvcCgpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChhdXRvcGxheSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXV0b3BsYXlTdGFydCgpIHtcbiAgICAgICAgYXV0b3BsYXkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhdXRvcGxheUZ1bmMoKVxuICAgICAgICB9LCA2MDAwKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdXAgYXV0b3BsYXkgZnVuY3Rpb25cbiAgICBmdW5jdGlvbiBhdXRvcGxheUZ1bmMoKSB7XG4gICAgICAgIHZhciBuZXh0SUQgPSAkKG5hdkVsZW1lbnQgKyAnW2RhdGEtYWN0aXZlXScpLmluZGV4KCkgKyAyO1xuICAgICAgICAkKG5hdkVsZW1lbnQpLnJlbW92ZUF0dHIoJ2RhdGEtYWN0aXZlJyk7XG4gICAgICAgIC8vIElmIGV4Y2VlZHMgbGVuZ3RoLCBsb29wIGJhY2sgdG8gMVxuICAgICAgICBpZiAobmV4dElEID4gJChuYXZFbGVtZW50KS5sZW5ndGgpIHtcbiAgICAgICAgICAgICQobmF2RWxlbWVudCArICdbZGF0YS1pZD1cIjFcIl0nKS5hdHRyKCdkYXRhLWFjdGl2ZScsICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQobmF2RWxlbWVudCArICdbZGF0YS1pZD1cIicgKyBuZXh0SUQgKyAnXCJdJykuYXR0cignZGF0YS1hY3RpdmUnLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgZGF0YUNoYW5nZSgpO1xuICAgIH1cbiAgICBhdXRvcGxheVN0YXJ0KCk7XG59XG5cbi8qKioqKiBFeHBlcnRpc2U6IEVORCAqKioqKi9cblxuXG4vKioqKiogVGVzdGltb25pYWw6IFNUQVJUICAqKioqKi9cblxuZnVuY3Rpb24gdGVzdGltb25pYWwoKSB7XG4gICAgJChcIi50ZXN0aW1vbmlhbC1jb250YWluZXJcIikuc2xpY2soe1xuICAgICAgICBzbGlkZTogJy50ZXN0aW1vbmlhbCcsXG4gICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICBhcHBlbmREb3RzOiAnLmRvdHMtY29udGFpbmVyLnRlc3RpbW9uaWFsLWRvdHMnLFxuICAgICAgICBhcnJvd3M6IHRydWUsXG4gICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICBzbGlkZXNUb1Nob3c6IDIsXG4gICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICBwcmV2QXJyb3c6ICc8c3ZnIGlkPVwicHJldi1hcnJvd1wiPjx1c2UgeGxpbms6aHJlZj1cIiNpY29uLWFuZ2xlLWxlZnRcIiAvPjwvc3ZnPicsXG4gICAgICAgIG5leHRBcnJvdzogJzxzdmcgaWQ9XCJuZXh0LWFycm93XCI+PHVzZSB4bGluazpocmVmPVwiI2ljb24tYW5nbGUtcmlnaHRcIiAvPjwvc3ZnPicsXG4gICAgICAgIHJlc3BvbnNpdmU6IFt7XG4gICAgICAgICAgICBicmVha3BvaW50OiA4MDAsXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRvdHM6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICB9KTtcbn1cblxuLyoqKioqIFRlc3RpbW9uaWFsOiBFTkQgICoqKioqL1xuXG5cbi8qKioqKiBFcXVhbGl6ZSBIZWlnaHQgRnVuY3Rpb246IFNUQVJUICAqKioqKi9cblxuZnVuY3Rpb24gZXF1YWxpemVIZWlnaHQoZWxlbWVudE5hbWUpIHtcbiAgICBmdW5jdGlvbiByZXNpemVIZWlnaHQoKSB7XG4gICAgICAgIHZhciBoZWlnaHRzID0gJChlbGVtZW50TmFtZSkubWFwKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJCh0aGlzKS5oZWlnaHQoKTtcbiAgICAgICAgICAgIH0pLmdldCgpLFxuICAgICAgICAgICAgbWF4SGVpZ2h0ID0gTWF0aC5tYXguYXBwbHkobnVsbCwgaGVpZ2h0cyk7XG4gICAgICAgICQoZWxlbWVudE5hbWUpLmhlaWdodChtYXhIZWlnaHQpO1xuICAgIH1cbn1cblxuLyoqKioqIEVxdWFsaXplIEhlaWdodCBGdW5jdGlvbjogRU5EICAqKioqKi9cblxuXG4vKioqKiogSW5pdGlhbGl6ZSBvbiBMb2FkOiBTVEFSVCAqKioqKi9cblxuJChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCQoJ2JvZHknKS5pcygnLmluZGV4LXBhZ2UnKSkge1xuICAgICAgICAvLyBCZWZvcmUgJiBBZnRlclxuICAgICAgICAkKCcuYmEtc2xpZGVyJykuYmVmb3JlQWZ0ZXIoKTtcbiAgICAgICAgLy8gVGFiYmVkIGNvbnRlbnQgJiBhdXRvcGxheVxuICAgICAgICB0YWJiZWRDb250ZW50KCcuZXhwZXJ0aXNlLW5hdicsICcuY29udGVudCcpO1xuICAgICAgICAvLyBUZXN0aW1vbmlhbCBzbGlkZXJcbiAgICAgICAgdGVzdGltb25pYWwoKTtcbiAgICB9XG59KTtcblxuLyoqKioqIEluaXRpYWxpemUgb24gTG9hZDogRU5EICoqKioqLyIsIi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblN1cGFBZ2VudFxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG4vKioqKiogU2Nyb2xsIFRyaWdnZXI6IFNUQVJUICoqKioqL1xuXG5mdW5jdGlvbiBzY3JvbGxUcmlnZ2VyKHNlY3Rpb25DbGFzcywgYWRkSGVpZ2h0LCBjdXN0b21GdW5jKSB7XG4gICAgdmFyIHRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaFQgPSAkKHNlY3Rpb25DbGFzcykub2Zmc2V0KCkudG9wICsgYWRkSGVpZ2h0LFxuICAgICAgICAgICAgd1MgPSAkKHRoaXMpLnNjcm9sbFRvcCgpO1xuICAgICAgICBpZiAod1MgPiBoVCAmJiAhdHJpZ2dlcmVkKSB7XG4gICAgICAgICAgICBjdXN0b21GdW5jKCk7XG4gICAgICAgICAgICB0cmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKioqKiBTY3JvbGwgVHJpZ2dlcjogRU5EICoqKioqL1xuXG5cbi8qKioqKiBEZW1vZ3JhcGh5IFNsaWRlcjogU1RBUlQgKioqKiovXG5cbmZ1bmN0aW9uIGRlbW9ncmFwaHlTbGlkZXIoKSB7XG4gICAgJChcIi5zY2VuZS1iYWNrZ3JvdW5kXCIpLnNsaWNrKHtcbiAgICAgICAgc2xpZGU6ICcuc2NlbmUtYmcnLFxuICAgICAgICBkb3RzOiBmYWxzZSxcbiAgICAgICAgYXJyb3dzOiB0cnVlLFxuICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgcHJldkFycm93OiAnPHN2ZyBpZD1cInByZXYtYXJyb3dcIj48dXNlIHhsaW5rOmhyZWY9XCIjaWNvbi1hbmdsZS1sZWZ0XCIgLz48L3N2Zz4nLFxuICAgICAgICBuZXh0QXJyb3c6ICc8c3ZnIGlkPVwibmV4dC1hcnJvd1wiPjx1c2UgeGxpbms6aHJlZj1cIiNpY29uLWFuZ2xlLXJpZ2h0XCIgLz48L3N2Zz4nLFxuICAgICAgICBhc05hdkZvcjogJy5zY2VuZS1mb3JlZ3JvdW5kJyxcbiAgICAgICAgcmVzcG9uc2l2ZTogW3tcbiAgICAgICAgICAgIGJyZWFrcG9pbnQ6IDY0MCxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkb3RzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGFwcGVuZERvdHM6ICcuZG90cy1jb250YWluZXIuZGVtb2dyYXBoeS1kb3RzJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICB9KTtcblxuICAgICQoXCIuc2NlbmUtZm9yZWdyb3VuZFwiKS5zbGljayh7XG4gICAgICAgIHNsaWRlOiAnLnNjZW5lLWZnJyxcbiAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgIGFycm93czogZmFsc2UsXG4gICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICBwcmV2QXJyb3c6ICc8c3ZnIGlkPVwicHJldi1hcnJvd1wiPjx1c2UgeGxpbms6aHJlZj1cIiNpY29uLWFuZ2xlLWxlZnRcIiAvPjwvc3ZnPicsXG4gICAgICAgIG5leHRBcnJvdzogJzxzdmcgaWQ9XCJuZXh0LWFycm93XCI+PHVzZSB4bGluazpocmVmPVwiI2ljb24tYW5nbGUtcmlnaHRcIiAvPjwvc3ZnPicsXG4gICAgICAgIGFzTmF2Rm9yOiAnLnNjZW5lLWJhY2tncm91bmQnXG4gICAgfSk7XG59XG5cbi8qKioqKiBEZW1vZ3JhcGh5IFNsaWRlcjogRU5EICoqKioqL1xuXG5cbi8qKioqKiBTY3JvbGxOYXY6IFNUQVJUICoqKioqL1xuXG5mdW5jdGlvbiBzY3JvbGxOYXYoKSB7XG4gICAgdmFyIHNlY3Rpb25zID0gW1xuICAgICAgICBbJy5oZWFkZXItc2VjdGlvbicsIDBdLFxuICAgICAgICBbJy5iZW5lZml0cy1zZWN0aW9uJywgNV0sXG4gICAgICAgIFsnLnJvbGUtc2VjdGlvbicsIDEwMF0sXG4gICAgICAgIFsnLnRhc2tzLXNlY3Rpb24nLCA1XSxcbiAgICAgICAgWycuZGVtb2dyYXBoeS1zZWN0aW9uJywgMF0sXG4gICAgICAgIFsnLmN0YS1zZWN0aW9uJywgNTBdXG4gICAgXTtcblxuICAgICQoJy5zY3JvbGxuYXYtYnV0dG9uJykub24oJ21vdXNlZG93biB0YXAnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgY3VyckluZGV4ID0gJCh0aGlzKS5pbmRleCgpO1xuICAgICAgICAkKCcuc2Nyb2xsbmF2LWJ1dHRvbicpLnJlbW92ZUF0dHIoJ2RhdGEtYWN0aXZlJyk7XG4gICAgICAgICQodGhpcykuYXR0cignZGF0YS1hY3RpdmUnLCAnJyk7XG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogJChzZWN0aW9uc1tjdXJySW5kZXhdWzBdKS5vZmZzZXQoKS50b3AgKyBzZWN0aW9uc1tjdXJySW5kZXhdWzFdXG4gICAgICAgIH0sIDUwMCk7XG4gICAgfSk7XG59XG5cbi8qKioqKiBTY3JvbGxOYXY6IEVORCAqKioqKi9cblxuXG4vKioqKiogSW5pdGlhbGl6ZSBvbiBMb2FkOiBTVEFSVCAqKioqKi9cblxuJChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCQoJ2JvZHknKS5pcygnLnN1cGFhZ2VudC1wYWdlJykpIHtcblxuICAgICAgICAvLyBSZXNldCBzY3JvbGwgcG9zaXRpb24gd2hlbiBwYWdlIGlzIHJlbG9hZGVkXG4gICAgICAgICQod2luZG93KS5vbignYmVmb3JldW5sb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJCh3aW5kb3cpLnNjcm9sbFRvcCgwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gSGVhZGVyLXRvLUJlbmVmaXQgVHJpZ2dlclxuICAgICAgICAvLyBJZiBzY3JlZW4gaXMgbGFyZ2UgdXBcbiAgICAgICAgaWYgKCQoJy5zaG93LWZvci1sYXJnZScpLmlzKCc6dmlzaWJsZScpKSB7XG4gICAgICAgICAgICBzY3JvbGxUcmlnZ2VyKCcuYmVuZWZpdHMtc2VjdGlvbicsIG51bGwsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkKCcjc2EtZmVtYWxlMS1mcmFtZScpLmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKS5wcmVwZW5kVG8oJy5iZW5lZml0cy1zZWN0aW9uJyk7XG4gICAgICAgICAgICAgICAgJCgnI3NhLWZlbWFsZTEtYmVmb3JlJykuZmFkZU91dCg1MDApO1xuICAgICAgICAgICAgICAgICQoJyNzYS1mZW1hbGUxLWFmdGVyJykuZmFkZUluKDUwMCk7XG4gICAgICAgICAgICAgICAgJCgnI3NhLW1hbGUnKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHNjcmVlbiBpcyBtZWRpdW0gZG93blxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNjcm9sbFRyaWdnZXIoJy5iZW5lZml0cy1zZWN0aW9uJywgMzIwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJCgnI3NhLWZlbWFsZTEtZnJhbWUnKS5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJykuY3NzKCdib3R0b20nLCAnNzVweCcpLnByZXBlbmRUbygnLmJlbmVmaXRzLXNlY3Rpb24nKTtcbiAgICAgICAgICAgICAgICAkKCcjc2EtZmVtYWxlMS1iZWZvcmUnKS5mYWRlT3V0KDUwMCk7XG4gICAgICAgICAgICAgICAgJCgnI3NhLWZlbWFsZTEtYWZ0ZXInKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgICAgICAkKCcjc2EtbWFsZScpLmZhZGVJbig1MDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSb2xlLXRvLVRhc2tzIFRyaWdnZXJcbiAgICAgICAgLy8gSWYgc2NyZWVuIGlzIGxhcmdlIHVwXG4gICAgICAgIGlmICgkKCcuc2hvdy1mb3ItbGFyZ2UnKS5pcygnOnZpc2libGUnKSkge1xuICAgICAgICAgICAgc2Nyb2xsVHJpZ2dlcignLnRhc2tzLXNlY3Rpb24nLCBudWxsLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJCgnI3NhLW1hbGUtZnJhbWUnKS5mYWRlT3V0KDUwMCk7XG4gICAgICAgICAgICAgICAgJCgnI25ldy1hY2Nlc3NjYXJkJykuY3NzKCdkaXNwbGF5JywgJ2ZsZXgnKS5oaWRlKCkuZmFkZUluKDUwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAnMCdcbiAgICAgICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnI25ldy1hY2Nlc3NjYXJkIC5idXR0b24uc2Vjb25kYXJ5JykuZmFkZUluKDUwMCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBzY3JlZW4gaXMgbWVkaXVtIGRvd25cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzY3JvbGxUcmlnZ2VyKCcudGFza3Mtc2VjdGlvbicsIC0xNTAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkKCcjc2EtbWFsZS1mcmFtZScpLmZhZGVPdXQoNTAwKTtcbiAgICAgICAgICAgICAgICAkKCcjbmV3LWFjY2Vzc2NhcmQnKS5jc3MoJ2Rpc3BsYXknLCAnZmxleCcpLmhpZGUoKS5mYWRlSW4oNTAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6ICcwJ1xuICAgICAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgICAgICAgICAkKCcjbmV3LWFjY2Vzc2NhcmQgLmJ1dHRvbi5zZWNvbmRhcnknKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVtb2dyYXBoeSBUcmlnZ2VyXG4gICAgICAgIC8vIElmIHNjcmVlbiBpcyBsYXJnZSB1cFxuICAgICAgICBpZiAoJCgnLnNob3ctZm9yLWxhcmdlJykuaXMoJzp2aXNpYmxlJykpIHtcbiAgICAgICAgICAgIHNjcm9sbFRyaWdnZXIoJy5kZW1vZ3JhcGh5LXNlY3Rpb24nLCA2MCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICQoJyNzYS1mZW1hbGUyLWZyYW1lJykuY3NzKCdwb3NpdGlvbicsICdmaXhlZCcpLmFwcGVuZFRvKCcuYXZhdGFyLWNvbnRhaW5lcicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgc2NyZWVuIGlzIG1lZGl1bSBkb3duXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2Nyb2xsVHJpZ2dlcignLmRlbW9ncmFwaHktc2VjdGlvbicsIC0xNTAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkKCcjc2EtZmVtYWxlMi1mcmFtZScpLmNzcygncG9zaXRpb24nLCAnZml4ZWQnKS5hcHBlbmRUbygnLmF2YXRhci1jb250YWluZXInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ1RBIEF2YXRhclxuICAgICAgICAvLyBJZiBzY3JlZW4gaXMgbGFyZ2UgdXBcbiAgICAgICAgaWYgKCQoJy5zaG93LWZvci1sYXJnZScpLmlzKCc6dmlzaWJsZScpKSB7XG4gICAgICAgICAgICBzY3JvbGxUcmlnZ2VyKCcuY3RhLXNlY3Rpb24nLCA0MCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICQoJyNzYS1mZW1hbGUyLWZyYW1lJykuY3NzKCdwb3NpdGlvbicsICdhYnNvbHV0ZScpLmNzcygnbWFyZ2luLXRvcCcsICc0MHB4JykucHJlcGVuZFRvKCcuY3RhLXNlY3Rpb24nKTtcbiAgICAgICAgICAgICAgICAkKCcjc2EtZmVtYWxlMi1iZWZvcmUnKS5mYWRlT3V0KDUwMCk7XG4gICAgICAgICAgICAgICAgJCgnI3NhLWZlbWFsZTItYWZ0ZXInKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHNjcmVlbiBpcyBtZWRpdW0gZG93blxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNjcm9sbFRyaWdnZXIoJy5jdGEtc2VjdGlvbicsIC0xOTAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkKCcjc2EtZmVtYWxlMi1mcmFtZScpLmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKS5jc3MoJ21hcmdpbi10b3AnLCAnNDBweCcpLnByZXBlbmRUbygnLmN0YS1zZWN0aW9uJyk7XG4gICAgICAgICAgICAgICAgJCgnI3NhLWZlbWFsZTItYmVmb3JlJykuZmFkZU91dCg1MDApO1xuICAgICAgICAgICAgICAgICQoJyNzYS1mZW1hbGUyLWFmdGVyJykuZmFkZUluKDUwMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlbW9ncmFwaHkgU2xpZGVyXG4gICAgICAgIGRlbW9ncmFwaHlTbGlkZXIoKTtcblxuICAgICAgICAvLyBTY3JvbGxOYXZcbiAgICAgICAgc2Nyb2xsTmF2KCk7XG4gICAgfVxufSk7XG5cbi8qKioqKiBJbml0aWFsaXplIG9uIExvYWQ6IEVORCAqKioqKi8iXX0=
