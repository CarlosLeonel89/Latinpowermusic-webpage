(function ( $ ) {
    'use strict';

    //Instantiate PUSH_AUTOCOLOR object if not already instantiated
    if (typeof window.PUSH_AUTOCOLOR == 'undefined') {
        window.PUSH_AUTOCOLOR = {};
    }

    PUSH_AUTOCOLOR.init = function () {
        if (typeof PUSH_AUTOCOLOR.elementSelectors !== 'undefined') {
            for (let i in PUSH_AUTOCOLOR.elementSelectors) {
                let elementSelector = PUSH_AUTOCOLOR.elementSelectors[i]
                let elements = $(elementSelector)

                if (elements.length) {
                    PUSH_AUTOCOLOR.setAutoColor(elements)
                } else {
                    PUSH_AUTOCOLOR.onDomInsertListener(elementSelector, function () {
                        elements = $(elementSelector)
                        PUSH_AUTOCOLOR.setAutoColor(elements)
                    })
                }
            }
        }
    }

    PUSH_AUTOCOLOR.observers = []

    PUSH_AUTOCOLOR.onDomInsertListener = function (elementSelector, _callback) {
        const cleanSelector = elementSelector.replace(/#|\./g, "")

        const mutationCallback = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    for (let addedNode of mutation.addedNodes) {
                        if (addedNode.id === cleanSelector || addedNode.className === cleanSelector) {
                            if (typeof PUSH_AUTOCOLOR.observers[elementSelector] !== 'undefined') {
                                PUSH_AUTOCOLOR.observers[elementSelector].disconnect()
                            }
                            _callback()
                        }
                    }
                }
            }
        }

        PUSH_AUTOCOLOR.observers[elementSelector] = new MutationObserver(mutationCallback)

        const targetNode = document.querySelector('body')

        PUSH_AUTOCOLOR.observers[elementSelector].observe(targetNode, {
            attributes: true,
            childList: true,
            subtree: true,
        })
    }

    PUSH_AUTOCOLOR.changeObservers = []

    PUSH_AUTOCOLOR.onDomChangeListener = function (targetNode, _callback) {
        const cleanSelector = targetNode.id.replace(/#|\./g, "")

        const mutationCallback = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                if (typeof PUSH_AUTOCOLOR.changeObservers[cleanSelector] !== 'undefined') {
                    PUSH_AUTOCOLOR.changeObservers[cleanSelector].disconnect()
                }
                _callback()
            }
        }

        PUSH_AUTOCOLOR.changeObservers[cleanSelector] = new MutationObserver(mutationCallback)

        PUSH_AUTOCOLOR.changeObservers[cleanSelector].observe(targetNode, {
            attributes: true,
            childList: true,
            subtree: true,
        })
    }

    PUSH_AUTOCOLOR.setAutoColor = function (element) {
        if (typeof element !== "undefined" && element.length) {
            //if there are multiple elements then run this function recursively
            if (element.length > 1) {
                jQuery(element).each(function () {
                    PUSH_AUTOCOLOR.setAutoColor(jQuery(this));
                });
            } else {
                //work out the current element brightness

                var foregroundBrightness = PUSH_AUTOCOLOR.getBrightnessLevel(element, 'color');
                var backgroundBrightness = PUSH_AUTOCOLOR.getBrightnessLevel(element, 'background-color');

                var isBackgroundBright = backgroundBrightness > 120;
                var isForegroundBright = foregroundBrightness > 120;

                //set link color to white or black to match background brightness
                let setColor = null
                if (isBackgroundBright && isForegroundBright) {
                    setColor = 'black'
                } else if (!isBackgroundBright && !isForegroundBright) {
                    setColor = 'white'
                }

                if (setColor) {
                    PUSH_AUTOCOLOR.setCssProperty(element, 'color', setColor)

                    let htmlElement = element.get(0)
                    PUSH_AUTOCOLOR.onDomChangeListener(htmlElement, function () {
                        PUSH_AUTOCOLOR.setAutoColor(element)
                    })
                }
            }
        }
    }

    /**
     * Get brightness level of a given element font or background color
     *
     * 0 = lowest level (i.e. black), 255 = highest level (i.e. white)
     *
     * @param element
     * @param property (color or background-color)
     * @returns {number}
     */
    PUSH_AUTOCOLOR.getBrightnessLevel = function (element, property) {

        //if element contains background image then return false
        var elementBackgroundImg = jQuery(element).css('background-image');
        if (typeof elementBackgroundImg !== 'undefined' && elementBackgroundImg.length && elementBackgroundImg !== "none") {
            return false;
        }

        var elementColor = jQuery(element).css(property);
        if (typeof elementColor !== 'undefined') {
            //get array of rgb/a values
            var colors = PUSH_AUTOCOLOR.getRgbValues(elementColor);

            if (colors) {
                //check if opacity is defined - zero opacity means background is transparent
                if (typeof colors.opacity !== 'undefined') {
                    var opacity = parseFloat(colors.opacity);
                    if (opacity === 0) {
                        /**
                         * Check if we are checking background color, if that is the case then get background
                         * brightness of parent instead. Do not try and get parent of <HTML>
                         */
                        if (property === 'background-color' && jQuery(element).prop('tagName') !== "HTML") {
                            var parent = jQuery(element).parent();
                            if (parent && parent.length) {
                                return PUSH_AUTOCOLOR.getBrightnessLevel(parent, property)
                            }
                        }
                        //opacity is zero so return highest brightness level
                        return 255;
                    }
                }

                //contrast calculation based on W3C https://www.w3.org/TR/AERT/#color-contrast
                var brightness = Math.round(((parseInt(colors.red) * 299) +
                    (parseInt(colors.green) * 587) +
                    (parseInt(colors.blue) * 114)) / 1000);

                return brightness;
            }
        }

        return false;
    }

    PUSH_AUTOCOLOR.setCssProperty = function (element, propertyName, value) {
        let searchPattern = new RegExp(propertyName + ":(.*?);", "ig")
        let replaceWith = propertyName + ": " + value + " !important;";

        let currentStyle = $(element).attr("style")
        if (currentStyle.search(searchPattern) !== -1) {
            $(element).attr("style", currentStyle.replace(searchPattern, replaceWith))
        } else {
            if (!currentStyle.endsWith(';')) {
                currentStyle = currentStyle + ';';
            }
            $(element).attr("style", currentStyle + ' ' + replaceWith)
        }
    }

    PUSH_AUTOCOLOR.getRgbValues = function (color) {

        var match = color.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.?\d?))\))?/);

        return match ? {
            red: match[1],
            green: match[2],
            blue: match[3],
            opacity: match[4]
        } : false;
    }

    $(document).ready(function () {
        PUSH_AUTOCOLOR.init();
    });

})(jQuery);
