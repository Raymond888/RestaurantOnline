#!/usr/bin/env python
#encoding:utf8
#author: Raymongd_jc
#script_name： migrate.py

import json
import stripe
from main import now_ts
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand
 
app = Flask(__name__,static_folder='/path/to/MrMengOnline/frontend/static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://db_mrmeng:mrmengpw@120.25.151.183/db_mrmeng?charset=utf8'
 
db = SQLAlchemy(app)
migrate = Migrate(app, db)
 
manager = Manager(app)
manager.add_command('db', MigrateCommand)
 
 
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
 
if __name__ == '__main__':
	manager.run()







