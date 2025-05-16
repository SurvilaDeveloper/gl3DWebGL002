//const vertexArray = new Float32Array([-0.5, -0.5, 0.5,-0.5, 0.5, 0.5,0.5, 0.5, 0.5])

export const vertexArray = new Float32Array([
    // Front face
    -0.5, -0.5, 0.5,   // Vertex 0
    0.5, -0.5, 0.5,    // Vertex 1
    0.5, 0.5, 0.5,     // Vertex 2
    -0.5, 0.5, 0.5,    // Vertex 3

    // Back face
    -0.5, -0.5, -0.5,  // Vertex 4
    0.5, -0.5, -0.5,   // Vertex 5
    0.5, 0.5, -0.5,    // Vertex 6
    -0.5, 0.5, -0.5,   // Vertex 7

    // Top face
    -0.5, 0.5, 0.5,    // Vertex 8
    0.5, 0.5, 0.5,     // Vertex 9
    0.5, 0.5, -0.5,    // Vertex 10
    -0.5, 0.5, -0.5,   // Vertex 11

    // Bottom face
    -0.5, -0.5, 0.5,   // Vertex 12
    0.5, -0.5, 0.5,    // Vertex 13
    0.5, -0.5, -0.5,   // Vertex 14
    -0.5, -0.5, -0.5,  // Vertex 15

    // Right face
    0.5, -0.5, 0.5,    // Vertex 16
    0.5, -0.5, -0.5,   // Vertex 17
    0.5, 0.5, -0.5,    // Vertex 18
    0.5, 0.5, 0.5,     // Vertex 19

    // Left face
    -0.5, -0.5, 0.5,   // Vertex 20
    -0.5, -0.5, -0.5,  // Vertex 21
    -0.5, 0.5, -0.5,   // Vertex 22
    -0.5, 0.5, 0.5     // Vertex 23
]);

//const normalArray = new Float32Array([0,0,1]);

export const normalArray = new Float32Array([
    // Front face
    0, 0, 1,  // Normal 0
    0, 0, 1,  // Normal 1
    0, 0, 1,  // Normal 2
    0, 0, 1,  // Normal 3

    // Back face
    0, 0, -1, // Normal 4
    0, 0, -1, // Normal 5
    0, 0, -1, // Normal 6
    0, 0, -1, // Normal 7

    // Top face
    0, 1, 0,  // Normal 8
    0, 1, 0,  // Normal 9
    0, 1, 0,  // Normal 10
    0, 1, 0,  // Normal 11

    // Bottom face
    0, -1, 0, // Normal 12
    0, -1, 0, // Normal 13
    0, -1, 0, // Normal 14
    0, -1, 0, // Normal 15

    // Right face
    1, 0, 0,  // Normal 16
    1, 0, 0,  // Normal 17
    1, 0, 0,  // Normal 18
    1, 0, 0,  // Normal 19

    // Left face
    -1, 0, 0, // Normal 20
    -1, 0, 0, // Normal 21
    -1, 0, 0, // Normal 22
    -1, 0, 0  // Normal 23
]);

//const indexArray = new Uint16Array([0,1,2]);

export const indexArray = new Uint16Array([
    0, 3, 2, 2, 1, 0,     // Front face
    4, 5, 6, 6, 7, 4,      // Back face
    8, 11, 10, 10, 9, 8,    // Top face
    12, 13, 14, 14, 15, 12,   // Bottom face
    16, 19, 18, 18, 17, 16,   // Right face
    20, 21, 22, 22, 23, 20    // Left face
]);



export const vertexWallArray = new Float32Array([
    //left wall
    -8, 4, 8,
    -8, 4, -8,
    -8, 0, -8,
    -8, 0, 8,
    //back wall
    -8, 4, -8,
    8, 4, -8,
    8, 0, -8,
    -8, 0, -8,
    //right wall
    8, 4, -8,
    8, 4, 8,
    8, 0, 8,
    8, 0, -8]);/*,
    //front wall
    -8, 16, 8,
    -8, 0, 8,
    8, 0, 8,
    8, 16, 8,
    //up wall
    -8, 16, -8,
    -8, 16, 8,
    8, 16, 8,
    8, 16, -8
]);*/

export const normalWallArray = new Float32Array([
    //left wall
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    //back wall
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    //right wall
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0]);/*,
    //front wall
    0,0,-1,
    0,0,-1,
    0,0,-1,
    0,0,-1,
    //up wall
    0,-1,0,
    0,-1,0,
    0,-1,0,
    0,-1,0
]);*/

export const indexWallArray = new Uint16Array([
    //left wall
    3, 0, 1, 1, 2, 3,
    //back wall
    7, 4, 5, 5, 6, 7,
    //right wall
    11, 8, 9, 9, 10, 11]);/*,
    //front wall
    15,12,13,13,14,15,
    //up wall
    19,16,17,17,18,19
]);*/

export const vertexFloorArray = new Float32Array([
    -2, -1, 1.5,
    -2, 1, -8.5,
    2, 1, -8.5,
    2, -1, 1.5
]);

export const normalFloorArray = new Float32Array([
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0
]);

export const indexFloorArray = new Uint16Array([
    0, 1, 2, 2, 3, 0
]);

export const vertexOmniArray = new Float32Array([
    // Cara frontal
    -1.0, -1.0, 1.0,  // Vértice 0
    1.0, -1.0, 1.0,  // Vértice 1
    -1.0, 1.0, 1.0,  // Vértice 2
    1.0, 1.0, 1.0,  // Vértice 3

    // Cara trasera
    -1.0, -1.0, -1.0,  // Vértice 4
    1.0, -1.0, -1.0,  // Vértice 5
    -1.0, 1.0, -1.0,  // Vértice 6
    1.0, 1.0, -1.0,  // Vértice 7

    // Cara izquierda
    -1.0, -1.0, -1.0,  // Vértice 8
    -1.0, 1.0, -1.0,  // Vértice 9
    -1.0, -1.0, 1.0,  // Vértice 10
    -1.0, 1.0, 1.0,  // Vértice 11

    // Cara derecha
    1.0, -1.0, -1.0,  // Vértice 12
    1.0, 1.0, -1.0,  // Vértice 13
    1.0, -1.0, 1.0,  // Vértice 14
    1.0, 1.0, 1.0,  // Vértice 15

    // Cara superior
    -1.0, 1.0, -1.0,  // Vértice 16
    1.0, 1.0, -1.0,  // Vértice 17
    -1.0, 1.0, 1.0,  // Vértice 18
    1.0, 1.0, 1.0,  // Vértice 19

    // Cara inferior
    -1.0, -1.0, -1.0,  // Vértice 20
    1.0, -1.0, -1.0,  // Vértice 21
    -1.0, -1.0, 1.0,  // Vértice 22
    1.0, -1.0, 1.0,  // Vértice 23
]);

export const normalOmniArray = new Float32Array([
    // Normales de la cara frontal
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    // Normales de la cara trasera
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,

    // Normales de la cara izquierda
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,

    // Normales de la cara derecha
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,

    // Normales de la cara superior
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,

    // Normales de la cara inferior
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
]);

export const indexOmniArray = new Uint16Array([
    // Cara frontal
    0, 1, 2, 3,

    // Cara trasera
    4, 5, 6, 7,

    // Cara izquierda
    8, 9, 10, 11,

    // Cara derecha
    12, 13, 14, 15,

    // Cara superior
    16, 17, 18, 19,

    // Cara inferior
    20, 21, 22, 23,
]);

