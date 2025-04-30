var fancyScrollbar = "";
var style$3 = "";
var eventemitter3 = { exports: {} };
(function(module) {
  var has = Object.prototype.hasOwnProperty, prefix = "~";
  function Events() {
  }
  if (Object.create) {
    Events.prototype = /* @__PURE__ */ Object.create(null);
    if (!new Events().__proto__)
      prefix = false;
  }
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }
  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== "function") {
      throw new TypeError("The listener must be a function");
    }
    var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
    if (!emitter._events[evt])
      emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn)
      emitter._events[evt].push(listener);
    else
      emitter._events[evt] = [emitter._events[evt], listener];
    return emitter;
  }
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0)
      emitter._events = new Events();
    else
      delete emitter._events[evt];
  }
  function EventEmitter2() {
    this._events = new Events();
    this._eventsCount = 0;
  }
  EventEmitter2.prototype.eventNames = function eventNames() {
    var names = [], events, name;
    if (this._eventsCount === 0)
      return names;
    for (name in events = this._events) {
      if (has.call(events, name))
        names.push(prefix ? name.slice(1) : name);
    }
    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }
    return names;
  };
  EventEmitter2.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event, handlers = this._events[evt];
    if (!handlers)
      return [];
    if (handlers.fn)
      return [handlers.fn];
    for (var i2 = 0, l = handlers.length, ee = new Array(l); i2 < l; i2++) {
      ee[i2] = handlers[i2].fn;
    }
    return ee;
  };
  EventEmitter2.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event, listeners = this._events[evt];
    if (!listeners)
      return 0;
    if (listeners.fn)
      return 1;
    return listeners.length;
  };
  EventEmitter2.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return false;
    var listeners = this._events[evt], len = arguments.length, args, i2;
    if (listeners.fn) {
      if (listeners.once)
        this.removeListener(event, listeners.fn, void 0, true);
      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;
        case 2:
          return listeners.fn.call(listeners.context, a1), true;
        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;
        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }
      for (i2 = 1, args = new Array(len - 1); i2 < len; i2++) {
        args[i2 - 1] = arguments[i2];
      }
      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length, j;
      for (i2 = 0; i2 < length; i2++) {
        if (listeners[i2].once)
          this.removeListener(event, listeners[i2].fn, void 0, true);
        switch (len) {
          case 1:
            listeners[i2].fn.call(listeners[i2].context);
            break;
          case 2:
            listeners[i2].fn.call(listeners[i2].context, a1);
            break;
          case 3:
            listeners[i2].fn.call(listeners[i2].context, a1, a2);
            break;
          case 4:
            listeners[i2].fn.call(listeners[i2].context, a1, a2, a3);
            break;
          default:
            if (!args)
              for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
            listeners[i2].fn.apply(listeners[i2].context, args);
        }
      }
    }
    return true;
  };
  EventEmitter2.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };
  EventEmitter2.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };
  EventEmitter2.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }
    var listeners = this._events[evt];
    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        clearEvent(this, evt);
      }
    } else {
      for (var i2 = 0, events = [], length = listeners.length; i2 < length; i2++) {
        if (listeners[i2].fn !== fn || once && !listeners[i2].once || context && listeners[i2].context !== context) {
          events.push(listeners[i2]);
        }
      }
      if (events.length)
        this._events[evt] = events.length === 1 ? events[0] : events;
      else
        clearEvent(this, evt);
    }
    return this;
  };
  EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;
    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt])
        clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }
    return this;
  };
  EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
  EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
  EventEmitter2.prefixed = prefix;
  EventEmitter2.EventEmitter = EventEmitter2;
  {
    module.exports = EventEmitter2;
  }
})(eventemitter3);
var EventEmitter = eventemitter3.exports;
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var __assign$1 = function() {
  __assign$1 = Object.assign || function __assign2(t2) {
    for (var s2, i2 = 1, n = arguments.length; i2 < n; i2++) {
      s2 = arguments[i2];
      for (var p in s2)
        if (Object.prototype.hasOwnProperty.call(s2, p))
          t2[p] = s2[p];
    }
    return t2;
  };
  return __assign$1.apply(this, arguments);
};
function __rest(s2, e2) {
  var t2 = {};
  for (var p in s2)
    if (Object.prototype.hasOwnProperty.call(s2, p) && e2.indexOf(p) < 0)
      t2[p] = s2[p];
  if (s2 != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i2 = 0, p = Object.getOwnPropertySymbols(s2); i2 < p.length; i2++) {
      if (e2.indexOf(p[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p[i2]))
        t2[p[i2]] = s2[p[i2]];
    }
  return t2;
}
var prevTime = 0;
var onNextFrame = typeof window !== "undefined" && window.requestAnimationFrame !== void 0 ? function(callback) {
  return window.requestAnimationFrame(callback);
} : function(callback) {
  var timestamp = Date.now();
  var timeToCall = Math.max(0, 16.7 - (timestamp - prevTime));
  prevTime = timestamp + timeToCall;
  setTimeout(function() {
    return callback(prevTime);
  }, timeToCall);
};
var createStep = function(setRunNextFrame) {
  var processToRun = [];
  var processToRunNextFrame = [];
  var numThisFrame = 0;
  var isProcessing2 = false;
  var i2 = 0;
  var cancelled = /* @__PURE__ */ new WeakSet();
  var toKeepAlive = /* @__PURE__ */ new WeakSet();
  var renderStep = {
    cancel: function(process) {
      var indexOfCallback = processToRunNextFrame.indexOf(process);
      cancelled.add(process);
      if (indexOfCallback !== -1) {
        processToRunNextFrame.splice(indexOfCallback, 1);
      }
    },
    process: function(frame2) {
      var _a;
      isProcessing2 = true;
      _a = [processToRunNextFrame, processToRun], processToRun = _a[0], processToRunNextFrame = _a[1];
      processToRunNextFrame.length = 0;
      numThisFrame = processToRun.length;
      if (numThisFrame) {
        var process_1;
        for (i2 = 0; i2 < numThisFrame; i2++) {
          process_1 = processToRun[i2];
          process_1(frame2);
          if (toKeepAlive.has(process_1) === true && !cancelled.has(process_1)) {
            renderStep.schedule(process_1);
            setRunNextFrame(true);
          }
        }
      }
      isProcessing2 = false;
    },
    schedule: function(process, keepAlive, immediate) {
      if (keepAlive === void 0) {
        keepAlive = false;
      }
      if (immediate === void 0) {
        immediate = false;
      }
      var addToCurrentBuffer = immediate && isProcessing2;
      var buffer = addToCurrentBuffer ? processToRun : processToRunNextFrame;
      cancelled.delete(process);
      if (keepAlive)
        toKeepAlive.add(process);
      if (buffer.indexOf(process) === -1) {
        buffer.push(process);
        if (addToCurrentBuffer)
          numThisFrame = processToRun.length;
      }
    }
  };
  return renderStep;
};
var maxElapsed = 40;
var defaultElapsed = 1 / 60 * 1e3;
var useDefaultElapsed = true;
var willRunNextFrame = false;
var isProcessing = false;
var frame = {
  delta: 0,
  timestamp: 0
};
var stepsOrder = ["read", "update", "preRender", "render", "postRender"];
var setWillRunNextFrame = function(willRun) {
  return willRunNextFrame = willRun;
};
var steps = /* @__PURE__ */ stepsOrder.reduce(function(acc, key) {
  acc[key] = createStep(setWillRunNextFrame);
  return acc;
}, {});
var sync = /* @__PURE__ */ stepsOrder.reduce(function(acc, key) {
  var step = steps[key];
  acc[key] = function(process, keepAlive, immediate) {
    if (keepAlive === void 0) {
      keepAlive = false;
    }
    if (immediate === void 0) {
      immediate = false;
    }
    if (!willRunNextFrame)
      startLoop();
    step.schedule(process, keepAlive, immediate);
    return process;
  };
  return acc;
}, {});
var processStep = function(stepId) {
  return steps[stepId].process(frame);
};
var processFrame = function(timestamp) {
  willRunNextFrame = false;
  frame.delta = useDefaultElapsed ? defaultElapsed : Math.max(Math.min(timestamp - frame.timestamp, maxElapsed), 1);
  if (!useDefaultElapsed)
    defaultElapsed = frame.delta;
  frame.timestamp = timestamp;
  isProcessing = true;
  stepsOrder.forEach(processStep);
  isProcessing = false;
  if (willRunNextFrame) {
    useDefaultElapsed = false;
    onNextFrame(processFrame);
  }
};
var startLoop = function() {
  willRunNextFrame = true;
  useDefaultElapsed = true;
  if (!isProcessing)
    onNextFrame(processFrame);
};
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var __assign = function() {
  __assign = Object.assign || function __assign2(t2) {
    for (var s2, i2 = 1, n = arguments.length; i2 < n; i2++) {
      s2 = arguments[i2];
      for (var p in s2)
        if (Object.prototype.hasOwnProperty.call(s2, p))
          t2[p] = s2[p];
    }
    return t2;
  };
  return __assign.apply(this, arguments);
};
var clamp$1 = function(min, max) {
  return function(v) {
    return Math.max(Math.min(v, max), min);
  };
};
var sanitize = function(v) {
  return v % 1 ? Number(v.toFixed(5)) : v;
};
var singleColorRegex = /^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2,3}\s*\/*\s*[\d\.]+%?\))$/i;
var number = {
  test: function(v) {
    return typeof v === "number";
  },
  parse: parseFloat,
  transform: function(v) {
    return v;
  }
};
var alpha = __assign(__assign({}, number), { transform: clamp$1(0, 1) });
var scale = __assign(__assign({}, number), { default: 1 });
var createUnitType = function(unit) {
  return {
    test: function(v) {
      return typeof v === "string" && v.endsWith(unit) && v.split(" ").length === 1;
    },
    parse: parseFloat,
    transform: function(v) {
      return "" + v + unit;
    }
  };
};
var degrees = createUnitType("deg");
var percent = createUnitType("%");
var px = createUnitType("px");
var progressPercentage = __assign(__assign({}, percent), { parse: function(v) {
  return percent.parse(v) / 100;
}, transform: function(v) {
  return percent.transform(v * 100);
} });
var getValueFromFunctionString = function(value) {
  return value.substring(value.indexOf("(") + 1, value.lastIndexOf(")"));
};
var clampRgbUnit = clamp$1(0, 255);
var isRgba = function(v) {
  return v.red !== void 0;
};
var isHsla = function(v) {
  return v.hue !== void 0;
};
function getValuesAsArray(value) {
  return getValueFromFunctionString(value).replace(/(,|\/)/g, " ").split(/ \s*/);
}
var splitColorValues = function(terms) {
  return function(v) {
    if (typeof v !== "string")
      return v;
    var values = {};
    var valuesArray = getValuesAsArray(v);
    for (var i2 = 0; i2 < 4; i2++) {
      values[terms[i2]] = valuesArray[i2] !== void 0 ? parseFloat(valuesArray[i2]) : 1;
    }
    return values;
  };
};
var rgbaTemplate = function(_a) {
  var red = _a.red, green = _a.green, blue = _a.blue, _b = _a.alpha, alpha2 = _b === void 0 ? 1 : _b;
  return "rgba(" + red + ", " + green + ", " + blue + ", " + alpha2 + ")";
};
var hslaTemplate = function(_a) {
  var hue = _a.hue, saturation = _a.saturation, lightness = _a.lightness, _b = _a.alpha, alpha2 = _b === void 0 ? 1 : _b;
  return "hsla(" + hue + ", " + saturation + ", " + lightness + ", " + alpha2 + ")";
};
var rgbUnit = __assign(__assign({}, number), { transform: function(v) {
  return Math.round(clampRgbUnit(v));
} });
function isColorString(color2, colorType) {
  return color2.startsWith(colorType) && singleColorRegex.test(color2);
}
var rgba = {
  test: function(v) {
    return typeof v === "string" ? isColorString(v, "rgb") : isRgba(v);
  },
  parse: splitColorValues(["red", "green", "blue", "alpha"]),
  transform: function(_a) {
    var red = _a.red, green = _a.green, blue = _a.blue, _b = _a.alpha, alpha$1 = _b === void 0 ? 1 : _b;
    return rgbaTemplate({
      red: rgbUnit.transform(red),
      green: rgbUnit.transform(green),
      blue: rgbUnit.transform(blue),
      alpha: sanitize(alpha.transform(alpha$1))
    });
  }
};
var hsla = {
  test: function(v) {
    return typeof v === "string" ? isColorString(v, "hsl") : isHsla(v);
  },
  parse: splitColorValues(["hue", "saturation", "lightness", "alpha"]),
  transform: function(_a) {
    var hue = _a.hue, saturation = _a.saturation, lightness = _a.lightness, _b = _a.alpha, alpha$1 = _b === void 0 ? 1 : _b;
    return hslaTemplate({
      hue: Math.round(hue),
      saturation: percent.transform(sanitize(saturation)),
      lightness: percent.transform(sanitize(lightness)),
      alpha: sanitize(alpha.transform(alpha$1))
    });
  }
};
var hex = __assign(__assign({}, rgba), { test: function(v) {
  return typeof v === "string" && isColorString(v, "#");
}, parse: function(v) {
  var r2 = "";
  var g = "";
  var b = "";
  if (v.length > 4) {
    r2 = v.substr(1, 2);
    g = v.substr(3, 2);
    b = v.substr(5, 2);
  } else {
    r2 = v.substr(1, 1);
    g = v.substr(2, 1);
    b = v.substr(3, 1);
    r2 += r2;
    g += g;
    b += b;
  }
  return {
    red: parseInt(r2, 16),
    green: parseInt(g, 16),
    blue: parseInt(b, 16),
    alpha: 1
  };
} });
var color = {
  test: function(v) {
    return typeof v === "string" && singleColorRegex.test(v) || isRgba(v) || isHsla(v);
  },
  parse: function(v) {
    if (rgba.test(v)) {
      return rgba.parse(v);
    } else if (hsla.test(v)) {
      return hsla.parse(v);
    } else if (hex.test(v)) {
      return hex.parse(v);
    }
    return v;
  },
  transform: function(v) {
    if (isRgba(v)) {
      return rgba.transform(v);
    } else if (isHsla(v)) {
      return hsla.transform(v);
    }
    return v;
  }
};
var createStyler = function(_a) {
  var onRead2 = _a.onRead, onRender2 = _a.onRender, _b = _a.uncachedValues, uncachedValues = _b === void 0 ? /* @__PURE__ */ new Set() : _b, _c = _a.useCache, useCache = _c === void 0 ? true : _c;
  return function(_a2) {
    if (_a2 === void 0) {
      _a2 = {};
    }
    var props = __rest(_a2, []);
    var state = {};
    var changedValues = [];
    var hasChanged = false;
    function setValue(key, value) {
      if (key.startsWith("--")) {
        props.hasCSSVariable = true;
      }
      var currentValue = state[key];
      state[key] = value;
      if (state[key] === currentValue)
        return;
      if (changedValues.indexOf(key) === -1) {
        changedValues.push(key);
      }
      if (!hasChanged) {
        hasChanged = true;
        sync.render(styler.render);
      }
    }
    var styler = {
      get: function(key, forceRead) {
        if (forceRead === void 0) {
          forceRead = false;
        }
        var useCached = !forceRead && useCache && !uncachedValues.has(key) && state[key] !== void 0;
        return useCached ? state[key] : onRead2(key, props);
      },
      set: function(values, value) {
        if (typeof values === "string") {
          setValue(values, value);
        } else {
          for (var key in values) {
            setValue(key, values[key]);
          }
        }
        return this;
      },
      render: function(forceRender) {
        if (forceRender === void 0) {
          forceRender = false;
        }
        if (hasChanged || forceRender === true) {
          onRender2(state, props, changedValues);
          hasChanged = false;
          changedValues.length = 0;
        }
        return this;
      }
    };
    return styler;
  };
};
var CAMEL_CASE_PATTERN = /([a-z])([A-Z])/g;
var REPLACE_TEMPLATE = "$1-$2";
var camelToDash = function(str) {
  return str.replace(CAMEL_CASE_PATTERN, REPLACE_TEMPLATE).toLowerCase();
};
var camelCache = /* @__PURE__ */ new Map();
var dashCache = /* @__PURE__ */ new Map();
var prefixes = ["Webkit", "Moz", "O", "ms", ""];
var numPrefixes = prefixes.length;
var isBrowser = typeof document !== "undefined";
var testElement;
var setDashPrefix = function(key, prefixed) {
  return dashCache.set(key, camelToDash(prefixed));
};
var testPrefix = function(key) {
  testElement = testElement || document.createElement("div");
  for (var i2 = 0; i2 < numPrefixes; i2++) {
    var prefix = prefixes[i2];
    var noPrefix = prefix === "";
    var prefixedPropertyName = noPrefix ? key : prefix + key.charAt(0).toUpperCase() + key.slice(1);
    if (prefixedPropertyName in testElement.style || noPrefix) {
      if (noPrefix && key === "clipPath" && dashCache.has(key)) {
        return;
      }
      camelCache.set(key, prefixedPropertyName);
      setDashPrefix(key, (noPrefix ? "" : "-") + camelToDash(prefixedPropertyName));
    }
  }
};
var setServerProperty = function(key) {
  return setDashPrefix(key, key);
};
var prefixer = function(key, asDashCase) {
  if (asDashCase === void 0) {
    asDashCase = false;
  }
  var cache2 = asDashCase ? dashCache : camelCache;
  if (!cache2.has(key)) {
    isBrowser ? testPrefix(key) : setServerProperty(key);
  }
  return cache2.get(key) || key;
};
var axes = ["", "X", "Y", "Z"];
var order = ["translate", "scale", "rotate", "skew", "transformPerspective"];
var transformProps = /* @__PURE__ */ order.reduce(function(acc, key) {
  return axes.reduce(function(axesAcc, axesKey) {
    axesAcc.push(key + axesKey);
    return axesAcc;
  }, acc);
}, ["x", "y", "z"]);
var transformPropDictionary = /* @__PURE__ */ transformProps.reduce(function(dict, key) {
  dict[key] = true;
  return dict;
}, {});
function isTransformProp(key) {
  return transformPropDictionary[key] === true;
}
function sortTransformProps(a, b) {
  return transformProps.indexOf(a) - transformProps.indexOf(b);
}
var transformOriginProps = /* @__PURE__ */ new Set(["originX", "originY", "originZ"]);
function isTransformOriginProp(key) {
  return transformOriginProps.has(key);
}
var int = /* @__PURE__ */ __assign$1(/* @__PURE__ */ __assign$1({}, number), { transform: Math.round });
var valueTypes = {
  color,
  backgroundColor: color,
  outlineColor: color,
  fill: color,
  stroke: color,
  borderColor: color,
  borderTopColor: color,
  borderRightColor: color,
  borderBottomColor: color,
  borderLeftColor: color,
  borderWidth: px,
  borderTopWidth: px,
  borderRightWidth: px,
  borderBottomWidth: px,
  borderLeftWidth: px,
  borderRadius: px,
  radius: px,
  borderTopLeftRadius: px,
  borderTopRightRadius: px,
  borderBottomRightRadius: px,
  borderBottomLeftRadius: px,
  width: px,
  maxWidth: px,
  height: px,
  maxHeight: px,
  size: px,
  top: px,
  right: px,
  bottom: px,
  left: px,
  padding: px,
  paddingTop: px,
  paddingRight: px,
  paddingBottom: px,
  paddingLeft: px,
  margin: px,
  marginTop: px,
  marginRight: px,
  marginBottom: px,
  marginLeft: px,
  rotate: degrees,
  rotateX: degrees,
  rotateY: degrees,
  rotateZ: degrees,
  scale,
  scaleX: scale,
  scaleY: scale,
  scaleZ: scale,
  skew: degrees,
  skewX: degrees,
  skewY: degrees,
  distance: px,
  translateX: px,
  translateY: px,
  translateZ: px,
  x: px,
  y: px,
  z: px,
  perspective: px,
  opacity: alpha,
  originX: progressPercentage,
  originY: progressPercentage,
  originZ: px,
  zIndex: int,
  fillOpacity: alpha,
  strokeOpacity: alpha,
  numOctaves: int
};
var getValueType = function(key) {
  return valueTypes[key];
};
var getValueAsType = function(value, type) {
  return type && typeof value === "number" ? type.transform(value) : value;
};
var SCROLL_LEFT = "scrollLeft";
var SCROLL_TOP = "scrollTop";
var scrollKeys = /* @__PURE__ */ new Set([SCROLL_LEFT, SCROLL_TOP]);
var blacklist = /* @__PURE__ */ new Set([SCROLL_LEFT, SCROLL_TOP, "transform"]);
var translateAlias = {
  x: "translateX",
  y: "translateY",
  z: "translateZ"
};
function isCustomTemplate(v) {
  return typeof v === "function";
}
function buildTransform(state, transform, transformKeys, transformIsDefault, enableHardwareAcceleration, allowTransformNone) {
  if (allowTransformNone === void 0) {
    allowTransformNone = true;
  }
  var transformString = "";
  var transformHasZ = false;
  transformKeys.sort(sortTransformProps);
  var numTransformKeys = transformKeys.length;
  for (var i2 = 0; i2 < numTransformKeys; i2++) {
    var key = transformKeys[i2];
    transformString += (translateAlias[key] || key) + "(" + transform[key] + ") ";
    transformHasZ = key === "z" ? true : transformHasZ;
  }
  if (!transformHasZ && enableHardwareAcceleration) {
    transformString += "translateZ(0)";
  } else {
    transformString = transformString.trim();
  }
  if (isCustomTemplate(state.transform)) {
    transformString = state.transform(transform, transformIsDefault ? "" : transformString);
  } else if (allowTransformNone && transformIsDefault) {
    transformString = "none";
  }
  return transformString;
}
function buildStyleProperty(state, enableHardwareAcceleration, styles, transform, transformOrigin, transformKeys, isDashCase, allowTransformNone) {
  if (enableHardwareAcceleration === void 0) {
    enableHardwareAcceleration = true;
  }
  if (styles === void 0) {
    styles = {};
  }
  if (transform === void 0) {
    transform = {};
  }
  if (transformOrigin === void 0) {
    transformOrigin = {};
  }
  if (transformKeys === void 0) {
    transformKeys = [];
  }
  if (isDashCase === void 0) {
    isDashCase = false;
  }
  if (allowTransformNone === void 0) {
    allowTransformNone = true;
  }
  var transformIsDefault = true;
  var hasTransform = false;
  var hasTransformOrigin = false;
  for (var key in state) {
    var value = state[key];
    var valueType = getValueType(key);
    var valueAsType = getValueAsType(value, valueType);
    if (isTransformProp(key)) {
      hasTransform = true;
      transform[key] = valueAsType;
      transformKeys.push(key);
      if (transformIsDefault) {
        if (valueType.default && value !== valueType.default || !valueType.default && value !== 0) {
          transformIsDefault = false;
        }
      }
    } else if (isTransformOriginProp(key)) {
      transformOrigin[key] = valueAsType;
      hasTransformOrigin = true;
    } else if (!blacklist.has(key) || !isCustomTemplate(valueAsType)) {
      styles[prefixer(key, isDashCase)] = valueAsType;
    }
  }
  if (hasTransform || typeof state.transform === "function") {
    styles.transform = buildTransform(state, transform, transformKeys, transformIsDefault, enableHardwareAcceleration, allowTransformNone);
  }
  if (hasTransformOrigin) {
    styles.transformOrigin = (transformOrigin.originX || "50%") + " " + (transformOrigin.originY || "50%") + " " + (transformOrigin.originZ || 0);
  }
  return styles;
}
function createStyleBuilder(_a) {
  var _b = _a === void 0 ? {} : _a, _c = _b.enableHardwareAcceleration, enableHardwareAcceleration = _c === void 0 ? true : _c, _d = _b.isDashCase, isDashCase = _d === void 0 ? true : _d, _e = _b.allowTransformNone, allowTransformNone = _e === void 0 ? true : _e;
  var styles = {};
  var transform = {};
  var transformOrigin = {};
  var transformKeys = [];
  return function(state) {
    transformKeys.length = 0;
    buildStyleProperty(state, enableHardwareAcceleration, styles, transform, transformOrigin, transformKeys, isDashCase, allowTransformNone);
    return styles;
  };
}
function onRead(key, options) {
  var element = options.element, preparseOutput = options.preparseOutput;
  var defaultValueType = getValueType(key);
  if (isTransformProp(key)) {
    return defaultValueType ? defaultValueType.default || 0 : 0;
  } else if (scrollKeys.has(key)) {
    return element[key];
  } else {
    var domValue = window.getComputedStyle(element, null).getPropertyValue(prefixer(key, true)) || 0;
    return preparseOutput && defaultValueType && defaultValueType.test(domValue) && defaultValueType.parse ? defaultValueType.parse(domValue) : domValue;
  }
}
function onRender(state, _a, changedValues) {
  var element = _a.element, buildStyles = _a.buildStyles, hasCSSVariable = _a.hasCSSVariable;
  Object.assign(element.style, buildStyles(state));
  if (hasCSSVariable) {
    var numChangedValues = changedValues.length;
    for (var i2 = 0; i2 < numChangedValues; i2++) {
      var key = changedValues[i2];
      if (key.startsWith("--")) {
        element.style.setProperty(key, state[key]);
      }
    }
  }
  if (changedValues.indexOf(SCROLL_LEFT) !== -1) {
    element[SCROLL_LEFT] = state[SCROLL_LEFT];
  }
  if (changedValues.indexOf(SCROLL_TOP) !== -1) {
    element[SCROLL_TOP] = state[SCROLL_TOP];
  }
}
var cssStyler = /* @__PURE__ */ createStyler({
  onRead,
  onRender,
  uncachedValues: scrollKeys
});
function createCssStyler(element, _a) {
  if (_a === void 0) {
    _a = {};
  }
  var enableHardwareAcceleration = _a.enableHardwareAcceleration, allowTransformNone = _a.allowTransformNone, props = __rest(_a, ["enableHardwareAcceleration", "allowTransformNone"]);
  return cssStyler(__assign$1({ element, buildStyles: createStyleBuilder({
    enableHardwareAcceleration,
    allowTransformNone
  }), preparseOutput: true }, props));
}
var camelCaseAttributes = /* @__PURE__ */ new Set(["baseFrequency", "diffuseConstant", "kernelMatrix", "kernelUnitLength", "keySplines", "keyTimes", "limitingConeAngle", "markerHeight", "markerWidth", "numOctaves", "targetX", "targetY", "surfaceScale", "specularConstant", "specularExponent", "stdDeviation", "tableValues"]);
var defaultOrigin = 0.5;
var svgAttrsTemplate = function() {
  return {
    style: {}
  };
};
var progressToPixels = function(progress, length) {
  return px.transform(progress * length);
};
var unmeasured = { x: 0, y: 0, width: 0, height: 0 };
function calcOrigin(origin, offset, size) {
  return typeof origin === "string" ? origin : px.transform(offset + size * origin);
}
function calculateSVGTransformOrigin(dimensions, originX, originY) {
  return calcOrigin(originX, dimensions.x, dimensions.width) + " " + calcOrigin(originY, dimensions.y, dimensions.height);
}
var svgStyleConfig = {
  enableHardwareAcceleration: false,
  isDashCase: false
};
function buildSVGAttrs(_a, dimensions, totalPathLength, cssBuilder, attrs, isDashCase) {
  if (dimensions === void 0) {
    dimensions = unmeasured;
  }
  if (cssBuilder === void 0) {
    cssBuilder = createStyleBuilder(svgStyleConfig);
  }
  if (attrs === void 0) {
    attrs = svgAttrsTemplate();
  }
  if (isDashCase === void 0) {
    isDashCase = true;
  }
  var attrX = _a.attrX, attrY = _a.attrY, originX = _a.originX, originY = _a.originY, pathLength = _a.pathLength, _b = _a.pathSpacing, pathSpacing = _b === void 0 ? 1 : _b, _c = _a.pathOffset, pathOffset = _c === void 0 ? 0 : _c, state = __rest(_a, ["attrX", "attrY", "originX", "originY", "pathLength", "pathSpacing", "pathOffset"]);
  var style2 = cssBuilder(state);
  for (var key in style2) {
    if (key === "transform") {
      attrs.style.transform = style2[key];
    } else {
      var attrKey = isDashCase && !camelCaseAttributes.has(key) ? camelToDash(key) : key;
      attrs[attrKey] = style2[key];
    }
  }
  if (originX !== void 0 || originY !== void 0 || style2.transform) {
    attrs.style.transformOrigin = calculateSVGTransformOrigin(dimensions, originX !== void 0 ? originX : defaultOrigin, originY !== void 0 ? originY : defaultOrigin);
  }
  if (attrX !== void 0)
    attrs.x = attrX;
  if (attrY !== void 0)
    attrs.y = attrY;
  if (totalPathLength !== void 0 && pathLength !== void 0) {
    attrs[isDashCase ? "stroke-dashoffset" : "strokeDashoffset"] = progressToPixels(-pathOffset, totalPathLength);
    attrs[isDashCase ? "stroke-dasharray" : "strokeDasharray"] = progressToPixels(pathLength, totalPathLength) + " " + progressToPixels(pathSpacing, totalPathLength);
  }
  return attrs;
}
function createAttrBuilder(dimensions, totalPathLength, isDashCase) {
  if (isDashCase === void 0) {
    isDashCase = true;
  }
  var attrs = svgAttrsTemplate();
  var cssBuilder = createStyleBuilder(svgStyleConfig);
  return function(state) {
    return buildSVGAttrs(state, dimensions, totalPathLength, cssBuilder, attrs, isDashCase);
  };
}
var getDimensions = function(element) {
  return typeof element.getBBox === "function" ? element.getBBox() : element.getBoundingClientRect();
};
var getSVGElementDimensions = function(element) {
  try {
    return getDimensions(element);
  } catch (e2) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
};
var isPath = function(element) {
  return element.tagName === "path";
};
var svgStyler = /* @__PURE__ */ createStyler({
  onRead: function(key, _a) {
    var element = _a.element;
    key = !camelCaseAttributes.has(key) ? camelToDash(key) : key;
    if (!isTransformProp(key)) {
      return element.getAttribute(key);
    } else {
      var valueType = getValueType(key);
      return valueType ? valueType.default || 0 : 0;
    }
  },
  onRender: function(state, _a) {
    var element = _a.element, buildAttrs = _a.buildAttrs;
    var attrs = buildAttrs(state);
    for (var key in attrs) {
      if (key === "style") {
        Object.assign(element.style, attrs.style);
      } else {
        element.setAttribute(key, attrs[key]);
      }
    }
  }
});
var svg = function(element) {
  var dimensions = getSVGElementDimensions(element);
  var pathLength = isPath(element) && element.getTotalLength ? element.getTotalLength() : void 0;
  return svgStyler({
    element,
    buildAttrs: createAttrBuilder(dimensions, pathLength)
  });
};
var viewport = /* @__PURE__ */ createStyler({
  useCache: false,
  onRead: function(key) {
    return key === "scrollTop" ? window.pageYOffset : window.pageXOffset;
  },
  onRender: function(_a) {
    var _b = _a.scrollTop, scrollTop = _b === void 0 ? 0 : _b, _c = _a.scrollLeft, scrollLeft = _c === void 0 ? 0 : _c;
    return window.scrollTo(scrollLeft, scrollTop);
  }
});
var cache = /* @__PURE__ */ new WeakMap();
var isHTMLElement = function(node) {
  return node instanceof HTMLElement || typeof node.click === "function";
};
var isSVGElement = function(node) {
  return node instanceof SVGElement || "ownerSVGElement" in node;
};
var createDOMStyler = function(node, props) {
  var styler;
  if (node === window) {
    styler = viewport(node);
  } else if (isHTMLElement(node)) {
    styler = createCssStyler(node, props);
  } else if (isSVGElement(node)) {
    styler = svg(node);
  }
  cache.set(node, styler);
  return styler;
};
var getStyler = function(node, props) {
  return cache.has(node) ? cache.get(node) : createDOMStyler(node, props);
};
function index(nodeOrSelector, props) {
  var node = typeof nodeOrSelector === "string" ? document.querySelector(nodeOrSelector) : nodeOrSelector;
  return getStyler(node, props);
}
var shallowequal = function shallowEqual(objA, objB, compare, compareContext) {
  var ret = compare ? compare.call(compareContext, objA, objB) : void 0;
  if (ret !== void 0) {
    return !!ret;
  }
  if (objA === objB) {
    return true;
  }
  if (typeof objA !== "object" || !objA || typeof objB !== "object" || !objB) {
    return false;
  }
  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
  for (var idx = 0; idx < keysA.length; idx++) {
    var key = keysA[idx];
    if (!bHasOwnProperty(key)) {
      return false;
    }
    var valueA = objA[key];
    var valueB = objB[key];
    ret = compare ? compare.call(compareContext, valueA, valueB, key) : void 0;
    if (ret === false || ret === void 0 && valueA !== valueB) {
      return false;
    }
  }
  return true;
};
const e$1 = "!#%()*+,-./:;=?@[]^_`{|}~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", s$1 = e$1.length, t$1 = Array(20), r$1 = () => {
  for (let r2 = 0; r2 < 20; r2++)
    t$1[r2] = e$1.charAt(Math.random() * s$1);
  return t$1.join("");
};
class o {
  constructor() {
    this.disposers = /* @__PURE__ */ new Map();
  }
  add(e2, s2 = r$1()) {
    return this.flush(s2), this.disposers.set(s2, e2()), s2;
  }
  addDisposer(e2, s2 = r$1()) {
    return this.flush(s2), this.disposers.set(s2, e2), s2;
  }
  addEventListener(e2, s2, t2, o2, i2 = r$1()) {
    return this.add(() => (e2.addEventListener(s2, t2, o2), () => e2.removeEventListener(s2, t2, o2)), i2), i2;
  }
  setTimeout(e2, s2, t2 = r$1()) {
    return this.add(() => {
      const r2 = window.setTimeout(() => {
        this.remove(t2), e2();
      }, s2);
      return () => window.clearTimeout(r2);
    }, t2);
  }
  setInterval(e2, s2, t2 = r$1()) {
    return this.add(() => {
      const t3 = window.setInterval(e2, s2);
      return () => window.clearInterval(t3);
    }, t2);
  }
  remove(e2) {
    const s2 = this.disposers.get(e2);
    return this.disposers.delete(e2), s2;
  }
  flush(e2) {
    const s2 = this.remove(e2);
    if (s2)
      try {
        s2();
      } catch (t2) {
        console.error(t2);
      }
  }
  flushAll() {
    this.disposers.forEach((e2) => {
      try {
        e2();
      } catch (s2) {
        console.error(s2);
      }
    }), this.disposers.clear();
  }
}
var e = Object.defineProperty, s = ("undefined" != typeof require && require, (s2, r2, t2) => (((s3, r3, t3) => {
  r3 in s3 ? e(s3, r3, { enumerable: true, configurable: true, writable: true, value: t3 }) : s3[r3] = t3;
})(s2, "symbol" != typeof r2 ? r2 + "" : r2, t2), t2));
class r {
  constructor(e2, r2) {
    s(this, "_value"), s(this, "_beforeDestroys"), s(this, "_subscribers"), this._value = e2, r2 && (this.compare = r2);
  }
  get value() {
    return this._value;
  }
  setValue(e2, s2) {
    if (!this.compare(e2, this._value)) {
      const r2 = this._value;
      this._value = e2, this._subscribers && this._subscribers.forEach((t2) => t2(e2, r2, s2));
    }
  }
  reaction(e2) {
    return this._subscribers || (this._subscribers = /* @__PURE__ */ new Set()), this._subscribers.add(e2), () => {
      this._subscribers && this._subscribers.delete(e2);
    };
  }
  subscribe(e2, s2) {
    const r2 = this.reaction(e2);
    return e2(this._value, void 0, s2), r2;
  }
  derive(e2, s2, t2) {
    const i2 = new r(e2(this.value, void 0, t2), s2), o2 = this.reaction((s3, r2, t3) => {
      i2.setValue(e2(s3, r2, t3));
    });
    return i2.addBeforeDestroy(o2), i2;
  }
  destroy() {
    this._beforeDestroys && (this._beforeDestroys.forEach((e2) => e2()), this._beforeDestroys.clear()), this._subscribers && this._subscribers.clear();
  }
  addBeforeDestroy(e2) {
    return this._beforeDestroys || (this._beforeDestroys = /* @__PURE__ */ new Set()), this._beforeDestroys.add(e2), () => {
      this._beforeDestroys && this._beforeDestroys.delete(e2);
    };
  }
  compare(e2, s2) {
    return e2 === s2;
  }
}
function t(e2, s2, t2, i2) {
  let o2 = e2.map((e3) => e3.value);
  const u2 = new r(s2(o2, void 0, i2), t2);
  return e2.forEach((e3, r2) => {
    const t3 = e3.reaction((e4, t4, i3) => {
      const c2 = o2.slice();
      c2[r2] = e4;
      const n = o2;
      o2 = c2, u2.setValue(s2(c2, n, i3), i3);
    });
    u2.addBeforeDestroy(t3);
  }), u2;
}
function i(e2, s2) {
  Object.keys(s2).forEach((r2) => {
    u(e2, r2, s2[r2]);
  });
}
function u(e2, s2, r2) {
  var t2;
  return Object.defineProperties(e2, { [s2]: { get: () => r2.value }, [`_${s2}$`]: { value: r2 }, [`set${t2 = s2, t2[0].toUpperCase() + t2.slice(1)}`]: { value: (e3, s3) => r2.setValue(e3, s3) } }), e2;
}
function c(e2) {
  const s2 = (s3) => {
    const r2 = e2.addDisposer(() => {
      s3.destroy();
    });
    return s3.addBeforeDestroy(() => {
      e2.remove(r2);
    }), s3;
  };
  return { bindSideEffect: s2, combine: (e3, r2, i2, o2) => s2(t(e3, r2, i2, o2)), createVal: (e3, t2) => s2(new r(e3, t2)) };
}
var style$2 = "";
var TELE_BOX_COLOR_SCHEME = /* @__PURE__ */ ((TELE_BOX_COLOR_SCHEME2) => {
  TELE_BOX_COLOR_SCHEME2["Light"] = "light";
  TELE_BOX_COLOR_SCHEME2["Dark"] = "dark";
  TELE_BOX_COLOR_SCHEME2["Auto"] = "auto";
  return TELE_BOX_COLOR_SCHEME2;
})(TELE_BOX_COLOR_SCHEME || {});
var TELE_BOX_STATE = /* @__PURE__ */ ((TELE_BOX_STATE2) => {
  TELE_BOX_STATE2["Normal"] = "normal";
  TELE_BOX_STATE2["Minimized"] = "minimized";
  TELE_BOX_STATE2["Maximized"] = "maximized";
  return TELE_BOX_STATE2;
})(TELE_BOX_STATE || {});
var TELE_BOX_EVENT = /* @__PURE__ */ ((TELE_BOX_EVENT2) => {
  TELE_BOX_EVENT2["DarkMode"] = "dark_mode";
  TELE_BOX_EVENT2["PrefersColorScheme"] = "prefers_color_scheme";
  TELE_BOX_EVENT2["Close"] = "close";
  TELE_BOX_EVENT2["Focus"] = "focus";
  TELE_BOX_EVENT2["Blur"] = "blur";
  TELE_BOX_EVENT2["Move"] = "move";
  TELE_BOX_EVENT2["Resize"] = "resize";
  TELE_BOX_EVENT2["IntrinsicMove"] = "intrinsic_move";
  TELE_BOX_EVENT2["IntrinsicResize"] = "intrinsic_resize";
  TELE_BOX_EVENT2["VisualResize"] = "visual_resize";
  TELE_BOX_EVENT2["ZIndex"] = "z_index";
  TELE_BOX_EVENT2["State"] = "state";
  TELE_BOX_EVENT2["Minimized"] = "minimized";
  TELE_BOX_EVENT2["Maximized"] = "maximized";
  TELE_BOX_EVENT2["Readonly"] = "readonly";
  TELE_BOX_EVENT2["Destroyed"] = "destroyed";
  return TELE_BOX_EVENT2;
})(TELE_BOX_EVENT || {});
var TELE_BOX_DELEGATE_EVENT = /* @__PURE__ */ ((TELE_BOX_DELEGATE_EVENT2) => {
  TELE_BOX_DELEGATE_EVENT2["Close"] = "close";
  TELE_BOX_DELEGATE_EVENT2["Maximize"] = "maximize";
  TELE_BOX_DELEGATE_EVENT2["Minimize"] = "minimize";
  return TELE_BOX_DELEGATE_EVENT2;
})(TELE_BOX_DELEGATE_EVENT || {});
var TELE_BOX_RESIZE_HANDLE = /* @__PURE__ */ ((TELE_BOX_RESIZE_HANDLE2) => {
  TELE_BOX_RESIZE_HANDLE2["North"] = "n";
  TELE_BOX_RESIZE_HANDLE2["South"] = "s";
  TELE_BOX_RESIZE_HANDLE2["West"] = "w";
  TELE_BOX_RESIZE_HANDLE2["East"] = "e";
  TELE_BOX_RESIZE_HANDLE2["NorthWest"] = "nw";
  TELE_BOX_RESIZE_HANDLE2["NorthEast"] = "ne";
  TELE_BOX_RESIZE_HANDLE2["SouthEast"] = "se";
  TELE_BOX_RESIZE_HANDLE2["SouthWest"] = "sw";
  return TELE_BOX_RESIZE_HANDLE2;
})(TELE_BOX_RESIZE_HANDLE || {});
const TeleBoxDragHandleType = "dh";
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function preventEvent(ev) {
  ev.stopPropagation();
  if (ev.cancelable) {
    ev.preventDefault();
  }
}
let defaultBoxCount = 1;
function getBoxDefaultName() {
  return `New Box ${defaultBoxCount++}`;
}
function isTruthy(value) {
  return Boolean(value);
}
function isFalsy(value) {
  return !value;
}
function uniqueByVal(arr) {
  return arr.reduce((acc, item) => {
    if (!acc.includes(item))
      acc.push(item);
    return acc;
  }, []);
}
function removeByVal(arr, val) {
  const index2 = arr.indexOf(val);
  if (index2 < 0) {
    return arr;
  }
  const newArr = [...arr];
  newArr.splice(index2, 1);
  return newArr;
}
function excludeFromBoth(c2, a, b) {
  const aSet = new Set(a);
  const bSet = new Set(b);
  return c2.filter((item) => !aSet.has(item) && !bSet.has(item));
}
const isIOS = () => {
  return typeof navigator !== "undefined" && typeof window !== "undefined" && /iPad|iPhone|iPod/.test(window.navigator.userAgent);
};
const isAndroid = () => {
  return typeof navigator !== "undefined" && /Android/.test(window.navigator.userAgent);
};
function flattenEvent(ev) {
  return ev.touches ? ev.touches[0] : ev;
}
function genUniqueKey() {
  return Date.now().toString().slice(6) + Math.random().toString().slice(2, 8);
}
class DefaultTitleBar {
  constructor({
    readonly = false,
    title,
    buttons,
    onEvent,
    onDragStart,
    namespace = "telebox",
    state = TELE_BOX_STATE.Normal,
    appReadonly = false
  } = {}) {
    this.$btns = [];
    this.sideEffect = new o();
    this.lastTitleBarClick = {
      timestamp: 0,
      clientX: -100,
      clientY: -100
    };
    this.handleTitleBarClick = (ev) => {
      var _a;
      if (this.readonly) {
        return;
      }
      if (ev.button !== 0) {
        return;
      }
      if ((_a = ev.target.dataset) == null ? void 0 : _a.teleTitleBarNoDblClick) {
        return;
      }
      preventEvent(ev);
      const now = Date.now();
      if (now - this.lastTitleBarClick.timestamp <= 500) {
        if (Math.abs(ev.clientX - this.lastTitleBarClick.clientX) <= 5 && Math.abs(ev.clientY - this.lastTitleBarClick.clientY) <= 5) {
          if (this.onEvent) {
            this.onEvent({ type: TELE_BOX_DELEGATE_EVENT.Maximize });
          }
        }
      } else if (this.onDragStart) {
        this.onDragStart(ev);
      }
      this.lastTitleBarClick.timestamp = now;
      this.lastTitleBarClick.clientX = ev.clientX;
      this.lastTitleBarClick.clientY = ev.clientY;
    };
    this.lastTitleBarTouch = {
      timestamp: 0,
      clientX: -100,
      clientY: -100
    };
    this.handleTitleBarTouch = (ev) => {
      var _a;
      if (this.readonly) {
        return;
      }
      if ((_a = ev.target.dataset) == null ? void 0 : _a.teleTitleBarNoDblClick) {
        return;
      }
      preventEvent(ev);
      const now = Date.now();
      const {
        clientX = this.lastTitleBarTouch.clientX + 100,
        clientY = this.lastTitleBarTouch.clientY + 100
      } = ev.touches[0] || {};
      if (now - this.lastTitleBarTouch.timestamp <= 500) {
        if (Math.abs(clientX - this.lastTitleBarTouch.clientX) <= 10 && Math.abs(clientY - this.lastTitleBarTouch.clientY) <= 10) {
          if (this.onEvent) {
            this.onEvent({ type: TELE_BOX_DELEGATE_EVENT.Maximize });
          }
        }
      } else if (this.onDragStart) {
        this.onDragStart(ev);
      }
      this.lastTitleBarTouch.timestamp = now;
      this.lastTitleBarTouch.clientX = clientX;
      this.lastTitleBarTouch.clientY = clientY;
    };
    this.readonly = readonly;
    this.onEvent = onEvent;
    this.onDragStart = onDragStart;
    this.namespace = namespace;
    this.title = title;
    this.state = state;
    this.appReadonly = appReadonly;
    this.buttons = buttons || [
      {
        type: TELE_BOX_DELEGATE_EVENT.Minimize,
        iconClassName: this.wrapClassName("titlebar-icon-minimize")
      },
      {
        type: TELE_BOX_DELEGATE_EVENT.Maximize,
        iconClassName: this.wrapClassName("titlebar-icon-maximize"),
        isActive: (state2) => state2 === TELE_BOX_STATE.Maximized
      },
      {
        type: TELE_BOX_DELEGATE_EVENT.Close,
        iconClassName: this.wrapClassName("titlebar-icon-close")
      }
    ];
    this.$dragArea = this.renderDragArea();
  }
  setTitle(title) {
    this.title = title;
    if (this.$title) {
      this.$title.textContent = title;
      this.$title.title = title;
    }
  }
  setState(state) {
    if (this.state !== state) {
      this.state = state;
      this.buttons.forEach((btn, i2) => {
        if (btn.isActive) {
          this.$btns[i2].classList.toggle(
            "is-active",
            btn.isActive(state)
          );
        }
      });
    }
  }
  setReadonly(readonly) {
    var _a;
    if (this.readonly !== readonly) {
      this.readonly = readonly;
      (_a = this.$buttonsContainer) == null ? void 0 : _a.classList.toggle(this.wrapClassName("titlebar-btns-disable"), Boolean(isAndroid() || isIOS() || this.readonly));
    }
  }
  render() {
    if (!this.$titleBar) {
      this.$titleBar = document.createElement("div");
      this.$titleBar.className = this.wrapClassName("titlebar");
      const $titleArea = document.createElement("div");
      $titleArea.className = this.wrapClassName("title-area");
      $titleArea.dataset.teleBoxHandle = TeleBoxDragHandleType;
      this.$title = document.createElement("h1");
      this.$title.className = this.wrapClassName("title");
      this.$title.dataset.teleBoxHandle = TeleBoxDragHandleType;
      if (this.title) {
        this.$title.textContent = this.title;
        this.$title.title = this.title;
      }
      $titleArea.appendChild(this.$title);
      $titleArea.appendChild(this.$dragArea);
      const $buttonsContainer = document.createElement("div");
      $buttonsContainer.className = this.wrapClassName("titlebar-btns");
      $buttonsContainer.classList.toggle(this.wrapClassName("titlebar-btns-disable"), isAndroid() || isIOS() || this.readonly);
      this.buttons.forEach(({ iconClassName, isActive }, i2) => {
        const teleTitleBarBtnIndex = String(i2);
        const $btn = document.createElement("button");
        $btn.className = `${this.wrapClassName(
          "titlebar-btn"
        )} ${iconClassName}`;
        $btn.dataset.teleTitleBarBtnIndex = teleTitleBarBtnIndex;
        $btn.dataset.teleTitleBarNoDblClick = "true";
        if (isActive) {
          $btn.classList.toggle("is-active", isActive(this.state));
        }
        this.$btns.push($btn);
        $buttonsContainer.appendChild($btn);
      });
      this.sideEffect.addEventListener(
        $buttonsContainer,
        "click",
        (ev) => {
          var _a;
          if (this.readonly) {
            return;
          }
          const target = ev.target;
          const teleTitleBarBtnIndex = Number(
            (_a = target.dataset) == null ? void 0 : _a.teleTitleBarBtnIndex
          );
          if (!Number.isNaN(teleTitleBarBtnIndex) && teleTitleBarBtnIndex < this.buttons.length) {
            preventEvent(ev);
            const btn = this.buttons[teleTitleBarBtnIndex];
            if (this.onEvent) {
              this.onEvent({
                type: btn.type,
                value: btn.value
              });
            }
          }
        }
      );
      this.$buttonsContainer = $buttonsContainer;
      this.$titleBar.appendChild($titleArea);
      this.$titleBar.appendChild($buttonsContainer);
    }
    return this.$titleBar;
  }
  renderDragArea() {
    const $dragArea = document.createElement("div");
    $dragArea.className = this.wrapClassName("drag-area");
    $dragArea.dataset.teleBoxHandle = TeleBoxDragHandleType;
    this.sideEffect.addEventListener(
      $dragArea,
      "mousedown",
      this.handleTitleBarClick
    );
    this.sideEffect.addEventListener(
      $dragArea,
      "touchstart",
      this.handleTitleBarTouch,
      { passive: true }
    );
    return $dragArea;
  }
  dragHandle() {
    return this.$titleBar;
  }
  wrapClassName(className) {
    return `${this.namespace}-${className}`;
  }
  destroy() {
    this.sideEffect.flushAll();
    if (this.$titleBar) {
      this.$titleBar = void 0;
      this.$title = void 0;
      this.$btns.length = 0;
      this.onDragStart = void 0;
      this.onEvent = void 0;
    }
  }
}
class TeleBox {
  constructor({
    id = genUniqueKey(),
    title = getBoxDefaultName(),
    prefersColorScheme = TELE_BOX_COLOR_SCHEME.Light,
    darkMode,
    visible = true,
    width = 0.5,
    height = 0.5,
    minWidth = 0,
    minHeight = 0,
    x = 0.1,
    y = 0.1,
    minimized = false,
    maximized = false,
    readonly = false,
    resizable = true,
    draggable = true,
    fence = true,
    fixRatio = false,
    focus = false,
    zIndex = 100,
    namespace = "telebox",
    titleBar,
    content,
    footer,
    styles,
    containerRect = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight
    },
    collectorRect,
    fixed = false,
    addObserver,
    appReadonly,
    hasHeader = true
  } = {}) {
    this.hasHeader = true;
    this._renderSideEffect = new o();
    this.handleTrackStart = (ev) => {
      var _a;
      return (_a = this._handleTrackStart) == null ? void 0 : _a.call(this, ev);
    };
    this.hasHeader = hasHeader;
    this._sideEffect = new o();
    this._valSideEffectBinder = c(this._sideEffect);
    const { combine, createVal } = this._valSideEffectBinder;
    this.addObserver = addObserver || noop;
    this.appReadonly = appReadonly;
    this.id = id;
    this.namespace = namespace;
    this.events = new EventEmitter();
    this._delegateEvents = new EventEmitter();
    this.scale = createVal(1);
    this.fixed = fixed;
    const prefersColorScheme$ = createVal(prefersColorScheme);
    prefersColorScheme$.reaction((prefersColorScheme2, _, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_EVENT.PrefersColorScheme, prefersColorScheme2);
      }
    });
    const darkMode$ = createVal(Boolean(darkMode));
    if (darkMode == null) {
      prefersColorScheme$.subscribe((prefersColorScheme2, _, skipUpdate) => {
        this._sideEffect.add(() => {
          if (prefersColorScheme2 === "auto") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
            if (prefersDark) {
              darkMode$.setValue(prefersDark.matches, skipUpdate);
              const handler = (evt) => {
                darkMode$.setValue(evt.matches, skipUpdate);
              };
              prefersDark.addListener(handler);
              return () => prefersDark.removeListener(handler);
            } else {
              return noop;
            }
          } else {
            darkMode$.setValue(prefersColorScheme2 === "dark", skipUpdate);
            return noop;
          }
        }, "prefers-color-scheme");
      });
    }
    darkMode$.reaction((darkMode2, _, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_EVENT.DarkMode, darkMode2);
      }
    });
    const containerRect$ = createVal(containerRect, shallowequal);
    const collectorRect$ = createVal(collectorRect, shallowequal);
    const title$ = createVal(title);
    title$.reaction((title2, _, skipUpdate) => {
      if (!skipUpdate) {
        this.titleBar.setTitle(title2);
      }
    });
    const visible$ = createVal(visible);
    visible$.reaction((visible2, _, skipUpdate) => {
      if (!skipUpdate && !visible2) {
        this.events.emit(TELE_BOX_EVENT.Close);
      }
    });
    const readonly$ = createVal(readonly);
    readonly$.reaction((readonly2, _, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_EVENT.Readonly, readonly2);
      }
    });
    const resizable$ = createVal(resizable);
    const draggable$ = createVal(draggable);
    const fence$ = createVal(fence);
    const fixRatio$ = createVal(fixRatio);
    const zIndex$ = createVal(zIndex);
    zIndex$.reaction((zIndex2, _, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_EVENT.ZIndex, zIndex2);
      }
    });
    const focus$ = createVal(focus);
    focus$.reaction((focus2, _, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(focus2 ? TELE_BOX_EVENT.Focus : TELE_BOX_EVENT.Blur);
      }
    });
    const minimized$ = createVal(minimized);
    minimized$.reaction((minimized2, _, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_EVENT.Minimized, minimized2);
      }
    });
    const maximized$ = createVal(maximized);
    maximized$.reaction((maximized2, _, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_EVENT.Maximized, maximized2);
      }
    });
    const state$ = combine([minimized$, maximized$], ([minimized2, maximized2]) => {
      console.log("state reaction", minimized2, maximized2);
      return minimized2 ? TELE_BOX_STATE.Minimized : maximized2 ? TELE_BOX_STATE.Maximized : TELE_BOX_STATE.Normal;
    });
    state$.reaction((state, _, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_EVENT.State, state);
      }
    });
    const minSize$ = createVal(
      {
        width: clamp(minWidth, 0, 1),
        height: clamp(minHeight, 0, 1)
      },
      shallowequal
    );
    const intrinsicSize$ = createVal(
      {
        width: clamp(width, minSize$.value.width, 1),
        height: clamp(height, minSize$.value.height, 1)
      },
      shallowequal
    );
    minSize$.reaction((minSize, _, skipUpdate) => {
      intrinsicSize$.setValue(
        {
          width: clamp(width, minSize.width, 1),
          height: clamp(height, minSize.height, 1)
        },
        skipUpdate
      );
    });
    intrinsicSize$.reaction((size, _, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_EVENT.IntrinsicResize, size);
      }
    });
    const size$ = combine(
      [intrinsicSize$, maximized$],
      ([intrinsicSize, maximized2]) => {
        if (maximized2) {
          return { width: 1, height: 1 };
        }
        return intrinsicSize;
      },
      shallowequal
    );
    size$.reaction((size, _, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_EVENT.Resize, size);
      }
    });
    const visualSize$ = combine(
      [size$, minimized$, containerRect$, collectorRect$],
      ([size, minimized2, containerRect2, collectorRect2]) => {
        if (minimized2 && collectorRect2) {
          return {
            width: collectorRect2.width / size.width / containerRect2.width,
            height: collectorRect2.height / size.height / containerRect2.height
          };
        }
        return size;
      },
      shallowequal
    );
    visualSize$.reaction((size, _, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_EVENT.VisualResize, size);
      }
    });
    const intrinsicCoord$ = createVal({ x: clamp(x, 0, 1), y: clamp(y, 0, 1) }, shallowequal);
    intrinsicCoord$.reaction((coord, _, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_EVENT.IntrinsicMove, coord);
      }
    });
    const coord$ = combine(
      [
        intrinsicCoord$,
        intrinsicSize$,
        containerRect$,
        collectorRect$,
        minimized$,
        maximized$
      ],
      ([
        intrinsicCoord,
        intrinsicSize,
        containerRect2,
        collectorRect2,
        minimized2,
        maximized2
      ]) => {
        if (minimized2 && collectorRect2) {
          if (maximized2) {
            return {
              x: (collectorRect2.x + collectorRect2.width / 2) / containerRect2.width - 1 / 2,
              y: (collectorRect2.y + collectorRect2.height / 2) / containerRect2.height - 1 / 2
            };
          }
          return {
            x: (collectorRect2.x + collectorRect2.width / 2) / containerRect2.width - intrinsicSize.width / 2,
            y: (collectorRect2.y + collectorRect2.height / 2) / containerRect2.height - intrinsicSize.height / 2
          };
        }
        if (maximized2) {
          return { x: 0, y: 0 };
        }
        return intrinsicCoord;
      },
      shallowequal
    );
    coord$.reaction((coord, _, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_EVENT.Move, coord);
      }
    });
    this.titleBar = titleBar || new DefaultTitleBar({
      readonly: readonly$.value,
      appReadonly: this.appReadonly,
      title: title$.value,
      namespace: this.namespace,
      onDragStart: (event) => {
        var _a;
        return (_a = this._handleTrackStart) == null ? void 0 : _a.call(this, event);
      },
      onEvent: (event) => {
        if (this._delegateEvents.listeners.length > 0) {
          this._delegateEvents.emit(event.type);
        } else {
          switch (event.type) {
            case TELE_BOX_DELEGATE_EVENT.Maximize: {
              maximized$.setValue(!maximized$.value);
              break;
            }
            case TELE_BOX_DELEGATE_EVENT.Minimize: {
              minimized$.setValue(true);
              break;
            }
            case TELE_BOX_DELEGATE_EVENT.Close: {
              visible$.setValue(false);
              break;
            }
            default: {
              console.error("Unsupported titleBar event:", event);
              break;
            }
          }
        }
      }
    });
    readonly$.reaction((readonly2) => {
      this.titleBar.setReadonly(readonly2);
    });
    const $userContent$ = createVal(content);
    const $userFooter$ = createVal(footer);
    const $userStyles$ = createVal(styles);
    const valConfig = {
      prefersColorScheme: prefersColorScheme$,
      darkMode: darkMode$,
      containerRect: containerRect$,
      collectorRect: collectorRect$,
      title: title$,
      visible: visible$,
      readonly: readonly$,
      resizable: resizable$,
      draggable: draggable$,
      fence: fence$,
      fixRatio: fixRatio$,
      focus: focus$,
      zIndex: zIndex$,
      minimized: minimized$,
      maximized: maximized$,
      $userContent: $userContent$,
      $userFooter: $userFooter$,
      $userStyles: $userStyles$
    };
    i(this, valConfig);
    this._state$ = state$;
    this._minSize$ = minSize$;
    this._size$ = size$;
    this._intrinsicSize$ = intrinsicSize$;
    this._visualSize$ = visualSize$;
    this._coord$ = coord$;
    this._intrinsicCoord$ = intrinsicCoord$;
    if (this.fixRatio) {
      this.transform(
        coord$.value.x,
        coord$.value.y,
        size$.value.width,
        size$.value.height,
        true
      );
    }
    this.$box = this.render();
  }
  get darkMode() {
    return this._darkMode$.value;
  }
  get state() {
    return this._state$.value;
  }
  setState(state, skipUpdate = false) {
    console.log("setstate", state, skipUpdate);
    return this;
  }
  get minWidth() {
    return this._minSize$.value.width;
  }
  get minHeight() {
    return this._minSize$.value.height;
  }
  setMinWidth(minWidth, skipUpdate = false) {
    this._minSize$.setValue({ width: minWidth, height: this.minHeight }, skipUpdate);
    return this;
  }
  setMinHeight(minHeight, skipUpdate = false) {
    this._minSize$.setValue({ width: this.minWidth, height: minHeight }, skipUpdate);
    return this;
  }
  get intrinsicWidth() {
    return this._intrinsicSize$.value.width;
  }
  get intrinsicHeight() {
    return this._intrinsicSize$.value.height;
  }
  resize(width, height, skipUpdate = false) {
    this._intrinsicSize$.setValue({ width, height }, skipUpdate);
    return this;
  }
  get width() {
    return this._size$.value.width;
  }
  get height() {
    return this._size$.value.height;
  }
  get absoluteWidth() {
    return this.width * this.containerRect.width;
  }
  get absoluteHeight() {
    return this.height * this.containerRect.height;
  }
  get visualWidth() {
    return this._visualSize$.value.width;
  }
  get visualHeight() {
    return this._visualSize$.value.height;
  }
  get intrinsicX() {
    return this._intrinsicCoord$.value.x;
  }
  get intrinsicY() {
    return this._intrinsicCoord$.value.y;
  }
  move(x, y, skipUpdate = false) {
    if (this.fixed)
      return this;
    this._intrinsicCoord$.setValue({ x, y }, skipUpdate);
    return this;
  }
  get x() {
    return this._coord$.value.x;
  }
  get y() {
    return this._coord$.value.y;
  }
  transform(x, y, width, height, skipUpdate = false) {
    if (this.fixRatio) {
      const newHeight = this.intrinsicHeight / this.intrinsicWidth * width;
      if (y !== this.intrinsicY) {
        y -= newHeight - height;
      }
      height = newHeight;
    }
    if (y < 0) {
      y = 0;
      if (height > this.intrinsicHeight) {
        height = this.intrinsicHeight;
      }
    }
    if (!this.fixed) {
      this._intrinsicCoord$.setValue(
        {
          x: width >= this.minWidth ? x : this.intrinsicX,
          y: height >= this.minHeight ? y : this.intrinsicY
        },
        skipUpdate
      );
    }
    this._intrinsicSize$.setValue(
      {
        width: clamp(width, this.minWidth, 1),
        height: clamp(height, this.minHeight, 1)
      },
      skipUpdate
    );
    return this;
  }
  mount(container) {
    container.appendChild(this.render());
    return this;
  }
  unmount() {
    if (this.$box) {
      this.$box.remove();
    }
    return this;
  }
  mountContent(content) {
    this.set$userContent(content);
    return this;
  }
  unmountContent() {
    this.set$userContent(void 0);
    return this;
  }
  mountFooter(footer) {
    this.set$userFooter(footer);
    return this;
  }
  unmountFooter() {
    this.set$userFooter(void 0);
    return this;
  }
  getUserStyles() {
    return this.$userStyles;
  }
  mountStyles(styles) {
    let $styles;
    if (typeof styles === "string") {
      $styles = document.createElement("style");
      $styles.textContent = styles;
    } else {
      $styles = styles;
    }
    this.set$userStyles($styles);
    return this;
  }
  unmountStyles() {
    this.set$userStyles(void 0);
    return this;
  }
  setFixed(fixed) {
    this.fixed = fixed;
  }
  render(root) {
    var _a;
    if (root) {
      if (root === this.$box) {
        return this.$box;
      } else {
        this.$box = root;
      }
    } else {
      if (this.$box) {
        return this.$box;
      } else {
        this.$box = document.createElement("div");
      }
    }
    this._renderSideEffect.flushAll();
    this.$box.classList.add(this.wrapClassName("box"));
    const bindClassName = (el, val, className, predicate = isTruthy) => {
      return this._renderSideEffect.add(() => {
        const wrappedClassName = this.wrapClassName(className);
        return val.subscribe((value) => {
          el.classList.toggle(wrappedClassName, predicate(value));
        });
      });
    };
    bindClassName(this.$box, this._readonly$, "readonly");
    bindClassName(this.$box, this._draggable$, "no-drag", isFalsy);
    bindClassName(this.$box, this._resizable$, "no-resize", isFalsy);
    bindClassName(this.$box, this._focus$, "blur", isFalsy);
    bindClassName(this.$box, this._darkMode$, "color-scheme-dark");
    bindClassName(this.$box, this._darkMode$, "color-scheme-light", isFalsy);
    this._renderSideEffect.add(() => {
      const minimizedClassName = this.wrapClassName("minimized");
      const maximizedClassName = this.wrapClassName("maximized");
      const MAXIMIZED_TIMER_ID = "box-maximized-timer";
      return this._state$.subscribe((state) => {
        console.log(state === TELE_BOX_STATE.Minimized, state);
        this.$box.classList.toggle(minimizedClassName, state === TELE_BOX_STATE.Minimized);
        if (state === TELE_BOX_STATE.Maximized) {
          this._renderSideEffect.flush(MAXIMIZED_TIMER_ID);
          this.$box.classList.toggle(maximizedClassName, true);
        } else {
          this.$box.classList.toggle(maximizedClassName, false);
        }
      });
    });
    this._renderSideEffect.add(
      () => this._visible$.subscribe((visible) => {
        this.$box.style.display = visible ? "block" : "none";
      })
    );
    this._renderSideEffect.add(
      () => this._zIndex$.subscribe((zIndex) => {
        this.$box.style.zIndex = String(zIndex);
      })
    );
    const boxStyler = index(this.$box);
    this.$box.dataset.teleBoxID = this.id;
    this.$box.style.width = this.absoluteWidth + "px";
    this.$box.style.height = this.absoluteHeight + "px";
    const translateX = this.x * this.containerRect.width + this.containerRect.x;
    const translateY = this.y * this.containerRect.height + this.containerRect.y;
    this.$box.style.transform = `translate(${translateX - 10}px,${translateY - 10}px)`;
    this._valSideEffectBinder.combine(
      [
        this._coord$,
        this._size$,
        this._minimized$,
        this._containerRect$,
        this._collectorRect$
      ],
      ([coord, size, minimized, containerRect, collectorRect]) => {
        const absoluteWidth = size.width * containerRect.width;
        const absoluteHeight = size.height * containerRect.height;
        return {
          width: absoluteWidth + (minimized && collectorRect ? 1 : 0),
          height: absoluteHeight + (minimized && collectorRect ? 1 : 0),
          x: coord.x * containerRect.width,
          y: coord.y * containerRect.height,
          scaleX: 1,
          scaleY: 1
        };
      },
      shallowequal
    ).subscribe((styles) => {
      boxStyler.set(styles);
    });
    boxStyler.set({ x: translateX, y: translateY });
    const $boxMain = document.createElement("div");
    $boxMain.className = this.wrapClassName("box-main");
    this.$box.appendChild($boxMain);
    const $titleBar = document.createElement("div");
    $titleBar.className = this.wrapClassName("titlebar-wrap");
    $titleBar.appendChild(this.titleBar.render());
    this.$titleBar = $titleBar;
    const $contentWrap = document.createElement("div");
    $contentWrap.className = this.wrapClassName("content-wrap") + " tele-fancy-scrollbar";
    $contentWrap.classList.toggle(
      "hide-scroll",
      Boolean(isIOS() || isAndroid() || this.appReadonly)
    );
    const $content = document.createElement("div");
    $content.className = this.wrapClassName("content") + " tele-fancy-scrollbar";
    this.$content = $content;
    if ((_a = this.id) == null ? void 0 : _a.includes("Plyr")) {
      $contentWrap.style.background = "none";
      $boxMain.style.background = "none";
      $content.style.background = "none";
    }
    if (this.hasHeader == false) {
      $contentWrap.style.background = "none";
      $titleBar.style.display = "none";
      $boxMain.style.background = "none";
      $content.style.background = "none";
    }
    this._renderSideEffect.add(() => {
      let last$userStyles;
      return this._$userStyles$.subscribe(($userStyles) => {
        if (last$userStyles) {
          last$userStyles.remove();
        }
        last$userStyles = $userStyles;
        if ($userStyles) {
          $contentWrap.appendChild($userStyles);
        }
      });
    });
    this._renderSideEffect.add(() => {
      let last$userContent;
      return this._$userContent$.subscribe(($userContent) => {
        if (last$userContent) {
          last$userContent.remove();
        }
        last$userContent = $userContent;
        if ($userContent) {
          $content.appendChild($userContent);
        }
      });
    });
    $contentWrap.appendChild($content);
    const $footer = document.createElement("div");
    $footer.className = this.wrapClassName("footer-wrap");
    this.$footer = $footer;
    this._renderSideEffect.add(() => {
      let last$userFooter;
      return this._$userFooter$.subscribe(($userFooter) => {
        if (last$userFooter) {
          last$userFooter.remove();
        }
        last$userFooter = $userFooter;
        if ($userFooter) {
          $footer.appendChild($userFooter);
        }
      });
    });
    this._state$.reaction((state) => {
      $footer.classList.toggle(
        this.wrapClassName("footer-hide"),
        state == TELE_BOX_STATE.Maximized
      );
    });
    $boxMain.appendChild($titleBar);
    $boxMain.appendChild($contentWrap);
    $boxMain.appendChild($footer);
    this.$contentWrap = $contentWrap;
    this.addObserver($contentWrap, (data) => {
      const entry = data.find((entry2) => entry2.target == $contentWrap);
      if ((entry == null ? void 0 : entry.target) == $contentWrap) {
        $content.style.width = entry.contentRect.width * this.scale.value + "px";
        $content.style.height = entry.contentRect.height * this.scale.value + "px";
      }
    });
    this.scale.reaction((scale2) => {
      $content.style.width = $contentWrap.getBoundingClientRect().width * scale2 + "px";
      $content.style.height = $contentWrap.getBoundingClientRect().height * scale2 + "px";
    });
    this._renderResizeHandlers();
    return this.$box;
  }
  _renderResizeHandlers() {
    const $resizeHandles = document.createElement("div");
    $resizeHandles.className = this.wrapClassName("resize-handles");
    Object.values(TELE_BOX_RESIZE_HANDLE).forEach((handleType) => {
      const $handle = document.createElement("div");
      $handle.className = this.wrapClassName(handleType) + " " + this.wrapClassName("resize-handle");
      $handle.dataset.teleBoxHandle = handleType;
      $resizeHandles.appendChild($handle);
    });
    this.$box.appendChild($resizeHandles);
    const TRACKING_DISPOSER_ID = "handle-tracking-listener";
    const transformingClassName = this.wrapClassName("transforming");
    let $trackMask;
    let trackStartX = 0;
    let trackStartY = 0;
    let trackStartWidth = 0;
    let trackStartHeight = 0;
    let trackStartPageX = 0;
    let trackStartPageY = 0;
    let trackingHandle;
    const handleTracking = (ev) => {
      if (this.state !== TELE_BOX_STATE.Normal) {
        return;
      }
      preventEvent(ev);
      let { pageX, pageY } = flattenEvent(ev);
      if (pageY < 0) {
        pageY = 0;
      }
      const offsetX = (pageX - trackStartPageX) / this.containerRect.width;
      const offsetY = (pageY - trackStartPageY) / this.containerRect.height;
      switch (trackingHandle) {
        case TELE_BOX_RESIZE_HANDLE.North: {
          this.transform(
            this.x,
            trackStartY + offsetY,
            this.width,
            trackStartHeight - offsetY
          );
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.South: {
          this.transform(this.x, this.y, this.width, trackStartHeight + offsetY);
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.West: {
          this.transform(
            trackStartX + offsetX,
            this.y,
            trackStartWidth - offsetX,
            this.height
          );
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.East: {
          this.transform(this.x, this.y, trackStartWidth + offsetX, this.height);
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.NorthWest: {
          this.transform(
            trackStartX + offsetX,
            trackStartY + offsetY,
            trackStartWidth - offsetX,
            trackStartHeight - offsetY
          );
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.NorthEast: {
          this.transform(
            this.x,
            trackStartY + offsetY,
            trackStartWidth + offsetX,
            trackStartHeight - offsetY
          );
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.SouthEast: {
          this.transform(
            this.x,
            this.y,
            trackStartWidth + offsetX,
            trackStartHeight + offsetY
          );
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.SouthWest: {
          this.transform(
            trackStartX + offsetX,
            this.y,
            trackStartWidth - offsetX,
            trackStartHeight + offsetY
          );
          break;
        }
        default: {
          if (this.fence) {
            this.move(
              clamp(trackStartX + offsetX, 0, 1 - this.width),
              clamp(trackStartY + offsetY, 0, 1 - this.height)
            );
          } else {
            const xOverflowOffset = 50 / this.containerRect.width;
            const yOverflowOffset = 40 / this.containerRect.height;
            this.move(
              clamp(
                trackStartX + offsetX,
                xOverflowOffset - this.width,
                1 - xOverflowOffset
              ),
              clamp(trackStartY + offsetY, 0, 1 - yOverflowOffset)
            );
          }
          break;
        }
      }
    };
    const handleTrackEnd = (ev) => {
      trackingHandle = void 0;
      if (!$trackMask) {
        return;
      }
      preventEvent(ev);
      this.$box.classList.toggle(transformingClassName, false);
      this._sideEffect.flush(TRACKING_DISPOSER_ID);
      $trackMask.remove();
    };
    const handleTrackStart = (ev) => {
      var _a;
      if (this.readonly) {
        return;
      }
      if (ev.button != null && ev.button !== 0) {
        return;
      }
      if (!this.draggable || trackingHandle || this.state !== TELE_BOX_STATE.Normal) {
        return;
      }
      const target = ev.target;
      if ((_a = target.dataset) == null ? void 0 : _a.teleBoxHandle) {
        preventEvent(ev);
        trackStartX = this.x;
        trackStartY = this.y;
        trackStartWidth = this.width;
        trackStartHeight = this.height;
        ({ pageX: trackStartPageX, pageY: trackStartPageY } = flattenEvent(ev));
        trackingHandle = target.dataset.teleBoxHandle;
        if (!$trackMask) {
          $trackMask = document.createElement("div");
        }
        const cursor = trackingHandle ? this.wrapClassName(`cursor-${trackingHandle}`) : "";
        $trackMask.className = this.wrapClassName(`track-mask${cursor ? ` ${cursor}` : ""}`);
        this.$box.appendChild($trackMask);
        this.$box.classList.add(transformingClassName);
        this._sideEffect.add(() => {
          window.addEventListener("mousemove", handleTracking);
          window.addEventListener("touchmove", handleTracking, {
            passive: false
          });
          window.addEventListener("mouseup", handleTrackEnd);
          window.addEventListener("touchend", handleTrackEnd, {
            passive: false
          });
          window.addEventListener("touchcancel", handleTrackEnd, {
            passive: false
          });
          return () => {
            window.removeEventListener("mousemove", handleTracking);
            window.removeEventListener("touchmove", handleTracking);
            window.removeEventListener("mouseup", handleTrackEnd);
            window.removeEventListener("touchend", handleTrackEnd);
            window.removeEventListener("touchcancel", handleTrackEnd);
          };
        }, TRACKING_DISPOSER_ID);
      }
    };
    this._handleTrackStart = handleTrackStart;
    this._sideEffect.addEventListener(
      $resizeHandles,
      "mousedown",
      handleTrackStart,
      {},
      "box-resizeHandles-mousedown"
    );
    this._sideEffect.addEventListener(
      $resizeHandles,
      "touchstart",
      handleTrackStart,
      { passive: false },
      "box-resizeHandles-touchstart"
    );
  }
  setScaleContent(scale2) {
    this.scale.setValue(scale2);
  }
  destroy() {
    this.$box.remove();
    this.events.emit(TELE_BOX_EVENT.Destroyed);
    this._sideEffect.flushAll();
    this._renderSideEffect.flushAll();
    this.events.removeAllListeners();
    this._delegateEvents.removeAllListeners();
  }
  wrapClassName(className) {
    return `${this.namespace}-${className}`;
  }
}
function noop() {
  return;
}
var style$1 = "";
var collectorSVG = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzFfNDQyNDQpIj4KPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjBfZF8xXzQ0MjQ0KSI+CjxwYXRoIGQ9Ik0xNC4wMDAyIDE2LjE5NTNDMTMuODI0NyAxNi4xOTUzIDEzLjY1MjIgMTYuMTQ5MSAxMy41MDAyIDE2LjA2MTVMNC41MDAxNyAxMC44NjQzQzQuMDIxNzggMTAuNTg3OSAzLjg1Nzk2IDkuOTc2MTIgNC4xMzQyOCA5LjQ5NzczQzQuMjIyMDQgOS4zNDU3OSA0LjM0ODIzIDkuMjE5NiA0LjUwMDE3IDkuMTMxODRMMTMuNTAwMiAzLjkzODQ4QzEzLjgwOTggMy43NjA3NCAxNC4xOTA1IDMuNzYwNzQgMTQuNTAwMiAzLjkzODQ4TDIzLjUwMDIgOS4xMzE4NEMyMy45Nzg2IDkuNDA4MTYgMjQuMTQyNCAxMC4wMiAyMy44NjYxIDEwLjQ5ODRDMjMuNzc4MyAxMC42NTAzIDIzLjY1MjEgMTAuNzc2NSAyMy41MDAyIDEwLjg2NDNMMTQuNTAwMiAxNi4wNjE1QzE0LjM0ODEgMTYuMTQ5MSAxNC4xNzU3IDE2LjE5NTMgMTQuMDAwMiAxNi4xOTUzWiIgZmlsbD0id2hpdGUiLz4KPC9nPgo8ZyBmaWx0ZXI9InVybCgjZmlsdGVyMV9kXzFfNDQyNDQpIj4KPHBhdGggZD0iTTIzLjUwMDIgMTMuMTMxOUwyMS41MzYxIDExLjk5ODVMMTQuNTAwMiAxNi4wNjE2QzE0LjE5MDcgMTYuMjQgMTMuODA5NiAxNi4yNCAxMy41MDAyIDE2LjA2MTZMNi40NjQyOCAxMS45OTg1TDQuNTAwMTcgMTMuMTMxOUM0LjAyMTc4IDEzLjQwODIgMy44NTc5NiAxNC4wMiA0LjEzNDI4IDE0LjQ5ODRDNC4yMjIwNCAxNC42NTA0IDQuMzQ4MjMgMTQuNzc2NiA0LjUwMDE3IDE0Ljg2NDNMMTMuNTAwMiAyMC4wNjE2QzEzLjgwOTYgMjAuMjQgMTQuMTkwNyAyMC4yNCAxNC41MDAyIDIwLjA2MTZMMjMuNTAwMiAxNC44NjQzQzIzLjk3ODYgMTQuNTg4IDI0LjE0MjQgMTMuOTc2MiAyMy44NjYxIDEzLjQ5NzhDMjMuNzc4MyAxMy4zNDU5IDIzLjY1MjEgMTMuMjE5NyAyMy41MDAyIDEzLjEzMTlaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjgiIHNoYXBlLXJlbmRlcmluZz0iY3Jpc3BFZGdlcyIvPgo8L2c+CjxnIGZpbHRlcj0idXJsKCNmaWx0ZXIyX2RfMV80NDI0NCkiPgo8cGF0aCBkPSJNMjMuNTAwMiAxNy4xMzE5TDIxLjUzNjEgMTUuOTk4NUwxNC41MDAyIDIwLjA2MTZDMTQuMTkwNyAyMC4yNCAxMy44MDk2IDIwLjI0IDEzLjUwMDIgMjAuMDYxNkw2LjQ2NDI4IDE1Ljk5ODVMNC41MDAxNyAxNy4xMzE5QzQuMDIxNzggMTcuNDA4MiAzLjg1Nzk2IDE4LjAyIDQuMTM0MjggMTguNDk4NEM0LjIyMjA0IDE4LjY1MDQgNC4zNDgyMyAxOC43NzY2IDQuNTAwMTcgMTguODY0M0wxMy41MDAyIDI0LjA2MTZDMTMuODA5NiAyNC4yNCAxNC4xOTA3IDI0LjI0IDE0LjUwMDIgMjQuMDYxNkwyMy41MDAyIDE4Ljg2NDNDMjMuOTc4NiAxOC41ODggMjQuMTQyNCAxNy45NzYyIDIzLjg2NjEgMTcuNDk3OEMyMy43NzgzIDE3LjM0NTkgMjMuNjUyMSAxNy4yMTk3IDIzLjUwMDIgMTcuMTMxOVoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNiIgc2hhcGUtcmVuZGVyaW5nPSJjcmlzcEVkZ2VzIi8+CjwvZz4KPC9nPgo8ZGVmcz4KPGZpbHRlciBpZD0iZmlsdGVyMF9kXzFfNDQyNDQiIHg9IjMiIHk9IjMuODA1MTgiIHdpZHRoPSIyMiIgaGVpZ2h0PSIxNC4zOTAxIiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiI+CjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+CjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIiByZXN1bHQ9ImhhcmRBbHBoYSIvPgo8ZmVPZmZzZXQgZHk9IjEiLz4KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMC41Ii8+CjxmZUNvbXBvc2l0ZSBpbjI9ImhhcmRBbHBoYSIgb3BlcmF0b3I9Im91dCIvPgo8ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAwLjU1Mjk0MSAwIDAgMCAwIDAuNTYwNzg0IDAgMCAwIDAgMC42NTA5OCAwIDAgMCAwLjE1IDAiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJlZmZlY3QxX2Ryb3BTaGFkb3dfMV80NDI0NCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImVmZmVjdDFfZHJvcFNoYWRvd18xXzQ0MjQ0IiByZXN1bHQ9InNoYXBlIi8+CjwvZmlsdGVyPgo8ZmlsdGVyIGlkPSJmaWx0ZXIxX2RfMV80NDI0NCIgeD0iMyIgeT0iMTEuOTk4NSIgd2lkdGg9IjIyIiBoZWlnaHQ9IjEwLjE5NjgiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4KPGZlQ29sb3JNYXRyaXggaW49IlNvdXJjZUFscGhhIiB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMTI3IDAiIHJlc3VsdD0iaGFyZEFscGhhIi8+CjxmZU9mZnNldCBkeT0iMSIvPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIwLjUiLz4KPGZlQ29tcG9zaXRlIGluMj0iaGFyZEFscGhhIiBvcGVyYXRvcj0ib3V0Ii8+CjxmZUNvbG9yTWF0cml4IHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAuNTUyOTQxIDAgMCAwIDAgMC41NjA3ODQgMCAwIDAgMCAwLjY1MDk4IDAgMCAwIDAuMTUgMCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9ImVmZmVjdDFfZHJvcFNoYWRvd18xXzQ0MjQ0Ii8+CjxmZUJsZW5kIG1vZGU9Im5vcm1hbCIgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iZWZmZWN0MV9kcm9wU2hhZG93XzFfNDQyNDQiIHJlc3VsdD0ic2hhcGUiLz4KPC9maWx0ZXI+CjxmaWx0ZXIgaWQ9ImZpbHRlcjJfZF8xXzQ0MjQ0IiB4PSIzIiB5PSIxNS45OTg1IiB3aWR0aD0iMjIiIGhlaWdodD0iMTAuMTk2OCIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPgo8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPgo8ZmVDb2xvck1hdHJpeCBpbj0iU291cmNlQWxwaGEiIHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIgcmVzdWx0PSJoYXJkQWxwaGEiLz4KPGZlT2Zmc2V0IGR5PSIxIi8+CjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjAuNSIvPgo8ZmVDb21wb3NpdGUgaW4yPSJoYXJkQWxwaGEiIG9wZXJhdG9yPSJvdXQiLz4KPGZlQ29sb3JNYXRyaXggdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMC41NTI5NDEgMCAwIDAgMCAwLjU2MDc4NCAwIDAgMCAwIDAuNjUwOTggMCAwIDAgMC4xNSAwIi8+CjxmZUJsZW5kIG1vZGU9Im5vcm1hbCIgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0iZWZmZWN0MV9kcm9wU2hhZG93XzFfNDQyNDQiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJlZmZlY3QxX2Ryb3BTaGFkb3dfMV80NDI0NCIgcmVzdWx0PSJzaGFwZSIvPgo8L2ZpbHRlcj4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xXzQ0MjQ0Ij4KPHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=";
let onTickEndCallbacks;
let onTickEndPrimaryCallbacks;
function onTickEnd(callback, isPrimary = false) {
  if (!onTickEndCallbacks) {
    onTickEndCallbacks = isPrimary ? [] : [callback];
    onTickEndPrimaryCallbacks = isPrimary ? [callback] : [];
    Promise.resolve().then(() => {
      const currentCallbacks = onTickEndCallbacks;
      const currentPrimaryCallbacks = onTickEndPrimaryCallbacks;
      onTickEndCallbacks = void 0;
      onTickEndPrimaryCallbacks = void 0;
      currentPrimaryCallbacks == null ? void 0 : currentPrimaryCallbacks.forEach((cb) => cb());
      currentCallbacks == null ? void 0 : currentCallbacks.forEach((cb) => cb());
    });
  } else if (isPrimary) {
    onTickEndPrimaryCallbacks == null ? void 0 : onTickEndPrimaryCallbacks.push(callback);
  } else {
    onTickEndCallbacks.push(callback);
  }
}
function getHiddenElementSize(element) {
  const clone = element.cloneNode(true);
  clone.style.position = "absolute";
  clone.style.top = "-99999px";
  clone.style.float = "none";
  clone.style.visibility = "hidden";
  clone.style.display = "block";
  document.body.appendChild(clone);
  const rect = clone.getBoundingClientRect();
  document.body.removeChild(clone);
  return { height: rect.height, width: rect.width };
}
class TeleBoxCollector {
  constructor({
    visible = true,
    readonly = false,
    darkMode = false,
    namespace = "telebox",
    styles = {},
    onClick,
    minimizedBoxes = [],
    boxes = [],
    externalEvents,
    appReadonly
  } = {}) {
    this.handleCollectorClick = () => {
      if (!this._readonly && this.onClick) {
        this.popupVisible$.setValue(!this.popupVisible$.value);
      }
    };
    this.externalEvents = externalEvents;
    this._sideEffect = new o();
    const { createVal } = c(this._sideEffect);
    this._visible = visible;
    this._readonly = readonly;
    this._darkMode = darkMode;
    this.namespace = namespace;
    this.styles = styles;
    this.minimizedBoxes = minimizedBoxes;
    this.boxes = boxes;
    this.onClick = onClick;
    this.appReadonly = appReadonly;
    this.popupVisible$ = createVal(false);
    this.popupVisible$.reaction((popupVisible) => {
      var _a;
      (_a = this.$titles) == null ? void 0 : _a.classList.toggle(
        this.wrapClassName("collector-hide"),
        !popupVisible
      );
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          var _a2;
          (_a2 = this.$titles) == null ? void 0 : _a2.classList.toggle(
            this.wrapClassName(
              "collector-titles-visible"
            ),
            popupVisible
          );
        });
      });
    });
    const blurPopup = (ev) => {
      var _a, _b;
      if (!this.popupVisible$)
        return;
      const target = ev.target;
      if ((_b = (_a = target.className) == null ? void 0 : _a.includes) == null ? void 0 : _b.call(_a, "collector"))
        return;
      this.popupVisible$.setValue(false);
    };
    this._sideEffect.addEventListener(
      window,
      "pointerdown",
      blurPopup,
      true
    );
  }
  get visible() {
    return this._visible;
  }
  get readonly() {
    return this._readonly;
  }
  get darkMode() {
    return this._darkMode;
  }
  mount(root) {
    this.render(root);
    this.root = root;
    return this;
  }
  unmount() {
    if (this.$collector) {
      this.$collector.remove();
    }
    return this;
  }
  setVisible(visible) {
    var _a;
    if (this._visible !== visible) {
      this._visible = visible;
      if (this.$collector) {
        (_a = this.wrp$) == null ? void 0 : _a.classList.toggle(this.wrapClassName("collector-visible"), visible);
        if (!visible) {
          this.popupVisible$.setValue(false);
        } else {
          this.renderTitles();
        }
      }
    }
    return this;
  }
  setReadonly(readonly) {
    if (this._readonly !== readonly) {
      this._readonly = readonly;
      if (this.$collector) {
        this.$collector.classList.toggle(this.wrapClassName("collector-readonly"), readonly);
      }
    }
    return this;
  }
  setDarkMode(darkMode) {
    if (this._darkMode !== darkMode) {
      this._darkMode = darkMode;
      if (this.$collector) {
        this.$collector.classList.toggle(this.wrapClassName("color-scheme-dark"), darkMode);
        this.$collector.classList.toggle(
          this.wrapClassName("color-scheme-light"),
          !darkMode
        );
      }
    }
    return this;
  }
  setStyles(styles) {
    Object.assign(this.styles, styles);
    if (this.wrp$) {
      const $collector = this.wrp$;
      Object.keys(styles).forEach((key) => {
        const value = styles[key];
        if (value != null) {
          $collector.style[key] = value;
        }
      });
    }
    return this;
  }
  setMinimizedBoxes(boxes) {
    var _a;
    this.minimizedBoxes = boxes;
    if (this.count$) {
      this.count$.textContent = String((_a = this.minimizedBoxes) == null ? void 0 : _a.length) || "0";
    }
    this.renderTitles();
  }
  setBoxes(boxes) {
    this.boxes = boxes;
    this.renderTitles();
  }
  render(root) {
    if (isAndroid() || isIOS()) {
      const nonElement = document.createElement("div");
      nonElement.className = this.wrapClassName("collector-hide");
      return nonElement;
    }
    if (!this.$collector) {
      this.$collector = document.createElement("button");
      this.$collector.className = this.wrapClassName("collector");
      this.$collector.style.backgroundImage = `url('${collectorSVG}')`;
      this.wrp$ = document.createElement("div");
      this.count$ = document.createElement("div");
      this.wrp$.className = this.wrapClassName("collector-wrp");
      this.count$.className = this.wrapClassName("collector-count");
      this.wrp$.appendChild(this.count$);
      this.wrp$.appendChild(this.$collector);
      this.wrp$.addEventListener("click", this.handleCollectorClick);
      if (this._visible) {
        this.wrp$.classList.toggle(this.wrapClassName("collector-visible"));
        this.renderTitles();
      }
      if (this._readonly) {
        this.$collector.classList.add(this.wrapClassName("collector-readonly"));
      }
      this.$collector.classList.add(
        this.wrapClassName(this._darkMode ? "color-scheme-dark" : "color-scheme-light")
      );
      this.setStyles(this.styles);
      root.appendChild(this.wrp$);
    }
    return this.$collector;
  }
  renderTitles() {
    var _a, _b, _c, _d;
    if (!this.$titles) {
      this.$titles = document.createElement("div");
      this.$titles.className = this.wrapClassName("collector-titles");
      this.$titles.classList.toggle(
        this.wrapClassName("collector-hide"),
        !this.popupVisible$.value
      );
    }
    this._sideEffect.addEventListener(
      this.$titles,
      "wheel",
      (ev) => {
        if (!ev.deltaX) {
          ev.currentTarget.scrollBy({
            left: ev.deltaY > 0 ? 250 : -250,
            behavior: "smooth"
          });
        }
      },
      { passive: false },
      "min-popup-render-wheel-titles"
    );
    const existContent = this.$titles.querySelector(
      `.${this.wrapClassName("collector-titles-content")}`
    );
    const $content = existContent != null ? existContent : document.createElement("div");
    $content.className = this.wrapClassName("collector-titles-content");
    if (!existContent) {
      this.$titles.appendChild($content);
      this._sideEffect.addEventListener(
        $content,
        "click",
        (ev) => {
          var _a2, _b2, _c2, _d2;
          const target = ev.target;
          if ((_b2 = (_a2 = target.dataset) == null ? void 0 : _a2.teleBoxID) == null ? void 0 : _b2.length) {
            (_d2 = this.onClick) == null ? void 0 : _d2.call(this, (_c2 = target.dataset) == null ? void 0 : _c2.teleBoxID);
          }
        },
        {},
        "telebox-collector-titles-content-click"
      );
    }
    $content.innerHTML = "";
    const disposers = (_a = this.boxes) == null ? void 0 : _a.filter((box) => {
      var _a2;
      return (_a2 = this.minimizedBoxes) == null ? void 0 : _a2.includes(box.id);
    }).map((box) => {
      const $tab = document.createElement("button");
      $tab.className = this.wrapClassName("collector-titles-tab");
      $tab.textContent = box.title;
      $tab.dataset.teleBoxID = box.id;
      $tab.dataset.teleTitleBarNoDblClick = "true";
      $content.appendChild($tab);
      return box._title$.reaction((title) => $tab.textContent = title);
    });
    this._sideEffect.addDisposer(
      () => disposers == null ? void 0 : disposers.forEach((disposer) => disposer()),
      "min-popup-render-tab-titles"
    );
    const existTitles = (_b = this.wrp$) == null ? void 0 : _b.querySelector(
      `.${this.wrapClassName("collector-titles")}`
    );
    if (!existTitles) {
      (_c = this.wrp$) == null ? void 0 : _c.appendChild(this.$titles);
    } else {
      (_d = this.wrp$) == null ? void 0 : _d.replaceChild(this.$titles, existTitles);
    }
    onTickEnd(() => {
      var _a2, _b2;
      if (!this.$titles)
        return;
      if (!this.wrp$)
        return;
      if (!this.root)
        return;
      const parentRect = (_a2 = this.wrp$) == null ? void 0 : _a2.getBoundingClientRect();
      const rootRect = (_b2 = this.root) == null ? void 0 : _b2.getBoundingClientRect();
      const popupSize = getHiddenElementSize(this.$titles);
      parentRect.top - rootRect.top > popupSize.height;
      const topPosition = -popupSize.height - 10;
      this.$titles.style.top = `${topPosition}px`;
      this.$titles.style.left = `0px`;
    });
    return this.$titles;
  }
  destroy() {
    if (this.$collector) {
      this.$collector.removeEventListener("click", this.handleCollectorClick);
      this.$collector.remove();
      this.$collector = void 0;
    }
    this.onClick = void 0;
  }
  wrapClassName(className) {
    return `${this.namespace}-${className}`;
  }
}
var TELE_BOX_MANAGER_EVENT = /* @__PURE__ */ ((TELE_BOX_MANAGER_EVENT2) => {
  TELE_BOX_MANAGER_EVENT2["Focused"] = "focused";
  TELE_BOX_MANAGER_EVENT2["Blurred"] = "blurred";
  TELE_BOX_MANAGER_EVENT2["Created"] = "created";
  TELE_BOX_MANAGER_EVENT2["Removed"] = "removed";
  TELE_BOX_MANAGER_EVENT2["State"] = "state";
  TELE_BOX_MANAGER_EVENT2["Maximized"] = "maximized";
  TELE_BOX_MANAGER_EVENT2["Minimized"] = "minimized";
  TELE_BOX_MANAGER_EVENT2["Move"] = "move";
  TELE_BOX_MANAGER_EVENT2["Resize"] = "resize";
  TELE_BOX_MANAGER_EVENT2["IntrinsicMove"] = "intrinsic_move";
  TELE_BOX_MANAGER_EVENT2["IntrinsicResize"] = "intrinsic_resize";
  TELE_BOX_MANAGER_EVENT2["VisualResize"] = "visual_resize";
  TELE_BOX_MANAGER_EVENT2["ZIndex"] = "z_index";
  TELE_BOX_MANAGER_EVENT2["PrefersColorScheme"] = "prefers_color_scheme";
  TELE_BOX_MANAGER_EVENT2["DarkMode"] = "dark_mode";
  return TELE_BOX_MANAGER_EVENT2;
})(TELE_BOX_MANAGER_EVENT || {});
var style = "";
class MaxTitleBar extends DefaultTitleBar {
  constructor(config) {
    super(config);
    this.boxes = config.boxes;
    this.focusedBox = config.focusedBox;
    this.containerRect = config.containerRect;
    this.darkMode = config.darkMode;
    this.maximizedBoxes$ = config.maximizedBoxes$;
    this.minimizedBoxes$ = config.minimizedBoxes$;
  }
  focusBox(box) {
    var _a;
    if (this.focusedBox && this.focusedBox === box || !(box == null ? void 0 : box.hasHeader)) {
      return;
    }
    if (this.$titles && this.state === TELE_BOX_STATE.Maximized) {
      const { children } = this.$titles.firstElementChild;
      for (let i2 = children.length - 1; i2 >= 0; i2 -= 1) {
        const $tab = children[i2];
        const id = (_a = $tab.dataset) == null ? void 0 : _a.teleBoxID;
        if (id) {
          if (box && id === box.id) {
            $tab.classList.toggle(this.wrapClassName("titles-tab-focus"), true);
          } else if (this.focusedBox && id === this.focusedBox.id) {
            $tab.classList.toggle(this.wrapClassName("titles-tab-focus"), false);
          }
        }
      }
    }
    this.focusedBox = box;
  }
  setContainerRect(rect) {
    this.containerRect = rect;
    if (this.$titleBar) {
      const { x, y, width } = rect;
      this.$titleBar.style.transform = `translate(${x}px, ${y}px)`;
      this.$titleBar.style.width = width + "px";
    }
  }
  setBoxes(boxes) {
    this.boxes = boxes;
    this.updateTitles();
  }
  setMaximizedBoxes(boxes) {
    this.maximizedBoxes$ = boxes;
    this.updateTitles();
  }
  setMinimizedBoxes(boxes) {
    this.minimizedBoxes$ = boxes;
    this.updateTitles();
  }
  setState(state) {
    super.setState(state);
    if (this.$titleBar) {
      this.$titleBar.classList.toggle(
        this.wrapClassName("max-titlebar-maximized"),
        state === TELE_BOX_STATE.Maximized
      );
    }
    this.updateTitles();
  }
  setReadonly(readonly) {
    super.setReadonly(readonly);
    if (this.$titleBar) {
      this.$titleBar.classList.toggle(this.wrapClassName("readonly"), this.readonly);
    }
  }
  setDarkMode(darkMode) {
    if (darkMode !== this.darkMode) {
      this.darkMode = darkMode;
      if (this.$titleBar) {
        this.$titleBar.classList.toggle(this.wrapClassName("color-scheme-dark"), darkMode);
        this.$titleBar.classList.toggle(this.wrapClassName("color-scheme-light"), !darkMode);
      }
    }
  }
  render() {
    const $titleBar = super.render();
    const { x, y, width } = this.containerRect;
    $titleBar.style.transform = `translate(${x}px, ${y}px)`;
    $titleBar.style.width = width + "px";
    $titleBar.classList.add(this.wrapClassName("max-titlebar"));
    $titleBar.classList.toggle(
      this.wrapClassName("max-titlebar-maximized"),
      this.state === TELE_BOX_STATE.Maximized
    );
    $titleBar.classList.toggle(this.wrapClassName("readonly"), this.readonly);
    $titleBar.classList.add(
      this.wrapClassName(this.darkMode ? "color-scheme-dark" : "color-scheme-light")
    );
    const $titlesArea = document.createElement("div");
    $titlesArea.classList.add(this.wrapClassName("titles-area"));
    $titleBar.insertBefore($titlesArea, $titleBar.firstElementChild);
    this.updateTitles();
    return $titleBar;
  }
  destroy() {
    super.destroy();
    this.$titles = void 0;
    this.boxes.length = 0;
    this.focusedBox = void 0;
  }
  updateTitles() {
    var _a;
    (_a = this.$titleBar) == null ? void 0 : _a.classList.toggle(
      this.wrapClassName("max-titlebar-active"),
      this.maximizedBoxes$.length > 0 && this.boxes.length > 0 && this.maximizedBoxes$.filter((boxId) => !this.minimizedBoxes$.includes(boxId)).length > 0
    );
    if (this.$titleBar && this.maximizedBoxes$.length > 0 && this.boxes.length > 0 && this.maximizedBoxes$.filter((boxId) => !this.minimizedBoxes$.includes(boxId)).length > 0) {
      this.$titleBar.classList.toggle(
        this.wrapClassName("max-titlebar-single-title"),
        this.boxes.length === 1
      );
      if (this.boxes.length === 1) {
        this.setTitle(this.boxes[0].title);
        if (this.boxes[0].hasHeader == false) {
          this.$titleBar.style.display = "none";
        }
      } else {
        this.$titleBar.replaceChild(
          this.renderTitles(),
          this.$titleBar.firstElementChild
        );
      }
    }
  }
  renderTitles() {
    this.$titles = document.createElement("div");
    this.$titles.className = this.wrapClassName("titles");
    this.$titles.addEventListener(
      "wheel",
      (ev) => {
        ev.currentTarget.scrollBy({
          left: ev.deltaY > 0 ? 250 : -250,
          behavior: "smooth"
        });
      },
      { passive: false }
    );
    const $content = document.createElement("div");
    $content.className = this.wrapClassName("titles-content");
    this.$titles.appendChild($content);
    const maxBoxes = this.boxes.filter((box) => this.maximizedBoxes$.includes(box.id)).filter((box) => !this.minimizedBoxes$.includes(box.id)).filter((box) => box.hasHeader);
    const noHeaderBoxes = this.boxes.filter((box) => this.maximizedBoxes$.includes(box.id)).filter((box) => !this.minimizedBoxes$.includes(box.id)).filter((box) => !box.hasHeader);
    if (this.$titleBar) {
      if (maxBoxes.length == 0 && noHeaderBoxes.length > 0) {
        this.$titleBar.style.display = "none";
      } else {
        this.$titleBar.style.display = "";
      }
    }
    maxBoxes.forEach((box) => {
      const $tab = document.createElement("button");
      $tab.className = this.wrapClassName("titles-tab");
      $tab.textContent = box.title;
      $tab.dataset.teleBoxID = box.id;
      $tab.dataset.teleTitleBarNoDblClick = "true";
      if (this.focusedBox && box.id === this.focusedBox.id) {
        $tab.classList.add(this.wrapClassName("titles-tab-focus"));
      }
      $content.appendChild($tab);
    });
    return this.$titles;
  }
}
function createCallbackManager() {
  let callbacks = /* @__PURE__ */ new Set();
  function addCallback(cb) {
    callbacks.add(cb);
    return () => {
      removeCallback(cb);
    };
  }
  function removeCallback(cb) {
    callbacks.delete(cb);
  }
  function runCallbacks(...args) {
    callbacks.forEach((callback) => {
      callback(...args);
    });
  }
  function hasCallbacks() {
    return Boolean(callbacks.size);
  }
  function removeAll() {
    callbacks = /* @__PURE__ */ new Set();
  }
  return {
    runCallbacks,
    addCallback,
    removeCallback,
    hasCallbacks,
    removeAll
  };
}
class TeleBoxManager {
  constructor({
    root = document.body,
    prefersColorScheme = TELE_BOX_COLOR_SCHEME.Light,
    fence = true,
    containerRect = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight
    },
    collector,
    namespace = "telebox",
    readonly = false,
    minimizedBoxes = [],
    maximizedBoxes = [],
    appReadonly = false
  } = {}) {
    this.externalEvents = new EventEmitter();
    this.events = new EventEmitter();
    this.appReadonly = false;
    this._sideEffect = new o();
    const { combine, createVal } = c(this._sideEffect);
    this.callbackManager = createCallbackManager();
    this.sizeObserver = new ResizeObserver(this.callbackManager.runCallbacks);
    this.elementObserverMap = /* @__PURE__ */ new Map();
    this.root = root;
    this.namespace = namespace;
    this.appReadonly = appReadonly;
    this.boxes$ = createVal([]);
    this.topBox$ = this.boxes$.derive((boxes) => {
      if (boxes.length > 0) {
        const topBox = boxes.reduce(
          (topBox2, box) => topBox2.zIndex > box.zIndex ? topBox2 : box
        );
        return topBox;
      }
      return;
    });
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    const prefersDark$ = createVal(false);
    if (prefersDark) {
      prefersDark$.setValue(prefersDark.matches);
      this._sideEffect.add(() => {
        const handler = (evt) => {
          prefersDark$.setValue(evt.matches);
        };
        prefersDark.addListener(handler);
        return () => prefersDark.removeListener(handler);
      });
    }
    const prefersColorScheme$ = createVal(prefersColorScheme);
    prefersColorScheme$.reaction((prefersColorScheme2, _, skipUpdate) => {
      this.boxes.forEach((box) => box.setPrefersColorScheme(prefersColorScheme2, skipUpdate));
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_MANAGER_EVENT.PrefersColorScheme, prefersColorScheme2);
      }
    });
    this._darkMode$ = combine(
      [prefersDark$, prefersColorScheme$],
      ([prefersDark2, prefersColorScheme2]) => prefersColorScheme2 === "auto" ? prefersDark2 : prefersColorScheme2 === "dark"
    );
    this._darkMode$.reaction((darkMode, _, skipUpdate) => {
      this.boxes.forEach((box) => box.setDarkMode(darkMode, skipUpdate));
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_MANAGER_EVENT.DarkMode, darkMode);
      }
    });
    const readonly$ = createVal(readonly);
    readonly$.reaction((readonly2, _, skipUpdate) => {
      this.boxes.forEach((box) => box.setReadonly(readonly2, skipUpdate));
    });
    this.maximizedBoxes$ = createVal(maximizedBoxes);
    this.minimizedBoxes$ = createVal(minimizedBoxes);
    this.maximizedBoxes$.reaction((maximizedBoxes2, _, skipUpdate) => {
      this.boxes.forEach((box) => {
        console.log(maximizedBoxes2.includes(box.id));
        box.setMaximized(maximizedBoxes2.includes(box.id), skipUpdate);
      });
      const maxBoxes = maximizedBoxes2.filter((id) => !this.minimizedBoxes$.value.includes(id));
      this.maxTitleBar.setState(
        maxBoxes.length > 0 ? TELE_BOX_STATE.Maximized : TELE_BOX_STATE.Normal
      );
      this.maxTitleBar.setMaximizedBoxes(maximizedBoxes2);
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_MANAGER_EVENT.Maximized, maximizedBoxes2);
      }
    });
    const state$ = combine(
      [this.minimizedBoxes$, this.maximizedBoxes$],
      ([minimized, maximized]) => minimized.length ? TELE_BOX_STATE.Minimized : maximized.length ? TELE_BOX_STATE.Maximized : TELE_BOX_STATE.Normal
    );
    state$.reaction((state, _, skipUpdate) => {
      this.maxTitleBar.setState(state);
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_MANAGER_EVENT.State, state);
      }
    });
    const fence$ = createVal(fence);
    fence$.subscribe((fence2, _, skipUpdate) => {
      this.boxes.forEach((box) => box.setFence(fence2, skipUpdate));
    });
    const containerRect$ = createVal(containerRect, shallowequal);
    containerRect$.reaction((containerRect2, _, skipUpdate) => {
      this.boxes.forEach((box) => box.setContainerRect(containerRect2, skipUpdate));
      this.maxTitleBar.setContainerRect(containerRect2);
    });
    const collector$ = createVal(
      collector === null ? null : collector || new TeleBoxCollector({
        visible: this.minimizedBoxes$.value.length > 0 && !this.readonly,
        readonly: readonly$.value,
        namespace,
        minimizedBoxes: this.minimizedBoxes$.value,
        boxes: this.boxes$.value,
        externalEvents: this.externalEvents,
        appReadonly: this.appReadonly
      }).mount(root)
    );
    collector$.subscribe((collector2) => {
      if (collector2) {
        collector2.setVisible(this.minimizedBoxes$.value.length > 0 && !readonly$.value);
        collector2.setReadonly(readonly$.value);
        collector2.setDarkMode(this._darkMode$.value);
        this._sideEffect.add(() => {
          collector2.onClick = (boxId) => {
            var _a;
            if (!readonly$.value) {
              this.setMinimizedBoxes(
                removeByVal(
                  this.minimizedBoxes$.value.filter(Boolean),
                  boxId
                )
              );
              (_a = this.externalEvents) == null ? void 0 : _a.emit("OpenMiniBox", []);
            }
          };
          return () => collector2.destroy();
        }, "collect-onClick");
      }
    });
    readonly$.subscribe((readonly2) => {
      var _a, _b;
      (_a = collector$.value) == null ? void 0 : _a.setReadonly(readonly2);
      (_b = collector$.value) == null ? void 0 : _b.setVisible(this.minimizedBoxes$.value.length > 0 && !readonly$.value);
    });
    this._darkMode$.subscribe((darkMode) => {
      var _a;
      (_a = collector$.value) == null ? void 0 : _a.setDarkMode(darkMode);
    });
    const calcCollectorRect = () => {
      var _a;
      if ((_a = collector$.value) == null ? void 0 : _a.$collector) {
        const { x, y, width, height } = collector$.value.$collector.getBoundingClientRect();
        const rootRect = this.root.getBoundingClientRect();
        return {
          x: x - rootRect.x,
          y: y - rootRect.y,
          width,
          height
        };
      }
      return;
    };
    const collectorRect$ = createVal(
      this.minimizedBoxes$.value.length > 0 ? calcCollectorRect() : void 0
    );
    collectorRect$.subscribe((collectorRect, _, skipUpdate) => {
      this.boxes.forEach((box) => {
        box.setCollectorRect(collectorRect, skipUpdate);
      });
    });
    this.minimizedBoxes$.reaction((minimizedBoxes2, _, skipUpdate) => {
      var _a, _b, _c;
      this.boxes.forEach(
        (box) => {
          console.log("mini", minimizedBoxes2);
          box.setMinimized(minimizedBoxes2.includes(box.id), skipUpdate);
        }
      );
      const maxBoxes = this.maximizedBoxes$.value.filter((id) => !minimizedBoxes2.includes(id));
      this.maxTitleBar.setState(
        maxBoxes.length > 0 ? TELE_BOX_STATE.Maximized : TELE_BOX_STATE.Normal
      );
      this.maxTitleBar.setMinimizedBoxes(minimizedBoxes2);
      const minimized = minimizedBoxes2.length > 0;
      (_a = collector$.value) == null ? void 0 : _a.setVisible(minimized);
      (_b = this.collector) == null ? void 0 : _b.setMinimizedBoxes(minimizedBoxes2);
      if (minimized) {
        if ((_c = collector$.value) == null ? void 0 : _c.$collector) {
          collectorRect$.setValue(calcCollectorRect());
        }
      }
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_MANAGER_EVENT.Minimized, minimizedBoxes2);
      }
    });
    const closeBtnClassName = this.wrapClassName("titlebar-icon-close");
    const checkFocusBox = (ev) => {
      var _a;
      if (readonly$.value) {
        return;
      }
      const target = ev.target;
      if (!target.tagName) {
        return;
      }
      for (let el = target; el; el = el.parentElement) {
        if (el.classList && el.classList.contains(closeBtnClassName)) {
          return;
        }
        const id = (_a = el.dataset) == null ? void 0 : _a.teleBoxID;
        if (id) {
          const box = this.getBox(id);
          if (box) {
            this.focusBox(box);
            this.makeBoxTop(box);
            return;
          }
        }
      }
    };
    this._sideEffect.addEventListener(window, "mousedown", checkFocusBox, true);
    this._sideEffect.addEventListener(window, "touchstart", checkFocusBox, true);
    this.maxTitleBar = new MaxTitleBar({
      darkMode: this.darkMode,
      readonly: readonly$.value,
      namespace: this.namespace,
      state: state$.value,
      boxes: this.boxes$.value,
      containerRect: containerRect$.value,
      maximizedBoxes$: this.maximizedBoxes$.value,
      minimizedBoxes$: this.minimizedBoxes$.value,
      onEvent: (event) => {
        var _a, _b, _c, _d, _e, _f;
        switch (event.type) {
          case TELE_BOX_DELEGATE_EVENT.Maximize: {
            if ((_a = this.maxTitleBar.focusedBox) == null ? void 0 : _a.id) {
              const oldFocusId = (_b = this.maxTitleBar.focusedBox) == null ? void 0 : _b.id;
              const isInMaximizedBoxes = this.maximizedBoxes$.value.includes(oldFocusId);
              const newMaximizedBoxes = isInMaximizedBoxes ? removeByVal([...this.maximizedBoxes$.value], oldFocusId) : uniqueByVal([
                ...this.maximizedBoxes$.value,
                (_c = this.maxTitleBar.focusedBox) == null ? void 0 : _c.id
              ]);
              this.setMaximizedBoxes(newMaximizedBoxes);
              const hasTopBox = this.makeBoxTopFromMaximized();
              const oldFocusBox = this.boxes$.value.find(
                (box) => box.id == oldFocusId
              );
              if (oldFocusBox) {
                this.makeBoxTop(oldFocusBox);
              }
              if (!hasTopBox) {
                this.setMaximizedBoxes([]);
              }
            } else {
              this.setMaximizedBoxes([]);
            }
            this.externalEvents.emit(TELE_BOX_MANAGER_EVENT.Maximized, []);
            break;
          }
          case TELE_BOX_DELEGATE_EVENT.Minimize: {
            if ((_d = this.maxTitleBar.focusedBox) == null ? void 0 : _d.id) {
              const newMinimizedBoxes = uniqueByVal([
                ...this.minimizedBoxes$.value,
                (_e = this.maxTitleBar.focusedBox) == null ? void 0 : _e.id
              ]);
              this.makeBoxTopFromMaximized();
              this.setMinimizedBoxes(newMinimizedBoxes);
            }
            this.externalEvents.emit(
              TELE_BOX_MANAGER_EVENT.Minimized,
              this.minimizedBoxes$.value
            );
            break;
          }
          case TELE_BOX_EVENT.Close: {
            const focusedId = (_f = this.maxTitleBar.focusedBox) == null ? void 0 : _f.id;
            if (focusedId) {
              this.remove(focusedId);
              this.makeBoxTopFromMaximized();
              this.setMaximizedBoxes(
                removeByVal(this.maximizedBoxes$.value, focusedId)
              );
            }
            this.externalEvents.emit(TELE_BOX_MANAGER_EVENT.Removed, []);
            this.focusTopBox();
            break;
          }
        }
      },
      appReadonly: this.appReadonly
    });
    readonly$.subscribe((readonly2) => this.maxTitleBar.setReadonly(readonly2));
    this._darkMode$.subscribe((darkMode) => {
      this.maxTitleBar.setDarkMode(darkMode);
    });
    this.boxes$.reaction((boxes) => {
      var _a;
      this.maxTitleBar.setBoxes(boxes);
      (_a = this.collector) == null ? void 0 : _a.setBoxes(boxes);
    });
    this.maximizedBoxes$.reaction((boxes) => {
      this.maxTitleBar.setMaximizedBoxes(boxes);
    });
    this.minimizedBoxes$.reaction((boxes) => {
      this.maxTitleBar.setMinimizedBoxes(boxes);
    });
    const valConfig = {
      prefersColorScheme: prefersColorScheme$,
      containerRect: containerRect$,
      collector: collector$,
      collectorRect: collectorRect$,
      readonly: readonly$,
      fence: fence$,
      maximizedBoxes: this.maximizedBoxes$,
      minimizedBoxes: this.minimizedBoxes$
    };
    i(this, valConfig);
    this._state$ = state$;
    this.root.appendChild(this.maxTitleBar.render());
  }
  get boxes() {
    return this.boxes$.value;
  }
  get topBox() {
    return this.topBox$.value;
  }
  get darkMode() {
    return this._darkMode$.value;
  }
  get state() {
    return this._state$.value;
  }
  setMinimized(data, skipUpdate = false) {
    console.log("mini", data, skipUpdate);
  }
  setMaximized(data, skipUpdate = false) {
    console.log("max", data, skipUpdate);
  }
  setState(state, skipUpdate = false) {
    console.log(skipUpdate);
    switch (state) {
      case TELE_BOX_STATE.Maximized: {
        break;
      }
      case TELE_BOX_STATE.Minimized: {
        break;
      }
    }
    return this;
  }
  create(config = {}, smartPosition = true) {
    const id = config.id || r$1();
    const managerMaximized$ = this.maximizedBoxes$.value.includes(id);
    const managerMinimized$ = this.maximizedBoxes$.value.includes(id);
    const box = new TeleBox({
      zIndex: this.topBox ? this.topBox.zIndex + 1 : 100,
      ...smartPosition ? this.smartPosition(config) : config,
      darkMode: this.darkMode,
      prefersColorScheme: this.prefersColorScheme,
      maximized: managerMaximized$,
      minimized: managerMinimized$,
      fence: this.fence,
      namespace: this.namespace,
      containerRect: this.containerRect,
      readonly: this.readonly,
      collectorRect: this.collectorRect,
      id,
      appReadonly: this.appReadonly,
      addObserver: (el, cb) => {
        const observer = this.elementObserverMap.get(id);
        if (!observer) {
          this.elementObserverMap.set(id, [{ el, cb }]);
        } else {
          observer.push({ el, cb });
        }
        this.callbackManager.addCallback(cb);
        this.sizeObserver.observe(el);
      }
    });
    box.mount(this.root);
    if (box.focus) {
      this.focusBox(box);
      if (smartPosition) {
        this.makeBoxTop(box);
      }
    }
    this.boxes$.setValue([...this.boxes, box]);
    box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Maximize, () => {
      this.setMaximizedBoxes(this.boxes$.value.map((item) => item.id));
      this.maxTitleBar.focusBox(box);
      this.externalEvents.emit(TELE_BOX_MANAGER_EVENT.Maximized, [box.id]);
    });
    box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Minimize, () => {
      this.setMinimizedBoxes([...this.minimizedBoxes$.value, id]);
      this.externalEvents.emit(TELE_BOX_MANAGER_EVENT.Minimized, [box.id]);
    });
    box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Close, () => {
      this.remove(box);
      this.makeBoxTopFromMaximized(box.id);
      this.focusTopBox();
      this.externalEvents.emit(TELE_BOX_MANAGER_EVENT.Removed, [box]);
    });
    box._coord$.reaction((_, __, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_MANAGER_EVENT.Move, box);
      }
    });
    box._size$.reaction((_, __, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_MANAGER_EVENT.Resize, box);
      }
    });
    box._intrinsicCoord$.reaction((_, __, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_MANAGER_EVENT.IntrinsicMove, box);
      }
    });
    box._intrinsicSize$.reaction((_, __, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_MANAGER_EVENT.IntrinsicResize, box);
      }
    });
    box._visualSize$.reaction((_, __, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_MANAGER_EVENT.VisualResize, box);
      }
    });
    box._zIndex$.reaction((_, __, skipUpdate) => {
      if (this.boxes.length > 0) {
        const topBox = this.boxes.reduce(
          (topBox2, box2) => topBox2.zIndex > box2.zIndex ? topBox2 : box2
        );
        this.topBox$.setValue(topBox);
      }
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_MANAGER_EVENT.ZIndex, box);
      }
    });
    this.events.emit(TELE_BOX_MANAGER_EVENT.Created, box);
    return box;
  }
  query(config) {
    return config ? this.boxes.filter(this.teleBoxMatcher(config)) : [...this.boxes];
  }
  queryOne(config) {
    return config ? this.boxes.find(this.teleBoxMatcher(config)) : this.boxes[0];
  }
  update(boxID, config, skipUpdate = false) {
    const box = this.boxes.find((box2) => box2.id === boxID);
    if (box) {
      return this.updateBox(box, config, skipUpdate);
    }
  }
  updateAll(config, skipUpdate = false) {
    this.boxes.forEach((box) => {
      this.updateBox(box, config, skipUpdate);
    });
  }
  remove(boxOrID, skipUpdate = false) {
    var _a;
    const index2 = this.getBoxIndex(boxOrID);
    if (index2 >= 0) {
      const boxes = this.boxes.slice();
      const deletedBoxes = boxes.splice(index2, 1);
      this.boxes$.setValue(boxes);
      deletedBoxes.forEach((box) => box.destroy());
      const boxId = (_a = this.getBox(boxOrID)) == null ? void 0 : _a.id;
      if (boxId) {
        this.setMaximizedBoxes(removeByVal(this.maximizedBoxes$.value, boxId));
        this.setMinimizedBoxes(removeByVal(this.minimizedBoxes$.value, boxId));
        const observeData = this.elementObserverMap.get(boxId);
        if (observeData) {
          observeData.forEach(({ el, cb }) => {
            this.callbackManager.removeCallback(cb);
            this.sizeObserver.unobserve(el);
            this.elementObserverMap.delete(boxId);
          });
        }
      }
      if (!skipUpdate) {
        if (this.boxes.length <= 0) {
          this.setMaximizedBoxes([]);
          this.setMinimizedBoxes([]);
        }
        this.events.emit(TELE_BOX_MANAGER_EVENT.Removed, deletedBoxes);
      }
      return deletedBoxes[0];
    }
    return;
  }
  removeTopBox() {
    if (this.topBox) {
      return this.remove(this.topBox);
    }
    return;
  }
  removeAll(skipUpdate = false) {
    const deletedBoxes = this.boxes$.value;
    this.boxes$.setValue([]);
    deletedBoxes.forEach((box) => box.destroy());
    this.sizeObserver.disconnect();
    this.elementObserverMap = /* @__PURE__ */ new Map();
    this.callbackManager.removeAll();
    if (!skipUpdate) {
      if (this.boxes.length <= 0) {
        this.setMaximizedBoxes([]);
        this.setMinimizedBoxes([]);
      }
      this.events.emit(TELE_BOX_MANAGER_EVENT.Removed, deletedBoxes);
    }
    return deletedBoxes;
  }
  destroy(skipUpdate = false) {
    this.events.removeAllListeners();
    this._sideEffect.flushAll();
    this.removeAll(skipUpdate);
    this.sizeObserver.disconnect();
    this.callbackManager.removeAll();
    Object.keys(this).forEach((key) => {
      const value = this[key];
      if (value instanceof r) {
        value.destroy();
      }
    });
  }
  wrapClassName(className) {
    return `${this.namespace}-${className}`;
  }
  focusBox(boxOrID, skipUpdate = false) {
    const targetBox = this.getBox(boxOrID);
    if (targetBox) {
      this.boxes.forEach((box) => {
        if (targetBox === box) {
          let focusChanged = false;
          if (!targetBox.focus) {
            focusChanged = true;
            targetBox.setFocus(true, skipUpdate);
          }
          if (focusChanged && !skipUpdate) {
            this.events.emit(TELE_BOX_MANAGER_EVENT.Focused, targetBox);
          }
        } else if (box.focus) {
          this.blurBox(box, skipUpdate);
        }
      });
      if (this.maximizedBoxes$.value.length > 0) {
        if (this.maximizedBoxes$.value.includes(targetBox.id)) {
          this.maxTitleBar.focusBox(targetBox);
        }
      } else {
        this.maxTitleBar.focusBox(targetBox);
      }
    }
  }
  focusTopBox() {
    if (this.topBox && !this.topBox.focus) {
      return this.focusBox(this.topBox);
    }
  }
  blurBox(boxOrID, skipUpdate = false) {
    const targetBox = this.getBox(boxOrID);
    if (targetBox) {
      if (targetBox.focus) {
        targetBox.setFocus(false, skipUpdate);
        if (!skipUpdate) {
          this.events.emit(TELE_BOX_MANAGER_EVENT.Blurred, targetBox);
        }
      }
    }
  }
  blurAll(skipUpdate = false) {
    this.boxes.forEach((box) => {
      if (box.focus) {
        box.setFocus(false, skipUpdate);
        if (!skipUpdate) {
          this.events.emit(TELE_BOX_MANAGER_EVENT.Blurred, box);
        }
      }
    });
    if (this.maxTitleBar.focusedBox) {
      this.maxTitleBar.focusBox();
    }
  }
  setScaleContent(appId, scale2) {
    const box = this.boxes.find((item) => item.id == appId);
    if (box) {
      box.setScaleContent(scale2);
    }
  }
  teleBoxMatcher(config) {
    const keys = Object.keys(config);
    return (box) => keys.every((key) => config[key] === box[key]);
  }
  updateBox(box, config, skipUpdate = false) {
    if (config.x != null || config.y != null) {
      box.move(
        config.x == null ? box.intrinsicX : config.x,
        config.y == null ? box.intrinsicY : config.y,
        skipUpdate
      );
    }
    if (config.width != null || config.height != null) {
      box.resize(
        config.width == null ? box.intrinsicWidth : config.width,
        config.height == null ? box.intrinsicHeight : config.height,
        skipUpdate
      );
    }
    if (config.title != null) {
      box.setTitle(config.title);
      this.maxTitleBar.updateTitles();
    }
    if (config.visible != null) {
      box.setVisible(config.visible, skipUpdate);
    }
    if (config.minHeight != null) {
      box.setMinHeight(config.minHeight, skipUpdate);
    }
    if (config.minWidth != null) {
      box.setMinWidth(config.minWidth, skipUpdate);
    }
    if (config.resizable != null) {
      box.setResizable(config.resizable, skipUpdate);
    }
    if (config.draggable != null) {
      box.setDraggable(config.draggable, skipUpdate);
    }
    if (config.fixRatio != null) {
      box.setFixRatio(config.fixRatio, skipUpdate);
    }
    if (config.zIndex != null) {
      box.setZIndex(config.zIndex, skipUpdate);
    }
    if (config.content != null) {
      box.mountContent(config.content);
    }
    if (config.footer != null) {
      box.mountFooter(config.footer);
    }
    box.setMaximized(!!config.maximized, skipUpdate);
    box.setMinimized(!!config.minimized, skipUpdate);
  }
  smartPosition(config = {}) {
    let { x, y } = config;
    const { width = 0.5, height = 0.5 } = config;
    if (x == null) {
      let vx = 20;
      if (this.topBox) {
        vx = this.topBox.intrinsicX * this.containerRect.width + 20;
        if (vx > this.containerRect.width - width * this.containerRect.width) {
          vx = 20;
        }
      }
      x = vx / this.containerRect.width;
    }
    if (y == null) {
      let vy = 20;
      if (this.topBox) {
        vy = this.topBox.intrinsicY * this.containerRect.height + 20;
        if (vy > this.containerRect.height - height * this.containerRect.height) {
          vy = 20;
        }
      }
      y = vy / this.containerRect.height;
    }
    return { ...config, x, y, width, height };
  }
  makeBoxTop(box, skipUpdate = false) {
    if (this.topBox) {
      if (box !== this.topBox) {
        if (this.maximizedBoxes$.value.includes(box.id)) {
          const newIndex = this.topBox.zIndex + 1;
          const normalBoxesIds = excludeFromBoth(
            this.boxes$.value.map((item) => item.id),
            this.maximizedBoxes$.value,
            this.minimizedBoxes$.value
          );
          const normalBoxes = this.boxes$.value.filter(
            (box2) => normalBoxesIds.includes(box2.id)
          );
          box._zIndex$.setValue(newIndex, skipUpdate);
          normalBoxes.sort((a, b) => a._zIndex$.value - b._zIndex$.value).forEach((box2, index2) => {
            box2._zIndex$.setValue(newIndex + 1 + index2, skipUpdate);
          });
        } else {
          box._zIndex$.setValue(this.topBox.zIndex + 1, skipUpdate);
        }
      }
    }
  }
  makeBoxTopFromMaximized(boxId) {
    let maxIndexBox = void 0;
    if (boxId) {
      if (this.maximizedBoxes$.value.includes(boxId) && !this.minimizedBoxes$.value.includes(boxId)) {
        maxIndexBox = this.boxes$.value.find((box) => box.id === boxId);
      }
    } else {
      const nextFocusBoxes = this.boxes$.value.filter((box) => {
        var _a;
        return box.id != ((_a = this.maxTitleBar.focusedBox) == null ? void 0 : _a.id) && this.maximizedBoxes$.value.includes(box.id) && !this.minimizedBoxes$.value.includes(box.id);
      });
      maxIndexBox = nextFocusBoxes.length ? nextFocusBoxes.reduce((maxItem, current) => {
        return current._zIndex$.value > maxItem._zIndex$.value ? current : maxItem;
      }) : void 0;
      if (maxIndexBox) {
        this.maxTitleBar.focusBox(maxIndexBox);
      }
    }
    return !!maxIndexBox;
  }
  getBoxIndex(boxOrID) {
    return typeof boxOrID === "string" ? this.boxes.findIndex((box) => box.id === boxOrID) : this.boxes.findIndex((box) => box === boxOrID);
  }
  setMaxTitleFocus(boxOrID) {
    !!this.getBox(boxOrID) && this.maxTitleBar.focusBox(this.getBox(boxOrID));
  }
  getBox(boxOrID) {
    return typeof boxOrID === "string" ? this.boxes.find((box) => box.id === boxOrID) : boxOrID;
  }
}
export { DefaultTitleBar, TELE_BOX_COLOR_SCHEME, TELE_BOX_DELEGATE_EVENT, TELE_BOX_EVENT, TELE_BOX_MANAGER_EVENT, TELE_BOX_RESIZE_HANDLE, TELE_BOX_STATE, TeleBox, TeleBoxCollector, TeleBoxDragHandleType, TeleBoxManager };
//# sourceMappingURL=telebox-insider.es.js.map
