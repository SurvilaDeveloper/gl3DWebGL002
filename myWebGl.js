class Frame {
    constructor(frame_id, container_tag, html_position, canvas_id, width, height) {
        this.frameId = frame_id;
        this.containerTag = container_tag;
        this.htmlPos = html_position;
        this.canvasId = canvas_id;
        this.width = width;
        this.height = height;
        this.container = document.getElementById(this.containerTag);
        this.container.insertAdjacentHTML(this.htmlPos, "<div id='frame_container" + this.containerTag + "' style='display:flex; position:relative;'></div>");
        this.frame_container = document.getElementById("frame_container" + this.containerTag);
        this.frame_container.insertAdjacentHTML("afterbegin", "<div id='" + this.frameId + "' style='display:flex; flex:5; position:relative; width:100%; height:100%; '></div>");
        this.frame = document.getElementById(this.frameId);
        this.canvas = new Canvas(this.canvasId, this.frameId);
        this.setCanvas(this.width, this.height);
    }

    setCanvas(width, height) {
        this.aspect = 1;
        this.width = width;
        this.height = height;
        this.canvas.canvas.width = this.width;
        this.canvas.canvas.height = this.height;
        this.canvas.gl.viewport(0, 0, this.width, this.height);
        this.canvas.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.canvas.gl.clear(this.canvas.gl.COLOR_BUFFER_BIT | this.canvas.gl.DEPTH_BUFFER_BIT);
    }

    resizeCanvas(width, height) {
        this.aspect = (height / width) * (this.width / this.height);
        this.canvas.canvas.width = width;
        this.canvas.canvas.height = height;
        this.canvas.gl.viewport(0, 0, width, height);
        this.canvas.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.canvas.gl.clear(this.canvas.gl.COLOR_BUFFER_BIT | this.canvas.gl.DEPTH_BUFFER_BIT);
    }

    set_width(w) {
        this.frame.style.width = w + "px";
        //this.canvas.canvas.width = w;
    }

    set_height(h) {
        this.frame.style.height = h + "px";
        //this.canvas.canvas.height = h;
    }
}

class Canvas {
    constructor(_id, _familiar_tag) {
        this.id = _id;
        this.familiar_tag = document.getElementById(_familiar_tag);
        this.familiar_tag.insertAdjacentHTML('beforeend', "<canvas id='" + _id + "' style='width: 100%; height: 100%;'></canvas>");
        this.canvas = document.getElementById(_id);
        this.gl = this.canvas.getContext('webgl');
        if (!this.gl) {
            console.log('WebGL not supported, falling back on experimental-webgl');
            this.gl = this.canvas.getContext('experimental-webgl');
        }
        if (!this.gl) {
            alert('Your browser does not support WebGL');
        } else {
            const maxTextureUnits = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);
            console.log(`Tu sistema admite un máximo de ${maxTextureUnits} unidades de textura.`);
        }
        this.depthTextureExt = this.gl.getExtension('WEBGL_depth_texture');
        if (this.depthTextureExt !== null) {
            console.log('depthTexture OK');
        } else {
            console.log('depthTexture no disponible');
        }
        //this.setCanvasMeasures(width, height);
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);////////volver a poner!!!!!!!
        this.gl.enable(this.gl.BLEND);///////////////////////////////
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);/////////////////////
        //this.gl.frontFace(this.gl.CW);
        this.gl.cullFace(this.gl.BACK);
    }

    /*
        setCanvasMeasures(width, height) {
            this.width = width;
            this.height = height;
            this.anyBrowserW = this.width;
            this.anyBrowserH = this.height;
            this.edgeW = this.width;
            this.edgeH = this.height;
            this.chromeW = this.width;
            this.chromeH = this.height;
            this.firefoxW = this.width;// * 4;
            this.firefoxH = this.height;// * 4;
            this.userAgent = navigator.userAgent.toLowerCase();
            if (this.userAgent.includes('edg')) {
                this.canvas.width = this.edgeW;
                this.canvas.height = this.edgeH;
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                console.log("browser is Edge");
            } else if (this.userAgent.includes('chrome')) {
                this.gl.canvas.width = this.chromeW;
                this.gl.canvas.height = this.chromeH;
                this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
                console.log("browser is Chrome");
            } else if (this.userAgent.includes('firefox')) {
                this.gl.canvas.width = this.firefoxW;
                this.gl.canvas.height = this.firefoxH;
                this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
                console.log("browser is Firefox");
            } else {
                this.gl.canvas.width = this.anyBrowserW;
                this.gl.canvas.height = this.anyBrowserH;
                this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
                console.log("browser is unknown");
            }
            console.log("width resolution", this.canvas.width, " x ", this.canvas.height);
            console.log("userAgent:", this.userAgent);
        }*/
}

class Shader {
    constructor(gl, type, source) {
        this.shader = gl.createShader(type);
        gl.shaderSource(this.shader, source);
        gl.compileShader(this.shader);
        const success = gl.getShaderParameter(this.shader, gl.COMPILE_STATUS);
        if (!success) {
            console.error(gl.getShaderInfoLog(this.shader));
            gl.deleteShader(this.shader);
        }
    }
}

function getAttribLocation(gl, pro, name) {
    return gl.getAttribLocation(pro, name);
}
function getUniformLocation(gl, pro, name) {
    return gl.getUniformLocation(pro, name);
}

class WalkingCam {
    constructor(camera, keysDown, mouseMovements, mouseClicks, terrain) {
        this.cam = camera;
        this.terrain = terrain || undefined;
        this.keysD = keysDown;
        this.walkingVelocity = 0.1;
        this.mouseM = mouseMovements;
        this.mouseSensitivity = 0.006;
        this.mouseClicks = mouseClicks;
        this.forwardKey = 'w';
        this.backwardKey = 's';
        this.toLeftKey = 'a';
        this.toRightKey = 'd';
        this.fk = false;
        this.bk = false;
        this.lk = false;
        this.rk = false;
    }
    walk() {
        let wv = this.walkingVelocity;
        this.keysD.down(this.forwardKey, () => {
            this.cam.traslateZ(wv);
            this.fk = true;
        });
        this.keysD.down(this.backwardKey, () => {
            this.cam.traslateZ(-wv);
            this.bk = true;
        });
        this.keysD.down(this.toLeftKey, () => {
            this.cam.traslateX(wv);
            this.lk = true;
        });
        this.keysD.down(this.toRightKey, () => {
            this.cam.traslateX(-wv);
            this.rk = true;
        });
        this.keysD.up(this.forwardKey, () => {
            this.keysD.up(this.backwardKey, () => {
                this.fk = false;
            });
        });
        this.keysD.up(this.backwardKey, () => {
            this.keysD.up(this.forwardKey, () => {
                this.bk = false;
            });
        });
        this.keysD.up(this.toLeftKey, () => {
            this.keysD.up(this.toRightKey, () => {
                this.lk = false;
            });
        });
        this.keysD.up(this.toRightKey, () => {
            this.keysD.up(this.toLeftKey, () => {
                this.rk = false;
            });
        });
        const Y = this.terrain.calculateTerrainY([this.cam.box.positionMatrix[12],
        this.cam.box.positionMatrix[13],
        this.cam.box.positionMatrix[14]]);
        this.cam.box.positionMatrix[13] = Y;
        this.cam.positionMatrix[13] = Y;
    }
    lookAround() {
        this.mouseM.move(() => {
            if (this.mouseClicks.clicks['left']) {
                this.cam.rotateY(this.mouseM.mouseMovements['X'] * this.mouseSensitivity);
                this.cam.rotateLookY(this.mouseM.mouseMovements['Y'] * this.mouseSensitivity);
            }
        });
    }
    active() {
        //this.terrain.updateGeometry();
        this.walk();
        this.lookAround();
    }
}

class WalkingObject {
    constructor(object, keysDown, mouseMovements, mouseClicks, terrain, walkingVelocity = 0.1, smooth = 1) {
        this.object = object;
        this.terrain = terrain || undefined;
        this.smooth = smooth;
        this.keysD = keysDown;
        this.walkingVelocity = walkingVelocity;
        this.accelFactor = this.walkingVelocity / this.smooth;
        this.accelCoef = 0;
        this.mouseM = mouseMovements;
        this.mouseSensitivity = 0.006;
        this.mouseClicks = mouseClicks;
        this.forwardKey = 'w';
        this.backwardKey = 's';
        this.toLeftKey = 'a';
        this.toRightKey = 'd';

        this.fk = false;
        this.bk = false;
        this.lk = false;
        this.rk = false;
        this.init = false;
    }
    setKeys(forward = 'w', right = 'd', backward = 's', left = 'a') {
        this.forwardKey = forward;
        this.backwardKey = backward;
        this.toLeftKey = left;
        this.toRightKey = right;
        this.keysD[this.forwardKey] = false;
        this.keysD[this.backwardKey] = false;
        this.keysD[this.toLeftKey] = false;
        this.keysD[this.toRightKey] = false;
    }
    smoothing() {
        if (this.accelCoef < this.walkingVelocity) {
            this.accelCoef = this.accelCoef + this.accelFactor
            return this.accelCoef
        } else {
            return this.accelCoef
        }
    }

    walk() {
        let wv;

        if (!this.fk && !this.bk && !this.lk && !this.rk) {
            wv = 0
            this.accelCoef = 0
        } else {
            wv = this.smoothing()
        }
        this.keysD.down(this.forwardKey, () => {
            //this.init = true;
            this.object.traslateZ(wv);
            this.fk = true;
        });
        this.keysD.down(this.backwardKey, () => {
            //this.init = true;
            this.object.traslateZ(-wv);
            this.bk = true;
        });
        this.keysD.down(this.toLeftKey, () => {
            //this.init = true;
            this.object.traslateX(wv);
            this.lk = true;
        });
        this.keysD.down(this.toRightKey, () => {
            //this.init = true;
            this.object.traslateX(-wv);
            this.rk = true;
        });
        this.keysD.up(this.forwardKey, () => {

            this.fk = false;


        });
        this.keysD.up(this.backwardKey, () => {


            this.bk = false;


        });
        this.keysD.up(this.toLeftKey, () => {


            this.lk = false;


        });
        this.keysD.up(this.toRightKey, () => {


            this.rk = false;


        });
        const Y = this.terrain.calculateTerrainY([this.object.positionMatrix[12],
        this.object.positionMatrix[13],
        this.object.positionMatrix[14]]);
        //this.cam.box.positionMatrix[13] = Y;
        this.object.positionMatrix[13] = Y;
    }
    lookAround() {
        this.mouseM.move(() => {
            if (this.mouseClicks.clicks['left']) {
                this.object.rotateY(this.mouseM.mouseMovements['X'] * this.mouseSensitivity);
                //this.cam.rotateLookY(this.mouseM.mouseMovements['Y'] * this.mouseSensitivity);
            }
        });
    }
    active() {
        //this.terrain.updateGeometry();
        this.walk();
        this.lookAround();
    }
}

class Geometry {
    constructor(faces, type) {
        this.type = type; //tipo de primitiva (triangulo = 3; cuadrados = 4)
        //console.log('type', this.type);
        this.faces = faces || []
        this.vertexArray = [];
        this.indexArray = [];
        this.normalArray = [];
        this.uvArray = [];
        this.setArrays();
    }
    // Parses an OBJ file, passed as a string
    static parseOBJ(src) {
        var POSITION = /^v\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/
        var NORMAL = /^vn\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/
        var UV = /^vt\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/
        var FACE = /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/
        const lines = src.split('\n')
        var positions = [];
        var uvs = [];
        var normals = [];
        var faces = [];
        var type = 0;
        lines.forEach(function (line) {
            // Match each line of the file against various RegEx-es
            var result
            if ((result = POSITION.exec(line)) != null) {
                // Add new vertex position
                positions.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])))
            } else if ((result = NORMAL.exec(line)) != null) {
                // Add new vertex normal
                normals.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])))
            } else if ((result = UV.exec(line)) != null) {
                // Add new texture mapping point
                uvs.push(new Vector2(parseFloat(result[1]), 1 - parseFloat(result[2])))
            } else if ((result = FACE.exec(line)) != null) {
                //console.log('result parseObj', result.length);
                if (result[10] == undefined) { type = 3; } else { type = 4; }
                // Add new face
                var vertices = []
                // Create three vertices from the passed one-indexed indices
                for (var i = 1; i < (type * 3) + 1; i += 3) {
                    var part = result.slice(i, i + 3)

                    var position = positions[parseInt(part[0]) - 1]
                    var uv = uvs[parseInt(part[1]) - 1]
                    var normal = normals[parseInt(part[2]) - 1]
                    vertices.push(new Vertex(position, normal, uv))
                }
                faces.push(new Face(vertices))
            }
        })
        const a = new Geometry(faces, type);
        return a;
    }
    // Loads an OBJ file from the given URL, and returns it as a promise
    static loadOBJ(url) {
        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest()
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    resolve(Geometry.parseOBJ(xhr.responseText))
                }
            }
            xhr.open('GET', url, true)
            xhr.send(null)
        })
    }
    vertexCount() {
        return this.faces.length * 3
    }
    setArrays() {
        for (let i = 0; i < this.faces.length; i++) {
            for (let j = 0; j < this.type; j++) {
                this.vertexArray.push(this.faces[i].vertices[j].position.x);
                this.vertexArray.push(this.faces[i].vertices[j].position.y);
                this.vertexArray.push(this.faces[i].vertices[j].position.z);
                this.normalArray.push(this.faces[i].vertices[j].normal.x);
                this.normalArray.push(this.faces[i].vertices[j].normal.y);
                this.normalArray.push(this.faces[i].vertices[j].normal.z);
                this.uvArray.push(this.faces[i].vertices[j].uv.x);
                this.uvArray.push(this.faces[i].vertices[j].uv.y);
            }
            if (this.type == 4) {
                this.indexArray.push(i * 4 + 2);
                this.indexArray.push(i * 4 + 3);
                this.indexArray.push(i * 4);
                this.indexArray.push(i * 4);
                this.indexArray.push(i * 4 + 1);
                this.indexArray.push(i * 4 + 2);
            } else {
                this.indexArray.push(i * 3);
                this.indexArray.push(i * 3 + 1);
                this.indexArray.push(i * 3 + 2);
            }
        }
    }
}

/*class animationGeometries{
    constructor() {
        this.frames = [];
        //this.animation = animation;

    }
    static async loadAnim(animation) {
        const frames = [];
        for (let i=0; i<animation.length; i++) {
            frames.push(Geometry.loadOBJ(animation[i]));
        }
        return frames;
    }
}*/
/*
class animationGeometries {
    constructor() {
        this.frames = [];
    }

    static async loadAnim(animation) {
        const frames = [];
        
        // Utilizar Promise.all para esperar a que todas las promesas se resuelvan
        await Promise.all(animation.map(async (frame) => {
            const geometry = await Geometry.loadOBJ(frame);
            frames.push(geometry);
        }));

        return frames;
    }
}*/
class animationGeometries {
    constructor() {
        this.frames = [];
    }

    static async loadAnim(animation) {
        const frames = [];

        // Crear un array de promesas junto con sus índices originales
        const promises = animation.map(async (frame, index) => {
            const geometry = await Geometry.loadOBJ(frame);
            return { geometry, index };
        });

        // Ordenar el array de promesas por sus índices originales
        const sortedPromises = promises.sort((a, b) => a.index - b.index);

        // Utilizar Promise.all para esperar a que todas las promesas se resuelvan
        const results = await Promise.all(sortedPromises);

        // Añadir los resultados ordenados al array frames
        results.forEach(result => frames.push(result.geometry));

        return frames;
    }
}

class TransformationsPath {
    constructor(positions, rotations, scales) {
        this.positions = positions;
        this.rotations = rotations;
        this.scales = scales;
    }
    static leerArchivoTxtConXMLHttpRequest(rutaArchivo) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', rutaArchivo, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const data = xhr.responseText;
                        const lineas = data.split('\n');
                        const posiciones = [];
                        const rotaciones = [];
                        const escalados = [];

                        lineas.forEach((linea) => {
                            const posicionMatch = linea.match(/Posición: <Vector \((-?\d+\.\d+), (-?\d+\.\d+), (-?\d+\.\d+)\)>/);
                            const rotacionMatch = linea.match(/Rotación: <Euler \(x=(-?\d+\.\d+), y=(-?\d+\.\d+), z=(-?\d+\.\d+)\)/);
                            const escaladoMatch = linea.match(/Escalado: <Vector \((-?\d+\.\d+), (-?\d+\.\d+), (-?\d+\.\d+)\)>/);

                            if (posicionMatch && rotacionMatch && escaladoMatch) {
                                const posicion = [parseFloat(posicionMatch[1]), parseFloat(posicionMatch[2]), parseFloat(posicionMatch[3])];
                                const rotacion = [parseFloat(rotacionMatch[1]), parseFloat(rotacionMatch[2]), parseFloat(rotacionMatch[3])];
                                const escalado = [parseFloat(escaladoMatch[1]), parseFloat(escaladoMatch[2]), parseFloat(escaladoMatch[3])];

                                posiciones.push(posicion);
                                rotaciones.push(rotacion);
                                escalados.push(escalado);
                            }
                        });

                        resolve(new TransformationsPath(posiciones, rotaciones, escalados));
                    } else {
                        reject(`Error de XMLHttpRequest. Estado: ${xhr.status}`);
                    }
                }
            };

            xhr.send();
        });
    }

    // Uso de la función
    /*  const rutaArchivo = 'trajectory/trayectoria.try'; // Reemplaza con la ruta de tu archivo
      leerArchivoTxtConXMLHttpRequest(rutaArchivo)
        .then((result) => {
          console.log('Posiciones:', result.posiciones);
          console.log('Rotaciones:', result.rotaciones);
          console.log('Escalados:', result.escalados);
        })
        .catch((error) => {
          console.error('Error al leer el archivo:', error);
        });*/
}

class Face {
    constructor(vertices) {
        this.vertices = vertices || []
    }
}

class Vertex {
    constructor(position, normal, uv) {
        this.position = position || new Vector3()
        this.normal = normal || new Vector3()
        this.uv = uv || new Vector2()
    }
}

class Vector3 {
    constructor(x, y, z) {
        this.x = Number(x) || 0
        this.y = Number(y) || 0
        this.z = Number(z) || 0
    }
}

class Vector2 {
    constructor(x, y) {
        this.x = Number(x) || 0
        this.y = Number(y) || 0
    }
}
/*
async function initGL(vertexShaderes = [], fragmentShaderes = [], objs = [], images = [], animations = [], mainFunction) {
    const objFiles = [];
    for (let i = 0; i < objs.length; i++) {
        objFiles.push(await Geometry.loadOBJ(objs[i]));
    }
    const imageFiles = [];
    for (let i = 0; i < images.length; i++) {
        imageFiles.push(await ImageGL.loadImage(images[i]));
    }
    const vertexShaderFiles = [];
    for (let i = 0; i < vertexShaderes.length; i++) {
        vertexShaderFiles.push(await ShaderGL.loadShader(vertexShaderes[i]));
    }
    const fragmentShaderFiles = [];
    for (let i = 0; i < fragmentShaderes.length; i++) {
        fragmentShaderFiles.push(await ShaderGL.loadShader(fragmentShaderes[i]));
    }
    const animationsFiles = [];
    for (let i = 0; i<animations.length; i++) {
        animationsFiles.push(await animationGeometries.loadAnim(animations[i]));
    }
    mainFunction(objFiles, imageFiles, vertexShaderFiles, fragmentShaderFiles, animationsFiles);
}*/

async function initGL(vertexShaderes = [], fragmentShaderes = [], objs = [], images = [], animations = [], transformPath = [], callback) {
    try {
        const filesData = [];
        const objFiles = await Promise.all(objs.map(obj => Geometry.loadOBJ(obj)));
        const imageFiles = await Promise.all(images.map(image => ImageGL.loadImage(image)));
        const vertexShaderFiles = await Promise.all(vertexShaderes.map(shader => ShaderGL.loadShader(shader)));
        const fragmentShaderFiles = await Promise.all(fragmentShaderes.map(shader => ShaderGL.loadShader(shader)));
        const animationsFiles = await Promise.all(animations.map(animation => animationGeometries.loadAnim(animation)));
        const transformPathFiles = await Promise.all(transformPath.map(transformations => TransformationsPath.leerArchivoTxtConXMLHttpRequest(transformations)));
        filesData.push(vertexShaderFiles);
        filesData.push(fragmentShaderFiles);
        filesData.push(objFiles);
        filesData.push(imageFiles);

        filesData.push(animationsFiles);
        filesData.push(transformPathFiles);
        //console.log(filesData);
        if (callback) { callback() }

        return filesData;
        //mainFunction(objFiles, imageFiles, vertexShaderFiles, fragmentShaderFiles, animationsFiles, transformPathFiles);
    } catch (error) {
        console.error('Error en la carga:', error);
    }
}


class ImageGL {
    constructor(image) {
        this.image = image;
        //console.log(this.image);
    }
    static loadImage(url) {
        return new Promise(function (resolve) {
            var image = new Image();
            image.onload = function () {
                resolve(new ImageGL(image));
            }
            image.src = url;
        })
    }
}

class ShaderGL {
    static loadShader(url) {
        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest()
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    resolve(xhr.responseText)
                }
            }
            xhr.open('GET', url, true)
            xhr.send(null)
        })
    }
}

class TextureViewer {
    constructor(_id, container_tag, _board_width, _board_height, zoom) {
        this.id = _id;
        this.container_tag = container_tag;
        this.board_width = _board_width;
        this.board_height = _board_height;
        this.zoom = zoom || 1;
        this.frame = new Frame(this.id, this.container_tag, 'beforebegin', this.id + "textureViewer", this.board_width, this.board_height);
        this.gl = this.frame.canvas.gl;
        this.vs = `attribute vec2 a_position;
                    varying vec2 v_texCoord;
                    void main() {
                        v_texCoord = (a_position + 1.0) * 0.5;
                        gl_Position = vec4(a_position, 0.0, 1.0);
                    }`;
        this.fs = `precision mediump float;
                    uniform sampler2D u_texture;
                    varying vec2 v_texCoord;
                    void main() {
                        gl_FragColor = texture2D(u_texture, v_texCoord);
                    }`;
        this.program = this.gl.createProgram();
        this.vertexShader = new Shader(this.gl, this.gl.VERTEX_SHADER, this.vs);
        this.fragmentShader = new Shader(this.gl, this.gl.FRAGMENT_SHADER, this.fs);
        this.gl.attachShader(this.program, this.vertexShader.shader);
        this.gl.attachShader(this.program, this.fragmentShader.shader);
        this.gl.linkProgram(this.program);
        const success = this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS);
        if (!success) {
            console.error(this.gl.getProgramInfoLog(this.program));
            this.gl.deleteProgram(this.program);
        }

        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.textureUniformLocation = this.gl.getUniformLocation(this.program, "u_texture");
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.positions = [-1, -1, 1, -1, -1, 1, 1, 1];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.STATIC_DRAW);

        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    }
    showTexture(texture) {
        texture.gl.activeTexture(texture.gl.TEXTURE0);
        texture.gl.bindTexture(texture.gl.TEXTURE_2D, texture.texture);
        const framebuffer = texture.gl.createFramebuffer();
        texture.gl.bindFramebuffer(texture.gl.FRAMEBUFFER, framebuffer);
        texture.gl.framebufferTexture2D(texture.gl.FRAMEBUFFER, texture.gl.COLOR_ATTACHMENT0, texture.gl.TEXTURE_2D, texture.texture, 0);
        this.width = texture.gl.canvas.width;
        this.height = texture.gl.canvas.height;
        const pixels = new Uint8Array(texture.width * texture.height * 4);
        texture.gl.readPixels(0, 0, texture.width, texture.height, texture.gl.RGBA, texture.gl.UNSIGNED_BYTE, pixels);
        if (texture.gl.getError()) {
            console.error('No se pudo leer pixels');
        }
        texture.gl.bindFramebuffer(texture.gl.FRAMEBUFFER, null);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, texture.width, texture.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
        this.frame.resizeCanvas(texture.width, texture.height);
        this.frame.frame_container.style.display = 'block';
        this.frame.frame.style.display = 'block';
        this.frame.set_width(texture.width * this.zoom);////////////
        this.frame.set_height(texture.height * this.zoom);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.uniform1i(this.textureUniformLocation, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.displayMeasure(texture);
    }
    displayMeasure(texture) {
        this.id = "texture0";
        this.frame.frame_container.insertAdjacentHTML("afterbegin", "<div id='" + this.id + "' style='display:block; z-index:2; position:absolute; width:100%; height:100%; color:white;'></div>");
        this.display = document.getElementById(this.id);
        this.display.textContent = texture.width + " x " + texture.height;
    }
}

/**
 * @param textureArray8 - array con hasta 8 texturas
 */
class ColorTexture8 {
    constructor(gl) {
        this.gl = gl;
        this.framebuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    }
    load(textureArray8) {
        this.textures = textureArray8;
        this.texture = new Texture(this.gl, 7, this.textures[0].width * 4, this.textures[0].height * 2);
        return this.update(this.textures);
    }
    update(textureArray8) {
        this.textures = textureArray8;
        this.width = this.textures[0].width;
        this.height = this.textures[0].height;
        this.coords = [0, 0,
            0, this.height,
            this.width, 0,
            this.width, this.height,
            this.width * 2, 0,
            this.width * 2, this.height];
        for (let i = 0; i < this.textures.length; i++) {
            this.gl.activeTexture(this.gl.TEXTURE0 + i);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[i].texture);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textures[i].texture, 0);
            const pixels = new Uint8Array(this.textures[i].width * this.textures[i].height * 4);
            this.gl.readPixels(0, 0, this.width, this.height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
            if (this.textures[i].gl.getError()) {
                console.error('No se pudo leer pixels');
            }
            this.texture.activate(7);
            this.texture.bind();
            this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, this.coords[i * 2], this.coords[(i * 2) + 1], this.width, this.height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
        }
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        return this.texture;
    }
}



