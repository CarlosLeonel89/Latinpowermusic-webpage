/********************************************
 *
 * umgAALWP
 * JS bridge between 3rd party plugins and umgAAL
 *
 */

//
// implement a wait state to check mainly for when/if the 'evidon' variable is available (helps solve async loading)
//
var totalWaitAttempts = 25; // roughly 5 seconds
var currentWaitAttempts = 0;

/**
 * Function to wait until a variable is found - limited to totalWaitAttemps until it stops
 * @param {*} variable // the name of the variable to check for
 * @param {*} callback // the function called when variable found
 * @param {*} triggerOnFail // the function called when variable not found
 */
function waitFor(variable,callback,triggerOnFail){
	var interval=setInterval(function(){
        switch(variable) {
            case 'evidon.notice' :
                if(window['evidon'].notice){
                    clearInterval(interval);
                    callback();
                }else if(currentWaitAttempts<totalWaitAttempts){
                    currentWaitAttempts++;
                }else{
                    clearInterval(interval);
                    triggerOnFail();
                }
                break;                 
            default :
                if(window[variable]){
                    clearInterval(interval);
                    callback();
                }else if(currentWaitAttempts<totalWaitAttempts){
                    currentWaitAttempts++;
                }else{
                    clearInterval(interval);
                    triggerOnFail();
                }
                break;
        }
	},200);
}

var lsTotalWaitAttempts = 25; // roughly 5 seconds
var lsCurrentWaitAttempts = 0;

function waitForLocalStorage(partialKey, cb, timer) {

	var keyFound = false;
	for (var i = 0; i < localStorage.length; i++){
	    if ( localStorage.key(i).indexOf(partialKey) != -1 ) {
	        keyFound = true;
	        break;
	    } else {
	    	console.log('not found evidon storage item');
	    }
	}

	lsCurrentWaitAttempts++;
	
	if (lsCurrentWaitAttempts < lsTotalWaitAttempts) {
  		if (!keyFound) return (timer = setTimeout(waitForLocalStorage.bind(null, partialKey), 100))
  		clearTimeout(timer)
  		if (typeof cb !== 'function') return keyFound
  		return cb(keyFound)
  	} else {
  		clearTimeout(timer)
  		if (typeof cb !== 'function') return keyFound
  		return cb(keyFound)
  	}
}

var tagYTPlayerAPI, firstScriptTag, tagIframeAPI, secondScriptTag;
//
// document init
//
jQuery(document).ready(function() {

  if(typeof(umgAAL) != 'undefined') {

    //
    // init
    //
    if(parseInt(UMGAALWP.debug_enabled)) {
      UMGAALWP.helpers.debug = true;
      umgAAL.helpers.debug_enabled = true;
      UMGAALWP.helpers.debugOutput('Debug output enabled');
    }else{
        UMGAALWP.helpers.debug = 0;
        umgAAL.helpers.debug_enabled = 0;
    }

    //
    // set default values for WP platform
    //
    umgAAL.platform = umgAAL.standardized.PLATFORMS.WORDPRESS;
    umgAAL.user.loginPlatform = 'site';   // assume standard site reg (NB: if AE connect enabled, it's init function will set this to AE instead)

    //
    // iterate over all enabled plugins and run any init needed for it
    //
    for(var plugin_identifier in UMGAALWP.plugins) {
      if(UMGAALWP.plugins[plugin_identifier]) {
        // plugin is enabled, run any initialization code - will call a function 'UMGAALWP.plugins.{plugin_idenifier}_init'
        // eg: 'UMGAALWP.plugins.ae_connect_init' or 'UMGAALWP.plugins.umg_ecrm_init'
        UMGAALWP.helpers.executeFunctionByName('UMGAALWP.plugins.' + plugin_identifier + '_init', window);
      }
    }

  } else {

    //  umgAAL object not found - output this error regardless of debug setting to facilitate debugging on prod servers
    console.log('UMGAALWP: umgAAL object not found on page, init functions have not been run');

  }

});

//
// helpers
//
UMGAALWP.helpers = {
  debug: false,   // default off

  debugOutput: function(message, object) {
  	if(UMGAALWP.helpers.debug) {
  		if(typeof(object) != 'undefined') {
  			console.log('UMGAALWP: ' + message, object);
  		} else {
  			console.log('UMGAALWP: ' + message);
  		}
  	}
  },

  // execute a function by name (handles namespaced function names, eg "My.Namespace.functionName")
  executeFunctionByName: function(functionName, context /*, args */) {
  	var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
  	for (var i = 0; i < namespaces.length; i++) {
  		if(typeof context != "undefined") {
  	  		context = context[namespaces[i]];
  		} else {
  				return false;
  		}
  	}
  	if(typeof context != "undefined" && typeof context[func] != "undefined") {
  		return context[func].apply(context, args);
  	}
  	return false;
  }
};



/********************************************
 *
 * Plugin integrations
 *
 */

//
// AE Connect
//
// init function
UMGAALWP.plugins.ae_connect_init = function() {
  // set user login platform
  umgAAL.user.loginPlatform = 'AE';
  umgAAL.user.partyServiceID = UMGAALWP.party_service_id;

  // set user details if available
  if(typeof(AEJSWP) != 'undefined' && typeof(AEJSWP.aeJS) != 'undefined' && typeof(AEJSWP.aeJS.user.data) != 'undefined') {
    umgAAL.user.loginStatus = 'yes';
    if(typeof(AEJSWP.aeJS.user.data.ID) != 'undefined') {
      umgAAL.user.loginPlatformUserID = AEJSWP.aeJS.user.data.ID;
    }
    if(typeof(AEJSWP.aeJS.user.data.Email) != 'undefined') {
      umgAAL.user.email = AEJSWP.aeJS.user.data.Email;
    }
    if(typeof(AEJSWP.aeJS.user.data.VerifiedEmail) != 'undefined') {
      umgAAL.user.email = AEJSWP.aeJS.user.data.VerifiedEmail;
    }
    if(typeof(AEJSWP.aeJS.user.data.BirthDate) != 'undefined') {
      umgAAL.user.birthDate = AEJSWP.aeJS.user.data.BirthDate;
    }
    if(typeof(AEJSWP.aeJS.user.data.BirthDate) != 'undefined') {
      umgAAL.user.zip = AEJSWP.aeJS.user.data.PostCode;
    }
    if(typeof(AEJSWP.aeJS.user.data.BirthDate) != 'undefined') {
      umgAAL.user.state = AEJSWP.aeJS.user.data.State;
    }
    if(typeof(AEJSWP.aeJS.user.data.BirthDate) != 'undefined') {
      umgAAL.user.country = AEJSWP.aeJS.user.data.Country;
    }
  } else {
    umgAAL.user.loginStatus = 'no';
  }
};
// AE Connect uses a trackingDelegate.AEConnect object to fire events
var trackingDelegate = window.trackingDelegate || {};
trackingDelegate.AEConnect = {
  is_enabled: function() {
    return UMGAALWP.plugins.ae_connect && typeof(umgAAL) != 'undefined';
  },
  loginModalShown: function(call_to_action) {
    if(trackingDelegate.AEConnect.is_enabled) {
      umgAAL.track.account_login_modal_shown( call_to_action );
    }
	},
  registrationModalShown: function(call_to_action) {
    if(trackingDelegate.AEConnect.is_enabled) {
      umgAAL.track.account_registration_modal_shown( call_to_action );
    }
	},
	login: function(data) {
    if(trackingDelegate.AEConnect.is_enabled) {
      UMGAALWP.plugins.ae_connect_init(); // call the  init function just before firing event to capture any updated user details
      umgAAL.user.loginProvider = (data.service_name == 'email') ? umgAAL.user.loginProvider = umgAAL.standardized.SOCIAL_PLATFORMS.SITE : data.service_name; // happy coincedence: ae social service names === umgAAL.standardized.SOCIAL_PLATFORMS
      umgAAL.track.login_success( umgAAL.standardized.SOURCES.PLATFORM_LOGIN );
    }
	},
  registration: function(data) {
    if(trackingDelegate.AEConnect.is_enabled) {
      UMGAALWP.plugins.ae_connect_init();

      umgAAL.track.register_success( umgAAL.standardized.SOURCES.PLATFORM_REGISTRATION );
    }
	},
    newsletterRegistration: function(data) {
        if(trackingDelegate.AEConnect.is_enabled) {
            delete umgAAL.user.birthDate;
            UMGAALWP.plugins.ae_connect_init();
            umgAAL.user.loginProvider = (data.service_name == 'email') ? umgAAL.user.loginProvider = umgAAL.standardized.SOCIAL_PLATFORMS.SITE : data.service_name; // happy coincedence: ae social service names === umgAAL.standardized.SOCIAL_PLATFORMS
            Object.assign(umgAAL.user, data);
            umgAAL.track.register_success( 'WordPress Newsletter Registration' );
        }
    },
  formErrors: function(data) {
    if(trackingDelegate.AEConnect.is_enabled) {
      UMGAALWP.plugins.ae_connect_init();
      var form_type;
      switch(data.form_type) {
        case 'registration':
          form_type = umgAAL.standardized.FORM_TYPES.REGISTRATION;
          break;
        case 'login':
          form_type = umgAAL.standardized.FORM_TYPES.LOGIN;
          break;
        case 'mailinglist':
          form_type = umgAAL.standardized.FORM_TYPES.COMMUNICATIONS;
          break;
      }
      umgAAL.track.form_errors( form_type, data.form_errors );
    }
	},
  accountConnect: function(data) {
    if(trackingDelegate.AEConnect.is_enabled) {
      UMGAALWP.plugins.ae_connect_init();
      var social_provider = ( data.service_name == 'email' ) ? umgAAL.standardized.SOCIAL_PLATFORMS.SITE : data.service_name;
      umgAAL.track.account_social_connect_success( umgAAL.standardized.SOURCES.PLATFORM_REGISTRATION, social_provider );
    }
  }
};


//
// UMG eCRM
//
trackingDelegate.UMGECRM = {
    is_enabled: function() {
      return UMGAALWP.plugins.umg_ecrm && typeof(umgAAL) != 'undefined';
    },
    optin_success: function(data) {
        if(trackingDelegate.UMGECRM.is_enabled) {
            umgAAL.track.comm_optin_success( umgAAL.standardized.SOURCES.PLATFORM_COMMUNICATIONS, data.list_id, data.list_name, data.business_unit );
        }
    }
};
//
// AE Social Follow
trackingDelegate.AESocialFollow = {
  is_enabled: function() {
    return UMGAALWP.plugins.ae_social_follow && typeof(umgAAL) != 'undefined';
  },
  followToggle:function(data) {
        if(trackingDelegate.AESocialFollow.is_enabled) {

        }
  },
  follow:function(data){
        if(trackingDelegate.AESocialFollow.is_enabled) {

        }
  },
  unFollow:function(data){
        if(trackingDelegate.AESocialFollow.is_enabled) {

        }
  },
  followLoginClicked:function(data){
        if(trackingDelegate.AESocialFollow.is_enabled) {

        }
  },
  socialAccountConnect:function(data){
        if(trackingDelegate.AESocialFollow.is_enabled) {
            data = JSON.parse(data);
            var social_provider;
            switch(data.account_type) {
                case 'spotify':
                    social_provider = umgAAL.standardized.SOCIAL_PLATFORMS.SPOTIFY;
                break;
                case 'youtube':
                    social_provider = umgAAL.standardized.SOCIAL_PLATFORMS.YOUTUBE;
                break;
                case 'twitter':
                    social_provider = umgAAL.standardized.SOCIAL_PLATFORMS.TWITTER;
                break;
                case 'instagram':
                    social_provider = umgAAL.standardized.SOCIAL_PLATFORMS.INSTAGRAM;
                break;
            }
            var form_type = umgAAL.standardized.FORM_TYPES.LOGIN;
            umgAAL.track.account_social_connect_success( form_type, social_provider );
        }
  },
  formErrors:function(data){
        if(trackingDelegate.AESocialFollow.is_enabled) {

        }
  }
};


// Login for content
trackingDelegate.LoginForContent = {
  is_enabled: function() {
    return UMGAALWP.plugins.login_for_content && typeof(umgAAL) != 'undefined';
  },
  contentUnlocking:function(data){
        data = JSON.parse(data);
        if(trackingDelegate.LoginForContent.is_enabled) {
            umgAAL.track.unlock_content_success( data.media_type, data.media_id, data.title, umgAAL.user )
        }
  }
};
// Subscribtions
trackingDelegate.Subscriptions = {
  is_enabled: function() {
    return UMGAALWP.plugins.subscriptions && typeof(umgAAL) != 'undefined';
  },
  //COMMUNICATION_OPTIN
  communicationOptin:function(data){
        if(trackingDelegate.subscriptions.is_enabled) {
            data = JSON.parse(data);
            umgAAL.track.comm_optin_success( data.source,data.list_id,data.business_unit,data.subscriber_list_name );
        }
  }
};

// UMG Live
trackingDelegate.UMGLive = {
  is_enabled: function() {
    return UMGAALWP.plugins.umg_live && typeof(umgAAL) != 'undefined';
  },
  //COMMUNICATION_OPTIN
  buyTicketsLink:function(data){
        if(trackingDelegate.UMGLive.is_enabled) {
            data = JSON.parse(data);
            umgAAL.track.tour_store_link(data.platform,data.date,data.location,data.tier,data.link);
        }
  },
  externalLink:function(data){
      if(trackingDelegate.UMGLive.is_enabled) {
            data = JSON.parse(data);
            umgAAL.track.outbound_link(data.location);
      }
  }
};

//BANDs In Town
(function($) {
    "use strict";
    if (UMGAALWP.plugins.bands_in_town && typeof(umgAAL) != 'undefined' )
    {
        $( document ).on( "click", ".bit-event-data, .bit-rsvp", function() {
            umgAAL.track.share('facebook','page','',document.title);
        });
        $( document ).on( "click", ".bit-track-artist-header", function() {
            var dest_url = $(this).attr('href');
            umgAAL.track.outbound_link( dest_url );
        });
        $( document ).on( "click", ".bit-fb-share", function() {
            umgAAL.track.share('facebook','page','',document.title);
        });
        $( document ).on( "click", ".bit-twitter-share", function() {
            umgAAL.track.share('twitter','page','',document.title);
        });

        $( document ).on( "click", ".bit-buy-tix", function() {
            var date = '', location = '', ticket_tier = 'N/A', dest_url = '', platform = 'TourDates';
            var $table_row = $(this).closest('tr');
            dest_url = $(this).attr('href');

            location = $table_row.find('.bit-location').text();

            var fmt = new DateFormatter();
            date = fmt.parseDate(new Date().getFullYear() + ' ' +  $table_row.find('.bit-date').text(), 'Y M d');
            var month = ("0" + (date.getMonth() + 1)).slice(-2)
            var day = ("0" + (date.getDate())).slice(-2);
            var year = date.getFullYear();
            if(new Date(date).getTime() < new Date().getTime())
            {
                year = year +1;
            }
            if ( isNaN(new Date(date)) === false)
            {
                date = year+'-'+month+'-'+day;
            }
            else
            {
                date = '';
            }
            umgAAL.track.tour_store_link(platform,date,location,ticket_tier,dest_url);
        });
    }
})(jQuery);
//GIGPress
(function($) {
    "use strict";
    if (UMGAALWP.plugins.gigpress && typeof(umgAAL) != 'undefined' )
    {
        $( document ).on( "click", ".gigpress-related-item a", function() {
            umgAAL.track.outbound_link( $(this).attr('href') );
        });

        $( document ).on( "click", ".gigpress-venue a", function() {
            umgAAL.track.outbound_link( $(this).attr('href') );
        });
        $( document ).on( "click", ".gigpress-address", function() {
            umgAAL.track.outbound_link( $(this).attr('href') );
        });
        $( document ).on( "click", ".gigpress-show-related a", function() {
            umgAAL.track.outbound_link( $(this).attr('href') );
        });
        $( document ).on( "click", ".gigpress-tickets-link", function() {
            var date = '',month = '',day = '',year = '', location = '', ticket_tier = 'N/A', dest_url = '', platform = 'gigpress';
            dest_url = $(this).attr('href');
            if (UMGAALWP.data.gigpress.shows && typeof(UMGAALWP.data.gigpress.shows) !== 'undefined')
            {
                if (UMGAALWP.data.gigpress.shows.venue_city !== null)
                {
                    location = UMGAALWP.data.gigpress.shows.venue_city + ',';
                }
                if (UMGAALWP.data.gigpress.shows.venue_state !== null)
                {
                    location = location + UMGAALWP.data.gigpress.shows.venue_state + ',';
                }
                if (UMGAALWP.data.gigpress.shows.venue_country !== null)
                {
                    location = location + UMGAALWP.data.gigpress.shows.venue_country + ',';
                }
                date = UMGAALWP.data.gigpress.shows.show_date;
            }
            else
            {
                    var fmt = new DateFormatter();
                    var $table_row = $(this).closest('tr');
                    var $table_row_data = $table_row.prev('tr');

                    if($table_row.length>0 && $table_row_data.length>0)
                    {
                        date = fmt.parseDate($table_row_data.find('.gigpress-date').text(), UMGAALWP.data.gigpress.options.date_format);

                        location = $table_row_data.find('.gigpress-city').text() + ',' + $table_row_data.find('.gigpress-country').text();
                        month = ("0" + (date.getMonth() + 1)).slice(-2)
                        day = ("0" + (date.getDate())).slice(-2);
                        year = date.getFullYear();

                        if ( isNaN(new Date(date)) === false)
                        {
                            date = year+'-'+month+'-'+day;
                        }
                        else
                        {
                            date = '';
                        }
                    }
            }
            umgAAL.track.tour_store_link(platform,date,location,ticket_tier,dest_url);
        });
    }
})(jQuery);

//New Royalslider
(function($) {
    "use strict";
    if (UMGAALWP.plugins.new_royalslider && typeof(umgAAL) != 'undefined' )
    {
        $(window).load(function() {
            $(document).ready(function(){
                //Get Slider Title From AAL JSON
                function get_royal_Slider_title(id){
                    for (var i = 0; i < UMGAALWP.data.royalslider.length; i++) {
                        if (UMGAALWP.data.royalslider[i].id === id)
                        {
                            return UMGAALWP.data.royalslider[i].name;
                        }
                    }
                    return '';
                }
                //Get loop though all Sliders on the Page
                $('.royalSlider').each(function() {
                    var id = $(this).attr('id').replace("new-royalslider-", "");
                    var royal_Slider_title = get_royal_Slider_title(id);
                    umgAAL.track.photo_gallery_view( id, royal_Slider_title);
                });
            });
        });
    }
})(jQuery);

//Nextgen gallery
(function($) {
    "use strict";
    if (UMGAALWP.plugins.nextgen_gallery && typeof(umgAAL) != 'undefined' )
    {
        $(window).load(function() {
            $(document).ready(function(){
                $('.ngg-galleryoverview').each(function(){
                    umgAAL.track.photo_gallery_view( '',window.location.href);
                });
                $('.ngg-navigation a').click(function(){
                    umgAAL.track.photo_gallery_load_more( '',window.location.href,'',$(this).data('pageid'));
                });
            });
        });
    }
})(jQuery);

//ADD THIS
(function($) {
    "use strict";
    var addthisAAL = (window.addthisAAL) ? window.addthisAAL : {};
    if (UMGAALWP.plugins.add_this && typeof(umgAAL) != 'undefined' )
    {
        addthisAAL = {
            init: function () {
                if (typeof(addthis) != 'undefined' ){
                    addthis.addEventListener('addthis.ready', addthisAAL.addthisReady);
                    addthis.addEventListener('addthis.menu.share', addthisAAL.shareEventHandler);
                }
            },
            addthisReady : function(e){

            },
            shareEventHandler : function(e){
                if (e.type == 'addthis.menu.share') {
                    umgAAL.track.share(e.data.service.replace("_share", ""),'page','',document.title);
                }
            }
        };
        //Cant run till after files are loaded as Add this is loaded in the footer so wont work
        $(window).load(function () {
            addthisAAL.init();
        });
    }
})(jQuery);

//epoch comments
(function($) {
    "use strict";

    var oldXHR;
    function newXHR() {
        var realXHR = new oldXHR();
        realXHR.addEventListener("readystatechange", function() {
            if(realXHR.readyState===4 && realXHR.status===200
                    && realXHR.responseURL.indexOf("epoch-api") !== -1 &&
                    ( realXHR.responseURL.indexOf("submit_comment") !== -1 ))
            {
                umgAAL.track.comment('page',epoch_vars.post_id,document.title);
            }
        }, false);
        return realXHR;
    }
    $(window).load(function() {
        //If comments on page and epoch tracking enabled track Ajax comment post events
        if(typeof(UMGAALWP.plugins.epoch) !== 'undefined' && UMGAALWP.plugins.epoch && typeof(epoch_vars) !== 'undefined') {
            //Detect Ajax calls to EPOCH
            oldXHR = window.XMLHttpRequest;
            window.XMLHttpRequest = newXHR;
        }
    });

})(jQuery);

jQuery(document).on('click', '#_evidon-decline-button, #_evidon-accept-button, #evidon-prefdiag-accept, #evidon-prefdiag-decline, #evidon-prefdiag-closeicon', function(){
	processEvidonConsent();
});

jQuery(document).ready(function() {   
    if (typeof (UMGAALWP.services) !== 'undefined' && (typeof UMGAALWP.services.you_tube) !== 'undefined' && UMGAALWP.services.you_tube)
    {
        waitFor('evidon', function() {
            // check if evidon is active and wait until consent has been given before dropping in the YT scripts
            // otherwise add the scripts regardless
            if(typeof window.evidon !== 'undefined') {
                waitForLocalStorage('_evidon_consent_ls_', function(){
                    processEvidonConsent();
                });
            } else {
                insertYouTubeScripts(); // can't find evidon object so drop cookies
            }
        }, function(){
            insertYouTubeScripts(); // can't find evidon object so drop cookies
        });
    } else {
        // services may well be set but the youtube option is not selected
        insertYouTubeScripts();
    }
});

function processEvidonConsent(){
	currentWaitAttempts = 0;
	waitFor('evidon.notice',function(){
		setTimeout(function(){
			let getVendorList=window.evidon.notice.vendorList;
			let getActiveCategories=window.evidon.notice.activecategorySet;
			let consentedCategories=window.evidon.notice._getConsentedCategories();
			let setYouTubeVendorID=0;
			let setYouTubeCategory='';
			let setHandleFunction='';
			let searchActiveCategories=true;
			let handleFunctionFired=false;

			Object.keys(getVendorList).forEach(key=>{
				if(getVendorList[key]=='youtube'){
					setYouTubeVendorID=parseInt(key);
				}
			});

			Object.keys(getActiveCategories).every(categoryKey=>{
				Object.keys(getActiveCategories[categoryKey].vendors).every(vendorIDKey=>{
					setHandleFunction=getActiveCategories[categoryKey].name.replace(/ /g,'');
					if(vendorIDKey==setYouTubeVendorID){
						setYouTubeCategory=categoryKey;
						searchActiveCategories=false;
						return false;
					}
					return true;
				});
				if(!searchActiveCategories){
					return false;
				}
				return true;
			});

			switch(setHandleFunction){
				case'OnlineAdvertising':
					window.evidon.handleOnlineAdvertising=function(){
						insertYouTubeScripts();
						handleFunctionFired=true;
					}
					break;

				case'PerformanceandAnalytics':
					window.evidon.handlePerformanceandAnalytics=function(){
						insertYouTubeScripts();
						handleFunctionFired=true;
					}
					break;
				}
				
				if(
					!handleFunctionFired
					&&setYouTubeVendorID!==0
					&&setYouTubeCategory!==''
					&&consentedCategories[setYouTubeCategory]
				){
					insertYouTubeScripts();
			}
		}, 1000);
	},function(){
		console.log('cannot find evidon.notice');
	});
}

function insertYouTubeScripts()
{
    //Tracking for YouTube
    tagYTPlayerAPI = document.createElement('script');
    tagYTPlayerAPI.src = "//www.youtube.com/player_api";

    firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tagYTPlayerAPI, firstScriptTag);

    tagIframeAPI = document.createElement('script');
    tagIframeAPI.src = "https://www.youtube.com/iframe_api";

    secondScriptTag = document.getElementsByTagName('script')[0];
    secondScriptTag.parentNode.insertBefore(tagIframeAPI, secondScriptTag);
}

(function($) {
    "use strict";
    var youtubeAAL = (window.youtubeAAL) ? window.youtubeAAL : {};
    //var youtubeAAL =  {};
    var YTdeferred = $.Deferred();
    window.onYouTubeIframeAPIReady = function() {
        YTdeferred.resolve(window.YT);
    };

    youtubeAAL = {
        players : [],
        details : {},
        first : false,
        init: function () {
            youtubeAAL.setIframes();
            $('body').bind("DOMSubtreeModified", youtubeAAL.domChange);
        },
        youtube_parser : function (url){
            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
            var match = url.match(regExp);
            return (match&&match[7].length===11)? match[7] : false;
        },
        youtubeIframe : function (potentialYouTubeVideo) {
            var potentialYouTubeVideoSrc = potentialYouTubeVideo.src || '';
            if( potentialYouTubeVideoSrc.indexOf( 'youtube.com/embed/' ) > -1 ||
                potentialYouTubeVideoSrc.indexOf( 'youtube.com/v/' ) > -1 ) {
                return true;
            }
            return false;
        },
        setPlayer : function(iframe, ytid, iframe_id){
            var player = new YT.Player($(iframe).attr('id'), {
                events: {
                    'onReady': function(){
                        $(iframe).data('aal-tracking', 'true');
                        $(iframe).data('aal-tracking-yt-id', ytid);
                    },
                    //youtubeAAL.onReady,
                    'onStateChange':youtubeAAL.onStateChange,
                }
            });
            youtubeAAL.players[ytid] = player;
            player.details = {
                'id' : ytid,
                'title' : '',
                'paused' : false,
                'progress25' : false,
                'progress50' : false,
                'progress75' : false,
                'progress90' : false,
                'progress100': false,
                'postion_timer' : null,
                'duration' : 0,
                'states_array' : [],
                'current_video_postion' : 0
            };
        },
        onStateChange : function(e){
            var player = e.target;
            var player_data = youtubeAAL.getVideoData(player);
            var video_data = player_data.videoData;
            player.details.duration = player_data.duration;


            if ((e.data === 1
                    && (player.details.states_array[player.details.states_array.length-1] !== 2)
                    && player.details.states_array[player.details.states_array.length-1] !== 3)
                    || (e.data === 1 && player.details.states_array[player.details.states_array.length-1] === 3
                     && (player.details.states_array[player.details.states_array.length-2] === -1 || player.details.states_array.length < 2) )){

                        umgAAL.track.video('youtube','play',video_data['video_id'], video_data['title']);

            }else if (e.data === 2 && player.details.states_array[player.details.states_array.length-1] === 1){
                umgAAL.track.video('youtube','pause',video_data['video_id'], video_data['title']);
            }else if (e.data === 0 && player.details.states_array[player.details.states_array.length-1] === 1){
                umgAAL.track.video('youtube','stop',video_data['video_id'], video_data['title']);
            }

            if (e.data === 1){
                player.details.postion_timer = setInterval(function() {
                    var new_percent = Math.round((player_data.currentTime/player.details.duration)*100);
                    if (player.details.percent_played !== new_percent)
                    {
                        switch(new_percent) {
                            case 25:
                                umgAAL.track.video('youtube','25%',video_data['video_id'], video_data['title']);
                            break;
                            case 50:
                                umgAAL.track.video('youtube','50%',video_data['video_id'], video_data['title']);
                            break;
                            case 75:
                                umgAAL.track.video('youtube','75%',video_data['video_id'], video_data['title']);
                            break;
                            case 90:
                                umgAAL.track.video('youtube','90%',video_data['video_id'], video_data['title']);
                            break;
                            case 100:
                                umgAAL.track.video('youtube','100%',video_data['video_id'], video_data['title']);
                            break;
                        }
                    }

                    if (player.details.current_video_postion===player_data.currentTime){
                         clearInterval(player.details.postion_timer);
                    }
                    player.details.current_video_postion=player_data.currentTime;
                    player.details.percent_played = new_percent;
                }, 1000);
            }

            if (player.details.states_array.length === 5)
            {
                player.details.states_array.shift();
            }
            player.details.states_array.push(e.data);

            if (e.data === 0 || e.data === 2)
            {
                player.details.states_array = [];
            }

            player.details.current_video_postion = player_data.currentTime;

        },
        setIframes : function(){
            $('iframe').each(function(index, iframe) {
                var yt_id = youtubeAAL.youtube_parser(iframe.src);
                if ((yt_id && $(this).data('aal-tracking') === undefined) || (yt_id && ($(this).data('aal-tracking-yt-id') !==yt_id)))
                {

                    if ($(this).attr('id') === undefined)
                    {
                        $(this).attr('id', 'player-'+yt_id);
                    }

                    if ($(this).attr('src').indexOf('enablejsapi=1') === -1){
                        if ($(this).attr('src').indexOf('?') === -1){
                            $(this).attr('src', $(this).attr('src') + '?enablejsapi=1');
                        }else
                        {
                            $(this).attr('src', $(this).attr('src') + '&enablejsapi=1');
                        }
                    }
                    youtubeAAL.setPlayer($(this)[0],yt_id, $(this).attr('id'));
                }
            });
        },
        domChange : function (){
            youtubeAAL.setIframes();
        },

        getVideoData: function(videoObj) {
            /**
             * Get YouTube Video datablock from video object
             * - reason for this function is that when other YT.Player are initiating the video then the API functions are not available
             * - such as getDuration()
             */
            for (var prop in videoObj) {
                if(videoObj.hasOwnProperty(prop)) {
                    var propValue = videoObj[prop];
                    if(propValue && typeof propValue !== 'undefined' && typeof propValue.videoData !== 'undefined'
                        && typeof propValue.duration !== 'undefined') {
                        return propValue;
                    }
                }
            }
            return false;
        }
    };

    YTdeferred.done(function() {
        jQuery(window).load(function() {
            if (typeof (UMGAALWP.services) !== 'undefined' && (typeof UMGAALWP.services.you_tube) !== 'undefined' && UMGAALWP.services.you_tube)
            {
               youtubeAAL.init();
            }
        });
    });

})(jQuery);


//Stackla
(function($) {
    "use strict";
    var stacklaAAL = window.stacklaAAL ? window.stacklaAAL : {};
    stacklaAAL = {
        stackla_items : [],
        init: function () {
            Stackla.WidgetManager
                .on('load', stacklaAAL.onLoad)
                .on('tileExpand', stacklaAAL.onTileExpand)
                .on('userClick', stacklaAAL.onUserClick)
                .on('shareClick', stacklaAAL.onShareClick)
                .on('moreLoad', stacklaAAL.onLoadMore)
                .on('productActionClick', stacklaAAL.onProductActionClick);
        },
        onLoad : function(e, data){
            var type = 'custom';
            if (data.styleName && data.styleName.indexOf('carousel') !== -1)
            {
                type = 'carousel';
                umgAAL.track.photo_gallery_view( data.widgetId, data.name, '', 0 );
            }
            else if (data.styleName && data.styleName.indexOf('billboard') !== -1)
            {
                type = 'billboard';
                umgAAL.track.photo_gallery_view( data.widgetId, data.name, '', 0 );
            }
            else if (data.styleName && data.styleName.indexOf('feed') !== -1)
            {
               type = 'feed';
               umgAAL.track.photo_gallery_view( data.widgetId, data.name, '', 0 );
            }
            else if (data.styleName && data.styleName.indexOf('slideshow') !== -1)
            {
                type = 'slideshow';
                umgAAL.track.photo_gallery_view( data.widgetId, data.name, '', 0 );
            }
            else if (data.styleName && data.styleName.indexOf('waterfall') !== -1)
            {
               type = 'waterfall';
               umgAAL.track.photo_gallery_view( data.widgetId, data.name, '', 0 );
            }
            var stackla_obj = {id:data.widgetId,type:type, name:data.name};
            stacklaAAL.stackla_items.push(stackla_obj);
        },
        onTileExpand : function(e, data){
            if (data.tileData.media === 'video' && data.tileData.source!=='youtube' && data.tileData.source!=='vimeo'){
                umgAAL.track.video(data.tileData.source,'play',data.widgetId, data.tileData.message);
            }
            else if (data.tileData.media === 'audio' && data.tileData.source!=='soundcloud'){
                umgAAL.track.audio(data.tileData.source, 'play', data.widgetId, data.tileData.message);
            }
        },
        onUserClick : function (e, data){
            if (data.tileData.author_link)
            {
                umgAAL.track.outbound_link( data.tileData.author_link );
            }
            else
            {
                umgAAL.track.outbound_link( data.tileData.original_url );
            }
        },
        onShareClick : function(e, data){
            umgAAL.track.share( data.shareNetwork, data.tileData.media, data.widgetId, data.tileData.message );
        },
        onLoadMore : function (e, data) {
            var stackla_obj = stacklaAAL.getStacklaItemById(data.widgetId);
            if (stackla_obj !== null
                  /*
                    &&
                (stackla_obj.type === 'slideshow'
                || stackla_obj.type === 'carousel'
                || stackla_obj.type === 'billboard')
                */
               ){

                umgAAL.track.photo_gallery_load_more( stackla_obj.id, stackla_obj.name, '', data.page );
            }
        },
        onProductActionClick: function(e, data){

            var store = '';
            var dest_url = '';
            if (data.productTag)
            {
                if (data.productTag.custom_url)
                {
                    dest_url = data.productTag.custom_url;
                }
                if (data.productTag.tag)
                {
                    store = data.productTag.tag;
                }
            }
            umgAAL.track.merch_link( store, dest_url )
        },
        getStacklaItemById : function(id){
            for (var i = 0; i < stacklaAAL.stackla_items.length; i++) {
                if (stacklaAAL.stackla_items[i].id === id)
                {
                   return stacklaAAL.stackla_items[i];
                }
            }
            return null;
        }
    };
    if (UMGAALWP.plugins.stackla && typeof(umgAAL) != 'undefined' )
    {
        stacklaAAL.init();
    }
})(jQuery);


//Slider Revolution
(function($) {
    "use strict";
    if (UMGAALWP.plugins.revslider && typeof(umgAAL) != 'undefined' )
    {
        $(window).load(function() {
            $(document).ready(function(){
                //Get Slider Title From AAL JSON
                function get_revslider_details(alias){
                    for (var i = 0; i < UMGAALWP.data.revslider_slider.length; i++) {
                        if (UMGAALWP.data.revslider_slider[i].alias === alias)
                        {
                            return UMGAALWP.data.revslider_slider[i];
                        }
                    }
                    return null;
                }
                //Get loop though all Sliders on the Page
                $('.rev_slider_wrapper').each(function() {
                    var alias = $(this).data('alias');
                    var source = $(this).data('source');

                    if (source === 'gallery' || source === 'flickr' || source === 'instagram')
                    {
                        var slider_details = get_revslider_details(alias);
                        var title = '';
                        var id = '';
                        if (slider_details !== null)
                        {
                            title = slider_details.title;
                            id = slider_details.id;
                        }
                        umgAAL.track.photo_gallery_view( id, title);
                    }
                });
            });
        });
    }
})(jQuery);
