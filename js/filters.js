/**
 * @author Ljupche Vasilev
 * @summary Advanced Filters
 */

let GRAdvancedFilters;

document.addEventListener("DOMContentLoaded", function () {

    const selectors = {
        form: '#umggr-filters',
        clearBtn: '.btn-clear',
    };

    const form = document.querySelector(selectors.form);
    const clearBtn = document.querySelector(selectors.clearBtn);

    GRAdvancedFilters = {

        init() {

            if (clearBtn) {
                clearBtn.addEventListener('click', this.clearForm);
            }
        },

        clearForm(e) {
            if (form !== null) {
                const musicSectionURL = jQuery(e.target).data('href')
                if (musicSectionURL !== window.location.href) {
                    window.location.href = musicSectionURL
                } else {
                    jQuery(form).find('input:not([type="button"]):not([type="submit"])').val('');
                    jQuery(form).find('select').val('default');
                }
            }
        },
    }

    GRAdvancedFilters.init();
});
