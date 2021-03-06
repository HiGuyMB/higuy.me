function GameEntity() {

}

GameEntity.prototype.read = function(reader) {
	this.datablock = reader.readString();
	this.gameClass = reader.readString();
	this.position = reader.readPoint3F();
	this.properties = reader.readDictionary();
};

Writer.prototype.writeGameEntity = function(val) {
	this.writeString(val.datablock);
	this.writeString(val.gameClass);
	this.writePoint3F(val.position);
	this.writeDictionary(val.properties);
};
