(function ($) {
    "use strict"

    window.AEWPFrontEnd = {
        forms: [],
        validCountry: false,

        init: function () {
            var _this = this

            $('.ae-cform-modal-container, .ae-cform-container:not(.-has-modal)').each(function (i, form) {

                var formID = $(form).attr('data-ae-cform-id')
                const hash = $(form).attr('data-hash-selector')
                if (typeof _this.forms[formID] === 'undefined') {
                    _this.forms[formID] = []
                }
                if (typeof _this.forms[formID]['hashSelectors'] === 'undefined') {
                    _this.forms[formID]['hashSelectors'] = {}
                }
                _this.forms[formID]['hashSelectors'][hash] = []
                var relatedFields = $(form)
                    .find('input[type="checkbox"][data-ae-optin-id][data-ae-optin-related-field]');
                if (relatedFields.length) {
                    $(relatedFields).each(function (index) {
                        var customFormId = $(this).data('ae-cform-id');
                        var relatedField = $(this).data('ae-optin-related-field');
                        if (relatedField === 'mobilephone' && _this.forms[formID]['hashSelectors'][hash].telInput === undefined) {
                            var dynamicField = $(form).find(
                                '#ae-cform-reg-item-' + relatedField + '-' + customFormId
                            )

                            _this.forms[formID]['hashSelectors'][hash].telInput = dynamicField.find('input');
                            if (_this.forms[formID]['hashSelectors'][hash].telInput.length > 0) {
                                _this.forms[formID]['hashSelectors'][hash].iti = window.intlTelInput(_this.forms[formID]['hashSelectors'][hash].telInput[0], {
                                    separateDialCode: true,
                                    autoPlaceholder: "off",
                                    initialCountry: _this.setDefaultCountryCode()
                                });
                                /* TODO: Upgrade the intlTelInput lib and remove this override */
                                _this.forms[formID]['hashSelectors'][hash].telInput.addClass('mobilephone-input-initial')
                            }

                            // Disable receive SMS if user country not selected
                            if (
                                (!window.AEJSWP
                                || !window.AEJSWP['customForms'][formID].smsOptinCountries
                                || !window.AEJSWP['customForms'][formID].smsOptinCountries
                                    .includes('all'))
                                && typeof relatedField !== 'undefined'
                            ) {
                                var dynamic_field_visible = $(dynamicField)
                                    .data('dynamic-field-visibility') === 'visible'
                                if (dynamic_field_visible) {
                                    _this.toggleSmsOptin(false, form)
                                }
                            }
                            _this.addEventListeners(form)
                        }
                    });
                }
                $(form).find('input[type="checkbox"][data-ae-optin-id][data-email]:checked')
                    .change(function() {
                        _this.setEmailRequired(form)
                    })
                _this.setEmailRequired(form)
            })

        },
        // function to set the default country code e.g. gb = +44
        setDefaultCountryCode: function() {
            if (typeof gr_global_vars !== 'undefined') {
                switch (gr_global_vars['siteTerritory']) {
                    case 'uk':
                        return 'gb';
                    case 'au':
                        return 'au';
                    default:
                        return '';
                }
            } else {
                return '';
            }
        },

        // Since the input field is hidden when form is not opened
        // the padding is not correctly added
        addPaddingTelInput: function (formID, hash) {
            var paddingLeft = this.forms[formID]['hashSelectors'][hash].iti.selectedFlag.offsetWidth + 6
            this.forms[formID]['hashSelectors'][hash].iti.a.style.paddingLeft = paddingLeft + 'px'
        },

        addEventListeners: function (form) {
            var _this = this
            // var form = $(`div.${hash}[data-ae-cform-id="${formID}"]`)
            const formID = $(form).data('ae-cform-id');
            const hash = $(form).data('hash-selector');
            if (this.forms[formID]['hashSelectors'][hash].iti) {
                $(form).find('a[data-ae-cform-social-button-service-id="email"]')
                    .click(function () {
                        _this.addPaddingTelInput(formID, hash)
                    })

                $(form).on('ae-modal-open', function () {
                    _this.addPaddingTelInput(formID, hash)
                })
            }

            $(this.forms[formID]['hashSelectors'][hash].telInput).on('input change', function () {
                _this.validateInput(this, form)
            })

            /* TODO: Upgrade the intlTelInput lib and remove this override */
            $(this.forms[formID]['hashSelectors'][hash].telInput).on('change', function () {
                _this.forms[formID]['hashSelectors'][hash].telInput.removeClass('mobilephone-input-initial')                
            })
            $(this.forms[formID]['hashSelectors'][hash].telInput).on('focus', function () {
                _this.forms[formID]['hashSelectors'][hash].telInput.removeClass('mobilephone-input-initial')
                var width = _this.forms[formID]['hashSelectors'][hash].telInput.closest('.iti--separate-dial-code').find('.iti__flag-container').width();
                if (width > 0) {
                    width += 10;
                    _this.forms[formID]['hashSelectors'][hash].telInput.css('padding-left', width + 'px');
                }
            })

            $(form).find('.ae-cform-input-country').on('change', function () {
                _this.changeNumberCountry(this, formID, hash)
                _this.validateCountry(this, form)
                _this.validateInput(this, form)
            })

            $(form).find('input[type="checkbox"][data-ae-optin-id][data-sms]').on('change', function () {
                _this.validateInput(this, form)
            })

            if (this.forms[formID]['hashSelectors'][hash].telInput && this.forms[formID]['hashSelectors'][hash].telInput.length > 0) {
                this.forms[formID]['hashSelectors'][hash].telInput[0].addEventListener("close:countrydropdown", function () {
                    _this.forms[formID]['hashSelectors'][hash].numberCountryChanged = true
                    _this.validateCountry($(form).find('.ae-cform-input-country'), form);
                    _this.validateInput(this, form);
                });
            }
        },

        // Validate the telephone number entered and show any errors
        validateInput: function (el, form) {
            const formID = $(form).data('ae-cform-id');
            const hash = $(form).data('hash-selector');
            var _this = this;

            // lets also check the validity of the area code chosen
            var tmpCountryData = this.forms[formID]['hashSelectors'][hash].iti.getSelectedCountryData();
            var setSelectedCountryCode = tmpCountryData.iso2.toUpperCase();
            var checkAreaCodeCountryValid = this.isAreaCodeCountrySupported(setSelectedCountryCode, form);

            var $labelElement = $(el)
                .parents('.iti')
                .parent()

            var $parsleyErrorList = $labelElement
                .find('.parsley-errors-list-custom')

            var smsCheckboxStatus = false;

            // check if we are setting the country/SMS error or not
            $(form).find('input[type="checkbox"][data-ae-optin-id][data-sms]').each(function() {

                // check status of the sms checkbox if active continue
                var smsStatus = $(this).prop('checked');
                smsCheckboxStatus = smsStatus;

                if (true === smsStatus) {
                    const parentDiv = this.closest('div');

                    // Check if an error div already exists
                    const existingErrorDiv = parentDiv.querySelector('.error-div');

                    if (
                        existingErrorDiv
                        &&  _this.validCountry
                        && checkAreaCodeCountryValid
                    ) {
                        // If an error div exists, remove it
                        parentDiv.removeChild(existingErrorDiv);
                    } else if(
                        (
                            !_this.validCountry
                            || !checkAreaCodeCountryValid
                        )
                        && null === existingErrorDiv
                    ) {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'error-div ae-cform-item';
                        errorDiv.innerHTML = '<ul class="parsley-errors-list"><li>SMS updates are available within valid countries only</li></ul>';

                        // Append the error div inside the parent div
                        parentDiv.appendChild(errorDiv);

                        // ensure the sms toggle is off
                        _this.toggleSmsOptin(false, form, true);
                    }
                }
            });

            if (
                $(el).val().length === 0
                && (
                    !_this.validCountry
                    || !checkAreaCodeCountryValid
                )
            ) {
                this.toggleSmsOptin(false, form)
                return
            } else if (
                this.isCountrySupported(el, form)
                && _this.validCountry
                && checkAreaCodeCountryValid
            ) {
                this.toggleSmsOptin(true, form, false)
            }

            if (
                (
                    this.forms[formID]['hashSelectors'][hash].iti.getValidationError()
                    !== intlTelInputUtils.validationError.IS_POSSIBLE
                    && true === smsCheckboxStatus
                )
            ) {
                var parsleyId = $(el).data('parsley-id')
                var errorMsg = $(el).data('error-msg')

                if ($parsleyErrorList.length) {
                    $($parsleyErrorList)
                        .empty()
                        .append(`<li class="parsley-error parsley-custom-error-message">${errorMsg}.</li>`)
                } else {
                    $labelElement
                        .append(`<ul class="parsley-errors-list parsley-errors-list-custom filled" id="parsley-id-${parsleyId}"><li class="parsley-error parsley-custom-error-message">${errorMsg}.</li></ul>`)
                }
            } else {
                // the parsely error list is associated within the mobilephone field
                // however if we are getting validated by other field triggers e.g. country
                // this won't get picked up. So if the length is zero try to find using the field class
                if ($parsleyErrorList.length) {
                    $parsleyErrorList.remove()
                } else if (jQuery('.ae-cform-item-mobilephone').find('.parsley-errors-list').length) {
                    jQuery('.ae-cform-item-mobilephone').find('.parsley-errors-list').remove();
                }
            }
        },
        setEmailRequired: function(form) {
            const formID = $(form).data('cform-id');
            if ($(form).find('input[type="checkbox"][data-ae-optin-id][data-email]:checked')
                    .length > 0
            ) {
                $(form).find(`#ae-cform-input-reg-email-${formID}`).attr('required', true)
                $(form).find(`#ae-cform-input-reg-email-${formID}`).parents('.ae-cform-item')
                    .find('label .cform-required-field').removeClass('hidden')
                    .find('span:first')
                    .removeClass('hidden')
            } else {
                $(form).find(`#ae-cform-input-reg-email-${formID}`)
                    .attr('required', false)
                $(form).find(`#ae-cform-input-reg-email-1${formID}`)
                    .parents('.ae-cform-item')
                    .find('label .cform-required-field').addClass('hidden')
                    .find('span:first')
                    .addClass('hidden')
            }
        },
        // Enable/disable the receive sms optin and set required or not required for the mobile field
        toggleSmsOptin: function(enable, form, forceRequired = true) {
            var _this = this
            const formID = $(form).data('ae-cform-id');
            const hash = $(form).data('hash-selector');
            $(form).find('input[type="checkbox"][data-ae-optin-id][data-sms]').each(function() {
                var smsOptin = $(this);
                if (enable) {
                    $(smsOptin).attr('disabled', false)
                    $(smsOptin).parent().find('span.ae-cform-optin-label').css('opacity', 1)

                    if (forceRequired) {
                        var inputRequired = $(smsOptin).is(':enabled')
                            && $(smsOptin).is(':checked')
                        $(_this.forms[formID]['hashSelectors'][hash].telInput)
                            .attr('required', inputRequired)
                        if (inputRequired) {
                            $(_this.forms[formID]['hashSelectors'][hash].telInput)
                                .parents('.ae-cform-item')
                                .find('label .cform-required-field').removeClass('hidden')
                                .find('span:first')
                                .removeClass('hidden')
                        }
                    }
                } else {
                    $(smsOptin).attr('disabled', true)
                    $(smsOptin).prop('checked', false)
                    $(smsOptin).parent().find('span.ae-cform-optin-label').css('opacity', 0.6)
                    if (forceRequired) {
                        $(_this.forms[formID]['hashSelectors'][hash].telInput)
                            .attr('required', false)
                        $(_this.forms[formID]['hashSelectors'][hash].telInput)
                            .parents('.ae-cform-item')
                            .find('label .cform-required-field').addClass('hidden')
                            .find('span:first')
                            .addClass('hidden')
                    }
                }
            });
        },

        // Check whether the user selected country is in the supported country list form eCRM
        isCountrySupported: function (elem, form) {
            const formID = $(form).data('ae-cform-id');
            var $selectedCountry = $(elem).val()
            if (
                ($selectedCountry === 'UM'
                    && window.AEJSWP.customForms[formID].smsOptinCountries.includes('US'))
                || ($selectedCountry === 'US'
                    && window.AEJSWP.customForms[formID].smsOptinCountries.includes('UM'))
            )
                return true
            return !(!window.AEJSWP || !window.AEJSWP.customForms[formID].smsOptinCountries
                || (!window.AEJSWP.customForms[formID].smsOptinCountries.includes($selectedCountry)
                    && !window.AEJSWP.customForms[formID].smsOptinCountries.includes('all')));

        },

        // Check whether the user selected area code country is in the supported country list form eCRM
        isAreaCodeCountrySupported: function (areaCodeCountry = '', form) {
            const formID = $(form).data('ae-cform-id');
            if (
                (areaCodeCountry === 'UM'
                    && window.AEJSWP.customForms[formID].smsOptinCountries.includes('US'))
                || (areaCodeCountry === 'US'
                    && window.AEJSWP.customForms[formID].smsOptinCountries.includes('UM'))
            )
                return true
            return !(!window.AEJSWP || !window.AEJSWP.customForms[formID].smsOptinCountries
                || (!window.AEJSWP.customForms[formID].smsOptinCountries.includes(areaCodeCountry)
                    && !window.AEJSWP.customForms[formID].smsOptinCountries.includes('all')));

        },

        // If mobile country code doesn’t match the visitor selected country value then disable
        // the SMS Opt-in. Exception: if US code then`US Minor Outlying Islands` is also allowed.
        validateCountry: function (elem, form) {
            const formID = $(form).data('ae-cform-id');
            const hash = $(form).data('hash-selector');
            var _this = this;

            if (this.isCountrySupported(elem, form)) {
                var $selectedCountry = $(elem)
                    .val()
                    .toLowerCase()
                if ($selectedCountry === 'um' && this.forms[formID]['hashSelectors'][hash].iti.getSelectedCountryData().iso2 === 'us') {
                    this.toggleSmsOptin(true, form)
                } else if ($(elem)
                    .val()
                    .toLowerCase() === this.forms[formID]['hashSelectors'][hash].iti.getSelectedCountryData().iso2) {
                    this.toggleSmsOptin(true, form)
                } else {
                    this.toggleSmsOptin(false, form)
                }
                _this.validCountry = true;
            } else {
                this.toggleSmsOptin(false, form)
                _this.validCountry = false;
                // re-validate the phone input
                _this.validateInput(this.forms[formID]['hashSelectors'][hash].telInput, form);
            }
        },

        // Sync telephone country code when country is changed if previously not touched by user
        changeNumberCountry: function (elem, formID, hash) {
            if (typeof elem !== 'undefined' && $(elem).val() !== ''
                && this.forms[formID]['hashSelectors'][hash].numberCountryChanged !== true) {
                this.forms[formID]['hashSelectors'][hash].iti.setCountry($(elem).val())
            }
        },
    }

    $(document).ready(function () {
        AEWPFrontEnd.init()
    })
})(jQuery)
