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


    /**
     * 界面编辑器
     */
    var Editor = Backbone.View.extend({
        initialize: function (options) {
            this.width = options.width;
            this.colNum = options.colNum || COLNUM;
            this.components = options.components;
            this.opacity = options.opacity || OPACITY;
            this.leftSpace = {};
        },


        /**
         * 渲染界面
         */
        render: function () {
            this._renderSideBar();
            this._renderWorkSpace();
            this._initDnd();
        },


        /**
         * 渲染侧边工具栏
         */
        _renderSideBar: function () {
            var $sidebar = this.$sidebar;
            //添加SideBar
            $sidebar = $('<div class="sidebar">');
            this.$el.append(this.$sidebar);

            //取出各个组件
            var components = this.components,
                comTpl = $('#tpl-com').html();
            components.each(function (index, com) {
                var $com = $(_.template(comTpl, com));
                $sidebar.append($com);
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

        _initDnd: function () {
            var that = this,
                leftSpace = this.leftSpace;
            this.$sidebar.find('.com-drag').draggable({
                opacity: this.opacity,
                cursor: 'move',
                helper: function () {
                    var $com = $(this),
                        size = that.getSize($com.data('size')),
                        $view = $com.find('.com').clone().show();
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
            };
            this.$workspace.find('.drop-area').droppable({
                hoverClass: 'ui-highlight',
                accept: function (draggable) {
                    var sizeCfg = that.getSizeCfg(draggable.attr('data-size')),
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
                        $dragClone = $(ui.draggable).find('.com').clone(),
                        $column = $(e.target);
                    $dragClone.append($column.children().length);
                    $dragClone.on('click', '.close', function () {
                        $dragClone.remove();
                        leftSpace[that.id]+= widthSpace;
                    });

                    var sizeCfgStr = ui.draggable.attr('data-size'),
                        widthSpace = that.getSizeCfg(sizeCfgStr).width,
                        size = that.getSize(sizeCfgStr),
                        widthPercentage = that.getWidthPercentage(sizeCfgStr);
                    dressUpElement($dragClone, {
                        width: widthPercentage * 100 + '%',
                        height: size.height,
                        cls: ui.draggable.data('type')
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
        idGen: function (prefix, spliter) {
            var counter = this.counter;
            if (!counter[prefix]) {
                counter[prefix] = 1;
            }
            return [prefix, counter[prefix]++].join(spliter || '-');
        },
        getSizeCfg: function (cfgStr) {
            var cfg = null;
            if (cfgStr) {
                var arr = cfgStr.split('x');
                cfg = {
                    width: parseFloat(arr[0]) || 0,
                    height: parseFloat(arr[1]) || 0
                };
            }
            return cfg;
        },
        getSize: function (cfgStr) {
            var sizeCfg = this.getSizeCfg(cfgStr),
                itemWidth = this.itemWidth,
                width = sizeCfg.width * itemWidth,
                height = sizeCfg.height * itemWidth;
            return {
                width: width,
                height: height
            };
        },


        getWidthPercentage: function (cfgStr) {
            var sizeCfg = this.getSizeCfg(cfgStr),
                part = 1/this.colNum;
            return part * sizeCfg.width;
        }
    });

    window.DnDEditor = Editor;

})(window);
