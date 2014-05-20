(function (window, undefined) {
    'use strict';

    var Editor = window.DnDEditor,
        editor = new Editor({
            className: 'editor',
            width: 700,
            components: [
                {type: 'pie', size: '1*1', title: '饼图'},
                {type: 'trend', size: '2*1', title: '趋势'},
                {type: 'report', size: '3*1.5', title: '报表'},
            ]
        });

    $('body').append(editor.render().$el.hide());
    
    
    $('.toolbar').on('click', '.open-editor', function () {
        editor.show();
    });
    
    $('.toolbar').on('click', '.save', function () {
        var data = editor.getData();
        localStorage.setItem('view-data', JSON.stringify(data));
    });
})(window);
