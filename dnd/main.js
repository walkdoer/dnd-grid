(function (window, undefined) {
    'use strict';

    var Editor = window.DnDEditor,
        editor = new Editor({
            className: 'editor',
            storage: 'view-data',
            width: 700,
            components: [
                {type: 'pie', size: '1*1', title: '饼图'},
                {type: 'trend', size: '2*1', title: '趋势'},
                {type: 'report', size: '3*1.5', title: '报表'},
            ]
        });

    var $body = $('body').append(editor.render().$el.hide());


    $('.toolbar').on('click', '.open-editor', function () {
        editor.show();
    });

    $('.toolbar').on('click', '.save', function () {
        editor.save();
    });


    var template = $('#tpl-com-r').html();

    function renderFromConfig(config) {
        if (!config) { return; }
        var $div,
            $parent;
        if (config.type === 'item') {
            $div = $(_.template(template, {
                title: config.title,
                className: config.className
            }));
        } else {
            $div = $('<div>');
        }
        $parent = $div;
        if (config.class) {
            $div.addClass(config.class);
        }
        if (config.id) {
            $div.attr('id', config.id);
        }
        if (config.width) {
            $div.css('width', config.width);
        }
        var children = config.children;
        if (children && children.length > 0) {
            _.each(children, function (child) {
                $parent.append(renderFromConfig(child));
            });
        }
        return $div;
    }
    $body.append(renderFromConfig(editor.load()));
})(window);
