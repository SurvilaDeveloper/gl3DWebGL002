import { assignMat4, assignVec4, multiplyMat4, multiplyMat4ByVec } from "./matrix";

export function len(eye, target) {
    let deltax = math.abs(eye[0] - target[0]);
    let deltay = math.abs(eye[1] - target[1]);
    let deltaz = math.abs(eye[2] - target[2]);
    return Math.sqrt(deltax * deltax + deltay * deltay + deltaz * deltaz) / eye[2];
}

export function applyTransformations(object) {
    const o = object;
    assignMat4(o.modelMatrix, multiplyMat4(multiplyMat4(o.scalarMatrix, o.rotateMatrix,), o.positionMatrix));
}

export function transformVertexArray(array, matrix) {
    const arrayResult = [];
    const vertex = [0, 0, 0, 0];
    for (let i = 0; i < array.length; i += 3) {
        vertex[0] = array[i];
        vertex[1] = array[i + 1];
        vertex[2] = array[i + 2];
        vertex[3] = 1.0;
        assignVec4(vertex, multiplyMat4ByVec(matrix, vertex));
        vertex[0] += matrix[12];
        vertex[1] = matrix[13] - vertex[1];
        vertex[2] += matrix[14];
        arrayResult.push(vertex[0]);
        arrayResult.push(vertex[1]);
        arrayResult.push(vertex[2]);
    }
    return arrayResult;
}