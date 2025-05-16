import { DiffuseObject } from "./objects";
import { Box } from "./creator";
import {
    ArbitraryAxisRotationMatrix,
    assignMat4,
    assignVec4,
    differenceBetweenVectors3,
    identityMat4x4,
    lookAt,
    multiplyMat4,
    multiplyMat4ByVec,
    perspective,
    rotateMat_y,
    sumVectors3
} from "./matrix";

export class Camera {
    constructor(gl, mainProgram, position, target, up, projectionType, guia) {
        this.guia = guia;
        this.gl = gl;
        this.mainProgram = mainProgram;
        this.boxGeometry = new Box(0.6, 1.7, 0.4);
        this.boxGeometry.originY = 'bottom';
        this.boxGeometry.create();
        this.box = new DiffuseObject('camBox', this.gl, this.mainProgram, this.boxGeometry.vertexArray, this.boxGeometry.normalArray, this.boxGeometry.indexArray);
        this.box.diffuseColor = new Float32Array([0, 1, 0]);
        this.box.createControls('box Controls ');
        this.box.positionMatrix[13] = 0;
        this.box.alpha = 1.0;
        this.position = position || new Float32Array([0, 0, 4]);
        this.target = target || new Float32Array([0, 0, 0]);
        this.up = up || new Float32Array([0, 1, 0]);
        this.transformedPosition = [...this.position];
        this.transformedTarget = [...this.target];
        this.transformedUp = [...this.up];
        this.lookAtTarget = [...this.transformedTarget];
        this.lookAtUp = [...this.transformedUp];
        this.zNear = 0.1;
        this.zFar = 1000;
        this.left = -4;
        this.right = 4;
        this.bottom = -2;
        this.top = 2;
        this.projectionType = projectionType;
        if (this.projectionType == 'perspective') {
            this.aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
            console.log("medidas", this.gl.canvas.clientWidth, " ; ", this.gl.canvas.clientHeight)
            this.fieldOfView = Math.PI / 4;
            this.projectionMatrix = new Float32Array(perspective(this.fieldOfView, this.aspect, this.zNear, this.zFar));
        } else if (this.projectionType == 'ortho') {
            this.projectionMatrix = new Float32Array(ortho(this.left, this.right, this.bottom, this.top, this.zNear, this.zFar));
        }
        this.viewMatrix = new Float32Array(lookAt(this.position, this.target, this.up));
        this.angleX = 0.0;
        this.angleY = 0.0;
        this.angleZ = 0.0;
        this.ownAxisXvector = new Float32Array([1, 0, 0]);
        this.ownAxisYvector = new Float32Array([0, 1, 0]);
        this.ownAxisZvector = new Float32Array([0, 0, 1]);
        this.ownAngleX = 0.0;
        this.ownAngleY = 0.0;
        this.ownAngleZ = 0.0;
        this.lookAtAngleX = 0.0;
        this.lookAtAngleY = 0.0;
        this.positionMatrix = new Float32Array(identityMat4x4);
        this.rotateMatrix = new Float32Array(identityMat4x4);
        this.orientMatrix = new Float32Array(identityMat4x4);
        this.modelMatrix = new Float32Array(identityMat4x4);
    }
    active() {
        this.applyTransformations();
        this.setViewVariables();
        //console.log(this.transformedPosition);
        this.viewMatrix.set(lookAt(this.transformedPosition, this.transformedTarget, this.transformedUp));//this.viewMatrix.set(lookAt(this.position, this.target, this.up));
        this.gl.uniform3fv(this.mainProgram.camPositionUniLoc, this.position);
        this.gl.uniformMatrix4fv(this.mainProgram.projectionMatUniLoc, false, this.projectionMatrix);
        this.gl.uniformMatrix4fv(this.mainProgram.viewMatrixUniLoc, false, this.viewMatrix);
    }

    applyTransformations() {
        assignMat4(this.modelMatrix, multiplyMat4(this.rotateMatrix, this.positionMatrix));
    }
    setViewVariables() {
        const position = [this.position[0], this.position[1], this.position[2]];
        const target = [...this.lookAtTarget];
        const up = [...this.lookAtUp];
        const position_target_Vector = differenceBetweenVectors3(target, position);
        position.push(1.0);
        position_target_Vector.push(1.0);
        assignVec4(position_target_Vector, multiplyMat4ByVec(this.modelMatrix, position_target_Vector));
        const targetResult = sumVectors3(position_target_Vector, position);
        up.push(1.0);
        assignVec4(up, multiplyMat4ByVec(this.modelMatrix, up));
        this.transformedPosition[0] = position[0] + this.modelMatrix[12];
        this.transformedPosition[1] = position[1] + this.modelMatrix[13];
        this.transformedPosition[2] = position[2] + this.modelMatrix[14];
        this.transformedTarget[0] = targetResult[0] + this.modelMatrix[12];
        this.transformedTarget[1] = targetResult[1] + this.modelMatrix[13];
        this.transformedTarget[2] = targetResult[2] + this.modelMatrix[14];
        this.transformedUp[0] = up[0];
        this.transformedUp[1] = up[1];
        this.transformedUp[2] = up[2];
        this.box.positionMatrix[12] = this.transformedPosition[0];
        this.box.positionMatrix[14] = this.transformedPosition[2];////////////////////////////////////////////////////////////////////////
    }
    lookAt(targetVector) {
        this.lookAtTarget[0] = targetVector[0];
        this.lookAtTarget[1] = targetVector[1];
        this.lookAtTarget[2] = targetVector[2];
    }
    rotateLookY(angleY) {
        this.lookAtAngleY -= angleY;
        const position = [...this.position];
        const target = [...this.target];
        const position_target_Vector = differenceBetweenVectors3(target, position);
        position.push(1.0);
        position_target_Vector.push(1.0);
        const newTargetVector = multiplyMat4ByVec(ArbitraryAxisRotationMatrix([1, 0, 0], this.lookAtAngleY), position_target_Vector);
        const targetResult = sumVectors3(newTargetVector, position);
        this.lookAtTarget = [...targetResult];
        const up = [...this.up];
        up.push(1.0);
        const newUp = multiplyMat4ByVec(ArbitraryAxisRotationMatrix([1, 0, 0], this.lookAtAngleY), up);
        this.lookAtUp = [...newUp];
    }
    rotateY(angleY) {
        assignMat4(this.rotateMatrix, multiplyMat4(this.rotateMatrix, rotateMat_y(angleY)));
    }
    traslateZ(deltaZ) {
        this.positionMatrix[12] += deltaZ * this.rotateMatrix[8];
        this.positionMatrix[14] -= deltaZ * this.rotateMatrix[10];
    }
    traslateX(deltaX) {
        this.positionMatrix[12] -= deltaX * this.rotateMatrix[0];
        this.positionMatrix[14] += deltaX * this.rotateMatrix[2];
    }
}