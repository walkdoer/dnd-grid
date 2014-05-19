(function (window, undefined) {
    'use strict';

    //
    var dEl = document.documentElement,
        totalWidth = dEl.clientWidth,
        totalHeight = dEl.clientHeight,
        $container = $('.container'),
        counter = {},
        sidebarWidth = 240;

    var colNum = 3;
    var container = {
        width: $container.width(),
        height: totalHeight
    };
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
        opacity: 0.35,
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
            var $dragClone = $(ui.draggable).find('.com').clone(),
                $column = $(e.target);
            $dragClone.append($column.children().length);
            $dragClone.on('click', '.close', function () {
                $dragClone.remove();
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
        opacity: 0.5,
        placeholder: 'sortable-place-holder',
    });
    $('.horizon-container').sortable({
        cursor: 'move',
        //containment: 'parent',
        placeholder: 'sortable-place-holder',
        opacity: 0.3,
    });

})(window);
