define('pagelet/app-view.js', function(require, exports, module){ /**
 * 视图命名规范:
 * app.v.Xxx  视图模版
 * app.v.xxx  视图对象
 *
 * 所有的视图文件全部以 *-view.js 的方式结尾，例如:
 * todo-view.js
 */

app.v.AppView = Backbone.View.extend({

    el: '#app',

    initialize: function() {

    },


}) 
});