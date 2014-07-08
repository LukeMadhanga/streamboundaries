(function ($, win, count) {
    
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
    cache = {},
    methods = {
        init: function (opts) {
            var T = this;
            if (!T.length) {
                // There is no object, return
                return T;
            }
            if (T.length > 1) {
                // The selector matched more than one object, apply this function each individually
                T.each(function () {
                    $.fn.streamBoundaries[apply]($(this), arguments);
                });
                return T;
            }
            var prop = {},
            ef = function () {};
            T.s = $.extend({
                autoRotate: !0,
                bg: '#DEDEDE',
                bounds: !1,
                height: '5px',
                onFinish: ef,
                onUpdate: ef,
                orientation: 'x',
                thumb: T.find('*:first'),
                thumbBg: '#333',
                thumbHeight: '5px',
                thumbIsLarger: !1,
                thumbWidth: '10%',
                width: '300px'
            }, opts);
            T[offset + 'X'] = 0;
            T[offset + 'Y'] = 0;
            T['auto'+bounds] = !1;
            T.c = ++count;
            prop[sbid] = T.c;
            T.attr(prop);
            
            T.render = function () {
                var settings = T.s,
                th = settings[thumb],
                xscroll = settings[orientation] === 'x',
                dorotate =  xscroll && settings.autoRotate;
                T[css]({
                    width: settings[dorotate ? width : height], 
                    height: settings[dorotate ? height : width], 
                    background: settings.bg, 
                    position: 'relative'
                });
                th[css]({
                    width: settings[thumb + (dorotate ? 'Width' : 'Height')], 
                    height: settings[thumb + (dorotate ? 'Height' : 'Width')], 
                    background: settings[thumb + 'Bg'],
                    position: 'absolute',
                    cursor: 'pointer'
                });
                reposition();
            };
            T.render();            
            
            /**
             * Reposition the thumb
             */
            function reposition () {
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
                if (T.s[bounds] === !1 || T['auto'+bounds]) {
                    // If the user has not explicitly set the boundaries, work them out
                    T['auto'+bounds] = !0;
                    T.s[bounds] = {
                        bottom: T[height]() - th[height](),
                        left: 0, 
                        top: 0,
                        right: T[width]() - th[width]()
                    };
                }
            };
            
            /**
             * The mousemove handler in a seperate function so that it can be unbound later on
             * @param {object(DOMEvent)} e The jQuery event for window.mousemove
             */
            T.wmm = function (e) {
                // Prevent the default dragging behaviour
                e.preventDefault();
                var xpos = e.clientX - T[offset + 'X'],
                ypos = e.clientY - T[offset + 'Y'],
                axpos = 0,
                aypos = 0,
                settings = T.s,
                orient = settings[orientation];
                if (settings.thumbIsLarger) {
                    // The thumb is larger than the track
                    axpos = xpos;
                    aypos = ypos;
                    if (orient==='x'||orient==='2d') {
                        settings[thumb][css]({left: axpos});
                    }
                    if (orient==='y'||orient==='2d') {
                        settings[thumb][css]({top: aypos});
                    }
                } else {
                    var bb = settings[bounds].bottom,
                    bl = settings[bounds].left,
                    bt = settings[bounds].top,
                    br = settings[bounds].right;
                    if (orient==='x'||orient==='2d') {
                        if (xpos <= bl) {
                            // Gone too far to the left
                            axpos = bl;
                        } else if (xpos >= br) {
                            // Gone too far to the right
                            axpos = br;
                        } else {
                            axpos = xpos;
                        }
                        settings[thumb][css]({left: axpos});
                    }
                    if (orient==='y'||orient==='2d') {
                        if (ypos <= bt) {
                            // Gone too high
                            aypos = bt;
                        } else if (ypos >= bb) {
                            // Gone too low
                            aypos = bb;
                        } else {
                            aypos = ypos;
                        }
                        settings[thumb][css]({top: aypos});
                    }
                }
                settings.onUpdate[call](T, {
                    bounds: T.s[bounds],
                    originalEvent: e,
                    px: axpos / (br - bl),
                    py: aypos / (bb - bt),
                    x: axpos,
                    y: aypos
                });
            };
            T.mousedown(function (e) {
                // Prevent the default dragging behaviour
                e.preventDefault();
                reposition();
                T.rect = T[0][getBoundingClientRect]();
                var w = $(win),
                off = getOffset(e, T.rect);
                T[offset + 'X'] = off.x;
                T[offset + 'Y'] = off.y;
                w.mousemove(T.wmm);
                w.one('mouseup', function () {
                    // Only allow the mouseup event to fire once
                    w.unbind('mousemove', T.wmm);
                    if (T.s.thumbIsLarger) {
                        var tr = T[0][getBoundingClientRect](),
                        thr = T.s[thumb][0][getBoundingClientRect](),
                        settings = T.s,
                        orient = settings[orientation],
                        axpos= !1,
                        aypos= !1;
                        if (orient==='x'||orient==='2d') {
                            if (thr.left >= tr.left) {
                                // We have been pulled to the left edge of the container
                                axpos = 0;
                            } else if (thr.right <= tr.right) {
                                // We have been pulled to the right edge of the container
                                axpos = settings[width] - settings[thumb][width]();
                            }
                            if (axpos !== !1) {
                                settings[thumb][css]({left: axpos});
                            }
                        }
                        if (orient === 'y' || orient === '2d') {
                            if (thr.top >= tr.top) {
                                // We've been pulled to the top edge of the container
                                aypos = 0;
                            } else if (thr.bottom <= tr.bottom) {
                                // We've been pulled to the bottom edge of the container
                                aypos = settings[height] - settings[thumb][height]();
                            }
                            if (aypos !== !1) {
                                settings[thumb][css]({top: aypos});
                            }
                        }
                    }
                    T.s.onUpdate[call](T, {
                        bounds: T.s[bounds],
                        originalEvent: e
                    });
                });
            });
            cache[T.c] = T;
            return T;
        }, 
        /**
         * Update the settings
         * @param {object(plain)} newbounds An object in the form {option: value [,...]}
         */
        updateOpts: function (opts) {
            var T = this;
            if (opts.bounds) {
                T['auto'+bounds] = !1;
            }
            T.s = $.extend($.extend({}, T.s), opts);
            T.render();
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
    
    function getThis(elem) {
        var id = elem.attr(sbid);
        return id ? cache[id] : elem;
    }
    
    $.fn.streamBoundaries = function  (opts) {
        var T = getThis(this);
        if (methods[opts]) {
            // The first option passed is a method, therefore call this method
            return methods[opts][apply](T, Array.prototype.slice[call](arguments, 1));
        } else if (Object.prototype.toString[call](opts) === '[object Object]' || !opts) {
            // The default action is to call the init function
            return methods['init'][apply](T, arguments);
        } else {
            // The user has passed us something dodgy, throw an error
            $.error(['The method ', opts, ' does not exist'].join(''));
        }
    };
    
})(jQuery, this, 0);