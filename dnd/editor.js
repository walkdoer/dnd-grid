(function (window, undefined) {
    'use strict';

    //
    var dEl = document.documentElement,
        totalWidth = dEl.clientWidth,
        totalHeight = dEl.clientHeight,
        $container = $('.editor .container'),
        counter = {},
        /**----------------
            Global Config
        ------------------*/
        COLNUM = 3,
        OPACITY = 0.35;
        SIDE_BAR_WIDTH = 240;


    /**-------------
        内部使用到的函数
     -----------------*/
    var idGen = function (prefix, spliter) {
        if (!counter[prefix]) {
            counter[prefix] = 1;
        }
        return [prefix, counter[prefix]++].join(spliter || '-');
    },
    getSizeCfg = function (cfgStr) {
        var cfg = null;
        if (cfgStr) {
            var arr = cfgStr.split('x');
            cfg = {
                width: parseFloat(arr[0]) || 0,
                height: parseFloat(arr[1]) || 0
            };
        }
        return cfg;
    },
    getSize = function (cfgStr) {
        var sizeCfg = getSizeCfg(cfgStr),
            width = sizeCfg.width * itemWidth,
            height = sizeCfg.height * itemWidth;
        return {
            width: width,
            height: height
        };
    }, getWidthPercentage = function (cfgStr) {
        var sizeCfg = getSizeCfg(cfgStr),
            part = 1/colNum;
        return part * sizeCfg.width;
    };


    /**
     * 界面编辑器
     */
    var Editor = Backbone.View.extend({
        initialize: function (options) {
            this.width = options.width;
            this.colNum = options.colNum || COLNUM;
            this.opacity = options.opacity || OPACITY;
            this.leftSpace = {};
        },
        render: function () {
            
        },
        

        /**
         * 渲染侧边工具栏
         */
        _renderSideBar: function () {
            
        },


        /**
         * 渲染工作臺
         */
        _renderWorkSpace: function () {
            
        }
    });    
   
    var container = {
        width: $container.width(),
        height: totalHeight
    };
    
    var padding = 10,
        //拖拽元素的邊框寬度
        dragObjBorderWidth = 1,
        itemWidth = (container.width + padding * 2)/ colNum;
        
        
    var leftSpace = {};
    /**------------------------
            1. 初始化布局容器
     --------------------------*/
    $container.height(totalHeight);
    //初始化 Vertical容器
//     var $verticalContainer = $('<div class="vertical-container clearfix">');
//     for (var i = 0; i < colNum; i++) {
//         var $item = $('<div class="drop-area vertical clearfix"></div>').css({
//             width: itemWidth,
//             border: borderWidth + 'px solid #ccc',
//             margin: margin
//         });
//         var id = idGen('dnd-drop-area');
//         $item.attr('id', id);
//         $verticalContainer.append($item);
//     }
//     $container.append($verticalContainer);
    //初始化 Horizon容器
    var $horizonContainer = $('<div class="horizon-container clearfix">');
    for (var i = 0; i < colNum; i++) {
        var $item = $('<div class="drop-area horizon clearfix"></div>');
        var id = idGen('dnd-drop-area');
        $item.attr('id', id);
        leftSpace[id] = colNum;
        $horizonContainer.append($item);
    }
    $container.append($horizonContainer);
    //取出各个组件
    var $components = $('.sidebar .components li'),
        comTpl = $('#tpl-com').html();
    $components.each(function (index, com) {
        var $com = $(com),
            $view = $(_.template(comTpl, {
                title: $com.html()
            }));
        
        $com.append($view);
    });
    $components.draggable({
        opacity: OPACITY,
        cursor: 'move',
        helper: function () {
            var $com = $(this),
                size = getSize($com.data('size')),
                $view = $com.find('.com').clone().show();
            $view.css(size);
            return $view;
        }
    });
    /**------------------------
            2. 初始化DnD
     --------------------------*/
     
    var dressUpElement = function ($dragClone, options) {
        $dragClone.css({
            height: options.height,
            width: options.width
        });
        $dragClone.addClass(options.cls);
    };
    $('.drop-area').droppable({
        hoverClass: 'ui-highlight',
        accept: function (draggable) {
            var sizeCfg = getSizeCfg(draggable.attr('data-size')),
                needSpace;
            if (sizeCfg) {
                needSpace = sizeCfg.width;
            } else {
                return false;
            }
            return draggable.hasClass('com-drag') && leftSpace[this.id] >= needSpace;
        },
        drop: function (e, ui) {
            var that = this,
                $dragClone = $(ui.draggable).find('.com').clone(),
                $column = $(e.target);
            $dragClone.append($column.children().length);
            $dragClone.on('click', '.close', function () {
                $dragClone.remove();
                leftSpace[that.id]+= widthSpace;
            });
            
            var sizeCfgStr = ui.draggable.attr('data-size'),
                widthSpace = getSizeCfg(sizeCfgStr).width,
                size = getSize(sizeCfgStr),
                widthPercentage = getWidthPercentage(sizeCfgStr);
            dressUpElement($dragClone, {
                width: widthPercentage * 100 + '%',
                height: size.height,
                cls: ui.draggable.data('type')
            });
            leftSpace[this.id] -= widthSpace;
            $column.append($dragClone.removeClass('none'));
        }
    });
    
//     $('.drop-area.vertical').sortable({
//         handle: 'header',
//         connectWith: '.drop-area.vertical',
//         cursor: 'move',
//         //containment: 'parent',
//         placeholder: 'sortable-place-holder',
//         opacity: 0.3,
//     });
    $('.drop-area.horizon').sortable({
        axis: 'x',
        handle: 'header',
        //containment: 'parent',
        forceHelperSize: true,
		forcePlaceholderSize: true,
        cursor: 'move',
        opacity: OPACITY,
        placeholder: 'sortable-place-holder'
    });
    $('.horizon-container').sortable({
        cursor: 'move',
        //containment: 'parent',
        placeholder: 'sortable-place-holder',
        opacity: OPACITY
    });

})(window);
