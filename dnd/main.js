(function (window, undefined) {
    'use strict';

    var Editor = window.DnDEditor,
        editor = new Editor({
            className: 'editor',
            storage: 'view-data',
            width: 700,
            //拖拽组件之间的空间, 使用percent
            comSpace: 2,
            components: [
                {
                    title: '用户流量',
                    hidden: true,
                    childNodes: [
                        {
                            type: 'pie',
                            size: '1*1',
                            title: '饼图',
                            childNodes: [
                                {type: 'pie', size: '1*1', title: '饼图'},
                                {type: 'trend', size: '2*1', title: '趋势'},
                                {type: 'report', size: '3*1.5', title: '报表'}
                            ]
                        },
                        {type: 'trend', size: '2*1', title: '趋势'},
                        {type: 'report', size: '3*1.5', title: '报表'}
                    ]
                }, {
                    title: '统计分析',
                    disabled: true,
                    childNodes: [
                        {type: 'pie', size: '1*1', title: '饼图'},
                        {type: 'trend', size: '2*1', title: '趋势'},
                        {type: 'report', size: '3*1.5', title: '报表'}
                    ]
                }, {
                    title: '点击区域统计',
                    childNodes: [
                        {type: 'pie', size: '1*1', title: '饼图', disabled: true,},
                        {type: 'trend', size: '2*1', title: '趋势', hidden: true},
                        {type: 'report', size: '3*1.5', title: '报表'}
                    ]
                }
            ],
            cfg: [{
                //类型 enum/number/string
                type: "enum",
                //展现形式 ratio/dropmenu/list
                display: "radio",
                //字段显示名称
                text: "PV/UV",
                //字段名称，对应于数据库字段
                name: "indicator",

                items: [{
                    text: "PV",
                    value: "p"
                }, {
                    text: "UV",
                    value: "u"
                }]
            }, {
                type: "number",
                text: "Top N",
                name: "topN",
                default: 5
            }, {
                name: 'filter',
                text: '过滤条件',
                default: {
                    pv_uv: {
                        operator: 'equal',
                        value: '10'
                    },
                    example: {
                        operator: 'lt',
                        value: 100
                    }
                },
                items: [{
                    name: 'pv',
                    text: 'PV',
                    type: 'combined',
                    items: [{
                        name: 'operator',
                        type: 'enum',
                        display: 'dropMenu',
                        items: [{
                            text: '大于',
                            value: 'bt'
                        }, {
                            text: '等于',
                            value: 'equal'
                        }]
                    }, {
                        type: 'number',
                        name: 'value',
                        default: 0
                    }]
                }, {
                    name: '频率',
                    text: 'pl',
                    type: 'combined',
                    items: [{
                        name: 'operator',
                        type: 'enum',
                        display: 'dropMenu',
                        items: [{
                            text: '大于',
                            value: 'bt'
                        }, {
                            text: '等于',
                            value: 'equal'
                        }]
                    }, {
                        name: 'value',
                        type: 'enum',
                        display: 'dropMenu',
                        items: [{
                            text: '100MHZ',
                            value: '100'
                        }, {
                            text: '1000MHZ',
                            value: '1000'
                        }]
                    }]
                }]
            }]
        });


    /**
     * 从配置中渲染出界面
     */
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
