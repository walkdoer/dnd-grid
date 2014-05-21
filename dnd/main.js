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
    function renderFromConfig(config) {
        if (!config) { return; }
        var $div,
            $parent;
        if (config.tag === 'item') {
            $div = $(_.template(template, {
                title: config.title,
                className: config.className
            }));
        } else {
            $div = $('<div class="clearfix">');
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
    var $body = $('body').append(editor.render().$el.hide());

    //打开编辑器
    $('.toolbar').on('click', '.open-editor', function () {
        $('.preview').hide();
        editor.show();
    });
    //保存编辑器数据
    $('.toolbar').on('click', '.save', function () {
        $('.preview').show();
        editor.save().hide();
    });
    //监听保存事件，重新渲染界面
    editor.on('save', function (data) {
        $('.preview').empty()
                     .append(renderFromConfig(data));
    });
    var template = $('#tpl-com-r').html();
    $body.find('.preview').append(renderFromConfig(editor.load()));

})(window);
