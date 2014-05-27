/**
 * Menu
 * Backbone菜单组件
 */
(function (window, undefined) {
    'use strict';

    var emptyFunc = function () {};
    function renderMenuTree(menuTree, nodeTpl, leafTpl) {
        var childNodes = menuTree.childNodes,
            $ul;

        if (childNodes) {
            $ul = $('<ul>');
            if (!menuTree.root) {
                $ul.addClass('sub-menu');
            }
            _.each(childNodes, function (node) {
                var $li;
                if (!node.childNodes) {
                    $li = $(_.template(leafTpl, node));
                } else {
                    $li = $(_.template(nodeTpl, node));
                    $li.append(renderMenuTree(node, nodeTpl, leafTpl));
                }
                $ul.append($li);
            });
        }
        return $ul;
    }
    var defaultNodeTpl = '<li><p class="sub-menu-toggle menu-text"><%= title %></p></li>';


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
            this.menuTree = options.tree;
        },


        /**
         * render
         */
        render: function () {
            var that = this;
            if (this.remote) {
                this._loadMenuData(function (tree) {
                    tree.root = true;
                    that._renderMenu(tree);
                });
            } else {
                this._renderMenu(this.menuTree);
            }
            this._bindEvent();
            return this;
        },


        /**
         * 渲染树结构
         */
        _renderMenu: function (menuTree) {
            this.$el.append(renderMenuTree(menuTree, this.nodeTpl, this.leafTpl));
            this.trigger('rendered', this.$el);
        },


        /**
         * bind event
         */
        _bindEvent: function () {
            this.$el.on('click', '.sub-menu-toggle', function (e) {
                var $menuNode = $(e.currentTarget).closest('li'),
                    $subMenu = $menuNode.find('>.sub-menu');

                $subMenu.toggle();
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
