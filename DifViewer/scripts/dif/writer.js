function Writer() {
	this.bytes = [];

	this.version = {
		dif: {
			type: "?",
			version: 44
		},
		interior: {
			type: "?",
			version: 0
		},
		material: {
			version: 1
		},
		forceField: {
			version: 0
		},
		vehicleCollision: {
			version: 0
		}
	}
}

Writer.prototype.writeU8 = function(val) {
	this.bytes.push(val & 0xFF);
};

Writer.prototype.writeU16 = function(val) {
	this.writeU8(val & 0xFF);
	this.writeU8(val >> 8);
};

Writer.prototype.writeU32 = function(val) {
	this.writeU16(val & 0xFFFF);
	this.writeU16(val >> 16);
};

Writer.prototype.writeF32 = function(val) {
	var buffer = new ArrayBuffer(4);
	var intView = new Int32Array(buffer);
	var floatView = new Float32Array(buffer);
	floatView[0] = val;
	this.writeU32(intView[0]);
};

Writer.prototype.writeString = function(string) {
	this.writeU8(string.length);
	for (var i = 0; i < string.length; i ++) {
		this.writeU8(string.charCodeAt(i));
	}
};

Writer.prototype.writeDictionary = function(dictionary) {
	if (typeof(dictionary) === "undefined") {
		this.writeU32(0);
		return;
	}
	this.writeU32(Object.keys(dictionary).length);

	Object.keys(dictionary).forEach(function(key) {
		this.writeString(key);
		this.writeString(dictionary[key]);
	}, this);
};

Writer.prototype.writeArray = function(array, writeMethod) {
	if (typeof(array) === "undefined") {
		this.writeU32(0);
		return;
	}
	this.writeU32(array.length);
	for (var i = 0; i < array.length; i ++) {
		writeMethod(array[i]);
	}
};

Writer.prototype.writeArrayFlags = function(array, flags, writeMethod) {
	if (typeof(array) === "undefined") {
		this.writeU32(0);
		return;
	}
	this.writeU32(array.length);
	this.writeU32(flags);
	for (var i = 0; i < array.length; i ++) {
		writeMethod(array[i]);
	}
};

Writer.prototype.writePNG = function(png) {
	for (var i = 0; i < png.length; i ++) {
		this.writeU8(png[i]);
	}
};

Writer.prototype.writeColorF = function(val) {
	this.writeU8(val[0]);
	this.writeU8(val[1]);
	this.writeU8(val[2]);
	this.writeU8(val[3]);
};
