(function($, win, count) {

    /**
     * A string to access objects with a property or method beginning with 'thumb'. This will allow it to be compressed better
     * @type String
     */
    var thumb = 'thumb',
    width = 'width',
    height = 'height',
    apply = 'apply',
    call = 'call',
    offset = 'offset',
    bounds = 'bounds',
    css = 'css',
    orientation = 'orientation',
    sbid = 'data-streamboundariesid',
    getBoundingClientRect = 'getBoundingClientRect',
    isViewport = 'isViewport',
    cache = {},
    methods = {
        init: function(opts) {
            var T = this;
            if (!T.length) {
                // There is no object, return
                return T;
            }
            if (T.length > 1) {
                // The selector matched more than one object, apply this function each individually
                T.each(function() {
                    $.fn.streamBoundaries[apply]($(this), arguments);
                });
                return T;
            }
            var prop = {},
            ef = function() {};
            T.s = $.extend({
                autoRotate: !0,
                bg: '#DEDEDE',
                centerThumb: !0,
                bounds: !1,
                height: '5px',
                isViewport: !1,
                minResizeHeight: '20px',
                minResizeWidth: '20px',
                onFinish: ef,
                onUpdate: ef,
                orientation: 'x',
                thumb: T.find('*:first'),
                thumbBg: '#333',
                thumbHeight: '5px',
                thumbWidth: '10%',
                resizable: !1,
                width: '300px'
            }, opts);
            T[offset + 'X'] = 0;
            T[offset + 'Y'] = 0;
            T['auto' + bounds] = !1;
            T.c = ++count;
            T.isresize;
            prop[sbid] = T.c;
            T.attr(prop);
            
            /**
             * Render the thumb and track according to the parameters that are passed to it
             * @param {float} x The new x position of the thumb
             * @param {float} y The new y position of the thumb
             */
            T.render = function(x, y) {
                var settings = T.s,
                th = settings[thumb],
                dorotate = settings[orientation] === 'y' && settings.autoRotate,
                tcss = {
                    width: settings[dorotate ? height : width],
                    height: settings[dorotate ? width : height],
                    background: settings.bg,
                    position: 'relative'
                },
                thcss = {
                    width: settings[thumb + (dorotate ? 'Height' : 'Width')],
                    height: settings[thumb + (dorotate ? 'Width' : 'Height')],
                    background: settings[thumb + 'Bg'],
                    position: 'relative',
                    'box-sizing': 'border-box',
                    cursor: 'pointer'
                };
                if (settings.resizable && !$('#sb_thumbres', T).length) {
                    // Only create the resize thumb if we're allowed to resize, and if we haven't already created one
                    th.append('<div id="sb_thumbres" style="width:5px;height:5px;background:#555;cursor:se-resize;' + 
                                                                                    'right:0;bottom:0;position:absolute;"></div>');
                }
                if (x||x===0) {
                    // The user has supplied a x value, move the thumb there
                    thcss['left'] = x;
                }
                if (y||y===0) {
                    // The user has supplied a y value, move the thumb there
                    thcss['top'] = y;
                }
                if (T.s[isViewport]) {
                    // Make the track overflow:hidden if the thumb is larger than the boundaries
                    tcss['overflow'] = 'hidden';
                }
                T[css](tcss);
                th[css](thcss);
                reposition();
            };
            T.render();

            /**
             * Reposition the thumb
             */
            function reposition() {
                var th = T.s[thumb],
                trackheight = T[height](),
                thumbheight = th[height](),
                trackwidth = T[width](),
                thumbwidth = th[width]();
                if (thumbheight > trackheight && T.s[orientation] === 'x') {
                    // The thumb is taller than the track
                    th[css]({
                        top: -(thumbheight - trackheight) / 2
                    });
                }
                if (thumbwidth > trackwidth && T.s[orientation] === 'y') {
                    // The thumb is wider than the track
                    th[css]({
                        left: -(thumbwidth - trackwidth) / 2
                    });
                }
                if (T.s[bounds] === !1 || T['auto' + bounds]) {
                    // If the user has not explicitly set the boundaries, work them out
                    T['auto' + bounds] = !0;
                    T.s[bounds] = {
                        bottom: T[height]() - th[height](),
                        left: 0,
                        top: 0,
                        right: T[width]() - th[width]()
                    };
                }
            }

            /**
             * Reposition viewports
             */
            T.posLT = function() {
                var settings = T.s,
                center = settings.centerThumb,
                th = settings[thumb],
                tr = T[0][getBoundingClientRect](),
                thr = th[0][getBoundingClientRect](),
                orient = settings[orientation],
                axpos = !1,
                aypos = !1,
                centl = (settings[width] - th[width]()) / 2,
                centt = (settings[height] - th[height]()) / 2;
                if (orient === 'x' || orient === '2d') {
                    if (thr.left >= tr.left) {
                        // We have been pulled to the left edge of the container
                        axpos = 0;
                    } else if (thr.right <= tr.right) {
                        // We have been pulled to the right edge of the container
                        axpos = settings[width] - th[width]();
                    }
                    if (axpos !== !1) {
                        th[css]({left: center && centl > 0 ? centl : axpos});
                    }
                }
                if (orient === 'y' || orient === '2d') {
                    if (thr.top >= tr.top) {
                        // We've been pulled to the top edge of the container
                        aypos = 0;
                    } else if (thr.bottom <= tr.bottom) {
                        // We've been pulled to the bottom edge of the container
                        aypos = settings[height] - th[height]();
                    }
                    if (aypos !== !1) {
                        th[css]({top: center && centt > 0 ? centt : aypos});
                    }
                }
            };

            /**
             * The mousemove handler in a seperate function so that it can be unbound later on
             * @param {object(DOMEvent)} e The jQuery event for window.mousemove
             */
            T.wmm = function(e) {
                // Prevent the default dragging behaviour
                e.preventDefault();
                var xpos = e.clientX - T[offset + 'X'],
                ypos = e.clientY - T[offset + 'Y'],
                axpos = 0,
                aypos = 0,
                settings = T.s,
                orient = settings[orientation],
                th = settings[thumb],
                bb = settings[bounds].bottom,
                bl = settings[bounds].left,
                bt = settings[bounds].top,
                br = settings[bounds].right,
                type = 'Normal';
                if (settings[isViewport]) {
                    // We are moving the thumb inside of the track
                    type = 'Viewport';
                    axpos = xpos;
                    aypos = ypos;
                    if (orient === 'x' || orient === '2d') {
                        th[css]({left: axpos});
                    }
                    if (orient === 'y' || orient === '2d') {
                        th[css]({top: aypos});
                    }
                } else if (T.isresize) {
                    // This is a resize of the thumb
                    type = 'Resize';
                    axpos = xpos;
                    aypos = ypos;
                    if (orient === 'x' || orient === '2d') {
                        var nw = T.startDim.width + (axpos - T.startDim.width);
                        if (e.clientX > T.rect.right) {
                            nw = nw - (e.clientX - T.rect.right);
                        } else if (nw <= parseFloat(settings.minResizeWidth)) {
                            nw = settings.minResizeWidth;
                        }
                        th[css]({width: nw});
                    }
                    if (orient === 'y' || orient === '2d') {
                        var nh = T.startDim.height + (aypos - T.startDim.height);
                        if (e.clientY >= T.rect.bottom) {
                            nh = nh - (e.clientY - T.rect.bottom);
                        } else if (nh <= parseFloat(settings.minResizeHeight)) {
                            nh = settings.minResizeHeight;
                        }
                        th[css]({height: nh});
                    }
                } else {
                    // We're doing a normal move
                    if (orient === 'x' || orient === '2d') {
                        if (xpos <= bl) {
                            // Gone too far to the left
                            axpos = bl;
                        } else if (xpos >= br) {
                            // Gone too far to the right
                            axpos = br;
                        } else {
                            axpos = xpos;
                        }
                        th[css]({left: axpos});
                    }
                    if (orient === 'y' || orient === '2d') {
                        if (ypos <= bt) {
                            // Gone too high
                            aypos = bt;
                        } else if (ypos >= bb) {
                            // Gone too low
                            aypos = bb;
                        } else {
                            aypos = ypos;
                        }
                        th[css]({top: aypos});
                    }
                }
                
                var thw = th.width(), 
                thh = th.height(),
                isr = T.isresize,
                ax = isr ? T.thumbRect.left - T.rect.left : axpos,
                ay = isr ? T.thumbRect.top - T.rect.top : aypos;
                settings.onUpdate[call](T, {
                    bounds: T.s[bounds],
                    jqueryEvent: e,
                    originalEvent: e.originalEvent,
                    px: ax / (br - bl),
                    py: ay / (bb - bt),
                    type: type,
                    x: ax,
                    x2: ay + thw,
                    y: ay,
                    y2: ax + thh
                });
            };
            T.mousedown(function(e) {
                // Prevent the default dragging behaviour
                e.preventDefault();
                T.rect = T[0][getBoundingClientRect]();
                T.thumbRect = T.s[thumb][0][getBoundingClientRect]();
                T.isresize = e.target.id === 'sb_thumbres';
                reposition();
                T.startDim = {width: T.s[thumb].width(), height: T.s[thumb].height()};
                var w = $(win),
                off = getOffset(e, T.rect);
                T[offset + 'X'] = off.x;
                T[offset + 'Y'] = off.y;
                w.mousemove(T.wmm);
                w.one('mouseup', function(ev) {
                    // Only allow the mouseup event to fire once
                    w.unbind('mousemove', T.wmm);
                    if (T.s[isViewport]) {
                        T.posLT();
                    }
                    T.isresize = !1;
                    T.s.onFinish[call](T, {
                        bounds: T.s[bounds],
                        originalEvent: ev
                    });
                });
            });
            cache[T.c] = T;
            return T;
        },
        /**
         * Update the settings
         * @param {object(plain)} opts An object in the form {option: value [,...]}
         * @returns {object(jQuery)} The jQuery object that called this function
         */
        updateOpts: function(opts) {
            var T = this;
            if (opts.bounds) {
                T['auto' + bounds] = !1;
            }
            T.s = $.extend($.extend({}, T.s), opts);
            T.render();
            return T;
        },
        /**
         * Reposition the thumb and track
         * @param {object(plain)} opts A plain object in the form {x: float(val), y: float(val)}, which will be used to explicitly 
         *  set the x and y position of the thumb. Both are optional
         * @returns {object(jQuery)} The jQuery object that called this function
         */
        reposition: function (opts) {
            var T = this;
            if (!opts) {
                opts = {};
            }
            T.render(opts.x, opts.y);
            if (T.s[isViewport]) {
                T.posLT();
            }
            return T;
        }
    };

    /**
     * Get the offset of the mouse click
     * @param {object(DOMEvent)} e The original mousedown event
     * @param {object(BoundingClientRect)} rect The bounding client rect of the element that was clicked on
     * @returns {object(plain)} An object with the properties x and y
     */
    function getOffset(e, rect) {
        var t = $(e.target),
        off = t.offset();
        return {
            x: e.pageX - off.left + rect.left,
            y: e.pageY - off.top + rect.top
        };
    }

    /**
     * Get this object from the cache
     * @param {object(jQuery)} elem The object to test
     * @returns {object(jQuery)} Either the jQuery object from the cache, or elem if a cache entry does not exist
     */
    function getThis(elem) {
        var id = elem.attr(sbid);
        return id ? cache[id] : elem;
    }

    /**
     * Create a thumb and track, and depending on what parameters are passed, scroll the thumb in the x or y axis, or even both. You
     *  can also create a viewport where you scroll the thumb inside the viewport
     * @syntax $(selector).streamBoundaries({[opt: val [,...]]}) <br/> $(selector).streamBoundaries(methodname [, {opt: value}])
     * @param {string|object(plain)} methodOrOpts Either the name of the method to run, or the options for the main method
     * @returns {object(jQuery)} The jQuery object that called this function
     */
    $.fn.streamBoundaries = function(methodOrOpts) {
        var T = getThis(this);
        if (methods[methodOrOpts]) {
            // The first option passed is a method, therefore call this method
            return methods[methodOrOpts][apply](T, Array.prototype.slice[call](arguments, 1));
        } else if (Object.prototype.toString[call](methodOrOpts) === '[object Object]' || !methodOrOpts) {
            // The default action is to call the init function
            return methods['init'][apply](T, arguments);
        } else {
            // The user has passed us something dodgy, throw an error
            $.error(['The method ', methodOrOpts, ' does not exist'].join(''));
        }
    };

})(jQuery, this, 0);