# coding: utf-8

# Copyright (C) 2015-2016 <raymond_jc@me.com> - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential

from __future__ import unicode_literals

DEBUG = False 
SECRET_KEY = '123'

APP_HOST = 'wm.9xi.com'
APP_TIMEZONE = 'Australia/Sydney'

if DEBUG:
    APP_HOST = '120.25.151.183:5000'

# CDN
# CDN_HOST = '7xqzzf.com5.z0.glb.clouddn.com'
# CDN_BUCKET = 'waimai'
# QINIU_AK = 'cR7Y3BjkhDfOsbp6lQTVpNhUBQJf47kV_nNKJAqB'
# QINIU_SK = 'G5UKAhor6maZ7TAr0HMFGp1Qkn4S6yOhTlnRCQ9u'

# if DEBUG:
#     CDN_HOST = '7xqzzf.com2.z0.glb.qiniucdn.com'

CDN_HOST = 'o7426ax4b.bkt.clouddn.com'
CDN_BUCKET = 'mrmengonline'
QINIU_AK = '1--QeIWx_NZ9ZsouZgLuRsRnUZIlSVWuCpG7Yb9H'
QINIU_SK = 'Cf1WKd0PT885Ne_NlpFy9Rny4ZmJJFUz-tqyyOV7'
if DEBUG:
    CDN_HOST = 'o7426ax4b.bkt.clouddn.com'

# Flask-SQLAlchemy
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://db_mrmeng:mrmengpw@120.25.151.183/db_mrmeng?charset=utf8'
SQLALCHEMY_ECHO = DEBUG
SQLALCHEMY_POOL_SIZE = 5
SQLALCHEMY_POOL_RECYCLE = 60 * 60 * 1
SQLALCHEMY_MAX_OVERFLOW = 10
# suppress warning
SQLALCHEMY_TRACK_MODIFICATIONS = True


# Flask-WTF
WTF_CSRF_ENABLED = False
WTF_I18N_ENABLED = False

# Stripe
STRIPE_SECRET_KEY = 'sk_live_qyT8oRAYwU5pyhg3xVr7f3Yg'
STRIPE_PUBLISHABLE_KEY = 'pk_live_NfHJ5z4xen2ydqxUX7N6t8s8'

if DEBUG:
    STRIPE_SECRET_KEY = 'sk_test_b2uJl4RhI7h9qXzIiJmWF1zO'
    STRIPE_PUBLISHABLE_KEY = 'pk_test_yuCytuM0flv2mqm521cM1PKA'

# Wechat
WECHAT_APP_ID = 'wxfd4e44f020a1f727'
WECHAT_APP_SECRET = 'b0b2839fd8f9d92fe44e58dadb702ad3'

# first, Day, orderId, orderType, customerName, customerPhone, remark
NEW_ORDER_TEMPLATE_ID = 'bv9bIlZrFnOedibLKFQ2rv5evKfNJZ9okjval5LcSeg'

NEW_ORDER_URL = APP_HOST + '/frontend/9xi_waimai/page/index.html#orders'

WECHAT_PUSH_RQ_NAME = 'waimai_push_rq'
redis_host = '120.25.151.183'
redis_port = '6379'
redis_db = 5





