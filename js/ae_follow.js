// Init
(function($) {
    
    function detectIE() {
        var ua = window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
           // Edge (IE 12+) => return version number
           return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    }    
    
    $(document).ready(function() {
        
        if (detectIE()){
            if (detectIE() < 12){
                $('[data-ae-follow-provider="spotify"]').remove();
                $('[data-ae-follow-provider="deezer"]').remove();

                if ($('.stream__buttons__artist__container').find('.ae-follow-widget-container').length === 0){
                    $('.stream__buttons__artist__container').remove();
                }
            }
        }

        // load Google JS API client + YouTube v3 API (TODO: only load this if used - possibly add backend setting to turn it on)
        gapi.load('client', function() {
            gapi.client.load('youtube', 'v3');
        });

        // listener for social action checks, shows message if user tries to deselect an action that is required
        $('.ae-follow-action a.action-check').on('click', function(e) {
            var parent_template = $(this).parents('.ae-follow-widget-template');
            var action_id = $(this).parents('.ae-follow-action').attr('data-ae-action-id');

            if($(this).hasClass('checked')) {
                var required = $(this).attr('data-ae-action-required');
                if(required === 'true') {
                    alert($(this).attr('data-ae-required-msg'));
                } else {
                    $(this).removeClass('checked').addClass('unchecked');
                    AEFOLLOW.remove_shortcode_action(parent_template, action_id);
                }
            } else {
                $(this).removeClass('unchecked').addClass('checked');
                AEFOLLOW.add_shortcode_action(parent_template, action_id);
            }
            //Send GA tracking event
            AEFOLLOW.trackEvent('followToggle', action_id);
            return false;
        });

        AEFOLLOW.init_auth_connect(); // attach click handlers
        AEFOLLOW.add_auth_listeners(); // attach auth connected listeners
    });
})(jQuery);

// initiate ae auth connect when clicking follow widgets if user is not logged in or not connected
AEFOLLOW.init_auth_connect = function(button) {
    var select = ".ae-follow-widget-container button";
    if (typeof button !== "undefined") {
        select = button;
    }
    jQuery('body').on('click', select, function(e) {
        e.preventDefault();
        var follow_widget_container = jQuery(this).parents('.ae-follow-widget-container');
        var auth_connect_container = jQuery(".ae-wp-auth-connect-container", follow_widget_container);
        AEFOLLOW.session_store_add_actioned(follow_widget_container);
        if (jQuery(this).hasClass('ae-follow-following')) {
            AEFOLLOW.auth_connected(follow_widget_container, 'unfollow');
            AEFOLLOW.trackEvent('follow', null);
        } else {
            if (jQuery(auth_connect_container).hasClass('ae-wp-auth-connected')) {
                AEFOLLOW.auth_connected(follow_widget_container, 'follow');
                AEFOLLOW.trackEvent('unFollow', null);
            } else {
                jQuery('.ae-wp-authenticator-anchor', auth_connect_container).click();
            }
        }
    });

    var select_preconf = ".ae-follow-widget-preconf-container button";
    jQuery('body').on('click', select_preconf, function(e) {
        e.preventDefault();
        var follow_widget_container = jQuery(this).parents('.ae-follow-widget-preconf-container');
        var auth_connect_container = jQuery(".ae-wp-auth-connect-container", follow_widget_container);
        var shortcode_id = jQuery(follow_widget_container).attr('data-ae-follow-shortcode-id');
        AEFOLLOW.session_store_set_shortcode_clicked(shortcode_id);
        if (jQuery(auth_connect_container).hasClass('ae-wp-auth-connected')) {
            if(AEFOLLOW.session_store_is_shortcode_complete(shortcode_id)) {
                AEFOLLOW.set_shortcode_complete(follow_widget_container);
            } else {
                AEFOLLOW.run_shortcode_actions(follow_widget_container);
            }
        } else {
            AEFOLLOW.trackEvent('followLoginClicked', null);
            jQuery('.ae-wp-authenticator-anchor', auth_connect_container).click();
        }
    });
};

// add auth connected listeners to all social follow widgets
// this will determine if the user has already connected with the social provider and update the button
AEFOLLOW.add_auth_listeners = function() {
    jQuery(".ae-follow-widget-container").each(function(i, follow_widget_container) {
        jQuery('.ae-wp-auth-connect-container', jQuery(this)).on('ae-wp-auth-connected', function() {
            AEFOLLOW.auth_connected(follow_widget_container, 'follow');
        });
    });

    jQuery(".ae-follow-widget-preconf-container").each(function(i, follow_widget_container) {
        jQuery('.ae-wp-auth-connect-container', jQuery(this)).on('ae-wp-auth-connected', function() {
            var shortcode_id = jQuery(follow_widget_container).attr('data-ae-follow-shortcode-id');
            if(AEFOLLOW.session_store_is_shortcode_complete(shortcode_id)) {
                AEFOLLOW.set_shortcode_complete(follow_widget_container);
                //Set GA connected to
                var ga_data = {};
                ga_data.account_type = 'spotify';
                AEFOLLOW.trackEvent('socialAccountConnect', ga_data);
            } else {
                if(AEFOLLOW.session_store_shortcode_clicked(shortcode_id)) {
                    AEFOLLOW.run_shortcode_actions(follow_widget_container);
                }
            }
        });
    });
};

/*** Preconfigured Shortcode Functions ***/
AEFOLLOW.set_shortcode_complete = function(follow_widget_container) {
    var template = jQuery(follow_widget_container).attr('data-ae-template') == '1';
    var template_container = jQuery(follow_widget_container).parents('.ae-follow-widget-template');
    if(template) {
        jQuery('.ae-follow-widget-template-connect', template_container).hide();
        jQuery('.ae-follow-widget-template-complete', template_container).show();
    } else {
        jQuery('.bt-text', follow_widget_container).hide();
        jQuery('.bt-text-complete', follow_widget_container).css('display', 'block');
        jQuery('button', follow_widget_container).addClass('ae-follow-complete');
        jQuery('.ae-follow-widget-template-complete', follow_widget_container).show();
    }
};

AEFOLLOW.run_shortcode_actions = function(follow_widget_container) {
    var shortcode_id = jQuery(follow_widget_container).attr('data-ae-follow-shortcode-id');
    var removed_actions = jQuery(follow_widget_container).attr('data-ae-actions-removed');
    var user_token = AEFOLLOW.get_provider_token(jQuery(follow_widget_container).attr('data-ae-provider'));
    var ae_user_id = AEJSWP.aeJS.user.data.ID;

    if(typeof removed_actions == 'undefined') {
        removed_actions = '';
    }
    var post_data = {
        action: AEFOLLOW.name + '_shortcode_actions',
        shortcode: shortcode_id,
        removed_actions: removed_actions,
        user_token: user_token,
        ae_user_id: ae_user_id
    };

    jQuery.ajax({
        type: 'POST',
        url: AEJSWP.ajaxurl,
        data: post_data,
        dataType: 'json',
        success: function(response) {
            AEFOLLOW.session_store_set_shortcode_complete(shortcode_id);
            AEFOLLOW.set_shortcode_complete(follow_widget_container);
        }
    });
};

AEFOLLOW.remove_shortcode_action = function(template_container, action_id) {
    var follow_widget_container = jQuery('.ae-follow-widget-preconf-container', template_container);
    if(jQuery(follow_widget_container).length) {
        var removed_actions = jQuery(follow_widget_container).attr('data-ae-actions-removed');
        var actions = [];
        if(typeof removed_actions !== 'undefined' && removed_actions.length > 0) {
            actions = removed_actions.split(',');
            if(jQuery.inArray(action_id, actions) === -1) {
                actions.push(action_id);
            }
        } else {
            actions.push(action_id);
        }
        jQuery(follow_widget_container).attr('data-ae-actions-removed', actions.join(','));
    }
};

AEFOLLOW.add_shortcode_action = function(template_container, action_id) {
    var follow_widget_container = jQuery('.ae-follow-widget-preconf-container', template_container);
    if(jQuery(follow_widget_container).length) {
        var removed_actions = jQuery(follow_widget_container).attr('data-ae-actions-removed');
        var actions = [];
        if(typeof removed_actions !== 'undefined') {
            actions = removed_actions.split(',');
            if(jQuery.inArray(action_id, actions) !== -1) {
                actions = jQuery.grep(actions, function(value) {
                  return value != action_id;
                });
            }
        }
        jQuery(follow_widget_container).attr('data-ae-actions-removed', actions.join(','));
    }
};

/*** END of Preconfigured Shortcode Functions ***/

// run functions after we know that auth has connected to specified provider
AEFOLLOW.auth_connected = function(follow_widget_container, action) {
    var follow_provider = jQuery(follow_widget_container).attr('data-ae-follow-provider');
    if (typeof AEJSWP.aeJS.user !== "undefined") {
        switch (follow_provider) {
            case 'spotify':
                AEFOLLOW.run_spotify(action, follow_widget_container);
                break;
            case 'youtube':
                AEFOLLOW.run_youtube(action, follow_widget_container);
                break;
            case 'facebook':
                AEFOLLOW.run_facebook(action, follow_widget_container);
                break;
            case 'twitter':            
                AEFOLLOW.run_twitter(action, follow_widget_container);
                break;
            case 'deezer':
                AEFOLLOW.run_deezer(action, follow_widget_container);
                break;
            case 'instagram':
                AEFOLLOW.run_instagram(action, follow_widget_container);
                break;
        }
    }
};

//fetch user auth token from specific provider - this interacts with AEJSWP.aeJS.user object
AEFOLLOW.get_provider_user_id = function(provider) {
    if (typeof AEJSWP.aeJS.user !== "undefined" && typeof AEJSWP.aeJS.user.services !== "undefined") {
        var ae_user_services = AEJSWP.aeJS.user.services;
        for (var i in ae_user_services) {
            var service = ae_user_services[i];
            if (service.Service == provider) {
                return service.UserID;
            }
        }
    }
    return false;
};

//fetch user auth token from specific provider - this interacts with AEJSWP.aeJS.user object
AEFOLLOW.get_provider_token = function(provider) {
    if (typeof AEJSWP.aeJS.user !== "undefined" && typeof AEJSWP.aeJS.user.services !== "undefined") {
        var ae_user_services = AEJSWP.aeJS.user.services;
        for (var i in ae_user_services) {
            var service = ae_user_services[i];
            if (service.Service == provider) {
                return service.Token;
            }
        }
    }
    return false;
};

//fetch user auth token secret from specific provider - this interacts with AEJSWP.aeJS.user object
AEFOLLOW.get_provider_token_secret = function(provider) {
    if (typeof AEJSWP.aeJS.user !== "undefined" && typeof AEJSWP.aeJS.user.services !== "undefined") {
        var ae_user_services = AEJSWP.aeJS.user.services;
        for (var i in ae_user_services) {
            var service = ae_user_services[i];
            if (service.Service == provider) {
                return service.TokenSecret;
            }
        }
    }
    return false;
};

//fetch the provider object from the AE user services array
AEFOLLOW.get_provider = function(provider) {
    if (typeof AEJSWP.aeJS.user !== "undefined" && typeof AEJSWP.aeJS.user.services !== "undefined") {
        var ae_user_services = AEJSWP.aeJS.user.services;
        for (var i = 0; i < ae_user_services.length; i++) {
            var service = ae_user_services[i];
            if (service.Service == provider) {
                return service;
            }
        }
    }
    return false;
};

//refresh provider access token and run a callback function once complete
AEFOLLOW.refresh_token = function(provider, callback) {
    var provider_obj = AEFOLLOW.get_provider(provider);
    if (provider_obj !== false) {
        var service_id = provider_obj.ID;
        var post_data = {
            action: AEFOLLOW.name + '_ae_api_call',
            api_action: 'member_refresh_tokens',
            method: 'POST',
            serviceid: service_id
        };
        jQuery.ajax({
            type: 'POST',
            url: AEJSWP.ajaxurl,
            data: post_data,
            dataType: 'json',
            success: function(response) {
                if (typeof response.AccessToken !== "undefined") {
                    callback({
                        success: true,
                        response: response
                    });
                } else {
                    callback({
                        success: false,
                        response: response
                    });
                }
            }
        });
    }
};

//----------Spotify Actions------------//

//run spotify actions (e.g. follow)
AEFOLLOW.run_spotify = function(action, follow_widget_container, user_token) {
    switch (action) {
        //follow artist on spotify
        case 'follow':
            if (typeof user_token === "undefined") {
                user_token = AEFOLLOW.get_provider_token('spotify');
            }

            if (user_token !== false) {
                var follow_type = jQuery(follow_widget_container).attr('data-ae-follow-type');
                var follow_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
                var owner_id = jQuery(follow_widget_container).attr('data-ae-playlist-owner');
                var user_id = AEFOLLOW.get_provider_user_id('spotify');
               
                AEFOLLOW.spotify_check_following(follow_widget_container, user_token, follow_type, follow_id, owner_id, user_id, function(response) {
                    console.log('spotify_check_following');
                    console.log(response);
                    
                    if (typeof response !== "undefined" && response[0] === true) {
                        //set cache
                        AEFOLLOW.session_store_set_followed(follow_widget_container, true);

                        //detach auth connector div and store it
                        var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();

                        if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                            //replace follow widget container with a "Follow" button CTA and append back the auth connector
                            jQuery(follow_widget_container).html(AEFOLLOW.spotify_following_label.replace(/\\/g, '')).append(hidden_auth_content);
                        } else {
                            jQuery(follow_widget_container).append(hidden_auth_content);
                        }
                        jQuery(follow_widget_container).addClass('ae-follow-following');

                        //run already-following event handle to show that a check has been made to see if user is already following and it came back positive
                        AEFOLLOW.run_event_handler('already-following', {
                            'provider': 'spotify',
                            'follow_type': follow_type,
                            'follow_id': follow_id,
                            'owner_id': owner_id,
                            'user_token': user_token
                        });
                    } else {
                        if (typeof response !== "undefined" && (typeof response.error !== "undefined") && response.error.message.indexOf("expired") > 0) {
                            AEJSWP.debugOutput('AEFOLLOW: User token expired, running AE Connect again', response);

                            AEFOLLOW.refresh_token('spotify', function(response) {
                                if (response.success === true) {
                                    AEFOLLOW.run_spotify('follow', follow_widget_container, response.response.AccessToken);
                                } else {
                                    AEJSWP.debugOutput('AEFOLLOW: Could not refresh Spotify token', response);
                                }
                            });
                        } else {
                            //set cache
                            AEFOLLOW.session_store_set_followed(follow_widget_container, false);

                            //detach auth connector div and store it
                            var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();

                            if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                                //replace follow widget container with a "Follow" button CTA and append back the auth connector
                                jQuery(follow_widget_container).html(AEFOLLOW.spotify_follow_cta.replace(/\\/g, '')).append(hidden_auth_content);
                            } else {
                                jQuery(follow_widget_container).append(hidden_auth_content);
                            }
                            //run the spotify API follow action if click action for specific provider and ID has beed stored in session
                            if (AEFOLLOW.session_store_check_actioned(follow_widget_container)) {
                                var follow_data = {
                                    follow_type: follow_type,
                                    follow_id: follow_id,
                                    owner_id: owner_id
                                };
                                //run spotify follow API call
                                AEFOLLOW.spotify_run_follow(follow_widget_container, user_token, 'follow', follow_data, function(response) {
                                        console.log(response);
                                    //remove click action from session
                                    AEFOLLOW.session_store_remove_actioned(follow_widget_container);
                                    if (!response) {
                                        //set cache
                                        AEFOLLOW.session_store_set_followed(follow_widget_container, true);

                                        //detach auth connector div and store it
                                        var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();
                                        if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                                            //replace follow widget container with a "Following" button CTA and append back the auth connector
                                            jQuery(follow_widget_container).html(AEFOLLOW.spotify_following_label.replace(/\\/g, '')).append(hidden_auth_content);
                                        } else {
                                            jQuery(follow_widget_container).append(hidden_auth_content);
                                        }
                                        //run followed event to show that the user has just followed the artist
                                        AEFOLLOW.run_event_handler('followed', {
                                            'provider': 'spotify',
                                            'follow_type': follow_type,
                                            'follow_id': follow_id,
                                            'owner_id': owner_id,
                                            'user_token': user_token
                                        });
                                        //run followed analytics tracking if exists
                                        AEFOLLOW.executeFunctionByName('trackingDelegate.AESocialFollow.spotify', window, {
                                            'follow_type': follow_type,
                                            'follow_id': follow_id,
                                            'owner_id': owner_id,
                                            'user_token': user_token
                                        });
                                    } else {
                                        AEJSWP.debugOutput('AEFOLLOW: Failed to follow', response);
                                    }
                                });
                            }
                        }
                    }
                });
            }
            break;
        case 'unfollow':
            if (typeof user_token === "undefined") {
                user_token = AEFOLLOW.get_provider_token('spotify');
            }

            if (user_token !== false) {

                var follow_type = jQuery(follow_widget_container).attr('data-ae-follow-type');
                var follow_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
                var owner_id = jQuery(follow_widget_container).attr('data-ae-playlist-owner');
                var artist_id = jQuery(follow_widget_container).attr('data-ae-artist-id');
                
                var follow_data = {
                    follow_type: follow_type,
                    follow_id: follow_id,
                    owner_id: owner_id,
                    artist_id: artist_id
                };
                //remove click action from session
                AEFOLLOW.session_store_remove_actioned(follow_widget_container);

                AEFOLLOW.spotify_run_follow(follow_widget_container, user_token, 'unfollow', follow_data, function(response) {
                    if (!response) {
                        //set cache
                        AEFOLLOW.session_store_set_followed(follow_widget_container, false);

                        //detach auth connector div and store it
                        var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();

                        if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                            //replace follow widget container with a "Follow" button CTA and append back the auth connector
                            jQuery(follow_widget_container).html(AEFOLLOW.spotify_follow_cta.replace(/\\/g, '')).append(hidden_auth_content);
                        } else {
                            jQuery(follow_widget_container).append(hidden_auth_content);
                        }
                        jQuery(follow_widget_container).removeClass('ae-follow-following');

                        AEFOLLOW.run_event_handler('unfollowed', {
                            'provider': 'spotify',
                            'follow_type': follow_type,
                            'follow_id': follow_id,
                            'owner_id': owner_id,
                            'user_token': user_token
                        });
                    } else {
                        AEJSWP.debugOutput('AEFOLLOW: Failed to unfollow', response);
                    }
                });
            }
            break;
    }
};

AEFOLLOW.spotify_run_follow = function(follow_widget_container, user_token, action, data, callback) {
    var post_data = data;
    post_data.action = AEFOLLOW.name + '_spotify_api_call';
    post_data.api_action = action;
    post_data.user_token = user_token;
    console.log('FOLLOW CALLED');
    AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), true);
    jQuery.ajax({
        type: 'POST',
        url: AEJSWP.ajaxurl,
        data: post_data,
        dataType: 'json'
    })
    .done(callback)
    .fail(function(x, status, error) {
        callback(error);
    })
    .always(function() {
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    });
};

//check if user is following an artist, then run success function
AEFOLLOW.spotify_check_following = function(follow_widget_container, user_token, follow_type, follow_id, owner_id, user_id, callback) {

    //check if cache has been set before sending API call
    var check_followed = AEFOLLOW.session_store_check_followed(follow_widget_container)
      
    console.log('check_followed');
    if(check_followed !== null) {
        callback([check_followed==='true']);
        return;
    }
    
    

    var post_data = {
        action: AEFOLLOW.name + '_spotify_api_call',
        api_action: 'check_following',
        user_token: user_token,
        follow_type: follow_type,
        follow_id: follow_id,
        owner_id: owner_id,
        user_id: user_id
    };

    AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), true);
    jQuery.ajax({
        type: 'POST',
        url: AEJSWP.ajaxurl,
        data: post_data,
        dataType: 'json'
    })
    .done(callback)
    .fail(function(x, status, error) {
        callback(error);
    })
    .always(function() {
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    });
};

//----------End Spotify Actions------------//


//----------YouTube Actions------------//

//run youtube actions (NB: follow === subscribe)
AEFOLLOW.run_youtube = function(action, follow_widget_container, user_token) {
    switch (action) {
        //follow artist on spotify
        case 'follow':
            if (typeof user_token === "undefined") {
                user_token = AEFOLLOW.get_provider_token('youtube');
            }
            if (user_token !== false) {

                //var follow_type = jQuery(follow_widget_container).attr('data-ae-follow-type'); // not used for youtube - takes channelIds only (for v3 compatability)
                var follow_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
                // check if the user is already subscribed to this channel
                AEFOLLOW.youtube_check_following(follow_widget_container, user_token, follow_id, function(response) {

                    if (response.subscribed === true) {
                        //detach auth connector div and store it
                        var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();
                        if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                            //replace follow widget container with a "Follow" button CTA and append back the auth connector
                            jQuery(follow_widget_container).html(AEFOLLOW.youtube_following_label.replace(/\\/g, '')).append(hidden_auth_content);
                        } else {
                            jQuery(follow_widget_container).append(hidden_auth_content);
                        }

                        //add subscription ID to widget
                        if (typeof response.result.items !== 'undefined' && response.result.items.length > 0) {
                            var first_item = response.result.items.shift();
                            var sub_id = first_item.id;
                            jQuery(follow_widget_container).attr('data-ae-follow-yt-subscription-id', sub_id);
                        }

                        //run already-following event handle to show that a check has been made to see if user is already following and it came back positive
                        AEFOLLOW.run_event_handler('already-following', {
                            'provider': 'youtube',
                            'follow_id': follow_id,
                            'user_token': user_token
                        });
                    } else {

                        if ((typeof response.error !== "undefined") && response.error == '401') {
                            //access token has expired so let's trigger auth connect again
                            console.log('AEFOLLOW: Youtube user token expired', response);

                            AEFOLLOW.refresh_token('youtube', function(response) {
                                if (response.success === true) {
                                    AEFOLLOW.run_youtube('follow', follow_widget_container, response.response.AccessToken);
                                } else {
                                    AEJSWP.debugOutput('AEFOLLOW: Could not refresh Youtube token', response);
                                }
                            });
                        } else {
                            //detach auth connector div and store it
                            var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();
                            if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                                //replace follow widget container with a "Follow" button CTA and append back the auth connector
                                jQuery(follow_widget_container).html(AEFOLLOW.youtube_follow_cta.replace(/\\/g, '')).append(hidden_auth_content);
                            } else {
                                jQuery(follow_widget_container).append(hidden_auth_content);
                            }
                            //run the yotube API follow action if click action for specific provider and ID has beed stored in session
                            if (AEFOLLOW.session_store_check_actioned(follow_widget_container)) {
                                //run youtube follow API call
                                AEFOLLOW.youtube_run_follow(follow_widget_container, user_token, follow_id, function(response) {
                                    //remove click action from session
                                    AEFOLLOW.session_store_remove_actioned(follow_widget_container);
                                    if (response.subscribed == true) {
                                        //detach auth connector div and store it
                                        var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();
                                        if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                                            //replace follow widget container with a "Follow" button CTA and append back the auth connector
                                            jQuery(follow_widget_container).html(AEFOLLOW.youtube_following_label.replace(/\\/g, '')).append(hidden_auth_content);
                                        } else {
                                            jQuery(follow_widget_container).append(hidden_auth_content);
                                        }

                                        //add subscription ID to widget
                                        if (typeof response.sub_id !== 'undefined') {
                                            jQuery(follow_widget_container).attr('data-ae-follow-yt-subscription-id', response.sub_id);
                                        }

                                        //run followed event to show that the user has just followed the artist
                                        AEFOLLOW.run_event_handler('followed', {
                                            'provider': 'youtube',
                                            'follow_id': follow_id,
                                            'user_token': user_token
                                        });
                                        //run followed analytics tracking if exists
                                        AEFOLLOW.executeFunctionByName('trackingDelegate.AESocialFollow.youtube', window, {
                                            'follow_id': follow_id,
                                            'user_token': user_token
                                        });
                                        //Call tracking AAL
                                        var ga_data = {};
                                        ga_data.account_type = 'youtube';
                                        AEFOLLOW.trackEvent('socialAccountConnect', ga_data);
                                    } else {
                                        console.log('AEFOLLOW: Failed to subscribe to YT channel', response);
                                    }
                                });
                            }
                        }
                    }
                });
            }
            break;
        case 'unfollow':
            if (typeof user_token === "undefined") {
                user_token = AEFOLLOW.get_provider_token('youtube');
            }

            if (user_token !== false) {

                //remove click action from session
                AEFOLLOW.session_store_remove_actioned(follow_widget_container);

                var follow_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
                var subscription_id = jQuery(follow_widget_container).attr('data-ae-follow-yt-subscription-id');
                AEFOLLOW.youtube_run_unfollow(follow_widget_container, user_token, subscription_id, function(response) {
                    if (response.unsubscribed === true) {
                        //detach auth connector div and store it
                        var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();
                        if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                            //replace follow widget container with a "Follow" button CTA and append back the auth connector
                            jQuery(follow_widget_container).html(AEFOLLOW.youtube_follow_cta.replace(/\\/g, '')).append(hidden_auth_content);
                        } else {
                            jQuery(follow_widget_container).append(hidden_auth_content);
                        }
                        jQuery(follow_widget_container).removeClass('ae-follow-following');
                        jQuery(follow_widget_container).removeAttr('data-ae-follow-yt-subscription-id');


                        AEFOLLOW.run_event_handler('unfollowed', {
                            'provider': 'youtube',
                            'subscription_id': subscription_id,
                            'follow_id': follow_id,
                            'user_token': user_token
                        });
                    } else {
                        AEJSWP.debugOutput('AEFOLLOW: Failed to unfollow', response);
                        if (response.error == 401) {
                            AEJSWP.debugOutput('AEFOLLOW: Youtube token expired, renewing token');
                            AEFOLLOW.refresh_token('youtube', function(response) {
                                if (response.success === true) {
                                    AEFOLLOW.run_youtube('unfollow', follow_widget_container, response.response.AccessToken);
                                } else {
                                    AEJSWP.debugOutput('AEFOLLOW: Could not refresh Youtube token', response);
                                }
                            });
                        }
                    }
                });
            }
            break;
    }
};

// make a YT API call to subscribe to channel
AEFOLLOW.youtube_run_follow = function(follow_widget_container, user_token, channel_id, callback) {
    AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), true);

    // make a "subscriptions insert" API call with specified channel_id
    var restRequest = gapi.client.request({
        'path': '/youtube/v3/subscriptions',
        'method': 'POST',
        'body': '{"kind":"youtube#subscription","snippet":{"resourceId":{"kind":"youtube#channel","channelId":"' + channel_id + '"}}}',
        'params': {
            'part': 'snippet',
            'access_token': user_token
        }
    });

    restRequest.then(function(resp) {
        // subscribe success
        console.log("AEFOLLOW: YT subscripe API call success", resp.result);
        callback({
            'subscribed': true,
            'sub_id': resp.result.id
        });
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    }, function(reason) {
        // subscribe fail
        console.log('AEFOLLOW YT subscripe API call error: ', reason.result.error);
        callback({
            'subscribed': false,
            'error': reason.result.error.code
        });
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    });
};

// make a YT API call to unsubscribe from channel
AEFOLLOW.youtube_run_unfollow = function(follow_widget_container, user_token, id, callback) {
    AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), true);

    // make a "subscriptions insert" API call with specified channel_id
    var restRequest = gapi.client.request({
        'path': '/youtube/v3/subscriptions',
        'method': 'DELETE',
        'params': {
            'id': id,
            'access_token': user_token
        }
    });
    restRequest.then(function(resp) {
        // subscribe success
        console.log("AEFOLLOW: YT unsubscripe API call success", resp);
        callback({
            'unsubscribed': true
        });
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    }, function(reason) {
        // subscribe fail
        console.log('AEFOLLOW YT unsubscripe API call error: ', reason.result.error);
        callback({
            'unsubscribed': false,
            'error': reason.result.error.code
        });
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    });
};

//check if user is following an channelId, then run success function
AEFOLLOW.youtube_check_following = function(follow_widget_container, user_token, channel_id, callback) {
    AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), true);

    // make a "subscriptions list" API call to check for specified channel_id
    var restRequest = gapi.client.request({
        'path': '/youtube/v3/subscriptions',
        'method': 'GET',
        'params': {
            'part': 'id',
            'access_token': user_token,
            'mine': true, // users own subscriptions
            'forChannelId': channel_id, // only return results with this channel_id
        }
    });
    restRequest.then(function(resp) {
        console.log("AEFOLLOW: YT API subscription check result: ", resp.result);
        if (resp.result.pageInfo.totalResults == 0) {
            // user not subscribed
            console.log("AEFOLLOW: user is not subscribed to specified YT channel");
            callback({
                'subscribed': false
            });
        } else {
            // user subscribed
            console.log("AEFOLLOW: user is subscribed to specified YT channel");
            callback({
                'subscribed': true,
                'result': resp.result
            });
        }
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    }, function(reason) {
        // YT API error
        console.log('AEFOLLOW: YT subscription check API error: ', reason.result.error);
        if (reason.result.error.code == 401) {
            // invalid credentials error - access_token expired
            callback({
                'subscribed': false,
                'error': 401
            })
        }
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    });
};

//----------End YouTube Actions------------//

//----------Twitter Actions------------//

//run twitter actions (e.g. follow)
AEFOLLOW.run_twitter = function(action, follow_widget_container) {
    var user_token = AEFOLLOW.get_provider_token('twitter');
    var user_secret = AEFOLLOW.get_provider_token_secret('twitter');
    switch (action) {
        //follow twitter account
        case 'follow':

            if (user_token !== false) {
                var screen_name = jQuery(follow_widget_container).attr('data-ae-screen-name');
                var user_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
                AEFOLLOW.twitter_check_following(follow_widget_container, user_token, user_secret, screen_name, user_id, function(response) {
                    if (typeof response.following != "undefined") {
                        if (response.following === true) {
                            //set cache
                            AEFOLLOW.session_store_set_followed(follow_widget_container, true);

                            var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();
                            if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                                //replace follow widget container with a "Follow" button CTA and append back the auth connector
                                jQuery(follow_widget_container).html(AEFOLLOW.twitter_following_label.replace(/\\/g, '')).append(hidden_auth_content);
                            } else {
                                jQuery(follow_widget_container).append(hidden_auth_content);
                            }
                            jQuery(follow_widget_container).addClass('ae-follow-following');

                            //run already-following event handle to show that a check has been made to see if user is already following and it came back positive
                            AEFOLLOW.run_event_handler('already-following', {
                                'provider': 'twitter',
                                'screen_name': screen_name,
                                'user_id': user_id,
                                'user_token': user_token
                            });

                        } else {
                            //set cache
                            AEFOLLOW.session_store_set_followed(follow_widget_container, false);

                            //not following
                            //detach auth connector div and store it
                            var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();

                            if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                                //replace follow widget container with a "Follow" button CTA and append back the auth connector
                                jQuery(follow_widget_container).html(AEFOLLOW.twitter_follow_cta.replace(/\\/g, '')).append(hidden_auth_content);
                            } else {
                                jQuery(follow_widget_container).append(hidden_auth_content);
                            }
                            //run the spotify API follow action if click action for specific provider and ID has beed stored in session
                            if (AEFOLLOW.session_store_check_actioned(follow_widget_container)) {
                                var follow_data = {
                                    screen_name: screen_name,
                                    user_id: user_id
                                };
                                //run twitter follow API call
                                AEFOLLOW.twitter_run_follow(follow_widget_container, user_token, user_secret, 'follow', follow_data, function(response) {

                                    //remove click action from session
                                    AEFOLLOW.session_store_remove_actioned(follow_widget_container);
                                    if (typeof response.following != "undefined" && response.following === true) {
                                        //set cache
                                        AEFOLLOW.session_store_set_followed(follow_widget_container, true);

                                        var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();
                                        if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                                            //replace follow widget container with a "Follow" button CTA and append back the auth connector
                                            jQuery(follow_widget_container).html(AEFOLLOW.twitter_following_label.replace(/\\/g, '')).append(hidden_auth_content);
                                        } else {
                                            jQuery(follow_widget_container).append(hidden_auth_content);
                                        }
                                        //run followed event to show that the user has just followed the artist
                                        AEFOLLOW.run_event_handler('followed', {
                                            'provider': 'twitter',
                                            'screen_name': screen_name,
                                            'user_id': user_id,
                                            'user_token': user_token
                                        });
                                        //run followed analytics tracking if exists
                                        AEFOLLOW.executeFunctionByName('trackingDelegate.AESocialFollow.twitter', window, {
                                            'screen_name': screen_name,
                                            'user_id': user_id,
                                            'user_token': user_token
                                        });
                                        //Set GA connected to
                                        var ga_data = {};
                                        ga_data.account_type = 'twitter';
                                        AEFOLLOW.trackEvent('socialAccountConnect', ga_data);
                                    } else {
                                        AEJSWP.debugOutput('AEFOLLOW: Failed to follow', response);
                                    }
                                });
                            }
                        }
                    }
                });
            }
            break;
        case 'unfollow':
            if (typeof user_token === "undefined") {
                user_token = AEFOLLOW.get_provider_token('twitter');
            }

            if (user_token !== false) {

                //remove click action from session
                AEFOLLOW.session_store_remove_actioned(follow_widget_container);

                var screen_name = jQuery(follow_widget_container).attr('data-ae-screen-name');
                var user_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
                var follow_data = {
                    screen_name: screen_name,
                    user_id: user_id
                };
                AEFOLLOW.twitter_run_follow(follow_widget_container, user_token, user_secret, 'unfollow', follow_data, function(response) {
                    if (typeof response.following != "undefined") {
                        //set cache
                        AEFOLLOW.session_store_set_followed(follow_widget_container, false);

                        //detach auth connector div and store it
                        var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();
                        if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                            //replace follow widget container with a "Follow" button CTA and append back the auth connector
                            jQuery(follow_widget_container).html(AEFOLLOW.twitter_follow_cta.replace(/\\/g, '')).append(hidden_auth_content);
                        } else {
                            jQuery(follow_widget_container).append(hidden_auth_content);
                        }
                        jQuery(follow_widget_container).removeClass('ae-follow-following');

                        AEFOLLOW.run_event_handler('unfollowed', {
                            'provider': 'twitter',
                            'screen_name': screen_name,
                            'user_id': user_id,
                            'user_token': user_token
                        });
                    } else {
                        AEJSWP.debugOutput('AEFOLLOW: Failed to unfollow', response);
                    }
                });
            }
            break;
    }
};

//run twitter follow api call
AEFOLLOW.twitter_run_follow = function(follow_widget_container, user_token, user_secret, action, data, callback) {
    var post_data = data;
    post_data.action = AEFOLLOW.name + '_twitter_api_call';
    post_data.api_action = action;
    post_data.user_token = user_token;
    post_data.user_secret = user_secret;

    AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), true);
    jQuery.ajax({
        type: 'POST',
        url: AEJSWP.ajaxurl,
        data: post_data,
        dataType: 'json'
    })
    .done(function(response) {
        var data = {};
        if (typeof response.following != "undefined") {
            data.following = true;
        } else {
            data = response;
        }
        callback(data);
    })
    .fail(function(x, status, error) {
        callback(error);
    })
    .always(function() {
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    });
};

//check if user is following a user, then run callback function
AEFOLLOW.twitter_check_following = function(follow_widget_container, user_token, user_secret, screen_name, user_id, callback) {
    //check if cache has been set before sending API call
    var check_followed = AEFOLLOW.session_store_check_followed(follow_widget_container)
    if(check_followed !== null) {
        callback({following: check_followed==='true'});
        return;
    }

    var post_data = {
        action: AEFOLLOW.name + '_twitter_api_call',
        api_action: 'check_following',
        user_token: user_token,
        user_secret: user_secret,
        screen_name: screen_name,
        user_id: user_id,
    };
    AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), true);
    jQuery.ajax({
        type: 'POST',
        url: AEJSWP.ajaxurl,
        data: post_data,
        dataType: 'json'
    })
    .done(function(response) {
        var data = {};
        if (typeof response.relationship !== "undefined" && typeof response.relationship.source !== "undefined") {
            data.following = response.relationship.source.following;
        }
        callback(data);
    })
    .fail(function(x, status, error) {
        callback(error);
    })
    .always(function() {
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    });;
};

//----------End Twitter Actions------------//

//----------Deezer Actions------------//

//run deezer actions (e.g. follow)
AEFOLLOW.run_deezer = function(action, follow_widget_container, user_token) {
    switch (action) {
        //follow artist on deezer
        case 'follow':
            if (typeof user_token === "undefined") {
                user_token = AEFOLLOW.get_provider_token('deezer');
            }

            if (user_token !== false) {
                var follow_type = jQuery(follow_widget_container).attr('data-ae-follow-type');
                var follow_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
                var artist_id = jQuery(follow_widget_container).attr('data-ae-artist-id');
                var user_id = AEFOLLOW.get_provider_user_id('deezer');
                AEFOLLOW.deezer_check_following(follow_widget_container, user_token, follow_type, follow_id, user_id, function(response) {
                    var following = false;
                    console.log('DEEZER');
                    console.log(response);
                    if (typeof response.data !== "undefined" && response.data.length > 0) {
                        for(var i in response.data) {
                            var artist_data = response.data[i];
                            if(artist_data.id == follow_id) {
                                following = true;
                            }
                        }
                    }

                    if(following) {
                        //set cache
                        AEFOLLOW.session_store_set_followed(follow_widget_container, true);

                        //detach auth connector div and store it
                        var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();

                        if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                            //replace follow widget container with a "Follow" button CTA and append back the auth connector
                            jQuery(follow_widget_container).html(AEFOLLOW.deezer_following_label.replace(/\\/g, '')).append(hidden_auth_content);
                        } else {
                            jQuery(follow_widget_container).append(hidden_auth_content);
                        }
                        jQuery(follow_widget_container).addClass('ae-follow-following');

                        //run already-following event handle to show that a check has been made to see if user is already following and it came back positive
                        AEFOLLOW.run_event_handler('already-following', {
                            'provider': 'deezer',
                            'follow_type': follow_type,
                            'follow_id': follow_id,
                            'user_token': user_token
                        });
                    } else {
                        //set cache
                        AEFOLLOW.session_store_set_followed(follow_widget_container, false);

                        //detach auth connector div and store it
                        var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();

                        if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                            //replace follow widget container with a "Follow" button CTA and append back the auth connector
                            jQuery(follow_widget_container).html(AEFOLLOW.deezer_follow_cta.replace(/\\/g, '')).append(hidden_auth_content);
                        } else {
                            jQuery(follow_widget_container).append(hidden_auth_content);
                        }
                        //run the deezer API follow action if click action for specific provider and ID has beed stored in session
                        if (AEFOLLOW.session_store_check_actioned(follow_widget_container)) {
                            var follow_data = {
                                follow_type: follow_type,
                                follow_id: follow_id,
                                user_id: user_id,
                                artist_id:artist_id,
                            };
                            //run spotify follow API call
                            AEFOLLOW.deezer_run_follow(follow_widget_container, user_token, 'follow', follow_data, function(response) {
                                //remove click action from session
                                AEFOLLOW.session_store_remove_actioned(follow_widget_container);
                                if (response === true) {
                                    //set cache
                                    AEFOLLOW.session_store_set_followed(follow_widget_container, true);

                                    //detach auth connector div and store it
                                    var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();
                                    if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                                        //replace follow widget container with a "Following" button CTA and append back the auth connector
                                        jQuery(follow_widget_container).html(AEFOLLOW.deezer_following_label.replace(/\\/g, '')).append(hidden_auth_content);
                                    } else {
                                        jQuery(follow_widget_container).append(hidden_auth_content);
                                    }
                                    //run followed event to show that the user has just followed the artist
                                    AEFOLLOW.run_event_handler('followed', {
                                        'provider': 'deezer',
                                        'follow_type': follow_type,
                                        'follow_id': follow_id,
                                        'user_id': user_id,
                                        'user_token': user_token
                                    });
                                    //run followed analytics tracking if exists
                                    AEFOLLOW.executeFunctionByName('trackingDelegate.AESocialFollow.deezer', window, {
                                        'follow_type': follow_type,
                                        'follow_id': follow_id,
                                        'user_id': user_id,
                                        'user_token': user_token
                                    });
                                } else {
                                    AEJSWP.debugOutput('AEFOLLOW: Failed to follow', response);
                                }
                            });
                        }

                    }
                });
            }
            break;
        case 'unfollow':
            if (typeof user_token === "undefined") {
                user_token = AEFOLLOW.get_provider_token('deezer');
            }

            if (user_token !== false) {
                var follow_type = jQuery(follow_widget_container).attr('data-ae-follow-type');
                var follow_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
                var artist_id = jQuery(follow_widget_container).attr('data-ae-artist-id');
                var user_id = AEFOLLOW.get_provider_user_id('deezer');
                var follow_data = {
                    follow_type: follow_type,
                    follow_id: follow_id,
                    user_id: user_id
                };
                //remove click action from session
                AEFOLLOW.session_store_remove_actioned(follow_widget_container);

                AEFOLLOW.deezer_run_follow(follow_widget_container, user_token, 'unfollow', follow_data, function(response) {
                    console.log('UNFOLLOW DEEZER');
                    console.log(response);
                    if (response === true) {
                        //set cache
                        AEFOLLOW.session_store_set_followed(follow_widget_container, false);

                        //detach auth connector div and store it
                        var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();

                        if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                            //replace follow widget container with a "Follow" button CTA and append back the auth connector
                            jQuery(follow_widget_container).html(AEFOLLOW.deezer_follow_cta.replace(/\\/g, '')).append(hidden_auth_content);
                        } else {
                            jQuery(follow_widget_container).append(hidden_auth_content);
                        }
                        jQuery(follow_widget_container).removeClass('ae-follow-following');

                        AEFOLLOW.run_event_handler('unfollowed', {
                            'provider': 'deezer',
                            'follow_type': follow_type,
                            'follow_id': follow_id,
                            'user_token': user_token
                        });
                    } else {
                        AEJSWP.debugOutput('AEFOLLOW: Failed to unfollow', response);
                    }
                });
            }
            break;
    }
};

AEFOLLOW.deezer_run_follow = function(follow_widget_container, user_token, action, data, callback) {
    var post_data = data;
    post_data.action = AEFOLLOW.name + '_deezer_api_call';
    post_data.api_action = action;
    post_data.user_token = user_token;

    AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), true);
    jQuery.ajax({
        type: 'POST',
        url: AEJSWP.ajaxurl,
        data: post_data,
        dataType: 'json'
    })
    .done(callback)
    .fail(function(x, status, error) {
        callback(error);
    })
    .always(function() {
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    });
};

//check if user is following an artist, then run success function
AEFOLLOW.deezer_check_following = function(follow_widget_container, user_token, follow_type, follow_id, user_id, callback) {

    //check if cache has been set before sending API call
    /*var check_followed = AEFOLLOW.session_store_check_followed(follow_widget_container)
    if(check_followed !== null) {
        callback([check_followed==='true']);
        return;
    }*/

    var post_data = {
        action: AEFOLLOW.name + '_deezer_api_call',
        api_action: 'check_following',
        user_token: user_token,
        follow_type: follow_type,
        follow_id: follow_id,
        user_id: user_id
    };

    AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), true);
    jQuery.ajax({
        type: 'POST',
        url: AEJSWP.ajaxurl,
        data: post_data,
        dataType: 'json'
    })
    .done(callback)
    .fail(function(x, status, error) {
        callback(error);
    })
    .always(function() {
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    });
};

//----------End Deezer Actions------------//

//----------Instagram Actions------------//

//run instagram actions (e.g. follow)
AEFOLLOW.run_instagram = function(action, follow_widget_container) {
    var user_token = AEFOLLOW.get_provider_token('instagram');
    var user_secret = AEFOLLOW.get_provider_token_secret('instagram');

    switch (action) {
        //follow twitter account
        case 'follow':

            if (user_token !== false) {
                var follow_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
                AEFOLLOW.instagram_check_following(follow_widget_container, user_token, user_secret, follow_id, function(response) {
                    if (typeof response.following != "undefined") {
                        if (response.following === true) {
                            //set cache
                            AEFOLLOW.session_store_set_followed(follow_widget_container, true);

                            var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();
                            if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                                //replace follow widget container with a "Follow" button CTA and append back the auth connector
                                jQuery(follow_widget_container).html(AEFOLLOW.instagram_following_label.replace(/\\/g, '')).append(hidden_auth_content);
                            } else {
                                jQuery(follow_widget_container).append(hidden_auth_content);
                            }
                            jQuery(follow_widget_container).addClass('ae-follow-following');

                            //run already-following event handle to show that a check has been made to see if user is already following and it came back positive
                            AEFOLLOW.run_event_handler('already-following', {
                                'provider': 'instagram',
                                'user_id': follow_id,
                                'user_token': user_token
                            });

                        } else {
                            //set cache
                            AEFOLLOW.session_store_set_followed(follow_widget_container, false);

                            //not following
                            //detach auth connector div and store it
                            var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();

                            if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                                //replace follow widget container with a "Follow" button CTA and append back the auth connector
                                jQuery(follow_widget_container).html(AEFOLLOW.instagram_follow_cta.replace(/\\/g, '')).append(hidden_auth_content);
                            } else {
                                jQuery(follow_widget_container).append(hidden_auth_content);
                            }
                            //run the spotify API follow action if click action for specific provider and ID has beed stored in session
                            if (AEFOLLOW.session_store_check_actioned(follow_widget_container)) {
                                var follow_data = {
                                    user_id: follow_id
                                };
                                //run spotify follow API call
                                AEFOLLOW.instagram_run_follow(follow_widget_container, user_token, user_secret, 'follow', follow_data, function(response) {

                                    //remove click action from session
                                    AEFOLLOW.session_store_remove_actioned(follow_widget_container);
                                    if (typeof response.following != "undefined" && response.following === true) {
                                        //set cache
                                        AEFOLLOW.session_store_set_followed(follow_widget_container, true);

                                        var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();
                                        if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                                            //replace follow widget container with a "Follow" button CTA and append back the auth connector
                                            jQuery(follow_widget_container).html(AEFOLLOW.instagram_following_label.replace(/\\/g, '')).append(hidden_auth_content);
                                        } else {
                                            jQuery(follow_widget_container).append(hidden_auth_content);
                                        }
                                        //run followed event to show that the user has just followed the artist
                                        AEFOLLOW.run_event_handler('followed', {
                                            'provider': 'instagram',
                                            'user_id': follow_id,
                                            'user_token': user_token
                                        });
                                        //run followed analytics tracking if exists
                                        AEFOLLOW.executeFunctionByName('trackingDelegate.AESocialFollow.instagram', window, {
                                            'user_id': follow_id,
                                            'user_token': user_token
                                        });
                                        //Call tracking AAL
                                        var ga_data = {};
                                        ga_data.account_type = 'instagram';
                                        AEFOLLOW.trackEvent('socialAccountConnect', ga_data);
                                    } else {
                                        AEJSWP.debugOutput('AEFOLLOW: Failed to follow', response);
                                    }
                                });
                            }
                        }
                    }
                });
            }
            break;
        case 'unfollow':
            if (typeof user_token === "undefined") {
                user_token = AEFOLLOW.get_provider_token('instagram');
            }

            if (user_token !== false) {

                //remove click action from session
                AEFOLLOW.session_store_remove_actioned(follow_widget_container);

                var follow_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
                var follow_data = {
                    user_id: follow_id
                };
                AEFOLLOW.instagram_run_follow(follow_widget_container, user_token, user_secret, 'unfollow', follow_data, function(response) {
                    if (typeof response.data != "undefined" && typeof response.data.outgoing_status != "undefined") {
                        //set cache
                        AEFOLLOW.session_store_set_followed(follow_widget_container, false);

                        //detach auth connector div and store it
                        var hidden_auth_content = jQuery(".ae-follow-hidden-auth", follow_widget_container).detach();
                        if (!jQuery(follow_widget_container).hasClass('ae-follow-custom')) {
                            //replace follow widget container with a "Follow" button CTA and append back the auth connector
                            jQuery(follow_widget_container).html(AEFOLLOW.instagram_follow_cta.replace(/\\/g, '')).append(hidden_auth_content);
                        } else {
                            jQuery(follow_widget_container).append(hidden_auth_content);
                        }
                        jQuery(follow_widget_container).removeClass('ae-follow-following');

                        AEFOLLOW.run_event_handler('unfollowed', {
                            'provider': 'instagram',
                            'user_id': follow_id,
                            'user_token': user_token
                        });
                    } else {
                        AEJSWP.debugOutput('AEFOLLOW: Failed to unfollow', response);
                    }
                });
            }
            break;
    }
};

//run instagram follow api call
AEFOLLOW.instagram_run_follow = function(follow_widget_container, user_token, user_secret, action, data, callback) {
    var post_data = data;
    post_data.action = AEFOLLOW.name + '_instagram_api_call';
    post_data.api_action = action;
    post_data.user_token = user_token;
    post_data.user_secret = user_secret;

    AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), true);
    jQuery.ajax({
        type: 'POST',
        url: AEJSWP.ajaxurl,
        data: post_data,
        dataType: 'json'
    })
    .done(function(response) {
        var data = {};
        if (typeof response.data != "undefined" && typeof response.data.outgoing_status != "undefined" && response.data.outgoing_status == 'follows') {
            data.following = true;
        } else {
            data = response;
        }
        callback(data);
    })
    .fail(function(x, status, error) {
        callback(error);
    })
    .always(function() {
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    });
};

//check if user is following a user, then run callback function
AEFOLLOW.instagram_check_following = function(follow_widget_container, user_token, user_secret, follow_id, callback) {
    //check if cache has been set before sending API call
    var check_followed = AEFOLLOW.session_store_check_followed(follow_widget_container)
    if(check_followed !== null) {
        callback({following: check_followed==='true'});
        return;
    }

    var post_data = {
        action: AEFOLLOW.name + '_instagram_api_call',
        api_action: 'check_following',
        user_token: user_token,
        user_secret: user_secret,
        user_id: follow_id
    };
    AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), true);
    jQuery.ajax({
        type: 'POST',
        url: AEJSWP.ajaxurl,
        data: post_data,
        dataType: 'json'
    })
    .done(function(response) {
        var data = {};
        if (typeof response.data !== "undefined" && typeof response.data.outgoing_status !== "undefined") {
            data.following = (response.data.outgoing_status != 'none');
        }
        callback(data);
    })
    .fail(function(x, status, error) {
        callback(error);
    })
    .always(function() {
        AEFOLLOW.set_button_loading(jQuery('button', follow_widget_container), false);
    });;
};

//----------End Instagram Actions------------//

//----------Facebook Actions------------//
AEFOLLOW.run_facebook = function(action, follow_widget_container) {
    switch (action) {
        //follow artist on spotify
        case 'follow':
            var user_token = AEFOLLOW.get_provider_token('facebook');
            if (user_token !== false) {
                jQuery(".ae-follow-widget-container[data-ae-follow-provider=\"facebook\"]").show();
            }
            break;
    }
};

//----------End Facebook Actions------------//

//----------Event Listener Functions------------//

// helper - execute a function by name (handles namespaced function names, eg "My.Namespace.functionName")
AEFOLLOW.executeFunctionByName = function(functionName, context /*, args */ ) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        if (typeof context != "undefined") {
            context = context[namespaces[i]];
        } else {
            return false;
        }
    }
    if (typeof context != "undefined" && typeof context[func] != "undefined") {
        return context[func].apply(context, args);
    }
    return false;
}

// add a custom aejsready handler
// TODO: add an optional order param to define the order in which these custom functions are called
AEFOLLOW.add_event_handler = function(event_name, function_name) {
    AEJSWP.debugOutput('AEFOLLOW: Adding custom event handler event: "' + event_name + '" and function : "' + function_name + '"');
    AEFOLLOW.event_handlers.push({
        event_name: event_name,
        function_name: function_name
    });
};

//runs a registered event handler function for the given event_name
AEFOLLOW.run_event_handler = function(event_name, data) {
    if (AEFOLLOW.event_handlers.length > 0) {
        for (var i = 0; i < AEFOLLOW.event_handlers.length; i++) {
            var handler_data = AEFOLLOW.event_handlers[i];
            if (handler_data.event_name == event_name) {
                AEFOLLOW.executeFunctionByName(handler_data.function_name, window, data);
            }
        }
    }
};

//----------End Event Listener Functions------------//

//----------Session Storage------------//

AEFOLLOW.session_store_set_shortcode_clicked = function(id) {
    if (typeof Storage !== "undefined") {
        sessionStorage.setItem('shortcode_clicked_' + id, true);
    }
};

AEFOLLOW.session_store_shortcode_clicked = function(id) {
    if (typeof Storage !== "undefined") {
        return sessionStorage.getItem('shortcode_clicked_' + id);
    }
    return false;
};

AEFOLLOW.session_store_set_shortcode_complete = function(id) {
    if (typeof Storage !== "undefined") {
        sessionStorage.setItem('shortcode_complete_' + id, true);
    }
}

AEFOLLOW.session_store_is_shortcode_complete = function(id) {
    if (typeof Storage !== "undefined") {
        return sessionStorage.getItem('shortcode_complete_' + id);
    }
    return false;
}

AEFOLLOW.session_store_add_actioned = function(follow_widget_container) {
    if (typeof Storage !== "undefined") {
        var follow_provider = jQuery(follow_widget_container).attr('data-ae-follow-provider');
        var screen_name = jQuery(follow_widget_container).attr('data-ae-screen-name');
        var follow_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
        if (typeof follow_provider !== "undefined" && (typeof screen_name !== "undefined" || typeof follow_id !== "undefined")) {
            sessionStorage.setItem(follow_provider + "_" + screen_name + "_" + follow_id, true);
        }
    }
};

AEFOLLOW.session_store_check_actioned = function(follow_widget_container) {
    if (typeof Storage !== "undefined") {
        var follow_provider = jQuery(follow_widget_container).attr('data-ae-follow-provider');
        var screen_name = jQuery(follow_widget_container).attr('data-ae-screen-name');
        var follow_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
        if (typeof follow_provider !== "undefined" && (typeof screen_name !== "undefined" || typeof follow_id !== "undefined")) {
            return sessionStorage.getItem(follow_provider + "_" + screen_name + "_" + follow_id);
        }
    }
    return false;
};

AEFOLLOW.session_store_remove_actioned = function(follow_widget_container) {
    if (typeof Storage !== "undefined") {
        var follow_provider = jQuery(follow_widget_container).attr('data-ae-follow-provider');
        var screen_name = jQuery(follow_widget_container).attr('data-ae-screen-name');
        var follow_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
        if (typeof follow_provider !== "undefined" && (typeof screen_name !== "undefined" || typeof follow_id !== "undefined")) {
            sessionStorage.removeItem(follow_provider + "_" + screen_name + "_" + follow_id);
        }
    }
};

//CACHING MECHANISM
//check if the user has the followed marker in the session storage cache
AEFOLLOW.session_store_check_followed = function(follow_widget_container) {
    var followed = null;
    if (typeof Storage !== "undefined") {
        var follow_provider = jQuery(follow_widget_container).attr('data-ae-follow-provider');
        var screen_name = jQuery(follow_widget_container).attr('data-ae-screen-name');
        var follow_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
        if (typeof follow_provider !== "undefined" && (typeof screen_name !== "undefined" || typeof follow_id !== "undefined")) {
            followed = sessionStorage.getItem(follow_provider + "_" + screen_name + "_" + follow_id + "_followed");
        }
    }
    return followed;
};

//set user following status for specified follow button
AEFOLLOW.session_store_set_followed = function(follow_widget_container, follow) {
    if (typeof Storage !== "undefined") {
        var follow_provider = jQuery(follow_widget_container).attr('data-ae-follow-provider');
        var screen_name = jQuery(follow_widget_container).attr('data-ae-screen-name');
        var follow_id = jQuery(follow_widget_container).attr('data-ae-follow-id');
        if (typeof follow_provider !== "undefined" && (typeof screen_name !== "undefined" || typeof follow_id !== "undefined")) {
            sessionStorage.setItem(follow_provider + "_" + screen_name + "_" + follow_id + "_followed", follow);
        }
    }
};

//----------End Session Storage------------//

//----------Date Functions------------//
Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.dst = function() {
        return this.getTimezoneOffset() < this.stdTimezoneOffset();
    }
//----------End Date Functions------------//

//----------Loader------------//
AEFOLLOW.set_button_loading = function(button, loading) {
    if(loading === true) {
        jQuery(button).addClass('loading');
        jQuery(button).attr('disabled', true);
    } else {
        jQuery(button).removeClass('loading');
        jQuery(button).removeAttr('disabled');
    }
};

//----------End Loader------------//

//Tracker
//
// Analytics event tracking
// type: event method
// data: object containing any data needed to pass to the event (varies by event type)
//

AEFOLLOW.trackEvent = function(type, data) {
    var analytics_data = {};
    switch(type) {
        case 'follow':
        break;
        case 'followLoginClicked':
        break;
        case 'unFollow':
        break;
        case 'followToggle':
        break;
        case 'socialAccountConnect':
            //AEJSWP.debugOutput('Firing followToggle event with data: ', String(analytics_data));
            AEFOLLOW.executeFunctionByName(AEFOLLOW.analytics_tracking_delegate + '.socialAccountConnect', window, String(data));
        break;
        case 'formErrors':
            //AEJSWP.debugOutput('Firing formErrors event with data: ', analytics_data);
            //AEFOLLOW.executeFunctionByName(AEFOLLOW.analytics_tracking_delegate + '.formErrors', window, analytics_data);
        break;
    }
};
