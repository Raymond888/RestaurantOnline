define('pagelet/customer/address/address-list-view.js', function(require, exports, module){ var addressListTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="weui_cells weui_cells_access address-new">\n    <a class="add-address weui_cell" href="javascript:;">\n        <div class="weui_cell_bd weui_cell_primary">\n            <p>新增收货地址</p>\n        </div>\n        <div class="weui_cell_ft">\n        </div>\n    </a>\n</div>\n{{#addresses}}\n<div class="weui_cells address-cell" data-id={{id}}>\n    {{#if default}}<span class="selected-sign">默认</span>{{/if}}\n    <div class="weui_cell">\n        <div class="weui_cell_bd weui_cell_primary">\n            <p><span class="fullname">{{fullname}}</span><span class="phone">{{phone_number}}</span></p>\n            <p class="address">{{address}}</p>\n        </div>\n    </div>\n</div>\n{{/addresses}}';
}
return __p;
}() )

app.v.AddressList = Backbone.View.extend({

    id: 'address-list',

    events: {
        'tap #address-list>.address-cell': 'select',
        'tap .add-address': 'addAddress',
        
    },

    initialize: function() {
        this.addresses = app.c.addresses
        this.listenTo(this.addresses, 'reset', this.render)

        this.addresses.fetch({reset: true})
    },

    render: function() {
        var data = this.addresses.toJSON().pop()
        this.$el.html( addressListTmpl(data) )
        app.dom.main.html(this.el)
    },

    select: function(e) {
        var id = $(e.currentTarget).data('id')
        app.router.navigate('orderCreate/' + id, {trigger: true})
    },
    
    addAddress: function(e) {
        app.router.navigate('addAddress', {trigger: true})
    }

}) 
});