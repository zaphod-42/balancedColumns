(function($) {
    //var wrapper = $('#community-wrapper');
    //var width = $(window).innerWidth();
    //var selector = ".post-wrapper";

    $.fn.flex_columns = function(selector, width) {
        $(this).each(function() {
            $(this).data('balancedColumns', new balancedColumns($(this), selector, width, true));
        });
        return $(this);
    }
    function balancedColumns(wrapper, selector, width) {
        this.wrapper = wrapper;

        this.selector = selector;
        this.colWidth = 400;
        this.showDisplayNone();
        this.wrapperWidth = width;
        this.setColCount();
        this.createContainers();
        wrapper.find(selector).appendTo(this.temp_container);
        this.createColumns();
        this.processChildren();
    }


    balancedColumns.prototype.setColCount = function() {
        this.colCount = Math.floor(this.wrapperWidth / this.colWidth);
    }
    balancedColumns.prototype.createContainers = function() {
        if ($('.flex-container', this.wrapper).length == 0)
            $(this.wrapper).append('<div class="flex-container"></div>');
        if ($('.temp-container', this.wrapper).length == 0)
            $(this.wrapper).append('<div class="temp-container"></div>');
        this.container = $('.flex-container', this.wrapper);
        this.temp_container = $('.temp-container', this.wrapper);
    }
    balancedColumns.prototype.createColumns = function() {
        this.colHeights = [];
        $('.flex-column', this.container).remove();
        for (var i = 0; i < this.colCount; i++) {
            this.container.append('<div class="flex-column"></div>');
            this.colHeights.push(0);
        }
    }
    balancedColumns.prototype.processChildren = function() {
        if (this.temp_container.children().length == 0) {
            this.hideDisplayNone();
            return;
        }
        var constr = this;
        var cell = $(this.selector + ':first', this.temp_container);
        if (cell.find('img').length == 0) {
            this.flexAppend(cell);
            return this.processChildren();
        } else {
            cell.find('img:last').one("load error", function(e) {
                if (constr.temp_container.children().length == 0)
                    return;
                if (e.type == 'error' && cell.not('.fixing-image')) {
                    cell.addClass('fixing-image');
                    var old_src = $(this).attr('src');
                    $('img[src$="' + old_src + '"]').attr('src', 'http://s3.amazonaws.com/assets.controleverything.com/styles/user_small_thumbnail/s3/Default_Profile_Picture-150.png?itok=AKmhiEiZ');
                    return constr.processChildren();
                } else {
                    constr.flexAppend(cell);
                    return constr.processChildren();
                }
            }).each(function() {
                if (this.complete)
                    $(this).load();
            });
        }
    }
    balancedColumns.prototype.flexAppend = function(cell) {
        cell.appendTo(this.pickColumn());
    }
    balancedColumns.prototype.pickColumn = function() {
        var heights = [];
        $('.flex-column', this.wrapper).each(function() {
            var block = $(this).find(constr.selector + ':last');
            var height = block.length > 0 ? block.offset().top + block.outerHeight() : 0;
            heights.push([height, $(this)]);
        });
        heights.sort(function(a, b) {
            return a[0] - b[0]
        });
        return heights[0][1];
    }
    balancedColumns.prototype.showDisplayNone = function() {
        var display_css_block = {
            display : 'block',
            visibility : 'hidden',
            position : 'absolute'
        };
        this.display_par = [];
        this.display_css = [];
        var fetch_css = function(par) {
            return {
                display : par.css('display'),
                visibility : par.css('visibility'),
                position : par.css('position')
            };
        };
        var pars = this.wrapper.parents();
        constr = this;
        pars.each(function() {
            if (constr.wrapper.innerWidth() > 0 || this.tagName.toLowerCase() == 'body')
                return false;
            if ($(this).css('display') == 'none') {
                constr.display_css.push(fetch_css($(this)));
                constr.display_par.push($(this).css(display_css_block));
            }
        });
    }
    balancedColumns.prototype.hideDisplayNone = function() {
        for (var i = 0; i < this.display_par.length; i++)
            this.display_par[i].css(this.display_css[i]);
    }
})(jQuery);
