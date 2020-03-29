define('pagelet/business/products/products.js', function(require, exports, module){ var productsTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="products-title">\n\t<span>选择</span>\n\t<div class="action">\n\t\t<button class="add-product weui_btn weui_btn_warn">添加新菜</button>\n\t\t<button class="categories weui_btn weui_btn_warn">分类管理</button>\n\t</div>\n\n</div>\n\n<div class="products-list">\n\t<div class="weui_cells weui_cells_checkbox">\n\t\t{{#each product_list}}\n\t\t<label class="weui_cell weui_check_label" for="s{{id}}" data-id = {{id}}>\n\t        <div class="weui_cell_hd">\n\t            <input type="checkbox" class="weui_check" name="checkbox1" id="s{{id}}">\n\t            <i class="weui_icon_checked"></i>\n\t        </div>\n\t        <div class="weui_cell_bd weui_cell_primary">\n\t            <img src="{{pic_url}}" alt="http://7xqzzf.com5.z0.glb.clouddn.com/logo.jpg">\n\t            <div class="product-detail">\n\t            \t<div class="product-name">{{name}}</div>\n\t            \t<div class="produc-price">${{formatPrice price}}/份</div>\n\t            </div>\n\t        </div>\n        </label>\n\t\t{{/each}}\n    </div>\n\n</div>';
}
return __p;
}() )

app.v.Products = Backbone.View.extend({

    id: 'products',

    events: {
        'tap .add-product': 'addProduct',
        'tap .weui_cell': 'editProduct',
        'tap .categories': 'goCategories'
    },

    initialize: function() {
        this.listenTo(app.c.products, "reset", this.render)

        app.c.products.fetch({reset: true})
    },

    render: function() {
        var data = {}
        var products = app.c.products.toJSON()[0]
        //var products = _.flatten(_.map(products, _.values))
        var product_list = []
        _.each(products.products, function(product){
            if((_.values(product))[0].length != 0){
                var type = _.keys(product)
                _.each((_.values(product))[0], function(product){
                    product.type = type[0]
                    product_list.push(product)
                })
                
            }
        })
        data.product_list = product_list
        this.$el.html( productsTmpl(data) )
        $('.main').html(this.el)
    },

    goCategories: function() {
        app.router.navigate("categories", {trigger: true})
    },

    addProduct: function() {
        app.router.navigate("addProduct", {trigger: true})
    },

    editProduct: function(e) {
        var id = $(e.currentTarget).data('id')
        app.router.navigate("editProduct/" + id, {trigger: true})
    }
}) 
});