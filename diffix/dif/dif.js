function DIF(bytes) {
	var reader = new Reader(bytes);

	if (reader.readU32() != 44) {
		alert("This isn't a DIF! Please use \"Export as DIF\" from Constructor or any map2dif.exe first!");
		return;
	}
	if (reader.readU8()) {

	}
	
	this.interior = reader.readArray(function() {
		var int = new Interior();
		int.read(reader);
		return int;
	});
	this.subObject = reader.readArray(function() {
		var int = new Interior();
		int.read(reader);
		return int;
	});
	this.trigger = reader.readArray(function() {
		var trig = new Trigger();
		trig.read(reader);
		return trig;
	});
	this.interiorPathFollower = reader.readArray(function() {
		var ipf = new InteriorPathFollower();
		ipf.read(reader);
		return ipf;
	});
	this.forceField = reader.readArray(function() {
		var ff = new ForceField();
		ff.read(reader);
		return ff;
	});
	this.aiSpecialNode = reader.readArray(function() {
		var aisn = new AISpecialNode();
		aisn.read(reader);
		return aisn;
	});
	this.readVehicleCollision = reader.readU32();
	if (this.readVehicleCollision === 1) {
		this.vehicleCollision = new VehicleCollision();
		this.vehicleCollision.read(reader);
	}
	this.readEntities = reader.readU32();
	if (this.readEntities === 2) {
		this.gameEntity = reader.readArray(function() {
			var entity = new GameEntity();
			entity.read(reader);
			return entity;
		});
	}
}

DIF.prototype.write = function() {
	var writer = new Writer();
	writer.version.interior.type = "mbg";
	writer.version.dif.type = "tge";

	writer.writeU32(44);
	writer.writeU8(0);

	writer.writeArray(this.interior, writer.writeInterior.bind(writer));
	writer.writeArray(this.subObject, writer.writeInterior.bind(writer));
	writer.writeArray(this.trigger, writer.writeTrigger.bind(writer));
	writer.writeArray(this.interiorPathFollower, writer.writeInteriorPathFollower.bind(writer));
	writer.writeArray(this.forceField, writer.writeForceField.bind(writer));
	writer.writeArray(this.aiSpecialNode, writer.writeAISpecialNode.bind(writer));
	if (typeof(this.vehicleCollision) !== "undefined") {
		writer.writeU32(1);
		writer.writeVehicleCollision(this.vehicleCollision);
	} else {
		writer.writeU32(0);
	}
	if (typeof(this.gameEntity) !== "undefined" && this.gameEntity.length) {
		writer.writeU32(2);
		writer.writeArray(this.gameEntity, writer.writeGameEntity.bind(writer));
	} else {
		writer.writeU32(0);
	}
	writer.writeU32(0);

	return new Uint8Array(writer.bytes);
};
