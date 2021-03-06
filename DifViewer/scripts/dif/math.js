function BoxF(minx, miny, minz, maxx, maxy, maxz) {
	this.minx = minx;
	this.miny = miny;
	this.minz = minz;
	this.maxx = maxx;
	this.maxy = maxy;
	this.maxz = maxz;
}

Reader.prototype.readBoxF = function() {
	return new BoxF(this.readF32(), this.readF32(), this.readF32(), this.readF32(), this.readF32(), this.readF32());
};
Writer.prototype.writeBoxF = function(val) {
	this.writeF32(val.minx);
	this.writeF32(val.miny);
	this.writeF32(val.minz);
	this.writeF32(val.maxx);
	this.writeF32(val.maxy);
	this.writeF32(val.maxz);
};

function SphereF(originx, originy, originz, radius) {
	this.originx = originx;
	this.originy = originy;
	this.originz = originz;
	this.radius = radius;
}

Reader.prototype.readSphereF = function() {
	return new SphereF(this.readF32(), this.readF32(), this.readF32(), this.readF32());
};

Writer.prototype.writeSphereF = function(val) {
	this.writeF32(val.originx);
	this.writeF32(val.originy);
	this.writeF32(val.originz);
	this.writeF32(val.radius);
};

Reader.prototype.readPoint3F = function() {
	return [this.readF32(), this.readF32(), this.readF32()];
};

Writer.prototype.writePoint3F = function(val) {
	this.writeF32(val[0]);
	this.writeF32(val[1]);
	this.writeF32(val[2]);
};

Reader.prototype.readPoint4F = function() {
	return [this.readF32(), this.readF32(), this.readF32(), this.readF32()];
};

Writer.prototype.writePoint4F = function(val) {
	this.writeF32(val[0]);
	this.writeF32(val[1]);
	this.writeF32(val[2]);
	this.writeF32(val[3]);
};

Reader.prototype.readQuatF = function() {
	return [this.readF32(), this.readF32(), this.readF32(), this.readF32()];
};

Writer.prototype.writeQuatF = function(val) {
	this.writeF32(val[0]);
	this.writeF32(val[1]);
	this.writeF32(val[2]);
	this.writeF32(val[3]);
};

function PlaneF(x, y, z, d) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.d = d;
}

Reader.prototype.readPlaneF = function() {
	return new PlaneF(this.readF32(), this.readF32(), this.readF32(), this.readF32());
};

Writer.prototype.writePlaneF = function(val) {
	this.writeF32(val.x);
	this.writeF32(val.y);
	this.writeF32(val.z);
	this.writeF32(val.d);
};