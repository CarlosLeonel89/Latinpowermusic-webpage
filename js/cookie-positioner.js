(function($) {

    $(document).ready(function() {
        //start listener for cookie bar open
        UMGGR_Cookie_Positioner_Module.init();
    });

    /**
     * ID of the cookie bar element
     * @type {string}
     */
    UMGGR_Cookie_Positioner_Module.cookie_bar_id = "_evidon_banner";

    /**
     * Counter for JS interval (Cookie Open waiter)
     * @type {number}
     */
    UMGGR_Cookie_Positioner_Module.interval_cookie_open_count = 0;

    /**
     * Check if cookie bar is currently visible and hasn't yet been closed by user
     *
     * @return bool
     */
    UMGGR_Cookie_Positioner_Module.is_cookie_bar_visible = function() {
        var cookie_bar = $('#' + UMGGR_Cookie_Positioner_Module.cookie_bar_id);

        return cookie_bar.length;
    };

    /**
     * Init cookie bar positioner module
     */
    UMGGR_Cookie_Positioner_Module.init = function() {
        //check if style functions exist from layouts before starting
        if(typeof UMGGR_Cookie_Positioner_Module.action_cookie_open !== 'undefined') {
            UMGGR_Cookie_Positioner_Module.listen_for_cookie_bar_open();

            //listen out for window resize and update style accordingly
            $(window).resize(function () {
                if(UMGGR_Cookie_Positioner_Module.is_cookie_bar_visible()) {
                    UMGGR_Cookie_Positioner_Module.action_cookie_open();
                }
            });
        }
    };

    /**
     * Listen when cookie bar opens up
     */
    UMGGR_Cookie_Positioner_Module.listen_for_cookie_bar_open = function() {

        /**
         * create and run interval that checks when the cookie bar has opened
         * give up after 25 seconds of trying
         */
        UMGGR_Cookie_Positioner_Module.interval_cookie_open = setInterval(function() {

            //check if cookie bar is visible
            if(UMGGR_Cookie_Positioner_Module.is_cookie_bar_visible()) {
                clearInterval(UMGGR_Cookie_Positioner_Module.interval_cookie_open);

                UMGGR_Cookie_Positioner_Module.action_cookie_open();

                //start listener for cookie bar close
                UMGGR_Cookie_Positioner_Module.listen_for_cookie_bar_close();
                return;
            }

            //count and clear interval if we have looped 50 times or more
            UMGGR_Cookie_Positioner_Module.interval_cookie_open_count++;
            if(UMGGR_Cookie_Positioner_Module.interval_cookie_open_count >= 50) {
                clearInterval(UMGGR_Cookie_Positioner_Module.interval_cookie_open);
            }
        }, 500);
    };

    /**
     * Listen when cookie bar is closed
     */
    UMGGR_Cookie_Positioner_Module.listen_for_cookie_bar_close = function() {

        //check if style functions exist from layouts before starting
        if(typeof UMGGR_Cookie_Positioner_Module.action_cookie_close !== 'undefined') {

            /**
             * create and run interval that checks when the cookie bar has closed
             */
            UMGGR_Cookie_Positioner_Module.interval_cookie_close = setInterval(function () {

                //check if cookie bar is visible
                if (!UMGGR_Cookie_Positioner_Module.is_cookie_bar_visible()) {

                    clearInterval(UMGGR_Cookie_Positioner_Module.interval_cookie_close);

                    UMGGR_Cookie_Positioner_Module.action_cookie_close();

                    return;
                }
            }, 500);
        }
    };

})(jQuery);


