window.addEventListener('load', function() {
  this.getRand = function(min, outOf) {
    var rand = Math.round(Math.random() * outOf);
    return rand > min ? rand : getRand(min, outOf);
  }

  color = 'rgb(' + [getRand(0, 200), getRand(0, 200), getRand(0, 200)].join() + ')';

  namespace = "http://www.w3.org/2000/svg";

  var canvasWidth, canvasHeight, origin, resize, squareSize;

  (resize = function() { 
    $('.full-page').attr({
      width: canvasWidth = $(window).width() - 20,
      height: canvasHeight = $(window).height() - 20
    });

    squareSize = canvasWidth / 25;
    origin = {
      x: getRand(squareSize, canvasWidth - squareSize),
      y: getRand(squareSize, canvasHeight - squareSize)
    }

    $('#x-axis').attr({ x1: 0, y1: origin.y, x2: canvasWidth, y2: origin.y });
    $('#y-axis').attr({ x1: origin.x, y1: 0, x2: origin.x, y2: canvasHeight });

    $('#grid').empty();

    [-1, 1].forEach(function(dir) {
      for(var x = origin.x + dir * squareSize; x > 0 && x < canvasWidth; x += dir * squareSize) {
        $($('#grid')[0].appendChild(
          document.createElementNS(namespace, 'line')
        )).attr({
          x1: x, y1: 0, x2: x, y2: canvasHeight,
          stroke: 'black', 'stroke-width': 0.5, 'stroke-dasharray': '5'
        });
      }
      for(var y = origin.y + dir * squareSize; y > 0 && y < canvasHeight; y += dir * squareSize) {
        $($('#grid')[0].appendChild(
          document.createElementNS(namespace, 'line')
        )).attr({
          x1: 0, y1: y, x2: canvasWidth, y2: y,
          stroke: 'black', 'stroke-width': 0.5, 'stroke-dasharray': '5'
        });
      }
    });

    $('#angle-line').attr({
      stroke: color,
      x1: origin.x,
      y1: origin.y,
      x2: origin.x,
      y2: origin.y
    });

    $('#angle-arc').attr('stroke', color);

    $('#angle-text').attr({
      fill: color,
      x: origin.x + squareSize / 4,
      y: origin.y + squareSize / 4 + 10
    })[0];
  })();

  $(window).mousemove(function(e) {
    $('#angle-line').attr({
      x2: e.pageX - 10,
      y2: e.pageY - 10
    });
    var adjacent = e.pageX - 10 - origin.x;
    var opposite = e.pageY - 10 - origin.y;
    var angle = Math.atan(opposite / adjacent);
    var sweep = 1;
    if(adjacent > 0 && opposite > 0) { sweep = 1; }
    if(adjacent < 0 && opposite > 0) { angle += Math.PI; sweep = 1; }
    if(adjacent < 0 && opposite < 0) { angle += Math.PI; sweep = 0; }
    if(adjacent > 0 && opposite < 0) { angle += 2 * Math.PI; sweep = 0; }
    var newEnd = {
      x: origin.x + squareSize / 4 * Math.cos(angle),
      y: origin.y + squareSize / 4 * Math.sin(angle)
    }
    $('#angle-arc').attr('d',
      'M ' + (origin.x + squareSize / 4) + ' ' +
      origin.y + 'A ' + (squareSize / 4) + ' ' +
      (squareSize / 4) + ' 0 ' + sweep + ' 0 ' +
      newEnd.x + ' ' + newEnd.y
    );
    $('#angle-text').text(Math.round((2 * Math.PI - angle) / Math.PI * 180) + unescape('\xB0'));

    makeLogo();
  });

  makeTextBubble('about', 'f(x) software is a', 'small, independent', 'software and website', 'development shop in', 'Northern Virginia.');
  makeTextBubble('contact', 'Find out what we', 'can do for you:', 'joe@fofx-software.com');
  makeTextBubble('websites', 'Full websites', 'built from scratch,', 'customized to', 'your needs.');
  makeTextBubble('software', 'Powerful web and', 'desktop applications', 'to solve any', 'challenge.');

  $('#canvas').on('mousedown', '.moveable', function() {
    $(this).attr('class', $(this).attr('class').replace('moveable', 'moving'));
  });
  $('#canvas').on('mouseup', '.moving', function() {
    $(this).attr('class', $(this).attr('class').replace('moving', 'moveable'));
  });

  $(window).resize(resize);
}, false);

function makeTextBubble(elementId, altText) {
  var svg = $('#' + elementId)[0];
  var bubble = $('#bubble-' + elementId)[0];
  var text = $('#text-' + elementId)[0];

  var mainText = [$(text).text()];
  altText = Array.prototype.slice.call(arguments, 1);

  $(bubble).attr('fill', color );

  var _this = this;

  var center = [
    getRand($('#canvas').attr('width') * 1/8,  $('#canvas').attr('width') * 7/8),
    getRand($('#canvas').attr('height') * 1/8, $('#canvas').attr('height') * 7/8)
  ];

  $(bubble).attr({
    cx: center[0],
    cy: center[1],
    r: text.getBBox().width / 2 + 5
  });

  $(text).attr({
    x: center[0],
    y: center[1],
  });

  $(svg).mouseenter(function() { reText(altText); });
  $(svg).mouseleave(function() { reText(mainText); });

  $(svg).mousedown(function(e) {
    var diff = {
      x: e.pageX - center[0],
      y: e.pageY - center[1]
    }
    var moveTextBubble;
    $(window).mousemove(moveTextBubble = function(e) {
      center = [e.pageX - diff.x, e.pageY - diff.y];
      $(bubble).attr({ cx: center[0], cy: center[1] });
      reText(altText);
    });
    var cancelMoveTextBubble;
    $(window).mouseup(cancelMoveTextBubble = function() {
      $(window).off('mousemove', moveTextBubble);
      $(window).off('mouseup', cancelMoveTextBubble);
    });
  });

  var reText = function(textArray) {
    var topY = center[1] - (textArray.length - 1) * 10 + 5;
    $(text).empty();
    $.each(textArray, function(i) {
      $(text).append(
        $(document.createElementNS(namespace, 'tspan'))
          .text(this)
          .attr({ x: center[0], y: topY + i * 20 })
      );
    });
    $(bubble).attr('r', text.getBBox().width / 2 + 10);
  }

  reText(mainText);
}

function makeLogo() {
  $('#logo').empty();
  var logo = $('#logo')[0];
 
  var period = $('body').width() / 10;
  var scale = period / Math.PI;
 
  var y = function(xx) { return -scale * Math.sin((xx - period / 2) / scale); }
  var fLength = period * 1.5;

  var rect = $(logo.appendChild(
    document.createElementNS(namespace, 'rect')
  )).attr({
    x: 0, y: 0, width: fLength + 10, height: y(0) * 2 + 10,
    fill: 'white', stroke: color, 'stroke-width': 1
  });

  var points = '';
  for(var x = 0; x < fLength; x++) { points += x + ',' + (y(x) + y(0)) + ' '; }
  points += '0,' + (y(period / 2) + y(0));

  $($(logo.appendChild(
    document.createElementNS(namespace, 'svg')
  )).attr({ x: 5, y: 5 })[0].appendChild(
    document.createElementNS(namespace, 'polygon')
  )).attr({
    points: points,
    fill: color
  })[0];

  $(logo.appendChild(
    document.createElementNS(namespace, 'text')
  )).attr({
    x: period / 2 + 5,
    y: y(period / 2 + 5) + y(0) + 25,
    fill: color
  }).css('font', 'italic 15px sans-serif')
    .text('(x) software');

  $(logo).mousedown(function(e) {
    $(this).css('cursor', 'grabbing');
    var diff = {
      x: e.pageX - $(logo).attr('x'),
      y: e.pageY - $(logo).attr('y')
    }
    var moveLogo;
    $(window).mousemove(moveLogo = function(e) {
      var corner = [e.pageX - diff.x, e.pageY - diff.y];
      $(logo).attr({ x: corner[0], y: corner[1] });
    });
    $(window).mouseup(function() {
      $(window).off('mousemove', moveLogo);
      $(logo).css('cursor', 'grab');
    });
  });
}
