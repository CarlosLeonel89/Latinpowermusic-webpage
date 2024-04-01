(function($) {

    var mp_initial_footer_margin_bottom = false;

    if(typeof UMGGR_Cookie_Positioner_Module !== 'undefined') {

        /**
         * Amend page styles to move important content from underneath the cookie box
         * - move footer contents above cookie bar
         */
        UMGGR_Cookie_Positioner_Module.action_cookie_open = function () {
            var cookie_box = $('#' + UMGGR_Cookie_Positioner_Module.cookie_bar_id);
            var cookie_box_height = $(cookie_box).height() ? $(cookie_box).height() : 0;

            var site_footer = $('#site-footer');

            if(mp_initial_footer_margin_bottom === false) {
                mp_initial_footer_margin_bottom = $(site_footer).css('margin-bottom');
            }

            $(site_footer).css('margin-bottom', cookie_box_height + 15);
        };

        /**
         * Move content back to original position after cookie close
         */
        UMGGR_Cookie_Positioner_Module.action_cookie_close = function () {
            var site_footer = $('#site-footer');

            $(site_footer).css('margin-bottom', mp_initial_footer_margin_bottom);
        };
    }
})( jQuery );
