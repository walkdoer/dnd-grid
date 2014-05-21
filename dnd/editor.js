(function (window, undefined) {
    'use strict';

    /**----------------
        Global Config
    ------------------*/
    var COLNUM = 3,
        OPACITY = 0.35;


    /**-------------
        内部使用到的函数
     -----------------*/
    function id(idStr) {
        return '#' + idStr;
    }

    /**
     * 界面编辑器
     */
    var Editor = Backbone.View.extend({


        initialize: function (options) {
            this.$el.addClass(options.className);
            this.colNum = options.colNum || COLNUM;
            this.components = options.components;
            this.opacity = options.opacity || OPACITY;
            this.storage = options.storage;
            this.leftSpace = {};
            this.counter = {};
        },


        /**
         * 渲染界面
         */
        render: function () {
            this._renderSideBar();
            var editData = this.load();
            this._renderWorkSpace(editData);
            return this;
        },


        /**
         * 显示
         * 在这个函数中包括了计算宽度的步骤
         */
        show: function () {
            this.$el.show();
            if (!this.itemWidth) {
                this.itemWidth = this.$workspace.width() / this.colNum;
            }
            this.trigger('aftershow');
        },
        

        /**
         * 渲染侧边工具栏
         */
        _renderSideBar: function () {
            var sidebarTpl = $('#tpl-sidebar').html(),
                $sidebar = $(_.template(sidebarTpl, {}));

            this.$el.append((this.$sidebar = $sidebar));
            var $comsContainer = $sidebar.find('.components');
            //取出各个组件
            var components = this.components,
                comTpl = $('#tpl-com').html(),
                comPreviewTpl = $('#tpl-com-preview').html();
            _.each(components, function (com) {
                com.className = com.type;
                var $com = $(_.template(comTpl, com));
                $com.find('.com-drag').append($(_.template(comPreviewTpl, com)));
                $comsContainer.append($com);
            });
        },

        _renderEditData: function (editData) {
            var editor = this,
                template = $('#tpl-com-preview').html(),
                renderFromEditData = function(config, parent) {
                    var $div,
                        $parent;
                    if (config.tag === 'item') {
                        $div = $(_.template(template, config));
                        editor._dropCom($div, config, parent);
                    } else if (config.root){
                        $div = $('<div class="horizon-container clearfix">');
                    } else {
                        $div = $('<div class="drop-area horizon clearfix">');
                        editor.leftSpace[config.id] = editor.colNum;
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
                            $parent.append(renderFromEditData(child, {id: config.id}));
                        });
                    }
                    return $div;
                };
            return renderFromEditData(editData);
        },
        /**
         * 渲染工作臺
         * @params editData {Object} 用户保存下来的编辑数据
         *
         */
        _renderWorkSpace: function (editData) {
            //添加Workspace
            var $workspace;
            this.$workspace = $workspace = $('<div class="workspace">');
            this.$el.append($workspace);

            var colNum = this.colNum,
                leftSpace = this.leftSpace,
                that = this,
                $container;

            if (!editData || !editData.children || !editData.children.length) {
                //初始化 Horizon容器
                $container = $('<div class="horizon-container clearfix">');
                for (var i = 0; i < colNum; i++) {
                    var $item = $('<div class="drop-area horizon clearfix"></div>');
                    var id = this.idGen('dnd-drop-area');
                    $item.attr('id', id);
                    leftSpace[id] = colNum;
                    $container.append($item);
                }
                $workspace.append($container);
                this._initDnd();
            } else {
                //根据用户数据渲染编辑器
                this.on('aftershow', function () {
                    var $result = that._renderEditData(editData);
                    $workspace.append($result);
                    that._initDnd();
                });
                
            }
        },

        _dropCom: function ($drag, cfg, parent) {
            var sizeCfgStr = $drag.attr('data-size'),
                editor = this,
                widthSpace = this.getSizeCfg(sizeCfgStr).width,
                type = $drag.data('type'),
                size = this.getSize(sizeCfgStr),
                widthPercentage = this.getWidthPercentage(sizeCfgStr) * 100 + '%';
            $drag.css({
                height: size.height,
                width: widthPercentage
            });
            $drag.addClass(cfg.className);
            $drag.attr('id', cfg.id)
                 .attr('data-width', widthPercentage);
            this.leftSpace[parent.id] -= widthSpace;
            $drag.on('click', '.close', function () {
                $drag.remove();
                editor.leftSpace[parent.id]+= widthSpace;
            });
        },
        /**
         * 初始化拖拽
         */
        _initDnd: function () {
            var editor = this,
                leftSpace = this.leftSpace;
            this.$sidebar.find('.com-drag').draggable({
                opacity: this.opacity,
                cursor: 'move',
                helper: function () {
                    var $com = $(this),
                        $view = $com.find('.com-preview').clone(),
                        size = editor.getSize($view.data('size'));
                    $view.css(size);
                    return $view;
                }
            });
            var dressUpElement = function ($dragClone, options) {
                $dragClone.css({
                    height: options.height,
                    width: options.width
                });
                $dragClone.addClass(options.cls);
                $dragClone.attr('id', options.id)
                          .attr('data-width', options.width);
            };
            this.$workspace.find('.drop-area').droppable({
                hoverClass: 'ui-highlight',
                accept: function (draggable) {
                    var sizeCfg = editor.getSizeCfg(draggable.find('.com-preview').attr('data-size')),
                        needSpace;
                    if (sizeCfg) {
                        needSpace = sizeCfg.width;
                    } else {
                        return false;
                    }
                    return draggable.hasClass('com-drag') && leftSpace[this.id] >= needSpace;
                },
                drop: function (e, ui) {
                    var that = this,
                        $dragClone = $(ui.draggable).find('.com-preview').clone(),
                        $column = $(e.target);
                    $dragClone.append($column.children().length);
                    $dragClone.on('click', '.close', function () {
                        $dragClone.remove();
                        leftSpace[that.id]+= widthSpace;
                    });

                    var sizeCfgStr = $dragClone.attr('data-size'),
                        widthSpace = editor.getSizeCfg(sizeCfgStr).width,
                        type = $dragClone.data('type'),
                        size = editor.getSize(sizeCfgStr),
                        widthPercentage = editor.getWidthPercentage(sizeCfgStr);
                    dressUpElement($dragClone, {
                        width: widthPercentage * 100 + '%',
                        height: size.height,
                        cls: type,
                        type: type,
                        id: editor.idGen(type)
                    });
                    leftSpace[this.id] -= widthSpace;
                    $column.append($dragClone.removeClass('none'));
                }
            });
            this.$workspace.find('.drop-area.horizon').sortable({
                axis: 'x',
                handle: 'header',
                forceHelperSize: true,
                forcePlaceholderSize: true,
                cursor: 'move',
                opacity: OPACITY,
                placeholder: 'sortable-place-holder'
            });
            this.$workspace.find('.horizon-container').sortable({
                cursor: 'move',
                //containment: 'parent',
                placeholder: 'sortable-place-holder',
                opacity: OPACITY
            });
        },


        /**
         * load
         * 加载用户的配置
         */
        load: function () {
            return JSON.parse(localStorage.getItem(this.storage));
        },


        /**
         * 获取编辑器的编辑数据
         * return {Object}
         */
        getData: function () {
            var result = {},
                getCfgFromSortable = function ($sortable) {
                    var data = [],
                        sectionArr = $sortable.sortable('toArray');
                    _.each(sectionArr, function (section) {
                        var $section = $(id(section)),
                            sectionCfg = { id: section};
                        if ($section.hasClass('ui-sortable')) {
                            sectionCfg.tag = 'cont';
                            sectionCfg.children = getCfgFromSortable($section);
                        } else {
                            var type = $section.data('type');
                            sectionCfg.tag = 'item';
                            sectionCfg.className = type;
                            sectionCfg.type = type;
                            sectionCfg.title = $section.find('.title').html();
                        }
                        sectionCfg.width = $section.data('width');
                        sectionCfg.size = $section.data('size');
                        data.push(sectionCfg);
                    });
                    return data;
                };
            result.tag = 'cont';
            result.root = true;
            result.children = getCfgFromSortable($('.horizon-container'));
            return result;
        },


        /**
         * save
         */
        save: function () {
            var data = this.getData();
            localStorage.setItem(this.storage, JSON.stringify(data));
            return this;
        },


        /**
         * id生成器
         * @return {String}
         */
        idGen: function (prefix, spliter) {
            var counter = this.counter;
            if (!counter[prefix]) {
                counter[prefix] = 1;
            }
            return [prefix, counter[prefix]++].join(spliter || '-');
        },


        /**
         * 获取尺寸的配置
         * @return {Object} {width: 12, height: 13} 
         */
        getSizeCfg: function (cfgStr) {
            var cfg = null;
            if (cfgStr) {
                var arr = cfgStr.split('*');
                cfg = {
                    width: parseFloat(arr[0]) || 0,
                    height: parseFloat(arr[1]) || 0
                };
            }
            return cfg;
        },


        /**
         * 获取尺寸
         */
        getSize: function (cfgStr) {
            var sizeCfg = this.getSizeCfg(cfgStr),
                itemWidth = this.itemWidth,
                width,
                height;

            width = sizeCfg.width * itemWidth;
            height = sizeCfg.height * itemWidth;
            return {
                width: width,
                height: height
            };
        },

        
        /**
         * 获取宽度的比值
         */
        getWidthPercentage: function (cfgStr) {
            var sizeCfg = this.getSizeCfg(cfgStr),
                part = 1/this.colNum;
            return part * sizeCfg.width;
        }
    });

    window.DnDEditor = Editor;

})(window);
