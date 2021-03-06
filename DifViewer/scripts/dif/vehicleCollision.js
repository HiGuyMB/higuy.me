function VehicleCollision() {

}

VehicleCollision.prototype.read = function(reader) {
	reader.version.vehicleCollision.version = reader.readU32();
	this.vehicleConvexHull = reader.readArray(reader.readVCConvexHull.bind(reader));
	this.vehicleConvexHullEmitStringCharacter = reader.readArray(reader.readU8.bind(reader));
	this.vehicleHullIndex = reader.readArray(reader.readU32.bind(reader));
	this.vehicleHullPlaneIndex = reader.readArray(reader.readU16.bind(reader));
	this.vehicleHullEmitStringIndex = reader.readArray(reader.readU32.bind(reader));
	this.vehicleHullSurfaceIndex = reader.readArray(reader.readU32.bind(reader));
	this.vehiclePolyListPlaneIndex = reader.readArray(reader.readU16.bind(reader));
	this.vehiclePolyListPointIndex = reader.readArray(reader.readU32.bind(reader));
	this.vehiclePolyListStringCharacter = reader.readArray(reader.readU8.bind(reader));
	this.vehicleNullSurface = reader.readArray(reader.readVCNullSurface.bind(reader));
	this.vehiclePoints = reader.readArray(reader.readPoint3F.bind(reader));
	this.vehiclePlanes = reader.readArray(reader.readPlaneF.bind(reader));
	this.vehicleWindings = reader.readArray(reader.readU32.bind(reader));
	this.vehicleWindingIndices = reader.readArray(reader.readVCWindingIndex.bind(reader));
};

Writer.prototype.writeVehicleCollision = function(val) {
	this.writeU32(this.version.vehicleCollision.version);
	this.writeArray(val.vehicleConvexHull, this.writeVCConvexHull.bind(this));
	this.writeArray(val.vehicleConvexHullEmitStringCharacter, this.writeU8.bind(this));
	this.writeArray(val.vehicleHullIndex, this.writeU32.bind(this));
	this.writeArray(val.vehicleHullPlaneIndex, this.writeU16.bind(this));
	this.writeArray(val.vehicleHullEmitStringIndex, this.writeU32.bind(this));
	this.writeArray(val.vehicleHullSurfaceIndex, this.writeU32.bind(this));
	this.writeArray(val.vehiclePolyListPlaneIndex, this.writeU16.bind(this));
	this.writeArray(val.vehiclePolyListPointIndex, this.writeU32.bind(this));
	this.writeArray(val.vehiclePolyListStringCharacter, this.writeU8.bind(this));
	this.writeArray(val.vehicleNullSurface, this.writeVCNullSurface.bind(this));
	this.writeArray(val.vehiclePoints, this.writePoint3F.bind(this));
	this.writeArray(val.vehiclePlanes, this.writePlaneF.bind(this));
	this.writeArray(val.vehicleWindings, this.writeU32.bind(this));
	this.writeArray(val.vehicleWindingIndices, this.writeVCWindingIndex.bind(this));
};

function VCConvexHull() {

}

VCConvexHull.prototype.read = function(reader) {
	this.hullStart = reader.readU32();
	this.hullCount = reader.readU16();
	this.minX = reader.readF32();
	this.maxX = reader.readF32();
	this.minY = reader.readF32();
	this.maxY = reader.readF32();
	this.minZ = reader.readF32();
	this.maxZ = reader.readF32();
	this.surfaceStart = reader.readU32();
	this.surfaceCount = reader.readU16();
	this.planeStart = reader.readU32();
	this.polyListPlaneStart = reader.readU32();
	this.polyListPointStart = reader.readU32();
	this.polyListStringStart = reader.readU32();
};

Reader.prototype.readVCConvexHull = function() {
	var hull = new VCConvexHull();
	hull.read(this);
	return hull
};

Writer.prototype.writeVCConvexHull = function(val) {
	this.writeU32(val.hullStart);
	this.writeU16(val.hullCount);
	this.writeF32(val.minX);
	this.writeF32(val.maxX);
	this.writeF32(val.minY);
	this.writeF32(val.maxY);
	this.writeF32(val.minZ);
	this.writeF32(val.maxZ);
	this.writeU32(val.surfaceStart);
	this.writeU16(val.surfaceCount);
	this.writeU32(val.planeStart);
	this.writeU32(val.polyListPlaneStart);
	this.writeU32(val.polyListPointStart);
	this.writeU32(val.polyListStringStart);
};

function VCNullSurface(windingStart, planeIndex, surfaceFlags, windingCount) {
	this.windingStart = windingStart;
	this.planeIndex = planeIndex;
	this.surfaceFlags = surfaceFlags;
	this.windingCount = windingCount;
}

Reader.prototype.readVCNullSurface = function() {
	return new VCNullSurface(this.readU32(), this.readU16(), this.readU8(), this.readU32());
};

Writer.prototype.writeVCNullSurface = function(val) {
	this.writeU32(val.windingStart);
	this.writeU16(val.planeIndex);
	this.writeU8(val.surfaceFlags);
	this.writeU32(val.windingCount);
};

function VCWindingIndex(windingStart, windingCount) {
	this.windingStart = windingStart;
	this.windingCount = windingCount;
}

Reader.prototype.readVCWindingIndex = function() {
	return new VCWindingIndex(this.readU32(), this.readU32());
};

Writer.prototype.writeVCWindingIndex = function(val) {
	this.writeU32(val.windingStart);
	this.writeU32(val.windingCount);
};
