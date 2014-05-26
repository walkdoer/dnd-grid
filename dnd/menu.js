(function (window, undefined) {
    'use strict';

    function renderMenuTree(menuTree, nodeTpl) {
        var childNodes = menuTree.childNodes,
            $ul;

        if (childNodes) {
            $ul = $('<ul>');
            if (!menuTree.root) {
                $ul.addClass('sub-menu');
            }
            _.each(childNodes, function (node) {
                var $li = $(_.template(nodeTpl, node));
                if (node.childNodes) {
                    $li.addClass('sub-menu-toggle');
                    $li.append(renderMenuTree(node, nodeTpl));
                }
                $ul.append($li);
            });
        }
        return $ul;
    }


    var Menu = Backbone.View.extend({
        nodeTpl: '<li><p class="menu-text"><%= text %></p></li>',
        initialize: function (options) {
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
            this.$el.append(renderMenuTree(this.menuTree, this.nodeTpl));
        },
        
        
        _bindEvent: function () {
            this.$el.on('click', '.sub-menu-toggle', function (e) {
                var $menuNode = $(e.currentTarget),
                    $subMenu = $menuNode.find('.sub-menu');
                    
                $subMenu.toggle();
            });
        }
    });

    //export
    window.Menu = Menu;

})(window);
