(function (window, undefined) {
    'use strict';

    var Editor = window.DnDEditor,
        editor = new Editor({
            className: 'editor',
            width: 700,
            components: [
                {type: 'pie', size: '1*0.7', title: '饼图'},
                {type: 'trend', size: '2*1.2', title: '趋势'},
                {type: 'report', size: '3*1.5', title: '报表'},
            ]
        });

    $('body').append(editor.render().$el.hide());
    
    
    $('.toolbar').on('click', '.open-editor', function () {
        editor.show();
    });
})(window);
