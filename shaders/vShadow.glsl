//vertex shader (principal)
attribute vec3 a_position;
uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_modelMatrix;
uniform float u_aspectRatio;
uniform int u_isSun; //1 si es para la sombra del sol, 0 si es para sombra de point lights

void main() {
    if (u_isSun == 1) {
        gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
    } else {
        gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0)/vec4(1.0*1.2, u_aspectRatio*1.2, 1.0,1.0);
    }

    //gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0)/vec4(1.0*1.2, u_aspectRatio*1.2, 1.0,1.0);
    //gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);///vec4(1.0*1.2, u_aspectRatio*1.2, 1.0,1.0);
}
