/**
File:
	SortedLookupTable.js
Created By:
	(Class from http://blog.jcoglan.com/2010/10/18/i-am-a-fast-loop/)
	Copy->Pasted->Modified by Mario Gonzalez
	
Project	:
	Ogilvy Holiday Card 2010
Abstract:

	A sorted LookupTable is a data structure that provides us a way to iterate thru objects at a speed
	comparable to reverse while, but also have named keys as we would if we used an object (which provides very slow iteration)
	It also gives us O(log n) removal of objects.
Basic Usage:

	http://blog.jcoglan.com/2010/10/18/i-am-a-fast-loop/
*/
(function() {
	/**
	 *	LookupTable
	 */
	LookupTable = function()
	{
		this._keys = [];
		this._data = {};
		this.nextUUID = 0;
	};


	LookupTable.prototype.setObjectForKey = function(value, key)
	{
		if (!this._data.hasOwnProperty(key)) this._keys.push(key);
		this._data[key] = value;

		return value;
	};

	LookupTable.prototype.objectForKey = function(key)
	{
		return this._data[key];
	};

	LookupTable.prototype.forEach = function(block, context)
	{
		var keys = this._keys,
			data = this._data,
			i = keys.length,
			key;

		while (i--)
		{
			key = keys[i];
			block.call(context, key, data[key]);
		}
	};

	LookupTable.prototype.count = function()
	{
		return this._keys.length;
	};

	LookupTable.prototype.dealloc = function()
	{
		delete this._keys;
		delete this._data;
	};



	/**
	*	Sorted LookupTable,
	*/
	SortedLookupTable = function()
	{
		LookupTable.call(this);
	};

	SortedLookupTable.prototype = new LookupTable();

	SortedLookupTable.prototype.setObjectForKey = function(value, key)
	{
		if( !this._data.hasOwnProperty( key ) )
		{
			var index = this._indexOf(key);
			this._keys.splice(index, 0, key);
		}
		this._data[key] = value;

		return value;
	};

	SortedLookupTable.prototype.remove = function(key)
	{
		if (!this._data.hasOwnProperty(key)) return;
		delete this._data[key];
		var index = this._indexOf(key);
		this._keys.splice(index, 1);
	};

	SortedLookupTable.prototype._indexOf = function(key)
	{
		var keys = this._keys,
			n = keys.length,
			i = 0,
			d = n;

		if (n === 0) return 0;
		if (key < keys[0]) return 0;
		if (key > keys[n - 1]) return n;

		while (key !== keys[i] && d > 0.5) {
			d = d / 2;
			i += (key > keys[i] ? 1: -1) * Math.round(d);
			if (key > keys[i - 1] && key < keys[i]) d = 0;
		}
		return i;
	};

	return SortedLookupTable;
})();