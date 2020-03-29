define('pagelet/app.js', function(require, exports, module){ window.app = {
    c: {},
    m: {},
    v: {},
    dom: {
        main: $('.main')
    }
}

var HandlebarHelp = require('pagelet/handlebarHelp.js')
var Models = require('pagelet/models.js')

var View = require('pagelet/customer/nav/nav-view.js')
var View = require('pagelet/customer/menu/menu-view.js')
var View = require('pagelet/customer/orders/orders-view.js')
var View = require('pagelet/customer/orders/order-create/order-create-view.js')
var View = require('pagelet/customer/orders/order-detail/order-detail-view.js')
var View = require('pagelet/customer/address/address-list-view.js')
var View = require('pagelet/customer/address/add-address/add-address-view.js')

var View = require('pagelet/business/nav/nav-view.js')
var View = require('pagelet/business/new-order/new-order-view.js')
var View = require('pagelet/business/done-order/done-order-view.js')
var View = require('pagelet/business/products/products.js')
var View = require('pagelet/business/products/add-product/add-product.js')
var View = require('pagelet/business/products/edit-product/edit-product.js')
var View = require('pagelet/business/categories/categories.js')
var View = require('pagelet/business/categories/add-categories/add-categories.js')
var View = require('pagelet/business/categories/edit-categories/edit-categories.js')

var Router = require('pagelet/router.js')

$.ajaxSettings = _.extend($.ajaxSettings, {

    complete: function(xhr, ts) {
        var statusCode = xhr.status,
            userId = app.m.user.id

        if (statusCode === 403 && userId) {
            delete app.m.user.id
            if (typeof xhr === 'string') {
                alert(xhr)
                return false
            } else {
                return false
            }
        } else if (statusCode === 403) {
            alert('对不起，您没有权限访问！')
            return false
        } else if (ts == "timeout") {
            alert("连接超时，请检查网络后重试")
        } else {
            return false
        }
    }

})

app.m.user.fetch({

    async: false,

    success: function(model, resp) {
        var data = model.toJSON()
        if (data.admin) {
            app.v.navBus = new app.v.NavBus()
            if (!app.v.newOrder) {
                app.router.navigate('newOrder', {trigger: true})
            }
        } else {
            app.dom.main.css('bottom', '6rem')
            app.v.navCust = new app.v.NavCust()
            if (!app.v.menu) {
                app.router.navigate('menu', {trigger: true})
            }
        }
    }

})
 
});