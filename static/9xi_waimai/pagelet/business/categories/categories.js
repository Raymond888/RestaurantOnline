define('pagelet/business/categories/categories.js', function(require, exports, module){ var categoriesTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="weui_cells_title">\n    菜品种类\n    <button class="add-categories weui_btn weui_btn_warn">添加种类</button>\n</div>\n<div class="categories-list">\n\t<div class="weui_cells weui_cells_access">\n        {{#each categories}}\n            <a class="weui_cell" href="#/eidtCategories/{{id}}">\n                <div class="weui_cell_bd weui_cell_primary">\n                    <p >{{name}}</p>\n                </div>\n                <div class="weui_cell_ft">\n                </div>\n            </a>\n        {{/each}}\n    </div>\n\n</div>';
}
return __p;
}() )

app.v.Categories = Backbone.View.extend({

    id: 'categories',

    events: {
        'tap .add-categories': 'addCategories',
    },

    initialize: function() {
        this.listenTo(app.c.categories, "reset", this.render)

        app.c.categories.fetch({reset: true})
        //this.render()
    },

    render: function() {
        var categories = app.c.categories.toJSON()[0]

        this.$el.html( categoriesTmpl(categories) )
        $('.main').html(this.el)
    },

    addCategories: function(e) {
        app.router.navigate("addCategories", {trigger: true})
    }
}) 
});