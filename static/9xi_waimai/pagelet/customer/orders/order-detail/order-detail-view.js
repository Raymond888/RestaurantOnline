define('pagelet/customer/orders/order-detail/order-detail-view.js', function(require, exports, module){ var orderDetailTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="process">\n    <div class="process-status">\n        {{#each process_list}}\n        <div class="process-item">\n            <div class="circle {{#if done}}nobg{{/if}}">\n                {{#if done}}\n                <i class="iconfont icon-shiliangzhinengduixiang">\n                {{/if}}\n            </i>\n            </div>\n            <div class="line"></div>\n            <span class="status-string">{{key}}</span>\n        </div>\n        {{/each}}\n       <!--  <div class="process-item">\n            <div class="circle"></div>\n            <div class="line"></div>\n            <span class="status-string">支付成功</span>\n        </div>\n        <div class="process-item">\n            <div class="circle"></div>\n            <div class="line"></div>\n            <span class="status-string">商家接单</span>\n        </div>\n        <div class="process-item">\n            <div class="circle"></div>\n            <div class="line"></div>\n            <span class="status-string">订单完成</span>\n        </div> -->\n    </div>\n</div>\n<div class="user-detail">\n    <div class="weui_cells weui_cells_form">\n        <div class="weui_cell">\n            <div class="weui_cell_hd"><label class="weui_label">姓名</label></div>\n            <div class="weui_cell_bd weui_cell_primary">\n                <input class="weui_input" type="text" value="{{fullname}}" disabled>\n            </div>\n        </div>\n        <div class="weui_cell">\n            <div class="weui_cell_hd"><label class="weui_label">电话</label></div>\n            <div class="weui_cell_bd weui_cell_primary">\n                <input class="weui_input" type="text" value="{{phone_number}}" disabled>\n            </div>\n        </div>\n        <div class="weui_cell">\n            <div class="weui_cell_hd"><label class="weui_label">收货地址</label></div>\n            <div class="weui_cell_bd weui_cell_primary">\n                <input class="weui_input" type="text" value="{{address}}" disabled>\n            </div>\n        </div>\n        <div class="weui_cell">\n            <div class="weui_cell_hd"><label class="weui_label">订单号</label></div>\n            <div class="weui_cell_bd weui_cell_primary">\n                <input class="weui_input" type="text" value="{{id}}" disabled>\n            </div>\n        </div>\n        <div class="weui_cell">\n            <div class="weui_cell_hd"><label class="weui_label">支付方式</label></div>\n            <div class="weui_cell_bd weui_cell_primary">\n                <input class="weui_input" type="text" value="{{fullname}}" disabled>\n            </div>\n        </div>\n        <div class="weui_cell">\n            <div class="weui_cell_hd"><label class="weui_label">订餐时间</label></div>\n            <div class="weui_cell_bd weui_cell_primary">\n                <input class="weui_input" type="text" value="{{formatTimestamp created_at}}" disabled>\n            </div>\n        </div>\n        <div class="weui_cell">\n            <div class="weui_cell_hd"><label class="weui_label">备注</label></div>\n            <div class="weui_cell_bd weui_cell_primary">\n                <input class="weui_input" type="text" value="{{description}}" disabled>\n            </div>\n        </div>\n        \n    </div>\n    <div class="dish-list">\n        <h4>菜品信息</h4>\n        {{#each items}}\n        <div class="dish-item">\n            <span class="dish-name">{{name}}</span>\n            <span class="dish-count">x{{amount}}</span>\n            <span class="dish-money">${{formatPrice price}}</span>\n        </div>\n        {{/each}}\n    </div>\n    <div class="total-money">\n\n        \n        实付金额：${{formatPrice amount}}\n    </div>\n    \n    {{#if show_pay}}\n    <div class="button-div">\n        <button class="pay weui_btn weui_btn_primary">去支付</button>\n    </div>\n    {{/if}}\n\n</div>\n';
}
return __p;
}() )

app.v.OrderDetail = Backbone.View.extend({

    id: 'order-detail',

    events: {
        'tap .pay-order': 'pay',
        'tap .pay': 'pay',
    },

    initialize: function(options) {
        this.order_id = options.order_id
        this.render()

    },

    render: function() {
        var _this = this
        var order = {}
        var process_list = []
        var order_id = this.order_id
        $.ajax({
            url: "/orders/" + order_id,
            type: "get",
            async: false,
            success: function(respon) {
                _this.order = respon
                order = respon
            },
            error: function(respon) {
                console.log(respon)
            }
        })

        if(order.cod){//货到付款
            process_list = [{key:'提交成功'}, {key:'商家接单'}, {key:'订单完成'}]
        }else{
            process_list = [{key:'提交成功'}, {key:'支付成功'}, {key:'商家接单'}, {key:'订单完成'}]
        }

        if(order.status == 'CREATED' && order.cod){//新订单而且是货到付款
            order.status_string = '待接单'
            process_list[0].done = true
        }else if(order.status == 'CREATED' && !order.cod){//新订单而且是不是货到付款
            order.status_string = '待支付'
            process_list[0].done = true
            order.show_pay = true
        }else if(order.status == 'PAID'){
            order.status_string = '已支付'
            process_list[1].done = true
        }else if(order.status == 'ACCEPTED'){
            order.status_string = '已接单'
            if(order.cod){
                process_list[1].done = true
            }else{
                process_list[2].done = true
            }

        }else if(order.status == 'FINISHED'){
            order.status_string = '已完成'
            if(order.cod){
                process_list[2].done = true
            }else{
                process_list[3].done = true
            }

        }else if(order.status == 'CLOSED'){
            order.status_string = '已关闭'
            if(order.cod){
                process_list[2].done = true
            }else{
                process_list[3].done = true
            }
        }

        order.process_list = process_list
        this.$el.html( orderDetailTmpl(order) )
        $('.main').html(this.el)

        if(order.cod){
            this.$el.find('.process-item').css({
                width: '33%',
            });
        }

    },
    pay: function(e){
        e.preventDefault();
        var order = this.order

        var STRIPE_KEY = "pk_test_yuCytuM0flv2mqm521cM1PKA";
        var handler = StripeCheckout.configure({
            key: STRIPE_KEY,
            image: 'http://7xqzzf.com5.z0.glb.clouddn.com/logo.jpg',
            locale: 'auto',
            token: function(token) {
                $('#loadingToast').show()
              	// add a toast
              	$.post('/orders/' + order.id + '/charge', {
                  	token: token.id
              	}, function(resp) {
                	$('#loadingToast').hide()
                	if (resp.succeed) {
                		util.toast('weui_icon_toast', '支付成功')

                    	window.location.reload()
                	} else{
                		util.toast('weui_icon_cancel', '支付失败')
                	}
              });
            }
        });

        handler.open({
            name: 'Mr Meng Online Restaurant',
            currency: 'aud',
            description: order.comment,
            amount: order.amount
        });

    }

}) 
});