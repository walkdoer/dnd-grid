(function (window, undefined) {
    'use strict';

    function renderMenuTree(menuTree, nodeTpl) {
        var childNodes = menuTree.childNodes,
            $ul;

        if (childNodes) {
            $ul = $('<ul>');
            _.each(childNodes, function (node) {
                var $li = $(_.template(nodeTpl, node));
                if (node.childNodes) {
                    $li.append(renderMenuTree(node, nodeTpl));
                }
                $ul.append($li);
            });
        }
        return $ul;
    }


    var Menu = Backbone.View.extend({
        nodeTpl: '<li><p class="menu-text"><%= text %><p></li>',
        initialize: function (options) {
            this.menuTree = options.tree;
        },

        render: function () {
            this._renderMenu();
            return this;
        },


        /**
         * 渲染树结构
         */
        _renderMenu: function () {
            this.$el.append(renderMenuTree(this.menuTree, this.nodeTpl));
        }
    });

    //export
    window.Menu = Menu;

})(window);
