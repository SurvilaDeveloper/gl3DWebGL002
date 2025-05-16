export class VBO {
    constructor(gl, data, count) {
        this.gl = gl;
        this.data = data;
        this.count = count;
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.data, this.gl.STATIC_DRAW);
        this.size = this.data.length / this.count;
    }
    destroy() {
        this.gl.deleteBuffer(this.buffer);
    }
    bindToAttribute(attribute) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.enableVertexAttribArray(attribute);
        this.gl.vertexAttribPointer(attribute, this.size, this.gl.FLOAT, false, 0, 0);
    }
    updateData(newData) {  ///Falta revisar si funciona este método.
        if (newData.length !== this.data.length) {
            console.error("El nuevo conjunto de datos debe tener la misma longitud que los datos originales.");
            return;
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, newData);
        this.data = newData;
    }
}

export class IBO {
    constructor(gl, data) {
        this.gl = gl;
        this.data = data;
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.data, this.gl.STATIC_DRAW);
    }
    destroy() {
        this.gl.deleteBuffer(this.buffer);
    }
    bindBuffer() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    }
}

export class FBO {
    constructor(gl) {
        this.gl = gl;
        this.buffer = this.gl.createFramebuffer();
    }
    bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
    }
    unbind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
    destroy() {
        this.gl.deleteFramebuffer(this.buffer);
    }
}


export class bufferAndTextureShadow {
    constructor(gl) {
        this.gl = gl;
        this.fbo = new FBO(this.gl);
        this.buffer = this.fbo.framebuffer;
        this.fbo.bind();
        this.depthTexture = new DepthTexture(this.gl);
        this.texture = this.depthTexture.texture;
        this.depthTexture.bind();
        this.depthTexture.configure();
        this.depthTexture.loadImage();
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT,
            this.gl.TEXTURE_2D, this.texture, 0);
        if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
            console.error('Error: Incomplete framebuffer');
        }
        this.depthTexture.unbind();
        this.fbo.unbind();
    }
    destroy() {
        this.depthTexture.destroy();
        this.fbo.destroy();
    }
}