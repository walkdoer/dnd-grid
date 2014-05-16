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
    }, getSize = function (cfgStr) {
        var sizeArr = cfgStr.split('x'),
            widthNum = parseInt(sizeArr[0], 10),
            heightNum = parseInt(sizeArr[1], 10),
            width = widthNum * itemWidth,
            height = heightNum * itemWidth;
        return {
            width: width,
            height: height
        };
    };
    var margin = 2,
        borderWidth = 1,
        itemWidth = (container.width - (margin * colNum * 2 + borderWidth * colNum * 2 + 30))/ colNum;
        
        

    /**------------------------
            1. 初始化布局容器
     --------------------------*/
    $container.height(totalHeight);
    //初始化 Vertical容器
    var $verticalContainer = $('<div class="clearfix">');
    for (var i = 0; i < colNum; i++) {
        var $item = $('<div class="drop-area vertical"></div>').css({
            width: itemWidth,
            border: borderWidth + 'px solid #ccc',
            margin: margin
        });
        var id = idGen('dnd-drop-area');
        $item.attr('id', id);
        $verticalContainer.append($item);
    }
    $container.append($verticalContainer);
    //初始化 Horizon容器
    for (var i = 0; i < colNum; i++) {
        var $item = $('<div class="drop-area horizon"></div>');
        var id = idGen('dnd-drop-area');
        $item.attr('id', id);
        $container.append($item);
    }
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
     
    var dressUpElement = function ($dragClone, helper) {
        $dragClone.css({
            height: helper.height(),
            width: helper.width()
        });
    };
    $('.drop-area').droppable({
        hoverClass: 'ui-highlight',
        containment: '.container',
        drop: function (e, ui) {
            var $dragClone = $(ui.draggable).find('.com').clone(),
                $column = $(e.target);
            $dragClone.append($column.children().length);
            dressUpElement($dragClone, ui.helper);
            $column.append($dragClone.removeClass('none'));
        }
    });
    
    $('.drop-area').sortable({
        connectWith: '.drop-area',
        cursor: 'move',
        containment: '.container',
        placeholder: 'sortable-place-holder',
        grid: [ 20, 10 ]
    });

})(window);
