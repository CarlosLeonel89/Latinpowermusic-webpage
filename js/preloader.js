(function ($) {

    $(document).ready(function(){
        
        listen_for_top_content_loaded();

        //remove loader after 10 seconds of loading
        setTimeout(init_after_content_load, 10000);

    });

    //fired after all content apart from external resources is loaded (fires regardless after 10 second limit)
    var contentLoaded = false;

    function init_after_content_load() {
        if (contentLoaded) return;

        contentLoaded = true;

        $('#umggr-preloader').fadeOut(333, function(){
            $('#page').css('visibility', 'visible');
        });
    };

    //wait for content from the top of the site to load before hiding loader
    function listen_for_top_content_loaded() {

        // Set a default length of time for the preloader to show (2 seconds)
        var setPreloaderDelay = 2000;
            
        // Get the pre-loader delay length setting
        if($('#umggr-preloader').length) {
            setPreloaderDelay = $('#umggr-preloader').data('load-delay') * 1000; // value will be in seconds, convert to milliseconds
        }

        // Delay the preloader from being hidden for set number of seconds, regardless if the page has loaded or not
        setTimeout(function () {
            init_after_content_load();
        }, setPreloaderDelay);

    }

})(jQuery);