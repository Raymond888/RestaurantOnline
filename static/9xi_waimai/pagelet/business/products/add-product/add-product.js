define('pagelet/business/products/add-product/add-product.js', function(require, exports, module){ var addProductTmpl = Handlebars.compile(function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="weui_cells_title">添加新菜</div>\n<div class="weui_cells weui_cells_form">\n    <div class="weui_cell">\n        <div class="weui_cell_hd"><label class="weui_label">菜品图片</label></div>\n        <div class="weui_cell_bd weui_cell_primary">\n            <div class="weui_uploader_input_wrp">\n                <input class="weui_uploader_input" type="file" accept="image/jpg,image/jpeg,image/png,image/gif" multiple="">\n            </div>\n        </div>\n    </div>\n    <div class="weui_cell">\n        <div class="weui_cell_hd"><label class="weui_label">菜品名称</label></div>\n        <div class="weui_cell_bd weui_cell_primary">\n            <input class="product-name weui_input" type="text" placeholder="请输入菜品名称">\n        </div>\n    </div>\n    <div class="weui_cell">\n        <div class="weui_cell_hd"><label class="weui_label">价格</label></div>\n        <div class="weui_cell_bd weui_cell_primary">\n            <input class="product-price weui_input" type="number" min="0" max="9999999" placeholder="请输入价格">\n            <span>分</span>\n        </div>\n    </div>\n    <div class="weui_cell">\n        <div class="weui_cell_hd"><label class="weui_label">菜品种类</label></div>\n        <div class="weui_cell_bd weui_cell_primary">\n            <div class="weui_cell weui_cell_select">\n                <div class="weui_cell_bd weui_cell_primary">\n                    <select class="product-type weui_select" name="select1">\n                        <option selected="" value="" disabled="">请选择</option>\n                        {{#each categories}}\n                            <option value="{{id}}">{{name}}</option>\n                        {{/each}}\n                    </select>\n                </div>\n            </div>\n        </div>\n    </div>\n    <div class="weui_cell weui_cell_switch">\n        <div class="weui_cell_hd weui_cell_primary">上架</div>\n        <div class="weui_cell_ft">\n            <input class="product-available weui_switch" type="checkbox" checked>\n        </div>\n    </div>\n\n</div>\n<div class="weui_btn_area">\n    <a class="add-product weui_btn weui_btn_primary" href="javascript:" id="showTooltips">确定</a>\n</div>';
}
return __p;
}())

app.v.AddProduct = Backbone.View.extend({

    id: 'add-product',

    events: {
        'tap .add-product': 'addProduct',
    },

    initialize: function() {
        this.render()
    },

    render: function() {
        var _this = this
        _this.pic_url = 'http://7xqzzf.com5.z0.glb.clouddn.com/logo.jpg'

        app.c.categories.fetch({reset: true ,async: false})
        var categories = app.c.categories.toJSON()[0]

        this.$el.html(addProductTmpl(categories))
        $('.main').html(this.el)
        $('.weui_uploader_input_wrp').css("background-image","url(" + _this.pic_url + ")");


        this.$el.find('.weui_uploader_input').change(function(event) {
            util.alert('上传文件', '上传文件中....')
            var form_data = new FormData();

            form_data.append('file', $('.weui_uploader_input').prop('files')[0]);
            $.ajax({
                url: "/upload",
                cache: false,
                contentType: false,
                processData: false,
                async: true,
                data: form_data,
                type: 'post',
                uploadProgress: function(){
                    util.alert('上传文件', '上传文件中....')
                },
                success: function(reps) {
                    _this.pic_url = reps.url
                    $('.weui_uploader_input_wrp').css("background-image","url(" + reps.url + ")");
                    util.alert('上传文件', '上传完成')
                    
                    // display image
                }
            });
        });
    },

    addProduct: function() {
        var pic_url = this.pic_url
        var product_name = this.$el.find('.product-name').val()
        var product_price = this.$el.find('.product-price').val()
        var product_type = this.$el.find('.product-type').val()
        var product_available = this.$el.find('.product-available').is(':checked')

        if(pic_url == '' || pic_url == undefined){
            util.alert('错误', '菜品图片不能为空')
            return
        }
        if(product_name == ''){
            util.alert('错误', '菜品名称不能为空')
            return
        }
        if(product_price == ''){
            util.alert('错误', '菜品价格不能为空')
            return
        }

        if(product_type == ''){
            util.alert('错误', '菜品种类不能为空')
            return
        }

        $.ajax({
            url: "/products",
            type: "POST",
            data:{
                pic_url: pic_url,
                name: product_name,
                price: product_price,
                category_id: product_type,
                available: product_available,
                unit: '分'
            },
            success: function(data) {
                util.alert('成功', '添加新菜成功')
                app.router.navigate("products", {trigger: true})
            },
            error: function(respon) {
                console.log(respon)
            }
        })

    }
}) 
});