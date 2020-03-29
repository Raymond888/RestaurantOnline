define('pagelet/business/categories/edit-categories/edit-categories.js', function(require, exports, module){ var editCategoriesTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="weui_cells_title">修改菜品种类</div>\n<div class="weui_cells weui_cells_form">\n    <div class="weui_cell">\n        <div class="weui_cell_hd"><label class="weui_label">种类名称</label></div>\n        <div class="weui_cell_bd weui_cell_primary">\n            <input class="categories-name weui_input" type="text" maxlength="8" placeholder="请输入种类名称" value="{{name}}">\n        </div>\n    </div>\n    <div class="weui_cell">\n        <div class="weui_cell_hd"><label class="weui_label">种类序号</label></div>\n        <div class="weui_cell_bd weui_cell_primary">\n            <input class="categories-order weui_input" type="number" min="0" max="65535" placeholder="请输入种类序号" value="{{order}}">\n        </div>\n    </div>\n\n</div>\n<div class="weui_btn_area">\n    <a class="edit-categories weui_btn weui_btn_primary" href="javascript:" id="showTooltips">确定</a>\n</div>';
}
return __p;
}() )

app.v.EditCategories = Backbone.View.extend({

    id: 'edit-categories',

    events: {
        'tap .edit-categories': 'editCategories',
    },

    initialize: function(options) {
        this.categories_id = options.categories_id
        this.listenTo(app.c.categories, "reset", this.render)

        
        this.render()
    },

    render: function() {
        var categories_id = this.categories_id
        var data = {}

        $.ajax({
            url: "/categories/" + categories_id,
            type: "get",
            async: false,
            success: function(reps) {
                data = reps
            },
            error: function(respon) {
                console.log(respon)
            }
        })
        this.$el.html( editCategoriesTmpl(data) )
        $('.main').html(this.el)
    },

    editCategories: function(e) {
        var categories_id = this.categories_id
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
            url: "/categories/" + categories_id,
            type: "PUT",
            data: {
                name: categories_name,
                order: categories_order

            },
            success: function(data) {
                util.alert('成功', '修改种类成功')
                app.router.navigate("categories", {trigger: true})
            },
            error: function(respon) {
                console.log(respon)
            }
        })
        
    }
}) 
});