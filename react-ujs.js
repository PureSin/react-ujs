// Unobtrusive scripting adapter for React
var React = require('react/addons');

(function(document, window, React) {
  var CLASS_NAME_ATTR = 'data-react-class';
  var PROPS_ATTR = 'data-react-props';

  // jQuery is optional. Use it to support legacy browsers.
  var $ = (typeof jQuery !== 'undefined') && jQuery;

  var findReactDOMNodes = function() {
    var SELECTOR = '[' + CLASS_NAME_ATTR + ']';
    if ($) {
      return $(SELECTOR);
    } else {
      return document.querySelectorAll(SELECTOR);
    }
  };

  var mountReactComponents = function(componentLibrary) {
    var nodes = findReactDOMNodes();

    for (var i = 0; i < nodes.length; ++i) {
      var node = nodes[i];
      var className = node.getAttribute(CLASS_NAME_ATTR);
      // Assume className is simple and can be found at top-level (window).
      // Fallback to eval to handle cases like 'My.React.ComponentName'.
      constructor = componentLibrary[className] || eval.call(componentLibrary, className)
      var propsJson = node.getAttribute(PROPS_ATTR);
      var props = propsJson && JSON.parse(propsJson);
      React.render(React.createElement(constructor, props), node);
    }
  };

  var unmountReactComponents = function() {
    var nodes = findReactDOMNodes();
    for (var i = 0; i < nodes.length; ++i) {
      React.unmountComponentAtNode(nodes[i]);
    }
  };

  var handleTurbolinksEvents = function(componentLibrary) {
    var handleEvent;
    if ($) {
      handleEvent = function(eventName, callback) {
        $(document).on(eventName, callback);
      }
    } else {
      handleEvent = function(eventName, callback) {
        document.addEventListener(eventName, callback);
      }
    }
    handleEvent('page:change', mountReactComponents.bind(componentLibrary));
    handleEvent('page:receive', unmountReactComponents);
  };

  var handleNativeEvents = function(componentLibrary) {
    if ($) {
      $(mountReactComponents.bind(componentLibrary));
      $(window).unload(unmountReactComponents);
    } else {
      document.addEventListener('DOMContentLoaded', mountReactComponents.bind(componentLibrary));
      window.addEventListener('unload', unmountReactComponents);
    }
  };

  module.exports = {
    loadReactComponents: function(componentLibrary) {
      typeof Turbolinks !== 'undefined' ? handleTurbolinksEvents(componentLibrary) : handleNativeEvents(componentLibrary);
    }
  }
})(document, window, React);
