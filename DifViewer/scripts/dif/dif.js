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


DIF.prototype.getModel = function(index) {
	var int = this.interior[index];

	var vertices = int.point.slice();
	var normals = int.normal.slice();
	var texCoords = [];
	var tangents = [];
	var bitangents = [];

	var texGroups = {};

	int.surface.forEach(function(surface, index) {
		if (typeof(texGroups[surface.textureIndex]) === "undefined") {
			texGroups[surface.textureIndex] = [];
		}

		var normal = int.normal[int.plane[surface.planeIndex].normalIndex];
		if (surface.planeFlipped) {
			normal = vec3.scale(vec3.create(), normal, -1);
			normals.push(normal);
		}
		for (var i = surface.windingStart + 2; i < surface.windingStart + surface.windingCount; i ++) {
			var face = {
				vertIndex: [],
				texCoordIndex: []
			};
			if ((i - (surface.windingStart + 2)) % 2 == 0) {
				face.vertIndex.push(int.index[i]);
				face.vertIndex.push(int.index[i - 1]);
				face.vertIndex.push(int.index[i - 2]);
			} else {
				face.vertIndex.push(int.index[i - 2]);
				face.vertIndex.push(int.index[i - 1]);
				face.vertIndex.push(int.index[i]);
			}

			if (surface.planeFlipped) {
				face.normalIndex = normals.length - 1;
			} else {
				face.normalIndex = int.plane[surface.planeIndex].normalIndex;
			}

			var texGen = int.texGenEq[surface.texGenIndex];

			var pt0 = int.point[face.vertIndex[0]];
			var pt1 = int.point[face.vertIndex[1]];
			var pt2 = int.point[face.vertIndex[2]];

			var coord0 = [pt0[0] * texGen.planeX.x + pt0[1] * texGen.planeX.y + pt0[2] * texGen.planeX.z + texGen.planeX.d,
				pt0[0] * texGen.planeY.x + pt0[1] * texGen.planeY.y + pt0[2] * texGen.planeY.z + texGen.planeY.d];
			var coord1 = [pt1[0] * texGen.planeX.x + pt1[1] * texGen.planeX.y + pt1[2] * texGen.planeX.z + texGen.planeX.d,
				pt1[0] * texGen.planeY.x + pt1[1] * texGen.planeY.y + pt1[2] * texGen.planeY.z + texGen.planeY.d];
			var coord2 = [pt2[0] * texGen.planeX.x + pt2[1] * texGen.planeX.y + pt2[2] * texGen.planeX.z + texGen.planeX.d,
				pt2[0] * texGen.planeY.x + pt2[1] * texGen.planeY.y + pt2[2] * texGen.planeY.z + texGen.planeY.d];

			face.texCoordIndex.push(texCoords.length);
			texCoords.push(coord0);
			face.texCoordIndex.push(texCoords.length);
			texCoords.push(coord1);
			face.texCoordIndex.push(texCoords.length);
			texCoords.push(coord2);

			var deltaPos1 = vec3.subtract(vec3.create(), pt1, pt0);
			var deltaPos2 = vec3.subtract(vec3.create(), pt2, pt0);
			var deltaUV1 = vec2.subtract(vec2.create(), coord1, coord0);
			var deltaUV2 = vec2.subtract(vec2.create(), coord2, coord0);

			var r = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV1[1] * deltaUV2[0]);

			var tangent = vec3.scale(vec3.create(),
				vec3.sub(vec3.create(),
					vec3.scale(vec3.create(), deltaPos1, deltaUV2[1]),
					vec3.scale(vec3.create(), deltaPos2, deltaUV1[1])),
				r);
			var bitangent = vec3.scale(vec3.create(),
				vec3.sub(vec3.create(),
					vec3.scale(vec3.create(), deltaPos2, deltaUV1[0]),
					vec3.scale(vec3.create(), deltaPos1, deltaUV2[0])),
				r);

			vec3.normalize(tangent, vec3.sub(vec3.create(), tangent, vec3.scale(vec3.create(), normal, vec3.dot(normal, tangent))));
			if (vec3.dot(vec3.cross(vec3.create(), normal, tangent), bitangent) < 0.0) {
				vec3.scale(tangent, tangent, -1);
			}

			vec3.normalize(tangent, tangent);
			vec3.normalize(bitangent, bitangent);

			face.tangentIndex = tangents.length;
			tangents.push(tangent);
			face.bitangentIndex = bitangents.length;
			bitangents.push(bitangent);

			texGroups[surface.textureIndex].push(face);
		}
	});

	var model = {};
	model.textures = [];
	model.faces = [];

	var start = 0;
	int.material.forEach(function(name, index) {
		if (typeof(texGroups[index]) === "undefined")
			texGroups[index] = [];

		model.textures.push({
			texture: name,
			start: start,
			count: texGroups[index].length
		});
		start += texGroups[index].length;
	});

	int.material.forEach(function(name, index) {
		var group = texGroups[index];

		group.forEach(function(face, findex) {
			var point0 = vertices[face.vertIndex[0]];
			var point1 = vertices[face.vertIndex[1]];
			var point2 = vertices[face.vertIndex[2]];
			var texCoord0 = texCoords[face.texCoordIndex[0]];
			var texCoord1 = texCoords[face.texCoordIndex[1]];
			var texCoord2 = texCoords[face.texCoordIndex[2]];
			var normal = normals[face.normalIndex];
			var tangent = tangents[face.tangentIndex];
			var bitangent = bitangents[face.bitangentIndex];

			model.faces.push(point0[0], point0[1], point0[2]);
			model.faces.push(texCoord0[0], texCoord0[1]);
			model.faces.push(normal[0], normal[1], normal[2]);
			model.faces.push(tangent[0], tangent[1], tangent[2]);
			model.faces.push(bitangent[0], bitangent[1], bitangent[2]);
			model.faces.push(point1[0], point1[1], point1[2]);
			model.faces.push(texCoord1[0], texCoord1[1]);
			model.faces.push(normal[0], normal[1], normal[2]);
			model.faces.push(tangent[0], tangent[1], tangent[2]);
			model.faces.push(bitangent[0], bitangent[1], bitangent[2]);
			model.faces.push(point2[0], point2[1], point2[2]);
			model.faces.push(texCoord2[0], texCoord2[1]);
			model.faces.push(normal[0], normal[1], normal[2]);
			model.faces.push(tangent[0], tangent[1], tangent[2]);
			model.faces.push(bitangent[0], bitangent[1], bitangent[2]);

		});
	});
	
	return model;
};
