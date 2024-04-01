//Show ECRM functions
function grShowEcrm() {
    var show = false;
    if (typeof (sessionStorage) !== 'undefined') {
        show = sessionStorage.getItem('umggr-newsletter-first-load');
    }
    return show;
}
function checkEcrmComplete(){
    var mailingListComplete = false;
    if (typeof (localStorage) !== 'undefined') {
        checkForMailingList = AEJSWP.getLocalStorageItem('aeswp_cform_mailing_lists_completed', true);        
        if (Array.isArray(checkForMailingList) && checkForMailingList.length > 0){
            mailingListComplete = true;
        }
    }
    return mailingListComplete;
}
function openModalEcrm(){
    if (
      gr_global_vars.mailListEnabled === 'on'
      && gr_global_vars.showEcrmFirstLoad === 'true'
      && (!grShowEcrm() || grShowEcrm()===null)
      && (!checkEcrmComplete() || checkEcrmComplete()===null)
    ) {
        (function ($) {
            $(document).ready(function(){
                setTimeout(function(){
                    $('#ae-cform-modal-display-cta-1').trigger('click');
                    $('.umggr-open-newsletter').trigger('click');
                    if (typeof (sessionStorage) !== 'undefined') {
                        sessionStorage.setItem(
                          'umggr-newsletter-first-load',
                          true
                        );
                    }
                }, parseInt(gr_global_vars.showEcrmFirstLoadTimer * 1000));
            });
        })(jQuery);
    }
}

function gr_ae_wpaejsready(){
    openModalEcrm();
}

if (typeof(AEJSWP) !== 'undefined') {
    AEJSWP.add_aejsready_handler("gr_ae_wpaejsready");
}
//End Show ECRM

(function ($) {
    $(document).ready(function(){
        jQuery('noscript').prependTo(document.body);
    });
})(jQuery)