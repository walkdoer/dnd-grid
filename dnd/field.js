(function (window, undefined) {
    'use strict';

    var optionTpl = '<option value="<%= value %>"><%= text %></option>',
        labelTpl = '<label for="<%= id %>"><%= text%></label>';
    var DnDEditorField = Backbone.View.extend({
        
        initialize: function (options) {
            this.type = options.type;
            this.options = options;
        },

        render: function () {
            var $el = this.renderField(this.options);
            if ($el) {
                this.setElement($el);
            }
            return this;
        },
        
        renderField: function (fieldCfg) {
            var type = fieldCfg.type,
                funcName = 'render' + type.toUpperCase().substr(0, 1) + type.substr(1),
                $el;
            if (this[funcName]) {
                $el = this[funcName](fieldCfg);
            }
            return $el;
        },
        
        renderEnum: function (fieldCfg) {
            var display = fieldCfg.display,
                $el = $('<div>');
            var id = "dnd-com-field-enum" + fieldCfg.name,
                $label = $(_.template(labelTpl, {id: id, text: fieldCfg.text}));
            if (display === 'dropMenu') {
                var $select = $('<select>');
                $select.attr('name', fieldCfg.name);
                $select.attr('id', id);
                _.each(fieldCfg.items, function (option) {
                    $select.append($(_.template(optionTpl, option)));
                });
                $el.append([$label, $select]);
            } else if (display === 'radio') {
                 $el.append($label);
                 _.each(fieldCfg.items, function (option) {
                    var $radio = $('<input type="radio">'),
                        $label = $(_.template(labelTpl, {id: '', text: option.text}));
                    $radio.attr('name', fieldCfg.name);
                    $el.append([$radio, $label]);
                });
            }
            return $el;
        },
        
        
        /**
         * 渲染Number
         */
        renderNumber: function (fieldCfg) {
            var display = fieldCfg.display,
                $el = $('<div>');
            var id = "dnd-com-field-number" + fieldCfg.name,
                $label = $(_.template(labelTpl, {id: id, text: fieldCfg.text})),
                $num = $('<input type="number">').attr('id', id);
            $num.val(fieldCfg.default || 0);
            $el.append([$label, $num]);
            return $el;
        },
        
        
        renderCombined: function (fieldCfg) {
            var display = fieldCfg.display,
                $el = $('<div>');
            var id = "dnd-com-field-combined" + fieldCfg.name,
                that = this,
                $label = $(_.template(labelTpl, {id: id, text: fieldCfg.text}));
            $el.append($label);    
            _.each(fieldCfg.items, function (field) {
                $el.append(that.renderField(field));
            });
            return $el;
        },


        /**
         * 渲染列表
         */
        renderList: function (fieldCfg) {
            var display = fieldCfg.display,
                $el = $('<div>');
            var id = "dnd-com-field-list" + fieldCfg.name,
                $label = $(_.template(labelTpl, {id: id, text: fieldCfg.text}));
                
            _.each(fieldCfg.items, function (option) {
                
            });
            
            $el.append($label);
            return $el;
        }
    });

    //export
    window.DnDEditorField = DnDEditorField;

})(window);
