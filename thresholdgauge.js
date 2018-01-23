define(function(require){
  var
    element,
    aboveThresholdArc,
    belowThresholdArc,
    valueArc,
    valueNeedle,
    targetArc,
    targetNeedle,
    transformProperty,
    value,
    minValue,
    maxValue,
    targetValue,
    thresholdValue;

  var defaults = {
    val: 0.0,
    min: 0.0,
    max: 150.0,
    threshold: 100.0,
    target: null
  };

  var setElement = function(el){
    element = el;
    if (!element.classList.contains('threshold_gauge')) {
      element.classList.add('threshold_gauge');
    }
    createOrDefineElements();
  }

  var setMinMaxThreshold = function (min, max, threshold) {
    // Make sure the numbers make sense...
    if (max < min || threshold > max || threshold < min) return;

    minValue = min;
    maxValue = max;
    thresholdValue = threshold;

    element.setAttribute('data-min', min);
    element.setAttribute('data-max', max);
    element.setAttribute('data-threshold', threshold);

    // Some sanity for the current value
    if (value < minValue) setValue(minValue);
    if (value > maxValue) setValue(maxValue);

    // Some sanity for the current target
    if (targetValue !== null && targetValue < minValue) setTarget(null);
    if (targetValue !== null && targetValue > maxValue) setValue(null);

    var turns = getScalarNumber(thresholdValue) * 0.5;
    belowThresholdArc.style[transformProperty] = "rotate(" + (turns - 0.5) + "turn)";
    aboveThresholdArc.style[transformProperty] = "rotate(" + turns + "turn)";
  }

  var setTarget = function (val) {
    if (val == null || val < minValue || val > maxValue) {
      val = null;
      element.classList.add('no_target');
      element.setAttribute('data-target', targetValue);
    }

    targetValue = val;
    element.setAttribute('data-target', targetValue);

    if (targetValue !== null) {
      element.classList.remove('no_target');
      var turns = -0.5 + (getScalarNumber(targetValue) * 0.5);
      targetArc.style[transformProperty] = "rotate(" + turns + "turn)";
      targetNeedle.style[transformProperty] = "rotate(" + turns + "turn)";
    }

  }

  var setValue = function (val) {
    if (val > thresholdValue) {
      element.classList.add('value_exceeds_threshold');
    } else {
      element.classList.remove('value_exceeds_threshold');
    }

    if (val > maxValue) {
      element.classList.add('value_exceeds_maximum');
    } else {
      element.classList.remove('value_exceeds_maximum');
    }

    if (val < minValue) {
      element.classList.add('value_below_minimum');
    } else {
      element.classList.remove('value_below_minimum');
    }

    value = Math.min(Math.max(val, minValue), maxValue);

    element.setAttribute('data-true-value', val);
    element.setAttribute('data-value', value);

    var turns = -0.5 + (getScalarNumber(value) * 0.5);
    valueArc.style[transformProperty] = "rotate(" + turns + "turn)";
    valueNeedle.style[transformProperty] = "rotate(" + turns + "turn)";
  }

  var getScalarNumber = function(which) {
    return (which - minValue) / (maxValue - minValue);
  }

  var thresholdExceeded = function() {
    return value >= threshold;
  }

  var createOrDefineElements = function() {
    // Assume this EL indicates that the whole parent div was set up correctly
    var gaugeContainer = element.querySelector('.threshold_gauge_container');
    if (gaugeContainer) {
      aboveThresholdArc = element.querySelector('.threshold_gauge_above_threshold_arc');
      belowThresholdArc = element.querySelector('.threshold_gauge_below_threshold_arc');
      valueArc = element.querySelector('.threshold_gauge_value_arc');
      return;
    }

    gaugeContainer = document.createElement("DIV");
    gaugeContainer.classList.add('threshold_gauge_container');
    element.appendChild(gaugeContainer);

    // Now create the rest of the necessary elements
    aboveThresholdArc = document.createElement("DIV");
    aboveThresholdArc.classList.add('threshold_gauge_above_threshold_arc');
    gaugeContainer.appendChild(aboveThresholdArc);

    var gaugeCenter = document.createElement("DIV");
    gaugeCenter.classList.add('threshold_gauge_center');
    gaugeContainer.appendChild(gaugeCenter);

    var gaugeOverflowCover = document.createElement("DIV");
    gaugeOverflowCover.classList.add('threshold_gauge_overflow_cover');
    gaugeContainer.appendChild(gaugeOverflowCover);

    belowThresholdArc = document.createElement("DIV");
    belowThresholdArc.classList.add('threshold_gauge_below_threshold_arc');
    gaugeContainer.appendChild(belowThresholdArc);

    targetArc = document.createElement("DIV");
    targetArc.classList.add('threshold_gauge_target_arc');
    gaugeContainer.appendChild(targetArc);

    valueArc = document.createElement("DIV");
    valueArc.classList.add('threshold_gauge_value_arc');
    gaugeContainer.appendChild(valueArc);

    // Now let's make our Needles!
    targetNeedle = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    targetNeedle.classList.add('threshold_gauge_target_needle');
    targetNeedle.setAttributeNS(null, 'width', 500);
    targetNeedle.setAttributeNS(null, 'height', 500);
    targetNeedle.setAttributeNS(null, 'viewBox', '0 0 500 500');
    gaugeContainer.appendChild(targetNeedle);

    var targetNeedlePolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    // targetNeedlePolygon.style.fill = 'rgb(64,64,64)';
    // targetNeedlePolygon.style.stroke = 'rgb(0,0,0)';
    // targetNeedlePolygon.style['stroke-width'] = 1;
    // targetNeedlePolygon.style['fill-rule'] = 'initial';

    // See if there are CSS-defined points to allow overriding
    var targetNeedlePoints = '';
    if (typeof window.getComputedStyle !== 'undefined') {
      targetNeedlePoints = window.getComputedStyle(targetNeedle, null).getPropertyValue('--points');
    } else {
      targetNeedlePoints = targetNeedle.currentStyle['--points'];
    }
    // Fallback to a sensible default
    targetNeedlePoints = targetNeedlePoints || "240,250 250,240 470,250 250,260";

    targetNeedlePolygon.setAttributeNS(null, 'points', targetNeedlePoints);
    targetNeedle.appendChild(targetNeedlePolygon);

    valueNeedle = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    valueNeedle.classList.add('threshold_gauge_value_needle');
    valueNeedle.setAttributeNS(null, 'width', 500);
    valueNeedle.setAttributeNS(null, 'height', 500);
    valueNeedle.setAttributeNS(null, 'viewBox', '0 0 500 500');
    gaugeContainer.appendChild(valueNeedle);

    var valueNeedlePolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    // valueNeedlePolygon.style.fill = 'rgb(64,64,64)';
    // valueNeedlePolygon.style.stroke = 'rgb(0,0,0)';
    // valueNeedlePolygon.style['stroke-width'] = 1;
    // valueNeedlePolygon.style['fill-rule'] = 'initial';

    // See if there are CSS-defined points to allow overriding
    var valueNeedlePoints = '';
    if (typeof window.getComputedStyle !== 'undefined') {
      valueNeedlePoints = window.getComputedStyle(valueNeedle, null).getPropertyValue('--points');
    } else {
      valueNeedlePoints = valueNeedle.currentStyle['--points'];
    }
    // Fallback to a sensible default
    valueNeedlePoints = valueNeedlePoints || "240,250 250,240 470,250 250,260";

    valueNeedlePolygon.setAttributeNS(null, 'points', valueNeedlePoints);
    valueNeedle.appendChild(valueNeedlePolygon);

    // TODO Add Labels?
  }

  var gauge = function(o) {
    var values = _.extend({}, defaults);
    if (o && typeof o == 'object') {
      values = _.extend({}, defaults, o);
    }

    if (!values.el) {
      console.log("option:el required");
      return;
    }

    setElement(values.el);
    setMinMaxThreshold(values.min, values.max, values.threshold);
    setValue(values.value);
    setTarget(values.target);
	};

  gauge.prototype.element = function(el) {
    if (!arguments.length) return element;
    setElement(el);
    return this;
  };
  gauge.prototype.value = function(val) {
    if (!arguments.length) return value;
    setValue(val);
    return this;
  };
  gauge.prototype.target = function(val) {
    if (!arguments.length) return targetValue;
    setTarget(val);
    return this;
  };
  gauge.prototype.axis = function(min, max, threshold) {
    if (!arguments.length) return {min: minValue, max: maxValue, threshold: thresholdValue};
    setMinMaxThreshold(min, max, threshold);
    return this;
  };

  var body = document.getElementsByTagName("body")[0];
  console.log("B", body);
  if (body) {
    ["webkitTransform", "mozTransform", "msTransform", "oTransform", "transform"].
      forEach(function(p) {
    	  if (typeof body.style[p] !== "undefined") { transformProperty = p; }
    	});
  } else {
    // Just fall back...
    transformProperty = 'transform';
  }

  return gauge;
});
