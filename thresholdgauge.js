define(function(require){
  var
    element,
    aboveThresholdArc,
    belowThresholdArc,
    valueArc,
    transformProperty,
    value,
    minValue,
    maxValue,
    thresholdValue;

  var defaults = {
    val: 0.0,
    min: 0.0,
    max: 150.0,
    threshold: 100.0
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

    var turns = getScalarThreshold() * 0.5;
    belowThresholdArc.style[transformProperty] = "rotate(" + (turns - 0.5) + "turn)";
    aboveThresholdArc.style[transformProperty] = "rotate(" + turns + "turn)";
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

    var turns = -0.5 + (getScalarValue() * 0.5);
    valueArc.style[transformProperty] = "rotate(" + turns + "turn)";
  }

  var getScalarThreshold = function() {
    // threshold as a percentage of min->max
    return (thresholdValue - minValue) / (maxValue - minValue);
  }

  var getScalarValue = function() {
    // value as a percentage of min->max
    return (value - minValue) / (maxValue - minValue);
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

    belowThresholdArc = document.createElement("DIV");
    belowThresholdArc.classList.add('threshold_gauge_below_threshold_arc');
    gaugeContainer.appendChild(belowThresholdArc);

    valueArc = document.createElement("DIV");
    valueArc.classList.add('threshold_gauge_value_arc');
    gaugeContainer.appendChild(valueArc);

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
  gauge.prototype.axis = function(min, max, threshold) {
    if (!arguments.length) return {min: minValue, max: maxValue, threshold: thresholdValue};
    setMinMaxThreshold(min, max, threshold);
    return this;
  };

  var body = document.getElementsByTagName("body")[0];
  ["webkitTransform", "mozTransform", "msTransform", "oTransform", "transform"].
    forEach(function(p) {
  	  if (typeof body.style[p] !== "undefined") { transformProperty = p; }
  	});

  return gauge;
});
