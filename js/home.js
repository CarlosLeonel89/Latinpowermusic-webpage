(function ($) {
    "use strict";

    var mobile;

    function enq() {
        enquire.register("screen and (min-width: 50em)", {
            match: function () {
                mobile = false;
            },
            unmatch: function () {
                mobile = true;
            },
            setup: function () {
                mobile = true;
            }
        });
    }

    function waitForElementDisplay(elementPath, callBack){
        window.setTimeout(function(){
            if($(elementPath).width() > 0 ){
              callBack(elementPath, $(elementPath));
            }else{
              waitForElementDisplay(elementPath, callBack);
            }
        },500)
    }
    if ($('.header-mailing-list').children().length > 0) {
        waitForElementDisplay(".header-mailing-list",function(){
            $('#slide-menu-gr').css('opacity', '1');
            $('#slide-menu-gr-social').css('opacity', '1');
            $('#slide-menu-gr-social-dropdown').css('opacity', '1');
        });
    }

    //Initialise page elements on load
    function init() {
        // calculate the height of the promo home section so that it can covered correctly by background image
        var windowHeight = $(window).height();
        var headerHeight = $('.site-header').outerHeight() ? $('.site-header').outerHeight() : 0;
        var mobileFooterHeight = $('#docked-menu-gr').outerHeight() ? $('#docked-menu-gr').outerHeight() : 0;
        var bannerContentAvailable = ($('#page').hasClass('noSlides') ? false : true);
        if ((
            umggr_multipage_home_vars.home_header_type == 'static-image'
            && umggr_multipage_home_vars.home_header_image == 'crop'
        ) || umggr_multipage_home_vars.home_header_image === 'slickslider') {
   
            if (!mobile) {
                if (bannerContentAvailable) {
                    $('.promo.home').height(windowHeight - headerHeight);                
                    $('.promo.home[data-headerType=slickslider] .slider-gr .slider-gr-container').height(windowHeight - (headerHeight + mobileFooterHeight));
                }
            } else {
                if (bannerContentAvailable) {
                    $('.promo.home').height(windowHeight - (headerHeight + mobileFooterHeight));
                    $('.promo.home[data-headerType=slickslider] .slider-gr').height(windowHeight - (headerHeight + mobileFooterHeight));
                    $('.promo.home[data-headerType=slickslider] .slider-gr .slider-gr-container').height(windowHeight - (headerHeight + mobileFooterHeight));
                    $('.promo.home[data-headerType=slickslider] .slider-gr .slider-gr-container .slick-list').height(windowHeight - (headerHeight + mobileFooterHeight));
                    $('#home .slider-gr.wide-slide .slider-gr-slide .slide-image .slide-image-background').height(windowHeight - (headerHeight + mobileFooterHeight));
                }
            }
        }

if ($('.slider-gr .promo-slider').length) {

    var stdPromoSliderSettings = {

            }
        }
        if ($('.slider-gr .promo-slider').length) {

            var stdPromoSliderSettings = {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                dots: umggr_multipage_home_vars.banner_navigation == 'dots' ||  umggr_multipage_home_vars.banner_navigation == 'both',
                arrows: umggr_multipage_home_vars.banner_navigation == 'arrows' ||  umggr_multipage_home_vars.banner_navigation == 'both',
                draggable: true,
                prevArrow: '<span class="slick-prev"></span>',
                nextArrow: '<span class="slick-next"></span>'
            }

            if (typeof window.UMGGR_Promo_Slick_Slider_Option != "undefined") { //
                var mergedPromoSliderSettings = {...stdPromoSliderSettings, ...window.UMGGR_Promo_Slick_Slider_Option};
            } else {
                var mergedPromoSliderSettings = stdPromoSliderSettings;
            }

            $('.promo-slider').not('.slick-initialized').slick(mergedPromoSliderSettings);

            // show / hide the mobile version of the slider images
            if ($(window).width() > 800) {
                $(".slide-mobile").css('display', 'none');
            } else {
                $(".slide-mobile").css('display', 'block');
            }
        }

        if ($('.photo-slider').length) {

            var stdPhotoSliderSettings = {
                slidesToShow: 3,
                slidesToScroll: 1,
                infinite: true,
                dots: false,
                arrows: (totalSlideItem > 3 ? true : false),
                draggable: false,
                responsive: [
                    {
                        breakpoint: 800,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ]
            }

            if (typeof window.UMGGR_Home_Photo_Slick_Slider_Option != "undefined") { //
                var mergedPhotoSliderSettings = {...stdPhotoSliderSettings, ...window.UMGGR_Home_Photo_Slick_Slider_Option};
            } else {
                var mergedPhotoSliderSettings = stdPhotoSliderSettings;
            }

            var totalSlideItem = $('.photo-slider .slider-gr-slide').length
            $('.photo-slider').not('.slick-initialized').slick(mergedPhotoSliderSettings);
        }
    }
    $(document).ready(function ()
    {
        enq();
        init();
         //SliderGR rollovers
        $('.slider-gr-slide').mouseenter(function () {
            TweenMax.to($(this).find('.slide-snippet'), 0.3, {opacity: 1});
            TweenMax.to($(this).find('.slide-overlay'), 0.3, {opacity: 0.8});
            TweenMax.to($(this).find('.slide-image img'), 0.3, {scale: 1.2});
            TweenMax.fromTo($(this).find('.icon'), 0.3, {rotation: -20}, {rotation: 0});
        });
        $('.slider-gr-slide').mouseleave(function () {
            TweenMax.to($(this).find('.slide-snippet'), 0.3, {opacity: 0.8});
            TweenMax.to($(this).find('.slide-overlay'), 0.3, {opacity: 0});
            TweenMax.to($(this).find('.slide-image img'), 0.3, {scale: 1});
            TweenMax.to($(this).find('.icon'), 0.3, {rotation: -20});
        });
        $('.flex-grid-gr-slide').mouseenter(function () {
            TweenMax.to($(this).find('.slide-overlay'), 0.3, {opacity: 0.5});
            TweenMax.to($(this).find('.image-overlay'), 0.3, {scale: 1.2});
            TweenMax.to($(this).find('.slide-snippet'),0.3,{opacity:1});
            TweenMax.fromTo($(this).find('.plus'), 0.3, {rotation: -20}, {rotation: 0});
        });
        //News Grid GR rollovers
        $('.flex-grid-gr-slide').mouseleave(function () {
            TweenMax.to($(this).find('.slide-overlay'), 0.3, {opacity: 0});
            TweenMax.to($(this).find('.image-overlay'), 0.3, {scale: 1});
            TweenMax.to($(this).find('.slide-snippet'),0.3,{opacity:0.8});
            TweenMax.to($(this).find('.plus'), 0.3, {rotation: -20});
        });
        $('.roll-link').mouseenter(function () {
            TweenMax.to($(this), 0.2, {x: -10});
            TweenMax.to($(this).find('.fa'), 0.3, {x: 5});
        });
        $('.roll-link').mouseleave(function () {
            TweenMax.to($(this), 0.2, {x: 0});
            TweenMax.to($(this).find('.fa'), 0.3, {x: 0});
        });
        $(window).resize(function () {
            init();
        });
        $(window).load(function () {
            init();
        });
    });

})(jQuery);// JavaScript Document
