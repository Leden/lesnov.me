(function(){
  var originalHash = window.location.hash;
  window.location.hash = '';

  var φ = (Math.sqrt(5) + 1)/2;

  var scrolledDown = (function(){
    var lastYOffset = 0;
    return function () {
      var current = window.pageYOffset;
      var result = current > lastYOffset;
      lastYOffset = current;
      return result;
    }
  })();

  var getOffset = function(element){
    return window.pageYOffset + element.getBoundingClientRect().top;
  };

  var getQueryString = function () {
    var bits = [];
    for (var i=2; i<=6; i++) {
      bits.push('h' + i + '[id]');
    }
    return bits.join(',');
  };

  var anchors = new(function(querySelector) {
    var _anchors = [];

    this.init = function () {
      _anchors = [];
      Array.prototype.forEach.call(
        document.documentElement.querySelectorAll(querySelector),
        function (element) {
          _anchors.push({offset: getOffset(element), id: element.getAttribute('id')});
        }
      );
      _anchors.sort(function (a, b) {
        return a.offset - b.offset;
      });
    };

    this.getNearestAnchor = function (offset) {
      if (_anchors.length) {
        for (var i = _anchors.length - 1; i >= 0; i--) {
          if (_anchors[i].offset < offset) { return _anchors[i].id; }
        }
      }
      return '';
    };

  })(getQueryString());


  var getFreeboard = function(){
    var result = Math.min(window.innerHeight * (2 - φ), window.pageYOffset);
    var htmlBounds = document.documentElement.getBoundingClientRect();
    if (scrolledDown() && (window.innerHeight * φ) > (htmlBounds.height - window.pageYOffset)) {
      result = (window.innerHeight * 2) - htmlBounds.bottom;
    }
    return result;
  };

  var jumpTo = function(hash){
    var elem = document.getElementById(hash);
    var bounds = elem.getBoundingClientRect();
    var coord = bounds.top + bounds.height - (window.innerHeight * (2 - φ)) + window.pageYOffset;
    window.scrollTo(0, coord);

    Array.prototype.forEach.call(document.getElementsByClassName('twinkle'), function(element) {
      element.removeAttribute('class');
    });
    elem.setAttribute('class', 'twinkle');
  };


  window.addEventListener('DOMContentLoaded', function() {
    anchors.init();

    var links = document.documentElement.querySelectorAll('a[href^="#"]');
    Array.prototype.forEach.call(links, function(link){
      link.addEventListener('click', function(e){
        e.preventDefault();
        jumpTo(link.getAttribute('href').substring(1));
      });
    });
  });

  window.addEventListener('load',function () {
    anchors.init();
    if (originalHash) {
      jumpTo(originalHash.substring(1));
      window.history.pushState(null, null, originalHash);
    }
  });

  window.addEventListener('scroll', function() {
    var freeboard = getFreeboard();
    var nearestAnchor = anchors.getNearestAnchor(window.pageYOffset + freeboard);
    nearestAnchor = nearestAnchor ? '#' + nearestAnchor : '';
    if (window.location.hash != nearestAnchor) {
      window.history.pushState(null, null, nearestAnchor || window.location.pathname);
    }
  });
})();
