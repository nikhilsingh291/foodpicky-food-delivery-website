(function($) {
    "use strict";
    var $window = $(window);
    var $body = $('body');
    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    $.fn.parallax = function(xpos, speedFactor, outerHeight) {
        var $this = $(this);
        var getHeight;
        var firstTop;
        var paddingTop = 0;
        $this.each(function() {
            firstTop = $this.offset().top;
        });
        if (outerHeight) {
            getHeight = function($jqo) {
                return $jqo.outerHeight(true);
            };
        } else {
            getHeight = function($jqo) {
                return $jqo.height();
            };
        }
        if (arguments.length < 1 || xpos === null) {
            xpos = "50%";
        }
        if (arguments.length < 2 || speedFactor === null) {
            speedFactor = 0.1;
        }
        if (arguments.length < 3 || outerHeight === null) {
            outerHeight = true;
        }
        function update() {
            var pos = $window.scrollTop();
            $this.each(function() {
                var $element = $(this);
                var top = $element.offset().top;
                var height = getHeight($element);
                if (top + height < pos || top > pos + $window.height()) {
                    return;
                }
                $this.css('backgroundPosition', xpos + " " + Math.round((firstTop - pos) * speedFactor) + "px");
            });
        }
        $window.on('scroll', update);
        $window.on('resize', update);
        update();
    };
    $.fn.equalizeHeights = function() {
        var max = Math.max.apply(this, $(this).map(function(i, e) {
            return $(e).height();
        }).get());
        if (max > 0)
            this.height(max);
        return max;
    };
    $.fn.equalizeWidths = function() {
        var max = Math.max.apply(this, $(this).map(function(i, e) {
            return $(e).width();
        }).get());
        if (max > 0)
            this.width(max);
        return max;
    };
    window.azh = $.extend({}, window.azh);
    azh.parse_query_string = function(a) {
        if (a == "")
            return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p = a[i].split('=');
            if (p.length != 2)
                continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    };
    $.QueryString = azh.parse_query_string(window.location.search.substr(1).split('&'));
    var customize = ('azh' in $.QueryString && $.QueryString['azh'] == 'customize');
    $window.on('az-frontend-init', function(event, data) {
        var $wrapper = data.wrapper;
        function column_padding_fix() {
            $('[data-full-width], [data-column-padding]').each(function() {
                var $this = $(this);
                var p = parseInt($this.data('column-padding'), 10);
                if (p > 15 || ($this.data('full-width') && $this.data('stretch-content'))) {
                    if ($this.find('> [class*="-row"] > [class*="-col-"]').length > 0) {
                        $this.find('> [class*="-row"]').css({
                            "margin-right": "0",
                            "margin-left": "0"
                        });
                        $this.find('> [class*="-row"] > [class*="-col-"]').css({
                            "width": "",
                            "padding-right": "",
                            "padding-left": ""
                        });
                        var current_top = $this.find('> [class*="-row"] > [class*="-col-"]:first-child').position().top;
                        $this.find('> [class*="-row"] > [class*="-col-"]:first-child').css('padding-left', '0');
                        $this.find('> [class*="-row"] > [class*="-col-"]:last-child').css('padding-right', '0');
                        var c = false;
                        var i = 0;
                        $this.find('> [class*="-row"] > [class*="-col-"]').each(function() {
                            var $this = $(this);
                            if (current_top < $this.position().top) {
                                if (c === false) {
                                    c = i;
                                }
                                $this.prev().css('padding-right', '0');
                                $this.css('padding-left', '0');
                                current_top = $this.position().top;
                            }
                            i++;
                        });
                        if (c === false) {
                            c = i;
                        }
                        var w = $this.width();
                        $this.find('> [class*="-row"] > [class*="-col-"]').each(function() {
                            var $this = $(this);
                            if ($this.css('padding-left') !== '0px' || $this.css('padding-right') !== '0px') {
                                //$this.width((w - (p * 2 * (c - 1))) / c);
                            }
                        });
                    }
                }
            });
        }
        function sticky() {
            $wrapper.find('[data-sticky-style], [data-sticky-class]').each(function() {
                var $sticky = $(this);
                if (!$sticky.data('top')) {
                    if ($sticky.offset().top < 0) {
                        $sticky.data('top', 0)
                    } else {
                        $sticky.data('top', $sticky.offset().top)
                    }
                }
                $body.imagesLoaded(function() {
                    if ($sticky.data('sticky-class')) {
                        var $container = $body;
                        if ($sticky.closest('.az-sticky').length) {
                            $container = $sticky.closest('.az-sticky');
                        }
                        var interval = setInterval(function() {
                            if (!$container.hasClass($sticky.data('sticky-class'))) {
                                if ($sticky.offset().top < 0) {
                                    $sticky.data('top', 0)
                                } else {
                                    $sticky.data('top', $sticky.offset().top)
                                }
                                clearInterval(interval);
                            }
                        }, 100);
                    }
                    if ($sticky.data('namespace') === undefined) {
                        $sticky.data('namespace', makeid());
                    }
                    $window.off('scroll.' + $sticky.data('namespace')).on('scroll.' + $sticky.data('namespace'), function() {
                        if ($window.scrollTop() > $sticky.data('top')) {
                            if ($sticky.data('sticky-class')) {
                                if ($sticky.closest('.az-sticky').length) {
                                    $sticky.closest('.az-sticky').addClass($sticky.data('sticky-class'));
                                } else {
                                    $body.addClass($sticky.data('sticky-class'));
                                }
                            }
                            if ($sticky.data('sticky-style')) {
                                $sticky.attr('style', $sticky.data('sticky-style'));
                            }
                        } else {
                            if ($sticky.data('sticky-class')) {
                                if ($sticky.closest('.az-sticky').length) {
                                    $sticky.closest('.az-sticky').addClass($sticky.data('sticky-class'));
                                } else {
                                    $body.removeClass($sticky.data('sticky-class'));
                                }
                            }
                            if ($sticky.data('sticky-style')) {
                                $sticky.attr('style', '');
                            }
                        }
                    });
                });
            });
        }
        function unique_id() {
            return Math.round(new Date().getTime() + (Math.random() * 100));
        }
        function loadScript(path, callback) {
            var done = false;
            var scr = document.createElement('script');
            scr.onload = handleLoad;
            scr.onreadystatechange = handleReadyStateChange;
            scr.onerror = handleError;
            scr.src = path;
            document.body.appendChild(scr);
            function handleLoad() {
                if (!done) {
                    done = true;
                    callback(path, "ok");
                }
            }
            function handleReadyStateChange() {
                var state;

                if (!done) {
                    state = scr.readyState;
                    if (state === "complete") {
                        handleLoad();
                    }
                }
            }
            function handleError() {
                if (!done) {
                    done = true;
                    callback(path, "error");
                }
            }
        }
        column_padding_fix();
        $window.off('resize.column_padding_fix').on('resize.column_padding_fix', column_padding_fix);
        $window.off('resize.sticky').on('resize.sticky', sticky);
        sticky();
        $wrapper.find('.az-tabs').each(function() {
            var $tabs = $(this);
            if (!$tabs.data('az-tabs')) {
                $tabs.find('> div:first-child > span > a[href^="#"]').click(function(event) {
                    var $this = $(this);
                    event.preventDefault();
                    $this.parent().addClass("az-active");
                    $this.parent().siblings().removeClass("az-active");
                    var tab = $this.attr("href");
                    $tabs.find('> div:last-child > div').not(tab).css("display", "none");
                    $(tab).fadeIn();
                });
                $tabs.find('> div:first-child > span:first-child > a[href^="#"]').click();
                $tabs.data('az-tabs', true);
            }
        });
        $wrapper.find('.az-accordion').each(function() {
            var $accordion = $(this);
            if (!$accordion.data('az-accordion')) {
                $accordion.find('> div > div:first-child').click(function(event) {
                    var $this = $(this);
                    $this.parent().addClass("az-active").find('> div:last-child').slideDown();
                    $this.parent().siblings().removeClass("az-active").find('> div:last-child').slideUp();
                });
                $accordion.find('> div:first-child > div:first-child').parent().addClass("az-active").find('> div:last-child').slideDown(0);
                $accordion.find('> div:first-child > div:first-child').parent().siblings().removeClass("az-active").find('> div:last-child').slideUp(0);
                $accordion.data('az-accordion', true);
            }
        });
        if ('flexslider' in $.fn) {
            $wrapper.find('.az-slider').each(function() {
                var $slider = $(this);
                if (!$slider.data('az-slider')) {
                    if ($slider.data('thumbnails') !== 'yes') {
                        $slider.find('.az-slides').flexslider({
                            namespace: "az-flex-",
                            selector: '> *',
                            smoothHeight: true,
                            prevText: '',
                            nextText: '',
                            touch: true,
                            pauseOnHover: true,
                            mousewheel: false,
                            controlNav: false,
                            customDirectionNav: $slider.find('.az-flex-direction-nav a')
                        });
                    } else {
                        var $gallery = $slider.find('.az-slides');
                        $gallery.attr('id', unique_id());
                        var $thumbnails = false;
                        if ($slider.find('.az-thumbnails').length) {
                            $thumbnails = $slider.find('.az-thumbnails');
                            $thumbnails.attr('id', $gallery.attr('id') + '-thumbnails');
                        } else {
                            $thumbnails = $('<div id="' + $gallery.attr('id') + '-thumbnails" class="az-thumbnails"></div>');
                            $('<div class="az-flex-thumbnails"></div>').appendTo($thumbnails).append($gallery.children().clone());
                            $('<div class="az-flex-direction-nav"><a href="#" class="az-flex-prev"></a><a href="#" class="az-flex-next"></a></div>').appendTo($thumbnails);
                            $thumbnails.insertAfter($gallery);
                        }
                        var itemWidth = $thumbnails.find('.az-flex-thumbnails').children().first().width();
                        if (!itemWidth) {
                            itemWidth = 150;
                        }
                        var itemHeight = $thumbnails.find('.az-flex-thumbnails').children().first().height();
                        if (!itemHeight) {
                            itemHeight = 150;
                        }
                        $thumbnails.flexslider({
                            namespace: "az-flex-",
                            selector: '.az-flex-thumbnails > *',
                            prevText: '',
                            nextText: '',
                            animation: "slide",
                            controlNav: false,
                            animationLoop: false,
                            pauseOnHover: true,
                            slideshow: false,
                            itemWidth: itemWidth,
                            itemHeight: itemHeight,
                            touch: true,
                            mousewheel: false,
                            customDirectionNav: $thumbnails.find('.az-flex-direction-nav a'),
                            asNavFor: '#' + $gallery.attr('id')
                        });

                        $gallery.flexslider({
                            namespace: "az-flex-",
                            selector: '> *',
                            smoothHeight: true,
                            prevText: '',
                            nextText: '',
                            touch: true,
                            pauseOnHover: true,
                            mousewheel: false,
                            controlNav: false,
                            customDirectionNav: $slider.find('> .az-flex-direction-nav a'),
                            sync: '#' + $gallery.attr('id') + '-thumbnails'
                        });
                    }
                    $slider.data('az-slider', true);
                }
            });
        }
        if ('AZowlCarousel' in $.fn) {
            $wrapper.find('.az-carousel').each(function() {
                var $carousel = $(this);
                if (!$carousel.data('az-carousel')) {
                    var defaults = {
                        items: 3,
                        loop: false,
                        center: false,
                        rewind: false,
                        mouseDrag: false,
                        touchDrag: false,
                        pullDrag: false,
                        freeDrag: false,
                        margin: 0,
                        stagePadding: 0,
                        merge: false,
                        mergeFit: true,
                        autoWidth: false,
                        startPosition: 0,
                        rtl: false,
                        smartSpeed: 250,
                        fluidSpeed: false,
                        dragEndSpeed: false,
                        responsive: {},
                        responsiveRefreshRate: 200,
                        responsiveBaseElement: window,
                        fallbackEasing: 'swing',
                        info: false,
                        nestedItemSelector: false,
                        itemElement: 'div',
                        stageElement: 'div',
                        refreshClass: 'az-owl-refresh',
                        loadedClass: 'az-owl-loaded',
                        loadingClass: 'az-owl-loading',
                        rtlClass: 'az-owl-rtl',
                        responsiveClass: 'az-owl-responsive',
                        dragClass: 'az-owl-drag',
                        itemClass: 'az-owl-item',
                        stageClass: 'az-owl-stage',
                        stageOuterClass: 'az-owl-stage-outer',
                        grabClass: 'az-owl-grab',
                        autoRefresh: true,
                        autoRefreshInterval: 500,
                        lazyLoad: false,
                        autoHeight: false,
                        autoHeightClass: 'az-owl-height',
                        video: false,
                        videoHeight: false,
                        videoWidth: false,
                        animateOut: false,
                        animateIn: false,
                        autoplay: false,
                        autoplayTimeout: 5000,
                        autoplayHoverPause: true,
                        autoplaySpeed: false,
                        nav: true,
                        navText: ['<span></span>', '<span></span>'],
                        navSpeed: false,
                        navElement: 'div',
                        navContainer: false,
                        navContainerClass: 'az-owl-nav',
                        navClass: ['az-owl-prev', 'az-owl-next'],
                        slideBy: 1,
                        dotClass: 'az-owl-dot',
                        dotsClass: 'az-owl-dots',
                        dots: true,
                        dotsEach: false,
                        dotsData: false,
                        dotsSpeed: false,
                        dotsContainer: false,
                        URLhashListener: false
                    };
                    var options = {};
                    for (var key in defaults) {
                        if ($carousel.data(key)) {
                            options[key] = $carousel.data(key);
                            if (options[key] === 'yes') {
                                options[key] = true;
                            }
                            if (options[key] === 'no') {
                                options[key] = false;
                            }
                        }
                    }
                    options = $.extend({}, defaults, options);
                    if (customize) {
                        options['loop'] = false;
                        options['mouseDrag'] = false;
                        options['touchDrag'] = false;
                        options['pullDrag'] = false;
                        options['freeDrag'] = false;
                    }
                    $carousel.AZowlCarousel(options);
                    $window.trigger('resize');
                    $carousel.data('az-carousel', true);
                }
            });
        }
        if ('magnificPopup' in $.fn) {
            $wrapper.find('.az-gallery').each(function() {
                $(this).magnificPopup({
                    delegate: 'a',
                    type: 'image',
                    gallery: {
                        enabled: true
                    }
                });
            });
            $wrapper.find('a.az-image-popup').magnificPopup({
                type: 'image',
                removalDelay: 300,
                mainClass: 'mfp-fade',
                overflowY: 'scroll'
            });
            $wrapper.find('a.az-iframe-popup').magnificPopup({
                type: 'iframe',
                removalDelay: 300,
                mainClass: 'mfp-fade',
                overflowY: 'scroll',
                iframe: {
                    markup: '<div class="mfp-iframe-scaler">' +
                            '<div class="mfp-close"></div>' +
                            '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
                            '</div>',
                    patterns: {
                        youtube: {
                            index: 'youtube.com/',
                            id: 'v=',
                            src: '//www.youtube.com/embed/%id%?autoplay=1'
                        },
                        vimeo: {
                            index: 'vimeo.com/',
                            id: '/',
                            src: '//player.vimeo.com/video/%id%?autoplay=1'
                        },
                        gmaps: {
                            index: '//maps.google.',
                            src: '%id%&output=embed'
                        }
                    },
                    srcAction: 'iframe_src'
                }
            });
        }
        if ('countdown' in $.fn) {
            $wrapper.find('.az-countdown').each(function() {
                var $countdown = $(this);
                if ($countdown.data('countdownInstance') === undefined) {
                    $countdown.countdown($countdown.data('time'), function(event) {
                        $countdown.find('.az-days .az-count').text(event.offset.totalDays);
                        $countdown.find('.az-hours .az-count').text(event.offset.hours);
                        $countdown.find('.az-minutes .az-count').text(event.offset.minutes);
                        $countdown.find('.az-seconds .az-count').text(event.offset.seconds);
                    });
                }
            });
        }
        if ('waypoint' in $.fn) {
            $wrapper.find('.az-lazy-load').each(function() {
                var $image = $(this);
                var waypoint_handler = function(direction) {
                    $('<img src="' + $image.data('src') + '">').load(function() {
                        if ($image.prop('tagName') === 'IMG') {
                            $image.attr('src', $image.data('src'));
                        } else {
                            $image.css('background-image', 'url("' + $image.data('src') + '")');
                        }
                        $image.addClass('loaded');
                    });
                };
                $image.waypoint(waypoint_handler, {offset: '100%', triggerOnce: true});
                $image.data('waypoint_handler', waypoint_handler);
            });
        }
        $wrapper.find('.az-gmap').each(function() {
            function gmap_init() {
                if ($gmap.data('latitude') && $gmap.data('longitude') && !$gmap.data('map')) {
                    var map = new google.maps.Map($gmap.get(0), {
                        scrollwheel: false,
                        disableDefaultUI: true,
                        styles: $gmap.data('styles') ? $gmap.data('styles') : null,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });
                    var location = new google.maps.LatLng(parseFloat($gmap.data('latitude')), parseFloat($gmap.data('longitude')));

                    var marker = new google.maps.Marker({
                        position: location,
                        map: map,
                        icon: $gmap.data('marker') ? $gmap.data('marker') : null
                    });

                    map.refresh = function() {
                        map.setZoom($gmap.data('zoom') ? $gmap.data('zoom') : 14);

                        map.setCenter(location);
                        google.maps.event.trigger(map, 'resize');
                        if ($gmap.data('offset-x') !== undefined && $gmap.data('offset-y') !== undefined) {
                            var overlay = new google.maps.OverlayView();
                            overlay.draw = function() {
                            };
                            overlay.onAdd = function() {
                                var projection = this.getProjection();
                                var aPoint = projection.fromLatLngToContainerPixel(location);
                                aPoint.x = aPoint.x + parseFloat($gmap.data('offset-x'));
                                aPoint.y = aPoint.y + parseFloat($gmap.data('offset-y'));
                                map.setCenter(projection.fromContainerPixelToLatLng(aPoint));
                                google.maps.event.trigger(map, 'resize');
                            };
                            overlay.setMap(map);
                        }
                    };
                    map.refresh();
                    $gmap.data('map', map);
                }
            }
            var $gmap = $(this);
            if ('google' in window) {
                gmap_init();
            } else {
                if ($gmap.find('script').length) {
                    $gmap.find('script').get(0).onload = gmap_init;
                    var i = setInterval(function() {
                        if ('google' in window) {
                            gmap_init();
                            clearInterval(i);
                        }
                    }, 100);
                } else {
                    if ($gmap.data('gmap-api-key')) {
                        loadScript('//maps.googleapis.com/maps/api/js?key=' + $gmap.data('gmap-api-key'), function(path, status) {
                            gmap_init();
                        });
                    }
                }
            }
        });
        if ('isotope' in $.fn) {
            $wrapper.find('[data-isotope-items]').each(function() {
                var $grid = $(this);
                $grid.isotope($grid.data('isotope-items'));
                $grid.imagesLoaded().progress(function() {
                    $grid.isotope('layout');
                });
                $grid.one('arrangeComplete', function() {
                    $window.trigger('resize');
                });
                var $filters = false;
                var filters_closeness = false;
                $('[data-isotope-filters]').each(function() {
                    var parent = $grid.parents().has(this).first();
                    if ($filters === false) {
                        $filters = $(this);
                        filters_closeness = $grid.parents().index(parent);
                    } else {
                        if (filters_closeness > $grid.parents().index(parent)) {
                            $filters = $(this);
                            filters_closeness = $grid.parents().index(parent);
                        }
                    }
                });
                if ($filters) {
                    $filters.find('[data-filter]').on('click', function() {
                        var $this = $(this);
                        $grid.isotope({filter: $this.attr('data-filter')});
                        $filters.find('[data-filter].az-is-checked').removeClass('az-is-checked');
                        $this.addClass('az-is-checked');
                    });
                }
            });
        }
        if ('masonry' in $.fn) {
            $wrapper.find('[data-masonry-items]').each(function() {
                var $grid = $(this);
                $grid.masonry($grid.data('masonry-items'));
                $grid.imagesLoaded().progress(function() {
                    $grid.masonry('layout');
                });
                $grid.one('arrangeComplete', function() {
                    $window.trigger('resize');
                });
            });
        }
        $wrapper.find('.az-share').each(function() {
            var $share = $(this);
        });
        $wrapper.find('.az-preloader').each(function() {
            $(this).fadeOut("slow");
        });
        $wrapper.find('form .az-enter-submit').each(function() {
            $(this).on("keydown", function(event) {
                if (event.keyCode === 13) {
                    $(this).closest('form').submit();
                }
            });

        });
        $wrapper.find('form').each(function() {
            $('input, textarea').on('change', function() {
                var $this = $(this);
                if ($this.val() === '') {
                    $this.parent().removeClass('az-filled');
                } else {
                    $this.parent().addClass('az-filled');
                }
            });
        });
        $wrapper.find('[data-background-mode="semi-transparent-color"]').each(function() {
            var $this = $(this);
            $this.css('position', 'relative');
            $('<div></div>').prependTo(this).css({
                "position": "absolute",
                "left": "0",
                "top": "0",
                "right": "0",
                "bottom": "0",
                "opacity": 1 - parseInt($this.data('transparency'), 10) / 100,
                "background-color": $this.css('background-color')
            });
        });
        $wrapper.find('a[href*="#"].az-roll, .az-roll a[href*="#"]').off('click').on('click', function(e) {
            if (this.href.split('#')[0] === '' || window.location.href.split('#')[0] === this.href.split('#')[0]) {
                e.preventDefault();
                var hash = this.hash;
                $('html, body').stop().animate({
                    'scrollTop': $(hash).offset().top
                }, 2000);
            }
        });
        if ('knob' in $.fn) {
            $wrapper.find(".az-knob").knob();
        }
        $wrapper.imagesLoaded(function() {
            $wrapper.find('[data-parallax="true"]').each(function() {
                var $this = $(this);
                $this.css({
                    "background-size": "cover",
                    "background-repeat": "no-repeat",
                    "background-attachment": "fixed"
                });
                $this.parallax("50%", $this.data('parallax-speed') / 100);
            });
        });
    });
    $window.on('az-frontend-after-init', function(event, data) {
        if ('azh' in $.QueryString && $.QueryString['azh'] === 'fullpage') {
            if ('fullpage' in $.fn) {
                var $content_wrapper = false;
                if ($body.is('.page-template-azexo-html-template')) {
                    $content_wrapper = $body.find('> .page');
                } else {
                    if ($body.is('.page')) {
                        if ('azexo' in window) {
                            $content_wrapper = $body.find('#content > .entry > .entry-content');
                        } else {
                            $content_wrapper = $body.find('[data-section]').parent();
                        }
                    }
                }
                if ($content_wrapper) {
                    $content_wrapper.find('[data-section]').addClass('section');
                    $content_wrapper.fullpage({
                        navigation: true,
                        navigationPosition: 'right',
                    });
                }
            }
        }
    });
    $(function() {
        if (document.documentElement.clientWidth > 768 && !('azh' in $.QueryString && $.QueryString['azh'] === 'fullpage')) {
            if (typeof scrollReveal === 'function') {
                window.scrollReveal = new scrollReveal();
            }
        }
    });
})(jQuery);