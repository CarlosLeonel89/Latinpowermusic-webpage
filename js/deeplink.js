(function($) {

    /**
     * Set scroll restoration (browser scroll function for anchors) to manual so we can scroll smoother using TweenMax
     * @type {"manual"}
     */
    history.scrollRestoration = 'manual';

    $(document).ready(function() {

        //fire only when body has finished loading (i.e. loader is hidden)
        $('body').on('umggr-body-loaded', function() {
            UMGGR_Deeplink_Module.onLoad();
        });
    });

    /**
     * Allow deeplink automatic scrolling to be disabled if other libraries are handling it
     *
     * @type {boolean}
     */
    UMGGR_Deeplink_Module.deeplinkScrollEnabled = true;

    /**
     * Set which type of URL to use for sections. Either hash '#' or path '/'
     *
     * @type {boolean}
     */
    UMGGR_Deeplink_Module.urlType = '#';

    /**
     * Current Hash or URL path value
     * @type {string|null}
     */
    UMGGR_Deeplink_Module.currentLink = null

    /**
     * Define which element we use for scrolling. By default it's window but some layouts use a container and scroll inside
     * of the container instead.
     * @type {mixed}
     */
    UMGGR_Deeplink_Module.scrollParent = window;

    /**
     * Define scroll offset - this usually depends on top bar height and device
     * @type {number}
     */
    UMGGR_Deeplink_Module.scrollOffset = 0;

    /**
     * Define admin bar height if logged in as admin
     * @type {number}
     */
    UMGGR_Deeplink_Module.adminBarHeight = 0;


    /**
     * Function ran onLoan of DOM. This will navigate scroll to element if hash value is present
     * Also checks if data-deeplink attributes are present for anchors so it can open them (i.e. news modals)
     */
    UMGGR_Deeplink_Module.onLoad = function() {

        //set admin bar height if exists
        if($('#wpadminbar').length) {
            UMGGR_Deeplink_Module.adminBarHeight = $('#wpadminbar').height();
        }

        //check if deeplink scrolling is enabled
        if(UMGGR_Deeplink_Module.deeplinkScrollEnabled) {
            //handle onClick events for anchors that are for on page elements
            $('.scroll-menu-link').click(function (e) {

                //get menu item url
                var address = $(this).find('a').attr("href").toLowerCase();

                //get item to which we are navigating
                var navigateTo = $('[data-deeplink="' + address.replace(UMGGR_Deeplink_Module.urlType, '') + '"]');

                //ensure body has overflow visible & hide mobile menus if open
                $('#umggr-nav-overlay').hide();
                $('body').removeClass('-no-overflow');

                if (navigateTo.length) {

                    UMGGR_Deeplink_Module.singlePagerNavigate(address, navigateTo, UMGGR_Deeplink_Module.scrollOffset);
                } else {
                    //element not found so navigate to top of page
                    UMGGR_Deeplink_Module.singlePagerNavigate(null, null, 0);
                }

                return false;
            });

            /**
             * Scroll to elements on page when browser history back/forward is clicked
             */
            window.onpopstate = function(event) {
                if(typeof location.hash !== 'undefined') {
                    var hashValue =  location.hash.replace(UMGGR_Deeplink_Module.urlType, '');
                    if(hashValue.length) {
                        //navigate to deeplink element if found
                        var deeplinkElement = $('[data-deeplink="'+hashValue+'"]');
                        if(deeplinkElement.length) {

                            UMGGR_Deeplink_Module.currentLink = hashValue

                            UMGGR_Deeplink_Module.updateScroller(deeplinkElement, UMGGR_Deeplink_Module.scrollOffset);
                        }
                    } else {
                        if(typeof location.pathname !== 'undefined' && location.pathname === '/') {
                            UMGGR_Deeplink_Module.currentLink = null

                            //navigate to top of page if value is blank or only '/'
                            UMGGR_Deeplink_Module.updateScroller(0, 0);
                        }
                    }
                }
            };

            //get URL hash if present
            var navigationHash = location.hash;
            if(navigationHash.length) {

                let cleanHash

                //remove hash prefix added by react HashRouter
                if (navigationHash.startsWith('#/')) {
                    cleanHash = navigationHash.replace('#/', '')
                } else {
                    cleanHash = navigationHash.replace(UMGGR_Deeplink_Module.urlType, '')
                }

                //get item to which we are navigating
                var navigateTo = $('[data-deeplink="' + cleanHash + '"]');

                //trigger event so external scripts can handle their own actions
                UMGGR_Deeplink_Module.triggerEvent('navigation','hash', navigationHash);

                if(navigateTo.length) {
                    UMGGR_Deeplink_Module.currentLink = cleanHash

                    UMGGR_Deeplink_Module.singlePagerNavigate(navigationHash, navigateTo, UMGGR_Deeplink_Module.scrollOffset);
                }
            }
        }

        var href = location.href;
        if(href.length) {

            //remove hash from URL if any is set
            if(href.includes('#')) {
                href = href.substr(0, href.indexOf('#'));
            }

            //remove any query parts
            if(href.includes('?')) {
                href = href.substr(0, href.indexOf('?'));
            }

            //find anchor with attribute of deep-link and href same as one in the URL
            var deeplinkAnchor = $('a[data-deeplink][href="'+href+'"]');
            if(deeplinkAnchor.length) {

                UMGGR_Deeplink_Module.currentLink = href

                //trigger event so external scripts can handle their own actions
                UMGGR_Deeplink_Module.triggerEvent('navigation', 'path', deeplinkAnchor);

                var parentAnchor = $(deeplinkAnchor).parents('[data-deeplink]');

                if(parentAnchor.length) {
                    //scroll to element
                    UMGGR_Deeplink_Module.updateScroller(parentAnchor, UMGGR_Deeplink_Module.scrollOffset);
                } else {
                    //scroll to element
                    UMGGR_Deeplink_Module.updateScroller(deeplinkAnchor, UMGGR_Deeplink_Module.scrollOffset);
                }

                UMGGR_Deeplink_Module.openModal(deeplinkAnchor);
            }
        }

        UMGGR_Deeplink_Module.triggerEvent('loaded');
    };

    /**
     * List of callback functions
     *
     * @type {Array}
     */
    UMGGR_Deeplink_Module.onEventCallbacks = [];

    /**
     * Add callback for event so external scripts can handle their own functions
     *
     * @param callback
     */
    UMGGR_Deeplink_Module.onEvent = function(eventName, callback) {
        UMGGR_Deeplink_Module.onEventCallbacks.push({
            eventName: eventName,
            callback,
        });
    }

    /**
     * Run registered deeplink callbacks
     *
     * @param string type
     * @param string url
     */
    UMGGR_Deeplink_Module.triggerEvent = function(eventName, args) {
        if(UMGGR_Deeplink_Module.onEventCallbacks.length) {
            for(var i in UMGGR_Deeplink_Module.onEventCallbacks) {
                if(eventName === UMGGR_Deeplink_Module.onEventCallbacks[i].eventName) {
                    UMGGR_Deeplink_Module.onEventCallbacks[i].callback.apply([].slice.call(arguments, 1));
                }
            }
        }
    }


    /**
     * Navigate single page site to element via TweenMax + Update URL address bar with menu navigation
     *
     * @param string anchorUrl
     * @param jQueryElement navigateTo
     * @param number offset
     */
    UMGGR_Deeplink_Module.singlePagerNavigate = function(anchorUrl, navigateTo, offset ) {

        //if navigateTo is null then set Y = 0 (top of page)
        if(navigateTo === null) {
            navigateTo = 0;
        }

        //if anchorURL is null then we are navigating to top of page
        if(anchorUrl === null) {
            anchorUrl = '/';
        }

        //scroll to element
        UMGGR_Deeplink_Module.updateScroller(navigateTo, offset);

        //update browser url bar
        UMGGR_Deeplink_Module.updateNavigation(anchorUrl);
    };

    /**
     * Set scroll browser position to specific element and offset
     * @param jQueryElement element
     * @param number offset
     */
    UMGGR_Deeplink_Module.updateScroller = function(element, offset) {
        element = element ? element : $('body');
        var offset = offset - UMGGR_Deeplink_Module.adminBarHeight;
        $('html, body').animate({
            scrollTop: $(element).offset().top - offset,

        }, 150, 'linear');
    };

    /**
     * Set browser URL bar hash value
     * Also adds to history navigation
     *
     * @param url
     */
    UMGGR_Deeplink_Module.updateNavigation = function(url, parentWindow) {

        //allow parent window URL to be changed
        var win = window;
        if(typeof parentWindow !== 'undefined' && parentWindow) {
            win = window.parent;
        }
        if(history.pushState) {

            win.history.pushState(null, null, url);
        }
        else {
            win.location.hash = url;
        }

    };

    /**
     * Open FancyBox modal for given URL (iframe)
     *
     * @param url
     */
    UMGGR_Deeplink_Module.openModal = function(anchor, type='') {
        var url = $(anchor).attr('href');
        var inCustomizer = false;
        
        if(type==='news') {
            url = $(anchor).data('link');
        }
        var modalUrl = url + '?modal=1';

        //Check to see if the modal is being opened inside the grand royal wizard
        if(window.location.href.includes("customize_messenger_channel")){
            inCustomizer = true;            
        }

        $.fancybox.open({
            type:'iframe',
            src: modalUrl,
            baseClass:'fancy-news',
            preload:true,
            margin: [0, 0, 0, 0],
            opts: {
                beforeShow: function( instance, current ) {
                    if(!inCustomizer){
                        UMGGR_Deeplink_Module.updateNavigation(url, UMGGR_Deeplink_Module.inIframe());
                    }
                },
                afterClose: function () {
                    if(!inCustomizer){
                        var parentAnchor = $(anchor).parents('[data-deeplink]');

                        if(parentAnchor.length) {

                            var urlPrefix = UMGGR_Deeplink_Module.urlType === '#' ? '/#' : '/';
                            var urlPostfix = UMGGR_Deeplink_Module.urlType === '#' ? '' : '/';

                            UMGGR_Deeplink_Module.updateNavigation(urlPrefix + parentAnchor.attr('data-deeplink') + urlPostfix, UMGGR_Deeplink_Module.inIframe());
                        } else {
                            UMGGR_Deeplink_Module.updateNavigation('/', UMGGR_Deeplink_Module.inIframe());
                        }
                    }

                }
            }
        });
    }

    /**
     * Determine if current window is inside an iFrame
     *
     * @returns {boolean}
     */
    UMGGR_Deeplink_Module.inIframe = function() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }
})(jQuery);
