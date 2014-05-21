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
            this._renderWorkSpace();
            this._initDnd();
            var editData = this.load();
            this.renderEditor(editData);
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
                comTpl = $('#tpl-com').html();
            _.each(components, function (com) {
                var $com = $(_.template(comTpl, com));
                $comsContainer.append($com);
            });
        },


        /**
         * 渲染工作臺
         */
        _renderWorkSpace: function () {
            //添加Workspace
            this.$workspace = $('<div class="workspace">');
            this.$el.append(this.$workspace);

            var colNum = this.colNum,
                leftSpace = this.leftSpace;
            //初始化 Horizon容器
            var $horizonContainer = $('<div class="horizon-container clearfix">');
            for (var i = 0; i < colNum; i++) {
                var $item = $('<div class="drop-area horizon clearfix"></div>');
                var id = this.idGen('dnd-drop-area');
                $item.attr('id', id);
                leftSpace[id] = colNum;
                $horizonContainer.append($item);
            }
            this.$workspace.append($horizonContainer);
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
                        $view = $com.clone(),
                        size = editor.getSize($com.data('size'));
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
                          .attr('data-width', options.width)
                          .attr('data-type', options.type);
            };
            this.$workspace.find('.drop-area').droppable({
                hoverClass: 'ui-highlight',
                accept: function (draggable) {
                    var sizeCfg = editor.getSizeCfg(draggable.attr('data-size')),
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

                    var draggable = ui.draggable,
                        sizeCfgStr = draggable.attr('data-size'),
                        widthSpace = editor.getSizeCfg(sizeCfgStr).width,
                        type = draggable.data('type'),
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
         * 渲染编辑器
         * @params {Object} 用户保存下来的编辑数据
         */
        renderEditor: function (editData) {
            console.log(editData);
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
                            sectionCfg = { id: section},
                            itemOrderArr;
                        if ($section.hasClass('ui-sortable')) {
                            sectionCfg.type = 'cont';
                            sectionCfg.children = getCfgFromSortable($section);
                        } else {
                            sectionCfg.type = 'item';
                            sectionCfg.className = $section.data('type');
                            sectionCfg.title = $section.find('.title').html();
                        }
                        sectionCfg.width = $section.data('width');
                        data.push(sectionCfg);
                    });
                    return data;
                };
            result.type = 'cont';
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
