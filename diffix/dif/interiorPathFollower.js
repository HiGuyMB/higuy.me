function InteriorPathFollower() {

}

InteriorPathFollower.prototype.read = function(reader) {
	this.name = reader.readString();
	this.datablock = reader.readString();
	this.interiorResIndex = reader.readU32();
	this.offset = reader.readPoint3F();
	this.properties = reader.readDictionary();
	this.triggerId = reader.readArray(reader.readU32.bind(reader));
	this.wayPoint = reader.readArray(reader.readWayPoint.bind(reader));
	this.totalMS = reader.readU32();
};

Writer.prototype.writeInteriorPathFollower = function(val) {
	this.writeString(val.name);
	this.writeString(val.datablock);
	this.writeU32(val.interiorResIndex);
	this.writePoint3F(val.offset);
	this.writeDictionary(val.properties);
	this.writeArray(val.triggerId, this.writeU32.bind(this));
	this.writeArray(val.wayPoint, this.writeWayPoint.bind(this));
	this.writeU32(val.totalMS);
};

function WayPoint(position, rotation, msToNext, smoothingType) {
	this.position = position;
	this.rotation = rotation;
	this.msToNext = msToNext;
	this.smoothingType = smoothingType;
}

Reader.prototype.readWayPoint = function() {
	return new WayPoint(this.readPoint3F(), this.readQuatF(), this.readU32(), this.readU32());
};

Writer.prototype.writeWayPoint = function(val) {
	this.writePoint3F(val.position);
	this.writeQuatF(val.rotation);
	this.writeU32(val.msToNext);
	this.writeU32(val.smoothingType);
};
