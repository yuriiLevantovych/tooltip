/*plugin tooltip*/
(function($, doc) {
    $.existsN = function(nabir) {
        return nabir.length > 0 && nabir instanceof jQuery;
    };
    $.exists = function(selector) {
        return $(selector).length > 0 && $(selector) instanceof jQuery;
    };
    var methods = {
        index: 0,
        destroy: function() {
            return this.each(function() {
                var $this = $(this);
                if ($this.data('tooltip')) {
                    methods.remove.call($this);
                    $this.removeData('tooltip');
                }
            });
        },
        init: function(options, update) {
            if (!update)
                methods.destroy.call(this);
            this.each(function() {
                if (!options)
                    options = {};
                var $this = $(this),
                        elSet = $this.data(),
                        opt = $this.data('tooltip'),
                        set = opt ? opt : {};
                for (var i in $.tooltip.dP) {
                    var prop = (elSet[i] !== undefined ? elSet[i] : '').toString() || (options[i] !== undefined ? options[i] : '').toString() || $.tooltip.dP[i].toString();
                    if (!isNaN(parseFloat($.tooltip.dP[i])) && isFinite($.tooltip.dP[i]))
                        set[i] = +(prop);
                    else if ($.tooltip.dP[i].toString().toLowerCase() === 'false' || $.tooltip.dP[i].toString().toLowerCase() === 'true')
                        set[i] = /^true$/i.test(prop.toLowerCase());
                    else
                        set[i] = prop;
                }
                set.index = methods.index;

                if (opt)
                    var tooltip = set.tooltip;
                if (!update || !tooltip)
                    tooltip = $('<div class="' + set.tooltipClass + ' ' + set.tooltipClass + set.index + '"></div>').appendTo($('body'));
                set.tooltip = tooltip;
                $this.data('tooltip', set);
                methods._setContent.call(tooltip, set.title);

                $this.data('defaultTriggerOn', false);
                $this.off(set.triggerOn + '.' + $.tooltip.nS).on(set.triggerOn + '.' + $.tooltip.nS, function() {
                    methods.init.call($(this), {show: true});
                });
                $this.data('defaultTriggerOff', false);
                $this.off(set.triggerOff + '.' + $.tooltip.nS).on(set.triggerOff + '.' + $.tooltip.nS, function() {
                    methods.remove.call($(this));
                });

                if (set.otherClass)
                    tooltip.addClass(set.otherClass);
                if (set.type === 'mouse')
                    $this.off('mousemove.' + $.tooltip.nS).on('mousemove.' + $.tooltip.nS, function(e) {
                        tooltip.html(set.title).css({
                            'left': methods._left($(this), tooltip, e.pageX, set),
                            'top': methods._top($(this), tooltip, e.pageY, set)
                        });
                    });
                tooltip.addClass(set.place).css({
                    'left': methods._left($this, tooltip, $this.offset().left, set),
                    'top': methods._top($this, tooltip, $this.offset().top, set)
                });

                if (set.show)
                    methods._show.call($this);

                $this.off('mouseleave.' + $.tooltip.nS).on('mouseleave.' + $.tooltip.nS, function(e) {
                    var el = $(this);
                    if (set.type !== 'always')
                        el.tooltip('remove', e);
                });
                $this.filter(':input').off('blur.' + $.tooltip.nS).on('blur.' + $.tooltip.nS, function(e) {
                    $(this).tooltip('remove', e);
                });
                methods.index++;
            });
            return this;
        },
        show: function() {
            methods.init.call($(this), {show: true});
        },
        _show: function() {
            var set = this.data('tooltip');
            return set.tooltip.stop()[set.effectIn](set.durationOn);
        },
        remove: function() {
            return this.each(function() {
                var $this = $(this),
                        set = $this.data('tooltip');
                $('.' + set.tooltipClass + set.index).stop()[set.effectOff](set.durOff, function() {
                    $(this).remove();
                });
            });
        },
        update: function(opt) {
            return methods.init.call($(this), opt, true);
        },
        _setContent: function(content) {
            return $(this).html(content);
        },
        _left: function(el, tooltip, left, set) {
            if (set.place === 'left')
                return Math.ceil(left - (methods._actual.call(tooltip, 'outerWidth') - set.offsetX));
            if (set.place === 'right')
                return Math.ceil(left + (set.type === 'mouse' ? 0 : el.outerWidth()) + set.offsetX);
            else
                return Math.ceil(left - (set.type === 'mouse' ? set.offsetX : (methods._actual.call(tooltip, 'outerWidth') - el.outerWidth()) / 2));
        },
        _top: function(el, tooltip, top, set) {
            if (set.place === 'top')
                return Math.ceil(top - (methods._actual.call(tooltip, 'outerHeight') - set.offsetY));
            if (set.place === 'bottom')
                return Math.ceil(top + (set.type === 'mouse' ? 0 : el.outerHeight()) + set.offsetY);
            else {
                return Math.ceil(top - (set.type === 'mouse' ? set.offsetY : (methods._actual.call(tooltip, 'outerHeight') - el.outerHeight()) / 2));
            }
        },
        _actual: function() {
            if (arguments.length && typeof arguments[0] === 'string') {
                var dim = arguments[0],
                        clone = this.clone().addClass();
                if (arguments[1] === undefined)
                    clone.css({
                        position: 'absolute',
                        top: '-9999px'
                    }).show().appendTo($('body')).find('*:not([style*="display:none"])').show();
                var dimS = clone[dim]();
                clone.remove();
                return dimS;
            }
            return null;
        }
    };
    $.fn.tooltip = function(method) {
        if (methods[method]) {
            return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments[0]);
        } else {
            $.error('Method ' + method + ' does not exist on $.tooltip');
        }
    };
    $.tooltipInit = function() {
        this.nS = 'tooltip';
        this.method = function(m) {
            if (!/_/.test(m))
                return methods[m];
        };
        this.methods = function() {
            var newM = {};
            for (var i in methods) {
                if (!/_/.test(i))
                    newM[i] = methods[i];
            }
            return newM;
        };
        this.dP = {
            title: '',
            otherClass: '',
            type: '',
            effectIn: 'fadeIn',
            effectOff: 'fadeOut',
            place: 'top',
            offsetX: 0,
            offsetY: 0,
            durationOn: 300,
            durationOff: 200,
            tooltipClass: 'tooltip',
            show: false,
            triggerOn: 'mouseenter',
            triggerOff: 'mouseup'
        };
        this.setParameters = function(options) {
            $.extend(this.dP, options);
            handleDefault();
        };
    };
    $.tooltip = new $.tooltipInit();
    function handleDefault() {
        doc.off($.tooltip.triggerOn + '.' + $.tooltip.nS).on($.tooltip.triggerOn + '.' + $.tooltip.nS, '[data-rel="tooltip"]', function(e) {
            if ($(this).data('defaultTriggerOn') !== false)
                methods.init.call($(this), {show: true});
        }).off($.tooltip.triggerOff + '.' + $.tooltip.nS).on($.tooltip.triggerOff + '.' + $.tooltip.nS, '[data-rel="tooltip"]', function(e) {
            if ($(this).data('defaultTriggerOff') !== false)
                methods.remove.call($(this));
        });
    };
    handleDefault();
})(jQuery, $(document));
/*plugin tooltip end*/