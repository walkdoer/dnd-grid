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
                id = 'dnd-com-field-' + type + '-' + fieldCfg.name,
                $el;
            fieldCfg.id = id;
            if (this[funcName]) {
                $el = this[funcName](fieldCfg);
            }
            var $label;
            if (fieldCfg.text) {
                $label = $(_.template(labelTpl, {id: id, text: fieldCfg.text}))
                $el.prepend($label);
            }
            $el.addClass('dnd-com-config-field');
            $el.attr('data-name', fieldCfg.name);
            return $el;
        },
        
        renderEnum: function (fieldCfg) {
            var display = fieldCfg.display,
                $el = $('<div>');
            var id = "dnd-com-field-enum-" + fieldCfg.name;
                
            if (display === 'dropMenu') {
                var $select = $('<select>');
                $select.attr('name', fieldCfg.name);
                $select.attr('id', id);
                _.each(fieldCfg.items, function (option) {
                    $select.append($(_.template(optionTpl, option)));
                });
                $el.append($select);
            } else if (display === 'radio') {
                 _.each(fieldCfg.items, function (option) {
                    var $radio = $('<input type="radio">'),
                        $label = $(_.template('<span><%= text %></span>', {text: option.text}));
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
                $el = $('<div>'),
                $num = $('<input type="number">').attr('id', fieldCfg.id);
            $num.val(fieldCfg.default || 0);
            $el.append($num);
            return $el;
        },
        
        
        renderCombined: function (fieldCfg) {
            var display = fieldCfg.display,
                $el = $('<div>'),
                that = this;
            _.each(fieldCfg.items, function (field) {
                $el.append(that.renderField(field));
            });
            return $el;
        }
    });

    //export
    window.DnDEditorField = DnDEditorField;

})(window);
