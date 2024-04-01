(function($) {
    UMGGRNewsletterSuccessNotification = UMGGRNewsletterSuccessNotification || []
    UMGGRNewsletterSuccessNotification.addNotificationSuccess = function() {
        if (UMGGRNewsletterSuccessNotification.newsletterSuccessNotificationEnabled === 'on') {
            $('body').append('<div class="umggr-success-notification-container"><div class="umggr-success-notification-popup" role="dialog"><div class="umggr-success-notification-header"><div class="umggr-success-notification-icon umggr-success-notification-success umggr-success-notification-icon-show"><div class="umggr-success-notification-success-circular-line-left"></div><span class="umggr-success-notification-success-line-tip"></span><span class="umggr-success-notification-success-line-long"></span><div class="umggr-success-notification-success-ring"></div><div class="umggr-success-notification-success-fix"></div><div class="umggr-success-notification-success-circular-line-right"></div></div><img class="umggr-success-notification-image"><h2 class="umggr-success-notification-title" id="umggr-success-notification-title">Success! Please check your email to confirm your subscription.</h2><button type="button" class="umggr-success-notification-close umggr-success-notification-styled" aria-label="Close this dialog">×</button></div><div class="umggr-success-notification-actions"><button type="button" class="umggr-success-notification-confirm umggr-success-notification-styled">OK</button></div></div></div>')
            $('.umggr-success-notification-popup').show()
            $('.umggr-success-notification-close, .umggr-success-notification-confirm').click(function() {
                $('.umggr-success-notification-container').remove()
            })
        }
    }

    if (typeof AEJSWP !== 'undefined') {
        AEJSWP.addMailingListFormCompleteCallback('UMGGRNewsletterSuccessNotification.addNotificationSuccess')
    }
})(jQuery)