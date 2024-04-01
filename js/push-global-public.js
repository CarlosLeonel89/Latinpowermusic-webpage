(function( $ ) {
	'use strict';

	// Instantiate PUSH_GLOBAL object if not already instantiated from push-global-geolocation class
    if (typeof window.PUSH_GLOBAL == 'undefined') {
        window.PUSH_GLOBAL = {};
    }

    // Initiate PUSH_GLOBAL
    PUSH_GLOBAL.init = function() {
        // Run check against global country code value. If CA or US then show the .push-global-ccpa elem
        if (PUSH_GLOBAL.geo_ip_country != 'undefined') {
            if (PUSH_GLOBAL.geo_ip_country =='US') {
				$('.push-global-ccpa').show();
            } else {
				$('.push-global-ccpa').hide();
            }
        }
    }

    $(document).ready(function ()
    {
        // Run the PUSH_GLOBAL init function
		if (typeof PUSH_GLOBAL.init != 'undefined') {
			PUSH_GLOBAL.init();
		}
    });

})( jQuery );
