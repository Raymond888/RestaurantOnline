define('pagelet/customer/orders/order-create/order-create-view.js', function(require, exports, module){ var orderCreateTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="weui_cells weui_cells_access address-cell">\n    <a class="weui_cell" href="javascript:;">\n        <div class="weui_cell_bd weui_cell_primary">\n            {{#if address}}\n            {{#address}}\n            <p>\n                <span id="fullname">{{fullname}}</span>\n                <span id="phone">{{phone_number}}</span>\n            </p>\n            <p id="address">{{address}}</p>\n            {{/address}}\n            {{else}}\n            <p>填写送货信息</p>\n            {{/if}}\n        </div>\n        <div class="weui_cell_ft"></div>\n    </a>\n</div>\n\n<div class="weui_cells info-cell">\n    <div class="weui_cell">\n        <div class="weui_cell_bd weui_cell_primary">\n            <p>支付方式</p>\n        </div>\n        <div class="weui_cell_ft">\n            <div class="payment-approach payment-online payment-active" data-id="0">在线支付</div>\n            <div class="payment-approach payment-offline" data-id="1">货到付款</div>\n        </div>\n    </div>\n    <div class="weui_cell">\n        <div class="weui_cell_hd"><label class="weui_label">备注</label></div>\n        <div class="weui_cell_bd weui_cell_primary">\n            <input id="description" class="weui_input" type="text" placeholder="请填写">\n        </div>\n    </div>\n</div>\n\n<div class="weui_cells items-cell">\n    <div class="weui_cell">\n        <div class="weui_cell_bd weui_cell_primary item-list">\n            <p>菜品信息</p>\n            {{#items}}\n            <div class="item">\n                <span class="item-name">{{name}}</span>\n                <span class="item-amount">x&nbsp;{{amount}}</span>\n                <span class="item-price">${{formatPrice price}}</span>\n            </div>\n            {{/items}}\n        </div>\n    </div>\n</div>\n\n<div class="light-bar">\n    <span class="note">已选<strong id="count">\n    {{#if totalAmount}}\n        {{totalAmount}}\n    {{else}}\n        0\n    {{/if}}\n    </strong>份</span>\n    $<strong id="total-price">{{totalPrice}}</strong>\n    <div id="newOrder" class="order" data-id="{{#address}}{{id}}{{/address}}">确认下单</div>\n</div>';
}
return __p;
}() )

app.v.OrderCreate = Backbone.View.extend({

    id: 'order-create',

    events: {
        'tap .address-cell': 'putAddress',
        'tap .payment-approach': 'choosePayment',
        'tap .order': 'newOrder'
    },

    initialize: function(addressId) {
        if (addressId) {
            this.address = app.c.addresses.getAddress(addressId)
        } else {
            this.address = app.c.addresses.getDefault()
        }
        this.render()
    },

    render: function() {
        var cart = app.cart
        this.$el.html( orderCreateTmpl({
            address: this.address,
            items: _.values(cart.items()),
            totalAmount: cart.totalAmount(),
            totalPrice: cart.totalPrice()
        }) )
        app.dom.main.html(this.el)
    },

    putAddress: function() {
        app.router.navigate('address', {trigger: true})
    },

    choosePayment: function(e) {
        var _this = $(e.currentTarget)
        if (_this.hasClass('payment-active')) {
            return
        } else {
            _this.addClass('payment-active')
                 .siblings('.payment-approach').removeClass('payment-active')
        }
    },

    newOrder: function() {
        var addressId = $('#newOrder').data('id')
        var cod = $('.payment-active').data('id') ? true : false
        if (!addressId) {
            alert('请完善送货信息')
            return
        }
        if(app.cart.totalPrice() <= 0) {
            alert('您还没有选择任何商品')
            return
        }
        app.c.orders.create( addressId, cod, $('#description').val() )
    }

}) 
});