# coding: utf-8
# https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfd4e44f020a1f727&redirect_uri=http%3A%2F%2Fwm.9xi.com%2Flogin&response_type=code&scope=snsapi_userinfo&connect_redirect=1#wechat_redirect
# http://7xqzzf.com5.z0.glb.clouddn.com/logo.jpg
# GyAUp5w2ztNX7ANv

# Copyright (C) 2015-2016 <raymond_jc@me.com> - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential

from __future__ import unicode_literals

import json
import time
from collections import OrderedDict
from datetime import datetime
from functools import wraps
# from urllib import urlencode
try:
	from urllib import urlencode
except ImportError:
	from urllib.parse import urlencode

from flask import Flask
from flask import abort, g, jsonify, redirect, request, session
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import Form
from werkzeug import secure_filename

import pytz
import qiniu
import requests
import stripe
import wtforms as forms

import sys,os
import time,random
import io

if sys.platform.startswith('win'):
	app = Flask(__name__,static_folder='/static')
else:
	app = Flask(__name__,static_folder='/path/to/MrMengOnline/static')
app.config.from_pyfile('config.py')
db = SQLAlchemy(app)

app_tz = pytz.timezone(app.config.get('APP_TIMEZONE', 'Australia/Sydney'))

UPLOAD_FOLDER = '/path/to/MrMengOnline/media'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

#
# Utils
#


def now():
	return datetime.utcnow()


def now_app():
	return datetime.now(app_tz)


def now_ts():
	return to_ts(now())


def from_ts(ts, timezone=pytz.utc):
	dt = datetime.fromtimestamp(ts, tz=timezone)
	return make_naive(dt)


def to_ts(dt, timezone=pytz.utc):
	dt = make_aware(dt, timezone)
	utc_dt = dt if timezone is pytz.utc else dt.astimezone(pytz.utc)
	dt_tuple = utc_dt.timetuple()
	return int(time.mktime(dt_tuple) - time.timezone)


def is_naive(value):
	try:
		return value.utcoffset() is None
	except AttributeError:
		raise ValueError('{!r} is not a datetime'.format(value))


def make_aware(value, timezone=pytz.utc):
	if not is_naive(value):
		return value

	# 这里不需要判断类型了，is_naive 做了
	return value.replace(tzinfo=timezone)


def make_naive(value):
	if is_naive(value):
		return value
	return value.replace(tzinfo=None)


cdn_auth = qiniu.Auth(app.config['QINIU_AK'], app.config['QINIU_SK'])


def cdn_upload(data, key=None, mime_type='application/octet-stream'):
	token = cdn_auth.upload_token(app.config['CDN_BUCKET'], key=key)
	ret, _ = qiniu.put_data(token, key, data, mime_type=mime_type)
	return ret


def cdn_upload_url(url):
	app.logger.error('url, %s', url)
	r = requests.get(url, verify=False)
	# key = str(time.time()).replace('.','') + str(random.randint(0,9))
	return cdn_upload(
		r.content,
		mime_type=r.headers.get('content-type', 'application/octet-stream')
	)


def cdn_url(key, default=''):
	if isinstance(key, dict):
		key = key.get('key')

	if key:
		return 'http://{!s}/{!s}'.format(app.config['CDN_HOST'], key)
	return default


def login_url(redirect_to='http://{!s}/login'.format(app.config['APP_HOST'])):
	params = OrderedDict([
		('appid', app.config['WECHAT_APP_ID']),
		('redirect_uri', redirect_to),
		('response_type', 'code'),
		('scope', 'snsapi_userinfo'),

	])
	return '{!s}?{!s}{!s}'.format(
		'https://open.weixin.qq.com/connect/oauth2/authorize',
		urlencode(params),
		'#wechat_redirect'
	)


def wechat_access_token(code):
	params = {
		'appid': app.config['WECHAT_APP_ID'],
		'secret': app.config['WECHAT_APP_SECRET'],
		'code': code,
		'grant_type': 'authorization_code',
		# 'grant_type': 'client_credential',
	}
	r = requests.get(
		'https://api.weixin.qq.com/sns/oauth2/access_token', params=params
	)
	# r = requests.get(
	# 	'https://api.weixin.qq.com/cgi-bin/token?', params=params
	# )
	
	print('type_r:',type(r))
	return r.json()

def wechat_refresh_token(access_token):
	params = {
		'appid': app.config['WECHAT_APP_ID'],
		'grant_type': 'refresh_token',
		'refresh_token': access_token['refresh_token'],
	}
	r = requests.get(
		'https://api.weixin.qq.com/sns/oauth2/refresh_token?', params=params
	)
	return r.json()

def wechat_user_info(refresh_token):
	print(type(refresh_token))
	for k,v in refresh_token.items():
		print('item in refresh_token:',k,v)
	# if 'access_token' not in session:
	# 	session['access_token'] = refresh_token['access_token']
	# if 'openid' not in session:
	# 	session['openid'] = refresh_token['openid']
	# print('access_token in session:',session['access_token'])
	# print('openid in session:',session['openid'])
	params = {
		'access_token': refresh_token['access_token'],
		'openid': refresh_token['openid'],
		'lang': 'en',
		# 'lang': 'zh_CN',
	}
	
	r = requests.get('https://api.weixin.qq.com/sns/userinfo', params=params)
	# r = requests.get('https://api.weixin.qq.com/cgi-bin/user/info?', params=params)
	print('userinfo:',r)
	print('userinfo to json:',r.json())
	return r.json()


#
# Models
#


class User(db.Model):
	__tablename__ = 'users'

	id = db.Column(db.Integer, primary_key=True)
	openid = db.Column(db.String(255), unique=True)
	nickname = db.Column(db.String(255), default='')
	avatar_url = db.Column(db.String(255), default='')
	# unknown: -1; male: 0; female: 1
	# gender = db.Column(db.SmallInteger, default=-1)
	is_admin = db.Column(db.Boolean, default=False)
	# stripe_customer_id = db.Column(db.String(255), default='')


class Address(db.Model):
	__tablename__ = 'user_addresses'

	id = db.Column(db.Integer, primary_key=True)
	user_id = db.Column(db.Integer, nullable=False)
	fullname = db.Column(db.String(50), default='')
	phone_number = db.Column(db.String(20), default='')
	address = db.Column(db.String(255), default='')
	default = db.Column(db.Boolean, default=False)

	@classmethod
	def for_user(cls, user):
		return cls.query.filter(cls.user_id == user.id)


class Category(db.Model):
	__tablename__ = 'categories'

	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(50), default='')
	order = db.Column(db.SmallInteger, default=0)

	@classmethod
	def sorted(cls):
		return cls.query.order_by(cls.order.asc())


class Product(db.Model):
	__tablename__ = 'products'

	id = db.Column(db.Integer, primary_key=True)
	category_id = db.Column(db.Integer, nullable=False)
	name = db.Column(db.String(50), default='')
	pic_url = db.Column(db.String(255), default='')
	price = db.Column(db.Integer, default=0)
	available = db.Column(db.Boolean, default=False)
	unit = db.Column(db.String(20), default='')

	@classmethod
	def orderable(cls):
		return cls.query.filter(
			cls.available.is_(True),
		)


class Order(db.Model):
	__tablename__ = 'orders'

	id = db.Column(db.Integer, primary_key=True)
	user_id = db.Column(db.Integer, nullable=False)
	amount = db.Column(db.Integer, default=0)
	cod = db.Column(db.Boolean, default=False)
	paid = db.Column(db.Boolean, default=False)
	pic_url = db.Column(db.String(255), default='')
	comment = db.Column(db.Text, default='')
	description = db.Column(db.Text, default='')
	fullname = db.Column(db.String(50), default='')
	phone_number = db.Column(db.String(20), default='')
	address = db.Column(db.String(255), default='')
	created_at = db.Column(db.Integer)
	paid_at = db.Column(db.Integer)
	accepted_at = db.Column(db.Integer)
	finished_at = db.Column(db.Integer)
	closed_at = db.Column(db.Integer)

	@classmethod
	def for_user(cls, user):
		return cls.query.filter(cls.user_id == user.id)

	# status = db.Column(db.SmallInteger, default=0)
	@property
	def status(self):
		if self.closed_at:
			return 'CLOSED'
		elif self.finished_at:
			return 'FINISHED'
		elif self.accepted_at:
			return 'ACCEPTED'
		elif self.paid:
			return 'PAID'

		return 'CREATED'

	@property
	def valid(self):
		return bool(not self.closed_at and (self.paid or self.cod))


class OrderItem(db.Model):
	__tablename__ = 'order_items'

	id = db.Column(db.Integer, primary_key=True)
	order_id = db.Column(db.Integer, nullable=False)
	product_id = db.Column(db.Integer, nullable=False)
	name = db.Column(db.String(50), default='')
	price = db.Column(db.Integer, default=0)
	amount = db.Column(db.Integer, default=1)

	@classmethod
	def for_order(cls, order):
		return cls.query.filter(cls.order_id == order.id)


class Payment(db.Model):
	__tablename__ = 'payments'

	id = db.Column(db.Integer, primary_key=True)
	order_id = db.Column(db.Integer, nullable=False)
	amount = db.Column(db.Integer, default=0)
	token = db.Column(db.String(50))
	succeed = db.Column(db.Boolean, default=False)
	response = db.Column(db.Text, default='')

	@classmethod
	def create(cls, order, token):
		payment = cls()
		payment.order_id = order.id
		payment.amount = order.amount
		payment.token = token
		try:
			resp = stripe.Charge.create(
				app.config['STRIPE_SECRET_KEY'], currency='AUD',
				amount=order.amount, source=token,
				description='Charge for {:d}'.format(order.id)
			)
		except stripe.InvalidRequestError:
			return payment
		payment.succeed = resp['paid']
		payment.response = json.dumps(resp)
		if payment.succeed:
			order.paid = True
			order.paid_at = now_ts()
			db.session.add(order)
		else:
			payment.succeed = False
		db.session.add(payment)
		db.session.commit()

		if payment.succeed:
			# 微信模板推送
			from rq_task import new_order_push
			new_order_push.delay(order.id)

		return payment


# Refund


#
# Decorators
#

def login_required(func):
	@wraps(func)
	def wrapper(*args, **kwargs):
		if g.user:
			return func(*args, **kwargs)
		# return jsonify({'login_url': login_url()}), 403
		abort(403)

	return wrapper


def admin_required(func):
	@wraps(func)
	def wrapper(*args, **kwargs):
		if g.user and g.user.is_admin:
			return func(*args, **kwargs)
		abort(403)

	return wrapper


#
# Forms
#


class AddressBaseForm(Form):
	fullname = forms.StringField('fullname', validators=[
		forms.validators.DataRequired(),
		forms.validators.Length(min=1, max=50),
	])
	phone_number = forms.StringField('phone_number', validators=[
		forms.validators.DataRequired(),
		forms.validators.Length(min=1, max=20),
	])
	address = forms.StringField('address', validators=[
		forms.validators.DataRequired(),
		forms.validators.Length(min=1, max=255)
	])
	default = forms.BooleanField('default')


class AddressCreationForm(AddressBaseForm):
	pass


class AddressUpdateForm(AddressBaseForm):
	pass


class CategoryBaseForm(Form):
	name = forms.StringField('name', validators=[
		forms.validators.DataRequired(),
		forms.validators.Length(min=1, max=50),
	])
	order = forms.IntegerField('order', validators=[
		forms.validators.DataRequired(),
		forms.validators.NumberRange(0, 65535),
	])


class CategoryCreationForm(CategoryBaseForm):
	def validate_name(self, field):
		if Category.query.filter(
			Category.name == field.data
		).first():
			raise forms.ValidationError('[409] name already exist')


class CategoryUpdateForm(CategoryBaseForm):
	def __init__(self, instance, *args, **kwargs):
		self.instance = instance
		super(CategoryUpdateForm, self).__init__(*args, **kwargs)

	def validate_name(self, field):
		if Category.query.filter(
			Category.id != self.instance.id,
			Category.name == field.data,
		).first():
			raise forms.ValidationError('[409] name already exist')


class ProductBaseForm(Form):
	category_id = forms.IntegerField('category_id', validators=[
		forms.validators.DataRequired(),
	])
	name = forms.StringField('name', validators=[
		forms.validators.DataRequired(),
		forms.validators.Length(min=1, max=50),
	])
	pic_url = forms.StringField('pic_url', validators=[
		forms.validators.DataRequired(),
		forms.validators.Length(max=255),
		forms.validators.URL(),
	])
	price = forms.IntegerField('price', validators=[
		forms.validators.DataRequired(),
		forms.validators.NumberRange(0, 9999999),
	])
	available = forms.BooleanField('available', default=True)
	unit = forms.StringField('unit', validators=[
		forms.validators.DataRequired(),
		forms.validators.Length(min=1, max=20),
	])

	def validate_category_id(self, field):
		if not Category.query.filter(Category.id == field.data).first():
			raise forms.ValidationError('invalid category_id[404]')


class ProductCreationForm(ProductBaseForm):
	pass


class ProductUpdateForm(ProductBaseForm):
	pass


class OrderCreationForm(Form):
	pass


class FileUploadForm(Form):
	file = forms.FileField('file', validators=[
		forms.validators.DataRequired(),
	])


#
# Views
#


@app.route('/')
def index():
	if sys.platform.startswith('win'):
		BASE_DIR = os.getcwd().replace('\\','/').replace('backend','').encode('utf-8')
		print(BASE_DIR.decode() + 'frontend/index.html')
		return open(BASE_DIR.decode() + 'frontend/index.html').read()
	else:
		return open('/path/to/MrMengOnline/frontend/index.html').read()
	# return open('/path/to/MrMengOnline/frontend/checkout.html').read()
	return '<a href="/user">/user</a>'


@app.route('/login')
def login():
	code = request.args.get('code')
	print('code from request.args:',code)
	access_token = wechat_access_token(code)
	refresh_token = wechat_refresh_token(access_token)
	print(type(refresh_token))
	for k,v in refresh_token.items():
		print('access_token in login:',k,v)

	user_info = wechat_user_info(refresh_token)
	for k,v in user_info.items():
		print('user_info in login:',k,v)
	# if 'nickname' not in session:
	# 	session['nickname'] = user_info['nickname']
	# if 'headimgurl' not in session:
	# 	session['headimgurl'] = user_info['headimgurl']

	user = User.query.filter(
		User.openid == user_info['openid']
	).first() or User()
	user.openid = user_info['openid']
	user.nickname = user_info['nickname'].encode('latin-1').decode('utf-8')
	user.avatar_url = user_info['headimgurl']
	# user.avatar_url = cdn_url(cdn_upload(user_info['headimgurl']))
	db.session.add(user)
	db.session.commit()
	session['user_id'] = user.id
	return redirect('/')


@app.route('/user')
@login_required
def get_user():
	user = g.user
	resp = {
		'nickname': user.nickname,
		'avatar_url': user.avatar_url,
	}

	if user.is_admin:
		resp['admin'] = True
	return jsonify(resp)


@app.route('/user/addresses')
@login_required
def get_addresses():
	ret = []
	for address in Address.for_user(g.user).all():
		ret.append({
			'id': address.id,
			'fullname': address.fullname,
			'phone_number': address.phone_number,
			'address': address.address,
			'default': address.default,
		})
	return jsonify({'addresses': ret})


@app.route('/user/addresses', methods=['POST'])
@login_required
def create_address():
	form = AddressCreationForm()
	if form.validate_on_submit():
		if form.default.data:
			Address.for_user(g.user).update({'default': False})
		address = Address()
		form.populate_obj(address)
		address.user_id = g.user.id
		db.session.add(address)
		db.session.commit()
		return '', 201
	return jsonify({'errors': form.errors}), 400


@app.route('/user/addresses/<int:address_id>', methods=['PUT'])
@login_required
def update_address(address_id):
	address = Address.for_user(g.user) \
		.filter(Address.id == address_id).first_or_404()
	form = AddressUpdateForm()
	if form.validate_on_submit():
		if form.default.data:
			Address.for_user(g.user).update({'default': False})
		form.populate_obj(address)
		db.session.add(address)
		db.session.commit()
		return '', 204
	return jsonify({'errors': form.errors}), 400


@app.route('/categories')
def get_categories():
	ret = []
	for category in Category.sorted().all():
		ret.append({
			'id': category.id,
			'name': category.name,
			'order': category.order,
		})
	return jsonify({'categories': ret})


@app.route('/categories', methods=['POST'])
@admin_required
def create_category():
	form = CategoryCreationForm()
	if form.validate_on_submit():
		category = Category()
		form.populate_obj(category)
		db.session.add(category)
		db.session.commit()
		return '', 201
	return jsonify({'errors': form.errors}), 400


@app.route('/categories/<int:category_id>')
def get_category(category_id):
	category = Category.query.get_or_404(category_id)
	ret = {
		'id': category.id,
		'name': category.name,
		'order': category.order,
	}
	return jsonify(ret)


@app.route('/categories/<int:category_id>', methods=['PUT'])
@admin_required
def update_category(category_id):
	category = Category.query.get_or_404(category_id)
	form = CategoryUpdateForm(category)
	if form.validate_on_submit():
		form.populate_obj(category)
		db.session.add(category)
		db.session.commit()
		return '', 204
	return jsonify({'errors': form.errors}), 400


@app.route('/products')
def get_products():
	categories = Category.sorted().all()
	categories_cache = {}
	for category in categories:
		categories_cache[category.id] = {
			'category': category,
			'products': []
		}

	if g.user and g.user.is_admin:
		products = Product.query
	else:
		products = Product.orderable()

	for product in products.all():
		categories_cache[product.category_id]['products'].append({
			'id': product.id,
			'name': product.name,
			'pic_url': product.pic_url,
			'price': product.price,
			'available': product.available,
			'unit': product.unit,
		})

	return jsonify({
		'products': [
			{category.name: categories_cache[category.id]['products']}
			for category in categories
		],
	})


@app.route('/products', methods=['POST'])
@admin_required
def create_product():
	form = ProductCreationForm()
	if form.validate_on_submit():
		product = Product()
		form.populate_obj(product)
		db.session.add(product)
		db.session.commit()
		return '', 201
	return jsonify({'errors': form.errors}), 400


@app.route('/products/<int:product_id>')
@login_required
def get_product(product_id):
	if g.user.is_admin:
		products = Product.query
	else:
		products = Product.orderable()
	product = products.filter(Product.id == product_id).first_or_404()
	category = Category.query.get_or_404(product.category_id)
	ret = {
		'id': product.id,
		'name': product.name,
		'pic_url': product.pic_url,
		'price': product.price,
		'available': product.available,
		'unit': product.unit,
		'category': {
			'id': category.id,
			'name': category.name,
		}
	}
	return jsonify(ret)


@app.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
	product = Product.query.get_or_404(product_id)
	form = ProductUpdateForm()
	if form.validate_on_submit():
		form.populate_obj(product)
		db.session.add(product)
		db.session.commit()
		return '', 201
	return jsonify({'errors': form.errors}), 400


@app.route('/orders')
@login_required
def get_orders():
	user = g.user
	if user.is_admin:
		query = Order.query
	else:
		query = Order.for_user(user)

	finished = request.args.get('finished', '')
	if finished == '1':
		query = query.filter(
			Order.finished_at.isnot(None)
		)
	elif finished == '0':
		query = query.filter(
			Order.finished_at.is_(None)
		)

	ret = []
	for order in query.order_by(Order.id.desc()).all():
		o = {
			'id': order.id,
			'amount': order.amount,
			'cod': order.cod,
			'paid': order.paid,
			'pic_url': order.pic_url,
			'comment': order.comment,
			'description': order.description,
			'fullname': order.fullname,
			'phone_number': order.phone_number,
			'address': order.address,
			'status': order.status,
			'valid': order.valid,
			'created_at': order.created_at,
			'paid_at': order.paid_at if order.paid else None,
			'accepted_at': order.accepted_at,
			'finished_at': order.finished_at,
			'closed_at': order.closed_at,
			'items': [],
		}
		# TODO: N+1
		for item in OrderItem.for_order(order):
			o['items'].append({
				'product_id': item.product_id,
				'name': item.name,
				'price': item.price,
				'amount': item.amount,
			})
		ret.append(o)
	return jsonify({'orders': ret})


@app.route('/orders', methods=['POST'])
@login_required
def create_order():
	try:
		address_id = int(request.form['address_id'])
		items = [map(int, i.split('x'))
				 for i in request.form['items'].split(',')]
		cod = request.form['cod'] not in ('false', '')
		description = request.form.get('description', '')
		if not items:
			return '1', 400
	except (KeyError, TypeError, ValueError):
		return '2', 400

	address = Address.for_user(g.user).filter(
		Address.id == address_id
	).first_or_404()
	products = {}
	for product in Product.orderable().filter(
		Product.id.in_([i[0] for i in items])
	).all():
		products[product.id] = product

	if not products:
		return '3', 400

	user = g.user
	order = Order()
	order.user_id = user.id
	order.amount = 0
	order.description = description
	order.fullname = address.fullname
	order.phone_number = address.phone_number
	order.address = address.address
	order.created_at = now_ts()
	order.cod = cod
	db.session.add(order)
	db.session.commit()
	first_product = products[items[0][0]]
	total_items = 0
	for (pid, amount) in items:
		if amount <= 0:
			continue
		product = products[pid]
		item = OrderItem()
		item.order_id = order.id
		item.product_id = product.id
		item.name = product.name
		item.price = product.price
		item.amount = amount
		total_items += amount
		order.amount += product.price * amount
		db.session.add(item)
	order.pic_url = first_product.pic_url
	order.comment = '{!s}等{:d}件商品'.format(first_product.name, total_items)
	db.session.add(order)
	db.session.commit()
	if order.cod:
		from rq_task import new_order_push
		new_order_push(order.id)
	return jsonify({'order_id': order.id, 'amount': order.amount}), 201


@app.route('/orders/<int:order_id>')
@login_required
def get_order(order_id):
	user = g.user
	if user.is_admin:
		query = Order.query
	else:
		query = Order.for_user(user)
	order = query.filter(
		Order.id == order_id
	).first_or_404()

	ret = {
		'id': order.id,
		'amount': order.amount,
		'cod': order.cod,
		'paid': order.paid,
		'pic_url': order.pic_url,
		'comment': order.comment,
		'description': order.description,
		'fullname': order.fullname,
		'phone_number': order.phone_number,
		'address': order.address,
		'status': order.status,
		'valid': order.valid,
		'created_at': order.created_at,
		'paid_at': order.paid_at if order.paid else None,
		'accepted_at': order.accepted_at,
		'finished_at': order.finished_at,
		'closed_at': order.closed_at,
		'items': []
	}

	for item in OrderItem.for_order(order):
		ret['items'].append({
			'product_id': item.product_id,
			'name': item.name,
			'price': item.price,
			'amount': item.amount,
		})

	return jsonify(ret)


@app.route('/orders/<int:order_id>/charge', methods=['POST'])
@login_required
def charge_order(order_id):
	token = request.form.get('token', '')
	if not token:
		return 'token is required', 400

	order = Order.for_user(g.user).filter(
		Order.id == order_id
	).first_or_404()
	payment = Payment.create(order, token)
	return jsonify({'succeed': payment.succeed})


@app.route('/orders/<int:order_id>/accept', methods=['PUT'])
@admin_required
def accept_order(order_id):
	order = Order.query.get_or_404(order_id)
	order.accepted_at = now_ts()
	db.session.add(order)
	db.session.commit()
	return ''


@app.route('/orders/<int:order_id>/finish', methods=['PUT'])
@admin_required
def finish_order(order_id):
	order = Order.query.get_or_404(order_id)
	order.finished_at = now_ts()
	db.session.add(order)
	db.session.commit()
	return ''


@app.route('/orders/<int:order_id>/close', methods=['PUT'])
@admin_required
def close_order(order_id):
	order = Order.query.get_or_404(order_id)
	order.closed_at = now_ts()
	db.session.add(order)
	db.session.commit()
	return ''


@app.route('/upload', methods=['POST'])
@admin_required
def upload_file():

	# f_key = str(time.time()).replace('.','') + str(random.randint(0,9))
	# print('f_key:',f_key)
	# r = cdn_upload(f.read())
	# f_key = request.files['file']
	# print(f_key)
	# f_data = io.BytesIO(f_key.read())
	# print('f_data1:',f_data) 
	# print(type(request.form))
	# for k,v in request.form.items():
	# 	print('items in form:',k,v)
	form = FileUploadForm()
	if form.validate_on_submit():
		f_key = ''
		# f_data = io.BytesIO(form.file.data)
		f_data = form.file.data
		print('f_data2:',f_data)
		r = cdn_upload(f_key,f_data)
		print('r:',r)
		return jsonify({'url': cdn_url(r)}), 201
	return jsonify({'errors': form.errors}), 400

# def allowed_file(filename):
# 	return '.' in filename and \
# 		   filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

# @app.route('/upload', methods=['POST'])
# @admin_required
# def upload_file():

# 	# UPLOAD_FOLDER = '/path/to/MrMengOnline/media'
# 	# ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
# 	f_key = str(time.time()).replace('.','') + str(random.randint(0,9))

# 	if request.method == 'POST':
# 		file = request.files['file']
# 		if file and allowed_file(file.filename):
# 			filename = secure_filename(file.filename)
# 			file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

# 			if file.filename in os.listdir(UPLOAD_FOLDER):
# 				f_name =  f_key + '.' +file.filename.rsplit('.', 1)[1]
# 				os.rename(os.path.join(UPLOAD_FOLDER,file.filename),os.path.join(UPLOAD_FOLDER,f_name))

# 			print('http://wm.9xi.com'+UPLOAD_FOLDER+'/'+f_name)
# 			return jsonify({'url': 'http://wm.9xi.com'+UPLOAD_FOLDER+'/'+f_name}), 201


@app.route('/test/<int:user_id>')
def test(user_id=1):
	user = User.query.get(user_id)
	if not user:
		return 'user not found'
	session['user_id'] = user.id
	return 'ok'


@app.before_request
def get_user():
	user_id = session.get('user_id')
	user = None
	if user_id:
		user = User.query.get(user_id)
		if not user:
			app.logger.warning('User not found: %d', user_id)
	g.user = user


@app.errorhandler(404)
def handle_404(_error):
	return 'not found', 404
#
#
# @app.route('/test_rq')
# def test_rq():
#     from rq_task import new_order_push
#     new_order_push.delay(1)
#     return 'ok'


if __name__ == '__main__':
	# db.create_all()
	app.debug = True
	app.run(host='0.0.0.0',port=80)
	# app.run()
