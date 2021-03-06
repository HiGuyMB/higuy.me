function ForceField() {

}

ForceField.prototype.read = function(reader) {
	reader.version.forceField.version = reader.readU32();
	this.name = reader.readString();
	this.trigger = reader.readArray(reader.readString.bind(reader));
	this.boundingBox = reader.readBoxF();
	this.boundingSphere = reader.readSphereF();
	this.normal = reader.readArray(reader.readPoint3F.bind(reader));
	this.plane = reader.readArray(reader.readFFPlane.bind(reader));
	this.bspNode = reader.readArray(reader.readFFBSPNode.bind(reader));
	this.bspSolidLeaf= reader.readArray(reader.readFFBSPSolidLeaf.bind(reader));
	this.index = reader.readArray(reader.readU32.bind(reader));
	this.surface = reader.readArray(reader.readFFSurface.bind(reader));
	this.solidLeafSurface = reader.readArray(reader.readU32.bind(reader));
	this.color = reader.readColorF();
};

Writer.prototype.writeForceField = function(val) {
	this.writeU32(this.version.forceField.version);
	this.writeString(val.name);
	this.writeArray(val.trigger, this.writeString.bind(this));
	this.writeBoxF(val.boundingBox);
	this.writeSphereF(val.boundingSphere);
	this.writeArray(val.normal, this.writePoint3F.bind(this));
	this.writeArray(val.plane, this.writeFFPlane.bind(this));
	this.writeArray(val.bspNode, this.writeFFBSPNode.bind(this));
	this.writeArray(val.bspSolidLeaf, this.writeFFBSPSolidLeaf.bind(this));
	this.writeArray(val.index, this.writeU32.bind(this));
	this.writeArray(val.surface, this.writeFFSurface.bind(this));
	this.writeArray(val.solidLeafSurface, this.writeU32.bind(this));
	this.writeColorF(val.color);
};

function FFPlane(normalIndex, planeDistance) {
	this.normalIndex = normalIndex;
	this.planeDistance = planeDistance;
}

Reader.prototype.readFFPlane = function() {
	return new FFPlane(this.readU32(), this.readF32());
};

Writer.prototype.writeFFPlane = function(val) {
	this.writeU32(val.normalIndex);
	this.writeF32(val.planeDistance);
};

function FFBSPNode(frontIndex, backIndex) {
	this.frontIndex = frontIndex;
	this.backIndex = backIndex;
}

Reader.prototype.readFFBSPNode = function() {
	return new FFBSPNode(this.readU16(), this.readU16());
};

Writer.prototype.writeFFBSPNode = function(val) {
	this.writeU16(val.frontIndex);
	this.writeU16(val.backIndex);
};

function FFBSPSolidLeaf(surfaceIndex, surfaceCount) {
	this.surfaceIndex = surfaceIndex;
	this.surfaceCount = surfaceCount;
}

Reader.prototype.readFFBSPSolidLeaf = function() {
	return new FFBSPSolidLeaf(this.readU32(), this.readU16());
};

Writer.prototype.writeFFBSPSolidLeaf = function(val) {
	this.writeU32(val.surfaceIndex);
	this.writeU16(val.surfaceCount);
};

function FFSurface(windingStart, windingCount, planeIndex, surfaceFlags, fanMask) {
	this.windingStart = windingStart;
	this.windingCount = windingCount;
	this.planeIndex = planeIndex;
	this.surfaceFlags = surfaceFlags;
	this.fanMask = fanMask;
}

Reader.prototype.readFFSurface = function() {
	return new FFSurface(this.readU32(), this.readU8(), this.readU16(), this.readU8(), this.readU32());
};

Writer.prototype.writeFFSurface = function(val) {
	this.writeU32(val.windingStart);
	this.writeU8(val.windingCount);
	this.writeU16(val.planeIndex);
	this.writeU8(val.surfaceFlags);
	this.writeU32(val.fanMask);
};


