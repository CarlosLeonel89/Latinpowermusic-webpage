(function ($) {
    "use strict";

    $(document).ready(function ()
    {
        if ($('.-paginated').length) {
            let initialNumber = $('.-paginated').attr('data-load-more-initial')
            let perPageNumber = $('.-paginated').attr('data-load-more-per-page')

            const totalNumber = $('.-paginated .c-paginated-item').length;

            if (initialNumber) {
                $('.-paginated .c-paginated-item:not(:lt(' + initialNumber + '))').hide()
                $('.-paginated').addClass('-loaded')
            }

            $('.more-link a').click(function (e) {
                e.preventDefault()

                let countShown = 0

                $('.-paginated .c-paginated-item').each(function () {
                    if (!$(this).is(':visible')) {
                        $(this).slideDown()
                        countShown++
                    }

                    if (countShown >= perPageNumber) {
                        return false
                    }
                })

                if ($('.-paginated .c-paginated-item').not(':visible').length === 0) {
                    $(this).hide()
                }

                return false
            })
        }
    })
})(jQuery)
