function Trigger() {

}

Trigger.prototype.read = function(reader) {
	this.name = reader.readString();
	this.datablock = reader.readString();
	this.properties = reader.readDictionary();
	this.polyhedron = reader.readPolyhedron();
	this.offset = reader.readPoint3F();
};

Writer.prototype.writeTrigger = function(val) {
	this.writeString(val.name);
	this.writeString(val.datablock);
	this.writeDictionary(val.properties);
	this.writePolyhedron(val.polyhedron);
	this.writePoint3F(val.offset);
};

function Polyhedron() {

}

Reader.prototype.readPolyhedron = function() {
	var poly = new Polyhedron();
	poly.pointList = this.readArray(this.readPoint3F.bind(this));
	poly.planeList = this.readArray(this.readPlaneF.bind(this));
	poly.edgeList = this.readArray(this.readPolyhedronEdge.bind(this));
	return poly;
};

Writer.prototype.writePolyhedron = function(val) {
	this.writeArray(val.pointList, this.writePoint3F.bind(this));
	this.writeArray(val.planeList, this.writePlaneF.bind(this));
	this.writeArray(val.edgeList, this.writePolyhedronEdge.bind(this));
};

function PolyhedronEdge(face0, face1, vertex0, vertex1) {
	this.face0 = face0;
	this.face1 = face1;
	this.vertex0 = vertex0;
	this.vertex1 = vertex1;
}

Reader.prototype.readPolyhedronEdge = function() {
	return new PolyhedronEdge(this.readU32(), this.readU32(), this.readU32(), this.readU32());
};

Writer.prototype.writePolyhedronEdge = function(val) {
	this.writeU32(val.face0);
	this.writeU32(val.face1);
	this.writeU32(val.vertex0);
	this.writeU32(val.vertex1);
};