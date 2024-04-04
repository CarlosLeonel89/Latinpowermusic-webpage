(function ($) {

    var $items = $('.flex-grid-gr-slide'),
            transitionItems = new TimelineMax({delay: 0.3});
    //Initialise page elements on load
    /*
    function init() {
        var postHeight = $(window).height() - ($('#site-header').outerHeight() + $('#site-footer').outerHeight());
        $('.single-post').css('min-height', postHeight);
    }
    */
    $(document).ready(function ()
    {
        /*
        init();
        $(window).resize(function () {
            init();
        });
        $(window).load(function () {
            init();
        });
        */
          ///init news featured slider
          const newsFeaturedSlickAutoplay = umggr_multipage_news_vars.autoplay === 'on';
          if ($('.news-slider').length) {

            var stdNewsFeaturedSliderSettings = {
                dots: true,
                infinite: true,
                autoplay:newsFeaturedSlickAutoplay,
                centerMode: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: true,
                cssEase: 'linear',
                adaptiveHeight: false
                // draggable: true
            }

            if (typeof window.UMGGR_News_Feat_Slick_Slider_Option != "undefined") { //
                var mergedNewsFeaturedSliderSettings = {...stdNewsFeaturedSliderSettings, ...window.UMGGR_News_Feat_Slick_Slider_Option};
            } else {
                var mergedNewsFeaturedSliderSettings = stdNewsFeaturedSliderSettings;
            }

            $(".news-slider").not('.slick-initialized').slick(mergedNewsFeaturedSliderSettings);
        }
    });
})(jQuery);// JavaScript Document