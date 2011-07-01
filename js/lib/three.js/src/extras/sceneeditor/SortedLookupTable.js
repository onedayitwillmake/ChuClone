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
Basic UsaS:

	http://blog.jcoglan.com/2010/10/18/i-am-a-fast-loop/
*/
// @getify's solution

THREE.SceneEditor.Set = (function()
{
	var indexOf = Array.prototype.indexOf;

	if (typeof indexOf !== 'function')
	{
		indexOf = function(value)
		{
			for (var index = 0, length = this.length; index < length; index++)
			{
				if (this[index] === value)
				{
					return index;
				}
			}
			return -1;
		};
	}

	var Set = function() {
		this.set = [];
	};

	Set.prototype = {
		'constructor': Set,
		'put': function(value, key)
		{
			var index = indexOf.call(this.set, key);
			if (index !== -1 && index % 2 === 0)
			{
				this.set.splice(index, 2);
			}
			this.set.push(key, value);
		},
		'get': function(key)
		{
			var index = indexOf.call(this.set, key);
			return (index !== -1 && index % 2 === 0) ? this.set[++index] : null;
		},
		'containsKey': function(key)
		{
			var index = indexOf.call(this.set, key);
			return (index !== -1 && index % 2 === 0);
		},
		'containsValue': function(value)
		{
			var index = indexOf.call(this.set, value);
			return (index !== -1 && index % 2 !== 0);
		},
		'remove': function(key)
		{
			var index = indexOf.call(this.set, key),
					value = null;
			if (index !== -1 && index % 2 === 0)
			{
				value = this.set.splice(index, 2)[1];
			}
			return value;
		},

		'forEach': function(block, context)
		{
			var set = this.set,
				i = this.set.length-1,
				key;

			while (i > 0)
			{
				block.call(context, set[i - 1], set[key]);
				i-=2;
			}
		}
	};

	return Set;
}());

(function() {
	/**
	 *	LookupTable
	 */
	THREE.SceneEditor.LookupTable = function()
	{
		this._keys = [];
		this._data = {};
		this.nextUUID = 0;
	};


	THREE.SceneEditor.LookupTable.prototype.setObjectForKey = function(value, key)
	{
		if (!this._data.hasOwnProperty(key)) this._keys.push(key);
		this._data[key] = value;

		return value;
	};

	THREE.SceneEditor.LookupTable.prototype.objectForKey = function(key)
	{
		return this._data[key];
	};

	THREE.SceneEditor.LookupTable.prototype.forEach = function(block, context)
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

	THREE.SceneEditor.LookupTable.prototype.count = function()
	{
		return this._keys.length;
	};

	THREE.SceneEditor.LookupTable.prototype.dealloc = function()
	{
		delete this._keys;
		delete this._data;
	};



	/**
	*	Sorted LookupTable,
	*/
	THREE.SceneEditor.SortedLookupTable = function()
	{
		THREE.SceneEditor.LookupTable.call(this);
	};

	THREE.SceneEditor.SortedLookupTable.prototype = new THREE.SceneEditor.LookupTable();

	THREE.SceneEditor.SortedLookupTable.prototype.setObjectForKey = function(value, key)
	{
		if( !this._data.hasOwnProperty( key ) )
		{
			var index = this._indexOf(key);
			this._keys.splice(index, 0, key);
		}
		this._data[key] = value;

		return value;
	};

	THREE.SceneEditor.SortedLookupTable.prototype.remove = function(key)
	{
		if (!this._data.hasOwnProperty(key)) return;
		delete this._data[key];
		var index = this._indexOf(key);
		this._keys.splice(index, 1);
	};

	THREE.SceneEditor.SortedLookupTable.prototype._indexOf = function(key)
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
})();