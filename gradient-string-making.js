/**
 * Creates a linear gradient function string, to be used as a value for "background-image", for instance. Returns an empty
 * string if the browser does not support the linear-gradient CSS function.
 * Please note that the filter-based gradients supported by IE 5.5 through 8.0 are not considered by this function. If the
 * browser only supports only the filter-based gradients, it will be treated as if it doesn't support linear gradients at all.
 * Please also note that this function expects every browser that implements the "linear-gradient" CSS function to implement
 * them in the same way. This function does not take into account the differences between different implementations of the CSS
 * function.
 *
 * For example:
 *   makeLinearGradientString("top", "#444", "rgba(68, 68, 68, 0)");
 * returns
 *   "-moz-linear-gradient(top,#444,rgba(68, 68, 68, 0))";
 * in both Firefox 3.6 and 15, but returns
 *   "linear-gradient(top,#444,rgba(68, 68, 68, 0))"
 * in Firefox 16.
 *
 * @param {...string} parameters
 * @return {string!}
 */
var makeLinearGradientString = (function() {
	/**
	 * Returns an empty string. Used as a "null"-ish implementation.
	 *
	 * @return {string!}
	 */
	function nullImplementation() {
		return "";
	}
	// If there's no some method for arrays, we're working with a pre-JS 1.6 browser. It would most likely not support the linear
	// gradient CSS function anyway. Return the null implementation.
	if (!("some" in [])) {
		return nullImplementation;
	}
	/**
	 * A variable that will be set to the opening of the CSS function including a prefix, if any such prefix is detected.
	 *
	 * @type {string}
	 */
	var workingOpening;
	/**
	 * A regular expression that will test whether "background-image" will be set as expected. Regular expression-based check,
	 * slow? Perhaps a bit. But it won't give any false positives.
	 *
	 * @const
	 * @type {RegExp}
	 */
	var prefixFinder = /^[a-z-]*ient\(/i;
	// Set the "background-image" of a newely created test element to a test value prefixed by the known prefixes. (No known
	// browser implements the CSS function prefixed with "-ms-", which is why it's tested last.)
	if (["", "-moz-", "-o-", "-webkit-", "-ms-"].some(function(prefix) {
		this.backgroundImage = prefix + "linear-gradient(top,lime,aqua)";
		// Check whether the "background-image" of the test element is set as expected. If so, save the prefix as the (or at least
		// "a") working prefix.
		if (prefixFinder.exec(this.backgroundImage)) {
			workingOpening = prefix + "linear-gradient(";
			// Return true, to avoid testing the remaining prefixes.
			return true;
		}
	}, document.createElement("div").style)) {
		// Return a function that uses that prefix to build a linear gradient function string.
		var join = [].join;
		return function() {
			return workingOpening + join.call(arguments) + ")";
		}
	} else {
		// If no working prefix was detected, return the null implementation.
		return nullImplementation;
	}
})();
