// fragment shader (principal)
#define MAX_LIGHTS 4
precision highp float;



varying vec3 fragmentPosition;
varying vec3 fragmentNormal;
varying vec3 v_camPosition;
varying vec2 v_uv;

uniform int u_maxLights;
uniform int u_isSun;
uniform vec3 u_ambientColor;
uniform vec3 u_directionalColor;
uniform vec3 u_diffuseColor;
uniform vec3 u_specularColor;
uniform float u_brightness;
uniform float u_alpha;
uniform int u_internalLight;
uniform sampler2D u_image;

uniform sampler2D u_shadowPointMap0;
uniform sampler2D u_shadowPointMap1;
uniform sampler2D u_shadowPointMap2;
uniform sampler2D u_shadowPointMap3;
uniform sampler2D u_shadowSun;

uniform float u_bias;

uniform vec3 u_fragColor;
uniform int u_textured;
uniform float u_shadowTextureWidth;
uniform float u_shadowTextureHeight;

struct PointLights {
    vec3 pointPosition;
    vec3 pointColor;
    float pointScope;
    int pointState;
};

uniform PointLights pointLights[MAX_LIGHTS];  // Array de luces puntuales

uniform int numPointLights;  // Número de luces activas

varying vec3 v_viewNormal;  //normal transformada con viewMatrix
varying vec3 v_lightDirection;
varying vec3 v_position; //posicion del vertice antes del las transformaciones viewMatrix y projectionMatrix 
varying vec4 v_gl_Position;
float shadowFactor;
varying vec4 downCoords[MAX_LIGHTS];
varying vec4 upCoords[MAX_LIGHTS];
varying vec4 leftCoords[MAX_LIGHTS];
varying vec4 rightCoords[MAX_LIGHTS];
varying vec4 frontCoords[MAX_LIGHTS];
varying vec4 backCoords[MAX_LIGHTS];
varying vec4 v_sunCoords;

//varying vec4 v_glSunPosition;///////////////////////////////////////////////////

uniform int u_numActivePointFrag;

vec3 calculatePointLighting(vec3 fragmentPosition, vec3 normal, vec3 viewDirection, float bright, vec3 diffuseColor, vec3 specularColor) {
    vec3 lighting = vec3(0.0);
    float powScope;
    float powDistance;
    float density;
    vec3 internalNormal;
    for (int i = 0; i < MAX_LIGHTS; i++) {
        if ( i < numPointLights){
            if (u_internalLight == i) {
                internalNormal = -normal;
            } else {
                internalNormal = normal;
            }
            if (pointLights[i].pointState == 1){
            vec3 lightDir = normalize(pointLights[i].pointPosition - fragmentPosition);
            vec3 reflectDir = reflect(lightDir, internalNormal);//////////////////////////////////////////////////////////////
            float diffuseFactor = max(dot(internalNormal, lightDir), 0.0);
            float distance = length(vec3(pointLights[i].pointPosition - fragmentPosition));
            powScope = pointLights[i].pointScope * pointLights[i].pointScope;
            powDistance = distance * distance ;
            density = powScope / (powDistance + powScope);
            vec3 diffuse = pointLights[i].pointColor * diffuseFactor * density;
            float specularFactor = pow(max(dot(reflectDir, viewDirection),0.0), bright * distance * distance)*diffuseFactor;
            vec3 specular = pointLights[i].pointColor * specularColor * specularFactor * bright * 0.01;
            lighting += diffuse + specular;
            }
        } else {return lighting + (diffuseColor * lighting * 0.5);}
    }
    return lighting + (diffuseColor * lighting * 0.5);
}

float directionalElementsSum;
vec3 fragColor;
float fragColor2;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
float shadowRet = 1.0;//////////////////////////////////////////////////////////////////////////////////////quitar texW y texH
float calculateShadow (vec4 down, vec4 up, vec4 left, vec4 right, vec4 front, vec4 back, sampler2D shadowMap, float texW, float texH, float bias){ // hay que pasar fromPointDown
    float downShadow = 0.0;
    float upShadow = 0.0;
    float leftShadow = 0.0;
    float rightShadow = 0.0;
    float frontShadow = 0.0;
    float backShadow = 0.0;

    vec3 _downCoords = (down.xyz / down.w) * 0.5 + 0.5;
    _downCoords = vec3((_downCoords.x/3.0), (((_downCoords.y*2.0)+1.0)/8.0), _downCoords.z);
    float downDepth = _downCoords.z;

    vec3 _upCoords = (up.xyz / up.w) * 0.5 + 0.5;
    _upCoords = vec3(((_upCoords.x/3.0)+(1.0/3.0)), (((_upCoords.y*2.0)+1.0)/8.0), _upCoords.z);
    float upDepth = _upCoords.z;

    vec3 _leftCoords = (left.xyz / left.w) * 0.5 + 0.5;
    _leftCoords = vec3(((_leftCoords.x/3.0)+(2.0/3.0)), (((_leftCoords.y*2.0)+1.0)/8.0), _leftCoords.z);
    float leftDepth = _leftCoords.z;

    vec3 _rightCoords = (right.xyz / right.w) * 0.5 + 0.5;
    _rightCoords = vec3((_rightCoords.x/3.0), (((_rightCoords.y*2.0)+1.0)/8.0)+(1.0/2.0), _rightCoords.z);
    float rightDepth = _rightCoords.z;

    vec3 _frontCoords = (front.xyz / front.w) * 0.5 + 0.5;
    _frontCoords = vec3(((_frontCoords.x/3.0)+(1.0/3.0)), (((_frontCoords.y*2.0)+1.0)/8.0)+(1.0/2.0), _frontCoords.z);
    float frontDepth = _frontCoords.z;

    vec3 _backCoords = (back.xyz / back.w) * 0.5 + 0.5;
    _backCoords = vec3(((_backCoords.x/3.0)+(2.0/3.0)), (((_backCoords.y*2.0)+1.0)/8.0)+(1.0/2.0), _backCoords.z);
    float backDepth = _backCoords.z;

    if (_downCoords.x < 0.0 || _downCoords.x > 1.0/3.0 || _downCoords.y < 0.0 || _downCoords.y > 1.0/2.0 || down.z < 0.0) {
        downShadow = 1.0;
    } else {
        float mapDownDepth = texture2D(shadowMap, _downCoords.xy).r;
        downShadow = step(downDepth-bias, mapDownDepth);
    };

    if (_upCoords.x < 1.0/3.0 || _upCoords.x > 2.0/3.0 || _upCoords.y < 0.0 || _upCoords.y > 1.0/2.0 || up.z < 0.0) {
        upShadow = 1.0;
    } else {
        float mapUpDepth = texture2D(shadowMap, _upCoords.xy).r;
        upShadow = step(upDepth-bias, mapUpDepth);
    };

    if (_leftCoords.x < 2.0/3.0 || _leftCoords.x > 1.0 || _leftCoords.y < 0.0 || _leftCoords.y > 1.0/2.0 || left.z < 0.0) {
        leftShadow = 1.0;
    } else {
        float mapLeftDepth = texture2D(shadowMap, _leftCoords.xy).r;
        leftShadow = step(leftDepth-bias, mapLeftDepth);
    };

    if (_rightCoords.x < 0.0 || _rightCoords.x > 1.0/3.0 || _rightCoords.y < 1.0/2.0 || _rightCoords.y > 1.0 || right.z < 0.0) {
        rightShadow = 1.0;
    } else {
        float mapRightDepth = texture2D(shadowMap, _rightCoords.xy).r;
        rightShadow = step(rightDepth-bias, mapRightDepth);
    };

    if (_frontCoords.x < 1.0/3.0 || _frontCoords.x > 2.0/3.0 || _frontCoords.y < 1.0/2.0 || _frontCoords.y > 1.0 || front.z < 0.0) {
        frontShadow = 1.0;
    } else {
        float mapFrontDepth = texture2D(shadowMap, _frontCoords.xy).r;
        frontShadow = step(frontDepth-bias, mapFrontDepth);
    };

    if (_backCoords.x < 2.0/3.0 || _backCoords.x > 1.0 || _backCoords.y < 1.0/2.0 || _backCoords.y > 1.0 || back.z < 0.0) {
        backShadow = 1.0;
    } else {
        float mapBackDepth = texture2D(shadowMap, _backCoords.xy).r;
        backShadow = step(backDepth-bias, mapBackDepth);
    };


    shadowRet = (downShadow + upShadow + leftShadow + rightShadow + frontShadow + backShadow) / 6.0;
    return shadowRet;
                //return (shadowDepth1-0.9375)*16.0;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
float calculateSunShadow (vec4 sunCoords, sampler2D sunShadowMap, float bias) {
    float shadow;
    vec3 coords = (sunCoords.xyz / sunCoords.w) * 0.5 + 0.5;
    float sunDepth = coords.z;
    float mapSunDepth = texture2D(sunShadowMap, coords.xy).r;
    shadow = step(sunDepth-bias, mapSunDepth);
    return shadow;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
float calculatePointLightingTotal() {
    
    float shadow1 = 1.0;
    float shadow2 = 1.0;
    float shadow3 = 1.0;
    float shadow4 = 1.0;
    if (u_numActivePointFrag>0 && pointLights[0].pointState != 0) {
        shadow1 = calculateShadow (downCoords[0], upCoords[0], leftCoords[0], rightCoords[0], frontCoords[0], backCoords[0], u_shadowPointMap0, u_shadowTextureWidth, u_shadowTextureHeight, u_bias);
    }
    if (u_numActivePointFrag>1 && pointLights[1].pointState != 0) {
        shadow2 = calculateShadow (downCoords[1], upCoords[1], leftCoords[1], rightCoords[1], frontCoords[1], backCoords[1], u_shadowPointMap1, u_shadowTextureWidth, u_shadowTextureHeight, u_bias);
    }
    if (u_numActivePointFrag>2 && pointLights[2].pointState != 0) {
        shadow3 = calculateShadow (downCoords[2], upCoords[2], leftCoords[2], rightCoords[2], frontCoords[2], backCoords[2], u_shadowPointMap2, u_shadowTextureWidth, u_shadowTextureHeight, u_bias);
    }
    if (u_numActivePointFrag>3 && pointLights[3].pointState != 0) {
        shadow4 = calculateShadow (downCoords[3], upCoords[3], leftCoords[3], rightCoords[3], frontCoords[3], backCoords[3], u_shadowPointMap3, u_shadowTextureWidth, u_shadowTextureHeight, u_bias);
    }
    return (shadow1 + shadow2 + shadow3 + shadow4) / float(u_numActivePointFrag);
}



/////////////////////main()////////////////////////////////////////////////////////////////////////////////////////////////////

void main() {
  // Calcular la iluminación
  vec3 normal = normalize(fragmentNormal);
  vec3 viewDir = normalize(fragmentPosition.xyz - v_camPosition);
  if (u_isSun == 1) {
    gl_FragColor = vec4(u_diffuseColor, 1.0);
  } else {
    float alpha;
    if (u_textured == 1) { // Verifica si la textura existe (usando un punto de la textura)
        vec4 texColor = texture2D(u_image, v_uv).xyzw; // Lee el color de la textura
        fragColor = vec3(texColor.xyz*u_diffuseColor).xyz; // Utiliza el color de la textura
        alpha = texColor[3]*u_alpha;

    } else {
        fragColor = vec3(u_diffuseColor); // Utiliza el color difuso si no hay textura
        alpha = u_alpha;
    }
  vec3 lighting = calculatePointLighting(fragmentPosition, normal, viewDir, u_brightness, fragColor, u_specularColor);
////////////////////////////

    float pointsShadow = calculatePointLightingTotal();

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//float sombraSol = texture2D(u_shadowSun, v_sunCoords.xy).r;
 float sunShadow = calculateSunShadow(v_sunCoords, u_shadowSun, u_bias);
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  float directionalInfluence = (max(dot(-v_lightDirection,normal), 0.0))*2.0;
  vec3 directionalLight = u_directionalColor * directionalInfluence; ///////
  directionalElementsSum = directionalLight.x + directionalLight.y + directionalLight.z ;
  vec3 ambient =  clamp(u_ambientColor * fragColor, 0.0, 1.0);// * u_generalIntensity;
  vec3 lights = clamp((((fragColor / 3.0) * directionalElementsSum*sunShadow) + (directionalLight*sunShadow / 3.0) + (lighting * pointsShadow)),0.0,1.0);//+downColor+leftColor+rightColor;//*fragColor2;
  gl_FragColor = clamp(vec4((((lights * lights) - (lights * ambient) + ambient)), alpha),0.0,1.0);
  }

}
