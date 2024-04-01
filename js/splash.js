(function ($) {

    var splashVideo;

    "use strict";
    //check if splash modal is already set
    function isSplashed() {
        var splashed = false;
        if (typeof (sessionStorage) !== 'undefined') {
            splashed = sessionStorage.getItem('umggr-splashed');
        }
        return splashed;
    }

    //set splashed session key
    function setSplashed() {
        if (typeof (sessionStorage) !== 'undefined') {
            sessionStorage.setItem('umggr-splashed', true);
        }
    }
    function setplayerSplash(container, videoId) {
        console.log('video');

        if(!$(container).length || (typeof YTPlayer === 'undefined')) return;

        var ytPlayerHost = (!UMGGR_Splash_Shortcode.disable_cookies ? 'https://www.youtube.com' : 'https://www.youtube-nocookie.com');

        var ytPlayerAutoplay = false;
        var ytPlayerMute = false;
        if (UMGGR_Splash_Shortcode.autoplay_setting != 'null') {
            ytPlayerAutoplay = true;
            ytPlayerMute = true;
        }
        $(container).YTPlayer({
            videoId: videoId,
            host: ytPlayerHost,
            playerVars: {'autoplay': ytPlayerAutoplay, 'mute': ytPlayerMute, 'controls': 0, 'showinfo': 0, 'rel': 0, 'playlist': videoId, 'loop': 1},
             events: {
                    'onReady': function(event){
                        $('#umggr-splash').trigger('youtube-splash-ready');
                        $('#umggr-splash .media-aspect-wrapper').delay(400).show(350);
                    },
                }
        });
        splashVideo = $(container).data('ytPlayer').player;

    }
    function setYtVideo(container, videoId) {
        $(container).parent().hide();
        if (typeof (YT) == 'undefined' || typeof (YT.Player) == 'undefined') {
            window.onYouTubeIframeAPIReady = function () {
                setplayerSplash(container, videoId);
            };
        }
        else
        {
            setplayerSplash(container, videoId);
        }
    }

    UMGGR_Splash_Shortcode.showSplash = function() {
        //check if #splash modal is present and cookie is not set
        //splash cookie is set once modal is shown once and valid for the current browser session
        //only show splash page on homepage
        if ($('#umggr-splash').length && UMGGR_Splash_Shortcode.is_home){
            var $obj = $('#umggr-splash');
            if($obj.attr('data-repeatsplash') == 'first_time') {
                if(!isSplashed()) {
                    $obj.show();
                    $('body').addClass('-no-overflow');
                }
            }else{
                sessionStorage.setItem('umggr-splashed', '');
                $obj.show();
                $('body').addClass('-no-overflow');
            }

        }
    }

    UMGGR_Splash_Shortcode.initSplash = function() {

        if ($('#umggr-splash .splash-video-contain .yt-holder').length > 0){
            var ytId = $('#umggr-splash .splash-video-contain .yt-holder').data('yt-id');
            var container = $('#umggr-splash .splash-video-contain .yt-holder')[0];
            setYtVideo(container, ytId);
        }
        $('.close-modal').click(function () {
            if ($(this).parents('#umggr-splash').length) {
                $('#umggr-splash').fadeOut(500, function(){
                    $('body').removeClass('-no-overflow');
                    $('#umggr-splash').remove();
                    setSplashed();
                });
            }
            $('body').removeClass('-no-overflow');
        });

        if (UMGGR_Splash_Shortcode.video_format == 'youtube') {
            // add the mute / unmute functionality to the mute icons
            var sound_playing = false;
            $('body').on('click', '.splash-mute-unmute', function(e) {
                e.preventDefault();
                sound_playing = !sound_playing;
                $(this).toggleClass('playing');
                muteUnmute(splashVideo, sound_playing);
            });

            $('body').on('click', '.splash-video-overlay', function(e) {
                e.preventDefault();
                sound_playing = !sound_playing;
                $(this).toggleClass('playing');
                muteUnmute(splashVideo, sound_playing);
            });
        } else if (UMGGR_Splash_Shortcode.video_format == 'mp4') {
            $('body').on('click', '.splash-mute-unmute', function(e) {
                e.preventDefault();
                if( jQuery("#mp4-video").prop('muted') ) {
                    jQuery("#mp4-video").prop('muted', false);
                    $('.splash-mute-unmute-mute').show();
                    $('.splash-mute-unmute-unmute').hide();
                } else {
                    jQuery("#mp4-video").prop('muted', true);
                    $('.splash-mute-unmute-mute').hide();
                    $('.splash-mute-unmute-unmute').show();
                }
            });
        }

        function muteUnmute(player, sound_playing) {
            if (sound_playing) {
                player.unMute();
                $('.splash-mute-unmute-mute').show();
                $('.splash-mute-unmute-unmute').hide();
            } else {
                player.mute();
                $('.splash-mute-unmute-mute').hide();
                $('.splash-mute-unmute-unmute').show();
            }
        }

        // hide the overlay mute button if cursor is left still for 2.5 seconds
        var timeout;
        $('.splash-video-overlay').mousemove(function(){
            if (sound_playing) {
                $('.splash-mute-unmute-unmute').fadeIn();
            } else {
                $('.splash-mute-unmute-mute').fadeIn();
            }
            clearTimeout(timeout);
            timeout = setTimeout(function(){
                if (sound_playing) {
                    $('.splash-mute-unmute-unmute').fadeOut();
                } else {
                    $('.splash-mute-unmute-mute').fadeOut();
                }
            }, 2000);
        });
    }

    $(document).ready(function () {
        UMGGR_Splash_Shortcode.initSplash();

        if(typeof UMGGR_Deeplink_Module !== 'undefined') {
            UMGGR_Deeplink_Module.onEvent('loaded', function() {
                console.log(UMGGR_Deeplink_Module.currentLink )
                //do not open splash if deeplinking into a post/section
                if(UMGGR_Deeplink_Module.currentLink === null) {
                    UMGGR_Splash_Shortcode.showSplash();
                }
            });
        } else {
            UMGGR_Splash_Shortcode.showSplash();
        }
    });

})(jQuery);
