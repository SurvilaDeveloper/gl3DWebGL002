class Program {
    constructor(gl, vertexShader, fragmentShader) {
        this.program = gl.createProgram();
        
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        const success = gl.getProgramParameter(this.program, gl.LINK_STATUS);
        if (!success) {
            console.error(gl.getProgramInfoLog(this.program));
            gl.deleteProgram(this.program);
        }
        this.positionAttLoc = gl.getAttribLocation(this.program, 'a_position');//
        this.normalAttLoc = gl.getAttribLocation(this.program, 'a_normal');//
        this.uvAttLoc = gl.getAttribLocation(this.program, 'a_uv');
        this.projectionMatUniLoc = gl.getUniformLocation(this.program, 'u_projectionMatrix');//
        this.viewMatrixUniLoc = gl.getUniformLocation(this.program, 'u_viewMatrix');//
        this.rotateMatrixUniLoc = gl.getUniformLocation(this.program, 'u_rotateMatrix');//
        this.modelMatrixUniLoc = gl.getUniformLocation(this.program, 'u_modelMatrix');//
        this.shadowTexUniLoc = gl.getUniformLocation(this.program, 'u_shadowTex');
        this.shadowTexWidthUniLoc = gl.getUniformLocation(this.program, 'u_shadowTextureWidth');
        this.shadowTexHeightUniLoc = gl.getUniformLocation(this.program, 'u_shadowTextureHeight');
        this.biasUniLoc = gl.getUniformLocation(this.program, 'u_bias');

        this.lightDirectionUniLoc = gl.getUniformLocation(this.program, 'u_lightDirection');//
        this.directionalColorUniLoc = gl.getUniformLocation(this.program, 'u_directionalColor');//

        this.ambientColorUniLoc = gl.getUniformLocation(this.program, 'u_ambientColor');//

        this.generalIntesityUniLoc = gl.getUniformLocation(this.program, 'u_generalIntensity');
        this.diffuseColorUniLoc = gl.getUniformLocation(this.program, 'u_diffuseColor');//
        this.alphaUniLoc = gl.getUniformLocation(this.program, "u_alpha");
        this.isTexturedUniLoc = gl.getUniformLocation(this.program, "u_textured");
        this.imageUniLoc = gl.getUniformLocation(this.program, 'u_image');
        this.shadowMapUniLoc = gl.getUniformLocation(this.program, 'u_shadowMap');

        this.specularColorUniLoc = gl.getUniformLocation(this.program, 'u_specularColor');//
        this.brightnessUniLoc = gl.getUniformLocation(this.program, 'u_brightness');//

        this.numPointLightsUniLoc = gl.getUniformLocation(this.program, 'numPointLights');

        this.camPositionUniLoc = gl.getUniformLocation(this.program, 'u_camPosition');

    }
}

class DrawerProgram {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;
        this.program = gl.createProgram();
        this.vertexShader = new Shader(this.gl, this.gl.VERTEX_SHADER, vertexShader);
        this.fragmentShader = new Shader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShader);
        gl.attachShader(this.program, this.vertexShader.shader);
        gl.attachShader(this.program, this.fragmentShader.shader);
        gl.linkProgram(this.program);
        const success = gl.getProgramParameter(this.program, gl.LINK_STATUS);
        if (!success) {
            console.error(gl.getProgramInfoLog(this.program));
            gl.deleteProgram(this.program);
        }
        this.positionAttLoc = gl.getAttribLocation(this.program, 'a_position');//
        this.normalAttLoc = gl.getAttribLocation(this.program, 'a_normal');//
        this.uvAttLoc = gl.getAttribLocation(this.program, 'a_uv');
        this.projectionMatUniLoc = gl.getUniformLocation(this.program, 'u_projectionMatrix');//
        this.viewMatrixUniLoc = gl.getUniformLocation(this.program, 'u_viewMatrix');//
        this.rotateMatrixUniLoc = gl.getUniformLocation(this.program, 'u_rotateMatrix');//
        this.modelMatrixUniLoc = gl.getUniformLocation(this.program, 'u_modelMatrix');//
        this.projMapMatrixUniLoc = gl.getUniformLocation(this.program, 'u_projMapMatrix');

        this.aspectUniLoc = gl.getUniformLocation(this.program, 'u_aspect');
        this.shadowTexUniLoc = gl.getUniformLocation(this.program, 'u_shadowTex');
        this.shadowTexWidthUniLoc = gl.getUniformLocation(this.program, 'u_shadowTextureWidth');
        this.shadowTexHeightUniLoc = gl.getUniformLocation(this.program, 'u_shadowTextureHeight');
        this.biasUniLoc = gl.getUniformLocation(this.program, 'u_bias');
        this.isSunUniLoc = gl.getUniformLocation(this.program, 'u_isSun');
        this.lightDirectionUniLoc = gl.getUniformLocation(this.program, 'u_lightDirection');//
        this.directionalColorUniLoc = gl.getUniformLocation(this.program, 'u_directionalColor');//
        this.orthoProjMatrixUniLoc = gl.getUniformLocation(this.program, 'u_orthoProjMapMatrix');
        this.sunViewMatrixUniLoc = gl.getUniformLocation(this.program, 'u_sunViewMatrix');
        this.ambientColorUniLoc = gl.getUniformLocation(this.program, 'u_ambientColor');//
        this.generalIntesityUniLoc = gl.getUniformLocation(this.program, 'u_generalIntensity');
        this.diffuseColorUniLoc = gl.getUniformLocation(this.program, 'u_diffuseColor');//
        this.alphaUniLoc = gl.getUniformLocation(this.program, "u_alpha");
        this.internalLightUniLoc = gl.getUniformLocation(this.program, 'u_internalLight');
        this.isTexturedUniLoc = gl.getUniformLocation(this.program, "u_textured");
        this.imageUniLoc = gl.getUniformLocation(this.program, 'u_image');
        this.shadowMapUniLoc0 = gl.getUniformLocation(this.program, 'u_shadowPointMap0');
        this.shadowMapUniLoc1 = gl.getUniformLocation(this.program, 'u_shadowPointMap1');
        this.shadowMapUniLoc2 = gl.getUniformLocation(this.program, 'u_shadowPointMap2');
        this.shadowMapUniLoc3 = gl.getUniformLocation(this.program, 'u_shadowPointMap3');
        this.sunShadowMapUniLoc = gl.getUniformLocation(this.program, 'u_shadowSun');
        this.specularColorUniLoc = gl.getUniformLocation(this.program, 'u_specularColor');//
        this.brightnessUniLoc = gl.getUniformLocation(this.program, 'u_brightness');//
        this.numActivePointUniLoc = gl.getUniformLocation(this.program, 'u_numActivePoint')
        this.numActivePointFragUniLoc = gl.getUniformLocation(this.program, 'u_numActivePointFrag')
        
        this.numPointLightsUniLoc = gl.getUniformLocation(this.program, 'numPointLights');
        this.camPositionUniLoc = gl.getUniformLocation(this.program, 'u_camPosition');
    }
}

class ShadowProgram {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;
        this.program = gl.createProgram();
        this.vertexShader = new Shader(this.gl, this.gl.VERTEX_SHADER, vertexShader);
        this.fragmentShader = new Shader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShader);
        gl.attachShader(this.program, this.vertexShader.shader);
        gl.attachShader(this.program, this.fragmentShader.shader);
        gl.linkProgram(this.program);
        const success = gl.getProgramParameter(this.program, gl.LINK_STATUS);
        if (!success) {
            console.error(gl.getProgramInfoLog(this.program));
            gl.deleteProgram(this.program);
        }
        this.positionAttLoc = gl.getAttribLocation(this.program, 'a_position');//////////////

        this.projectionMatUniLoc = gl.getUniformLocation(this.program, 'u_projectionMatrix');//////////////////
        this.viewMatrixUniLoc = gl.getUniformLocation(this.program, 'u_viewMatrix');//////////////////

        this.modelMatrixUniLoc = gl.getUniformLocation(this.program, 'u_modelMatrix');/////////////////
        this.aspectUniLoc = gl.getUniformLocation(this.program, "u_aspectRatio");

        this.isSunUniLoc = gl.getUniformLocation(this.program, 'u_isSun');
    }
}

class DepthProgram {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;
        this.program = gl.createProgram();
        this.vertexShader = new Shader(this.gl, this.gl.VERTEX_SHADER, vertexShader);
        this.fragmentShader = new Shader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShader);
        gl.attachShader(this.program, this.vertexShader.shader);
        gl.attachShader(this.program, this.fragmentShader.shader);
        gl.linkProgram(this.program);
        const success = gl.getProgramParameter(this.program, gl.LINK_STATUS);
        if (!success) {
            console.error(gl.getProgramInfoLog(this.program));
            gl.deleteProgram(this.program);
        }
    }
}