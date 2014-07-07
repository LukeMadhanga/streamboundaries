(function ($, win, count) {
    
    /**
     * A string to access objects with a property or method beginning with 'thumb'. This will allow it to be compressed better
     * @type String
     */
    var thumb = 'thumb',
    width = 'width',
    height = 'height';
    var methods = {
        init: function (opts) {
            var T = this;
            if (T.length > 1) {
                T.each(function () {
                    $.fn.streamBoundaries.apply($(this), arguments);
                });
                return T;
            }
            T.s = $.extend({
                bg: '#DEDEDE',
                bounds: false,
                height: '5px',
                onupdate: function () {},
                thumb: T.find('*:first'),
                thumbBg: '#333',
                thumbHeight: '5px',
                thumbWidth: '10%',
                width: '300px'
            }, opts);
            T.offsetX = 0;
            T.rect = T[0].getBoundingClientRect();
            
            (function () {
                // Self executing
                T.css({width: T.s[width], height: T.s[height], background: T.s.bg, position: 'relative'});
                T.s[thumb].css({
                    width: T.s[thumb + 'Width'], 
                    height: T.s[thumb + 'Height'], 
                    background: T.s[thumb + 'Bg'],
                    position: 'absolute',
                    cursor: 'pointer'
                });
                var trackheight = T[height](),
                thumbheight = T.s[thumb][height]();
                if (thumbheight > trackheight) {
                    // The thumb is taller than the 
                    T.s[thumb].css({
                        top: -(thumbheight - trackheight) / 2
                    });
                }
                T.s.bounds = {left: 0, right: T[width]() - T.s[thumb][width]()};
            })();
            
            T.wmm = function (e) {
                // Prevent the default dragging behaviour
                e.preventDefault();
                var npos = e.clientX - T.offsetX,
                apos,
                bl = T.s.bounds.left,
                br = T.s.bounds.right;
                if (npos <= bl) {
                    // Gone too far to the left
                    apos = bl;
                } else if (npos >= br) {
                    // Gone too far to the right
                    apos = br;
                } else {
                    apos = npos;
                }
                T.s[thumb].css({left: apos});
                T.s.onupdate.call(T, {
                    boundaries: T.s.bounds,
                    percentage: apos / (br - bl),
                    position: apos
                });
            };
            T.mousedown(function (e) {
                // Prevent the default dragging behaviour
                e.preventDefault();
                var w = $(win);
                T.offsetX = getOffset(e, T.rect).x;
                w.mousemove(T.wmm);
                w.one('mouseup', function () {
                    // Only allow the mouseup event to fire once
                    w.unbind('mousemove', T.wmm);
                    T.offsetX = 0;
                });
            });
            T.c = count;
            
            console.log(T);
            count++;
            return T;
        }, 
        /**
         * Update the boundary for this scroller
         * @param {object(plain)} newbounds An object in the form {left: int} or {right: int} or {left: int, right: int}
         */
        updateBounds: function (newbounds) {
            this.s.bounds = $.extend(newbounds, this.s.bounds);
        }
    };
    
    function getOffset(e, rect) {
        var t = $(e.target),
        offset = t.offset();
        console.log(offset, rect);
        return {
            x: e.pageX - offset.left + rect.left,
            y: e.pageY - offset.top + rect.top
        };
    }
    
    $.fn.streamBoundaries = function  (opts) {
        var T = $(this);
        if (methods[opts]) {
            // The first option passed is a method, therefore call this method
            return methods[opts].apply(T, Array.prototype.slice.call(arguments, 1));
        } else if (Object.prototype.toString.call(opts) === '[object Object]' || !opts) {
            // The default action is to call the init function
            return methods['init'].apply(T, arguments);
        } else {
            // The user has passed us something dodgy, throw an error
            $.error(['The method ', opts, 'does not exist in this function'].join(''));
        }
    };
    
})(jQuery, this, 0);