import { normalize3, normalOf } from "./matrix.js";

export function colorByIntensityToStringRGB(vectorColor, intensity) {
    const r = parseInt(vectorColor[0] * 255 * intensity);
    const g = parseInt(vectorColor[1] * 255 * intensity);
    const b = parseInt(vectorColor[2] * 255 * intensity);
    return "rgb(" + r + "," + g + "," + b + ")";
}

export function adaptBackgroundColor(HTMLElement, backgroundColor, intensity) {
    const r = backgroundColor[0] * intensity;
    const g = backgroundColor[1] * intensity;
    const b = backgroundColor[2] * intensity;
    const rgbSum = r + g + b;
    if (rgbSum > 1.5) {
        HTMLElement.style.color = '#000000';
    } else {
        HTMLElement.style.color = '#ffffff';
    }
}

export function isNearFromRadios(vectorPosition1, vectorPosition2, radio1, radio2) {
    const d = differenceBetweenVectors3(vectorPosition1, vectorPosition2);
    const m = vec3Mod(d);
    const s = radio1 + radio2;
    return m < s;
}

export function isBetweenParallelPlanesOfTheCenters(centerA, centerB, pointC) {
    const AC = differenceBetweenVectors3(centerA, pointC);
    const BC = differenceBetweenVectors3(centerB, pointC);
    const AB = differenceBetweenVectors3(centerB, centerA);
    const BA = multiplyVec3BySca(AB, -1);
    const dotAC = dot3(AB, AC);
    const dotBC = dot3(BA, BC);
    return (dotAC * dotBC) > 0;
}

export function isCrossingThePlane(faceInThePlane_A, faceToVerify_B) {
    const normal = normalOf(faceInThePlane_A[0], faceInThePlane_A[1], faceInThePlane_A[2]);
    const A = differenceBetweenVectors3(faceInThePlane_A[1], faceToVerify_B[0]);
    const B = differenceBetweenVectors3(faceInThePlane_A[1], faceToVerify_B[1]);
    const C = differenceBetweenVectors3(faceInThePlane_A[1], faceToVerify_B[2]);
    const dotA = dot3(A, normal);
    const dotB = dot3(B, normal);
    const dotC = dot3(C, normal);
    return !((dotA < 0 && dotB < 0 && dotC < 0) || (dotA > 0 && dotB > 0 && dotC > 0));
}

export function isFaceinPlane(faceInThePlane_A, faceToVerify_B) {
    const normal = normalOf(faceInThePlane_A[0], faceInThePlane_A[1], faceInThePlane_A[2]);
    const A = differenceBetweenVectors3(faceInThePlane_A[1], faceToVerify_B[0]);
    const B = differenceBetweenVectors3(faceInThePlane_A[1], faceToVerify_B[1]);
    const C = differenceBetweenVectors3(faceInThePlane_A[1], faceToVerify_B[2]);
    const dotA = dot3(A, normal);
    const dotB = dot3(B, normal);
    const dotC = dot3(C, normal);
    return (dotA == 0 && dotB == 0 && dotC == 0);
}

export function takeTheMatchPoint(faceA, faceB, adj, o) {
    const result = [];
    const vectorA0 = [undefined, undefined, undefined];
    const vectorA1 = [undefined, undefined, undefined];
    const vectorAf = [undefined, undefined, undefined];
    const vectorB0 = [undefined, undefined, undefined];
    const vectorB1 = [undefined, undefined, undefined];
    const vectorBf = [undefined, undefined, undefined];
    //let a0, a1, b0, b1;
    let A0 = false;
    let A1 = false;
    const vertexA = [0, 0, 0];
    const vertexAf = [0, 0, 0];
    const vertexB = [0, 0, 0];
    const vertexBf = [0, 0, 0];
    const normalA = normalOf(faceA[0], faceA[1], faceA[2]);
    const BA = differenceBetweenVectors3(faceA[1], faceB[0]);
    const BB = differenceBetweenVectors3(faceA[1], faceB[1]);
    const BC = differenceBetweenVectors3(faceA[1], faceB[2]);
    const dotBA = dot3(BA, normalA);
    const dotBB = dot3(BB, normalA);
    const dotBC = dot3(BC, normalA);
    const aloneB0 = (dotBA > 0 && dotBB < 0 && dotBC < 0) || (dotBA < 0 && dotBB > 0 && dotBC > 0);
    const aloneB1 = (dotBA < 0 && dotBB > 0 && dotBC < 0) || (dotBA > 0 && dotBB < 0 && dotBC > 0);
    const aloneB2 = (dotBA < 0 && dotBB < 0 && dotBC > 0) || (dotBA > 0 && dotBB > 0 && dotBC < 0);
    if (aloneB0) {
        const v0 = differenceBetweenVectors3(faceB[1], faceB[0]);
        const v1 = differenceBetweenVectors3(faceB[2], faceB[0]);
        const vf = differenceBetweenVectors3(faceB[1], faceB[2]);
        assignVec3(vectorB0, v0);
        assignVec3(vectorB1, v1);
        assignVec3(vectorBf, vf);
        assignVec3(vertexB, faceB[0]);
        assignVec3(vertexBf, faceB[2]);
    } else if (aloneB1) {
        const v0 = differenceBetweenVectors3(faceB[2], faceB[1]);
        const v1 = differenceBetweenVectors3(faceB[0], faceB[1]);
        const vf = differenceBetweenVectors3(faceB[2], faceB[0]);
        assignVec3(vectorB0, v0);
        assignVec3(vectorB1, v1);
        assignVec3(vectorBf, vf);
        assignVec3(vertexB, faceB[1]);
        assignVec3(vertexBf, faceB[0]);
    } else if (aloneB2) {
        const v0 = differenceBetweenVectors3(faceB[0], faceB[2]);
        const v1 = differenceBetweenVectors3(faceB[1], faceB[2]);
        const vf = differenceBetweenVectors3(faceB[0], faceB[1]);
        assignVec3(vectorB0, v0);
        assignVec3(vectorB1, v1);
        assignVec3(vectorBf, vf);
        assignVec3(vertexB, faceB[2]);
        assignVec3(vertexBf, faceB[1]);
    }
    const normalB = normalOf(faceB[0], faceB[1], faceB[2]);
    const AA = differenceBetweenVectors3(faceB[1], faceA[0]);
    const AB = differenceBetweenVectors3(faceB[1], faceA[1]);
    const AC = differenceBetweenVectors3(faceB[1], faceA[2]);
    const dotAA = dot3(AA, normalB);
    const dotAB = dot3(AB, normalB);
    const dotAC = dot3(AC, normalB);
    const aloneA0 = (dotAA > 0 && dotAB < 0 && dotAC < 0) || (dotAA < 0 && dotAB > 0 && dotAC > 0);
    const aloneA1 = (dotAA < 0 && dotAB > 0 && dotAC < 0) || (dotAA > 0 && dotAB < 0 && dotAC > 0);
    const aloneA2 = (dotAA < 0 && dotAB < 0 && dotAC > 0) || (dotAA > 0 && dotAB > 0 && dotAC < 0);
    if (aloneA0) {
        const v0 = differenceBetweenVectors3(faceA[1], faceA[0]);
        const v1 = differenceBetweenVectors3(faceA[2], faceA[0]);
        const vf = differenceBetweenVectors3(faceA[1], faceA[2]);
        assignVec3(vectorA0, v0);
        assignVec3(vectorA1, v1);
        assignVec3(vectorAf, vf);
        assignVec3(vertexA, faceA[0]);
        assignVec3(vertexAf, faceA[2]);
    } else if (aloneA1) {
        const v0 = differenceBetweenVectors3(faceA[2], faceA[1]);
        const v1 = differenceBetweenVectors3(faceA[0], faceA[1]);
        const vf = differenceBetweenVectors3(faceA[2], faceA[0]);
        assignVec3(vectorA0, v0);
        assignVec3(vectorA1, v1);
        assignVec3(vectorAf, vf);
        assignVec3(vertexA, faceA[1]);
        assignVec3(vertexAf, faceA[0]);
    } else if (aloneA2) {
        const v0 = differenceBetweenVectors3(faceA[0], faceA[2]);
        const v1 = differenceBetweenVectors3(faceA[1], faceA[2]);
        const vf = differenceBetweenVectors3(faceA[0], faceA[1]);
        assignVec3(vectorA0, v0);
        assignVec3(vectorA1, v1);
        assignVec3(vectorAf, vf);
        assignVec3(vertexA, faceA[2]);
        assignVec3(vertexAf, faceA[1]);
    }
    const a0 = (normalB[0] * (vertexA[0] - faceB[1][0]) + normalB[1] * (vertexA[1] - faceB[1][1]) + normalB[2] * (vertexA[2] - faceB[1][2])) /
        ((normalB[0] * vectorA0[0]) + (normalB[1] * vectorA0[1]) + (normalB[2] * vectorA0[2]));
    const a1 = (normalB[0] * (vertexA[0] - faceB[1][0]) + normalB[1] * (vertexA[1] - faceB[1][1]) + normalB[2] * (vertexA[2] - faceB[1][2])) /
        ((normalB[0] * vectorA1[0]) + (normalB[1] * vectorA1[1]) + (normalB[2] * vectorA1[2]));

    const b0 = (normalA[0] * (vertexB[0] - faceA[1][0]) + normalA[1] * (vertexB[1] - faceA[1][1]) + normalA[2] * (vertexB[2] - faceA[1][2])) /
        ((normalA[0] * vectorB0[0]) + (normalA[1] * vectorB0[1]) + (normalA[2] * vectorB0[2]));
    const b1 = (normalA[0] * (vertexB[0] - faceA[1][0]) + normalA[1] * (vertexB[1] - faceA[1][1]) + normalA[2] * (vertexB[2] - faceA[1][2])) /
        ((normalA[0] * vectorB1[0]) + (normalA[1] * vectorB1[1]) + (normalA[2] * vectorB1[2]));

    const pointA0 = differenceBetweenVectors3(vertexA, multiplyVec3BySca(vectorA0, a0));
    const pointA1 = differenceBetweenVectors3(vertexA, multiplyVec3BySca(vectorA1, a1));
    const pointB0 = differenceBetweenVectors3(vertexB, multiplyVec3BySca(vectorB0, b0));
    const pointB1 = differenceBetweenVectors3(vertexB, multiplyVec3BySca(vectorB1, b1));

    A0 = compareVectors(pointA0, pointB0, adj) || compareVectors(pointA0, pointB1, adj);
    A1 = compareVectors(pointA1, pointB0, adj) || compareVectors(pointA1, pointB0, adj);

    if (A0) {
        result.push(pointA0);
        o.normalA = [...normalize3(normalA)];
        //console.log("edge con edge");
    } else if (A1) {
        result.push(pointA1);
        o.normalA = [...normalize3(normalA)];
        //console.log("edge con edge");
    }
    const A0Bf = differenceBetweenVectors3(pointA0, vertexBf);
    const crossA0BfxBf = cross3(A0Bf, vectorBf);
    const modA0BfxBf = vec3Mod(crossA0BfxBf);
    if (modA0BfxBf < 0.01 && vec3Mod(A0Bf) < vec3Mod(vectorBf) && dot3(A0Bf, vectorBf) > 0) {          //console.log("crossing");
        result.push(pointA0);
    }
    const A1Bf = differenceBetweenVectors3(pointA1, vertexBf);
    const crossA1BfxBf = cross3(A1Bf, vectorBf);
    const modA1BfxBf = vec3Mod(crossA1BfxBf);
    if (modA1BfxBf < 0.01 && vec3Mod(A1Bf) < vec3Mod(vectorBf) && dot3(A1Bf, vectorBf) > 0) {          //console.log("crossing");
        result.push(pointA1);
    }
    const B0Af = differenceBetweenVectors3(pointB0, vertexAf);
    const crossB0AfxAf = cross3(B0Af, vectorAf);
    const modB0AfxAf = vec3Mod(crossB0AfxAf);
    if (modB0AfxAf < 0.01 && vec3Mod(B0Af) < vec3Mod(vectorAf) && dot3(B0Af, vectorAf) > 0) {          //console.log("crossing");
        result.push(pointB0);
    }
    const B1Af = differenceBetweenVectors3(pointB1, vertexAf);
    const crossB1AfxAf = cross3(B1Af, vectorAf);
    const modB1AfxAf = vec3Mod(crossB1AfxAf);
    if (modB1AfxAf < 0.01 && vec3Mod(B1Af) < vec3Mod(vectorAf) && dot3(B1Af, vectorAf) > 0) {          //console.log("crossing");
        result.push(pointB1);
    }
    if (result.length != 0) {
        o.normalA = [...normalize3(normalA)];
        return onlyTakeTheDifferentVectors(result);
    }
    return undefined;
}

export function onlyTakeTheDifferentVectors(arrayOfVector) {
    const arrSet = new Set();
    const arr = [];
    const adj = 0.01;
    for (const vector of arrayOfVector) {
        const key = vector.map(coord => Math.round(coord / adj));
        if (!arrSet.has(key)) {
            arrSet.add(key);
            arr.push(vector);
        }
    }
    return arr;
}

export function calculateAverageVector(a) {
    if (a !== undefined && a !== null && a != []) {
        let x = 0;
        let y = 0;
        let z = 0;
        for (let i = 0; i < a.length; i++) {
            x += a[i][0];
            y += a[i][1];
            z += a[i][2];
        }
        const aveX = x / a.length;
        const aveY = y / a.length;
        const aveZ = z / a.length;
        return [aveX, aveY, aveZ];
    }
    return undefined;
}

export function cleanArray(a) {
    if (a.every(element => isNaN(element))) {
        return undefined;
    }
    return a;
}

export function roundMatrixValues(matrix, decimal = 3) {
    const roundedMatrix = [];
    if (matrix != undefined) {
        for (let i = 0; i < matrix.length; i++) {
            if (Array.isArray(matrix[i])) {
                const row = [];
                for (let j = 0; j < matrix[i].length; j++) {
                    if (Array.isArray(matrix[i][j])) {
                        const row2 = [];
                        for (let k = 0; k < matrix[i][j].length; k++) {
                            const parsedValue = parseFloat(matrix[i][j][k]);
                            row2.push(isNaN(parsedValue) ? matrix[i][j][k] : parsedValue.toFixed(decimal));
                        }
                        row.push(row2); // Agregar la fila anidada a la fila principal
                    } else {
                        const parsedValue = parseFloat(matrix[i][j]);
                        row.push(isNaN(parsedValue) ? matrix[i][j] : parsedValue.toFixed(decimal));
                    }
                }
                roundedMatrix.push(row);
            } else {
                const parsedValue = parseFloat(matrix[i]);
                roundedMatrix.push(isNaN(parsedValue) ? matrix[i] : parsedValue.toFixed(decimal));
            }
        }
        return roundedMatrix;
    } else {
        return undefined;
    }
}

export function compareVectors(v0, v1, errorRange) {
    const x = Math.abs(v0[0] - v1[0]) <= errorRange;
    const y = Math.abs(v0[1] - v1[1]) <= errorRange;
    const z = Math.abs(v0[2] - v1[2]) <= errorRange;
    return x && y && z;
}

export function facetedFaces(vertexArray, indexArray) { //retorna un array con las normales de los vertices para asignar luego al normalArray
    const normals = new Array(vertexArray.length);
    for (let i = 0; i < indexArray.length; i = i + 3) {
        const v0 = [vertexArray[(3 * indexArray[i])], vertexArray[(3 * indexArray[i]) + 1], vertexArray[(3 * indexArray[i]) + 2]];
        const v1 = [vertexArray[(3 * indexArray[i + 1])], vertexArray[(3 * indexArray[i + 1]) + 1], vertexArray[(3 * indexArray[i + 1]) + 2]];
        const v2 = [vertexArray[(3 * indexArray[i + 2])], vertexArray[(3 * indexArray[i + 2]) + 1], vertexArray[(3 * indexArray[i + 2]) + 2]];
        const n = normalize3(normalOf(v2, v1, v0));
        normals[(3 * indexArray[i])] = n[0];
        normals[(3 * indexArray[i]) + 1] = n[1];
        normals[(3 * indexArray[i]) + 2] = n[2];
        normals[(3 * indexArray[i + 1])] = n[0];
        normals[(3 * indexArray[i + 1]) + 1] = n[1];
        normals[(3 * indexArray[i + 1]) + 2] = n[2];
        normals[(3 * indexArray[i + 2])] = n[0];
        normals[(3 * indexArray[i + 2]) + 1] = n[1];
        normals[(3 * indexArray[i + 2]) + 2] = n[2];
    }
    return normals;
}

export function invertTriangularClock(indexArray) {
    const newIndexArray = new Array(indexArray.length)
    for (let i = 0; i < indexArray.length; i = i + 3) {
        newIndexArray[i] = indexArray[i + 2];
        newIndexArray[i + 1] = indexArray[i + 1];
        newIndexArray[i + 2] = indexArray[i];
    }
    return newIndexArray;
}

export function oppositeNormalsArray(normalArray) {
    const newNormalsArray = new Array(normalArray.length);
    for (let i = 0; i < normalArray.length; i++) {
        newNormalsArray[i] = -normalArray[i];
    }
    return newNormalsArray;
}
