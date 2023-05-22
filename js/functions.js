/**
 * Copyright 2013 Stephino
 * 
 * @version 1.0
 */
$(document).ready(function(){
    "use strict";
    var intval = function (mixed_var, base) {var tmp;var type = typeof(mixed_var);if (type === 'boolean') {return +mixed_var;} else if (type === 'string') {tmp = parseInt(mixed_var, base || 10);return (isNaN(tmp) || !isFinite(tmp)) ? 0 : tmp;} else if (type === 'number' && isFinite(mixed_var)) {return mixed_var | 0;} else {return 0;}};
    var rand = function(numLow, numHigh) {var adjustedHigh = (parseFloat(numHigh) - parseFloat(numLow)) + 1;return Math.floor(Math.random()*adjustedHigh) + parseFloat(numLow);};
    var timeouts = [];
    jQuery.fn.outerHTML = function() {return jQuery('<div />').append(this.eq(0).clone()).html();};
        
    // Countdown Class
    var Countdown = function() {
        var _this   = this;
        var countdown = $('.countdown');
        var date, color1, color2;
        this.debug  = true;
        this.daysChart = null;
        this.hoursChart = null;
        this.minutesChart = null;
        this.secondsChart = null;
        var lastMousePos = null;
        var chartsCoords = {};
        var chartsDrawing = {};
        this.animateDisks = true;
        var options;
        this.offsetTop = 0;
        
        //create donut chart
        this.createPlot = function(id) {
            var s1 = [['a', 60], ['b', 0]];
            var width = intval($('#counter > .row > .col').width());
            var thickness = 8;
            var diameter = (width > 250 ? 250 : width) - 2 * thickness - 5;
            var plot = $.jqplot(id, [s1], {
                animate: true,
                animateReplot: true,
                seriesDefaults: {
                    seriesColors: [color1, color2], 
                    markerOptions: {
                        size: 1
                    },
                    renderer: $.jqplot.DonutRenderer,
                    rendererOptions: {
                        sliceMargin: 3,
                        startAngle: 90,
                        padding: 0,
                        highlightMouseOver: false,
                        highlightMouseDown: false,
                        thickness: thickness,
                        shadowOffset: 4,
                        shadowDepth: 1,
                        shadowAlpha: 0.5,
                        shadowAngle: 90,
                        diameter: diameter,
                        animation: {
                            speed: 1000
                        }
                    }
                },
                grid: {
                    shadow: false,
                    background: 'transparent',
                    borderWidth: 0
                }
            });
            return plot;
        };

        //init application
        this.init = function(o) {
            options = o;
            if (countdown.length === 0) {return;}

            // Get the date
            date = countdown.attr('date');
            date = date.split('-');

            // Custom colors
            color1 = !countdown.attr('color1') ? '#fcffd9' : countdown.attr('color1');
            color2 = !countdown.attr('color2') ? '#a41b22' : countdown.attr('color2');

            // Invalid date format
            if (date.length !== 3) {return;}

            // Set the actual date
            date = new Date(intval(date[0]), intval(date[1]) - 1, intval(date[2]));
            
            // Add the necessary HTML
            $('.countdown').html('<div id="counter" class="container">' + 
                  '<div class="row">' +
                  '<div class="span2 offset2 col">' +
                    '<div id="daysChart" class="chart"></div>' +
                    '<div id="days" class="info"><div class="disk"><a data-target="#about-us" data-toggle="modal" href="javascript:void(0);">&#xF080;</a><i>About Us</i></div><span class="number">1</span><p>days</p></div>' +
                  '</div>' +
                  '<div class="span2 col">' +
                    '<div id="hoursChart" class="chart"></div>' +
                    '<div id="hours" class="info"><div class="disk"><a data-target="#contact" data-toggle="modal" href="javascript:void(0);">&#xF13B;</a><i>Contact</i></div><span class="number">1</span><p>hours</p></div>' +
                  '</div>' +
                  '<div class="span2 col">' +
                    '<div id="minutesChart" class="chart"></div>' +
                    '<div id="minutes" class="info"><div class="disk"><a data-target="#newsletter" data-toggle="modal" href="javascript:void(0);">&#xF152;</a><i>Newsletter</i></div><span class="number">1</span><p>minutes</p></div>' +
                  '</div>' +
                  '<div class="span2 col">' +
                    '<div id="secondsChart" class="chart"></div>' +
                    '<div id="seconds" class="info"><div class="disk"><a data-target="#map" data-toggle="modal" href="javascript:void(0);">&#xF07C;</a><i>Map</i></div><span class="number">1</span><p>seconds</p></div>' +
                  '</div>' +
                '</div>' +
              '</div>');

            //create charts for days, hours, minutes and seconds
            this.daysChart = this.createPlot("daysChart");
            this.hoursChart = this.createPlot("hoursChart");
            this.minutesChart = this.createPlot("minutesChart");
            this.secondsChart = this.createPlot("secondsChart");
            
            $('.info').hover(function(){
                _this.animateDisks = false;
                $('.info').removeClass('active');
            },function(){
                _this.animateDisks = true;
            });
            
            //at start update counter
            this.checkDate();

            //every 1 sec update counter
            timeouts[timeouts.length] = window.setInterval(function() {
                _this.checkDate();
            }, 1000);
            
            $('body').off("mousemove").on('mousemove', function(e) {
                _this.gravity(e);
            });
            
            $(window).resize(function(){
                this.offsetTop = 0;
                var charts = {days:_this.daysChart, hours:_this.hoursChart, minutes:_this.minutesChart, seconds:_this.secondsChart};
                chartsCoords = {};
                lastMousePos = null;
                
                $.each(charts, function(k, chart) {    
                    var width = intval($('#counter > .row > .col').width());
                    chart.series[0].diameter = (width > 250 ? 250 : width) - 2*chart.series[0].rendererOptions.thickness - 5;
                    chart.series[0].rendererOptions.diameter = chart.series[0].diameter;
                    chart.replot({resetAxes: true});
                });
                _this.startAnimation();
            });
            
            // Reload
            this.startAnimation();
        };
        
        this.startAnimation = function() {
            // Animate the logo
            $('a.logo').stop().css({
                width: 0,
                height: 0,
            }).animate({
                width: 200,
                height: 200,
            }, {
                duration: options.progressDuration
            });
            
            // Animate the headers
            $('#page_wrap h1, #page_wrap h2').stop().css({
                width: '0%',
                overflow: 'hidden',
                height: 45
            }).animate({
                width: '100%'
            }, {
                duration: options.progressDuration,
                complete: function(){
                    $(this).css({
                        overflow: 'visible',
                        height: 'auto',
                    });
                }
            });
        };
        
        this.gravity = function(e) {
            var charts = {days:this.daysChart, hours:this.hoursChart, minutes:this.minutesChart, seconds:this.secondsChart};
            if (typeof e === 'undefined') {
                if (lastMousePos === null) {
                    $.each(charts, function(k, chart) {
                        chart.replot({resetAxes: true});
                    });
                    return true;
                } else {
                    e = lastMousePos;
                }
            } else {
                lastMousePos = e;
            }
            
            var event = {
                pageX: e.pageX,
                pageY: e.pageY,
            };
            $.each(charts, function(k, chart){
                // Redraw the chart
                if (typeof chartsDrawing[k] === 'undefined' || chartsDrawing[k] === false) {
                    if (rand(1,4) === 1 || typeof chartsCoords[k] === 'undefined') {
                        // Get circle coordinates
                        chartsCoords[k] = {
                            y: chart.target.offset().top  + chart.target.height() / 2,
                            x: chart.target.offset().left + chart.target.width() / 2,
                        };
                    }                
                    var coords = chartsCoords[k];

                    // Avoid division by 0
                    if (event.pageX !== coords.x) {
                        var deg = 180 * Math.atan((event.pageY - _this.offsetTop - coords.y)/(event.pageX - coords.x)) / Math.PI;
                        if (event.pageX > coords.x) {
                            deg += 180;
                        }
                        chart.series[0].startAngle = intval(deg - chart.series[0].gridData[0][2] * 180);
                    }
                
                    chartsDrawing[k] = true;
                    chart.redraw();
                    window.setTimeout(function(){chartsDrawing[k] = false;}, options.rows * options.columns + 5);
                }
            });
        };

        //counter update function
        this.checkDate = function() {
            //get actually date
            var now = new Date();
            //get difference from launch date (declared in head in index.html)
            var diff = date.getTime() - now.getTime();

            //change multisecond result to seconds, minutes, hours and days
            var tmp = diff / 1000;
            var seconds = Math.floor(tmp % 60);
            tmp /= 60;
            var minutes = Math.floor(tmp % 60);
            tmp /= 60;
            var hours = Math.floor(tmp % 24);
            tmp /= 24;
            var days = Math.floor(tmp);

            //render in text
            $("#days .number").html(days);
            $("#hours .number").html(hours);
            $("#minutes .number").html(minutes);
            $("#seconds .number").html(seconds);

            var spelling = {
                days:    [countdown.attr('day') ? countdown.attr('day') : "day", countdown.attr('days') ? countdown.attr('days') : "days"],
                hours:   [countdown.attr('hour') ? countdown.attr('hour') : "hour", countdown.attr('hours') ? countdown.attr('hours') : "hours"],
                minutes: [countdown.attr('minute') ? countdown.attr('minute') : "minute", countdown.attr('minutes') ? countdown.attr('minutes') : "minutes"],
                seconds: [countdown.attr('second') ? countdown.attr('second') : "second", countdown.attr('seconds') ? countdown.attr('seconds') : "seconds"],
            };

            $("#days > p").html(days === 1 ? spelling.days[0] : spelling.days[1]);
            $("#hours > p").html(hours === 1 ? spelling.hours[0] : spelling.hours[1]);
            $("#minutes > p").html(minutes === 1 ? spelling.minutes[0] : spelling.minutes[1]);
            $("#seconds > p").html(seconds === 1 ? spelling.seconds[0] : spelling.seconds[1]);
            
            // Pass the icons around
            if (this.animateDisks) {
                $('.info').removeClass('active');
                $('.countdown .row > div:nth-child(' + ((60-seconds)%4 + 1) + ') .info').addClass('active');
            }
            
            // Prepare the new data for charts
            var daysData    = [['a', 360 - days], ['b', days]];
            var hoursData   = [['a', 24  - hours], ['b', hours]];
            var minutesData = [['a', 60 - minutes], ['b', minutes]];
            var secondsData = [['a', 60 - seconds], ['b', seconds]];

            //draw charts with new data
            this.daysChart.series[0].data = daysData;
            this.hoursChart.series[0].data = hoursData;
            this.minutesChart.series[0].data = minutesData;
            this.secondsChart.series[0].data = secondsData;
            this.gravity();
        };
    };
    
    // Define the main class
    var Duct = function() {
        var _this = this;
        var options = {};
        this.windowDim = {};
        
        // Initiate the project
        this.init = function() {
            // Initialize the options
            this.initOptions();

            // Prepare the social icons
            this.socialIcons(); 
            
            // Create the mesh
            this.createMesh();
            
            var countdown = new Countdown();
            countdown.init(options);
            
            // Create the scrollbars
            this.scrollBars(countdown);
            
            // Form validation
            this.formValidation();
            
            // Create the tooltips
            $('[title]').tooltip();
            
            // Custom modals
            this.customModals();
            
            // Make modals draggable
            $('.modal').draggable();
        };
        
        this.customModals = function() {
            $('[data-toggle="modal"]').click(function(){
                $('a.logo, #page_wrap h1, #page_wrap h2, .countdown, .mesh > div > i, .progress').stop().animate({
                    opacity: 0
                },{
                    duration: 500
                });
            });
            $('.modal').on('hidden', function(e) {
                if (!$(e.target).hasClass('social')) {
                    $('a.logo, #page_wrap h1, #page_wrap h2, .countdown, .mesh > div > i, .progress').stop().animate({
                        opacity: 1
                    }, {
                        duration: 500
                    });
                }
            });
        };
        
        this.scrollBars = function(countdown) {
            $('#page_wrap').mCustomScrollbar({
                set_width:false, /*optional element width: boolean, pixels, percentage*/
                set_height:false, /*optional element height: boolean, pixels, percentage*/
                horizontalScroll:false, /*scroll horizontally: boolean*/
                scrollInertia:50, /*scrolling inertia: integer (milliseconds)*/
                scrollEasing:"easeOutCirc", /*scrolling easing: string*/
                mouseWheel:"pixels", /*mousewheel support and velocity: boolean, "auto", integer, "pixels"*/
                mouseWheelPixels:50, /*mousewheel pixels amount: integer*/
                autoDraggerLength:false, /*auto-adjust scrollbar dragger length: boolean*/
                scrollButtons:{ /*scroll buttons*/
                    enable:false, /*scroll buttons support: boolean*/
                    scrollType:"continuous", /*scroll buttons scrolling type: "continuous", "pixels"*/
                    scrollSpeed:20, /*scroll buttons continuous scrolling speed: integer*/
                    scrollAmount:40 /*scroll buttons pixels scroll amount: integer (pixels)*/
                },
                advanced:{
                    updateOnBrowserResize:true, /*update scrollbars on browser resize (for layouts based on percentages): boolean*/
                    updateOnContentResize:true, /*auto-update scrollbars on content resize (for dynamic content): boolean*/
                    autoExpandHorizontalScroll:false, /*auto expand width for horizontal scrolling: boolean*/
                    autoScrollOnFocus:true /*auto-scroll on focused elements: boolean*/
                },
                callbacks:{
                    onScroll: function(){
                        countdown.offsetTop = intval($('#page_wrap .mCSB_container').css('top'));
                    },
                }
            });
            
        };
        
        // Create Mesh
        this.createMesh = function() {
            // Create a Mesh dom object
            var width, height, mesh = $('<div class="mesh"><div class="progress" title="' + options.progress + '% done" style="background: ' + options.progressBackground + '; color: ' + options.progressColor + ';"></div></div>'), elements = [];
            
            // Create a recalibration function
            var recalibrate = function() {
                // Prepare the increment
                var increment = 0, left, top;
                
                // Get the window dimensions
                _this.windowDim = {
                    width: $(window).width(),
                    height: $(window).height(),
                };
                var progressWidth = _this.windowDim.width * options.progress / 100;
                    
                // Progress length
                mesh.children('.progress').css({width:0}).stop().animate({
                    width: options.progress + '%'
                }, {
                    duration: options.progressDuration,
                    step: function(n) {
                        $(this).html(Math.round(n) + '%');
                    }
                });
                
                // Calculate element width
                width = (_this.windowDim.width - ((options.columns + 1) * options.margin)) / options.columns;
                height = (_this.windowDim.height - ((options.rows + 1) * options.margin)) / options.rows;

                // Go through each row
                for (var r = 1; r <= options.rows; r++) {
                    for (var c = 1; c <= options.columns; c++) {
                        top = (r * options.margin + ((r-1) * height));
                        left = (c * options.margin + ((c-1) * width));
                        
                        elements[increment].css({
                            top: top,
                            left: left,
                            width: 0,
                            height: 0,
                            marginLeft: 0,
                            marginTop: 0,
                        }).stop().animate({
                            width: width,
                            height: height,
                        }, {
                            duration: 2*options.progressDuration,
                            easing: 'easeInBounce',
                        });
                        elements[increment].children('i').stop().animate({
                            width: (left + width <= progressWidth ? width : progressWidth - left),
                            height: height,
                            opacity: 1,
                        },{
                            duration: options.progressDuration
                        });
                        increment++;
                    }
                }
            };
            
            // Create the elements
            for (var r = 1; r <= options.rows; r++) {
                for (var c = 1; c <= options.columns; c++) {
                    // Append to mesh
                    var div = $('<div><i></i></div>');
                    elements[elements.length] = div;
                    $(mesh).append(div);
                }
            }
            
            // Recalibrate the items
            recalibrate(mesh);
            
            // Recalibrate on window resize
            $(window).resize(function(){recalibrate(mesh);});
            
            // Gravity well
            var gravityWell = function() {
                // On mousemove
                $('#page_wrap').off("mousemove").on('mousemove', function(e) {
                    // Prepare the increment
                    var increment = 0;
                    
                    // Go through each row
                    for (var r = 1; r <= options.rows; r++) {
                        for (var c = 1; c <= options.columns; c++) {
                            // Compute the element's center
                            var elemCenter = {
                                x: (2 * c - 1) * width /2 + c * options.margin,
                                y: (2 * r - 1) * height /2 + r * options.margin,
                            };
                            
                            // Calculate the euclidian distance
                            var euclidDistance = Math.sqrt(Math.pow(elemCenter.y - e.pageY, 2) + Math.pow(elemCenter.x - e.pageX, 2));
                            
                            // Need to shink?
                            if (euclidDistance <= options.radius) {
                                var shrinkPercent = (euclidDistance-options.radius*options.shrink/(options.shrink-100)) * (100-options.shrink)/options.radius;
                                elements[increment].css({
                                    marginLeft: intval(width * ( 1 - shrinkPercent / 100)/2),
                                    marginTop: intval(height * ( 1 - shrinkPercent / 100)/2),
                                    width: intval(width * shrinkPercent / 100),
                                    height: intval(height * shrinkPercent / 100),
                                });
                            } else {
                                elements[increment].css({
                                    marginLeft: 0,
                                    marginTop: 0,
                                    width: width,
                                    height: height,
                                });
                            }
                            increment++;
                        }
                    }
                });
            };
            gravityWell();
            
            // Append the mesh to the screen
            $('#page_wrap').append(mesh);
        };
        
        this.socialIcons = function() {
            var translations = {
                'youtube': "&#xe000;",
                'yandex': "&#xe001;",
                'vkontakte': "&#xe002;",
                'vk': "&#xe003;",
                'vimeo': "&#xe004;",
                'twitter': "&#xe005;",
                'tumblr': "&#xe006;",
                'steam': "&#xe007;",
                'stackoverflow': "&#xe008;",
                'soundcloud': "&#xe009;",
                'skype': "&#xe00a;",
                'share': "&#xe00b;",
                'rss': "&#xe00c;",
                'readability': "&#xe00d;",
                'read-it-Later': "&#xe00e;",
                'pocket': "&#xe00f;",
                'pinterest': "&#xe010;",
                'picasa': "&#xe011;",
                'openid': "&#xe012;",
                'myspace': "&#xe013;",
                'moikrug': "&#xe014;",
                'linked-in': "&#xe015;",
                'lifejournal': "&#xe016;",
                'lastfm': "&#xe017;",
                'jabber': "&#xe018;",
                'instapaper': "&#xe019;",
                'habrahabr': "&#xe01a;",
                'google': "&#xe01b;",
                'github-octoface': "&#xe01c;",
                'github-circle': "&#xe01d;",
                'foursquare': "&#xe01e;",
                'flickr': "&#xe01f;",
                'flattr': "&#xe020;",
                'facebook': "&#xe021;",
                'evernote': "&#xe022;",
                'email': "&#xe023;",
                'dropbox': "&#xe024;",
                'blogspot': "&#xe025;",
                'bitbucket': "&#xe026;",
                'youtube-play': "&#xe027;",
            };
            if ($('.social').length) {
                $.each($('.social'), function(){
                    // Get the class name
                    var className = $(this).attr('class').replace(/social\s*/g, '');
                    var title = $(this).html();
                    
                    // Translation available?
                    if (typeof translations[className] !== 'undefined') {
                        $(this).html(translations[className]).css({
                            backgroundColor: options.color
                        }).attr('title', title).attr('data-placement', 'bottom');
                    }
                });
            }
        };
        
        // Load the options
        this.initOptions = function() {
            var userOptions = {
                rows: $('#page_wrap').attr('data-rows') ? intval($('#page_wrap').attr('data-rows')) : 4,
                columns: $('#page_wrap').attr('data-columns') ? intval($('#page_wrap').attr('data-columns')) : 8,
                margin: $('#page_wrap').attr('data-margin') ? intval($('#page_wrap').attr('data-margin')) : 0,
                radius: $('#page_wrap').attr('data-radius') ? intval($('#page_wrap').attr('data-radius')) : 300,
                shrink: $('#page_wrap').attr('data-shrink') ? intval($('#page_wrap').attr('data-shrink')) : 30,
                progress: $('#page_wrap').attr('data-progress') ? intval($('#page_wrap').attr('data-progress')) : 33,
                progressDuration: $('#page_wrap').attr('data-progress-duration') ? intval($('#page_wrap').attr('data-progress-duration')) : 3000,
                progressColor: $('#page_wrap').attr('data-progress-color') ? $('#page_wrap').attr('data-progress-color') : '#ffffff',
                progressBackground: $('#page_wrap').attr('data-progress-background') ? $('#page_wrap').attr('data-progress-background') : '#ffffff',
            };
            
            // Sanitize rows and columns
            if (userOptions.rows < 1) {
                userOptions.rows = 1;
            }
            if (userOptions.columns < 1) {
                userOptions.columns = 1;
            }
            
            // Sanitize the margin
            if (userOptions.margin < 0) {
                userOptions.margin = 0;
            }
            
            // Sanitize the shrink percent (10 to 90 %)
            userOptions.shrink = userOptions.shrink < 10 ? 10 : (userOptions.shrink > 90 ? 90 : userOptions.shrink);
            
            // Sanitize the shrink percent (0 to 100 %)
            userOptions.progress = userOptions.progress < 0 ? 0 : (userOptions.progress > 100 ? 100 : userOptions.progress);
            
            // Sanitize the shrink percent (0 to 10000)
            userOptions.progressDuration = userOptions.progressDuration < 0 ? 0 : (userOptions.progressDuration > 10000 ? 10000 : userOptions.progressDuration);
            
            // Get the options
            $.extend(options, userOptions);
        };
        
        this.parallax = function(selector) {
            $('html').off("mousemove").on('mousemove', function(e){
                // Get the window width
                var windowWidth = $(window).width();
                
                // Get the window height
                var windowHeight = $(window).height();
                
                // Get x percent
                var xPercent = (e.clientX / windowWidth * 100);
                
                // Get y percent
                var yPercent = (e.clientY / windowHeight * 100);
                
                xPercent = 40 + xPercent / 100 * 20;
                yPercent = 80 + yPercent / 100 * 20;
                
                // Get all the items
                var allItems = $(selector);
                if (allItems.length) {
                    allItems.css({
                        backgroundPosition: xPercent + '% ' + yPercent + '%'
                    });
                }
            });
        };

        // Form validation
        this.formValidation = function() {
            // Parse forms
            $('.submit.btn').on('click', function(){
                $(this).closest('form').submit();
            });
            $.each($('form.validate'), function(){
                $(this).validate({
                    submitHandler: function(form) {
                        var data = $(form).serializeArray();
                        var action = $(form).attr('action');
                        $.ajax({
                            method: 'post',
                            dataType: 'json',
                            url: action,
                            data: data,
                            success: function(d) {
                                // Prepare the message
                                var message = '';
                                $.each(d, function(k, m){
                                    var messageType = 'boolean' === $.type(m.status) ? (m.status?'success':'error') : m.status;
                                    message += '<div class="alert alert-'+messageType+'">'+m.message+'</div>';
                                });
                                // Replace the form with the message
                                $(form).replaceWith($(message));
                            },
                            error: function() {
                                var error = $('<div class="alert alert-error">Could not contact host. Please try again later.</div>');
                                $(form).replaceWith(error);
                            }
                        });
                    }
                });
            });
        };
    };
    
    // Load the class
    var instance = new Duct();
    instance.init();
});