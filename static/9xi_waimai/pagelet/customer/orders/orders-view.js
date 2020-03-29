define('pagelet/customer/orders/orders-view.js', function(require, exports, module){ var ordersTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<section class="module-nav">\n    <ul>\n        <li class="nav-category category-active" data-id="0">全部订单</li>\n        <li class="nav-category" data-id="1">待支付</li>\n        <li class="nav-category" data-id="2">待收货</li>\n        <li class="nav-category" data-id="3">已完成</li>\n    </ul>\n</section>\n<section  class="module-content">\n    <div id="category0" class="weui_cells category-cell" style="display: block;">\n        <div class="weui_cells">\n            {{#each orders}}\n            <div class="order-item">\n                <div class="weui_cell" data-id={{id}}>\n                    <div class="weui_cell_hd"><img src="{{pic_url}}" alt="http://7xqzzf.com5.z0.glb.clouddn.com/logo.jpg" ></div>\n                    <div class="weui_cell_bd weui_cell_primary">\n                        <p>{{comment}}</p>\n                        <p class="time">{{formatTimestamp created_at}}</p>\n                    </div>\n\n                </div>\n                <div class="weui_cell_ft">\n                    <span class="status">{{status_string}}</span>\n                    <span class="fee">订单金额：${{formatPrice amount}}</span>\n                </div>\n            </div>\n            {{/each}}\n        </div>\n    </div>\n\n    <div id="category1" class="weui_cells category-cell">\n        {{#each order_nopay}}\n        <div class="weui_cell" data-id={{id}}>\n            <div class="weui_cell_hd"><img src="{{pic_url}}" alt="http://7xqzzf.com5.z0.glb.clouddn.com/logo.jpg" ></div>\n            <div class="weui_cell_bd weui_cell_primary">\n                <p>{{comment}}</p>\n                <p class="time">{{formatTimestamp created_at}}</p>\n            </div>\n\n        </div>\n        <div class="weui_cell_ft">\n            <span class="status">{{status_string}}</span>\n            <span class="fee">订单金额：${{formatPrice amount}}</span>\n        </div>\n        {{/each}}\n    </div>\n\n    <div id="category2" class="weui_cells category-cell">\n        {{#each order_accepted}}\n        <div class="weui_cell" data-id={{id}}>\n            <div class="weui_cell_hd"><img src="{{pic_url}}" alt="http://7xqzzf.com5.z0.glb.clouddn.com/logo.jpg" ></div>\n            <div class="weui_cell_bd weui_cell_primary">\n                <p>{{comment}}</p>\n                <p class="time">{{formatTimestamp created_at}}</p>\n            </div>\n\n        </div>\n        <div class="weui_cell_ft">\n            <span class="status">{{status_string}}</span>\n            <span class="fee">订单金额：${{formatPrice amount}}</span>\n        </div>\n        {{/each}}\n    </div>\n\n    <div id="category3" class="weui_cells category-cell">\n        {{#each order_finished}}\n        <div class="weui_cell" data-id={{id}}>\n            <div class="weui_cell_hd"><img src="{{pic_url}}" alt="http://7xqzzf.com5.z0.glb.clouddn.com/logo.jpg" ></div>\n            <div class="weui_cell_bd weui_cell_primary">\n                <p>{{comment}}</p>\n                <p class="time">{{formatTimestamp created_at}}</p>\n            </div>\n\n        </div>\n        <div class="weui_cell_ft">\n            <span class="status">{{status_string}}</span>\n            <span class="fee">订单金额：${{formatPrice amount}}</span>\n        </div>\n        {{/each}}\n    </div>\n</section>\n';
}
return __p;
}() )

app.v.Orders = Backbone.View.extend({

    id: 'orders',

    events: {
        'tap .weui_cell': 'orderDetail',
        'tap .nav-category': 'switchProducts',
        'tap .order': 'order',
    },

    initialize: function() {
        this.orders = app.c.orders
        this.listenTo(this.orders, 'reset', this.render)

        this.orders.fetch({reset: true})
    },

    render: function() {
        var data = this.orders.toJSON()[0]
        //待支付order_list
        var order_nopay = []
        //待收货
        var order_accepted = []
        //已完成
        var order_finished = []
        _.each(data.orders, function(order){
            if(order.status == 'CREATED' && order.cod){//新订单而且是货到付款
                order.status_string = '待接单'
            }else if(order.status == 'CREATED' && !order.cod){//新订单而且是不是货到付款
                order.status_string = '待支付'
                order_nopay.push(order)
            }else if(order.status == 'PAID'){
                order.status_string = '已支付'
            }else if(order.status == 'ACCEPTED'){
                order.status_string = '已接单'
                order_accepted.push(order)
            }else if(order.status == 'FINISHED'){
                order.status_string = '已完成'
                order_finished.push(order)
            }else if(order.status == 'CLOSED'){
                order.status_string = '已关闭'
            }
        })
        data.order_nopay = order_nopay
        data.order_accepted = order_accepted
        data.order_finished = order_finished
        this.$el.html( ordersTmpl(data) )
        $('.main').html(this.el)
    },

    orderDetail: function(e) {
        var order_id = $(e.currentTarget).data('id')
        app.router.navigate("orderDetail/" + order_id, {trigger: true})
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
    }

}) 
});