(function (window, undefined) {
    'use strict';

    //
    var dEl = document.documentElement,
        totalWidth = dEl.clientWidth,
        totalHeight = dEl.clientHeight,
        $container = $('.container'),
        sidebarWidth = 240;

    var colNum = 3;
    var container = {
        width: $container.width(),
        height: totalHeight
    };
    //列宽
    var itemWitdh = container.width / colNum;
    //初始化布局容器
    $container.height(totalHeight);
    for (var i = 0; i < colNum; i++) {
        var $item = $('<div class="drop-area"></div>').css({
            width: itemWitdh
        });
        $container.append($item);
    }
    
    

    
    
    //取出各个组件
    var $components = $('.sidebar .components li');
    
    $components.draggable({
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
    
    $('.container .drop-area').droppable({
        activeClass: 'ui-highlight',
        drop: function (e, ui) {
            var $dragClone = $(ui.draggable).find('.column').clone();
            $(e.target).append($dragClone.removeClass('none'));
        }
    })

})(window);
