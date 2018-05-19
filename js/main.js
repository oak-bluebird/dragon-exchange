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
function exist(el){
    if ( $(el).length > 0 ) {
        return true;
    } else {
        return false;
    }
}


jQuery(document).ready(function($) {

    $(".header").headroom();
    
    /*---------------------------
                                  ADD CLASS ON SCROLL
    ---------------------------*/
    $(function() { 
        var $document = $(document),
            $element = $('.toggle-menu'),
            $element2 = $('header'),
            className = 'hasScrolled';

        $document.scroll(function() {
            $element.toggleClass(className, $document.scrollTop() >= 1);
            $element2.toggleClass(className, $document.scrollTop() >= 1);
        });
    });


    /*---------------------------
                                  File input logic
    ---------------------------*/
    $('input[type=file]').each(function(index, el) {
        $(this).on('change', function(event) {
            event.preventDefault();
            var placeholder = $(this).siblings('.placeholder');
        
            if ( this.files.length > 0 ) {
                if ( this.files[0].size < 5000000 ) {
                    var filename = $(this).val().split('/').pop().split('\\').pop();
                    if ( filename == '' ) {
                        filename = placeholder.attr('data-label');
                    }
                    placeholder.text(filename);
                } else {
                    alert('Maximum file size is 5Mb');
                }    
            } else {
                placeholder.text( placeholder.attr('data-label') );
            }
            
        });
    });
    
    /*---------------------------
                                PAGE ANCHORS
    ---------------------------*/
    $('.page-menu a, .anchor').click(function() {
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top - 50
        }, 800);
        return false;
    });

    /*---------------------------
                                  MENU TOGGLE
    ---------------------------*/
    $('.js-toggle-menu').on('click', function(event) {
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
    function openPopup(popup){
        $.fancybox.open([
            {
                src  : popup,
                type: 'inline',
                opts : {}
            }
        ], {
            loop : false
        });
    }



    /*---------------------------
                                  Form submit
    ---------------------------*/
    $('.ajax-form').on('submit', function(event) {
        event.preventDefault();
        var data = new FormData(this);
        $(this).find('button').prop('disabled', true);
        $.ajax({
            url: theme.url + '/forms.php',
            type: 'POST',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            success: function(result) {
                if (result.status == 'ok') {
                    openPopup('#modal-popup-ok')
                } else {
                    openPopup('#modal-popup-error')
                }
            },
            error: function(result) {
                openPopup('#modal-popup-error');
            }
        }).always(function() {
            $('form').each(function(index, el) {
                $(this)[0].reset();
                $(this).find('button').prop('disabled', false);
            });
        });
    });



    /*---------------------------
                                  Google map init
    ---------------------------*/
    var map;
    function googleMap_initialize() {
        var lat = $('#map_canvas').data('lat');
        var long = $('#map_canvas').data('lng');

        var mapCenterCoord = new google.maps.LatLng(lat, long);
        var mapMarkerCoord = new google.maps.LatLng(lat, long);

        var styles = [];

        var mapOptions = {
            center: mapCenterCoord,
            zoom: 16,
            //draggable: false,
            disableDefaultUI: true,
            scrollwheel: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

        var styledMapType=new google.maps.StyledMapType(styles,{name:'Styled'});
        map.mapTypes.set('Styled',styledMapType);
        map.setMapTypeId('Styled');

        var markerImage = new google.maps.MarkerImage('images/location.png');
        var marker = new google.maps.Marker({
            icon: markerImage,
            position: mapMarkerCoord, 
            map: map,
            title:"Site Title"
        });
        
        $(window).resize(function (){
            map.setCenter(mapCenterCoord);
        });
    }

    if ( exist( '#map_canvas' ) ) {
        googleMap_initialize();
    }


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