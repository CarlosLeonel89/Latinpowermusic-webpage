(function ($) {

    function initLazy() {
        $('.lazy').each(function () {
            $(this).Lazy({
                beforeLoad: function (element) {
                    $(element).parents('.music-featured-slide__image-container').show('div.loader');
                },
                afterLoad: function (element) {
                    $(element).parent().find('div.loader').hide();
                },
            });
        });
    }

    $(document).ready(function() {
        var mainHeight = $('#main-content').outerHeight() ? $('#main-content').outerHeight() : 0;
        var swiperHeight = $('.umggr-swiper-container').outerHeight() ? $('.umggr-swiper-container').outerHeight() : 0;
        if (swiperHeight < mainHeight) {
            $('.umggr-swiper-container').css('padding', (mainHeight - swiperHeight) / 2 + 'px' )
        } else {
            // $('.umggr-swiper-button').css('top', '150px');
        }
        $('.open-links').on("click", function () {
            if (!$('.open-links').hasClass('open')) {
                TweenMax.to($(this), 0.3, {opacity: 0.5});
                $('.open-links').addClass('open');
            } else {
                TweenMax.to($(this), 0.3, {opacity: 1});
                $('.open-links').removeClass('open');
            }
        });

        initLazy();

        // music featured slider init
        const musicfeaturedSlickAutoplay = umggr_multipage_music_vars.autoplay === 'on';
        if ($('.music-featured-slider').length) {

            var stdMusicFeaturedSliderSettings = {
                // dots: true,
                infinite: true,
                autoplay: musicfeaturedSlickAutoplay,
                centerMode: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: true,
                cssEase: 'linear',
                adaptiveHeight: false,
                dots: true,
                arrows: true,
                prevArrow: '<span class="slick-prev"></span>',
                nextArrow: '<span class="slick-next"></span>'
            }

            if (typeof window.UMGGR_Music_Feat_Slick_Slider_Option != "undefined") { //
                var mergedMusicFeaturedSliderSettings = {...stdMusicFeaturedSliderSettings, ...window.UMGGR_Music_Feat_Slick_Slider_Option};
            } else {
                var mergedMusicFeaturedSliderSettings = stdMusicFeaturedSliderSettings;
            }

            $(".music-featured-slider").not('.slick-initialized').slick(mergedMusicFeaturedSliderSettings);
        }

    });

})(jQuery);// JavaScript Document
