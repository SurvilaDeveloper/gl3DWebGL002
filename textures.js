export class Texture {
    constructor(gl, textureNumber, width, height) {
        this.gl = gl;
        this.textureNumber = textureNumber;
        this.width = width;
        this.height = height;
        if (!this.gl) {
            console.error("Error: El contexto WebGL no está definido.");
            return;
        }
        if (typeof this.textureNumber !== 'number') {
            console.error("Error: textureNumber debe ser un número válido.");
            return;
        }

        this.texture = this.gl.createTexture();
        if (!this.texture) {
            console.error("Error: No se pudo crear la textura.");
            return;
        }

        this.activate(this.textureNumber);
        this.bind();
        this.configure();
        this.loadImage();
        this.unbind();
    }
    bind() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }
    activate(textureNumber) {
        this.gl.activeTexture(this.gl.TEXTURE0 + textureNumber);
    }
    configure() {
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    }
    loadImage() {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    }
    unbind() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
}

export class ColorTexture {
    constructor(gl, textureNumber, imageGL) {
        this.gl = gl;
        this.textureNumber = textureNumber;
        this.imageGL = imageGL;
        this.width = this.imageGL.width;
        this.height = this.imageGL.height;
        if (!this.gl) {
            console.error("Error: El contexto WebGL no está definido.");
            return;
        }
        if (typeof this.textureNumber !== 'number') {
            console.error("Error: textureNumber debe ser un número válido.");
            return;
        }

        this.texture = this.gl.createTexture();
        if (!this.texture) {
            console.error("Error: No se pudo crear la textura.");
            return;
        }
        if (!this.imageGL || !(this.imageGL instanceof Image)) {
            console.error("Error: Se requiere una imagen válida como fuente de textura.");
            return;
        }
        this.activate(this.textureNumber);
        this.bind();
        this.configure();
        this.loadImage();
        this.unbind();
    }
    bind() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }
    activate(textureNumber) {
        this.gl.activeTexture(this.gl.TEXTURE0 + textureNumber);
    }
    configure() {
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    }
    loadImage() {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.imageGL);
    }
    unbind() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
}

export class DepthTexture {
    constructor(gl, textureNumber, width, height) {
        this.gl = gl;
        this.textureNumber = textureNumber;
        this.width = width || 1024;
        this.height = height || 1024;
        if (!this.gl) {
            console.error("Error: El contexto WebGL no está definido.");
            return;
        }
        if (typeof this.textureNumber !== 'number') {
            console.error("Error: textureNumber debe ser un número válido.");
            return;
        }

        this.texture = this.gl.createTexture();
        if (!this.texture) {
            console.error("Error: No se pudo crear la textura.");
            return;
        }
        this.activate(this.textureNumber);
        this.bind();
        this.configure();
        this.load();
        this.unbind();
    }
    bind() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }
    activate(textureNumber) {
        this.gl.activeTexture(this.gl.TEXTURE0 + textureNumber);
    }
    configure() {
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    }
    load() {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT, this.width, this.height,
            0, this.gl.DEPTH_COMPONENT, this.gl.UNSIGNED_SHORT, null);
    }
    unbind() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
}