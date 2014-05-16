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
    };
    var margin = 2,
        dropAreaList = [],
        borderWidth = 1,
        itemWitdh = (container.width - (margin * colNum * 2 + borderWidth * colNum * 2))/ colNum;
    //初始化布局容器
    $container.height(totalHeight);
    for (var i = 0; i < colNum; i++) {
        var $item = $('<div class="drop-area"></div>').css({
            width: itemWitdh,
            border: borderWidth + 'px solid #ccc',
            margin: margin
        });
        var id = idGen('dnd-drop-area');
        $item.attr('id', id);
        dropAreaList.push('#' + id);
        $container.append($item);
    }
    //取出各个组件
    var $components = $('.sidebar .components li');
    $components.draggable({
        opacity: 0.35,
        helper: function () {
            var $com = $(this),
                sizeArr = $com.data('size').split('x'),
                $view = $com.find('.column').clone().show(),
                width = sizeArr[0],
                height = sizeArr[1];
            console.log(width, height);
            $view.css({
                width: itemWitdh * width,
                height: 100
            });
            return $view;
        }
    });
    
    $('.drop-area').droppable({
        hoverClass: 'ui-highlight',
        drop: function (e, ui) {
            var $dragClone = $(ui.draggable).find('.column').clone();
            $(e.target).append($dragClone.removeClass('none'));
        }
    });

})(window);
