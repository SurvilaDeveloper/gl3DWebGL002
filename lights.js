import { DiffuseObject } from "./objects.js";
import { Octaedro } from "./creator.js";
import { LightingControls, AmbientLightControls, DirectionalLightControls, PointLightControls } from "./controls.js";
import { assignMat4, assignVec3, lookAt, multiplyVec3BySca, normalize3, ortho, perspective } from "./matrix.js";

export class AmbientLight {
    constructor(gl, program, color, intensity) {
        this.gl = gl;
        this.program = program;
        if (color) {
            this.color = new Float32Array(color);
        } else {
            this.color = new Float32Array([1.0, 1.0, 1.0]);
        }
        this.intensity = intensity || 0.5;
        this.finalColor = multiplyVec3BySca(this.color, this.intensity);
        this.state = 1;
    }
    active(generalIntensity) {
        if (!this.state) {
            this.gl.uniform3fv(this.program.ambientColorUniLoc, [0.0, 0.0, 0.0]);
            //this.gl.uniform1f(this.program.ambientIntensityUniLoc, 0.0);
        } else {
            assignVec3(this.finalColor, multiplyVec3BySca(this.color, this.intensity));
            assignVec3(this.finalColor, multiplyVec3BySca(this.finalColor, generalIntensity));
            //console.log(this.finalColor);
            this.gl.uniform3fv(this.program.ambientColorUniLoc, this.finalColor);
            //this.gl.uniform1f(this.program.ambientIntensityUniLoc, this.intensity);
        }
    }
    createControls() {
        this.controls = new AmbientLightControls(this);
        this.controls.create();
    }
}



export class DirectionalLight {
    constructor(gl, program, direction, color, intensity, sunPosition) {
        this.gl = gl;
        this.program = program;
        if (direction) {
            this.noNormalizedDirection = direction;
        } else {
            this.noNormalizedDirection = new Float32Array([0.5, -1.0, -1.0]);
        }
        this.direction = normalize3(this.noNormalizedDirection);
        if (color) {
            this.color = color;
        } else {
            this.color = new Float32Array([1.0, 1.0, 1.0]);
        }
        this.intensity = intensity || 0.5;
        this.sunPosition = sunPosition || undefined;
        this.defaultFar = 100;
        if (this.sunPosition != undefined) {
            this.viewMatrix = new Float32Array(lookAt(this.sunPosition, [0, 0, 0], [0, 1, 0]));
        } else {
            this.viewMatrix = new Float32Array(lookAt([-this.direction[0] * this.defaultFar, -this.direction[1] * this.defaultFar, -this.direction[2] * this.defaultFar], [0, 0, 0], [0, 1, 0]));
        }

        this.finalColor = multiplyVec3BySca(this.color, this.intensity);
        this.state = 1;
        this.left = -10;
        this.right = 10;
        this.bottom = -10;
        this.top = 10;
        this.zNear = 0.1;
        this.zfar = 1000;
        this.projectionMatrix = ortho(this.left, this.right, this.bottom, this.top, this.zNear, this.zfar);
    }
    active(generalIntensity) {
        this.updateViewMatrix();
        if (!this.state) {
            this.gl.uniform3fv(this.program.lightDirectionUniLoc, this.direction);
            this.gl.uniform3fv(this.program.directionalColorUniLoc, [0.0, 0.0, 0.0]);
            //this.gl.uniform1f(this.program.directionalIntensityUniLoc, 0.0);
        } else {
            assignVec3(this.finalColor, multiplyVec3BySca(this.color, this.intensity));
            assignVec3(this.finalColor, multiplyVec3BySca(this.finalColor, generalIntensity));
            this.gl.uniform3fv(this.program.lightDirectionUniLoc, this.direction);
            this.gl.uniform3fv(this.program.directionalColorUniLoc, this.finalColor);
            this.gl.uniformMatrix4fv(this.program.sunViewMatrixUniLoc, false, this.viewMatrix);
            //this.gl.uniform1f(this.program.directionalIntensityUniLoc, this.intensity);
        }
    }
    updateViewMatrix() {
        if (this.sunPosition != undefined) {
            assignVec3(this.direction, normalize3(multiplyVec3BySca(this.sunPosition, -1)));
            this.viewMatrix.set(lookAt(this.sunPosition, [0, 0, 0], [0, 1, 0]));
        }
    }
    createControls() {
        this.controls = new DirectionalLightControls(this);
        this.controls.create();
    }
}

export class PointLight {
    constructor(gl, mainProgram, lampName = 'NONE', position, color, intensity, scope) {
        this.gl = gl;
        this.mainProgram = mainProgram;
        this.lampName = lampName;
        if (position) {
            this.position = position;
        } else {
            this.position = new Float32Array([0.0, 0.0, 0.0]);
        }
        if (color) {
            this.color = color;
        } else {
            this.color = new Float32Array([1.0, 1.0, 1.0]);
        }
        this.intensity = intensity || 0.25;
        this.finalColor = multiplyVec3BySca(this.color, this.intensity);
        this.scope = scope || 10.0;
        this.state = 1;
        this.aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        this.fieldOfView = (Math.PI / 4) * 1.181;
        this.zNear = 0.1;
        this.zFar = 1000;
        this.projectionMatrix = new Float32Array(perspective(this.fieldOfView, this.aspect, this.zNear, this.zFar));///////////////

        this.fieldOfViewMap6 = Math.PI / 4;
        this.projMapMatrix = new Float32Array(perspective(this.fieldOfViewMap6, this.aspect, this.zNear, this.zFar));

        this.targetDown = new Float32Array([this.position[0], this.position[1] - 1.0, this.position[2]]);
        this.targetUp = new Float32Array([this.position[0], this.position[1] + 1.0, this.position[2]]);
        this.targetLeft = new Float32Array([this.position[0] - 1.0, this.position[1], this.position[2]]);
        this.targetRight = new Float32Array([this.position[0] + 1.0, this.position[1], 1.0, this.position[2]]);
        this.targetFront = new Float32Array([this.position[0], this.position[1], this.position[2] - 1.0]);
        this.targetBack = new Float32Array([this.position[0], this.position[1], this.position[2] + 1.0]);

        this.down_up = new Float32Array([0, 0, -1]);
        this.up_up = new Float32Array([0, 0, -1]);
        this.left_up = new Float32Array([0, 1, 0]);
        this.right_up = new Float32Array([0, 1, 0]);
        this.front_up = new Float32Array([0, 1, 0]);
        this.back_up = new Float32Array([0, 1, 0]);

        this.viewDownMatrix = new Float32Array(lookAt(this.position, this.targetDown, this.down_up));
        this.viewUpMatrix = new Float32Array(lookAt(this.position, this.targetUp, this.up_up));
        this.viewLeftMatrix = new Float32Array(lookAt(this.position, this.targetLeft, this.left_up));
        this.viewRightMatrix = new Float32Array(lookAt(this.position, this.targetRight, this.right_up));
        this.viewFrontMatrix = new Float32Array(lookAt(this.position, this.targetFront, this.front_up));
        this.viewBackMatrix = new Float32Array(lookAt(this.position, this.targetBack, this.back_up));
        this.viewMatrix = new Float32Array(16); // ...
        assignMat4(this.viewMatrix, this.viewDownMatrix);
        this.body = undefined;
        if (this.lampName != 'NONE') {
            this.octaedro = new Octaedro(0.1, 0.1, 0.1, 0.1, 0.1, 0.1);
            this.octaedro.create();
            this.body = new DiffuseObject(this.lampName, this.gl, this.mainProgram, this.octaedro.vertexArray, this.octaedro.normalArray, this.octaedro.indexArray);
            this.body.positionMatrix[12] = this.position[0];
            this.body.positionMatrix[13] = this.position[1];
            this.body.positionMatrix[14] = this.position[2];
        }

    }
    setViews() {
        assignVec3(this.targetDown, [this.position[0], this.position[1] - 1, this.position[2]]);
        assignVec3(this.targetUp, [this.position[0], this.position[1] + 1, this.position[2]]);
        assignVec3(this.targetLeft, [this.position[0] - 1, this.position[1], this.position[2]]);
        assignVec3(this.targetRight, [this.position[0] + 1, this.position[1], this.position[2]]);
        assignVec3(this.targetFront, [this.position[0], this.position[1], this.position[2] - 1]);
        assignVec3(this.targetBack, [this.position[0], this.position[1], this.position[2] + 1]);

        assignMat4(this.viewDownMatrix, lookAt(this.position, this.targetDown, this.down_up));
        assignMat4(this.viewUpMatrix, lookAt(this.position, this.targetUp, this.up_up));
        assignMat4(this.viewLeftMatrix, lookAt(this.position, this.targetLeft, this.left_up));
        assignMat4(this.viewRightMatrix, lookAt(this.position, this.targetRight, this.right_up));
        assignMat4(this.viewFrontMatrix, lookAt(this.position, this.targetFront, this.front_up));
        assignMat4(this.viewBackMatrix, lookAt(this.position, this.targetBack, this.back_up));

        assignMat4(this.viewMatrix, this.viewDownMatrix);
    }
    insertBody(body, invertNormals = true) {
        this.body = body;
        if (invertNormals) {
            this.body.normalArray.set(oppositeNormalsArray(this.body.normalArray))
            this.body.normalBuffer.updateData(this.body.normalArray);
        }
        this.body.positionMatrix[12] = this.position[0];
        this.body.positionMatrix[13] = this.position[1];
        this.body.positionMatrix[14] = this.position[2];
    }



    createControl(indexPoint) {
        this.controls = new PointLightControls(this);
        this.controls.create(indexPoint);
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////
export class PointLightsSet {
    constructor(gl, program) {
        this.gl = gl;
        this.program = program;
        this.lights = [];
        this.positionUniLoc = [];
        this.colorUniLoc = [];
        this.scopeUniLoc = [];
        this.stateUniLoc = [];
        this.viewDownUniLoc = [];
        this.viewUpUniLoc = [];
        this.viewLeftUniLoc = [];
        this.viewRightUniLoc = [];
        this.viewForwardUniLoc = [];
        this.viewBackUniLoc = [];
    }
    includeLight(l) {
        this.lights.push(l);
        var i = this.lights.length - 1;
        this.positionUniLoc.push(this.gl.getUniformLocation(this.program.program, `pointLights[${i}].pointPosition`));
        this.colorUniLoc.push(this.gl.getUniformLocation(this.program.program, `pointLights[${i}].pointColor`));
        //this.intensityUniLoc.push(this.gl.getUniformLocation(this.program.program, `pointLights[${i}].pointIntensity`));
        this.scopeUniLoc.push(this.gl.getUniformLocation(this.program.program, `pointLights[${i}].pointScope`));
        this.stateUniLoc.push(this.gl.getUniformLocation(this.program.program, `pointLights[${i}].pointState`));

        this.viewDownUniLoc.push(this.gl.getUniformLocation(this.program.program, `viewPointLights[${i}].viewDown`));
        this.viewUpUniLoc.push(this.gl.getUniformLocation(this.program.program, `viewPointLights[${i}].viewUp`));
        this.viewLeftUniLoc.push(this.gl.getUniformLocation(this.program.program, `viewPointLights[${i}].viewLeft`));
        this.viewRightUniLoc.push(this.gl.getUniformLocation(this.program.program, `viewPointLights[${i}].viewRight`));
        this.viewForwardUniLoc.push(this.gl.getUniformLocation(this.program.program, `viewPointLights[${i}].viewForward`));
        this.viewBackUniLoc.push(this.gl.getUniformLocation(this.program.program, `viewPointLights[${i}].viewBack`));
        //console.log("this.lights",this.lights);
    }
    active(generalIntensity) {
        this.gl.uniform1i(this.program.numPointLightsUniLoc, this.lights.length);

        for (let i = 0; i < this.lights.length; i++) {
            if (this.lights[i].body != undefined) {
                this.lights[i].body.internalOmniLight = i;
                this.lights[i].body.positionMatrix[12] = this.lights[i].position[0];
                this.lights[i].body.positionMatrix[13] = this.lights[i].position[1];
                this.lights[i].body.positionMatrix[14] = this.lights[i].position[2];
                this.lights[i].body.diffuseColor[0] = this.lights[i].color[0] * 8;
                this.lights[i].body.diffuseColor[1] = this.lights[i].color[1] * 8;
                this.lights[i].body.diffuseColor[2] = this.lights[i].color[2] * 8;
            }

            this.lights[i].setViews();
            this.gl.uniform3fv(this.positionUniLoc[i], this.lights[i].position);
            this.lights[i].finalColor = multiplyVec3BySca(this.lights[i].color, this.lights[i].intensity);
            this.lights[i].finalColor = multiplyVec3BySca(this.lights[i].finalColor, generalIntensity);
            //console.log(this.lights[i].finalColor);
            this.gl.uniform3fv(this.colorUniLoc[i], this.lights[i].finalColor);
            this.gl.uniform1f(this.scopeUniLoc[i], this.lights[i].scope);
            this.gl.uniform1i(this.stateUniLoc[i], this.lights[i].state);
            //this.gl.uniformMatrix4fv(this.viewDownUniLoc[0] , false, this.lights[0].viewDownMatrix);
            this.gl.uniformMatrix4fv(this.viewDownUniLoc[i], false, this.lights[i].viewDownMatrix);
            this.gl.uniformMatrix4fv(this.viewUpUniLoc[i], false, this.lights[i].viewUpMatrix);
            this.gl.uniformMatrix4fv(this.viewLeftUniLoc[i], false, this.lights[i].viewLeftMatrix);
            this.gl.uniformMatrix4fv(this.viewRightUniLoc[i], false, this.lights[i].viewRightMatrix);
            this.gl.uniformMatrix4fv(this.viewForwardUniLoc[i], false, this.lights[i].viewFrontMatrix);
            this.gl.uniformMatrix4fv(this.viewBackUniLoc[i], false, this.lights[i].viewBackMatrix);
        }
    }
    createControls() {
        //const self = this;
        for (let i = 0; i < this.lights.length; i++) {
            //console.log("this.lights[",i,"]:  ",this.lights[i]);
            this.lights[i].createControl(i);
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////
export class Lighting {
    constructor(gl, program, sun) {
        this.gl = gl;
        this.program = program;
        this.sun = sun || undefined;
        if (this.sun != undefined) {
            this.directionalLight = new DirectionalLight(this.gl, this.program, this.sun.direction, new Float32Array([1, 1, 1]), 0.7, this.sun.position);
        } else {
            this.directionalLight = new DirectionalLight(this.gl, this.program);
        }
        this.ambientLight = new AmbientLight(this.gl, this.program);
        this.pointLightsSet = new PointLightsSet(this.gl, this.program);
        this.intensity = 0.7;
        this.bias = 0.001;
    }
    active() {
        //this.gl.uniform1f(this.program.generalIntesityUniLoc, this.intensity);
        this.ambientLight.active(this.intensity);
        this.directionalLight.active(this.intensity);
        this.pointLightsSet.active(this.intensity);
    }
    activeDirectional() {
        this.directionalLight.updateViewMatrix();
    }
    createControls() {
        this.controls = new LightingControls(this);
        this.controls.create();
    }

}