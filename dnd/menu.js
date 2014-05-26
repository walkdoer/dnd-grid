(function (window, undefined) {
    'use strict';

    function renderMenuTree(menuTree, nodeTpl, $parent) {
        var childNodes = menuTree.childNodes;

        _.each(childNodes, function (node) {
            var $li = $(_.template(this.nodeTpl, node));
            if (node.childNodes) {
                $li.append(renderMenuTree(node), nodeTpl, $li);
            }
            $parent.append($li);
        });
    }


    var Menu = Backbone.View.extend({
        tagName: 'ul',
        nodeTpl: '<li><p class="menu-text"><%= text %><p></li>',
        initialize: function (options) {
            this.menuTree = options.tree;
        },
        render: function () {
            this._renderMenu();
        },


        /**
         * 渲染树结构
         */
        _renderMenu: function () {
            renderMenuTree(this.menuTree, this.nodeTpl);
        }
    });

    //export
    window.Menu = Menu;

})(window);
