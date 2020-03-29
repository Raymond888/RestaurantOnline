define('pagelet/router.js', function(require, exports, module){ var Router = Backbone.Router.extend({

    routes: {
        "newOrder": "newOrder",     // 来自用户的全部订单
        "handling": "handling",     // 正在处理的用户订单
        "products": "products",   // 菜品管理
        "addProduct": "addProduct",   // 添加菜品
        "editProduct/:product_id": "editProduct",   // 修改菜品
        "categories": "categories",   // 分类管理
        "addCategories": "addCategories",   // 增加分类
        "eidtCategories/:categories_id": "eidtCategories",   // 编辑分类
        // "settings": "settings",   // 配置商家自己的信息

        "menu": "menu",       // 展示商家菜单
        "orders": "orders",   // 用户订单列表
        "orderCreate(/:addressId)": "createOrder",
        "orderDetail/:order_id": "orderDetail",   // 用户订单详情
        "address": "address", //地址列表
        "addAddress": "addAddress" //地址列表
        // "about": "about",
        // "my": "my"       // 用户管理面板
    },

    menu: function() {
        if (app.v.menu) {
            app.dom.main.html(app.v.menu.el)
        } else {
            app.v.menu = new app.v.Menu()
        }
    },

    orders: function() {
        util.close(app.v.orders)

        app.v.orders = new app.v.Orders()
    },

    createOrder: function(addressId) {
        util.close(app.v.orderCreate)

        app.v.orderCreate = new app.v.OrderCreate(addressId)
    },

    orderDetail: function(order_id) {
        util.close(app.v.orderDetail)

        app.v.orderDetail = new app.v.OrderDetail({order_id: order_id})
    },

    address: function() {
        util.close(app.v.addressList)

        app.v.addressList = new app.v.AddressList()
    },

    addAddress: function() {
        util.close(app.v.addAddress)

        app.v.addAddress = new app.v.AddAddress()
    },

    newOrder: function() {
        util.close(app.v.newOrder)

        app.v.newOrder = new app.v.NewOrder()
    },

    handling: function() {
        util.close(app.v.doneOrder)

        app.v.doneOrder = new app.v.DoneOrder()
    },

    products: function() {
        util.close(app.v.products)

        app.v.products = new app.v.Products()
    },
    addProduct: function() {
        util.close(app.v.addProduct)

        app.v.addProduct = new app.v.AddProduct()
    },

    editProduct: function(product_id) {
        util.close(app.v.editProduct)

        app.v.editProduct = new app.v.EditProduct({product_id: product_id})
    },

    categories: function() {
        util.close(app.v.categories)

        app.v.categories = new app.v.Categories()
    },

    addCategories: function() {
        util.close(app.v.addCategories)

        app.v.addCategories = new app.v.AddCategories()
    },

    eidtCategories: function(categories_id) {
        util.close(app.v.editCeategories)

        app.v.editCeategories = new app.v.EditCategories({categories_id: categories_id})
    }


})

app.router = new Router()
Backbone.history.start()
 
});