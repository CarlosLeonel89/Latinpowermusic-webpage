(function ($) {
    "use strict"
    $(document).ready(function () {
        $('.social-links li.community .community-container,' +
            '.social-menu li.community .community-container,' +
            '.umggr-fixed-social-menu li.community .community-container,' +
            '.umggr-nav-mobile li.community .community-container,' +
            '.menu-social-container li.community .community-container')
            .click(function () {
                $(this)
                    .parents('li.community')
                    .find('.community-members-phone-number')
                    .toggle()
            })
        
        //Evidon cookie option button in footer 
        if($('.umggr-evidon-cookie-choices-footer').length){
            $('.umggr-evidon-cookie-choices-footer').on('click', function() {
                window.evidon.notice.showOptions();
            })
        }

        //newsletter button click
        if($('.newsletter-button').length) {
            $('.newsletter-button').on('click', function(e) {
                e.preventDefault();
                //attempt to get the hash based on the form id
                var setHash = $(".ae-cform-modal-display-cta[data-ae-cform-id='" + UMGGR.newsletterCustomFormId + "']").filter(".ae-cform-modal-display-cta").data("hash-selector");
                AEJSWP.triggerCustomFormModal(UMGGR.newsletterCustomFormId, setHash)
            });
        }
    })
})(jQuery)



