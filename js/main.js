//Custom Grand Royal multi page slide menu for mobile and desktop with mobile docking bar
//Author: Airborne

(function ($) {
    "use strict";
    var mobile,
            headerHeight,
            footerHeight,
            childMenuHeight,
            childMenuPos,
            siteMenuWidth,
            //cache jquery objects
            $slideMenuPeakabooContainer = $('#slide-menu-gr-peakaboo'),
            $slideMenuPeakaboo = $('.slide-menu-gr-peakaboo'),
            $socialIconMenuBar = $('.slide-menu-gr-peakaboo--social-mobile-only .social-sub-menu'),
            $storeMenuBarWithSocial = $('.slide-menu-gr-peakaboo--social-mobile-only .active'),
            $storeMenuBar = $('.slide-menu-gr-peakaboo--mobile-only .slide-menu-gr-child-peekaboo'),
            $slideMenuGR = $('#slide-menu-gr'),
            bannerVideo;

    var sound_playing = false;
    var audio_control_rendered = false;
    var video_type = '';
    var html_video_obj = null;

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

    //wait for content from the top of the site to load before hiding loader
    function listen_for_top_content_loaded() {
        // chcek for the sessionStorage var before loading anything.
        var splashSet = sessionStorage.getItem('umggr-splashed', true);
        if(splashSet) {
            $('body').addClass('overflow_visible');
            init_after_content_load();
        } else {
            var required_content = [];

            //check if splash page is used and grab it's img and iframe elements
            if($('#umggr-splash').length && $('#umggr-splash .custom-html').length) {
                $('#umggr-splash .custom-html').each(function() {
                    required_content.push($(this));
                });
            }
            // TODO: replace this with a more robust method for detecting when this is the home page.
            if ( window.location.pathname == '/' ){
                if($('#umggr-splash .yt-holder').length) {
                    required_content.push($('#umggr-splash .yt-holder'));
                }
            }

            if(required_content.length) {
                var num_required = required_content.length;
                for(var c in required_content) {
                    if($(required_content[c]).hasClass('yt-holder')) {
                        $('#umggr-splash').on('youtube-splash-ready', function() {
                            init_after_content_load();
                        });
                    } else {
                        $(required_content[c]).ready(function() {
                            init_after_content_load();
                        });
                    }
                }
            } else {
                init_after_content_load();
            }
        }
    };

    function init_after_content_load() {
        $('.umggr-loader-status').fadeOut(300, function () {
            $('#umggr-loader').fadeOut();
        });
    }

    //initialise page elements
    function init() {
        // setNewsletterButtonWidth();
        //Set + get dimension vars
        headerHeight = $('#site-header').outerHeight() ? $('#site-header').outerHeight() : 0;
        footerHeight = $('#site-footer').outerHeight() ? $('#site-footer').outerHeight() : 0;
        childMenuHeight = ($('.peekaboo').outerHeight() ? $('.peekaboo').outerHeight() : 0) + 3;
        childMenuPos = headerHeight - childMenuHeight;
        siteMenuWidth = $slideMenuGR.width();

        $slideMenuPeakabooContainer.css({
            top: headerHeight
        });

        if (!$(".site-header-transparent").length) {
            // $('.peekaboo').css('top', childMenuPos + 'px');
            $socialIconMenuBar.css('top', 0);
            $storeMenuBarWithSocial.css('top', childMenuPos + 'px');
            $storeMenuBar.css('top', -childMenuHeight + 'px');
        } else {
            if (jQuery('#site-header .social-nav').length > 0) {
                $('.peekaboo').css('top', headerHeight + 'px');
            } else {
                $('.peekaboo').css('top', -childMenuHeight + 'px');
            }
            $storeMenuBar.css('top', -childMenuHeight + 'px');
            headerHeight = 0;
        }

        //Cleanup mobile states in case of browser resize
        if (!mobile) {
            $slideMenuGR.removeClass('docked');
            $('body, #slide-menu-gr, .dock-link, .mobile, .dimmer-lay').removeAttr('style');
        }

        $('.umggr-fixed-social-menu-container.umggr-fixed-social-menu-top-left, .umggr-fixed-social-menu-container.umggr-fixed-social-menu-top-right').css('top', headerHeight);

        var mainHeight = $('#main-content').outerHeight() ? $('#main-content').outerHeight() : 0;
        headerHeight = $('#site-header').hasClass('site-header-transparent') ? 0 : headerHeight;
        var HeaderFooterHeight = headerHeight + footerHeight;
         if (((mainHeight + HeaderFooterHeight) < $(window).height()) && mobile === false){
             var contentHeight = ($(document).height() - HeaderFooterHeight);
             $('#main-content').fadeIn();
             $('#main-content').css('min-height',contentHeight);
        } else if (mainHeight + headerHeight < $(window).height()  && mobile === true) {
                //calculate the height of the content area necessary to push footer links below the main footer nav bar
                var contentHeight = ($(window).height() - (headerHeight + footerHeight) );
                //
                $('#main-content').fadeIn();
                // always keep footer idtems below bottom of page.
                $('#main-content').css('min-height',contentHeight);
        }

        setTimeout(function(){
            headerHeight = $('#site-header').outerHeight() ? $('#site-header').outerHeight() : 0;
            footerHeight = $('#site-footer').outerHeight() ? $('#site-footer').outerHeight() : 0;
            mainHeight = $('#main-content').outerHeight() ? $('#main-content').outerHeight() : 0;
            HeaderFooterHeight = (headerHeight + footerHeight);
            if (((mainHeight + HeaderFooterHeight) < $(window).height()) && mobile === false){
                contentHeight = ($(document).height() - HeaderFooterHeight);
                $('#main-content').css('min-height',contentHeight);
            } else if (mainHeight + headerHeight < $(window).height()  && mobile === true) {
                var contentHeight = ($(window).height() - (headerHeight + footerHeight) );
                $('#main-content').css('min-height',contentHeight);
            }
        }, 200);

    }
    //open a slide child menu and set active state
    function openSlideMenu(m) {
        let tweenOpts = {
            y: 0,
            height: 40,
            onComplete: function () {
                $(m).addClass('active');
            }
        };
        const headerPosition = $('#site-header').css('position');
        switch (headerPosition) {
            case 'fixed':
                let siteHeaderHeight = headerHeight = $('#site-header').outerHeight() ? $('#site-header').outerHeight() : 0;
                tweenOpts.top =  siteHeaderHeight;
                tweenOpts.position = 'fixed';
            break;
            default:
                tweenOpts.y = 0;
            break;
        }
        TweenMax.to($(m), 0.3, tweenOpts);
    }

    //toggle slide child menues
    function toggleSlideMenu(slideChild) {
        if (!mobile) {
            //assign the data child-menu class ready for passing to the desktop open child menu function
            const childMenu = $('.' + slideChild.data('child-menu'));
            if (!childMenu.length) {
                return false;
            }

            //remove any menu open states if the current one isn't in the open state
            if (!slideChild.hasClass('open')) {
                $('.with-children').find('a').each(function () {
                    $(this).removeClass('open');
                });
                //otherwise add an open state
                slideChild.addClass('open');
                //close open child menus then open this one
                const openSubMenus = $('.peekaboo.active');
                if (openSubMenus.length) {
                    TweenMax.to(openSubMenus, 0.3, {y: 0, height: 0, onComplete: function () {
                            openSlideMenu(childMenu)
                    }});
                } else {
                    openSlideMenu(childMenu);
                }
                $slideMenuPeakabooContainer.css('overflow', 'visible');
            } else {
                //this menu is open or all are closed - close and remove open state to be sure
                slideChild.removeClass('open');
                TweenMax.to($(childMenu), 0.3, {y: 0, height: 0, onComplete: function () {
                    $(childMenu).removeClass('active');
                    $slideMenuPeakabooContainer.css('overflow', 'hidden');
                }});
            }
        }
    }

    //close slide menu for mobile
    function closeSlideMenuMobile() {
        $slideMenuGR.removeClass('docked');
        TweenMax.to($slideMenuGR, 0.2, {x: siteMenuWidth + 'px', display: 'none'});
        TweenMax.to($('.dimmer-lay'), 0.3, {opacity: 0, display: 'none'});
        TweenMax.staggerTo($('.dock-link'), 0.1, {y: 0}, 0.05);
        $('body').removeClass('-no-overflow');
        $('.open-slide-menu-gr').each(function () {
            $(this).removeClass('expanded');
            var childMenu = $(this).parent().find('.slide-menu-gr-child');
            $(childMenu).removeAttr('style');
        });
    }

    // HG Well's browser navigation
    function timeMachine() {
        if (document.referrer.split('/')[2] !== location.hostname) {
            //External domain
            return true;
        } else {
            //Internal page
            window.history.go(-1);
            event.preventDefault();
        }
    }

    function setYtVideoHeader(container, videoId, videoAutoplay) {
        if (typeof (YT) == 'undefined' || typeof (YT.Player) == 'undefined') {
            window.onYouTubeIframeAPIReady = function () {
                setplayerBannerHeader(container, videoId, videoAutoplay);
            };
            $.getScript('//www.youtube.com/iframe_api');
        } else
        {
            setplayerBannerHeader(container, videoId, videoAutoplay);
        }
    }
    function setplayerBannerHeader(container, videoId, videoAutoplay) {
        var ytMuteBtn = ($('.header-content-item .yt-holder-header').length === 0 ? 'nav-menu' : $('.header-content-item .yt-holder-header').data('yt-mutebtn'));
        var ytPlayerHost = (!main_vars.disable_cookies ? 'https://www.youtube.com' : 'https://www.youtube-nocookie.com');
        if (videoId !== '') {
            $('.yt-holder-header').YTPlayer({
                fitToBackground: true,
                videoId: videoId,
                host: ytPlayerHost,
                pauseOnScroll: false,
                playerVars: {'autoplay': true, 'mute': true, 'controls': 0, 'showinfo': 0, 'rel': 0},
                events: {
                    'onReady': onPlayerReady,
                }
            });
        }
        function onPlayerReady(event) {
            scale_video($('.yt-holder-header'));
        }
        var muteButtonHtml = '<div class="mute-unmute-mute"><a href="#unmute"><span class="-is-visually-hidden">Unmute</span><i class="fa fa-volume-mute" aria-hidden="true"></i></a></div><div class="mute-unmute-unmute" style="display:none"><a href="#mute"><span class="-is-visually-hidden">Mute</span><i class="fa fa-volume-up" aria-hidden="true"></i></a></div>';
        switch (ytMuteBtn) {
         case 'nav-menu':
             var liElement = document.createElement("li");
             liElement.className = 'mute-unmute';
             liElement.innerHTML = muteButtonHtml;
             $('#slide-menu-gr .menu-main-container ul').append(liElement);
             var dynamicParent = $('#slide-menu-gr').parent().parent()[0].className.replace(/\s+/g, '.');
             var divElement = document.createElement("div");
             divElement.className = 'mute-unmute -header';
             divElement.innerHTML = muteButtonHtml;
             $('.'+dynamicParent).append(divElement);
           break;
         case 'overlay':
             $('.video-overlay .mute-unmute').append(muteButtonHtml);
           break;
       }
    }

    function scale_video(elem) {
        var $video = elem;
        var maxHeight;
        if ($(window).width() <= 500) {
          maxHeight = 25;
        } else if ($(window).width() <= 700) {
          maxHeight = 35;
        } else if ($(window).width() <= 1000) {
          maxHeight = 50;
        } else {
          maxHeight = 75;
        }
        $video.find('iframe').css({
            'max-height' : maxHeight + 'vh',
        });
    }

    window.onresize = function(event) {
      if ($('.header-content-item .yt-holder-header').length > 0) {
        scale_video($('.yt-holder-header'));
      }
    };

    $(document).ready(function ()
    {
        enq();
        init();
        listen_for_top_content_loaded();

        //toggle slide menu child desktop
        $('.with-children a').click(function () {
            var slideChild = $(this);
            toggleSlideMenu(slideChild);
            //detect clicks outside the open menu to close it
            $(document).on('click', function (event) {
                if (!$(event.target).closest('.with-children a').length) {
                    $('.with-children').find('a').each(function () {
                        $(this).removeClass('open');
                        $('.peekaboo').each(function () {
                            TweenMax.to($(this), 0.3, {y: 0, height: 0, onComplete: function () {
                                $(this).removeClass('active')
                            }});
                        });
                        $(document).off('click');
                    });
                }
                //event.preventDefault();
            });
        });
        //open mobile slide menu child
        $('.open-slide-menu-gr').click(function (event) {
                var childMenu = $(this).parent().find('.slide-menu-gr-child');
                childMenu.css('height', '');
                if (!$(this).hasClass('expanded')) {
                    $(this).addClass('expanded');
                    $('#slide-menu-gr-peakaboo').css('z-index', 98);
                    var childHeight = childMenu.outerHeight();
                    TweenMax.fromTo(childMenu, 0.3, {height: 0}, {height: childHeight + 'px', display: 'block'});
                } else {
                    $(this).removeClass('expanded');
                    TweenMax.to(childMenu, 0.3, {height: 0, display: 'none', onComplete: function(){
                        $('#slide-menu-gr-peakaboo').css('z-index', 88);
                    }});                    
                }
            event.preventDefault();
        });
        //close slide menu for mobile inside
        $('.slide-menu-toggle').click(function (event) {
                $('body').addClass('-no-overflow');
                $slideMenuGR.css({transform: 'translateX(' + siteMenuWidth + 'px)'});
                //check for previous opn state
                if (!$slideMenuGR.hasClass('docked')) {
                    $slideMenuGR.addClass('docked');
                    TweenMax.to($slideMenuGR, 0.3, {x: 0, display: 'block'});
                    TweenMax.to($('.dimmer-lay'), 0.3, {opacity: 1, display: 'block'});
                    TweenMax.staggerTo($('.dock-link'), 0.1, {y: 50}, 0.05);
                } else {
                    closeSlideMenuMobile();
                }
            event.preventDefault();
        });
        //close slide menu for mobile outside
        $('.dimmer-lay').click(function (event) {
            closeSlideMenuMobile();
            event.preventDefault();
        });

        //toggle filter slide menu for Isotope
        $('.slide-menu-gr-filter-toggle').click(function (event) {
            var peakHeight = $slideMenuPeakaboo.height() + 5;            
            if (!$(this).hasClass('open')) {
                TweenMax.to($(this).parent().find($slideMenuPeakaboo), 0.1, {y: 0});
                $(this).addClass('open');
            } else {
                // TweenMax.to($(this).parent().find($slideMenuPeakaboo), 0.2, {y: -peakHeight});
                TweenMax.to($(this).parent().find($slideMenuPeakaboo), 0.2, {y: peakHeight});
                $(this).removeClass('open');
            }
            event.preventDefault();
        });
        $('.history').click(function (event) {
            timeMachine();
            event.preventDefault();
        });
        $('.btn').mouseover(function () {
            TweenMax.to($(this).parent().find('.btn-r'), 0.1, {x:'0%', opacity:0.7});
            TweenMax.to($(this).parent().find('.btn-l'), 0.2, {x:'-100%'});
        });
        $('.btn').mouseout(function () {
            TweenMax.to($(this).parent().find('.btn-r'), 0.2, {x:'100%', opacity:1});
            TweenMax.to($(this).parent().find('.btn-l'), 0.2, {x:'0%'});
        });

        // check if mobile and the mobile video settings are set to static image
    	var md = new MobileDetect(window.navigator.userAgent);
        // If header video setup YT api video
        if ($('.header-content-item .yt-holder-header').length > 0) {
            var ytId = $('.header-content-item .yt-holder-header').data('yt-id');
            var ytAutoplay = $('.header-content-item .yt-holder-header').data('yt-autoplay');
            var container = $('.header-content-item .yt-holder-header')[0];
            if (md.mobile() === null || !main_vars.mobile_video_settings.mobile_video_override) {
                setYtVideoHeader(container, ytId, ytAutoplay);
            } else {
                // hide mute controls
                $('.video-overlay').hide();
                $('#page .mute-unmute').hide();
                switch (main_vars.mobile_video_settings.mobile_video_image_setting ) {
                    case 'static_image':
                        if (main_vars.mobile_video_settings.mobile_video_static_image) {
                            $('#header-video').css('background-image', 'url(\"' + main_vars.mobile_video_settings.mobile_video_static_image + '\")');
                            $('#header-video').append('<span role=\"img\" aria-label=\"' + main_vars.mobile_video_settings.mobile_video_static_image_alt_text + '\"></span>');
                        } else { // or get a thumbnail from youtube
                            $('#header-video').css('background-image', 'url(\"https://i.ytimg.com/vi/' + ytId + '/hqdefault.jpg\")');
                        }
                        $('#header-video').css('min-height','35vh' );
                        break;
                    case 'embeded_video':
                        var iframe = '<iframe src=\"https://www.youtube-nocookie.com/embed/' + ytId + '?autoplay=1&autohide=1&border=0&wmode=opaque&enablejsapi=1\" class="header-video-mobile-embed" width="100%" height="' + (($(document).width() / 16) * 9) + 'px"></iframe>';
                        $('#header-video').replaceWith(iframe);
                        break;
                }
    		}
        }

        // Check if the content slider is available and which media is currently on the active slide
        if ($('.slider-gr-container.promo-slider').length > 0){
            var contentSlideWrapper = $(".slider-gr-container");
            
            // Check for any video on the first available slide
            contentSlideWrapper.on("init", function(event, slick, currentSlide){
                slick = $(slick.currentTarget);
                setupSliderVideoAudio(slick);
            });

            // Before the next slide make sure to mute all audio
            contentSlideWrapper.on("beforeChange", function(event, slick) {
                slick = $(slick.$slider);
                resetAudio();
            });

            // When viewing the next slide check if audio controls are needed
            contentSlideWrapper.on("afterChange", function(event, slick) {
                slick = $(slick.$slider);                
                setupSliderVideoAudio(slick);                
            });

        }

      if ($( window ).width() < 500) {
          $('.video-overlay').css('opacity','1');
          $('body').on('click', '#page .mute-unmute', function(e) {
            $('.video-overlay').removeAttr('style');
          });
      }

      // add the mute / unmute functionality to the mute icons      
        $('#page .mute-unmute-mute').show();
        $('#page .mute-unmute-mute').toggleClass('active');
      $('body').on('click', '.mute-unmute', function(e) {
          e.preventDefault();
          sound_playing = !sound_playing;
          $(this).toggleClass('playing');
          var player = ($('.slider-gr-slide.slick-active').length > 0 ? $('.slider-gr-slide.slick-active').find('iframe').get(0) : $('.yt-holder-header').data('ytPlayer').player);
          if ($('.slider-gr-slide.slick-active').length > 0){
            muteUnmute(player, sound_playing, 'content-slider');
          } else {
            muteUnmute(player, sound_playing, null);
          }
      });

      function setupSliderVideoAudio(slickObj) {

        var ytAutoplay = 'autoplaymuted';
        var container = $('.slider-gr-slide.slick-active')[0];

        if ($('.slider-gr-slide.slick-active').hasClass('youtube')){
            var ytId = $('.slider-gr-slide.slick-active').data('yt-id');
            video_type = 'youtube';

            if (typeof ytId !== 'undefined') {                                                                                
                if (!audio_control_rendered && (md.mobile() === null || !main_vars.mobile_video_settings.mobile_video_override)) {
                    setYtVideoHeader(container, ytId, ytAutoplay);
                }
                audio_control_rendered = true;
            }
        } else if ($('.slider-gr-slide.slick-active').hasClass('video')){
            var videoId = '';
            video_type = 'html';
            html_video_obj = $(".slick-current").find('video').get(0);
            html_video_obj.muted = true;
            if (!audio_control_rendered && (md.mobile() === null || !main_vars.mobile_video_settings.mobile_video_override)) {
                setplayerBannerHeader(container, videoId, ytAutoplay);
            }
            audio_control_rendered = true;
        }

      }

      function muteUnmute(player, sound_playing, bannerType) {
        if (sound_playing) {
            if (bannerType === 'content-slider'){
                if (video_type === 'html') {
                    if (html_video_obj.muted === true) { 
                        html_video_obj.muted = !html_video_obj.muted;
                    }                    
                } else {
                    postMessageToPlayer(player, {
                        "event": "command",
                        "func": "unMute"
                    });
                    postMessageToPlayer(player, {
                        "event": "command",
                        "func": "playVideo"
                    });
                }
            } else {
                player.unMute();
                player.playVideo();
            }

            $('#page .mute-unmute-mute').hide();
            $('#page .mute-unmute-mute').toggleClass('active');
            $('#page .mute-unmute-unmute').show();
            $('#page .mute-unmute-unmute').toggleClass('active');
            // setTimeout(function(){
            //   $('.mute-unmute-mute').removeClass('active');
            //   $('.mute-unmute-unmute').removeClass('active');
            // }, 200);
        } else {
            if (bannerType === 'content-slider'){
                if (video_type === 'html') {
                    if (html_video_obj.muted === false) {    
                        html_video_obj.muted = true;
                    }
                } else {
                    postMessageToPlayer(player, {
                        "event": "command",
                        "func": "mute"
                    });
                    postMessageToPlayer(player, {
                        "event": "command",
                        "func": "playVideo"
                    });
                }
            } else {
                player.mute();
            }
            // player.pauseVideo();
            $('#page .mute-unmute-mute').show();
            $('#page .mute-unmute-mute').toggleClass('active');
            $('#page .mute-unmute-unmute').hide();
            $('#page .mute-unmute-unmute').toggleClass('active');
            // setTimeout(function(){
            //   $('.mute-unmute-mute').removeClass('active');
            //   $('.mute-unmute-unmute').removeClass('active');
            // }, 200);
        }
      }

      // hide the overlay mute button if cursor is left still for 2.5 seconds
      // var timeout;
      // $('.video-overlay').mousemove(function() {
      //     // $(this).css('opacity', 1);
      //     $('.mute-unmute').addClass('hideBefore');
      //     if (sound_playing) {
      //         $('.mute-unmute-unmute').show();
      //     } else {
      //         $('.mute-unmute-mute').show();
      //     }
      // }).mouseout(function () {
      //     // clearTimeout(timeout);
      //     // timeout = setTimeout(function () {
      //         if (sound_playing) {
      //             $('.mute-unmute-unmute').hide();
      //         } else {
      //             $('.mute-unmute-mute').hide();
      //         }
      //         // $(this).css('opacity', 0.3);
      //         // $('.mute-unmute').removeClass('hideBefore');
      //     // }, 2000);
      // });

      $('.newsletter-header svg').click(function() {
         $('#ae-cform-modal-display-cta-1').trigger('click');
       });
        //newsletter button click
        if($('.newsletter-button').length) {
            $('.newsletter-button').on('click', function(e) {
                e.preventDefault();
                $('.ae-cform-modal-display-cta').trigger('click');
            });
        }

        $('body').trigger('umggr-body-loaded');
       
    });
    $(window).resize(function () {
        enq();
        init();
    });
    $(window).load(function () {
        enq();
        init();
    });
    function resetAudio(){
        var player = $('.slider-gr-slide.slick-active').find('iframe').get(0);
        sound_playing = false;
        $('#page .mute-unmute-mute').show();
        $('#page .mute-unmute-mute').toggleClass('active');
        $('#page .mute-unmute-unmute').hide();
        $('#page .mute-unmute-unmute').toggleClass('active');
        postMessageToPlayer(player, {
            "event": "command",
            "func": "mute"
        });
        postMessageToPlayer(player, {
            "event": "command",
            "func": "pauseVideo"
        });
        if (html_video_obj !== null && typeof html_video_obj !== 'undefined'){
            html_video_obj.muted = true;
        }
    }
})(jQuery);// JavaScript Document

// POST commands to YouTube or Vimeo API
function postMessageToPlayer(player, command){
    if (player == null || command == null) return;
    player.contentWindow.postMessage(JSON.stringify(command), "*");
}

function setNewsletterButtonWidth() {
    var newsletterButtonWidth = 0;
    (function ($) {
        $('.header-mailing-list .ae-cform-container').find('a.ae-cform-modal-display-cta').each(function() {
            if ($(this).outerWidth() > newsletterButtonWidth) {
                newsletterButtonWidth = $(this).outerWidth();
            }
        });
        $('.header-mailing-list').css('min-width', newsletterButtonWidth);
    })(jQuery);
}
