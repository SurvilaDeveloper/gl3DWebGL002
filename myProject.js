import { TexturedObject, DiffuseObject, Terrain, Sun } from "./objects";
import { Camera } from "./camera";
import { PointLight, Lighting } from "./lights";
import { KeyUpAndDown, MouseMovement, MouseClicks } from "./inputs";
import { Box, Octaedro } from "./creator";
import { ControlPanel, Display } from "./controls";
import { indexWallArray, normalWallArray, vertexWallArray } from "./dataObjects";
import { invertTriangularClock } from "./glx_functions";
import { rotateMat_x, rotateMat_y, rotateMat_z } from "./matrix";
import { RENDER } from "./renderer";


const objArray = ['objs/pisoCountry.obj', 'objs/guia.obj', 'objs/dado.obj', 'objs/dadoRojo.obj', 'objs/octaedro.obj', 'objs/sol.obj'];
const imagesArray = ['images/pisoCountry.png', 'images/dado.png', 'images/dadoRojo.png'];
const vertexShaderArray = ['shaders/vertex0.glsl', 'shaders/vShadow.glsl'];
const fragmentShaderArray = ['shaders/fragment0.glsl', 'shaders/fShadow.glsl'];

const pruebaBox = new Box(3, 3, 3, 3, 3, 3);
pruebaBox.create(pruebaBox.minX, pruebaBox.valuesY, pruebaBox.valuesZ, [0, 1, 0]);

async function maingl() {
    const MyCanvas = new Frame("marco", "canvas_container", "afterbegin", "gl", 600, 300);
    const gl = MyCanvas.canvas.gl;

    console.log("initGL")

    const filesData = await initGL(vertexShaderArray, fragmentShaderArray, objArray, imagesArray);

    principal(filesData)
    function principal(fd) {
        console.log("Entra en la función principal()")
        const aviso = document.getElementById("aviso")
        aviso.style.display = "none"
        const ver = fd[0];
        const fra = fd[1];
        const obj = fd[2];
        const ima = fd[3];

        //const textureViewer1 = new TextureViewer("tv1", "textureViewer_container1", "512", "512", 0.25);

        console.log("gl.MAX_TEXTURE_SIZE", gl.getParameter(gl.MAX_TEXTURE_SIZE));
        console.log("gl.MAX_CUBE_MAP_TEXTURE_SIZE", gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));
        console.log("gl.MAX_RENDERBUFFER_SIZE", gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
        const panel = new ControlPanel(MyCanvas);
        panel.console.fontSize("16px");

        const infoDisplay = new Display("info");
        infoDisplay.log(`${gl.getParameter(gl.VERSION)}
Este es un ejemplo de uso de la librería que estoy creando con WebGL.`);
        const infoDisplay2 = new Display("controles");
        infoDisplay2.color("rgb(100,255,100)")
        infoDisplay2.log(`Mueva la cámara con las teclas:
            w: hacia adelante
            s: hacia atrás
            a: hacia la izquierda
            d: hacia la derecha
            
Mire en otra dirección manteniendo botón izquierdo del mouse presionado y moviendo el mouse

Juegue con los slides del panel!!

Puede cerrar este aviso con el botón "hide console" que está arriba.`)
        const infoDisplay3 = new Display("nota")
        infoDisplay3.color("rgb(255,100,100)")
        infoDisplay3.log(`Es probable que en navegadores como Edge o Chrome, el renderizado sea lento.
Este proyecto funciona mejor en el navegador Firefox porque tiene un motor de renderizado más optimizado`)


        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        try {
            function main() {

                try {

                    //const vertexShader = new Shader(gl, gl.VERTEX_SHADER, c[0]);//vertexShaderSource);
                    //const fragmentShader = new Shader(gl, gl.FRAGMENT_SHADER, d[0]);
                    //const mainProgram = new Program(gl, vertexShader.shader, fragmentShader.shader);

                    const mainProgram = new DrawerProgram(gl, ver[0], fra[0]);

                    //const shadowVertexShader = new Shader(gl, gl.VERTEX_SHADER, c[1]);//vertexShaderSource);
                    //const shadowFragmentShader = new Shader(gl, gl.FRAGMENT_SHADER, d[1]);
                    //const shadowProgram = new Program(gl, shadowVertexShader.shader, shadowFragmentShader.shader);

                    const shadowProgram = new ShadowProgram(gl, ver[1], fra[1]);

                    const va = new Float32Array(obj[0].vertexArray);
                    const na = new Float32Array(obj[0].normalArray);
                    const ua = new Float32Array(obj[0].uvArray);
                    const ia = new Uint16Array(obj[0].indexArray);

                    const texture0 = new ColorTexture(gl, 0, ima[0].image);//terreno
                    const texture1 = new ColorTexture(gl, 1, ima[1].image);//dado

                    //const texturesCollection = [texture0];
                    //const cubeMap = new ColorTexture8(gl);
                    //const cubeTexture = cubeMap.load(texturesCollection);
                    //const texcol2 = [texture1, texture1, texture1, texture0, texture0, texture0]
                    //cubeMap.update(texcol2);
                    //textureViewer1.showTexture(cubeTexture);



                    const cBv = new Float32Array(obj[2].vertexArray);
                    const cBn = new Float32Array(obj[2].normalArray);
                    const cBuv = new Float32Array(obj[2].uvArray);
                    const cBi = new Uint16Array(obj[2].indexArray);

                    const cuboBlender = new TexturedObject('dado', gl, mainProgram, cBv, cBn, cBuv, cBi, texture1, new Float32Array([1, 1, 1]));
                    cuboBlender.positionMatrix[12] = -2.5;
                    cuboBlender.positionMatrix[13] = 2;
                    cuboBlender.positionMatrix[14] = 0;
                    cuboBlender.brightness = 512;
                    cuboBlender.createControls('dado Blender ');

                    const box1 = new Box(1, 1, 1, 1, 1, 1);
                    box1.create();
                    const b1va = box1.vertexArray;
                    //console.log('boxVertex',box1.vertexArray);
                    const b1na = box1.normalArray;
                    const b1ia = box1.indexArray;


                    const cuboNoBlender = new DiffuseObject('cuboNoBlender', gl, mainProgram, b1va, b1na, b1ia, new Float32Array([0, 1, 0]));
                    cuboNoBlender.positionMatrix[12] = 2.5;
                    cuboNoBlender.positionMatrix[13] = 2;
                    cuboNoBlender.positionMatrix[14] = 0;
                    cuboNoBlender.brightness = 512;
                    cuboNoBlender.createControls('cubo Matrix ');

                    const indexWallUnClock = new Uint16Array(invertTriangularClock(indexWallArray));
                    const pared = new DiffuseObject('pared', gl, mainProgram, vertexWallArray, normalWallArray, indexWallUnClock, new Float32Array([1, 1, 1]));
                    pared.brightness = 16;

                    const dadoRojoVertex = new Float32Array(obj[3].vertexArray);
                    const dadoRojoNormal = new Float32Array(obj[3].normalArray);
                    const dadoRojoIndex = new Uint16Array(obj[3].indexArray);
                    //const dadoRojoIndexUnClock = new Uint16Array(invertTriangularClock(dadoRojoIndex));


                    const dadoRojo = new DiffuseObject('dadoRojo', gl, mainProgram, dadoRojoVertex, dadoRojoNormal, dadoRojoIndex, new Float32Array([1, 0, 0]));
                    dadoRojo.positionMatrix[12] = 0;
                    dadoRojo.positionMatrix[13] = 2;
                    dadoRojo.positionMatrix[14] = 0;
                    dadoRojo.createControls('cubo rojo ');

                    const octaedroVertex = new Float32Array(obj[4].vertexArray);
                    const octaedroNormal = new Float32Array(obj[4].normalArray);
                    const octaedroIndex = new Uint16Array(obj[4].indexArray);
                    const octaedro = new DiffuseObject('octaedro', gl, mainProgram, octaedroVertex, octaedroNormal, octaedroIndex);
                    octaedro.positionMatrix[12] = 0;
                    octaedro.positionMatrix[13] = 3;
                    octaedro.positionMatrix[14] = 3;
                    octaedro.createControls('octaedro ');

                    const octGeo = new Octaedro(0.2, 0.2, 0.2, 0.2, 0.2, 0.2);
                    octGeo.create();
                    const octV = new Float32Array(octGeo.vertexArray);
                    const octN = new Float32Array(octGeo.normalArray);
                    const octI = new Uint16Array(octGeo.indexArray);
                    const octaedroInLight = new DiffuseObject('octaedroInLight ', gl, mainProgram, octV, octN, octI);
                    const octaedroInLight2 = new DiffuseObject('octaedroInLight2 ', gl, mainProgram, octV, octN, octI);
                    const octaedroInLight3 = new DiffuseObject('octaedroInLight3 ', gl, mainProgram, octV, octN, octI);
                    const octaedroInLight4 = new DiffuseObject('octaedroInLight4 ', gl, mainProgram, octV, octN, octI);






                    /*    const octaedroVertexDisplay = new Display('octaedroVertex');
                        const octaedroNormalDisplay = new Display('octaedroNormal');
                        const octaedroIndexDisplay = new Display('octaedroIndex');
                        octaedroVertexDisplay.numberOfColumns = 3;
                        octaedroNormalDisplay.numberOfColumns = 3;
                        octaedroIndexDisplay.numberOfColumns = 3;
                        octaedroVertexDisplay.log(octaedroVertex);
                        octaedroNormalDisplay.log(octaedroNormal);
                        octaedroIndexDisplay.log(octaedroIndex);
                    */
                    const fva = new Float32Array(obj[0].vertexArray);

                    const fna = new Float32Array(obj[0].normalArray);
                    const fua = new Float32Array(obj[0].uvArray);
                    const fia = new Uint16Array(obj[0].indexArray);
                    const floor = new Terrain("floor", gl, mainProgram, fva, fna, fua, fia, texture0);
                    floor.isTextured = 1;
                    //const floor = new DiffuseObject('floor', gl, mainProgram, fva, fna, fia, new Float32Array([1,1,1]));
                    floor.brightness = 16;

                    const eye = new Float32Array([0.0, 1.6, 10.0]);
                    const target = new Float32Array([0, 1.2, 0.0]);
                    const up = new Float32Array([0, 1, 0]);

                    const cam = new Camera(gl, mainProgram, eye, target, up, 'perspective', obj[1]);

                    const vSun = new Float32Array(obj[5].vertexArray);
                    const nSun = new Float32Array(obj[5].normalArray);
                    const iSun = new Uint16Array(obj[5].indexArray);
                    const sol = new Sun('sol', gl, mainProgram, cam, 0.5, 0);//, vSun, nSun, iSun);
                    sol.createControls('SOL ');

                    const pointLight = new PointLight(gl, mainProgram, 'luz1');
                    //pointLight.body.createControls('lightBody ');
                    pointLight.insertBody(octaedroInLight, false);/////////////////

                    const pointLight2 = new PointLight(gl, mainProgram, 'luz2');
                    pointLight2.insertBody(octaedroInLight2, false);/////////////////
                    const pointLight3 = new PointLight(gl, mainProgram, 'luz3');
                    pointLight3.insertBody(octaedroInLight3, false);/////////////////
                    const pointLight4 = new PointLight(gl, mainProgram, 'luz4');
                    pointLight4.insertBody(octaedroInLight4, false);/////////////////

                    const lighting = new Lighting(gl, mainProgram, sol);
                    lighting.ambientLight.intensity = 0.3;
                    lighting.directionalLight.intensity = 0.5;

                    lighting.pointLightsSet.includeLight(pointLight);
                    lighting.pointLightsSet.includeLight(pointLight2);
                    lighting.pointLightsSet.includeLight(pointLight3);
                    lighting.pointLightsSet.includeLight(pointLight4);
                    pointLight.scope = 20.0;
                    pointLight.intensity = 0.3;
                    pointLight.color = new Float32Array([1.0, 1.0, 1.0]);
                    pointLight.position = new Float32Array([-7.8, 4.0, -7.8]);
                    pointLight2.scope = 20.0;
                    pointLight2.intensity = 0.3;
                    pointLight2.color = new Float32Array([1.0, 1.0, 1.0]);
                    pointLight2.position = new Float32Array([7.8, 4.0, -7.8]);
                    pointLight3.scope = 20.0;
                    pointLight3.intensity = 0.3;
                    pointLight3.color = new Float32Array([1.0, 1.0, 1.0]);
                    pointLight3.position = new Float32Array([-7.8, 4.0, 7.8]);
                    pointLight4.scope = 20.0;
                    pointLight4.intensity = 0.3;
                    pointLight4.color = new Float32Array([1.0, 1.0, 1.0]);
                    pointLight4.position = new Float32Array([7.8, 4.0, 7.8]);

                    lighting.createControls();

                    lighting.ambientLight.createControls();
                    lighting.directionalLight.createControls();
                    lighting.pointLightsSet.createControls();
                    octaedroInLight.createControls('point light 0 body ');
                    octaedroInLight2.createControls('point light 1 boby ');
                    octaedroInLight3.createControls('point light 2 boby ');
                    octaedroInLight4.createControls('point light 3 boby ');

                    floor.createControls('terreno ');


                    const displayContact = new Display("contact");

                    const rotationXMatrix = new Float32Array(rotateMat_x(0.032));
                    const rotationYMatrix = new Float32Array(rotateMat_y(0.01));
                    const rotationZMatrix = new Float32Array(rotateMat_z(0.032));
                    const rotationXMatrix2 = new Float32Array(rotateMat_x(-0.010));
                    const rotationYMatrix2 = new Float32Array(rotateMat_y(-0.012));
                    const rotationZMatrix2 = new Float32Array(rotateMat_z(-0.016));

                    const keysDown = new KeyUpAndDown();

                    const moveMouse = new MouseMovement();
                    const mouseClick = new MouseClicks();
                    const moveCam = new WalkingCam(cam, keysDown, moveMouse, mouseClick, floor);
                    //const moveMouseDisplay = new Display('moveMouse');
                    //const renderScene = new SceneRender(gl, mainProgram, cam, lighting);
                    //const shadowRender = new DepthRender(gl, shadowProgram, 2, cam);
                    const ren = new RENDER(MyCanvas, mainProgram, shadowProgram, cam, lighting, 4, 7, [pointLight]);

                    //const ren6 = new DepthRender6(gl, shadowProgram, 7, 1024, 1024, [pointLight, pointLight2]);
                    function renderEscena() {
                        ren.clearViewport();
                        moveCam.active();
                        cam.active();
                        lighting.active();
                        sol.updatePosition(cam);
                        ren.draw(cam.box);

                        ren.draw(cuboBlender);

                        ren.draw(cuboNoBlender);
                        ren.draw(pared);
                        ren.draw(floor);
                        ren.draw(dadoRojo);
                        ren.draw(octaedro);
                        //ren.draw(octaedroInLight)
                        ren.draw(pointLight.body);
                        ren.draw(pointLight2.body);
                        ren.draw(pointLight3.body);
                        ren.draw(pointLight4.body);

                        ren.draw(sol);
                    }
                    function renderSombra() {
                        lighting.active();
                        ren.unbindDepthBuffer();////
                        ren.clearDepthBuffer6();
                        ren.depthDraw6(cuboBlender);////
                        ren.depthDraw6(cuboNoBlender);

                        ren.drawDepthTexturePointLight(0);/////
                    }
                    function renderSombraDeSol() {
                        ren.clearDepthBuffer6();/////
                        ren.depthDraw6(cuboBlender);//////
                        ren.depthDraw6(cuboNoBlender);//////
                        ren.unbindDepthBuffer();/////
                        ren.clearAndBindDepthBuffer();
                        sol.updatePosition();/////
                        lighting.activeDirectional();/////
                        ren.depthDraw(dadoRojo);
                        ren.depthDraw(octaedro);
                        ren.drawDepthTextureDirectional();
                        ren.unbindDepthBuffer();
                    }

                    //////////////////////////////////////////////////////RENDER///////////////////////////////////////////////
                    function render() {
                        try {
                            //renderEscena();
                            renderSombra();
                            renderSombraDeSol();
                            renderEscena();
                            requestAnimationFrame(render);
                        } catch (e) {
                            panel.console.error(e);
                        }
                    }
                    requestAnimationFrame(render);
                } catch (error) {
                    panel.console.error(error);
                }
            }

            main();
        } catch (e) { panel.console.error(e) }
    }
}

maingl()