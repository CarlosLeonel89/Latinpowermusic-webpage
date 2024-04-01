(function ($) {

    $(document).ready(function() {
        // loop through all the panels when the next button is click. When end is reach, start from beginning
        $('.-js-c-artist-tabs .-js-next-button').on('click', function(e) {
            var tabs_length = $('.-js-tabs-header').data('tabs-length');
            var active_tab_id = $('.-js-c-artist-tabs li.-is-active').data('tab-id');
            $('.-js-c-artist-tabs .-js-tabs-header li.-is-active').removeClass('-is-active');
            $('.-js-c-artist-tabs .-js-tabs-panels .panel[data-tab-id="'+active_tab_id+'"]').addClass('-is-obscured');
            if (active_tab_id+1 < tabs_length) {
                $('.-js-c-artist-tabs .-js-tabs-header li[data-tab-id="'+(active_tab_id+1)+'"]').addClass('-is-active');
                $('.-js-c-artist-tabs .-js-tabs-panels .panel[data-tab-id="'+(active_tab_id+1)+'"]').removeClass('-is-obscured');
            } else {
                $('.-js-c-artist-tabs li[data-tab-id="1"]').addClass('-is-active');
                $('.-js-c-artist-tabs .-js-tabs-panels .panel[data-tab-id="1"]').removeClass('-is-obscured');
            }
            e.preventDefault();
        });

        $('.-js-c-artist-tabs .-js-tabs-header .-js-item-selector').on('click', function(e) {
            if (!$(this).hasClass('-is-active')) {
                var active_tab_id = $(this).data('tab-id');
                $('.-js-c-artist-tabs .-js-tabs-header').find('.-is-active').removeClass('-is-active');
                $(this).addClass('-is-active');
                $('.-js-c-artist-tabs .-js-tabs-panels .panel').addClass('-is-obscured');
                $('.-js-c-artist-tabs .-js-tabs-panels .panel[data-tab-id="'+active_tab_id+'"]').removeClass('-is-obscured');
            }
        });

        // artists featured slider init
        const artistsfeaturedSlickAutoplay = umggr_multipage_artists_vars.autoplay === 'on';
        if ($('.artists-featured-slider').length) {

            var stdArtistsFeaturedSliderSettings = {
                dots: true,
                autoplay:artistsfeaturedSlickAutoplay,
                infinite: true,
                centerMode: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: true,
                cssEase: 'linear',
                adaptiveHeight: false,
                // draggable: true
            };

            if (typeof window.UMGGR_Artists_Feat_Slick_Slider_Option != "undefined") { //
                var mergedArtistsFeaturedSliderSettings = {...stdArtistsFeaturedSliderSettings, ...window.UMGGR_Artists_Feat_Slick_Slider_Option};
            } else {
                var mergedArtistsFeaturedSliderSettings = stdArtistsFeaturedSliderSettings;
            }

            $(".artists-featured-slider").not('.slick-initialized').slick(mergedArtistsFeaturedSliderSettings);
        }
    });

})(jQuery);// JavaScript Document
