错误代码

403: 未登录或无权限


GET /user 获取当前登陆用户

    200: 已授权
    
    {
      "nickname": "",
      "avatar_url": ""
    }
    
    {
      "nickname": "",
      "avatar_url": "",
      "admin": true
    }
  
  
    403: 未登录


GET /user/addresses 获取用户所有地址

    {
      "addresses": [
        {
          "address": "呵呵",
          "default": true,
          "fullname": "Ning",
          "id": 1,
          "phone_number": "18600588589"
        }
      ]
    }


POST /user/addresses 创建收货地址

    fullname: str(50)
    phone_number: str(20)  先不验证格式，不清楚澳洲座机和手机格式
    address: str(255)
    default: bool(true/false)


GET /categories 获取分类列表，按 order 排序

    200: 始终为 200
    
    {
      "categories": [
        {
          "id": 1, 
          "name": "\u6d4b\u8bd51", 
          "order": 1
        }, 
        {
          "id": 2, 
          "name": "\u6d4b\u8bd5\u5206\u7c7b2", 
          "order": 1
        }
      ]
    }
    

GET /categories/:category_id 获取分类信息

    {
      "id": 1, 
      "name": "\u6d4b\u8bd51", 
      "order": 1
    }


POST /categories 创建菜品分类 [Admin]

    name: str(50)
    order: smallint 0-65535
    
    
    201: 成功
    400: 参数有误
    
    {
      "errors": {...}
    }
    
    403: 未登录或非管理员


PUT /categories/:id 编辑菜品分类 [Admin]

    name: str(50)
    order: smallint 0-65535
    
    
    204: 成功
    400: 参数有误
    {
      "errors": {...}
    }
    
    403: 未登录或非管理员


GET /products 获取所有菜品，按分类 order 排序

    200: 始终为 200
    
    // _.flatten(_.map(data.products, _.values))
    
    {
      "products": [
        {
          "\u6d4b\u8bd51": [
            {
              "id": 1, 
              "name": "\u53ef\u53e3\u53ef\u4e50", 
              "pic_url": "http://x.com", 
              "price": 200, 
              "available": true,   // 非管理员登录只能看见 available 为 true 的菜品
              "unit": "\u74f6"
            }
          ]
        }, 
        {
          "\u6d4b\u8bd5\u5206\u7c7b2": []
        }
      ]
    }


POST /products 创建菜品 [Admin]

    category_id: int
    name: str(50)
    pic_url: str(255)
    price: int 0-9999999 分
    available: bool(true/false)
    unit: str(20)
    
    
    201: 成功
    400: 参数有误
    {
      "errors": {...}
    }
    
    403: 未登录或非管理员


GET /products/:id 获取菜品信息

    {
      "category": {
        "id": 1, 
        "name": "t1"
      }, 
      "id": 1, 
      "name": "\u83dc1", 
      "pic_url": "http://b.hiphotos.baidu.com/baike/w%3D268/sign=b8af48a0a9014c08193b2fa3327a025b/9922720e0cf3d7ca2a40fa7ff21fbe096b63a901.jpg", 
      "price": 1, 
      "available": true, 
      "unit": "\u5206"
    }
    
    
PUT /products/:id 更新菜品 [Admin]

    category_id: int
    name: str(50)
    pic_url: str(255)
    price: int 0-9999999 分
    available: bool(true/false)
    unit: str(20)
    
    
    204: 成功
    400: 参数有误
    {
      "errors": {...}
    }
    
    403: 未登录或非管理员


GET /orders 订餐列表，管理员获取所有订单，普通用户获取自己订单

    ?finished=0/1 0: 待处理订单，1: 已完成订单，默认为全部订单

    {
      "orders": [
        {
          "accepted_at": null, 
          "address": "\u5475\u5475", 
          "amount": 200, 
          "closed_at": null, 
          "pic_url": "http://x", 
          "comment": "\u53ef\u53e3\u53ef\u4e50\u7b491\u4ef6\u5546\u54c1", 
          "created_at": 1455730138, 
          "description": "", 
          "finished_at": null, 
          "fullname": "Ning", 
          "id": 1, 
          "cod": false,
          "paid": false, 
          "paid_at": null, 
          "phone_number": "18600588589", 
          # CLOSED: 已关闭, FINISHED: 已完成,
          # ACCEPTED: 已接单, PAID: 已支付,
          # CREATED: 新订单（可能货到付款）
          "status": "CREATED",  
          "valid": true    # valid 为 true 表明可以接单，为 false 表明需要支付
        }
      ]
    }


POST /orders 下单

    address_id: int
    items: str  product_idxamount,... 如 1x1,2x1
    cod: bool(true/false)
    description: optional, str
    
    201: 成功
    {
      "order_id": 1,
      "amount": 200
    }


GET /orders/:order_id 获取订单详情，用户只能获取自己的订单，管理员可以获取所有订单

    {
      "accepted_at": null, 
      "address": "address", 
      "amount": 1, 
      "closed_at": null, 
      "pic_url": "http://x", 
      "comment": "\u83dc1\u7b491\u4ef6\u5546\u54c1", 
      "created_at": 1455877358, 
      "description": "xxx", 
      "finished_at": null, 
      "fullname": "\u5c0f\u661f\u661f", 
      "id": 1, 
      "items": [
        {
          "amount": 1, 
          "name": "\u83dc1", 
          "price": 1, 
          "product_id": 1
        }
      ], 
      "cod": false, 
      "paid": false, 
      "paid_at": null, 
      "phone_number": "18600588589", 
      "status": "CREATED", 
      "valid": true
    }


POST /orders/:order_id/charge 在线支付

    token: stripe.js
    
    200: 成功 or 失败
    {
      "succeed": true/false
    }
    404: 订单不存在


PUT /orders/:order_id/accept 接单 [Admin]

    200: 成功
    404: 订单不存在


PUT /orders/:order_id/finish 完成订单，送达 [Admin]

    200: 成功
    404: 订单不存在


PUT /orders/:order_id/close 关闭订单 [Admin]

    200: 成功
    404: 订单不存在


POST /upload 上传文件 [Admin]

    201: 上传成功
    {
        "url": "http://7xqzzf.com2.z0.glb.qiniucdn.com/FqxXgtcWUybkWJJtLzY6y2T6qNQQ"
    }