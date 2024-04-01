(function ($) {
    "use strict";

    $(document).ready(function () {

        //wait for splash page to be closed if it's open before firing popup
        var splash_interval = setInterval(function() {
            if(!jQuery('#umggr-splash').is(':visible')) {
                UMGGR_Popup_Shortcode.run_popup(1);
                clearInterval(splash_interval);
            }
        }, 1000);



    });

    /**
    * Execute fancybox on given popup if ready to show
    */
    UMGGR_Popup_Shortcode.run_popup = function(id) {
        var $container = $('#umggr-popup-' + id);
        if($container.length && UMGGR_Popup_Shortcode.can_show_popup($container)) {

            //check if popup can only be shown after X numbner of seconds, until then wait
            var show_after = parseInt($container.data('show-after'));
            if(show_after > 0) {
                var start_time = UMGGR_Popup_Shortcode.get_site_visit_start_time($container);

                var wait_interval = setInterval(function() {
                    var current_time = new Date();
                    var seconds_on_site = Math.abs((current_time.getTime() - start_time.getTime()) / 1000);

                    if(seconds_on_site >= show_after) {
                        UMGGR_Popup_Shortcode.run_fancybox($container);
                        UMGGR_Popup_Shortcode.reset_site_visit_start_time($container);
                        clearInterval(wait_interval);
                    }
                }, 1000);
            } else if(UMGGR_Popup_Shortcode.is_front_page === '1') {

                //only show Popup on front-page unless we are showing it after X seconds of browsing
                UMGGR_Popup_Shortcode.run_fancybox($container);
            }
        }
    };

    /**
    * Execute fancybox on given popup if ready to show
    */
    UMGGR_Popup_Shortcode.run_fancybox = function(container) {
        $.fancybox.open({
            src: '#' + container.attr('id'),
            buttons: false,
            baseClass:'fancy-popup-embed',
            afterClose: function() {
                var show_frequency = container.data('show-repeat');
                var record_visits = show_frequency !== 'every_time';
                UMGGR_Popup_Shortcode.set_popup_last_shown(container, record_visits);
            }
        });
    };

    /**
    * Check if Popup is ready to be shown depending on Show Frequency, Nth Visits and Time visiting site
    *
    * @return boolean
    */
    UMGGR_Popup_Shortcode.can_show_popup = function(container) {
        var show_frequency = container.data('show-repeat');
        var last_shown = UMGGR_Popup_Shortcode.get_popup_last_shown(container);

        switch(show_frequency) {
            case 'every_time':
                return true;

            case 'first_time':
                //if any storage set then this is not the first time
                if(!UMGGR_Popup_Shortcode.get_popup_last_shown(container)) {
                    return true;
                }
            break;
            case 'nth_time':
                UMGGR_Popup_Shortcode.increment_popup_visits(container);

                var nth_visit = container.data('nth-visit');
                var visit_count = UMGGR_Popup_Shortcode.get_popup_visits(container);

                if(visit_count === 0 || visit_count % nth_visit === 0) {
                    return true;
                }
            break;
        }

        return false;
    };

    /**
    * Get last time the given popup has been shown
    *
    * @return float - UNIX timestamp
    */
    UMGGR_Popup_Shortcode.get_popup_last_shown = function(container) {
        var last_shown = false;
        if(typeof(Storage) !== 'undefined') {
            last_shown = localStorage.getItem(container.attr('id') + '_last_shown');
        }
        return last_shown;
    };

    /**
    * Get number of popup visits
    *
    * @return int
    */
    UMGGR_Popup_Shortcode.get_popup_visits = function(container) {
        var visit_count = false;
        if(typeof(Storage) !== 'undefined') {
            visit_count = parseInt(localStorage.getItem(container.attr('id') + '_visit_count'));
            if(!visit_count) {
                visit_count = 0;
            }
        }
        return visit_count;
    };

    /**
    * Increment number of visits
    */
    UMGGR_Popup_Shortcode.increment_popup_visits = function(container) {
        if(typeof(Storage) !== 'undefined') {
            var visit_count = parseInt(localStorage.getItem(container.attr('id') + '_visit_count'));
            if(!visit_count) {
                visit_count = 0;
            }
            localStorage.setItem(container.attr('id') + '_visit_count', visit_count + 1);
        }
    };

    /**
    * Set when popup was last shown
    */
    UMGGR_Popup_Shortcode.set_popup_last_shown = function(container, record_visits) {
        if(typeof(Storage) !== 'undefined') {
            localStorage.setItem(container.attr('id') + '_last_shown', new Date());

            //if not recording visits then clear count
            if(!record_visits) {
                localStorage.removeItem(container.attr('id') + '_visit_count');
            }
        }
    };

    /**
    * Get start time of when user came onto the site initially
    */
    UMGGR_Popup_Shortcode.get_site_visit_start_time = function(container) {
        if(typeof(Storage) !== 'undefined') {
            var start_time = localStorage.getItem(container.attr('id') + '_start_time');
            if(!start_time) {
                localStorage.setItem(container.attr('id') + '_start_time', new Date());
                start_time = new Date();
            } else {
                start_time = new Date(start_time);
            }
        }
        return new Date();
    };

    /**
    * Reset start time
    */
    UMGGR_Popup_Shortcode.reset_site_visit_start_time = function(container) {
        if(typeof(Storage) !== 'undefined') {
            localStorage.removeItem(container.attr('id') + '_start_time');
        }
    }

})(jQuery);
