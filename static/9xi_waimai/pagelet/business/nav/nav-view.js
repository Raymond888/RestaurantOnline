define('pagelet/business/nav/nav-view.js', function(require, exports, module){ var navTmpl = Handlebars.compile( function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+=' <a class="nav-menu active-nav" href="#newOrder">\n     <div class="title-icon"><i class="iconfont icon-dingdan"></i></div>\n     <div class="title-text">新订单</div>\n </li>\n <a class="nav-handling" href="#handling">\n     <div class="title-icon"><i class="iconfont icon-yichuli1"></i></div>\n     <div class="title-text">已处理</div>\n </a>\n <a class="nav-products" href="#products">\n     <div class="title-icon"><i class="iconfont icon-quanbucaidan"></i></div>\n     <div class="title-text">菜品管理</div>\n </li>\n<!--  <a class="nav-settings" href="#settings">\n     <div class="title-icon"><i class="iconfont icon-shezhi1"></i></div>\n     <div class="title-text">设置</div>\n </a> -->';
}
return __p;
}() )

app.v.NavBus = Backbone.View.extend({

    id: 'nav-bus',

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