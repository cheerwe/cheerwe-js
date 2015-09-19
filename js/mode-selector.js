(function() {
	$we.ModeSelector = $we.Component.extend({
		data: [],
		valueField: 'value',
		textField: 'text',
		multiSelect: false,
		selectedCls: 'active',
		index: 0,
		name: '',
		events: [{
			event: 'click',
			selector: '[data-role="item"]',
			handler: '_onItemClick'
		}],
		_onItemClick: function(e) {
			var el = $(e.currentTarget);

			var index = this._selectItem(el);

			this.fire('select', {
				index: index,
				el: el
			});
		},
		_getItemsEl: function() {
			return this.$('[data-role="item"]');
		},
		select: function(index) {
			var els = this._getItemsEl();

			if (index < 0 || index >= els.length) {
				return;
			}

			var el = els.eq(index);
			this._selectItem(el);
		},
		setIndex: function(index) {
			this.select(index);
		},
		_selectItem: function(el) {
			var index = el.index();
			if (!this.multiSelect) {
				this.clearSelect();
			}

			el.addClass(this.selectedCls);

			var val = el.data('value');
			if (val !== undefined) {
				this._getNameEl().val(val);
			}
			return index;
		},
		_getNameEl: function() {
			return this.$('[name="' + this.name + '"]');
		},
		getSelctedIndex: function() {
			var indexList = [];

			this.getSelctedEls().each(function() {
				indexList.push($(this).index());
			});

			if (this.multiSelect) {
				return indexList;
			} else {
				return indexList.length ? indexList[0] : -1;
			}
		},
		getSelectedData: function() {
			var selectedIndex = this.getSelctedIndex();

			if (this.multiSelect) {
				var dataList = [];
				var data = this.data;

				for (var i = 0, len = selectedIndex.length; i < len; i++) {
					dataList.push(data[selectedIndex[i]]);
				}

				return dataList;
			}

			if (selectedIndex > -1 && selectedIndex < this.data.length) {
				return this.dataList[selectedIndex];
			}
		},
		getSelctedEls: function() {
			return this._getItemsEl().filter('.' + this.selectedCls);
		},
		clearSelect: function() {
			var cls = this.selectedCls;
			this.getSelctedEls().removeClass(cls);
		},
		render: function() {
			if (this.name && !this._getNameEl().length) {
				this.el.append('<input type="hidden" name="' + this.name + '" data-role="val"/>');
			}
		},
		renderList: function() {

		}
	});

	$we.autoRender('[data-role="wejs-mode-selector"]', $we.ModeSelector, {
		name: 'string',
		multiSelect: 'boolean',
		index: 'number',
		events: ['select']
	});

})();