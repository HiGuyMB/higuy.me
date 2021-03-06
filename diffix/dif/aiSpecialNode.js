function AISpecialNode() {

}

AISpecialNode.prototype.read = function(reader) {
	this.name = reader.readString();
	this.position = reader.readPoint3F();
};

Writer.prototype.writeAISpecialNode = function(val) {
	this.writeString(val.name);
	this.writePoint3F(val.position);
};
