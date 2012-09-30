/**
 * Creates a linear-gradient CSS function string, to be used as a value for "background-image", for instance. Returns an empty
 * string if the browser does not support any supported form of the linear-gradient CSS function.
 *
 * You must pass arguments based on the standard (as of 01-10-2012) CSS3 syntax, like this:
 *   makeLinearGradientString("to right", "#FFBA74", "#FF8C19");
 * The alternative "from" syntax (without "to") will not produce the expected results.
 *
 * Please note that this function only tests whether the browser supports (a potentially prefixed version of)
 * linear-gradient([to [left | right] || [top | bottom] ,]? <color-stop>[, <color-stop>]+) as defined in the CSS3 draft of
 * 12-06-2012, or alternatively, that syntax without the "to" keyword (known to some as the "from" syntax). The filter-based
 * gradients supported by IE 5.5 through 9 are not considered by this function. The weird Apple gradients supported by Chrome
 * and Safari aren't considered by this function either. (Chrome 10 and Safari 5.1 support the aforementioned alternative
 * syntax, and are therefore supported by this function.)
 *
 * For example:
 *   makeLinearGradientString("to bottom", "#444", "rgba(68, 68, 68, 0)");
 * returns
 *   "-moz-linear-gradient(to bottom,#444,rgba(68, 68, 68, 0))";
 * in Firefox 10,
 *   "linear-gradient(to bottom,#444,rgba(68, 68, 68, 0))"
 * in Firefox 16, and
 *   "-webkit-linear-gradient(top,#444,rgba(68, 68, 68, 0))"
 * in Chromium 20.
 *
 * @const
 * @type {function(...string):string!}
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
	/**
	 * The list of known prefixes. (The only known browser that implements the linear-gradient CSS function prefixed with "-ms-"
	 * is a special preview version of IE 10, which is why it's tested last. The rest is in alphabetical order.)
	 *
	 * @const
	 * @type {Array.<string>}
	 */
	var prefixes = ["", "-moz-", "-o-", "-webkit-", "-ms-"];
	// If there's no some method (used whilst testing) or no indexOf method in arrays (used whilst converting the standard syntax
	// to the alternative syntax), we're working with a pre-JS 1.6 browser. It would most likely not support the linear-gradient
	// CSS function anyway, so there's no point in working around the lack of some/indexOf support. Return the null
	// implementation.
	if (!("some" in prefixes && "indexOf" in prefixes)) {
		return nullImplementation;
	}
	/**
	 * A variable that will be set to the opening of the CSS function including a prefix, if such prefix is detected. An example
	 * of a value for this variable would be "-o-linear-gradient(".
	 * It's slightly odd that this variable might contain that starting parentheses. It just makes the code below a bit shorter
	 * and perhaps perform a bit better.
	 *
	 * @type {string}
	 */
	var workingOpening;
	/**
	 * A regular expression that will test whether "background-image" has been set as expected. Regular expression-based check.
	 * Slow? Perhaps a bit. But it drastically reduces the chance of a false positive.
	 *
	 * @const
	 * @type {RegExp}
	 */
	var tester = /^[a-z-]*ient\(/i;
	/**
	 * The style for an invisible element. The tests below tamper with this object and check whether the browser likes that or
	 * not.
	 *
	 * @const
	 * @type {CSSStyleDeclaration}
	 */
	var testStyle = document.createElement("a").style;
	/**
	 * Tests the passed prefix, returning true and setting the workingOpening variable if the passed prefix combined with the
	 * directional argument as set by "this" results in a CSS function string accepted by the browser.
	 *
	 * @param {string} prefix
	 * @this {string}
	 * @return {boolean|undefined}
	 */
	function testPrefix(prefix) {
		testStyle.backgroundImage = prefix + "linear-gradient(" + this + ",lime,aqua)";
		// Check whether the "background-image" of the test element is set as expected. If so, save the prefix as the (or at least
		// "a", there might be multiple) working prefix.
		if (tester.exec(testStyle.backgroundImage)) {
			workingOpening = prefix + "linear-gradient(";
			// Return true, to avoid testing the remaining prefixes when this function is used as a "some" callback.
			return true;
		}
	}
	/**
	 * @const
	 * @type {function(*=):string}
	 */
	var join = prefixes.join;
	// Test the known prefixes using the standard (to) syntax.
	if (prefixes.some(testPrefix, "to bottom")) {
		// Return a function that uses the working prefix to build a linear gradient function string.
		return function() {
			return workingOpening + join.call(arguments) + ")";
		};
	// Test the known prefixes using the not-so-standard from syntax.
	} else if (prefixes.some(testPrefix, "top")) {
		/**
		 * @const
		 * @type {RegExp}
		 */
		var sideOrCornerExtractor = /^\s*to\s+(\w+)(\s+(\w+))?/;
		/**
		 * @type {Array.<string>}
		 */
		var sideOrCorner;
		/**
		 * @const
		 * @type {Array.<string>}
		 */
		var sides = ["top", "right", "bottom", "left"];
		/**
		 * @param {string} inputSide
		 * @return {string}
		 */
		function reverseSide(inputSide) {
			// Find the index of the passed side in the sides array, and return the value that's two places further in that array.
			return sides[(sides.indexOf(inputSide) + 2) & 3];
		}
		// Return a function that uses the working prefix and converts the standard (to) syntax to the alternative (from) syntax to
		// build a linear gradient function string.
		return function() {
			/**
			 * @const
			 */
			var functionArguments = arguments;
			// If the first argument is a "side-or-corner", make it compatible with the desired alternative syntax.
			if (sideOrCorner = sideOrCornerExtractor.exec(functionArguments[0])) {
				functionArguments[0] = reverseSide(sideOrCorner[1]);
				if (undefined != sideOrCorner[3]) {
					functionArguments[0] += " " + reverseSide(sideOrCorner[3]);
				}
			}
			return workingOpening + join.call(functionArguments) + ")";
		};
	} else {
		// If no working prefix was detected, return the null implementation.
		return nullImplementation;
	}
})();
