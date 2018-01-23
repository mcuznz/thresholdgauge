requirejs.config({
    baseUrl: ''
});

// Start the main app logic.
requirejs(['thresholdgauge'],
function (thresholdGauge) {
  setTImeout(function() {
    var el = document.getElementById('svg_container');
    var gauge = new thresholdGauge({
      el: el,
      min: 0,
      max: 250,
      threshold: 200,
      value: 80,
      target: 120
    });
    window.gauge = gauge;
  }, 1000);
});
