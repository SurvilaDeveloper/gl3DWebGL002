import { facetedFaces, invertTriangularClock, oppositeNormalsArray } from "./glx_functions";

/**
 * @param width - Box width.
 * @param height - Box height.
 * @param depth - Box depth.
 * @param widthDivisions - Number of divisions on the width (X axis).
 * @param heightDivisions - Number of divisions on the height (Y axis).
 * @param depthDivisions - Number of divisions on the depth (Z axis).
 * @param originX - Can be: 'left'; 'center' (default) or 'right'.
 * @param originY - can be: 'top'; 'center' (default) or 'bottom'.
 * @param originZ - can be: 'front'; 'center' (default) or 'back'.
 * @param offsetX - Offset on the X axis.
 * @param offsetY - Offset on the Y axis.
 * @param offsetZ - Offset on the Z axis.
 */
export class Box {
    constructor(width, height, depth, widthDivisions, heightDivisions, depthDivisions, originX, originY, originZ, offsetX, offsetY, offsetZ) {
        this.width = width || 1;
        this.height = height || 1;
        this.depth = depth || 1;
        this.widthDiv = widthDivisions || 1;
        this.heightDiv = heightDivisions || 1;
        this.depthDiv = depthDivisions || 1;
        this.originX = originX || 'center';
        this.originY = originY || 'center';
        this.originZ = originZ || 'center';
        this.offsetX = offsetX || 0;
        this.offsetY = offsetY || 0;
        this.offsetZ = offsetZ || 0;

    }
    calculateDivs(dimension, divisions, initial, offset) {
        const values = [];
        //const inicial = -(dimension / 2);
        var module = dimension / divisions;
        for (let i = 0; i < divisions + 1; i++) {
            values.push(initial + offset + module * i);
        }
        //console.log('values',values);
        return values;
    }
    createRiFace(constCoord, nextCoord, prevCoord, normal) { //(minX, valuesY, valuesZ)    (x, y, z)  o  (y, z, x)  o  (z, x, y)
        var ind;
        const iniIndex = (this.i.length * 2) / 3;
        //console.log('index.length: ', this.i.length);
        for (let i = 0; i < nextCoord.length - 1; i++) {
            for (let j = 0; j < prevCoord.length - 1; j++) {
                this.v.push(constCoord);
                this.v.push(nextCoord[i]);
                this.v.push(prevCoord[j]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i]);
                this.v.push(prevCoord[j + 1]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i + 1]);
                this.v.push(prevCoord[j + 1]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i + 1]);
                this.v.push(prevCoord[j]);
                for (let n = 0; n < 4; n++) {
                    this.n.push(normal[0]);
                    this.n.push(normal[1]);
                    this.n.push(normal[2]);
                }
                ind = (i * (prevCoord.length - 1) * 4) + j * 4 + iniIndex;
                this.i.push(ind);
                this.i.push(ind + 1);
                this.i.push(ind + 2);
                this.i.push(ind + 2);
                this.i.push(ind + 3);
                this.i.push(ind);
            }
        }
    }
    createLeFace(constCoord, nextCoord, prevCoord, normal) { //(minX, valuesY, valuesZ)    (x, y, z)  o  (y, z, x)  o  (z, x, y)
        var ind;
        const iniIndex = (this.i.length * 2) / 3;
        //console.log('index.length: ', this.i.length);
        for (let i = 0; i < nextCoord.length - 1; i++) {
            for (let j = 0; j < prevCoord.length - 1; j++) {
                this.v.push(constCoord);
                this.v.push(nextCoord[i]);
                this.v.push(prevCoord[j]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i + 1]);
                this.v.push(prevCoord[j]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i + 1]);
                this.v.push(prevCoord[j + 1]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i]);
                this.v.push(prevCoord[j + 1]);
                for (let n = 0; n < 4; n++) {
                    this.n.push(normal[0]);
                    this.n.push(normal[1]);
                    this.n.push(normal[2]);
                }
                ind = (i * (prevCoord.length - 1) * 4) + j * 4 + iniIndex;
                this.i.push(ind);
                this.i.push(ind + 1);
                this.i.push(ind + 2);
                this.i.push(ind + 2);
                this.i.push(ind + 3);
                this.i.push(ind);
            }
        }
    }
    createToFace(constCoord, nextCoord, prevCoord, normal) {
        var ind;
        const iniIndex = (this.i.length * 2) / 3;
        //console.log('index.length: ', this.i.length);
        for (let i = 0; i < nextCoord.length - 1; i++) {
            for (let j = 0; j < prevCoord.length - 1; j++) {
                this.v.push(prevCoord[j]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i]);
                this.v.push(prevCoord[j + 1]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i]);
                this.v.push(prevCoord[j + 1]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i + 1]);
                this.v.push(prevCoord[j]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i + 1]);
                for (let n = 0; n < 4; n++) {
                    this.n.push(normal[0]);
                    this.n.push(normal[1]);
                    this.n.push(normal[2]);
                }
                ind = (i * (prevCoord.length - 1) * 4) + j * 4 + iniIndex;
                this.i.push(ind);
                this.i.push(ind + 1);
                this.i.push(ind + 2);
                this.i.push(ind + 2);
                this.i.push(ind + 3);
                this.i.push(ind);
            }
        }
    }
    createBoFace(constCoord, nextCoord, prevCoord, normal) {
        var ind;
        const iniIndex = (this.i.length * 2) / 3;
        //console.log('index.length: ', this.i.length);
        for (let i = 0; i < nextCoord.length - 1; i++) {
            for (let j = 0; j < prevCoord.length - 1; j++) {
                this.v.push(prevCoord[j]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i]);
                this.v.push(prevCoord[j]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i + 1]);
                this.v.push(prevCoord[j + 1]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i + 1]);
                this.v.push(prevCoord[j + 1]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i]);
                for (let n = 0; n < 4; n++) {
                    this.n.push(normal[0]);
                    this.n.push(normal[1]);
                    this.n.push(normal[2]);
                }
                ind = (i * (prevCoord.length - 1) * 4) + j * 4 + iniIndex;
                this.i.push(ind);
                this.i.push(ind + 1);
                this.i.push(ind + 2);
                this.i.push(ind + 2);
                this.i.push(ind + 3);
                this.i.push(ind);
            }
        }
    }
    createFrFace(constCoord, nextCoord, prevCoord, normal) {
        var ind;
        const iniIndex = (this.i.length * 2) / 3;
        //console.log('index.length: ', this.i.length);
        for (let i = 0; i < nextCoord.length - 1; i++) {
            for (let j = 0; j < prevCoord.length - 1; j++) {
                this.v.push(nextCoord[i]);
                this.v.push(prevCoord[j]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i]);
                this.v.push(prevCoord[j + 1]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i + 1]);
                this.v.push(prevCoord[j + 1]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i + 1]);
                this.v.push(prevCoord[j]);
                this.v.push(constCoord);
                for (let n = 0; n < 4; n++) {
                    this.n.push(normal[0]);
                    this.n.push(normal[1]);
                    this.n.push(normal[2]);
                }
                ind = (i * (prevCoord.length - 1) * 4) + j * 4 + iniIndex;
                this.i.push(ind);
                this.i.push(ind + 1);
                this.i.push(ind + 2);
                this.i.push(ind + 2);
                this.i.push(ind + 3);
                this.i.push(ind);
            }
        }
    }
    createBaFace(constCoord, nextCoord, prevCoord, normal) {
        var ind;
        const iniIndex = (this.i.length * 2) / 3;
        //console.log('index.length: ', this.i.length);
        for (let i = 0; i < nextCoord.length - 1; i++) {
            for (let j = 0; j < prevCoord.length - 1; j++) {
                this.v.push(nextCoord[i]);
                this.v.push(prevCoord[j]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i + 1]);
                this.v.push(prevCoord[j]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i + 1]);
                this.v.push(prevCoord[j + 1]);
                this.v.push(constCoord);
                this.v.push(nextCoord[i]);
                this.v.push(prevCoord[j + 1]);
                this.v.push(constCoord);


                for (let n = 0; n < 4; n++) {
                    this.n.push(normal[0]);
                    this.n.push(normal[1]);
                    this.n.push(normal[2]);
                }
                ind = (i * (prevCoord.length - 1) * 4) + j * 4 + iniIndex;
                this.i.push(ind);
                this.i.push(ind + 1);
                this.i.push(ind + 2);
                this.i.push(ind + 2);
                this.i.push(ind + 3);
                this.i.push(ind);
            }
        }
    }
    create() {
        switch (this.originX) {
            case 'left':
                this.initialX = 0;
                break;
            case 'right':
                this.initialX = -this.width;
                break;
            default:
                this.initialX = -(this.width / 2)
                break;
        }
        switch (this.originY) {
            case 'bottom':
                this.initialY = 0;
                break;
            case 'top':
                this.initialY = -this.height;
                break;
            default:
                this.initialY = -(this.height / 2)
                break;
        }
        switch (this.originZ) {
            case 'back':
                this.initialZ = 0;
                break;
            case 'front':
                this.initialZ = -this.depth;
                break;
            default:
                this.initialZ = -(this.depth / 2)
                break;
        }
        this.valuesX = this.calculateDivs(this.width, this.widthDiv, this.initialX, this.offsetX);
        this.valuesY = this.calculateDivs(this.height, this.heightDiv, this.initialY, this.offsetY);
        this.valuesZ = this.calculateDivs(this.depth, this.depthDiv, this.initialZ, this.offsetZ);
        this.minX = this.valuesX[0];
        this.maxX = this.valuesX[this.valuesX.length - 1];
        this.minY = this.valuesY[0];
        this.maxY = this.valuesY[this.valuesY.length - 1];
        this.minZ = this.valuesZ[0];
        this.maxZ = this.valuesZ[this.valuesZ.length - 1];
        this.v = [];
        this.n = [];
        this.i = [];
        //console.log(this.minX, this.maxX, this.minY, this.maxY, this.minZ, this.maxZ);
        this.createLeFace(this.minX, this.valuesY, this.valuesZ, [1, 0, 0]); //left face
        this.createRiFace(this.maxX, this.valuesY, this.valuesZ, [-1, 0, 0]); //right
        this.createBoFace(this.minY, this.valuesZ, this.valuesX, [0, 1, 0]); //top
        this.createToFace(this.maxY, this.valuesZ, this.valuesX, [0, -1, 0]); //bottom
        this.createBaFace(this.minZ, this.valuesX, this.valuesY, [0, 0, 1]); //front///////////////
        this.createFrFace(this.maxZ, this.valuesX, this.valuesY, [0, 0, -1]); //back
        this.vertexArray = new Float32Array(this.v);
        this.normalArray = new Float32Array(oppositeNormalsArray(this.n));
        this.indexArray = new Uint16Array(invertTriangularClock(this.i));
    }
}

/**
 * @param heightTop - Height of the upper pyramid.
 * @param heightBottom - height of the lower pyramid.
 * @param radioLeft - Measurement from the vertical axis to the left vertex.
 * @param radioRight - Measurement from the vertical axis to the right vertex.
 * @param radioFront - Measurement from the vertical axis to the frontal vertex.
 * @param radioBack - Measurement from the vertical axis to the rear vertex.
 * @param originX - Can be: 'left'; 'center' (default) or 'right'.
 * @param originY - can be: 'top'; 'center' (default) or 'bottom'.
 * @param originZ - can be: 'front'; 'center' (default) or 'back'.
 * @param offsetX - Offset on the X axis.
 * @param offsetY - Offset on the Y axis.
 * @param offsetZ - Offset on the Z axis.
 */
export class Octaedro {
    constructor(heightTop, heightBottom, radioLeft, radioRight, radioFront, radioBack, originX, originY, originZ, offsetX, offsetY, offsetZ) {
        this.heightTop = heightTop || 0.5;
        this.heightBottom = heightBottom || 0.5;
        this.radioLeft = radioLeft || 0.5;
        this.radioRight = radioRight || 0.5;
        this.radioFront = radioFront || 0.5;
        this.radioBack = radioBack || 0.5;
        this.originX = originX || 'center';
        this.originY = originY || 'center';
        this.originZ = originZ || 'center';
        this.offsetX = offsetX || 0;
        this.offsetY = offsetY || 0;
        this.offsetZ = offsetZ || 0;

    }
    create() {
        switch (this.originX) {
            case 'left':
                this.displacementX = this.radioLeft + this.offsetX;
                break;
            case 'right':
                this.displacementX = -this.radioRight + this.offsetX;
                break;
            default:
                this.displacementX = this.offsetX;
                break;
        }
        switch (this.originY) {
            case 'bottom':
                this.displacementY = this.heightBottom + this.offsetY;
                break;
            case 'top':
                this.displacementY = -this.heightTop + this.offsetY;
                break;
            default:
                this.displacementY = this.offsetY;
                break;
        }
        switch (this.originZ) {
            case 'back':
                this.displacementZ = this.radioBack + this.offsetZ;
                break;
            case 'front':
                this.displacementZ = -this.radioFront + + this.offsetZ;
                break;
            default:
                this.displacementZ = this.offsetZ;
        }
        const x = this.displacementX; //centerX
        const y = this.displacementY; //centerY
        const z = this.displacementZ; //centerZ
        const l = -this.radioLeft + this.displacementX; // left
        const r = this.radioRight + this.displacementX; //  right
        const b = -this.heightBottom + this.displacementY; //  bottom
        const t = this.heightTop + this.displacementY; //  top
        const k = -this.radioBack + this.displacementZ; //  back
        const f = this.radioFront + this.displacementZ; //  front
        this.vertexArray = new Float32Array([
            x, t, z,//0
            x, y, f,//1
            r, y, z,//2
            x, y, k,//3
            l, y, z,//4
            x, t, z,//5
            x, b, z,//6
            r, y, z,//7
            x, y, f,//8
            x, b, z,//9
            l, y, z,//10
            x, y, k,//11
            x, y, f,//12
            x, t, z,//13
            l, y, z,//14
            x, b, z,//15
            x, y, f,//16
            l, y, z,//17
            x, t, z,//18
            r, y, z,//19
            x, y, k,//20
            x, b, z,//21
            x, y, k,//22
            r, y, z//23
        ]);
        this.indexArray = new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
        this.normalArray = new Float32Array(facetedFaces(this.vertexArray, this.indexArray));
    }
}