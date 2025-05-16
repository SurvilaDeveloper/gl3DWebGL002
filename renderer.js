import { applyTransformations } from "./transformations";


export class SceneRender {
    constructor(frame, mainProgram, camera, lighting) {
        this.frame = frame;
        this.gl = this.frame.canvas.gl;
        this.mainProgram = mainProgram;
        this.camera = camera;
        this.lighting = lighting;

        this.pointLightsSet = this.lighting.pointLightsSet;
        this.pointLightsList = [];
        for (let i = 0; i < this.pointLightsSet.lights.length; i++) {
            this.pointLightsList.push(this.pointLightsSet.lights[i]);
        }
        this.viewportWidth = this.gl.canvas.width;
        this.viewportHeight = this.gl.canvas.height;
    }
    clear() {
        //this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
        this.frame.resizeCanvas(this.frame.width, this.frame.height);
        this.aspect = this.frame.aspect;
        //this.gl.viewport(0, 0, 600, 300);
        this.gl.clearColor(0.529, 0.807, 0.980, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.mainProgram.program);
    }
    draw(object) {
        applyTransformations(object);
        this.gl.uniform1i(this.mainProgram.isTexturedUniLoc, object.isTextured);
        if (object.isTextured) {
            object.texture.activate(object.texture.textureNumber);
            object.texture.bind();
            this.gl.uniform1i(this.mainProgram.imageUniLoc, object.texture.textureNumber);
            object.uvBuffer.bindToAttribute(this.mainProgram.uvAttLoc);
        }
        //this.gl.uniformMatrix4fv(this.pointLightsSet.viewDownUniLoc[0], false, this.pointLightsList[0].viewDownMatrix);/////////////////////////////////////////////
        this.gl.uniform3fv(this.mainProgram.camPositionUniLoc, this.camera.transformedPosition);

        this.gl.uniformMatrix4fv(this.mainProgram.projectionMatUniLoc, false, this.camera.projectionMatrix);
        this.gl.uniformMatrix4fv(this.mainProgram.viewMatrixUniLoc, false, this.camera.viewMatrix);

        //this.gl.uniformMatrix4fv(this.mainProgram.projectionMatUniLoc, false, this.lighting.directionalLight.projectionMatrix);
        //this.gl.uniformMatrix4fv(this.mainProgram.viewMatrixUniLoc, false, this.lighting.directionalLight.viewMatrix);

        this.gl.uniformMatrix4fv(this.mainProgram.rotateMatrixUniLoc, false, object.rotateMatrix);
        this.gl.uniformMatrix4fv(this.mainProgram.modelMatrixUniLoc, false, object.modelMatrix);
        this.gl.uniformMatrix4fv(this.mainProgram.projMapMatrixUniLoc, false, this.pointLightsList[0].projectionMatrix);
        this.gl.uniformMatrix4fv(this.mainProgram.orthoProjMatrixUniLoc, false, this.lighting.directionalLight.projectionMatrix)
        this.gl.uniform1f(this.mainProgram.aspectUniLoc, this.aspect);
        this.gl.uniform1i(this.mainProgram.numActivePointUniLoc, this.pointLightsList.length)
        this.gl.uniform1i(this.mainProgram.numActivePointFragUniLoc, this.pointLightsList.length)
        this.gl.uniform1i(this.mainProgram.isSunUniLoc, object.isSun);
        this.gl.uniform3fv(this.mainProgram.diffuseColorUniLoc, object.diffuseColor);
        this.gl.uniform1f(this.mainProgram.alphaUniLoc, object.alpha);
        this.gl.uniform1i(this.mainProgram.internalLightUniLoc, object.internalOmniLight);
        this.gl.uniform3fv(this.mainProgram.specularColorUniLoc, object.specularColor);
        this.gl.uniform1f(this.mainProgram.brightnessUniLoc, object.brightness);
        object.vertexBuffer.bindToAttribute(this.mainProgram.positionAttLoc);
        object.normalBuffer.bindToAttribute(this.mainProgram.normalAttLoc);
        object.indexBuffer.bindBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer.buffer);
        this.gl.drawElements(this.gl.TRIANGLES, object.indexArray.length, this.gl.UNSIGNED_SHORT, 0);

        if (object.isTextured) {
            object.texture.unbind();
        }
    }
}

export class DepthRender {
    constructor(frame, depthProgram, depthTextureNumber, lighting) {
        //this.cam = cam;
        this.frame = frame;
        this.gl = this.frame.canvas.gl;
        this.depthProgram = depthProgram;
        this.depthTextureNumber = depthTextureNumber;
        this.lighting = lighting;

        //this.ambientLight = this.lighting.ambientLight;
        this.directionalLight = this.lighting.directionalLight
        this.pointLightsSet = this.lighting.pointLightsSet;
        this.pointLightsList = [];
        for (let i = 0; i < this.pointLightsSet.lights.length; i++) {
            this.pointLightsList.push(this.pointLightsSet.lights[i]);
        }
        this.depthTexture = new DepthTexture(this.gl, 4, 1024, 1024);
        this.texture = this.depthTexture.texture;
        //console.log("TEXTURA3D", this.texture);
        this.frameBuffer = new FBO(this.gl);
        this.buffer = this.frameBuffer.buffer;
        //console.log(this.buffer);
        this.frameBuffer.bind();
        this.depthTexture.activate(this.depthTextureNumber); ////esto no va a ir acá
        this.depthTexture.bind();
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.texture, 0);
        if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
            console.log("status", this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER));
            console.error('Error: Incomplete framebuffer');
        }
        this.frameBuffer.unbind();
    }
    clear() {
        this.frame.resizeCanvas(1024, 1024);
        this.aspect = 1;//this.frame.aspect;
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
        this.gl.viewport(0, 0, this.depthTexture.width, this.depthTexture.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

        this.frameBuffer.unbind();
    }
    draw(object) {
        this.gl.useProgram(this.depthProgram.program);
        applyTransformations(object);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
        this.depthTexture.activate(this.depthTextureNumber); ////esto no va a ir acá
        this.depthTexture.bind();
        this.gl.uniformMatrix4fv(this.depthProgram.projectionMatUniLoc, false, this.lighting.directionalLight.projectionMatrix); //por ahora point light 0
        this.gl.uniformMatrix4fv(this.depthProgram.viewMatrixUniLoc, false, this.directionalLight.viewMatrix);    //por ahora point light 0, luego iterar
        this.gl.uniformMatrix4fv(this.depthProgram.modelMatrixUniLoc, false, object.modelMatrix);
        this.gl.uniform1f(this.depthProgram.aspectUniLoc, this.aspect);
        this.gl.uniform1i(this.depthProgram.isSunUniLoc, 1);
        object.vertexBuffer.bindToAttribute(this.depthProgram.positionAttLoc);
        object.indexBuffer.bindBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer.buffer);
        this.gl.drawElements(this.gl.TRIANGLES, object.indexArray.length, this.gl.UNSIGNED_SHORT, 0);
        this.depthTexture.unbind();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
    unbindBuffer() {
        this.frameBuffer.unbind();
    }
}

export class DepthRender6 {
    constructor(frame, depthProgram6, depthTextureNumber, width, height, pointLightsArray) {
        //this.cam = cam;
        this.frame = frame;
        this.gl = this.frame.canvas.gl;
        this.depthProgram = depthProgram6;
        this.program = this.depthProgram.program;
        this.depthTextureNumber = depthTextureNumber;
        this.width = width;
        this.height = height;
        this.pointLightsArray = pointLightsArray;
        this.depthTextureArray = [];
        this.textures = [];
        this.buffersArray = [];
        this.buffers = [];
        for (let i = 0; i < this.pointLightsArray.length; i++) {
            this.depthTextureArray.push(new DepthTexture(this.gl, this.depthTextureNumber + i, this.width * 3, this.height * 2)) //cambiar dimensiones luego, van a ser de 3 x 2
            this.textures.push(this.depthTextureArray[i].texture);
            this.buffersArray.push(new FBO(this.gl));
            this.buffers.push(this.buffersArray[i].buffer);
            this.buffersArray[i].bind();
            this.depthTextureArray[i].activate(this.depthTextureNumber + i);
            this.depthTextureArray[i].bind();
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.textures[i], 0);
            if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
                console.log("status", this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER));
                console.error('Error: Incomplete framebuffer');
            }
            this.buffersArray[i].unbind();
        }
    }
    clear() {
        for (let i = 0; i < this.pointLightsArray.length; i++) {
            //this.gl.viewport(0,0,1024,1024);
            this.frame.resizeCanvas(1024, 1024);
            this.aspect = this.frame.aspect;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffers[i]);
            //this.gl.viewport(0, 0, this.width * 3, this.height * 2);////////////////////
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
            this.buffersArray[i].unbind();
        }
    }
    draw(object) { // este dibuja en la textura
        // usar el programa de dibujo en textura
        this.gl.useProgram(this.depthProgram.program);
        // aplicar las transformaciones al objeto
        applyTransformations(object);
        //pasar matrices de modelo y de proyección, y relación de aspecto.
        this.gl.uniformMatrix4fv(this.depthProgram.modelMatrixUniLoc, false, object.modelMatrix)
        this.gl.uniformMatrix4fv(this.depthProgram.projectionMatUniLoc, false, this.pointLightsArray[0].projMapMatrix);//despues ver si se puede sacar de otro lado
        this.gl.uniform1f(this.depthProgram.aspectUniLoc, this.aspect);
        this.gl.uniform1i(this.depthProgram.isSunUniLoc, 0);
        //enlazar buffer de atributo de vértices.
        object.vertexBuffer.bindToAttribute(this.depthProgram.positionAttLoc);
        //enlazar buffer de índices.
        object.indexBuffer.bindBuffer();
        //
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer.buffer);

        for (let i = 0; i < this.pointLightsArray.length; i++) { //estoy iterando cada luz;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffers[i]);
            this.depthTextureArray[i].activate(this.depthTextureNumber + i);
            this.depthTextureArray[i].bind();
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.textures[i], 0);
            if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
                console.log("status", this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER));
                console.error('Error: Incomplete framebuffer');
            }

            this.gl.viewport(0, 0, this.width, this.height);//////////////////////////////////////
            this.gl.uniformMatrix4fv(this.depthProgram.viewMatrixUniLoc, false, this.pointLightsArray[i].viewDownMatrix);
            this.gl.drawElements(this.gl.TRIANGLES, object.indexArray.length, this.gl.UNSIGNED_SHORT, 0);

            this.gl.viewport(this.width, 0, this.width, this.height);
            this.gl.uniformMatrix4fv(this.depthProgram.viewMatrixUniLoc, false, this.pointLightsArray[i].viewUpMatrix);
            this.gl.drawElements(this.gl.TRIANGLES, object.indexArray.length, this.gl.UNSIGNED_SHORT, 0);

            this.gl.viewport(this.width * 2, 0, this.width, this.height);
            this.gl.uniformMatrix4fv(this.depthProgram.viewMatrixUniLoc, false, this.pointLightsArray[i].viewLeftMatrix);
            this.gl.drawElements(this.gl.TRIANGLES, object.indexArray.length, this.gl.UNSIGNED_SHORT, 0);


            this.gl.viewport(0, this.height, this.width, this.height);//////////////////////////////////////
            this.gl.uniformMatrix4fv(this.depthProgram.viewMatrixUniLoc, false, this.pointLightsArray[i].viewRightMatrix);
            this.gl.drawElements(this.gl.TRIANGLES, object.indexArray.length, this.gl.UNSIGNED_SHORT, 0);

            this.gl.viewport(this.width, this.height, this.width, this.height);
            this.gl.uniformMatrix4fv(this.depthProgram.viewMatrixUniLoc, false, this.pointLightsArray[i].viewFrontMatrix);
            this.gl.drawElements(this.gl.TRIANGLES, object.indexArray.length, this.gl.UNSIGNED_SHORT, 0);

            this.gl.viewport(this.width * 2, this.height, this.width, this.height);
            this.gl.uniformMatrix4fv(this.depthProgram.viewMatrixUniLoc, false, this.pointLightsArray[i].viewBackMatrix);
            this.gl.drawElements(this.gl.TRIANGLES, object.indexArray.length, this.gl.UNSIGNED_SHORT, 0);
        }
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
    unbindBuffer() {
        this.frameBuffer.unbind();
    }
}

export class RENDER {
    constructor(frame, mainProgram, depthProgram, camera, lighting, shadowTextureNumber, depthTextureNumber6, pointLightsArray) {
        this.frame = frame;
        this.gl = this.frame.canvas.gl;
        this.mainProgram = mainProgram;
        this.depthProgram = depthProgram;
        this.camera = camera;
        this.lighting = lighting;
        this.texN = shadowTextureNumber;
        this.dTexN = depthTextureNumber6;
        this.pointLightsArray = pointLightsArray;
        this.viewportWidth = this.gl.canvas.width;
        this.viewportHeight = this.gl.canvas.height;
        this.depthRender6 = new DepthRender6(this.frame, this.depthProgram, this.dTexN, 512, 512, this.pointLightsArray)
        this.depthRender = new DepthRender(this.frame, this.depthProgram, this.texN, this.lighting);
        this.sceneRender = new SceneRender(this.frame, this.mainProgram, this.camera, this.lighting);
        this.sTex = this.depthRender6.textures[0];
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        this.vs = `attribute vec2 a_position;
        //uniform float u_aspect;
        varying vec2 v_texCoord;
        //varying float v_aspect;
        void main() {
            v_texCoord = (a_position + 1.0) * 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }`;
        this.fs = `precision mediump float;
        uniform sampler2D u_texture;
        varying vec2 v_texCoord;
        //varying float v_aspect;
        float grid;
        void main() {
            if ((v_texCoord.x < 0.334 && v_texCoord.x > 0.333) || (v_texCoord.x < 0.667 && v_texCoord.x > 0.666) || (v_texCoord.y < 0.501 && v_texCoord.y > 0.4999)) {
                grid = 0.0;
            } else {
                grid = 1.0;
            }
            gl_FragColor = vec4(  vec3(  (texture2D(u_texture, v_texCoord).r-0.9375)*16.0)*grid , 1.0  );
        }`;
        this.depthViewProgram = new DepthProgram(this.gl, this.vs, this.fs);
        this.program = this.depthViewProgram.program;
        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.textureUniformLocation = this.gl.getUniformLocation(this.program, "u_texture");
        ///////////////////////////////////////////////////////////////////////////////////////////////////
        this.vsSun = `attribute vec2 a_position;
        //uniform float u_aspect;
        varying vec2 v_texCoord;
        //varying float v_aspect;
        void main() {
            v_texCoord = (a_position + 1.0) * 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }`;
        this.fsSun = `precision mediump float;
        uniform sampler2D u_texture;
        varying vec2 v_texCoord;
        //varying float v_aspect;
        float grid;
        void main() {

            gl_FragColor = vec4(  vec3(  (texture2D(u_texture, v_texCoord).r-0.9375)*16.0), 1.0  );
        }`;
        this.depthSunViewProgram = new DepthProgram(this.gl, this.vsSun, this.fsSun);
        this.sunProgram = this.depthSunViewProgram.program;
        this.sunPositionAttributeLocation = this.gl.getAttribLocation(this.sunProgram, "a_position");
        this.sunTextureUniformLocation = this.gl.getUniformLocation(this.sunProgram, "u_texture");
        //this.aspectUniLoc = this.gl.getUniformLocation(this.program, "u_aspect");
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.positions = [-1, -1, 1, -1, -1, 1, 1, 1];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.STATIC_DRAW);

    }
    drawDepthTexturePointLight(pointLightNumber) { //dibuja el plano y le aplica la textura, para visualizar
        this.frame.resizeCanvas(900, 600);
        this.aspect = this.frame.aspect;
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthRender6.textures[pointLightNumber]);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.uniform1i(this.textureUniformLocation, 0);
        //this.gl.uniform1f(this.aspectUniLoc, this.aspect);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    drawDepthTextureDirectional() { //dibuja el plano y le aplica la textura, para visualizar
        this.frame.resizeCanvas(1024, 1024);
        this.aspect = this.frame.aspect;
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.sunProgram);
        this.gl.activeTexture(this.gl.TEXTURE4);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthRender.texture);
        this.gl.enableVertexAttribArray(this.sunPositionAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.sunPositionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.uniform1i(this.sunTextureUniformLocation, 4);
        //this.gl.uniform1f(this.aspectUniLoc, this.aspect);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    clearDepthBuffer6() {
        this.depthRender6.clear();
    }
    depthDraw6(object) {
        this.depthRender6.draw(object);
    }

    clearAndBindDepthBuffer() {
        this.depthRender.clear();
    }
    depthDraw(object) {
        this.depthRender.draw(object);
    }
    unbindDepthBuffer() {
        this.depthRender.unbindBuffer();
    }
    clearViewport() {
        this.sceneRender.clear();
    }
    draw(object) {
        this.gl.uniform1f(this.mainProgram.shadowTexWidthUniLoc, this.depthRender6.width);
        this.gl.uniform1f(this.mainProgram.shadowTexHeightUniLoc, this.depthRender6.height);
        this.gl.uniform1f(this.mainProgram.biasUniLoc, this.lighting.bias);
        this.texture = object.texture;
        this.gl.activeTexture(this.gl.TEXTURE7);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthRender6.textures[0]);
        this.gl.activeTexture(this.gl.TEXTURE8);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthRender6.textures[1]);
        this.gl.activeTexture(this.gl.TEXTURE9);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthRender6.textures[2]);
        this.gl.activeTexture(this.gl.TEXTURE10);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthRender6.textures[3]);

        this.gl.uniform1i(this.mainProgram.shadowMapUniLoc0, 7);
        this.gl.uniform1i(this.mainProgram.shadowMapUniLoc1, 8);
        this.gl.uniform1i(this.mainProgram.shadowMapUniLoc2, 9);
        this.gl.uniform1i(this.mainProgram.shadowMapUniLoc3, 10);

        this.gl.activeTexture(this.gl.TEXTURE4);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthRender.texture);
        this.gl.uniform1i(this.mainProgram.sunShadowMapUniLoc, 4);


        this.sceneRender.draw(object);
    }

}
