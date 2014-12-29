$(document).ready(setUp = function() {
  var color = (function(getRand) {
    return 'rgb(' + [getRand(200), getRand(200), getRand(200)].join(',') + ')';
  })(function(outOf) { return Math.round(Math.random() * outOf); });

  $('#explainer').css('background-color', color);

  $('#toprow').empty();
  $('#bottomrow').empty();

  ['home', 'about', 'contact', 'websites', 'software', 'draw'].forEach(function(page, i) {
    if(page === 'home') {
      $(document.createElement('canvas'))
        .attr({
          id: 'logo',
          width: 1,
          height: 1
        })
        .appendTo($('#toprow'));
    } else {
      $(document.createElement('a'))
        .attr('href', pages[page].href || 'javascript:void(0)')
        .addClass('tile' + (i % 3 - 1 ? '' : ' center-tile'))
        .css('color', color)
        .attr('id', 'tile-' + page)
        .append($(document.createElement('span')).addClass('in-tile').text(page))
        .appendTo(i < 3 ? $('#toprow') : $('#bottomrow'))
        .on('click', function() {
          $('#explainer')
            .text(pages[page].explainerText)
            .css('font-size', 'large');
          $(document).attr('title', 'f(x) software: ' + page);
          setUp();
        });
     }
  });

  $('#everything').prepend($('#toprow')).append($('#bottomrow')).on({
    mouseover: function() {
      $(this).css('background-color', color);
      $(this).css('color', 'white');
    },
    mouseout: function() {
      $(this).css('background-color', 'transparent');
      $(this).css('color', color);
    }
  }, 'a.tile');

  var resize = function() {
    $('#logo').hide();

    $('span.in-tile').each(function() {
      $(this).css({ 'font-size': 'xx-large', 'line-height': 'normal'});
    });

    (function setWidths(i) {
      if($('span.in-tile').filter(function() {
        return $(this).outerWidth() >= $('#explainer').outerWidth() / 3 - 10;
      }).length) {
        $('span.in-tile').css('font-size', [
          'x-large', 'large', 'medium', 'small', 'x-small', 'xx-small'
        ][i]);
        if(i < 6) setWidths(i + 1);
      } else {
        $('.tile').each(function() {
          $(this).width(
            Math.floor($('#explainer').outerWidth() / 3 - ($(this).hasClass('center-tile') ? 2 : 0))
          );
        });
      }
    })(0);

    (function setHeights(explainerHeight) {
      if($('span.in-tile').outerHeight() * 2 + explainerHeight < $(window).height() - 10) {
        $('span.in-tile').each(function() {
          $(this).css('line-height', ($(window).height() - 10 - explainerHeight) / 2 + 'px');
        });
      }
    })($('#explainer').outerHeight());

    $('#logo')
      .attr({
        height: $('a.tile').height(),
        width: $('a.tile').outerWidth()
      }).show();

    drawLogo(color);
  }

  resize();
  
  $(window).on('resize', resize);
});

function sineGraph(period, ctx) {
  var scale = period / Math.PI;
  var x = -period / 2;
  var startX = x;
  var y = -scale * Math.sin(x / scale);
  ctx.beginPath();
    var highest = scale * Math.sin(period / 2 / scale);
    for(; Math.round(x) <= Math.round(period / 2); x += period / 24) {
      ctx.moveTo(x, -highest);
      ctx.lineTo(x, highest);
    }
  ctx.stroke();
  x = startX;
  ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, y);
    do {
      x++;
      ctx.lineTo(x, -scale * Math.sin(x / scale));
    } while(x < period / 2);
    ctx.lineTo(x, 0);
    ctx.lineTo(startX, 0);
  ctx.stroke();
  ctx.fill();
}

// make once, then make <img> for smoother resizing

function drawLogo(color) {
  var cvs = $('#logo')[0];
  var ctx = cvs.getContext('2d');
  var least = Math.min(cvs.height, cvs.width) - 10;
  var period = least;
  var highestPoint = (period/Math.PI) * Math.sin(period/2 / (period/Math.PI));
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.save();
    ctx.translate(cvs.width / 2, cvs.height / 2);
    ctx.fillStyle = 'white';
    ctx.fillRect(-period / 2, -highestPoint, period, highestPoint * 2);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    sineGraph(period, ctx);
    ctx.save();
      ctx.textAlign = 'center';
      var fontSize = period / 15;
      ctx.font = fontSize + 'px serif';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = 'white';
      ctx.fillText('f(x) software', 0, -highestPoint - 5);
    ctx.restore();
  ctx.restore();
}

var pages = {
  home: { },

  about: {
    explainerText: 'custom websites, logos, graphic design, and software solutions for small to medium-sized businesses and organizations'
  },

  contact: {
    explainerText: 'joe@fofx-software.com'
  },

  websites: {
    explainerText: 'websites, logos and graphic design'
  },

  software: {
    explainerText: 'custom software, web and mobile applications'
  },

  draw: {
    href: 'draw.html'
  }
};
