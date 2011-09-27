/**
 * A timer that calls a certain listener after the passed delay. The passed delay is in milliseconds.
 *
 * The timer can be postponed. This essentially delays the timer for one time only. The timer can also be destroyed.
 * Additionally, the timer can be configured to destroy itself after its first use.
 *
 * The minimal delay is 4 milliseconds for active tabs in modern HTML5 browsers, such as Firefox 5+. In Firefox 5+ and
 * Chrome 11+ this minimal delay is one second (1000 milliseconds) for inactive tabs.
 *
 * Two technical notes:
 *
 * One: The stop function (see below) calls both window.clearInterval and window.clearTimeout. In some engines, those two
 * functions actually do the same: window.clearInterval can clear a timeout created with window.setTimeout and
 * window.clearTimeout can clear a timeout created with window.setInterval. In those browsers, making only one call to either
 * window.clearInterval or window.clearTimeout would be enough. This should be investigated, it might speed up this timer.
 *
 * Two: This timer assumes window.setInterval and window.setTimeout return unique identifiers. Unique, as in
 * window.setInterval will never return the same identifier as window.setTimeout. If some engine out there uses separate
 * internal counters for intervals and timeouts, this timer might be buggy.
 */
Timer = function(listener, delay, oneOff) {
// The proceed variable (which is a function) will be called after the timer has been postponed and should proceed. How the
// timer proceeds (how it acts after being postposed) depends on whether it's one-off or not: if it is one-off it will simply
// call the listener and destroy itself; if it's not one-off it will call the listener and start an internal interval so the
// listener will be called every so often. The identifier variable is the unique identifier of any running internal interval
// or timeout.
		var proceed, identifier = (function() {
				if (oneOff) {
					return window.setTimeout(proceed = function(lateness) {
							proceed = null;
							listener(lateness);
						}, delay);
				} else {
					proceed = function(lateness) {
							identifier = window.setInterval(listener, delay);
							listener(lateness);
						};
					return window.setInterval(listener, delay);
				}
			})();
// The stop function will be called when the timer is destroyed or postponed. It clears any currently running internal interval
// or timeout.
		function stop() {
			window.clearInterval(identifier);
			window.clearTimeout(identifier);
		}
// Return the object that is the public interface to the timer.
		return {destroy: function() {
// When the timer is being destroyed, stop the internal interval or timeout and null out the proceed variable. This way, the
// postpone function below will do nothing after the timer is destroyed (as expected).
				stop();
				proceed = null;
			}, postpone: function(postponeDelay) {
// When the timer is being postponed, stop the internal interval or timeout and proceed after the passed delay. If no delay was
// passed, proceed after the delay of the timer.
				stop();
				identifier = window.setTimeout(proceed, 0 == arguments.length ? delay : postponeDelay);
			}};
	}
Timer=function(a,d,e){var c,b=e?window.setTimeout(c=function(l){c=null;a(l)},d):(c=function(l){b=window.setInterval(a,d);a(l)},window.setInterval(a,d));return{destroy:function(){window.clearInterval(b);window.clearTimeout(b);c=null},postpone:function(a){window.clearInterval(b);window.clearTimeout(b);b=window.setTimeout(c,arguments.length?a:d)}}};
