//////////constants
export const EPSILON = 0.0000001;

//////////special vectors and matrices

export const v10 = new Float32Array([1, 0]);
export const v01 = new Float32Array([0, 1.]);
export const v100 = new Float32Array([1., 0, 0]);
export const v010 = new Float32Array([0., 1., 0.]);
export const v001 = new Float32Array([0., 0., 1.]);
export const v1000 = new Float32Array([1., 0., 0., 0.]);
export const v0100 = new Float32Array([0., 1., 0., 0.]);
export const v0010 = new Float32Array([0., 0., 1., 0.]);
export const v0001 = new Float32Array([0., 0., 0., 1.]);
export const identityMat3x3 = new Float32Array([1., 0, 0, 0, 1., 0, 0, 0, 1.]);
export const identityMat4x4 = new Float32Array([1., 0, 0, 0, 0, 1., 0, 0, 0, 0, 1., 0, 0, 0, 0, 1.]);
export const projectionMat = new Float32Array([1.2071068286895752, 0, 0, 0, 0, 2.4142136573791504, 0, 0, 0, 0, -1.0020020008087158, -1, 0, 0, -0.20020020008087158, 0])
export const nullVec3 = new Float32Array([0, 0, 0]);
export const nullVec4 = new Float32Array([0, 0, 0, 0]);
export const nullMat3x3 = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0]);
export const nullMat4x4 = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
//////////scalar matrices
export function scalarMat3x3(s) {
    return new Float32Array([s, 0, 0, 0, s, 0, 0, 0, s]);
}

export function scalarMat4x4(s) {
    return new Float32Array([s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1.0]);
}

export function scalarMat4x4_x(s) {
    return new Float32Array([s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

export function scalarMat4x4_y(s) {
    return new Float32Array([1, 0, 0, 0, 0, s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

export function scalarMat4x4_z(s) {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, s, 0, 0, 0, 0, 1])
}

//////////rotate matrices
export function rotateMat_x(angle) {
    return new Float32Array([1, 0, 0, 0,
        0, Math.cos(angle), Math.sin(angle), 0,
        0, -1 * Math.sin(angle), Math.cos(angle), 0,
        0, 0, 0, 1]);
}

export function rotateMat_y(angle) {
    return new Float32Array([Math.cos(angle), 0, -1 * Math.sin(angle), 0,
        0, 1, 0, 0,
    Math.sin(angle), 0, Math.cos(angle), 0,
        0, 0, 0, 1]);
}

export function rotateMat_z(angle) {
    return new Float32Array([Math.cos(angle), Math.sin(angle), 0, 0,
    -1 * Math.sin(angle), Math.cos(angle), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1]);
}

//////////projection matrices
export function perspective(fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2);
    var nf = 1 / (near - far);
    return new Float32Array([f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, (2 * far * near) * nf, 0]);
}

export function ortho(left, right, bottom, top, near, far) {
    var lr = 1 / (left - right);
    var bt = 1 / (bottom - top);
    var nf = 1 / (near - far);
    return new Float32Array([-2 * lr, 0, 0, 0,
        0, -2 * bt, 0, 0,
        0, 0, 2 * nf, 0,
    (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1]);
}

//////////special matrices
export function transposeMatrix4(m) {
    return new Float32Array([m[0], m[4], m[8], m[12],
    m[1], m[5], m[9], m[13],
    m[2], m[6], m[10], m[14],
    m[3], m[7], m[11], m[15]]);
}

//////////view matrices
export function lookAt(eye, target, up) {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    let eyex = eye[0];
    let eyey = eye[1];
    let eyez = eye[2];
    let upx = up[0];
    let upy = up[1];
    let upz = up[2];
    let targetx = target[0];
    let targety = target[1];
    let targetz = target[2];

    if (Math.abs(eyex - targetx) < EPSILON &&
        Math.abs(eyey - targety) < EPSILON &&
        Math.abs(eyez - targetz) < EPSILON) {
        return identityMat4x4;
    }

    z0 = eyex - targetx;
    z1 = eyey - targety;
    z2 = eyez - targetz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }
    return [x0, y0, z0, 0, x1, y1, z1, 0, x2, y2, z2, 0,
        -(x0 * eyex + x1 * eyey + x2 * eyez),
        -(y0 * eyex + y1 * eyey + y2 * eyez),
        -(z0 * eyex + z1 * eyey + z2 * eyez),
        1];
}

//////////multiplying a matrix by a scalar
export function multiplyMat3BySca(matrix, scalar) {
    const r = nullMat3x3;
    const m = matrix;
    const s = scalar;
    r[0] = m[0] * s;
    r[1] = m[1] * s;
    r[2] = m[2] * s;
    r[3] = m[3] * s;
    r[4] = m[4] * s;
    r[5] = m[5] * s;
    r[6] = m[6] * s;
    r[7] = m[7] * s;
    r[8] = m[8] * s;
    return r;
}

export function multiplyMat4BySca(matrix, scalar) {
    const r = nullMat4x4;
    const m = matrix;
    const s = scalar;
    r[0] = m[0] * s;
    r[1] = m[1] * s;
    r[2] = m[2] * s;
    r[3] = m[3] * s;
    r[4] = m[4] * s;
    r[5] = m[5] * s;
    r[6] = m[6] * s;
    r[7] = m[7] * s;
    r[8] = m[8] * s;
    r[9] = m[9] * s;
    r[10] = m[10] * s;
    r[11] = m[11] * s;
    r[12] = m[12] * s;
    r[13] = m[13] * s;
    r[14] = m[14] * s;
    r[15] = m[15] * s;
    return r;
}

//////////Multiply a matrix by a vector
export function multiplyMat3ByVec(matrix, vector) {
    const r = nullVec3;
    const m = matrix;
    const v = vector;
    r[0] = m[0] * v[0] + m[1] * v[1] + m[2] * v[2];
    r[1] = m[3] * v[0] + m[4] * v[1] + m[5] * v[2];
    r[2] = m[6] * v[0] + m[7] * v[1] + m[8] * v[2];
    return r;
}

export function multiplyMat4ByVec(matrix, vector) {
    const r = nullVec4;
    const m = matrix;
    const v = vector;
    r[0] = m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3] * v[3];
    r[1] = m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7] * v[3];
    r[2] = m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11] * v[3];
    r[3] = m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3];
    return r;
}

//////////Multiply a matrix by another matrix
export function multiplyMat3(matrixA, matrixB) {
    const a = matrixA;
    const b = matrixB;
    const m = nullMat3x3;
    m[0] = a[0] * b[0] + a[1] * b[3] + a[2] * b[6];
    m[1] = a[0] * b[1] + a[1] * b[4] + a[2] * b[7];
    m[2] = a[0] * b[2] + a[1] * b[5] + a[2] * b[8];
    m[3] = a[3] * b[0] + a[4] * b[3] + a[5] * b[6];
    m[4] = a[3] * b[1] + a[4] * b[4] + a[5] * b[7];
    m[5] = a[3] * b[2] + a[4] * b[5] + a[5] * b[8];
    m[6] = a[6] * b[0] + a[7] * b[3] + a[8] * b[6];
    m[7] = a[6] * b[1] + a[7] * b[4] + a[8] * b[7];
    m[8] = a[6] * b[2] + a[7] * b[5] + a[8] * b[8];
    return m;
}

export function multiplyMat4(matrixA, matrixB) {
    const a = matrixA;
    const b = matrixB;
    const m = nullMat4x4;
    m[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
    m[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
    m[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
    m[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];
    m[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
    m[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
    m[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
    m[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];
    m[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
    m[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
    m[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
    m[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];
    m[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
    m[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
    m[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
    m[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];
    return m;
}

//////////Matrices Sum
export function Mat3Sum(matrixA, matrixB) {
    const m = nullMat4x4;
    const a = matrixA;
    const b = matrixB;
    m[0] = a[0] + b[0];
    m[1] = a[1] + b[1];
    m[2] = a[2] + b[2];
    m[3] = a[3] + b[3];
    m[4] = a[4] + b[4];
    m[5] = a[5] + b[5];
    m[6] = a[6] + b[6];
    m[7] = a[7] + b[7];
    m[8] = a[8] + b[8];
    return m;
}

export function Mat4Sum(matrixA, matrixB) {
    const m = nullMat4x4;
    const a = matrixA;
    const b = matrixB;
    m[0] = a[0] + b[0];
    m[1] = a[1] + b[1];
    m[2] = a[2] + b[2];
    m[3] = a[3] + b[3];
    m[4] = a[4] + b[4];
    m[5] = a[5] + b[5];
    m[6] = a[6] + b[6];
    m[7] = a[7] + b[7];
    m[8] = a[8] + b[8];
    m[9] = a[9] + b[9];
    m[10] = a[10] + b[10];
    m[11] = a[11] + b[11];
    m[12] = a[12] + b[12];
    m[13] = a[13] + b[13];
    m[14] = a[14] + b[14];
    m[15] = a[15] + b[15];
    return m;
}

//////////between vectors operations
export function dot2(v0, v1) {
    return (v0[0] * v1[0]) + (v0[1] * v1[1]);
}

export function dot3(v0, v1) {
    return (v0[0] * v1[0]) + (v0[1] * v1[1]) + (v0[2] * v1[2]);
}

export function dot4(v0, v1) {
    return (v0[0] * v1[0]) + (v0[1] * v1[1]) + (v0[2] * v1[2]) + (v0[3] * v1[3]);
}

export function cross3(v0, v1) {
    const deli = (v0[1] * v1[2]) - (v0[2] * v1[1]);
    const delj = (v0[2] * v1[0]) - (v0[0] * v1[2]);
    const delk = (v0[0] * v1[1]) - (v0[1] * v1[0]);
    return [deli, delj, delk];
}

export function normalize3(vector) {
    const mod = vec3Mod(vector);
    if (mod > EPSILON) {
        return [vector[0] / mod, vector[1] / mod, vector[2] / mod];
    } else {
        return [0.0, 0.0, 0.0];
    }
}

export function differenceBetweenVectors3(v0, v1) {
    return [v0[0] - v1[0], v0[1] - v1[1], v0[2] - v1[2]];
}

export function sumVectors3(v0, v1) {
    return [v0[0] + v1[0], v0[1] + v1[1], v0[2] + v1[2]];
}
//////////information functions
export function vec2Mod(vector) {
    return Math.sqrt((vector[0] * vector[0]) + (vector[1] * vector[1]));
}

export function vec3Mod(vector) {
    return Math.sqrt((vector[0] * vector[0]) + (vector[1] * vector[1]) + (vector[2] * vector[2]));
}

//////////multiply vectors by scalar
export function multiplyVec3BySca(vector, scalar) {
    const r = nullVec3;
    const v = vector;
    const s = scalar;
    r[0] = v[0] * s;
    r[1] = v[1] * s;
    r[2] = v[2] * s;
    return r;
}

//////////assignament functions
export function assignVec2(vectorTarget, vectorSource) {
    vectorTarget[0] = vectorSource[0];
    vectorTarget[1] = vectorSource[1];
}

export function assignVec3(vectorTarget, vectorSource) {
    vectorTarget[0] = vectorSource[0];
    vectorTarget[1] = vectorSource[1];
    vectorTarget[2] = vectorSource[2];
}

export function assignVec4(vectorTarget, vectorSource) {
    vectorTarget[0] = vectorSource[0];
    vectorTarget[1] = vectorSource[1];
    vectorTarget[2] = vectorSource[2];
    vectorTarget[3] = vectorSource[3];
}

export function assignMat3(matrixTarget, matrixSource) {
    matrixTarget[0] = matrixSource[0];
    matrixTarget[1] = matrixSource[1];
    matrixTarget[2] = matrixSource[2];
    matrixTarget[3] = matrixSource[3];
    matrixTarget[4] = matrixSource[4];
    matrixTarget[5] = matrixSource[5];
    matrixTarget[6] = matrixSource[6];
    matrixTarget[7] = matrixSource[7];
    matrixTarget[8] = matrixSource[8];
}

export function assignMat4(matrixTarget, matrixSource) {
    matrixTarget[0] = matrixSource[0];
    matrixTarget[1] = matrixSource[1];
    matrixTarget[2] = matrixSource[2];
    matrixTarget[3] = matrixSource[3];
    matrixTarget[4] = matrixSource[4];
    matrixTarget[5] = matrixSource[5];
    matrixTarget[6] = matrixSource[6];
    matrixTarget[7] = matrixSource[7];
    matrixTarget[8] = matrixSource[8];
    matrixTarget[9] = matrixSource[9];
    matrixTarget[10] = matrixSource[10];
    matrixTarget[11] = matrixSource[11];
    matrixTarget[12] = matrixSource[12];
    matrixTarget[13] = matrixSource[13];
    matrixTarget[14] = matrixSource[14];
    matrixTarget[15] = matrixSource[15];
}

//////////gl functions

export function positionGlFactorMatrix(vector3) {
    return [vector3[0], 0, 0, 0, 0, vector3[1], 0, 0, 0, 0, vector3[2], 0, 0, 0, 0, 1.0];
}

export function FromOrientMatrixAxisX(orientMatrix4x4) {
    return [orientMatrix4x4[0], orientMatrix4x4[1], orientMatrix4x4[2]];
}

export function FromOrientMatrixAxisY(orientMatrix4x4) {
    return [orientMatrix4x4[4], orientMatrix4x4[5], orientMatrix4x4[6]];
}

export function FromOrientMatrixAxisZ(orientMatrix4x4) {
    return [orientMatrix4x4[8], orientMatrix4x4[9], orientMatrix4x4[10]];
}

export function orientViewX(object, angle) {
    const o = object;
    const delta = o.angleX - angle;
    const axis = [1.0, 0.0, 0.0];//FromOrientMatrixAxisX(multiplyMat4(o.orientMatrix, o.rotateMatrix));
    assignMat4(o.rotateMatrix, multiplyMat4(o.rotateMatrix, ArbitraryAxisRotationMatrix(axis, delta)));
    o.angleX = angle;
}
export function orientViewY(object, angle) {
    //const o = object;
    //o.deltaAngY = o.angleY-angle;
    //o.angleY = angle;
    //assignMat4(o.orientMatrix, multiplyMat4(o.orientMatrix, rotateMat_y(o.deltaAngY)));
    const o = object;
    const delta = o.angleY - angle;
    const axis = [0.0, 1.0, 0.0];//FromOrientMatrixAxisX(multiplyMat4(o.orientMatrix, o.rotateMatrix));
    assignMat4(o.rotateMatrix, multiplyMat4(o.rotateMatrix, ArbitraryAxisRotationMatrix(axis, delta)));
    o.angleY = angle;
}
export function orientViewZ(object, angle) {
    const o = object;
    const delta = o.angleZ - angle;
    const axis = [0.0, 0.0, 1.0];//FromOrientMatrixAxisX(multiplyMat4(o.orientMatrix, o.rotateMatrix));
    assignMat4(o.rotateMatrix, multiplyMat4(o.rotateMatrix, ArbitraryAxisRotationMatrix(axis, delta)));
    o.angleZ = angle;
}

export function rotateOwnAxisX(object, angle) {
    const o = object;
    const delta = o.ownAngleX - angle;
    const axis = FromOrientMatrixAxisX(o.rotateMatrix);//(multiplyMat4(o.orientMatrix, o.rotateMatrix));
    assignMat4(o.rotateMatrix, multiplyMat4(o.rotateMatrix, ArbitraryAxisRotationMatrix(axis, delta)));
    o.ownAngleX = angle;
}

export function rotateOwnAxisY(object, angle) {
    const o = object;
    const delta = o.ownAngleY - angle;
    const axis = FromOrientMatrixAxisY(o.rotateMatrix);//(multiplyMat4(o.orientMatrix, o.rotateMatrix));
    assignMat4(o.rotateMatrix, multiplyMat4(o.rotateMatrix, ArbitraryAxisRotationMatrix(axis, delta)));
    o.ownAngleY = angle;
}

export function rotateOwnAxisZ(object, angle) {
    const o = object;
    const delta = o.ownAngleZ - angle;
    const axis = FromOrientMatrixAxisZ(o.rotateMatrix);//(multiplyMat4(o.orientMatrix, o.rotateMatrix));
    assignMat4(o.rotateMatrix, multiplyMat4(o.rotateMatrix, ArbitraryAxisRotationMatrix(axis, delta)));
    o.ownAngleZ = angle;
}

export function ArbitraryAxisRotationMatrix(axis, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const x = axis[0];
    const y = axis[1];
    const z = axis[2];
    const lc = 1 - c;
    const xx = x * x;
    const xy = x * y;
    const xz = x * z;
    const yy = y * y;
    const yz = y * z;
    const zz = z * z;
    return [c + xx * lc, xy * lc - z * s, xz * lc + y * s, 0.0,
    xy * lc + z * s, c + yy * lc, yz * lc - x * s, 0.0,
    xz * lc - y * s, yz * lc + x * s, c + zz * lc, 0.0,
        0.0, 0.0, 0.0, 1.0]
}



export function triangleArea(v0, v1, v2) {
    const vA = differenceBetweenVectors3(v0, v1);
    //console.log("vA...: ", vA);
    const vB = differenceBetweenVectors3(v2, v1);
    //console.log("vB...: ", vB);
    //console.log("****", vec3Mod(multiplyVec3BySca(cross3(vA,vB), 0.5)));
    return vec3Mod(cross3(vA, vB)) * 0.5;
}

export function normalOf(point_A, point_B, point_C) {
    const AB = differenceBetweenVectors3(point_A, point_B);
    const CB = differenceBetweenVectors3(point_C, point_B);
    return cross3(AB, CB);
}

//function traslateAroundCenterX (object, center, angle) //////////////////////////////////////////////////////////////esta

//En esta matriz, θ representa el ángulo de rotación, y u_x, u_y, u_z son las componentes normalizadas del vector de dirección.

export function angleOfVector(vector) {
    const vectorX = [1, 0, 0];
    const dotVX = dot3(vectorX, vector);
    const modV = vec3Mod(vector);
    if (modV == 0) {
        return 0;
    } else {
        const arc = dotVX / modV;
        return Math.acos(arc);
    }
}
/*
 function angleBetweenVectors(vectorA, vectorB) {
    const vectorANorm = normalize3(vectorA);
    const vectorBNorm = normalize3(vectorB);
    const dot=dot3(vectorANorm,vectorBNorm);
    const modA=vec3Mod(vectorANorm);
    const modB=vec3Mod(vectorBNorm);
    if (modA == 0 || modB == 0) {
        return 0;
    } else {
        const arc = dot/modA;
        return Math.acos(arc);
    }
 }
*/
export function angleBetweenVectors(vectorA, vectorB) {
    const vectorANorm = normalize3(vectorA);
    const vectorBNorm = normalize3(vectorB);
    const dot = dot3(vectorANorm, vectorBNorm);
    const modA = vec3Mod(vectorANorm);
    const modB = vec3Mod(vectorBNorm);
    if (modA == 0 || modB == 0) {
        return 0;
    } else {
        let angle = Math.acos(dot / (modA * modB));
        return angle;
    }
}

export function angleOfVectorWithZAxisOnXZPlane(vector) {
    if (vector[0] === 0 && vector[2] === 0) {
        // Si el vector es el vector nulo, el ángulo es indefinido.
        return 0;
    } else {
        // Calcular el ángulo en radianes.
        const angleRadians = Math.acos(vector[2] / Math.sqrt(vector[0] * vector[0] + vector[2] * vector[2]));
        if (vector[0] < 0) {
            return angleRadians;
        } else {
            return -angleRadians;
        }
        // Convertir el ángulo a grados si es necesario.
        //const angleDegrees = angleRadians * (180 / Math.PI);

    }
}

export function angleWithXZPlane(vector) {
    // Calcula la magnitud (longitud) del vector en el plano XY (proyección en XY)
    const magnitudeXY = Math.sqrt(vector[0] * vector[0] + vector[2] * vector[2]);

    // Usa la función atan2 para obtener el ángulo en radianes entre el vector y el plano XZ
    const angleRadians = Math.atan2(vector[1], magnitudeXY);

    // Convierte el ángulo de radianes a grados si lo deseas
    const angleDegrees = (angleRadians * 180) / Math.PI;

    return angleDegrees;
}

export function scalarArray(array, scalar) {
    for (let i = 0; i < array.length; i++) {
        array[i] = array[i] * scalar;
    }
}

export function scaleAnimation(sequence, scalar) {
    for (let i = 0; i < sequence.length; i++) {
        scalarArray(sequence[i].vertexArray, scalar);
    }
}