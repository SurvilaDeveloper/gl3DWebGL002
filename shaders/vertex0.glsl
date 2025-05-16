//vertex shader (principal)
#define vMAX_LIGHTS 4

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_uv;

varying vec3 fragmentPosition;
varying vec3 fragmentNormal;

uniform mat4 u_projectionMatrix;

uniform mat4 u_viewMatrix;
uniform mat4 u_sunViewMatrix;
uniform mat4 u_rotateMatrix;
uniform mat4 u_modelMatrix;
uniform float u_aspect;
uniform int u_numActivePoint;
uniform vec3 u_lightDirection;

uniform mat4 u_projMapMatrix;
uniform mat4 u_orthoProjMapMatrix;

struct ViewMatrixPointLight {
  mat4 viewDown;
  mat4 viewUp;
  mat4 viewLeft;
  mat4 viewRight;
  mat4 viewForward;
  mat4 viewBack;
};

uniform ViewMatrixPointLight viewPointLights[vMAX_LIGHTS];

varying mat4 vvv;

uniform vec3 u_camPosition;

varying vec3 v_viewNormal;
varying vec3 v_lightDirection;
varying vec3 v_position;
varying vec4 v_gl_Position;
varying vec3 v_camPosition;
varying vec2 v_uv;

varying vec4 downCoords[vMAX_LIGHTS];//para guardar las coordenadas de cada textura
varying vec4 upCoords[vMAX_LIGHTS];
varying vec4 leftCoords[vMAX_LIGHTS];
varying vec4 rightCoords[vMAX_LIGHTS];
varying vec4 frontCoords[vMAX_LIGHTS];
varying vec4 backCoords[vMAX_LIGHTS];
varying vec4 v_sunCoords;

//varying vec4 v_glSunPosition;///////////////////////////////////////////////////

//varying float shadowFactor; // Factor de sombra
varying vec4 fromPointDown;

void main() {
  vvv = viewPointLights[0].viewDown;
  v_uv = a_uv;
  fragmentPosition = vec3(u_modelMatrix * vec4(a_position, 1.0));
  
  gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0)/vec4(1.0,u_aspect,1.0,1.0);

  //v_glSunPosition = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
  
  for (int i=0; i<vMAX_LIGHTS; i++) {
    downCoords[i] = u_projMapMatrix * viewPointLights[i].viewDown * u_modelMatrix * vec4(a_position, 1.0);
    upCoords[i] = u_projMapMatrix * viewPointLights[i].viewUp * u_modelMatrix * vec4(a_position, 1.0);
    leftCoords[i] = u_projMapMatrix * viewPointLights[i].viewLeft * u_modelMatrix * vec4(a_position, 1.0);
    rightCoords[i] = u_projMapMatrix * viewPointLights[i].viewRight * u_modelMatrix * vec4(a_position, 1.0);
    frontCoords[i] = u_projMapMatrix * viewPointLights[i].viewForward * u_modelMatrix * vec4(a_position, 1.0);
    backCoords[i] = u_projMapMatrix * viewPointLights[i].viewBack * u_modelMatrix * vec4(a_position, 1.0);
  }

  v_sunCoords = u_orthoProjMapMatrix * u_sunViewMatrix * u_modelMatrix * vec4(a_position, 1.0);
  
  // Transform the normal to world space
  v_viewNormal = mat3(u_viewMatrix) * a_normal;

    // En el vertex shader
  v_lightDirection = u_lightDirection;// normalize(mat3(u_rotateMatrix) * u_lightDirection); // Cálculo en el espacio mundial/////////////
  
// Envío de datos interpolados al fragment shader
    fragmentNormal = vec3(mat3(u_rotateMatrix) * vec3(a_normal));
    v_gl_Position = gl_Position;
    v_camPosition = u_camPosition;
}