# coding: utf-8
from __future__ import unicode_literals

from rq.decorators import job
import redis
import urlparse
from hashlib import md5
import xmltodict
import requests
import json

from flask import Flask

from main import User, Order, now_app


API_BASE = 'https://api.weixin.qq.com/cgi-bin/'

app = Flask(__name__)
app.config.from_pyfile('config.py')

WECHAT_PUSH_RQ_NAME = app.config.get('WECHAT_PUSH_RQ_NAME', 'wechat_push_rq')

RQ_REDIS = redis.Redis(
    host=app.config.get('redis_host', '127.0.0.1'),
    port=app.config.get('redis_port', '6379'),
    db=0
)

redis_cache_pool = redis.ConnectionPool(
    host=app.config.get('redis_host', '127.0.0.1'),
    port=app.config.get('redis_port', '6379'),
    db=app.config.get('redis_db', 2))
redis_cache = redis.Redis(connection_pool=redis_cache_pool)

##
# rq job
#
@job(WECHAT_PUSH_RQ_NAME, connection=RQ_REDIS, timeout=120)
def new_order_push(order_id):
    users = User.query.filter_by(is_admin=True).all()
    order = Order.query.filter_by(id=order_id).first()
    if order and users:
        for u in users:
            if u.openid:
                new_order_push_message(order, u.openid)


##
# wechat util
#


def new_order_push_message(order, openid):
    data = new_order_push_data(order)
    post_data = {
        "touser": openid,
        "template_id": app.config['NEW_ORDER_TEMPLATE_ID'],
        "url": app.config['NEW_ORDER_URL'],
        "data": data,
        "topcolor": u"#ed6a43",
    }
    try:
        result = wechat_send(post_data)
        if result and result['errcode'] != 0:
            error = '推送失败: %s' % result['errmsg']
            app.logger.error(error)
    except Exception as e:
        error = '推送失败: %s' % e
        app.logger.error(error)


def new_order_push_data(order):
    return {
        "first": {
            "value": "收到一个新的订单, 请注意查看！",
            "color": "#173177"
        },
        "Day": {
            "value": "%s" % now_app().strftime('%Y-%m-%d %H:%M:%S'),  # 日期
            "color": "#173177"
        },
        "orderId": {
            "value": "%s" % order.id,  # 订单编号
            "color": "#173177"
        },
        "orderType": {
            "value": "外卖单",    # 订单类型
            "color": "#173177"
        },
        "customerName": {
            "value": "%s" % order.fullname,    # 联系人
            "color": "#173177"
        },
        "customerPhone": {
            "value": "%s" % order.phone_number,    # 联系电话
            "color": "#173177"
        },
        "remark": {
            "value": "订单金额: %s元 \n付款状态: %s. \n请及时处理您的订单" % (
                order.amount,
                '已支付' if order.paid else '未支付'),   # 订单总额&付款状态
            "color": "#173177"
        }
    }


def logging_request(resp, *args, **kwargs):
    try:
        status_code = resp.status_code
        if status_code >= 400:
            raise Exception('status_code: %s' % status_code)
        try:
            ret = resp.json()
            errcode = ret.get('errcode')
            if errcode is not None and errcode != 0:
                raise Exception('errcode: %s' % errcode)
        except ValueError:  # 返回值不是 JSON
            try:
                resp_dict = xmltodict.parse(resp.content, encoding='utf-8')['xml']
                return_code = resp_dict.get('return_code')
                result_code = resp_dict.get('result_code')
                if not (return_code == result_code == 'SUCCESS'):
                    raise Exception('return_code: %s' % return_code)
            except xmltodict.expat.error:
                pass
    except:
        app.logger.error(
            'Request wechat API error: %s' % format_resp(resp)
        )
        return
    if not app.config['DEBUG']:
        return
    app.logger.info(format_resp(resp))


def format_resp(resp):
    req = resp.request
    return (
        '\n=====request======:'
        '\n%s -> %s'
        '\nheaders:\n%r'
        '\nbody:\n%r'

        '\n=====response=====:'
        '\nstatus:%s %r'
        '\nheaders:\n%r'
        '\nbody:\n%r'

        '\n=====end=========='
        % (
            req.method, req.url, req.headers, req.body,
            resp.status_code, resp.reason, resp.headers, resp.content
        )
    )
request_hook = {'response': logging_request}


def cache_key_access_token(appid, secret):
    return 'wechat:{appid}:{secret}:access_token'.format(
        appid=appid, secret=md5(secret).hexdigest()
    )


def fetch_access_token(appid, app_secret):
    """获取公众号调用各接口时所需的 access_token"""
    url = API_BASE + 'token'
    params = {
        'grant_type': 'client_credential',
        'appid': appid,
        'secret': app_secret,
    }
    resp = requests.get(url, params=params, hooks=request_hook)
    resp_json = resp.json()
    ret = resp_json['access_token']
    cache_key = cache_key_access_token(appid, app_secret)
    redis_cache.set(cache_key, ret, ex=resp_json['expires_in'] - 5)
    return ret


def get_access_token():
    appid = app.config['WECHAT_APP_ID']
    app_secret = app.config['WECHAT_APP_SECRET']
    ret = redis_cache.get(cache_key_access_token(appid, app_secret))
    if not ret:
        ret = fetch_access_token(appid, app_secret)
    return ret


def _post(url, payload):
    resp = requests.post(
        urlparse.urljoin(API_BASE, url),
        params={
            'access_token': get_access_token(),
        },
        data=json.dumps(payload),
        hooks=request_hook
    )
    return resp


def wechat_send(payload):
    resp = _post('message/template/send', payload)
    result = resp.json()
    return result
