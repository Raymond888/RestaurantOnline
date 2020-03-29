define('pagelet/business/done-order/done-order-view.js', function(require, exports, module){ var doneOrderTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="done-order-list">\n\t{{#each orders}}\n\t<div class="order-item {{doneBorderStatus status}}" data-id="{{id}}">\n\t\t<h5>{{id}}号</h5>\n\t\t<div class="status-detail">\n\t\t\t<span>{{statusString status}}</span>\n\t\t\t<span>下单时间:{{formatTimestamp created_at}}</span>\n\t\t</div>\n\t\t<button class="pay-status weui_btn weui_btn_warn">\n\t\t{{payStatus paid_at valid}}\n\t\t</button>\n\t\t<div class="order-detail">\n\t\t\t<div class="name-tel">\n\t\t\t\t<span class="name">{{fullname}}</span>\n\t\t\t\t<span class="tel">{{phone_number}}</span>\n\t\t\t</div>\n\t\t\t<div class="address">地址：{{address}}</div>\n\t\t\t<div class="description">备注：{{description}}</div>\n\t\t\t<div class="dish-list">\n\t\t\t\t<h4>菜品信息</h4>\n\t\t\t\t{{#each items}}\n\t\t\t\t<div class="dish-item">\n\t\t\t\t\t<span class="dish-name">{{name}}</span>\n\t\t\t\t\t<span class="dish-count">x{{amount}}</span>\n\t\t\t\t\t<span class="dish-money">${{formatPrice price}}</span>\n\t\t\t\t</div>\n\t\t\t\t{{/each}}\n\n\t\t\t\t\n\t\t\t\t<!-- <div class="dish-item">\n\t\t\t\t\t<span class="dish-name">回锅牛肉</span>\n\t\t\t\t\t<span class="dish-count">x1</span>\n\t\t\t\t\t<span class="dish-money">￥24</span>\n\t\t\t\t</div> -->\n\t\t\t</div>\t\n\t\t\t<div class="total-money">\n\t\t\t\t实付金额：${{formatPrice amount}}\n\t\t\t</div>\n\t\t\t<!-- <div class="action">\n\t\t\t\t<button class="invalid weui_btn weui_btn_disabled weui_btn_default">拒绝此单</button>\n\t\t\t\t<button class="do-something weui_btn weui_btn_default">接受此单</button>\n\t\t\t</div> -->\n\t\t\t\n\t\t</div>\n\t</div>\n\t{{/each}}\n\n</div>';
}
return __p;
}() )

app.v.DoneOrder = Backbone.View.extend({

    id: 'done-order',

    events: {
        'tap .invalid': 'rejectOrder',
        'tap .do-something': 'acceptOrder',
        'tap .order-item': 'toggle',
    },

    initialize: function() {
        this.render()
    },

    render: function() {
        var _this = this
        $.ajax({
            url: "/orders?finished=1",
            type: "get",
            success: function(respon) {

                _this.$el.html( doneOrderTmpl(respon) )
                $('.main').html(_this.el)
            },
            error: function(respon) {
                console.log(respon)
            }
        })
    },

    toggle: function(e) {
        console.log('toggle')
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
                
            },
            error: function(respon) {
                console.log(respon)
            }
        })
    }
}) 
});