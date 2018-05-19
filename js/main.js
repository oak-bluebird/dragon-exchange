// Global parameters
window.params = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent)
};


/**
 *
 * Check if element exist on page
 *
 * @param el {string} jQuery object (#popup)
 *
 * @return {bool}
 *
 */
function exist(el) {
    if ($(el).length > 0) {
        return true;
    } else {
        return false;
    }
}


jQuery(document).ready(function ($) {

    wow = new WOW({
        boxClass: 'wow', // default
        animateClass: 'animated', // default
        offset: 200, // default
        mobile: false, // default
        live: true // default
    })
    wow.init();

    /*---------------------------
                                  ADD CLASS ON SCROLL
    ---------------------------*/
    $(function () {
        var $document = $(document),
            $element = $('.toggle-menu'),
            $element2 = $('header'),
            className = 'hasScrolled';

        $document.scroll(function () {
            $element.toggleClass(className, $document.scrollTop() >= 1);
            $element2.toggleClass(className, $document.scrollTop() >= 1);
        });
    });


    /*---------------------------
                                  File input logic
    ---------------------------*/
    $('input[type=file]').each(function (index, el) {
        $(this).on('change', function (event) {
            event.preventDefault();
            var placeholder = $(this).siblings('.placeholder');

            if (this.files.length > 0) {
                if (this.files[0].size < 5000000) {
                    var filename = $(this).val().split('/').pop().split('\\').pop();
                    if (filename == '') {
                        filename = placeholder.attr('data-label');
                    }
                    placeholder.text(filename);
                } else {
                    alert('Maximum file size is 5Mb');
                }
            } else {
                placeholder.text(placeholder.attr('data-label'));
            }

        });
    });

    /*---------------------------
                                PAGE ANCHORS
    ---------------------------*/
    $('.page-menu a, .anchor').click(function () {
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top - 50
        }, 800);
        return false;
    });

    /*---------------------------
                                  MENU TOGGLE
    ---------------------------*/
    $('.js-toggle-menu').on('click', function (event) {
        event.preventDefault();
        $(this).toggleClass('is-active');
        $(this).siblings('header').toggleClass('open');
    });



    /*---------------------------
                                  Fancybox
    ---------------------------*/
    $('.fancybox').fancybox({

    });


    /**
     *
     * Open popup
     *
     * @param popup {String} jQuery object (#popup)
     *
     * @return n/a
     *
     */
    function openPopup(popup) {
        $.fancybox.open([{
            src: popup,
            type: 'inline',
            opts: {}
        }], {
            loop: false
        });
    }



    /*---------------------------
                                  Form submit
    ---------------------------*/
    $('.js-mailchimp-form').each(function(index, el) {
        var form = $(this);

        form.ajaxChimp({
            url: 'https://online.us17.list-manage.com/subscribe/post?u=b208efabffc40996334e17c12&id=f6454771d8',
            callback: function(result){
                if ( result.result == 'error' ) {
                    var message = result.msg.replace('0 - ', "");
                    var $alert = '<div class="alert alert-danger" style="display: none;">'+message+'</div>';
                    form.find('.alerts').html($alert);
                    form.find('.alerts .alert').slideDown();
                } else {
                    var message = result.msg.replace('0 - ', "");
                    var $alert = '<div class="alert alert-success" style="display: none;">'+message+'</div>';
                    form.find('.alerts').html($alert);
                    form.find('.alerts .alert').slideDown();
                    form[0].reset();
                }
            }
        });
    });




    function update_widgets ( data ) {
        //console.log( data );

        var fallClass = 'falling';
        var riseClass = 'rising';

        $.each( data.RAW, function(index, val) {
            
            var widget = $('#' + index + 'DRG');

            var changePt = widget.find('.change-pt .value');
            var price = widget.find('.price');

            changePt.text( data.DISPLAY[index].DRG.CHANGEPCT24HOUR + '%' );

            if ( data.DISPLAY[index].DRG.CHANGEPCT24HOUR > 0 ) {
                changePt.addClass( riseClass );
                changePt.removeClass( fallClass );
            } else if ( data.DISPLAY[index].DRG.CHANGEPCT24HOUR < 0 ) {
                changePt.addClass( fallClass );
                changePt.removeClass( riseClass );
            } else {
                changePt.removeClass( fallClass );
                changePt.removeClass( riseClass );
            }

            

            var oldPrice = price.attr('data-price');
            var newPrice = data.RAW[index].DRG.PRICE;

            price.attr('data-price', newPrice );
            price.text( Number(newPrice).toFixed(2) + ' DRG' );

            if ( oldPrice ) {
                if ( oldPrice > newPrice ) {
                    price.addClass(fallClass);
                    setTimeout(function () { 
                        price.removeClass(fallClass);
                    }, 1500);

                } else if ( oldPrice < newPrice ) {
                    price.addClass(riseClass);
                    setTimeout(function () { 
                        price.removeClass(riseClass);
                    }, 1500);
                }
            }

        });
    }


    function load_data() {

        var url = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH,BTC&tsyms=DRG';

        $.ajax({
            type: 'GET',
            url: url,
            data: null,
            cache: false,
            success: function (data, textStatus, jQxhr) {

                    update_widgets ( data );

            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(jqXhr);
            }
        })

    }

    load_data();
    setInterval(function(){
       load_data();
    }, 2000); 


}); // end file