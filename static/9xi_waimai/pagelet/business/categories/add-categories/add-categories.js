define('pagelet/business/categories/add-categories/add-categories.js', function(require, exports, module){ var addCategoriesTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="weui_cells_title">添加种类</div>\n<div class="weui_cells weui_cells_form">\n    <div class="weui_cell">\n        <div class="weui_cell_hd"><label class="weui_label">种类名称</label></div>\n        <div class="weui_cell_bd weui_cell_primary">\n            <input class="categories-name weui_input" type="text" maxlength="8" placeholder="请输入种类名称">\n        </div>\n    </div>\n    <div class="weui_cell">\n        <div class="weui_cell_hd"><label class="weui_label">种类序号</label></div>\n        <div class="weui_cell_bd weui_cell_primary">\n            <input class="categories-order weui_input" type="number" min="0" max="65535" placeholder="请输入种类序号">\n        </div>\n    </div>\n\n</div>\n<div class="weui_btn_area">\n    <a class="add-categories weui_btn weui_btn_primary" href="javascript:" id="showTooltips">确定</a>\n</div>';
}
return __p;
}() )

app.v.AddCategories = Backbone.View.extend({

    id: 'add-categories',

    events: {
        'tap .add-categories': 'addCategories',
    },

    initialize: function() {
        this.listenTo(app.c.categories, "reset", this.render)

        
        this.render()
    },

    render: function() {

        this.$el.html( addCategoriesTmpl() )
        $('.main').html(this.el)
    },

    addCategories: function(e) {
        var categories_name = this.$el.find('.categories-name').val()
        var categories_order = this.$el.find('.categories-order').val()
        if(categories_name == ''){
            util.alert('失败', '菜品种类不能为空')
            return
        }
        if(categories_order == ''){
            util.alert('失败', '菜品序号不能为空')
            return
        }

        $.ajax({
            url: "/categories",
            type: "POST",
            data: {
                name: categories_name,
                order: categories_order

            },
            success: function(data) {
                util.alert('成功', '添加种类成功')
                app.router.navigate("categories", {trigger: true})
            },
            error: function(respon) {
                console.log(respon)
            }
        })
        
    }
}) 
});