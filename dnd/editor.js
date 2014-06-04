(function (window, undefined) {
    'use strict';

    /**----------------
        Global Config
    ------------------*/
    var COLNUM = 3,
        ROWNUM = 3,
        DROP_AREA_PREFIX = 'dnd-drop-area',
        EMPTY_FUN = function () {},
        ROW_TPL = '<div class="drop-area horizon clearfix"></div>',
        OPACITY = 0.35;


    /**-------------
        内部使用到的函数
     -----------------*/
    function id(idStr) {
        return '#' + idStr;
    }

    var containerTpl = '<div class="horizon-container clearfix"></div>';


    /**
     * 界面编辑器
     */
    var Editor = Backbone.View.extend({


        /**
         * 初始化配置项
         *
         * colNum: 列数
         * components: 编辑器提供的组件
         * opacity: 拖动时组件的透明度
         * panelSpace: 板块之间的距离
         * cfg
         * previewTpl 组件预览的模板，拖动是看到的Dom元素
         */
        initialize: function (options) {
            this.$el.addClass(options.className);
            this.colNum = options.colNum || COLNUM;
            this.rowNum = options.rowNum || ROWNUM;
            this.components = options.components;
            this.opacity = options.opacity || OPACITY;
            this.storage = options.storage;
            this.comSpace = options.comSpace;
            this.leftSpace = {};
            this.configData = options.cfg;
            this.widthPercent = (100 - this.comSpace * (this.colNum - 1)) / this.colNum;
            this.counter = {};
            //缓存每一个组件的配置视图
            this.configViewCache = {};
            //priview的tpl
            this.previewTpl = options.previewTpl;
            //rowTpl
            this.rowTpl = options.rowTpl || ROW_TPL;
            //记录编辑器状态
            this.status = {};
            //缓存配置
            this.listeners = options.listeners || {};
        },


        /**
         * 渲染界面
         */
        render: function () {
            var that = this;
            this._renderSideBar();
            this.$el.append(this.$loadingView = $('<div class="dnd-editor-loading"></div>'));
            this._setStatus('loading', true);
            this.load(function (editData) {
                that._setStatus('loading', false);
                that._renderWorkSpace(editData);
            });
            return this;
        },


        _setStatus: function (type, value) {
            this.status[type] = value;
            this['$' + type + 'View'][value ? 'show' : 'hide'](value);
        },


        /**
         * 显示
         * 在这个函数中包括了计算宽度的步骤
         */
        show: function () {
            this.$el.show();
            this.trigger('aftershow');
        },



        /**
         * 隐藏
         */
        hide: function () {
            this.$el.hide();
            this.trigger('hidden');
        },


        /**
         * 渲染工具栏
         */
        _createButtons: function () {
            var editor = this,
                $toolbar = $('<header class="dnd-toolbar">'),
                btnTpl = '<button class="dnd-btn dnd-btn-<%= name %>"><%= text %></button>';
            this.buttons = [{
                //save button
                name: 'save',
                text: '保存',
                handler: function () {
                    editor.save();
                }
            }, {
                //add Row button
                name: 'addRow',
                text: '添加行',
                handler: function () {
                    editor.addRow();
                }
            }];
            _.each(this.buttons, function (btn) {
                $toolbar.append(_.template(btnTpl, btn));
                $toolbar.on('click', '.dnd-btn-' + btn.name, btn.handler);
            });

            return $toolbar;
        },


        /**
         * 渲染侧边工具栏
         */
        _renderSideBar: function () {
            var sidebarTpl = '<div class="dnd-editor-sidebar"><ul class="components"></ul></div>',
                that = this,
                leafTpl = '<li>\
                    <div class="com-drag" data-size="<%=size%>" data-type="<%=type%>">\
                        <p class="menu-text"><%= title %></p>\
                    </div>\
                </li>',
                $sidebar = $(_.template(sidebarTpl, {}));

            this.$el.append((this.$sidebar = $sidebar));
            var $comsContainer = $sidebar.find('.components'),
                menuCfg = {
                    leafTpl: leafTpl,
                    nodeTpl: '<li data-statkey="<%=statKey%>" data-template="<%=template%>"><p class="sub-menu-toggle menu-text"><%= title %></p></li>'
                };
            if (typeof this.components === 'string') {
                menuCfg.remote = true;
                menuCfg.api = this.components;
            } else {
                menuCfg.tree = {
                    title: '组件菜单',
                    root: true,
                    childNodes: this.components
                };
            }
            var menu = new Menu(menuCfg).render();

            $comsContainer.append(menu.$el);
            menu.on('rendered', function () {
                var comPreviewTpl = that.previewTpl;
                this.$('.com-drag').each(function (i, com) {
                    var $com = $(com);
                    $com.append($(_.template(comPreviewTpl, {
                        type: $com.data('type'),
                        size: $com.data('size'),
                        title: $com.find('.menu-text').html(),
                        parentTitle: $com.closest('ul').parent().find('>.menu-text').text()
                    })));
                });
                that._initDrag();
            });
        },


        /**
         * 渲染编辑数据
         */
        _renderEditData: function (editData) {
            var editor = this,
                template = this.previewTpl,
                renderFromEditData = function(config, parent) {
                    var $div,
                        $parent;
                    if (config.tag === 'item') {
                        $div = $(_.template(template, config));
                        config.parentId = parent.id;
                        editor._dropCom($div, config);
                    } else if (config.root){
                        $div = $(containerTpl);
                        editor.$workspaceCont = $div;
                    } else {
                        $div = editor.addRow({id: config.id});
                    }
                    $parent = $div;

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
            this.$workspace = $workspace = $('<div class="dnd-editor-workspace">');
            $workspace.append(this._createButtons());
            this.$el.append($workspace);

            if (!editData || !editData.children || !editData.children.length) {
                //初始化 Horizon容器
                this._initWorkSpace($workspace);
            } else {
                //根据用户数据渲染编辑器
                var $result = this._renderEditData(editData);
                this.counter[DROP_AREA_PREFIX] = $result.find('.drop-area').length + 1;
                $workspace.append($result);
                this._initDnd();
            }
        },



        /**
         * 初始化工作台
         *
         * @private
         * @param $workspace
         * @return
         */
        _initWorkSpace: function($workspace) {
            var $container,
                rowNum = this.rowNum;
            //存储工作台主要区域到JS对象中
            this.$workspaceCont = $container = $(containerTpl);
            //添加Row
            for (var i = 0; i < rowNum; i++) {
                this.addRow();
            }
            $workspace.append($container);
            this._initDnd();
        },


        /**
         * addRow
         *
         * 在编辑器增加一行，已提供放置组件的空间
         * @return
         */
        addRow: function (cfg) {
            var leftSpace = this.leftSpace,
                editor = this,
                $container = this.$workspaceCont;
            var $newRow = $(this.rowTpl);
            var id = (cfg && cfg.id) || this.idGen(DROP_AREA_PREFIX);
            $newRow.attr('id', id);
            leftSpace[id] = this.colNum;
            this._initDrop($newRow);
            this._initRowSort($newRow);
            $newRow.on('click', '.js-delete', function () {
                editor.removeRow($newRow);
                $newRow = null;
            });
            $container.append($newRow);
            return $newRow;
        },


        /**
         * removeRow
         *
         * 移除一行
         * @param $row
         * @return
         */
        removeRow: function ($row) {
            //删除剩余空间的记录
            delete this.leftSpace[$row.attr('id')];
            //移除Dom节点
            $row.remove();
        },
        /**
         * 将拖拽元件放入drop area中
         */
        _dropCom: function ($drag, cfg, ui) {
            var beforeDrop = this.listeners.beforeDrop || EMPTY_FUN;
            cfg = beforeDrop.call(this, $drag, cfg, ui);
            var sizeCfgStr = $drag.attr('data-size'),
                editor = this,
                parentId = cfg.parentId,
                cacheId = parentId + cfg.id,
                widthSpace = this.getSizeCfg(sizeCfgStr).width,
                size = this.getSize(sizeCfgStr),
                widthPercentage = this.getWidthPercentage(sizeCfgStr),
                //补充元素宽度
                addUp = (widthSpace - 1) * this.comSpace,
                totalWidth = widthPercentage + addUp + '%';
            $drag.css({
                height: size.height,
                width: totalWidth
            });
            $drag.addClass(cfg.className);
            $drag.attr('id', cfg.id)
                 .attr('data-width', totalWidth);
            this.leftSpace[parentId] -= widthSpace;

            //点击删除按钮
            $drag.on('click', '.dnd-editor-btn-close', function () {
                $drag.remove();
                editor.leftSpace[parentId]+= widthSpace;
            });

            //点击config按钮
            $drag.on('click', '.dnd-editor-btn-config', function () {
                var cfgData = editor.configData,
                    configViewCache = editor.configViewCache,
                    configView;
                $drag.find('.dnd-editor-com-preview-con').toggle();
                if (!(configView = configViewCache[cacheId])) {
                    configViewCache[cacheId] = configView = new DnDEditorConfig(cfgData);
                    $drag.append(configView.$el);
                } else {
                    configView.$el.show();
                }

            });
            cfg.height = size.height;
            this.trigger('dropped', $drag, cfg);
        },


        /**
         * 初始化拖拽
         * init drag and drop
         */
        _initDrop: function ($el) {
            var editor = this,
                leftSpace = this.leftSpace;
            $el.droppable({
                hoverClass: 'ui-highlight',
                accept: function (draggable) {
                    var sizeCfg = editor.getSizeCfg(draggable.find('.dnd-editor-com-preview').attr('data-size')),
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
                        $dragClone = $(ui.draggable).find('.dnd-editor-com-preview').clone(),
                        $column = $(e.target);

                    var sizeCfgStr = $dragClone.attr('data-size'),
                        type = $dragClone.data('type'),
                        size = editor.getSize(sizeCfgStr),
                        widthPercentage = editor.getWidthPercentage(sizeCfgStr);
                    var cfg = {
                        width: widthPercentage + '%',
                        height: size.height,
                        className: type,
                        type: type,
                        id: editor.idGen(type),
                        parentId: that.id
                    };
                    editor._dropCom($dragClone, cfg, ui);
                    $column.append($dragClone);
                }
            });
        },


        /**
         * 初始化drag and drop
         */
        _initDnd: function () {
            this._initDrag();
            this._initWorkSpaceSort();
        },


        /**
         * _initRowSort
         * 初始化列的Sortable
         * @return
         */
        _initRowSort: function ($el) {
            var editor = this,
                leftSpace = this.leftSpace,
                cancel;
            $el.sortable({
                axis: 'x',
                handle: 'header',
                connectWith: '.drop-area.horizon',
                over : function (e, ui) {
                    var sizeCfg = editor.getSizeCfg(ui.helper.attr('data-size'));
                    cancel = false;
                    if (!sizeCfg || leftSpace[this.id] < sizeCfg.width) {
                        ui.sender.sortable('cancel');
                        cancel = true;
                    }
                },
                remove: function (e, ui) {
                    var item = ui.item;
                    if (item && !cancel) {
                        var sizeCfg = editor.getSizeCfg(item.attr('data-size'));
                        leftSpace[this.id] += sizeCfg.width;
                    }
                },
                receive: function (e, ui) {
                    var item = ui.item;
                    if (item && !cancel) {
                        var sizeCfg = editor.getSizeCfg(item.attr('data-size'));
                        leftSpace[this.id] -= sizeCfg.width;
                    }
                },
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
         * _initWorkSpaceSort
         * 初始化行编辑器的Sortable
         * @private
         * @return
         */
        _initWorkSpaceSort: function () {
            this.$workspace.find('.horizon-container').sortable({
                cursor: 'move',
                //containment: 'parent',
                placeholder: 'sortable-place-holder',
                opacity: OPACITY
            });
        },


        /**
         * init Drag
         */
        _initDrag: function () {
            var editor = this,
                beforeDrag = this.listeners.beforeDrag || EMPTY_FUN;
            this.$sidebar.find('.com-drag').draggable({
                opacity: this.opacity,
                cursor: 'move',
                helper: function () {
                    var $com = $(this),
                        $view = $com.find('.dnd-editor-com-preview').clone(),
                        size = editor.getSize($view.data('size'));
                    $view.css(size);
                    beforeDrag.call(this, $view);
                    return $view;
                }
            });
        },


        /**
         * load
         * 加载用户的配置
         */
        load: function (callback) {
            var editData = JSON.parse(localStorage.getItem(this.storage));
            var timer = setTimeout(function () {
                callback(editData);
                //todo remote load config
                clearTimeout(timer);
            }, 400);
        },


        /**
         * 获取编辑器的编辑数据
         * return {Object}
         */
        getData: function () {
            var result = {},
                beforeSave = this.listeners.beforeSave || EMPTY_FUN,
                getCfgFromSortable = function ($sortable) {
                    var data = [],
                        sectionArr = $sortable.sortable('toArray');
                    _.each(sectionArr, function (sectionId) {
                        //排除sectionId为空的异常情况
                        if (!sectionId) {return;}
                        var $section = $sortable.find(id(sectionId)),
                            sectionCfg = { id: sectionId};
                        if ($section.hasClass('ui-sortable')) {
                            sectionCfg.tag = 'cont';
                            sectionCfg.children = getCfgFromSortable($section);
                        } else {
                            var type = $section.data('type');
                            sectionCfg.tag = 'item';
                            sectionCfg.className = type;
                            sectionCfg.type = type;
                            sectionCfg.statKey = $section.data('statKey');
                            sectionCfg.title = $section.find('.title').html();
                        }
                        sectionCfg.width = $section.data('width');
                        sectionCfg.size = $section.data('size');
                        sectionCfg = beforeSave.call($section, sectionCfg);
                        data.push(sectionCfg);
                    });
                    return data;
                };
            result.tag = 'cont';
            result.root = true;
            result.children = getCfgFromSortable($('.editor .horizon-container'));
            return result;
        },


        /**
         * save
         */
        save: function () {
            var data = this.getData();
            localStorage.setItem(this.storage, JSON.stringify(data));
            this.trigger('save', data);
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
                itemWidth = this._getItemWidth(),
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
            var sizeCfg = this.getSizeCfg(cfgStr);
            return this.widthPercent * sizeCfg.width;
        },


        /**
         * 获取拖拽组件的宽度
         */
        _getItemWidth: function () {
            if (this.itemWidth === undefined) {
                this.itemWidth = this.$workspace.width() / this.colNum;
            }
            return this.itemWidth;
        }
    });

    window.DnDEditor = Editor;

})(window);
