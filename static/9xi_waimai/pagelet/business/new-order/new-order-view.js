define('pagelet/business/new-order/new-order-view.js', function(require, exports, module){ var newOrderTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="new-order-list">\n\t{{#each orders}}\n\t<div class="order-item {{borderStatus finish_show}} {{borderClass accept_show}}" data-id="{{id}}">\n\t\t<h5>{{id}}号</h5>\n\t\t<div class="status-detail">\n\t\t\t<span>等待处理</span>\n\t\t\t<span>下单时间:{{formatTimestamp created_at}}</span>\n\t\t</div>\n\t\t<button class="pay-status weui_btn weui_btn_warn">\n\t\t{{payStatus paid_at valid}}\n\t\t</button>\n\t\t<div class="order-detail">\n\t\t\t<div class="name-tel">\n\t\t\t\t<span class="name">{{fullname}}</span>\n\t\t\t\t<span class="tel">{{phone_number}}</span>\n\t\t\t</div>\n\t\t\t<div class="address">地址：{{address}}</div>\n\t\t\t<div class="description">备注：{{description}}</div>\n\t\t\t<div class="dish-list">\n\t\t\t\t<h4>菜品信息</h4>\n\t\t\t\t{{#each items}}\n\t\t\t\t<div class="dish-item">\n\t\t\t\t\t<span class="dish-name">{{name}}</span>\n\t\t\t\t\t<span class="dish-count">x{{amount}}</span>\n\t\t\t\t\t<span class="dish-money">${{formatPrice price}}</span>\n\t\t\t\t</div>\n\t\t\t\t{{/each}}\n\t\t\t</div>\n\t\t\t<div class="total-money">\n\t\t\t\t实付金额：${{formatPrice amount}}\n\t\t\t</div>\n\t\t\t<div class="action">\n\t\t\t\t<button class="invalid weui_btn weui_btn_disabled weui_btn_default">拒绝此单</button>\n\n\t\t\t\t<button class="finish weui_btn weui_btn_primary" style="display: {{buttonStatus finish_show}}" >确认送达</button>\n\t\t\t\t\n\t\t\t\t<button class="do-something weui_btn weui_btn_default" style="display: {{buttonStatus accept_show}}">接受此单</button>\n\n\t\n\t\t\t</div>\n\t\t\t\n\t\t</div>\n\t</div>\n\t{{/each}}\n\t\n\n\t<!-- <div class="order-item">\n\t\t<h5>5号</h5>\n\t\t<div class="status-detail">\n\t\t\t<span>等待处理</span>\n\t\t\t<span>下单时间:01-14 11:30</span>\n\t\t</div>\n\t\t<button class="pay-status weui_btn weui_btn_warn">货到付款</button>\n\t</div>\n\n\t<div class="order-item">\n\t\t<h5>5号</h5>\n\t\t<div class="status-detail">\n\t\t\t<span>等待处理</span>\n\t\t\t<span>下单时间:01-14 11:30</span>\n\t\t</div>\n\t\t<button class="pay-status weui_btn weui_btn_warn">货到付款</button>\n\t</div>\n\n\t<div class="order-item">\n\t\t<h5>5号</h5>\n\t\t<div class="status-detail">\n\t\t\t<span>等待处理</span>\n\t\t\t<span>下单时间:01-14 11:30</span>\n\t\t</div>\n\t\t<button class="pay-status weui_btn weui_btn_warn">货到付款</button>\n\t</div>\n\t<div class="order-item">\n\t\t<h5>5号</h5>\n\t\t<div class="status-detail">\n\t\t\t<span>等待处理</span>\n\t\t\t<span>下单时间:01-14 11:30</span>\n\t\t</div>\n\t\t<button class="pay-status weui_btn weui_btn_warn">货到付款</button>\n\t</div>\n\t<div class="order-item">\n\t\t<h5>5号</h5>\n\t\t<div class="status-detail">\n\t\t\t<span>等待处理</span>\n\t\t\t<span>下单时间:01-14 11:30</span>\n\t\t</div>\n\t\t<button class="pay-status weui_btn weui_btn_warn">货到付款</button>\n\t</div>\n\t<div class="order-item">\n\t\t<h5>5号</h5>\n\t\t<div class="status-detail">\n\t\t\t<span>等待处理</span>\n\t\t\t<span>下单时间:01-14 11:30</span>\n\t\t</div>\n\t\t<button class="pay-status weui_btn weui_btn_warn">货到付款</button>\n\t</div>\n\t<div class="order-item">\n\t\t<h5>5号</h5>\n\t\t<div class="status-detail">\n\t\t\t<span>等待处理</span>\n\t\t\t<span>下单时间:01-14 11:30</span>\n\t\t</div>\n\t\t<button class="pay-status weui_btn weui_btn_warn">货到付款</button>\n\t</div>\n\t<div class="order-item">\n\t\t<h5>5号</h5>\n\t\t<div class="status-detail">\n\t\t\t<span>等待处理</span>\n\t\t\t<span>下单时间:01-14 11:30</span>\n\t\t</div>\n\t\t<button class="pay-status weui_btn weui_btn_warn">货到付款</button>\n\t</div> -->\n\n</div>';
}
return __p;
}() )

app.v.NewOrder = Backbone.View.extend({

    id: 'new-order',

    events: {
        'tap .invalid': 'rejectOrder',
        'tap .finish': 'finishOrder',
        'tap .do-something': 'acceptOrder',
        'tap .order-item': 'toggle',
        
    },

    initialize: function() {
        this.render()
    },

    render: function() {
        var _this = this
        $.ajax({
            url: "/orders?finished=0",
            type: "get",
            success: function(respon) {
                _.each(respon.orders, function(order){
                    //order.accept_show = order.valid ? true : false

                    if(order.status != 'ACCEPTED' && order.valid){
                        order.accept_show = true
                    }else{
                        order.accept_show = false
                    }

                    if(order.status == 'ACCEPTED'){//已接单
                        order.finish_show = true
                    }else{
                        order.finish_show = false
                    }
                })

                _this.$el.html( newOrderTmpl(respon) )
                $('.main').html(_this.el)
            },
            error: function(respon) {
                console.log(respon)
            }
        })
    },

    toggle: function(e) {
        $(e.currentTarget).find('.order-detail').toggle()
    },
    rejectOrder: function(e){
        e.stopImmediatePropagation()
        var id = $(e.currentTarget).parents('.order-item').data('id')
        $.ajax({
            url: "/orders/" + id + "/close",
            type: "PUT",
            success: function(respon) {
                util.alert('拒绝接单', '操作成功')
                $(e.currentTarget).parents('.order-item').remove()
            },
            error: function(respon) {
                console.log(respon)
            }
        })
    },
    acceptOrder: function(e){
        e.stopImmediatePropagation()
        var id = $(e.currentTarget).parents('.order-item').data('id')
        $.ajax({
            url: "/orders/" + id + "/accept",
            type: "PUT",
            success: function(respon) {
                util.alert('成功', '接单成功')
                $(e.currentTarget).parents('.order-item').find('.do-something').hide()
                $(e.currentTarget).parents('.order-item').find('.finish').show()
                $(e.currentTarget).parents('.order-item').addClass('finished')
            },
            error: function(respon) {
                console.log(respon)
            }
        })
    },
    finishOrder: function(e){
        e.stopImmediatePropagation()
        var id = $(e.currentTarget).parents('.order-item').data('id')
        $.ajax({
            url: "/orders/" + id + "/finish",
            type: "PUT",
            success: function(respon) {
                util.alert('成功', '确认送达')
                $(e.currentTarget).parents('.order-item').remove()
            },
            error: function(respon) {
                console.log(respon)
            }
        })
    }
}) 
});