define('pagelet/models.js', function(require, exports, module){ /**
 * 命名规范
 * app.m.xxx [model对象]
 * app.m.Xxx [model模版类]
 *
 * app.c.xxx [collection对象]
 * app.c.Xxx [collection模版类]
 */

app.m.User = Backbone.Model.extend({

    url: '/user'

})

app.c.Products = Backbone.Collection.extend({

    initialize: function() {
    },

    url: '/products',

    classify: function() {
        var data = this.toJSON().pop()['products']
        var allCategories = _.map(data, function(c, index) {
            return {
                id: index,
                name: _.keys(c).pop()
            }
        })
        var allProducts = _.map(data, function(p, index) {
            return {
                id: index,
                products: _.values(p).pop()
            }
        })
        return {
            allCategories: allCategories,
            allProducts: allProducts
        }
    }

})

app.c.Addresses = Backbone.Collection.extend({
    url: '/user/addresses',

    getAddress: function(id) {
        if ( _.isEmpty(this.toJSON()) ) {
            return
        } else {
            return _.find(this.toJSON().pop().addresses, function(add) {
                return add.id === parseInt(id)
            })
        }
    },

    getDefault: function() {
        if ( _.isEmpty(this.toJSON()) ) {
            this.fetch({async: false})
        }
        return _.find(this.toJSON().pop().addresses,  function(add) {
            return add.default
        })
    }
})

// 订单模型
app.m.Order = Backbone.Model.extend({

})

// 订单列表
app.c.Orders = Backbone.Collection.extend({
	url: "/orders",
	model: app.m.Order,
    //str  product_idxamount,... 如 1x1,2x1
    create: function(addressId, cod, description) {
        var items = _.map(_.pairs(app.cart.items()),
              function(i) {
                return [i[0], i[1]['amount']].join('x')
              }
        ).join(',')
        $.ajax({
            url: '/orders',
            type: 'post',
            data: {
                address_id: addressId,
                items: items,
                cod: cod,
                description: description
            },
            success: function(data) {
                app.router.navigate('orderDetail/'+data.order_id, {trigger: true})
            }
        })
    }
})

// 菜品模型
app.m.Category = Backbone.Model.extend({

})

// 菜品列表
app.c.Categories = Backbone.Collection.extend({
	url: "/categories",
	model: app.m.Category
})




app.m.user = new app.m.User()
app.c.products = new app.c.Products()
app.c.categories = new app.c.Categories()
app.c.orders = new app.c.Orders()
app.c.addresses = new app.c.Addresses()
 
});