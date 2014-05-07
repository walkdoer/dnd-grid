(function (window, undefined) {
    'use strict';

    //
    var dEl = document.documentElement,
        totalWidth = dEl.clientWidth,
        totalHeight = dEl.clientHeight,
        $container = $('.container'),
        sidebarWidth = 240;

    //初始化布局容器
    $container.height(totalHeight);
    var container = {
        width: $container.width(),
        height: totalHeight
    };
    
    var calculateGrid = function (gridInfo) {
        var width = gridInfo.width,
            height = gridInfo.height;
        
    }

})(window);
