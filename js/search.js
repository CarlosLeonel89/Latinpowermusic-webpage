/**
 * @author Rob Giles
 * @summary Site Search Panel
 */

let GRSearchPanel;

document.addEventListener("DOMContentLoaded", function () {

    const selectors = {
        searchPanel: '.-js-search-panel',
        searchPanelInline: '.-js-search-panel-inline',
        searchPanelButton: '.-js-search-open',
    };

    const searchPanel = document.querySelector(selectors.searchPanel);
    const searchPanelInline = document.querySelector(selectors.searchPanelInline);
    const searchToggle = document.querySelectorAll(selectors.searchPanelButton);

    GRSearchPanel = {

        init() {

            if (searchToggle.length) {
                for (let i = 0; i < searchToggle.length; i++) {
                    const button = searchToggle[i];

                    button.addEventListener('click', this.expandPanel);
                }
            }
        },

        expandPanel() {
            if (searchPanelInline !== null) {
                searchPanelInline.classList.toggle('-is-maximised');
            }
            searchPanel.classList.toggle('-is-expanded');
            event.preventDefault();
        },
    }

    GRSearchPanel.init();
});
