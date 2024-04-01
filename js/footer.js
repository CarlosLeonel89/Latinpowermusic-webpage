(function ($) {
    "use strict";

    $(document).ready(function ()
    {

      if ($('.ae-cform-modal-display-cta').length > 0 && footer_vars.show_newsletter_icon === '1'){
          $('.ae-cform-modal-display-cta').html('<span class="fa fa-envelope" aria-hidden="true"></span>'+$('.ae-cform-modal-display-cta').html())
      }
      // show rollover newsletter signup button effect, but only if not already logged in.
      var loggedInState = localStorage.getItem('aeswp_cform_mailing_lists_completed')
      if (footer_vars.ae_alt_cta !== null && footer_vars.ae_alt_cta != "" && loggedInState !== '[1]') {
        var loggedInState = localStorage.getItem('aeswp_cform_mailing_lists_completed')
        var hiddenSpan = document.createElement("span")
        hiddenSpan.setAttribute('class', 'ae-hidden-span')
        if (footer_vars.showIcon === "true") {
            var hiddenIconSpan = document.createElement("span")
            hiddenIconSpan.setAttribute('class', 'fa fa-envelope')
            hiddenSpan.appendChild(hiddenIconSpan)
        }
        var hiddenNode = document.createTextNode(footer_vars.ae_cta)
        hiddenSpan.appendChild(hiddenNode)

        var anchor = document.createElement("a");
        anchor.setAttribute("class", "ae-cform-modal-display-cta");
        anchor.setAttribute("id", "ae-cform-alt-cta");
        var visibleSpan = document.createElement("span")
        visibleSpan.setAttribute('class', 'ae-visible-span')
        var node = document.createTextNode(footer_vars.ae_alt_cta);
        visibleSpan.appendChild(node);
        anchor.appendChild(visibleSpan);
        anchor.appendChild(hiddenSpan);

        var element = document.getElementsByClassName("ae-cform-container");

        Array.from(element).forEach(function (el, index) {
          if (index === element.length - 1) {
            $(el).prepend(anchor);
          }
        });
        $('.ae-cform-container').mouseover(function () {
            TweenMax.to($(this).parent().find('#ae-cform-modal-display-cta-1'), 0.1, {x:'0%', opacity:0.7});
            TweenMax.to($(this).parent().find('#ae-cform-alt-cta'), 0.2, {x:'-100%'});
        });
        $('.ae-cform-container').mouseout(function () {
            TweenMax.to($(this).parent().find('#ae-cform-modal-display-cta-1'), 0.2, {x:'100%', opacity:1});
            TweenMax.to($(this).parent().find('#ae-cform-alt-cta'), 0.2, {x:'0%'});
        });

      } else {
        $('#ae-cform-modal-display-cta-1').css({
           'position' : 'relative',
           'top' : '0',
           'left' : '0',
           'transform' : 'none'
        });
      }

  });
  // Since it is not possible to accurately calculated element widths at document.ready, we use window load instead.
  // We'll also fade in the Neswletter button after the calculation to prevent pop-in
  window.addEventListener('load', function () {
      $('.ae-cform-container').addClass('-is-visible');
  });
})(jQuery);// JavaScript Document

