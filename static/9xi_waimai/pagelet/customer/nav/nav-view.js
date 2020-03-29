define('pagelet/customer/nav/nav-view.js', function(require, exports, module){ var navTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+=' <a class="nav-menu active-nav" href="#menu">\n     <div class="title-icon"><i class="iconfont icon-quanbucaidan"></i></div>\n     <div class="title-text">菜单</div>\n </li>\n <a class="nav-orders" href="#orders">\n     <div class="title-icon"><i class="iconfont icon-dingdan"></i></div>\n     <div class="title-text">订单</div>\n </a>\n <!-- <a class="nav-about" href="#">\n     <div class="title-icon"><i class="iconfont icon-guanyu1"></i></div>\n     <div class="title-text">关于</div>\n </li>\n <a class="nav-my" href="#">\n     <div class="title-icon"><i class="iconfont icon-user2"></i></div>\n     <div class="title-text">我的</div>\n </a> -->';
}
return __p;
}() )

app.v.NavCust = Backbone.View.extend({

    id: 'nav-cust',

    events: {
        'tap a': 'active',
    },

    initialize: function() {
        this.render()
    },

    render: function() {
        this.$el.html( navTmpl() )
        $('#app').prepend(this.el)
    },

    active: function(e) {
        var $nav = $(e.currentTarget)
        if ($nav.hasClass('active-nav')) {
            e.preventDefault()
            return false
        } else {
            $nav.addClass('active-nav')
                .siblings('a').removeClass('active-nav')
        }
    }
}) 
});