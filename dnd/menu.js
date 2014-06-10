/**
 * Menu
 * Backbone菜单组件
 */
(function (window, undefined) {
    'use strict';

    var emptyFunc = function () {};
    function renderMenuTree(menuTree, nodeTpl, leafTpl, level) {
        var childNodes = menuTree.childNodes,
            $ul;

        level++;

        if (childNodes) {
            $ul = $('<ul>');
            if (!menuTree.root) {
                $ul.addClass('menu-sub-menu');
            }
            _.each(childNodes, function (node) {
                var $li;
                node.level = level;
                if (!node.childNodes) {
                    $li = $(_.template(leafTpl, node));
                } else {
                    $li = $(_.template(nodeTpl, node));
                    $li.append(renderMenuTree(node, nodeTpl, leafTpl, level));
                }
                $ul.append($li);
            });
        }
        return $ul;
    }
    var defaultNodeTpl = '<li><p class="menu-sub-menu-toggle menu-text"><%= title %></p></li>';


    var Menu = Backbone.View.extend({
        nodeTpl: defaultNodeTpl,
        leafTpl: defaultNodeTpl,
        initialize: function (options) {
            this.remote = options.remote;
            this.api = options.api;
            if (options.nodeTpl) {
                this.nodeTpl = options.nodeTpl;
            }
            if (options.leafTpl) {
                this.leafTpl = options.leafTpl;
            }
            if (options.$el) {
                this.setElement(options.$el);
            }
            if (options.className) {
                this.$el.addClass(options.className);
            }
            this.menuTree = options.tree;
        },


        /**
         * render
         */
        render: function () {
            var that = this;
            if (this.remote) {
                setTimeout(function () {
                    that.$el.imask();
                    that._loadMenuData(function (tree) {
                        that.$el.unimask();
                        tree.root = true;
                        that._renderMenu(tree);
                    });
                }, 100);
            } else {
                this._renderMenu(this.menuTree);
            }
            this._bindEvent();
            return this;
        },


        _renderMenu: function (menuTree) {
            this.$el.append(renderMenuTree(menuTree, this.nodeTpl, this.leafTpl, 0));
            this.trigger('rendered', this.$el);
        },


        /**
         * bind event
         */
        _bindEvent: function () {
            var menu = this;
            this.$el.on('click', '.menu-sub-menu-toggle', function (e) {
                var $menuNode = $(e.currentTarget).closest('li'),
                    $subMenu = $menuNode.find('>.menu-sub-menu');
                $menuNode.toggleClass('js-menu-opened');
                $subMenu.toggle();
                menu.trigger('click');
            });
        },


        /**
         * 加载数据
         *
         */
        _loadMenuData: function (onSuccess, onError) {
            onSuccess = onSuccess || emptyFunc;
            onError = onError || emptyFunc;
            Backbone.ajax({
                method: 'GET',
                url: this.api,
                success: function (resp) {
                    if (resp.success) {
                        onSuccess(resp.data);
                    } else {
                        onError(resp);
                    }
                },
                error: function () {
                    //todo
                    alert('error');
                    onError();
                }
            });
        }
    });

    //export
    window.Menu = Menu;

})(window);
