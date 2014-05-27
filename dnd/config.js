(function (window, undefined) {
    'use strict';
    var tpl = '<div class="dnd-com-config">\
            <div class="dnd-com-config-con"></div>\
            <button type="button" class="confirm">确定</button>\
            <button type="button" class="cancel">取消</button>\
        </div>';
    var DnDEditorConfig = Backbone.View.extend({

        initialize: function (options) {
            var $cfg = $(tpl),
                 $con = $cfg.find('.dnd-com-config-con');

             _.each(options, function (field) {
                 var field = new DnDEditorField(field);
                 $con.append(field.render().$el);
             });

             //点击确定，保存配置
             $cfg.on('click', '.confirm', function () {
                 $cfg.hide();
                 //todo save
             });

             //点击取消，关闭配置界面
             $cfg.on('click', '.cancel', function () {
                 $cfg.hide();
             });
             this.setElement($cfg);
        }
    });

    //export
    window.DnDEditorConfig = DnDEditorConfig;

})(window);
