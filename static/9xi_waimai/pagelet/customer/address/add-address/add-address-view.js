define('pagelet/customer/address/add-address/add-address-view.js', function(require, exports, module){ var addAddressTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="weui_cells weui_cells_access address-new">\n    <div class="weui_cell">\n        <div class="weui_cell_hd"><label class="weui_label">收货人</label></div>\n        <div class="weui_cell_bd weui_cell_primary">\n            <input class="fullname weui_input" type="text" placeholder="请输入收货人姓名">\n        </div>\n    </div>\n    <div class="weui_cell">\n        <div class="weui_cell_hd"><label class="weui_label">手机号码</label></div>\n        <div class="weui_cell_bd weui_cell_primary">\n            <input class="phone-number weui_input" type="number" min="0" max="9999999" placeholder="请输入手机号码">\n        </div>\n    </div>\n    <div class="weui_cell">\n        <div class="weui_cell_hd"><label class="weui_label">详细地址</label></div>\n        <div class="weui_cell_bd weui_cell_primary">\n            <input class="address weui_input" type="text" placeholder="请输入详细地址">\n        </div>\n    </div>\n    <div class="weui_cell weui_cell_switch">\n        <div class="weui_cell_hd weui_cell_primary">设置为默认地址</div>\n        <div class="weui_cell_ft">\n            <input class="default weui_switch" type="checkbox">\n        </div>\n    </div>\n</div>\n\n<div class="weui_btn_area">\n    <a class="add-address weui_btn weui_btn_primary" href="javascript:" id="add-address">确定</a>\n</div>';
}
return __p;
}() )

app.v.AddAddress = Backbone.View.extend({

    id: 'add-address',

    events: {
        'tap .add-address': 'addAddress',
    },

    initialize: function() {
        this.render()
    },

    render: function() {
        
        this.$el.html( addAddressTmpl() )
        app.dom.main.html(this.el)
    },

    addAddress: function(e) {
        var fullname = this.$el.find('.fullname').val()
        var phone_number = this.$el.find('.phone-number').val()
        var address = this.$el.find('.address').val()
        var isdefault = this.$el.find('.default').is(':checked')

        if(fullname == ''){
            util.alert('错误', '收货人姓名不能为空')
            return
        }
        if(phone_number == ''){
            util.alert('错误', '手机号码不能为空')
            return
        }
        if(address == ''){
            util.alert('错误', '详细地址不能为空')
            return
        }

        $.ajax({
            url: "/user/addresses",
            type: "POST",
            data:{
                fullname: fullname,
                phone_number: phone_number,
                address: address,
                default: isdefault
            },
            success: function(data) {
                util.alert('成功', '地址创建成功')
                app.router.navigate("address", {trigger: true})
            },
            error: function(respon) {
                console.log(respon)
            }
        })
    }

}) 
});