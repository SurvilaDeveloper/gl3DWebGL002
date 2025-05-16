import { DiffuseObjectControls, SunControls } from "./controls";
import { TerrainControls } from "./controls";
import { angleBetweenVectors, angleOfVectorWithZAxisOnXZPlane, assignMat4, differenceBetweenVectors3, identityMat4x4, normalize3, normalOf, orientViewY, rotateOwnAxisX, scalarMat4x4, triangleArea } from "./matrix";
import { transformVertexArray } from "./transformations";


export class DiffuseObject {
    constructor(name, gl, mainProgram, vertexArray, normalArray, indexArray, diffuseColor, specularColor, brightness) {
        this.gl = gl;
        this.name = name;
        this.mainProgram = mainProgram;
        this.vertexArray = vertexArray;
        this.normalArray = normalArray;
        this.indexArray = indexArray;
        this.diffuseColor = diffuseColor || new Float32Array([1, 1, 1]);
        this.alpha = 1.0;
        this.specularColor = specularColor || new Float32Array([1, 1, 1]);
        this.brightness = brightness || 1;
        this.state = 1;
        this.angleX = 0.0;/////////////////
        this.angleY = 0.0;
        this.angleZ = 0.0;
        this.ownAxisXvector = new Float32Array([1, 0, 0]);
        this.ownAxisYvector = new Float32Array([0, 1, 0]);
        this.ownAxisZvector = new Float32Array([0, 0, 1]);
        this.ownAngleX = 0.0;
        this.ownAngleY = 0.0;
        this.ownAngleZ = 0.0;
        this.vertexBuffer = new VBO(this.gl, this.vertexArray, this.vertexArray.length / 3);
        this.normalBuffer = new VBO(this.gl, this.normalArray, this.normalArray.length / 3);
        this.indexBuffer = new IBO(this.gl, this.indexArray, this.indexArray.length);
        this.positionMatrix = new Float32Array(identityMat4x4);
        this.rotateMatrix = new Float32Array(identityMat4x4);
        //this.orientMatrix = new Float32Array(identityMat4x4);
        this.scalarMatrix = new Float32Array(identityMat4x4);
        this.modelMatrix = new Float32Array(identityMat4x4);
        this.radio = 0;
        this.isTextured = 0;
        this.internalOmniLight = -1;
        this.up = new Float32Array([0, 1, 0]);
        this.isSun = 0;
        //this.lookAngleDisplay = new Display('angleEnDiffuseObject');
        this.frame = 0;
        this.step = 0;
        this.totalFrames = 0;

    }
    lookAtCamera(camera) {
        const diffVector = differenceBetweenVectors3(camera.transformedPosition, [this.positionMatrix[12], this.positionMatrix[13], this.positionMatrix[14]]);
        const angleOnY = angleOfVectorWithZAxisOnXZPlane(diffVector);
        orientViewY(this, -angleOnY);
        const vectorXZ = [diffVector[0], 0, diffVector[2]];
        let angleWithY = angleBetweenVectors(vectorXZ, diffVector);
        if (this.positionMatrix[13] < 0) {
            angleWithY = -angleWithY;
        }
        //this.lookAngleDisplay.log(diffVector);
        rotateOwnAxisX(this, angleWithY);
    }
    createControls(name) {
        this.controls = new DiffuseObjectControls(this);
        this.controls.create(name);
    }
    checkAnimation() {
        if (this.totalFrames == 0) {
            return;
        }
        else {
            this.animate();
        }
    }
    animationInit(sequence, begin, end) {
        this.sequence = sequence;
        this.begin = begin;
        this.end = end;

        //console.log(this.sequence);
        this.totalFrames = this.end - this.begin;
        this.frame = this.begin + this.step;
        this.step++;
    }
    animate() {
        console.log(this.frame);
        this.vertexBuffer.updateData(new Float32Array(this.sequence[this.frame].vertexArray));
        this.normalBuffer.updateData(new Float32Array(this.sequence[this.frame].normalArray));
        //this.indexArray = this.sequence[this.frame].indexArray;

        if (this.frame == this.end) {
            this.totalFrames = 0;
            this.step = 0;
            this.frame = this.begin;
        }
        //this.frame = this.frame + 1;
    }
    rotateY(angleY) {
        assignMat4(this.rotateMatrix, multiplyMat4(this.rotateMatrix, rotateMat_y(angleY)));
    }
    traslateZ(deltaZ) {
        this.positionMatrix[12] -= deltaZ * (-this.rotateMatrix[8]);
        this.positionMatrix[14] += deltaZ * this.rotateMatrix[10];
    }
    traslateX(deltaX) {
        this.positionMatrix[12] += deltaX * this.rotateMatrix[0];
        this.positionMatrix[14] -= deltaX * (-this.rotateMatrix[2]);
    }

}

export class AnimationIdleLoopEnd {
    constructor(objeto, sequence, beginIdle, endIdle, timePerFrame) {
        this.o = objeto;
        this.sequence = sequence;
        this.seq = [...this.sequence]
        //this.reorderSeq()
        this.bi = beginIdle;
        this.ei = endIdle;
        this.bttl = 0;
        this.ettl = 0;
        this.bl = 0;
        this.el = 0;
        this.btti = 0;
        this.etti = 0;
        this.be = 0;
        this.ee = 0;
        this.tpf = timePerFrame || 1;
        this.tpfCounter = 1;
        this.beginFrame = this.bi;
        this.endFrame = this.ei;
        this.startEnd = 0;
        this.noLoop = 0;
        this.sequenceLength = this.ei - this.bi;
        this.step = 0;
        this.startLoopControl = 1;
        this.endLoopControl = 0;
        this.keyUpControl = 1;
        this.keyDownControl = 0;
        this.startEndControl = 1;

    }
    reorderSeq(beginIdle, endIdle, beginTransitionToLoop, endTransitionToLoop, beginLoop, endLoop, beginTransitionToIdle, endTransitionToIdle) {
        this.seq = []
        for (let i = beginIdle; i < endIdle + 1; i++) {
            this.seq.push(this.sequence[i])
        }
        for (let i = beginTransitionToLoop; i < endTransitionToLoop + 1; i++) {
            this.seq.push(this.sequence[i])
        }
        for (let i = beginLoop; i < endLoop + 1; i++) {
            this.seq.push(this.sequence[i])
        }
        for (let i = beginTransitionToIdle; i < endTransitionToIdle + 1; i++) {
            this.seq.push(this.sequence[i])
        }
        this.bi = 0;
        this.ei = endIdle - beginIdle;
        this.bttl = this.ei + 1;
        this.ettl = this.bttl + (endTransitionToLoop - beginTransitionToLoop);
        this.bl = this.ettl + 1;
        this.el = this.bl + (endLoop - beginLoop);
        this.btti = this.el + 1;
        this.etti = this.btti + (endTransitionToIdle - beginTransitionToIdle);
    }

    active() {
        this.o.vertexBuffer.updateData(new Float32Array(this.seq[this.beginFrame + (this.step)].vertexArray));
        this.o.normalBuffer.updateData(new Float32Array(this.seq[this.beginFrame + (this.step)].normalArray));
        if (this.step >= this.endFrame - this.beginFrame) {
            if (this.endFrame == this.ee) { this.noLoop = 1; }
            if (this.noLoop == 0) {
                if (this.endLoopControl == 1) {

                    this.beginFrame = this.btti;
                    this.endFrame = this.etti;
                    this.endLoopControl = 0;
                    this.keyUpControl = 0;
                    this.keyDownControl = 0;
                }
                if (this.beginFrame + this.step == this.etti && this.startEnd == 0) {


                    this.beginFrame = this.bi;
                    this.endFrame = this.ei;
                    this.keyDownControl = 0;
                }
                if (this.beginFrame + this.step == this.etti && this.startEnd == 1) {

                    this.beginFrame = this.be;
                    this.endFrame = this.ee;
                    this.startEnd = 0;
                }
                this.step = 0;
            }
        } else {
            if (this.startEnd == 1 && this.keyDownControl == 0) {
                this.beginFrame = this.be;
                this.endFrame = this.ee;
                this.step = 0;
                this.startEnd = 0;
            }
            if (this.tpf == this.tpfCounter) {
                this.step++;
                this.tpfCounter = 1;
            } else {
                this.tpfCounter++;
            }
        }
    }
    startLoop(beginIdle, endIdle, beginTransitionToLoop, endTransitionToLoop, beginLoop, endLoop, beginTransitionToIdle, endTransitionToIdle) {
        this.reorderSeq(beginIdle, endIdle, beginTransitionToLoop, endTransitionToLoop, beginLoop, endLoop, beginTransitionToIdle, endTransitionToIdle)

        console.log("startloop()");
        if (this.keyDownControl == 0) {
            this.beginFrame = this.bl;
            this.endFrame = this.el;
            if (this.startLoopControl == 1) {
                this.step = this.bttl - this.bl;
                this.startLoopControl = 0;
                this.keyUpControl = 1;
            }
        }
        this.keyDownControl = 1;
        this.endLoopControl = 0;
        this.startEnd = 0;
        this.noLoop = 0;
        this.startEndControl = 1;
    }
    endLoop() {
        if (this.keyUpControl == 1) {
            this.endLoopControl = 1;
        } else {
            this.endLoopControl = 0;
        }
        this.startLoopControl = 1;
    }
    end() {
        if (this.startEndControl == 1) {
            this.startEnd = 1;
        }
        this.startEndControl = 0;
    }
}
//////////////////////////////////////////////////////////

export class Sun extends DiffuseObject {
    constructor(name, gl, mainProgram, camera, angleFromY, angleFromZ, diffuseColor, specularColor, brightness) {
        const vertexArray = new Float32Array([
            0.0000000000000000000000000, 10.0000000000000000000000000, 0.0000000000000000000000000,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            3.8268349170684814453125000, 9.2387952804565429687500000, 0.0000000000000000000000000,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            0.0000000000000000000000000, 10.0000000000000000000000000, 0.0000000000000000000000000,
            -3.8268349170684814453125000, 9.2387952804565429687500000, 0.0000009999999974752427079,
            0.0000000000000000000000000, -10.0000000000000000000000000, 0.0000000000000000000000000,
            3.8268349170684814453125000, -9.2387952804565429687500000, -0.0000009999999974752427079,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            -3.8268349170684814453125000, -9.2387952804565429687500000, 0.0000000000000000000000000,
            0.0000000000000000000000000, -10.0000000000000000000000000, 0.0000000000000000000000000,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            3.8268349170684814453125000, -9.2387952804565429687500000, -0.0000009999999974752427079,
            7.0710678100585937500000000, -7.0710678100585937500000000, -0.0000009999999974752427079,
            7.0710678100585937500000000, -7.0710678100585937500000000, -0.0000009999999974752427079,
            9.2387952804565429687500000, -3.8268349170684814453125000, -0.0000009999999974752427079,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            -7.0710678100585937500000000, 7.0710678100585937500000000, 0.0000009999999974752427079,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            -3.8268349170684814453125000, 9.2387952804565429687500000, 0.0000009999999974752427079,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            -7.0710678100585937500000000, 7.0710678100585937500000000, 0.0000009999999974752427079,
            -9.2387952804565429687500000, 3.8268349170684814453125000, 0.0000009999999974752427079,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            9.2387952804565429687500000, -3.8268349170684814453125000, -0.0000009999999974752427079,
            10.0000000000000000000000000, 0.0000000000000000000000000, -0.0000009999999974752427079,
            10.0000000000000000000000000, 0.0000000000000000000000000, -0.0000009999999974752427079,
            9.2387952804565429687500000, 3.8268349170684814453125000, -0.0000009999999974752427079,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            -10.0000000000000000000000000, 0.0000000000000000000000000, 0.0000009999999974752427079,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            -9.2387952804565429687500000, 3.8268349170684814453125000, 0.0000009999999974752427079,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            -10.0000000000000000000000000, 0.0000000000000000000000000, 0.0000009999999974752427079,
            -9.2387952804565429687500000, -3.8268349170684814453125000, 0.0000009999999974752427079,
            -7.0710678100585937500000000, -7.0710678100585937500000000, 0.0000000000000000000000000,
            -3.8268349170684814453125000, -9.2387952804565429687500000, 0.0000000000000000000000000,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            -9.2387952804565429687500000, -3.8268349170684814453125000, 0.0000009999999974752427079,
            -7.0710678100585937500000000, -7.0710678100585937500000000, 0.0000000000000000000000000,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            9.2387952804565429687500000, 3.8268349170684814453125000, -0.0000009999999974752427079,
            7.0710678100585937500000000, 7.0710678100585937500000000, 0.0000000000000000000000000,
            0.0000000000000000000000000, 0.0000000000000000000000000, 0.0000000000000000000000000,
            7.0710678100585937500000000, 7.0710678100585937500000000, 0.0000000000000000000000000,
            3.8268349170684814453125000, 9.2387952804565429687500000, 0.0000000000000000000000000
        ]);
        const normalArray = new Float32Array(144);
        for (let i = 0; i < normalArray.length; i += 3) {
            normalArray[i] = 0;
            normalArray[i + 1] = 0;
            normalArray[i + 2] = 1;
        }
        const indexArray = new Uint16Array(48);
        for (let i = 0; i < indexArray.length; i++) {
            indexArray[i] = i;
        }
        super(name, gl, mainProgram, vertexArray, normalArray, indexArray, diffuseColor, specularColor, brightness);
        this.camera = camera;
        this.angleFromY = angleFromY;
        this.angleFromZ = angleFromZ;
        this.diffuseColor = new Float32Array([1, 1, 0.8]);
        assignMat4(this.scalarMatrix, scalarMat4x4(2));
        this.far = this.camera.zFar;
        this.isSun = 1;
        this.direction = new Float32Array([0, 0, 0]);
        this.position = new Float32Array([0, 0, 0]);
        this.updatePosition();

    }
    updatePosition() {
        const Y = Math.sin(this.angleFromY) * (this.far * 0.7) + this.camera.transformedPosition[1];
        const Z = Math.cos(this.angleFromZ) * Math.cos(this.angleFromY) * (this.far * 0.7) + this.camera.transformedPosition[2];
        const X = Math.sin(this.angleFromZ) * Math.cos(this.angleFromY) * (this.far * 0.7) + this.camera.transformedPosition[0];
        this.positionMatrix[12] = X;
        this.positionMatrix[13] = Y;
        this.positionMatrix[14] = Z;
        this.position[0] = X;
        this.position[1] = Y;
        this.position[2] = Z;
        this.direction[0] = -X;
        this.direction[1] = -Y;
        this.direction[2] = -Z;
        this.lookAtCamera(this.camera);
    }
    positionAngleWithYAxis(angleWithY) {
        this.angleFromY = angleWithY;
        this.updatePosition();
    }
    positionAngleWithZAxis(angleWithZ) {
        this.angleFromZ = angleWithZ;
        this.updatePosition();
    }
    createControls(name) {
        this.controls = new SunControls(this);
        this.controls.create(name);
    }
}

export class TexturedObject extends DiffuseObject {
    constructor(name, gl, mainProgram, vertexArray, normalArray, uvArray, indexArray, texture, diffuseColor, specularColor, brightness) {
        super(name, gl, mainProgram, vertexArray, normalArray, indexArray, diffuseColor, specularColor, brightness);
        //this.mainProgram = mainProgram;
        this.texture = texture;
        this.uvBuffer = new VBO(this.gl, uvArray, uvArray.length / 2); //////////////////////ver!
        this.isTextured = 1;
    }
}

export class Terrain extends TexturedObject {
    constructor(name, gl, mainProgram, vertexArray, normalArray, uvArray, indexArray, texture, specularColor, brightness) {
        super(name, gl, mainProgram, vertexArray, normalArray, uvArray, indexArray, texture, specularColor, brightness);
        this.mainProgram = mainProgram;
        this.rectangleList = []; // tiene la forma [[x<, x>, z<, z>], [...]]
        this.triangleList = [];
        this.potencialTriangles = [];
        this.matchingTriangle = new Float32Array(9);
        this.tVertexArray = new Float32Array(this.vertexArray.length);
        //this.NormalArray = new Float32Array(this.normalArray.length);///para prueba, luego quitar
        this.tNormalArray = new Float32Array(this.normalArray.length);
        this.transformVertexArray();
        this.setRectangleList();

    }
    transformVertexArray() {
        this.tVertexArray.set(transformVertexArray(this.vertexArray, this.modelMatrix));
        this.rectangleList = [];
        this.triangleList = [];
        this.setRectangleList();
    }

    setRectangleList() {
        for (let i = 0; i < this.indexArray.length; i += 3) {
            const triangle = new Float32Array(9); // [v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z]
            const rectangle = new Float32Array(4); // [rx<, rx>, rz<, rz>]
            triangle[0] = this.tVertexArray[(this.indexArray[i] * 3)];
            triangle[1] = this.tVertexArray[(this.indexArray[i] * 3) + 1];
            triangle[2] = this.tVertexArray[(this.indexArray[i] * 3) + 2];
            triangle[3] = this.tVertexArray[(this.indexArray[i + 1] * 3)];
            triangle[4] = this.tVertexArray[(this.indexArray[i + 1] * 3) + 1];
            triangle[5] = this.tVertexArray[(this.indexArray[i + 1] * 3) + 2];
            triangle[6] = this.tVertexArray[(this.indexArray[i + 2] * 3)];
            triangle[7] = this.tVertexArray[(this.indexArray[i + 2] * 3) + 1];
            triangle[8] = this.tVertexArray[(this.indexArray[i + 2] * 3) + 2];
            this.triangleList.push(triangle);
            rectangle[0] = Math.min(triangle[0], triangle[3], triangle[6]);
            rectangle[1] = Math.max(triangle[0], triangle[3], triangle[6]);
            rectangle[2] = Math.min(triangle[2], triangle[5], triangle[8]);
            rectangle[3] = Math.max(triangle[2], triangle[5], triangle[8]);
            this.rectangleList.push(new Float32Array([...rectangle]));
        }
    }
    findMatchingRectangles(objectPosition) {
        this.potencialTriangles = [];
        for (let i = 0; i < this.rectangleList.length; i++) {
            if (objectPosition[0] > this.rectangleList[i][0] && objectPosition[0] < this.rectangleList[i][1] &&
                objectPosition[2] > this.rectangleList[i][2] && objectPosition[2] < this.rectangleList[i][3]) {
                this.potencialTriangles.push(this.triangleList[i]);
            }
        }
    }
    findMatchingTriangle(objectPosition) {
        for (let i = 0; i < this.potencialTriangles.length; i++) {
            if (this.isPointInTriangle(this.potencialTriangles[i], objectPosition)) {
                this.matchingTriangle = [...this.potencialTriangles[i]];
            }
        }

    }
    isPointInTriangle(triangle, point) { //triangle [v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z] point [x,y,z]
        const v0 = [triangle[0], 0, triangle[2]];
        const v1 = [triangle[3], 0, triangle[5]];
        const v2 = [triangle[6], 0, triangle[8]];
        const p = [0, 0, 0];
        p[0] = point[0];
        p[2] = point[2];
        const tArea = triangleArea(v0, v1, v2);
        const areat0 = triangleArea(v0, v1, p);
        const areat1 = triangleArea(v0, v2, p);
        const areat2 = triangleArea(v1, v2, p);
        const areaSum = areat0 + areat1 + areat2;
        if (areaSum < tArea + 0.01 && areaSum > tArea - 0.01) {
            return true;
        }
        return false;
    }
    calculateTerrainY(objectPosition) { //devolver Y
        //this.updateGeometry();
        this.findMatchingRectangles(objectPosition);
        this.findMatchingTriangle(objectPosition);
        const triangleNormal = normalize3(normalOf(new Float32Array([this.matchingTriangle[0], this.matchingTriangle[1], this.matchingTriangle[2]]),
            new Float32Array([this.matchingTriangle[3], this.matchingTriangle[4], this.matchingTriangle[5]]),
            new Float32Array([this.matchingTriangle[6], this.matchingTriangle[7], this.matchingTriangle[8]])));
        const Y = (((this.matchingTriangle[1] * triangleNormal[1])) - (triangleNormal[0] * (objectPosition[0] - this.matchingTriangle[0])) - (triangleNormal[2] * (objectPosition[2] - this.matchingTriangle[2])));
        return Y + (2 * this.positionMatrix[13]);
    }
    /*updateGeometry() {
        const tNormal_Array = new Float32Array(facetedFaces(this.tVertexArray, this.indexArray));
        this.normalBuffer.updateData(tNormal_Array);
        this.transformVertexArray();
        this.setRectangleList();
        this.normalAfterDisplay.log(this.tNormalArray);
    }*/
    createControls(name) {
        this.controls = new TerrainControls(this);
        this.controls.create(name);
    }
}