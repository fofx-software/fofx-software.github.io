$(document).ready(function() {
  setupDoc();
  $(window).on('resize', setupDoc);

  $('#frontlayer').on({
    mousemove: function(e) {
      canvas('frontlayer').clear();
      showAxes(Point.from(e));
    }
  });

  Point.refCanvas = canvas('frontlayer');

  (function(oldOn, oldOff) {
    window.eventListeners = {};
    $.prototype.on = function() {
      if(this[0] && this[0].eventListeners) {
        if(this[0].eventListeners[arguments[0]]) {
          this[0].eventListeners[arguments[0]].push(arguments[1]);
        } else {
          this[0].eventListeners[arguments[0]] = [arguments[1]];
        }
      }
      return(oldOn.apply(this, arguments));
    }
    $.prototype.off = function() {
      if(this[0] && this[0].eventListeners) this[0].eventListeners[arguments[0]] = [];
      return(oldOff.apply(this, arguments));
    }
  })($.prototype.on, $.prototype.off);

  $(window).on('keypress', choosePoint);

  commandMode();
});

function choosePoint(e) {
  if(String.fromCharCode(e.which) === '>') {
    getInput('choose point:', 'x, y', function(input) {
      $('#frontlayer')[0].chosenPoint = new Point(input.split(',')[0], input.split(',')[1]);
    });
  }
}

function getInput(promptText, subtextOrCallback, callback) {
  var oldText = $('#infopanel-top').text();
  var promptDiv = $(document.createElement('div')).text(promptText)
    .appendTo($('#infopanel-top').empty());
  var input = $(document.createElement('div')).height(promptDiv.height())
    .appendTo($('#infopanel-top'));
  if(typeof subtextOrCallback === 'string') {
    $('#infopanel-top').append(
      $(document.createElement('div')).text(subtextOrCallback)
    );
  } else {
    callback = subtextOrCallback;
  }
  var oldEventListeners = window.eventListeners['keypress'].slice(0);
  $(window).off('keypress');

  function exitGetInput() {
    $(window).off('keypress');
    $.each(oldEventListeners, function(i, el) {
      $(window).on('keypress', el);
    });
    $('#infopanel-top').text(oldText);
  }

  $(window).on('keypress', function(e) {
    if(e.which === 13) {
      callback(input.text());
      exitGetInput();
    } else if(e.which === 0) {
      exitGetInput();
    } else if(e.which === 46) {
      input.text(input.text().slice(0, -2));
    } else {
      input.text(input.text() + String.fromCharCode(e.which));
    }
  });
}

function setupDoc() {
  $('#infopanel').height($(window).height() - 18); // 18 = body margin (5) * 2 + infopanel padding (3) * 2 + infopanel border (1) * 2
  $('canvas').attr('width', $(window).width() - $('#infopanel').outerWidth(true) - 10);
  $('canvas').attr('height', $('#infopanel').outerHeight());
}

/* buttons */ function addButton(key, text, color, width) {
/*         */   var width = width || ($('#infopanel-buttons').width());
/*         */   $(document.createElement('div'))
/*         */     .addClass('button ' + color)
/*         */     .append($(document.createElement('div'))
/*         */       .addClass('key_segment')
/*         */       .append($(document.createElement('span')).text(key)))
/*         */     .append($(document.createElement('div'))
/*         */       .text(text)
/*         */       .addClass('text_segment')
/*         */       .width(width - 42))
/*         */     .attr('id', 'button-' + key)
/*         */     .appendTo($('#infopanel-buttons'))
/*         */   .find('span').css('line-height', function() {
/*         */     return $(this).parents('.button').children('.text_segment').height() + 'px';
/*         */   });
/*         */   if($('#infopanel-buttons')[0].clientWidth < width) {
/*         */     var buttons = $('.button');
/*         */     var newWidth = $('#infopanel-buttons')[0].clientWidth - 3;
/*         */     $('#infopanel-buttons').empty();
/*         */     buttons.each(function() {
/*         */       addButton(
/*         */         $(this).find('.key_segment').text(),
/*         */         $(this).find('.text_segment').text(),
/*         */         $(this).attr('class').split(' ')[1],
/*         */         newWidth
/*         */       );
/*         */     });
/*         */   }
/*         */ }
/*         */
/*         */ function addButtons() {
/*         */   $.each(arguments, function(i, val) {
/*         */     addButton.apply(null, val);
/*         */   });
/*         */ }
/*         */
/*         */ function replaceButton(key, text, color) {
/*         */   $('#infopanel-buttons').empty();
/*         */   addButton(key, text, color);
/*         */ }
/*         */
/*         */ function replaceButtons() {
/*         */   $('#infopanel-buttons').empty();
/*         */   addButtons.apply(null, arguments);
/* buttons */ }

function commandMode() {
  canvas('middlelayer').clear();

  $('#infopanel-top').text('click on canvas to begin drawing');

  $('#infopanel-buttons').height(
    $('#infopanel').height() -
    $('#infopanel-top').outerHeight(true) -
    $('#infopanel-bottom').outerHeight(true) -
    $('#homelink').outerHeight(true)
  );

  replaceButtons(['>', 'choose point', 'yellow']);

  $('#frontlayer').one('click', function(e) {
    draw(new Line(Point.from(e), Point.from(e)), Point.from(e));
  });
}

function draw(shape, startPoint) {
  $('#infopanel-top').text(shape.name);

  replaceButtons.apply(null, [
    ['a', 'arc'],
    ['b', 'bezier curve'],
    ['c', 'circle'],
    ['e', 'ellipse'],
    ['l', 'line'],
    ['r', 'rectangle']
  ].map(function(arr) {
    return arr.concat('green');
  }));

  var middlelayer = canvas('middlelayer');
  middlelayer.startPoint = startPoint;
  $('#frontlayer')[0].startPoint = startPoint;

  function showShape() {
    middlelayer.clear();
    shape.preview(middlelayer);
    if(globals.showInfoText)
      middlelayer.context.fillText(shape.infoText(), 10, 15);
  }

  var setEnd, onClick, switchShape, lastPoint;

  $('#frontlayer').on({
    mousemove: setEnd = function(e) {
      shape.setEnd(Point.from(e));
      middlelayer.clear();
      showShape();
      lastPoint = Point.from(e);
    },
    click: onClick = function(e) {
      var nextStep = shape.drawSteps.shift();
      if(nextStep) {
        nextStep.call(shape);
      } else {
        commitShape(shape);
        exitDrawMode(Point.from(e));
      }
    },
  });

  function exitDrawMode(point) {
    $('#frontlayer').off('click', onClick);
    $('#frontlayer').off('mousemove', setEnd);
    $(window).off('keydown', switchShape);
    delete $('#frontlayer')[0].startPoint;
    canvas('frontlayer').clear();
    showAxes(point);
    commandMode();
  }

  $(window).on('keydown', switchShape = function(e) {
    if(!e.shiftKey && e.which !== 27) {
      switch(String.fromCharCode(e.which)) {
        case 'A':
          shape = new Arc(startPoint, lastPoint);
        break;
        case 'B':
          shape = new BezierCurve(startPoint, lastPoint);
        break;
        case 'C':
          shape = new Circle(startPoint, lastPoint);
        break;
        case 'E':
          shape = new Ellipse(startPoint, lastPoint);
        break;
        case 'L':
          shape = new Line(startPoint, lastPoint);
        break;
        case 'R':
          shape = new Rectangle(startPoint, lastPoint);
        break;
        default:
          return;
      }
      $('#infopanel-top').text(shape.name);
      showShape();
    } else if(e.which === 27) {
      exitDrawMode(lastPoint);
    }
  });
}

function Canvas(canvas) {
  this.canvas = typeof canvas === "string" ? document.getElementById(canvas) : canvas;
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.context = this.canvas.getContext('2d');
  this.clear = function() {
    this.context.clearRect(0, 0, this.width, this.height);
  }
}

function canvas(cvs) { return new Canvas(cvs); }

function showAxes(point) {
  var frontlayer = canvas('frontlayer');

  if(frontlayer.canvas.startPoint) {
    angle = Angle.from(frontlayer.canvas.startPoint, point);
  } else {
    angle = new Angle(7/4 * Math.PI);
  }
  var textAlignment = globals.textAlignments[(angle.quadrant - 1) % 4];

  frontlayer.context.save();
    frontlayer.context.textAlign = textAlignment.textAlign;
    new AxisPair(point, frontlayer).draw(frontlayer, { lineWidth: 0.5 });
    frontlayer.context.fillText(
      'x: ' + point.x + ', y: ' + point.y,
      point.x + textAlignment.xPlus,
      point.y + textAlignment.yPlus
    );
  frontlayer.context.restore();
}

function commitShape(shape) {
  globals.savedShapes.push(shape);
  shape.draw(canvas('backlayer'));
}

var globals = {
  textAlignments: [
    { xPlus: 15,  yPlus: 20,  textAlign: 'left' },
    { xPlus: -15, yPlus: 20,  textAlign: 'right'},
    { xPlus: -15, yPlus: -15, textAlign: 'right'},
    { xPlus: 15,  yPlus: -15, textAlign: 'left' }
  ],
  savedShapes: [],
  showInfoText: true
}
