export class Collision {
    constructor(objectA, objectB) {
        this.a = objectA;
        this.b = objectB;
        this.vertexPositionArrayA = new Float32Array(this.a.vertexArray.length);
        this.vertexPositionArrayB = new Float32Array(this.b.vertexArray.length);
        this.facesArrayA = new Array(this.a.indexArray.length);
        this.facesArrayB = new Array(this.b.indexArray.length);
        this.areasFaceArrayA = new Array(this.facesArrayA.length / 3).fill(0.0);
        this.areasFaceArrayB = new Array(this.facesArrayB.length / 3).fill(0.0);
        this.normalA = [0, 1, 0];
        this.normalB = [0, 0, 0];
        this.adjustment = 0.01;
        this.edgeAdjustment = 0.01;
        this.contactPoint = new Float32Array(3);
        this.contacted = false;
        this.averageVectorDisplay = new Display("averageVector298_");

    }
    setRadio(o) {
        let r = 0;
        o.radio = 0;
        for (let i = 0; i < o.vertexArray.length; i = i + 3) {
            let va = new Float32Array([o.vertexArray[i] * o.scalarMatrix[0],
            o.vertexArray[i + 1] * o.scalarMatrix[5],
            o.vertexArray[i + 2] * o.scalarMatrix[10]])
            r = vec3Mod(differenceBetweenVectors3([0, 0, 0], va));
            if (o.radio < r) { o.radio = r };
        }
    }

    check(ifTrue = function () { return true; }, ifFalse = function () { return false; }) {
        this.setRadio(this.a);
        this.setRadio(this.b);
        this.setVertexPositionArray(this.a, this.vertexPositionArrayA);
        this.setVertexPositionArray(this.b, this.vertexPositionArrayB);
        this.setFacesArray(this.a, this.vertexPositionArrayA, this.facesArrayA);
        this.setFacesArray(this.b, this.vertexPositionArrayB, this.facesArrayB);
        this.setAreasFaceArray(this.facesArrayA, this.areasFaceArrayA);
        this.setAreasFaceArray(this.facesArrayB, this.areasFaceArrayB);
        const isNear = isNearFromRadios([this.a.positionMatrix[12], this.a.positionMatrix[13], this.a.positionMatrix[14]],
            [this.b.positionMatrix[12], this.b.positionMatrix[13], this.b.positionMatrix[14]],
            this.a.radio, this.b.radio);
        if (isNear) {
            this.return = this.checkContact(ifTrue, ifFalse);
            return this.return
        }
        return false;
    }
    setVertexPositionArray(o, a) {

        for (let i = 0; i < o.vertexArray.length; i = i + 3) {
            let vec = new Float32Array([0, 0, 0, 1]);
            assignVec4(vec, multiplyMat4ByVec(transposeMatrix4(o.modelMatrix), [o.vertexArray[i], o.vertexArray[i + 1], o.vertexArray[i + 2], 1.0]))
            a[i] = vec[0];// + o.modelMatrix[12];
            a[i + 1] = vec[1];// + o.modelMatrix[13];
            a[i + 2] = vec[2];// + o.modelMatrix[14];
        }
    }
    setFacesArray(o, va, fa) {
        for (let i = 0; i < o.indexArray.length; i = i + 3) {
            const t = [
                new Float32Array(3),
                new Float32Array(3),
                new Float32Array(3)
            ];
            t[0][0] = va[o.indexArray[i] * 3];
            t[0][1] = va[o.indexArray[i] * 3 + 1];
            t[0][2] = va[o.indexArray[i] * 3 + 2];
            t[1][0] = va[o.indexArray[i + 1] * 3];
            t[1][1] = va[o.indexArray[i + 1] * 3 + 1];
            t[1][2] = va[o.indexArray[i + 1] * 3 + 2];
            t[2][0] = va[o.indexArray[i + 2] * 3];
            t[2][1] = va[o.indexArray[i + 2] * 3 + 1];
            t[2][2] = va[o.indexArray[i + 2] * 3 + 2];
            fa[i / 3] = t;
        }
    }
    setAreasFaceArray(fa, afa) {
        for (let i = 0; i < fa.length / 3; i++) {
            afa[i] = triangleArea(fa[i][0], fa[i][1], fa[i][2]);
        }
    }
    setCrossingFacesArray(arrayA, arrayB, display) { //pasar las caras que estan cerca segun radio
        const array = [];
        for (let i = 0; i < arrayA.length / 3; i++) {
            for (let j = 0; j < arrayB.length / 3; j++) {
                if (isCrossingThePlane(arrayA[i], arrayB[j], display)) {
                    const par = [i, j];
                    array.push(par);
                }
            }
        }
        return array;
    }
    takeOnlyTheSamePairs(arrayA, arrayB) {
        const array = [];
        for (let i = 0; i < arrayA.length; i++) {
            for (let j = 0; j < arrayB.length; j++) {
                if (arrayA[i][0] == arrayB[j][1] && arrayA[i][1] == arrayB[j][0]) {
                    const par = [arrayA[i][0], arrayB[j][0]];
                    array.push(par);
                }
            }
        }
        return array;
    }
    takeWhereEdgeCoincidesWithThePlane(emptyArray) {
        const point = [];
        for (let i = 0; i < emptyArray.length; i++) {
            const matchPoint = takeTheMatchPoint(this.facesArrayA[emptyArray[i][0]], this.facesArrayB[emptyArray[i][1]], this.edgeAdjustment, this);
            if (matchPoint != undefined) {
                for (let j = 0; j < matchPoint.length; j++) {
                    point.push(matchPoint[j]);
                }
            }
        }
        return (onlyTakeTheDifferentVectors(point));
    }
    checkContact(ifTrue, ifFalse) {
        const crossingBinA = this.setCrossingFacesArray(this.facesArrayA, this.facesArrayB, this.dotsDisplayB);
        const crossingAinB = this.setCrossingFacesArray(this.facesArrayB, this.facesArrayA, this.dotsDisplayA);
        const emptyArray = this.takeOnlyTheSamePairs(crossingBinA, crossingAinB);
        const averageVectorsArray = [...this.VertexContacts(), ...onlyTakeTheDifferentVectors(this.takeWhereEdgeCoincidesWithThePlane(emptyArray))];
        const averageVector = cleanArray(calculateAverageVector(averageVectorsArray))
        this.averageVectorDisplay.log("407: " + roundMatrixValues(averageVector, 4) + "; normalA :" + this.normalA + " ;normalB :" + this.normalB);
        if (averageVector != undefined) {
            this.contactPoint.set(averageVector);
            ifTrue();
            return true;
        } else {
            //this.normalA = [...[0, 1,0]];
            ifFalse();
            return false;
        }
    }
    VertexContacts() {
        const arr = [];
        for (let i = 0; i < this.vertexPositionArrayA.length / 3; i++) { //vertexPositionArray = [x,y,z, x,y,z, x,y,z,...]
            for (let j = 0; j < this.facesArrayB.length / 3; j++) {
                const v = [this.vertexPositionArrayA[i * 3], this.vertexPositionArrayA[i * 3 + 1], this.vertexPositionArrayA[i * 3 + 2]];
                const a1 = triangleArea(this.facesArrayB[j][0], v, this.facesArrayB[j][1]);
                const a2 = triangleArea(this.facesArrayB[j][1], v, this.facesArrayB[j][2]);
                const a3 = triangleArea(this.facesArrayB[j][0], v, this.facesArrayB[j][2]);
                const a = a1 + a2 + a3;
                if (a < this.areasFaceArrayB[j] + this.adjustment && a > this.areasFaceArrayB[j] - this.adjustment) {
                    this.normalB = [...normalize3(normalOf(this.facesArrayB[j][0], this.facesArrayB[j][1], this.facesArrayB[j][2]))];
                    this.contacted = true;
                    let vectorExist = false;
                    for (let k = 0; k < arr.length; k++) {
                        if (arr[k][0] === v[0] && arr[k][1] === v[1] && arr[k][2] === v[2]) {
                            vectorExist = true;
                            break;
                        }
                    }
                    if (!vectorExist) {
                        arr.push([v[0], v[1], v[2]]);
                    }
                }
            }
        }
        for (let i = 0; i < this.vertexPositionArrayB.length / 3; i++) {
            for (let j = 0; j < this.facesArrayA.length / 3; j++) {
                const v = [this.vertexPositionArrayB[i * 3], this.vertexPositionArrayB[i * 3 + 1], this.vertexPositionArrayB[i * 3 + 2]];
                const a1 = triangleArea(this.facesArrayA[j][0], v, this.facesArrayA[j][1]);
                const a2 = triangleArea(this.facesArrayA[j][1], v, this.facesArrayA[j][2]);
                const a3 = triangleArea(this.facesArrayA[j][0], v, this.facesArrayA[j][2]);
                const a = a1 + a2 + a3;
                if (a < this.areasFaceArrayA[j] + this.adjustment && a > this.areasFaceArrayA[j] - this.adjustment) {
                    this.normalA = [...normalize3(normalOf(this.facesArrayA[j][0], this.facesArrayA[j][1], this.facesArrayA[j][2]))];
                    this.contacted = true;
                    let vectorExist = false;
                    for (let k = 0; k < arr.length; k++) {
                        if (arr[k][0] === v[0] && arr[k][1] === v[1] && arr[k][2] === v[2]) {
                            vectorExist = true;
                            break;
                        }
                    }
                    if (!vectorExist) {
                        arr.push([v[0], v[1], v[2]]);
                    }
                }
            }
        }
        return arr;
    }
}