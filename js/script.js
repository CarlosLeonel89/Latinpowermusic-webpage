jQuery(document).ready(function ($) {
    var $body = $('body');

    if( $body.hasClass('page-home') ) {
        setTimeout(function(){
            $('.eapps-instagram-feed-posts-grid-load-more-text').trigger('click');
        }, 800);
        
        $('.newsletter-container').prepend('<div class="header"><h2 class="content__title content__title--size-s"><span class="top top-3" style="background-image: url('+dir+'images/title/sub-03.png");"></span><span class="top top-2" style="background-image: url('+dir+'images/title/sub-02.png");"></span><span class="top top-1" style="background-image: url('+dir+'images/title/sub-01.png");"></span><span class="bot bot-3" style="background-image: url('+dir+'images/title/sub--03.png");"></span><span class="bot bot-2" style="background-image: url('+dir+'images/title/sub--02.png");"></span><span class="bot bot-1" style="background-image: url('+dir+'images/title/sub--01.png");"></span><span class="base" style="background-image: url('+dir+'images/title/sub.png");"><img src="'+dir+'images/title/sub.png" alt="Subscribe" class="hidden"></span></h2></div>');

        var $homeSlider = $('.slider-for');
    
        $homeSlider.slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: true,
            fade: true,
            dots: false,
            asNavFor: '.slider-nav',
            prevArrow: $('.cust-btns .prev'),
            nextArrow: $('.cust-btns .next')
        });
        $('.slider-nav').slick({
            slidesToShow: 6,
            slidesToScroll: 1,
            asNavFor: '.slider-for',
            dots: false,
            centerMode: false,
            variableWidth: true,
            focusOnSelect: true,
            responsive: [{
                breakpoint: 1024,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1,
                }
            }, {
                breakpoint: 900,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
               }
            }, {
                breakpoint: 600,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
           }
            }]
        });

        $('.slick-next').append('<svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.4287 40L34.9999 20L31.5714 16.6666L31.5712 16.6668L14.4284 -9.03067e-05L10.9998 3.33325L25.684 17.6097L0.175783 17.6097L0.310391 22.3897L25.6849 22.3897L11.0002 36.6667L14.4287 40Z" fill="white"/><linearGradient id="paint0_linear_317_12358" x1="17.4571" y1="0.138916" x2="17.4571" y2="40.139" gradientUnits="userSpaceOnUse"><stop stop-color="#F49D33"/><stop offset="1" stop-color="#F96D63"/></linearGradient></svg>');
        $('.slick-prev').append('<svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.5713 0L6.10352e-05 20L3.4286 23.3334L3.42879 23.3332L20.5717 40.0001L24.0002 36.6667L9.31599 22.3903H34.8242L34.6896 17.6103H9.31511L23.9998 3.33334L20.5713 0Z" fill="white"/><linearGradient id="paint0_linear_317_12358" x1="17.4571" y1="0.138916" x2="17.4571" y2="40.139" gradientUnits="userSpaceOnUse"><stop stop-color="#F49D33"/><stop offset="1" stop-color="#F96D63"/></linearGradient></svg>');
        
        var controller = new ScrollMagic.Controller();

        var top1 = TweenMax.to(".top-1", 1, {y: -20, ease: Linear.easeNone}, 0.15);
        var top2 = TweenMax.to(".top-2", 1, {y: -40, ease: Linear.easeNone}, 0.2);
        var top3 = TweenMax.to(".top-3", 1, {y: -60, ease: Linear.easeNone}, 0.25);

        var bot1 = TweenMax.to(".bot-1", 1, {y: 20, ease: Linear.easeNone}, 0.15);
        var bot2 = TweenMax.to(".bot-2", 1, {y: 40, ease: Linear.easeNone}, 0.2);
        var bot3 = TweenMax.to(".bot-3", 1, {y: 60, ease: Linear.easeNone}, 0.25);

		// build scene
		var scene = new ScrollMagic.Scene({triggerElement: ".home.roster", duration: 300})
						.setTween(top1)
						.addTo(controller);
        var scene2 = new ScrollMagic.Scene({triggerElement: ".home.roster", duration: 300})
						.setTween(top2)
						.addTo(controller);
        var scene3 = new ScrollMagic.Scene({triggerElement: ".home.roster", duration: 300})
                        .setTween(top3)
                        .addTo(controller);
		var scene4 = new ScrollMagic.Scene({triggerElement: ".home.roster", duration: 300})
                        .setTween(bot1)
                        .addTo(controller);
        var scene5 = new ScrollMagic.Scene({triggerElement: ".home.roster", duration: 300})
                        .setTween(bot2)
                        .addTo(controller);
        var scene6 = new ScrollMagic.Scene({triggerElement: ".home.roster", duration: 300})
                        .setTween(bot3)
                        .addTo(controller);

        var stop1 = TweenMax.to(".stop-1", 2, {y: -5, ease: Linear.easeNone}, 0.15);
        var stop2 = TweenMax.to(".stop-2", 2, {y: -10, ease: Linear.easeNone}, 0.2);
        var stop3 = TweenMax.to(".stop-3", 2, {y: -15, ease: Linear.easeNone}, 0.25);

        var sbot1 = TweenMax.to(".sbot-1", 2, {y: 5, ease: Linear.easeNone}, 0.15);
        var sbot2 = TweenMax.to(".sbot-2", 2, {y: 10, ease: Linear.easeNone}, 0.2);
        var sbot3 = TweenMax.to(".sbot-3", 2, {y: 15, ease: Linear.easeNone}, 0.25);
        
		var scene1s = new ScrollMagic.Scene({triggerElement: "#home-newsletter-section", duration: 300})
                        .setTween(stop1)
                        .addTo(controller);
        var scene2s = new ScrollMagic.Scene({triggerElement: "#home-newsletter-section", duration: 300})
                        .setTween(stop2)
                        .addTo(controller);
        var scene3s = new ScrollMagic.Scene({triggerElement: "#home-newsletter-section", duration: 300})
                        .setTween(stop3)
                        .addTo(controller);
        var scene4s = new ScrollMagic.Scene({triggerElement: "#home-newsletter-section", duration: 300})
                        .setTween(sbot1)
                        .addTo(controller);
        var scene5s = new ScrollMagic.Scene({triggerElement: "#home-newsletter-section", duration: 300})
                        .setTween(sbot2)
                        .addTo(controller);
        var scene6s = new ScrollMagic.Scene({triggerElement: "#home-newsletter-section", duration: 300})
                        .setTween(sbot3)
                        .addTo(controller);
    } else if ($('body').hasClass('page-music')) {

        $('.fn-list a').sort(asc_sort).appendTo('.fn-list');

        function asc_sort(a, b){
            return ($(b).text()) < ($(a).text()) ? 1 : -1;    
        }

        // music category filter
        function filterByCategory(category){
            $('.node-music').filter(function() {
                var artistName = $(this).data('artist');
                return artistName.toUpperCase() === category.toUpperCase();
            }).show();
        };
    
        $('.filter-container a').on('click',function(e){
            e.preventDefault();

            $('.filter-container a').removeClass("active");
            $(this).addClass('active');
        
            $('.more-link').hide();
        
            // Hide all list items
            $('.node-music').hide();
    
            // Selected Category
            var category = $(this).attr('title');
    
            // Filter and show list items
            setTimeout(filterByCategory(category), 300);
            
            $('.filter-names').removeClass('open');
            $('.fn-list').animate({scrollTop : 0},360);
        });
    
        $('.filter-container a.all-releases').on('click',function(e){
            e.preventDefault();
            $('.filter-container a').removeClass("active");
            $(this).addClass('active');


            $('.node-music:lt(12)').filter(function() {
                return true
            }).show();
            $('.more-link').show();
        });

    } else if ($('body').hasClass('page-videos')) {
        // var $videoSlider = $('.video-slider'),
        //     bannerItem = $('.video-slider .node-banner').length,
        //     $custBtns = '<div class="slider-custom-container"><div class="slider-box"></div><div class="num"><span class="current">1</span>/<span class="total">'+bannerItem+'</span></div><div class="cust-btns"><button class="prev">Prev</button><button class="next">Next</button></div></div>';
    
        // $videoSlider.slick({
        //     slidesToShow: 2,
        //     slidesToScroll: 1,
        //     arrows: true,
        //     dots: true,
        //     responsive: [{
        //         breakpoint: 767,
        //         settings: {
        //             slidesToShow: 1,
        //             slidesToScroll: 1,
        //         }
        //     }]
        // });

        // if(bannerItem > 1) {
        //     $('.slick-dots').appendTo($('.slider-box'));
        // }
        // $('.cust-btns .prev').on('click', function() {
        //     $('.video-slider .slick-prev').trigger('click');
        //     $videoSlider.addClass('pre');
        // });
        // $('.cust-btns .next').on('click', function() {
        //     $('.video-slider .slick-next').trigger('click');
        //     $videoSlider.removeClass('pre');
        // });
    
        // $('.cust-btns button').on('click', function(e){
        //     setTimeout(function(){
        //     var sliderNum = parseInt($videoSlider.find('.slick-active').attr('data-slick-index')) + 1;
        //     $('.num .current').text(sliderNum);
        //     }, 100);
        // });

        // video category filter
        function filterByCategory(category){
            $('.node-video').filter(function() {
                var videoCategory = $(this).data('artist');
                return videoCategory.toUpperCase() === category.toUpperCase();
            }).show();
        };
    
        $('.filter-container a').on('click',function(e){
            e.preventDefault();

            $('.filter-container a').removeClass("active");
            $(this).addClass('active');
        
            $('.more-link').hide();
        
            // Hide all list items
            $('.node-video').hide();
    
            // Selected Category
            var category = $(this).attr('title');
    
            // Filter and show list items
            setTimeout(filterByCategory(category), 300);

            console.log(category);
            $('.filter-names').removeClass('open');
            $('.fn-list').animate({scrollTop : 0},360);


            if ($(window).width() < 700) {
                $('.filter-names').removeClass('open');
            }
        });
    
        $('.filter-container a.all-videos').on('click',function(e){
            e.preventDefault();
            $('.filter-container a').removeClass("active");
            $(this).addClass('active');


            $('.node-video:lt(12)').filter(function() {
                return true
            }).show();
            $('.more-link').show();
        });
    } 
    if ($(window).width() < 700) {
        $('.fn-select').on('click', function(e) {
            e.preventDefault();
    
            $('.filter-names').addClass('open');
        })


        $('.main-content').on('click', function(e) {
            $('.filter-names').removeClass('open');
        })
    }


    if( $('body').hasClass('page-about') ) {
        $('#about').prepend('<div class="header"><h2 class="content__title content__title--size-s"><span class="top top-3" style="background-image: url('+dir+'images/title/about-03.png");"></span><span class="top top-2" style="background-image: url('+dir+'images/title/about-02.png");"></span><span class="top top-1" style="background-image: url('+dir+'images/title/about-01.png");"></span><span class="bot bot-3" style="background-image: url('+dir+'images/title/about--03.png");"></span><span class="bot bot-2" style="background-image: url('+dir+'images/title/about--02.png");"></span><span class="bot bot-1" style="background-image: url('+dir+'images/title/about--01.png");"></span><span class="base" style="background-image: url('+dir+'images/title/about.png");"><img src="'+dir+'images/title/about.png" alt="About" class="hidden"></span></h2></div>');
    }

    if ( $('body').hasClass('page-music') ||  $('body').hasClass('page-videos') || $('body').hasClass('page-about') ||  $('body').hasClass('page-news') || $('body').hasClass('page-artists') || $('body').hasClass('page-newsletter') || $('body').hasClass('page-tour') ) {
        var controllerP = new ScrollMagic.Controller();

        var top1 = TweenMax.to(".top-1", 1, {y: -20, ease: Linear.easeNone}, 0.15);
        var top2 = TweenMax.to(".top-2", 1, {y: -40, ease: Linear.easeNone}, 0.2);
        var top3 = TweenMax.to(".top-3", 1, {y: -60, ease: Linear.easeNone}, 0.25);

        var bot1 = TweenMax.to(".bot-1", 1, {y: 20, ease: Linear.easeNone}, 0.15);
        var bot2 = TweenMax.to(".bot-2", 1, {y: 40, ease: Linear.easeNone}, 0.2);
        var bot3 = TweenMax.to(".bot-3", 1, {y: 60, ease: Linear.easeNone}, 0.25);

		// build scene
		var scene = new ScrollMagic.Scene({triggerElement: "#page", duration: 20, triggerHook: 0})
						.setTween(top1)
						.addTo(controllerP);
        var scene2 = new ScrollMagic.Scene({triggerElement: "#page", duration: 20, triggerHook: 0})
						.setTween(top2)
						.addTo(controllerP);
        var scene3 = new ScrollMagic.Scene({triggerElement: "#page", duration: 20, triggerHook: 0})
                        .setTween(top3)
                        .addTo(controllerP);
		var scene4 = new ScrollMagic.Scene({triggerElement: "#page", duration: 20, triggerHook: 0})
                        .setTween(bot1)
                        .addTo(controllerP);
        var scene5 = new ScrollMagic.Scene({triggerElement: "#page", duration: 20, triggerHook: 0})
                        .setTween(bot2)
                        .addTo(controllerP);
        var scene6 = new ScrollMagic.Scene({triggerElement: "#page", duration: 20, triggerHook: 0})
                        .setTween(bot3)
                        .addTo(controllerP);
    }

    initLanguage()

    function initLanguage() {
        const UMGGR_LANG_MODE_OPTION = true
        const langModeKey = 'umggr-lang-mode'
        let currentLang = 'english'

        if (UMGGR_LANG_MODE_OPTION && typeof localStorage !== 'undefined') {
            let storedMode2 = localStorage.getItem(langModeKey)
            if (storedMode2) {
                currentLang = storedMode2
                setLangMode(currentLang)
            }
        }

        $('.language-toggle-block .language-option').on('click', function () {
            console.log('test test');
            if ($('.language-toggle-block').hasClass('english-mode')) {
                setLangMode('spanish')
                currentLang = 'spanish'
            } else {
                setLangMode('english')
                currentLang = 'english'
            }

            if (UMGGR_LANG_MODE_OPTION && typeof localStorage !== 'undefined') {
                localStorage.setItem(langModeKey, currentLang)
            }
        })
    }

    function setLangMode(mode2) {
        switch (mode2) {
            case "spanish":
                $('.language-toggle-block').removeClass('english-mode')
                $('.language-toggle-block').addClass('spanish-mode')
                $('body').removeClass('english-mode').addClass('spanish-mode')
                break;
            case "english":
                $('.language-toggle-block').removeClass('spanish-mode')
                $('.language-toggle-block').addClass('english-mode')
                $('body').removeClass('spanish-mode').addClass('english-mode')
                break;
        }
    }

    initToggleMode()

    function initToggleMode() {
        const UMGGR_STORE_MODE_OPTION = true
        const skinModeKey = 'umggr-skin-mode'
        let currentMode = 'light'

        $('#site-header > .flex').append('<div class="toggle-container light-mode"><p>Light Mode</p><div class="toggle-switch"></div></div>')

        if (UMGGR_STORE_MODE_OPTION && typeof localStorage !== 'undefined') {
            let storedMode = localStorage.getItem(skinModeKey)
            if (storedMode) {
                currentMode = storedMode
                setSkinMode(currentMode)
            }
        }

        $('.toggle-container .toggle-switch').on('click', function () {
            if ($('.toggle-container').hasClass('dark-mode')) {
                setSkinMode('light')
                currentMode = 'light'
            } else {
                setSkinMode('dark')
                currentMode = 'dark'
            }

            if (UMGGR_STORE_MODE_OPTION && typeof localStorage !== 'undefined') {
                localStorage.setItem(skinModeKey, currentMode)
            }
        })
    }

    function setSkinMode(mode)
    {
        switch (mode) {
            case "dark":
                $('.toggle-container').removeClass('light-mode')
                $('.toggle-container').addClass('dark-mode')
                $('.toggle-container p').html('Dark Mode')
                $('body').removeClass('light-mode').addClass('dark-mode')
                break;
            case "light":
                $('.toggle-container').removeClass('dark-mode')
                $('.toggle-container').addClass('light-mode')
                $('.toggle-container p').html('Light Mode')
                $('body').removeClass('dark-mode').addClass('light-mode')
                break;
        }
    }

   $('.slide-menu-toggle').on('click', function(e){
       if( !$('.slide-menu-gr-container').hasClass('docked')) {
        $(this).addClass('active');
       } else {
        $(this).removeClass('active');
       }
   })

   $('.header-mailing-list').appendTo($('.site-header .main-nav .menu-main-container .slide-menu-gr-parent'));
          
});