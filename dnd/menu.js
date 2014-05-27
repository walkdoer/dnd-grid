(function (window, undefined) {
    'use strict';

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
                $li.addClass('sub-menu-toggle');
                $ul.append($li);
            });
        }
        return $ul;
    }
    var defaultNodeTpl = '<li><p class="menu-text"><%= title %></p></li>'

    var Menu = Backbone.View.extend({
        nodeTpl: defaultNodeTpl,
        leafTpl: defaultNodeTpl,
        initialize: function (options) {
            if (options.nodeTpl) {
                this.nodeTpl = options.nodeTpl;
            }
            if (options.leafTpl) {
                this.leafTpl = options.leafTpl;
            }
            this.menuTree = options.tree;
        },

        render: function () {
            this._renderMenu();
            this._bindEvent();
            return this;
        },


        /**
         * 渲染树结构
         */
        _renderMenu: function () {
            this.$el.append(renderMenuTree(this.menuTree, this.nodeTpl, this.leafTpl));
        },


        _bindEvent: function () {
            this.$el.on('click', '.sub-menu-toggle', function (e) {
                var $menuNode = $(e.currentTarget),
                    $subMenu = $menuNode.find('>.sub-menu');

                $subMenu.toggle();
            });
        }
    });

    //export
    window.Menu = Menu;

})(window);
