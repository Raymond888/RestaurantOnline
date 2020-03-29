define('pagelet/handlebarHelp.js', function(require, exports, module){ Handlebars.registerHelper("isSelected", function(selected, id) {
	if (selected == id) {
		return "selected"
	}
})

Handlebars.registerHelper("payStatus", function(paid_at, valid) {
	if (paid_at) {
		return '已支付'
	} else if (valid) {
		return '货到付款'
	} else if (!valid) {
		return '待支付'
	}
})

Handlebars.registerHelper("formatTimestamp", function(timestamp) {
	return new Date((timestamp + 60 * 60 * 3)*1000).Format("MM-dd hh:mm");
})

Handlebars.registerHelper("formatPrice", function(price) {
	return price / 100;
})

Handlebars.registerHelper("buttonStatus", function(status) {
	if (!status) {
		return 'none'
	}
})

Handlebars.registerHelper("borderStatus", function(status) {
	if (status) {
		return 'finished'
	}
})

Handlebars.registerHelper("borderClass", function(status) {
	if (!status) {
		return 'no-accept'
	}
})

Handlebars.registerHelper("statusString", function(status) {
	if (status == 'FINISHED') {
		return '已完成'
	} else if (status == 'CLOSED') {
		return '已关闭'
	}
})

Handlebars.registerHelper("doneBorderStatus", function(status) {
	if (status == 'FINISHED') {
		return 'finished'
	} else if (status == 'CLOSED') {
		return 'closed'
	}
})

Handlebars.registerHelper("isChecked", function(status) {
	if (status) {
		return "checked"
	}
}) 
});