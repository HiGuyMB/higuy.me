function Interior() {

}

Interior.prototype.read = function(reader) {
	if (reader.version.interior.type === "?")
		reader.version.interior.type = "tgea";
	reader.version.interior.version = reader.readU32();
	this.detailLevel = reader.readU32();
	this.minPixels = reader.readU32();
	this.boundingBox = reader.readBoxF();
	this.boundingSphere = reader.readSphereF();
	this.hasAlarmState = reader.readU8();
	this.lightStateEntry = reader.readArray(reader.readU32.bind(reader));
	this.normal = reader.readArray(reader.readPoint3F.bind(reader));
	this.plane = reader.readArray(reader.readPlane.bind(reader));
	this.point = reader.readArray(reader.readPoint3F.bind(reader));
	if (reader.version.interior.version === 4) {
		this.pointVisibility = [];
	} else {
		this.pointVisibility = reader.readArray(reader.readU8.bind(reader));
	}
	this.texGenEq = reader.readArray(reader.readTexGenEQ.bind(reader));
	this.bspNode = reader.readArray(reader.readBSPNode.bind(reader));
	this.bspSolidLeaf = reader.readArray(reader.readBSPSolidLeaf.bind(reader));
	reader.version.material.version = reader.readU8();
	this.material = reader.readArray(reader.readString.bind(reader));
	this.index = reader.readArrayAs(function(signed, param){return param}, reader.readU32.bind(reader), reader.readU16.bind(reader));
	this.windingIndex = reader.readArray(reader.readWindingIndex.bind(reader));
	if (reader.version.interior.version >= 12) {
		this.edge = reader.readArray(reader.readEdge.bind(reader));
	}
	this.zone = reader.readArray(reader.readZone.bind(reader));
	this.zoneSurface = reader.readArrayAs(function(){return false}, reader.readU16.bind(reader), reader.readU16.bind(reader));
	if (reader.version.interior.version >= 12) {
		this.zoneStaticMesh = reader.readArray(reader.readU32.bind(reader));
	}
	this.zonePortalList = reader.readArrayAs(function(){return false}, reader.readU16.bind(reader), reader.readU16.bind(reader));
	this.portal = reader.readArray(reader.readPortal.bind(reader));
	if (!this.readSurfaces(reader)) return;
	if (reader.version.interior.version >= 2 && reader.version.interior.version <= 5) {
		this.edge2 = reader.readArray(reader.readEdge2.bind(reader));
		if (reader.version.interior.version >= 4 && reader.version.interior.version <= 5) {
			this.normal2 = reader.readArray(reader.readPoint3F.bind(reader));
			this.normalIndex = reader.readArrayAs(function(alt, param){return alt && param == 0}, reader.readU16.bind(reader), reader.readU8.bind(reader));
		}
	}
	if (reader.version.interior.version === 4) {
		this.normalLMapIndex = reader.readArray(reader.readU8.bind(reader));
		this.alarmLMapIndex = [];
	} else if (reader.version.interior.version >= 13) {
		this.normalLMapIndex = reader.readArray(reader.readU32.bind(reader));
		this.alarmLMapIndex = reader.readArray(reader.readU32.bind(reader));
	} else {
		this.normalLMapIndex = reader.readArray(reader.readU8.bind(reader));
		this.alarmLMapIndex = reader.readArray(reader.readU8.bind(reader));
	}
	this.nullSurface = reader.readArray(reader.readNullSurface.bind(reader));
	if (reader.version.interior.version != 4) {
		this.lightMap = reader.readArray(reader.readLightMap.bind(reader));
		if (this.lightMap.length > 0 && reader.version.interior.type === "mbg") {
			reader.version.interior.type = "tge";
		}
	} else {
		this.lightMap = [];
	}
	this.solidLeafSurface = reader.readArrayAs(function(alt){return alt}, reader.readU32.bind(reader), reader.readU16.bind(reader));
	this.animatedLight = reader.readArray(reader.readAnimatedLight.bind(reader));
	this.lightState = reader.readArray(reader.readLightState.bind(reader));
	if (reader.version.interior.version === 4) {
		this.stateData = [];
		this.stateDataBuffer = [];
		this.nameBufferCharacter = [];
		this.flags = 0;
		this.subObjects = [];
	} else {
		this.stateData = reader.readArray(reader.readStateData.bind(reader));
		this.stateDataBuffer = reader.readArrayFlags(reader.readU8.bind(reader));
		this.nameBufferCharacter = reader.readArray(reader.readU8.bind(reader));
		this.flags = 0;
		this.subObjects = reader.readArray(function(){});
	}
	this.convexHull = reader.readArray(reader.readConvexHull.bind(reader));
	this.convexHullEmitStringCharacter = reader.readArray(reader.readU8.bind(reader));
	this.hullIndex = reader.readArrayAs(function(alt){return alt}, reader.readU32.bind(reader), reader.readU16.bind(reader));
	this.hullPlaneIndex = reader.readArrayAs(function(){return true}, reader.readU16.bind(reader), reader.readU16.bind(reader));
	this.hullEmitStringIndex = reader.readArrayAs(function(alt){return alt}, reader.readU32.bind(reader), reader.readU16.bind(reader));
	this.hullSurfaceIndex = reader.readArrayAs(function(alt){return alt}, reader.readU32.bind(reader), reader.readU16.bind(reader));
	this.polyListPlaneIndex = reader.readArrayAs(function(){return true}, reader.readU16.bind(reader), reader.readU16.bind(reader));
	this.polyListPointIndex = reader.readArrayAs(function(alt){return alt}, reader.readU32.bind(reader), reader.readU16.bind(reader));
	this.polyListStringCharacter = reader.readArray(reader.readU8.bind(reader));

	this.coordBin = [];
	for (var i = 0; i < 16*16; i ++) {
		this.coordBin.push(reader.readCoordBin());
	}

	this.coordBinIndex = reader.readArrayAs(function(){return true}, reader.readU16.bind(reader), reader.readU16.bind(reader));
	this.coordBinMode = reader.readU32();
	if (reader.version.interior.version === 4) {
		this.baseAmbientColor = [0, 0, 0, 255];
		this.alarmAmbientColor = [0, 0, 0, 255];
		this.extendedLightMapData = 0;
		this.lightMapBorderSize = 0;
	} else {
		this.baseAmbientColor = reader.readColorF();
		this.alarmAmbientColor = reader.readColorF();
		if (reader.version.interior.version >= 10) {
			this.staticMesh = reader.readArray(function(){});
		}
		if (reader.version.interior.version >= 11) {
			this.texNormal = reader.readArray(reader.readPoint3F.bind(reader));
			this.texMatrix = reader.readArray(reader.readTexMatrix.bind(reader));
			this.texMatIndex = reader.readArray(reader.readU32.bind(reader));
		} else {
			reader.readU32();
			reader.readU32();
			reader.readU32();
		}
		this.extendedLightMapData = reader.readU32();
		if (this.extendedLightMapData) {
			this.lightMapBorderSize = reader.readU32();
			reader.readU32();
		}
	}
};

Writer.prototype.writeInterior = function(val) {
	this.writeU32(this.version.interior.version);
	this.writeU32(val.detailLevel);
	this.writeU32(val.minPixels);
	this.writeBoxF(val.boundingBox);
	this.writeSphereF(val.boundingSphere);
	this.writeU8(val.hasAlarmState);
	this.writeArray(val.lightStateEntry, this.writeU32.bind(this));
	this.writeArray(val.normal, this.writePoint3F.bind(this));
	this.writeArray(val.plane, this.writePlane.bind(this));
	this.writeArray(val.point, this.writePoint3F.bind(this));
	this.writeArray(val.pointVisibility, this.writeU8.bind(this));
	this.writeArray(val.texGenEq, this.writeTexGenEQ.bind(this));
	this.writeArray(val.bspNode, this.writeBSPNode.bind(this));
	this.writeArray(val.bspSolidLeaf, this.writeBSPSolidLeaf.bind(this));
	this.writeU8(this.version.material.version);
	this.writeArray(val.material, this.writeString.bind(this));
	this.writeArray(val.index, this.writeU32.bind(this));
	this.writeArray(val.windingIndex, this.writeWindingIndex.bind(this));
	this.writeArray(val.zone, this.writeZone.bind(this));
	this.writeArray(val.zoneSurface, this.writeU16.bind(this));
	this.writeArray(val.zonePortalList, this.writeU16.bind(this));
	this.writeArray(val.portal, this.writePortal.bind(this));
	this.writeArray(val.surface, this.writeSurface.bind(this));
	this.writeArray(val.normalLMapIndex, this.writeU8.bind(this));
	this.writeArray(val.alarmLMapIndex, this.writeU8.bind(this));
	this.writeArray(val.nullSurface, this.writeNullSurface.bind(this));
	if (this.version.interior.type === "mbg") {
		this.writeU32(0);
	} else {
		this.writeArray(val.lightMap, this.writeLightMap.bind(this));
	}
	this.writeArray(val.solidLeafSurface, this.writeU32.bind(this));
	this.writeArray(val.animatedLight, this.writeAnimatedLight.bind(this));
	this.writeArray(val.lightState, this.writeLightState.bind(this));
	this.writeArray(val.stateData, this.writeStateData.bind(this));
	this.writeArrayFlags(val.stateDataBuffer, 0, this.writeU8.bind(this));
	this.writeArray(val.nameBufferCharacter, this.writeU8.bind(this));
	this.writeU32(0);
	this.writeArray(val.convexHull, this.writeConvexHull.bind(this));
	this.writeArray(val.convexHullEmitStringCharacter, this.writeU8.bind(this));
	this.writeArray(val.hullIndex, this.writeU32.bind(this));
	this.writeArray(val.hullPlaneIndex, this.writeU16.bind(this));
	this.writeArray(val.hullEmitStringIndex, this.writeU32.bind(this));
	this.writeArray(val.hullSurfaceIndex, this.writeU32.bind(this));
	this.writeArray(val.polyListPlaneIndex, this.writeU16.bind(this));
	this.writeArray(val.polyListPointIndex, this.writeU32.bind(this));
	this.writeArray(val.polyListStringCharacter, this.writeU8.bind(this));
	for (var i = 0; i < 16 * 16; i ++) {
		this.writeCoordBin(val.coordBin[i]);
	}
	this.writeArray(val.coordBinIndex, this.writeU16.bind(this));
	this.writeU32(val.coordBinMode);
	this.writeColorF(val.baseAmbientColor);
	this.writeColorF(val.alarmAmbientColor);
	this.writeU32(0);
	this.writeU32(0);
	this.writeU32(0);
	this.writeU32(0);
};

function Plane(normalIndex, planeDistance) {
	this.normalIndex = normalIndex;
	this.planeDistance = planeDistance;
}

Reader.prototype.readPlane = function() {
	return new Plane(this.readU16(), this.readF32());
};

Writer.prototype.writePlane = function(val) {
	this.writeU16(val.normalIndex);
	this.writeF32(val.planeDistance);
};

function TexGenEQ(planeX, planeY) {
	this.planeX = planeX;
	this.planeY = planeY;
}

Reader.prototype.readTexGenEQ = function() {
	return new TexGenEQ(this.readPlaneF(), this.readPlaneF());
};

Writer.prototype.writeTexGenEQ = function(val) {
	this.writePlaneF(val.planeX);
	this.writePlaneF(val.planeY);
};

function BSPNode(planeIndex, frontIndex, backIndex) {
	this.planeIndex = planeIndex;
	this.frontIndex = frontIndex;
	this.backIndex = backIndex;
}

Reader.prototype.readBSPNode = function() {
	var planeIndex = this.readU16();
	var frontIndex, backIndex;
	if (this.version.interior.version >= 14) {
		frontIndex = this.readU32();
		backIndex = this.readU32();
		if ((frontIndex & 0x80000) != 0) {
			frontIndex = (frontIndex & ~0x80000) | 0x8000;
		}
		if ((frontIndex & 0x40000) != 0) {
			frontIndex = (frontIndex & ~0x40000) | 0x4000;
		}
		if ((backIndex & 0x80000) != 0) {
			backIndex = (backIndex & ~0x80000) | 0x8000;
		}
		if ((backIndex & 0x40000) != 0) {
			backIndex = (backIndex & ~0x40000) | 0x4000;
		}
	} else {
		frontIndex = this.readU16();
		backIndex = this.readU16();
	}
	return new BSPNode(planeIndex, frontIndex, backIndex);
};

Writer.prototype.writeBSPNode = function(val) {
	this.writeU16(val.planeIndex);
	this.writeU16(val.frontIndex);
	this.writeU16(val.backIndex);
};

function BSPSolidLeaf(surfaceIndex, surfaceCount) {
	this.surfaceIndex = surfaceIndex;
	this.surfaceCount = surfaceCount;
}

Reader.prototype.readBSPSolidLeaf = function() {
	return new BSPSolidLeaf(this.readU32(), this.readU16());
};

Writer.prototype.writeBSPSolidLeaf = function(val) {
	this.writeU32(val.surfaceIndex);
	this.writeU16(val.surfaceCount);
};

function WindingIndex(windingStart, windingCount) {
	this.windingStart = windingStart;
	this.windingCount = windingCount;
}

Reader.prototype.readWindingIndex = function() {
	return new WindingIndex(this.readU32(), this.readU32());
};

Writer.prototype.writeWindingIndex = function(val) {
	this.writeU32(val.windingStart);
	this.writeU32(val.windingCount);
};

function Edge(pointIndex0, pointIndex1, surfaceIndex0, surfaceIndex1) {
	this.pointIndex0 = pointIndex0;
	this.pointIndex1 = pointIndex1;
	this.surfaceIndex0 = surfaceIndex0;
	this.surfaceIndex1 = surfaceIndex1;
}

Reader.prototype.readEdge = function() {
	return new Edge(this.readU32(), this.readU32(), this.readU32(), this.readU32());
};

function Zone() {

}

Zone.prototype.read = function(reader) {
	this.portalStart = reader.readU16();
	this.portalCount = reader.readU16();
	this.surfaceStart = reader.readU32();
	this.surfaceCount = reader.readU32();
	if (reader.version.interior.version >= 12) {
		this.staticMeshStart = reader.readU32();
		this.staticMeshCount = reader.readU32();
	}
};

Writer.prototype.writeZone = function(val) {
	this.writeU16(val.portalStart);
	this.writeU16(val.portalCount);
	this.writeU32(val.surfaceStart);
	this.writeU32(val.surfaceCount);
};

Reader.prototype.readZone = function() {
	var zone = new Zone();
	zone.read(this);
	return zone;
};

function Portal(planeIndex, triFanCount, triFanStart, zoneFront, zoneBack) {
	this.planeIndex = planeIndex;
	this.triFanCount = triFanCount;
	this.triFanStart = triFanStart;
	this.zoneFront = zoneFront;
	this.zoneBack = zoneBack;
}

Reader.prototype.readPortal = function() {
	return new Portal(this.readU16(), this.readU16(), this.readU32(), this.readU16(), this.readU16());
};

Writer.prototype.writePortal = function(val) {
	this.writeU16(val.planeIndex);
	this.writeU16(val.triFanCount);
	this.writeU32(val.triFanStart);
	this.writeU16(val.zoneFront);
	this.writeU16(val.zoneBack);
};

function Surface() {

}

Interior.prototype.readSurfaces = function(reader) {
	var pos = reader.getPosition();
	try {
		this.surface = reader.readArray(this.readSurface.bind(this, reader));
		if (reader.version.dif.type === "?") {
			reader.version.dif.type = "tge";
		}
		return true;
	} catch (e) {
		if (reader.version.interior.version != 0)
			return false;

		if (reader.version.dif.type === "?") {
			reader.version.dif.type = "mbg";
			reader.version.interior.type = "mbg";
		}
		reader.setPosition(pos);
		try {
			this.surface = reader.readArray(this.readSurface.bind(this, reader));
			return true;
		} catch (e) {

		}
	}
	return false;
};

Surface.prototype.read = function(interior, reader) {
	this.windingStart = reader.readU32();
	if (reader.version.interior.version >= 13) {
		this.windingCount = reader.readU32();
	} else {
		this.windingCount = reader.readU8();
	}
	if (this.windingStart + this.windingCount > interior.index.length)
		return false;

	var plane = reader.readU16();
	this.planeFlipped = (plane >> 15 != 0);
	this.planeIndex = (plane & ~0x8000);

	if (this.planeIndex > interior.plane.length)
		return false;

	this.textureIndex = reader.readU16();
	if (this.textureIndex > interior.material.length)
		return false;
	this.texGenIndex = reader.readU32();
	if (this.texGenIndex > interior.texGenEq.length)
		return false;
	this.surfaceFlags = reader.readU8();
	this.fanMask = reader.readU32();
	this.lightMap = {};
	this.lightMap.finalWord = reader.readU16();
	this.lightMap.texGenXDistance = reader.readF32();
	this.lightMap.texGenYDistance = reader.readF32();
	this.lightCount = reader.readU16();
	this.lightStateInfoStart = reader.readU32();

	if (reader.version.interior.version >= 13) {
		this.mapOffsetX = reader.readU32();
		this.mapOffsetY = reader.readU32();
		this.mapSizeX = reader.readU32();
		this.mapSizeY = reader.readU32();
	} else {
		this.mapOffsetX = reader.readU8();
		this.mapOffsetY = reader.readU8();
		this.mapSizeX = reader.readU8();
		this.mapSizeY = reader.readU8();
	}

	if (reader.version.interior.type !== "tge" && reader.version.interior.type !== "mbg") {
		reader.readU8();
		if (reader.version.interior.version >= 2 && reader.version.interior.version <= 5) {
			this.brushId = reader.readU32();
		}
	}
	return true;
};

Interior.prototype.readSurface = function(reader) {
	var surface = new Surface();
	if (!surface.read(this, reader)) {
		throw new Error();
	}
	return surface;
};

Writer.prototype.writeSurface = function(val) {
	this.writeU32(val.windingStart);
	this.writeU8(val.windingCount);
	var index = val.planeIndex;
	if (val.planeFlipped)
		index |= 0x8000;
	this.writeU16(index);
	this.writeU16(val.textureIndex);
	this.writeU32(val.texGenIndex);
	this.writeU8(val.surfaceFlags);
	this.writeU32(val.fanMask);
	this.writeU16(val.lightMap.finalWord);
	this.writeF32(val.lightMap.texGenXDistance);
	this.writeF32(val.lightMap.texGenYDistance);
	this.writeU16(val.lightCount);
	this.writeU32(val.lightStateInfoStart);
	this.writeU8(val.mapOffsetX);
	this.writeU8(val.mapOffsetY);
	this.writeU8(val.mapSizeX);
	this.writeU8(val.mapSizeY);
};

function Edge2() {

}

Edge2.prototype.read = function(reader) {
	this.vertex0 = reader.readU32();
	this.vertex1 = reader.readU32();
	this.normal0 = reader.readU32();
	this.normal1 = reader.readU32();
	if (reader.version.interior.version >= 3) {
		this.face0 = reader.readU32();
		this.face1 = reader.readU32();
	}
};

Reader.prototype.readEdge2 = function() {
	var edge = new Edge2();
	edge.read(this);
	return edge;
};

function NullSurface() {

}

NullSurface.prototype.read = function(reader) {
	this.windingStart  = reader.readU32();
	this.planeIndex = reader.readU16();
	this.surfaceFlags = reader.readU8();
	if (reader.version.interior.version >= 13) {
		this.windingCount = reader.readU32();
	} else {
		this.windingCount = reader.readU8();
	}
};

Reader.prototype.readNullSurface = function() {
	var ns = new NullSurface();
	ns.read(this);
	return ns;
};

Writer.prototype.writeNullSurface = function(val) {
	this.writeU32(val.windingStart);
	this.writeU16(val.planeIndex);
	this.writeU8(val.surfaceFlags);
	this.writeU8(val.windingCount);
};

function LightMap() {

}

LightMap.prototype.read = function(reader) {
	this.lightMap = reader.readPNG();
	if (reader.version.interior.type !== "mbg" && reader.version.interior.type !== "tge") {
		this.lightDirMap = reader.readPNG();
	}
	this.keepLightMap = reader.readU8();
};

Reader.prototype.readLightMap = function() {
	var map = new LightMap();
	map.read(this);
	return map;
};

Writer.prototype.writeLightMap = function(val) {
	this.writePNG(val.lightMap);
	this.writeU8(val.keepLightMap);
};

function AnimatedLight(nameIndex, stateIndex, stateCount, flags, duration) {
	this.nameIndex = nameIndex;
	this.stateIndex = stateIndex;
	this.stateCount = stateCount;
	this.flags = flags;
	this.duration = duration;
}

Reader.prototype.readAnimatedLight = function() {
	return new AnimatedLight(this.readU32(), this.readU32(), this.readU16(), this.readU16(), this.readU32())
};

Writer.prototype.writeAnimatedLight = function(val) {
	this.writeU32(val.nameIndex);
	this.writeU32(val.stateIndex);
	this.writeU16(val.stateCount);
	this.writeU16(val.flags);
	this.writeU32(val.duration);
};

function LightState(red, green, blue, activeTime, dataIndex, dataCount) {
	this.red = red;
	this.green = green;
	this.blue = blue;
	this.activeTime = activeTime;
	this.dataIndex = dataIndex;
	this.dataCount = dataCount;
}

Reader.prototype.readLightState = function() {
	return new LightState(this.readU8(), this.readU8(), this.readU8(), this.readU32(), this.readU32(), this.readU16());
};

Writer.prototype.writeLightState = function(val) {
	this.writeU8(val.red);
	this.writeU8(val.green);
	this.writeU8(val.blue);
	this.writeU32(val.activeTime);
	this.writeU32(val.dataIndex);
	this.writeU16(val.dataCount);
};

function StateData(surfaceIndex, mapIndex, lightStateIndex) {
	this.surfaceIndex = surfaceIndex;
	this.mapIndex = mapIndex;
	this.lightStateIndex = lightStateIndex;
}

Reader.prototype.readStateData = function() {
	return new StateData(this.readU32(), this.readU32(), this.readU16());
};

Writer.prototype.writeStateData = function(val) {
	this.writeU32(val.surfaceIndex);
	this.writeU32(val.mapIndex);
	this.writeU16(val.lightStateIndex);
};

function ConvexHull() {

}

ConvexHull.prototype.read = function(reader) {
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
	if (reader.version.interior.version >= 12) {
		this.staticMesh = reader.readU8();
	}
};

Reader.prototype.readConvexHull = function() {
	var hull = new ConvexHull();
	hull.read(this);
	return hull;
};

Writer.prototype.writeConvexHull = function(val) {
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

function CoordBin(binStart, binCount) {
	this.binStart = binStart;
	this.binCount = binCount;
}

Reader.prototype.readCoordBin = function() {
	return new CoordBin(this.readU32(), this.readU32());
};

Writer.prototype.writeCoordBin = function(val) {
	this.writeU32(val.binStart);
	this.writeU32(val.binCount);
};

function TexMatrix(t, n, b) {
	this.t = t;
	this.n = n;
	this.b = b;
}

Reader.prototype.readTexMatrix = function() {
	return new TexMatrix(this.readU32(), this.readU32(), this.readU32());
};

Writer.prototype.writeTexMatrix = function(val) {
	this.writeU32(val.t);
	this.writeU32(val.n);
	this.writeU32(val.b);
};