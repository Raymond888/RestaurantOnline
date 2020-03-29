define('pagelet/customer/menu/menu-view.js', function(require, exports, module){ var menuTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<section class="module-nav">\n    <ul>\n        {{#allCategories}}\n        <li class="nav-category {{#unless id}}category-active{{/unless}}" data-id="{{id}}">{{name}}</li>\n        {{/allCategories}}\n    </ul>\n</section>\n<section  class="module-content">\n    {{#allProducts}}\n    <div id="category{{id}}" class="weui_cells category-cell" style="{{#unless id}} display: block; {{/unless}}">\n        {{#products}}\n        <div class="weui_cell">\n            <div class="weui_cell_hd"><img src="{{pic_url}}" alt=""></div>\n            <div class="weui_cell_bd weui_cell_primary">\n                <p class="title">{{name}}</p>\n                <p class="price">${{formatPrice price}}</p>\n            </div>\n            <div class="weui_cell_ft">\n                <div class="action">\n                    <i class="iconfont icon-minus"></i>\n                    <span class="amount" data-id="{{id}}" data-name="{{name}}" data-price="{{price}}">0</span>\n                    <i class="iconfont icon-plus"></i>\n                </div>\n            </div>\n        </div>\n        {{/products}}\n    </div>\n    {{/allProducts}}\n    <div class="light-bar">\n        <span class="note">已选<strong id="count">0</strong>份</span>\n        $<strong id="total-price">0</strong>\n        <div class="order order-go">去下单</div>\n    </div>\n</section>\n';
}
return __p;
}() ),
    products = app.c.products

app.cart = (function() {

    var items = {},
        totalPrice = 0;

    function decrease(id, price) {
        var p = items[id]
        if (p && p.amount > 0) {
            if (p.amount === 1) {
                delete items[id]
                totalPrice -= price
            } else {
                p.amount -= 1
                totalPrice -= price
            }
        }
    }

    function add(id, price, name) {
        var p = items[id]
        if (p && p.amount < 100) {
            p.amount += 1
            totalPrice += price
        } else if (p) {
            return
        } else {
            totalPrice += price
            items[id] = {
                amount: 1,
                price: price,
                name: name
            }
        }
    }

    function getItems() {
        return items
    }

    function getTotalPrice() {
        return totalPrice / 100
    }

    function getTotalAmount() {
        var amountList = _.map(_.values(items), function(p) {
            return p.amount
        })
        return _.reduce(amountList, function(memo, num) {
            return memo + num
        })
    }

    function empty() {
        items = {}
        totalPrice = 0
    }

    function hasSomething() {
        return totalPrice > 0
    }

    return {
        add: add,
        decrease: decrease,
        items: getItems,
        totalPrice: getTotalPrice,
        totalAmount: getTotalAmount,
        hasSomething: hasSomething
    }

})()

app.v.Menu = Backbone.View.extend({

    id: 'module-menu',

    events: {
        'tap .nav-category': 'switchProducts',
        'tap .icon-minus': 'minus',
        'tap .icon-plus': 'plus',
        'tap .order-go': 'order',
    },

    initialize: function() {
        this.listenTo(products, 'reset', this.render)

        products.fetch({reset: true})
    },

    render: function() {
        this.$el.html( menuTmpl(products.classify()) )
        app.dom.main.html(this.el)
    },

    minus: function(e) {
        var $amount = $(e.currentTarget).siblings('span.amount'),
            amount = parseInt( $amount.text() ),
            $count = $('#count'),
            count = parseInt( $count.text() )

        app.cart.decrease( $amount.data('id'), $amount.data('price') )

        if (amount <= 0) {
            return false
        } else {
            $amount.text( amount-1 )
            $count.text( count-1 )
            $('#total-price').text( app.cart.totalPrice() )
        }
    },

    plus: function(e) {
        var $amount = $(e.currentTarget).siblings('span.amount'),
            amount = parseInt( $amount.text() ),
            $count = $('#count'),
            count = parseInt( $count.text() )

        app.cart.add( $amount.data('id'), $amount.data('price'), $amount.data('name') )

        if (amount > 99) {
            return false
        } else {
            $amount.text( amount+1 )
            $count.text( count+1 )
            $('#total-price').text( app.cart.totalPrice() )
        }
    },

    switchProducts: function(e) {
        var $navTarget = $(e.currentTarget),
            cid = $navTarget.data('id'),
            isActive = $navTarget.hasClass('category-active')

        if (isActive) {
            return false
        } else {
            $navTarget.addClass('category-active')
                      .siblings('li').removeClass('category-active')

            $('.category-cell').hide()
            $('#category'+cid).show()
        }
    },

    order: function() {
        if (app.cart.hasSomething()) {
            app.router.navigate('orderCreate', {trigger: true})
        } else {
            util.alert('无法下单', '您还没有选择任何菜品！')
        }
    }

}) 
});