#ifdef GL_ES
precision mediump float;
#endif

// Pixel position
varying vec2 pos;

uniform float time;
uniform float amplitude;
uniform float frequency;

// Uniforms set by filterShader
uniform sampler2D filter_background; // contains the image being filtered
uniform vec2 filter_res; // contains the image resolution in pixels

// Function to generate a pseudo-random value based on a seed
float random(vec2 seed) {
  return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Function to determine if a point is inside a triangle
bool pointInTriangle(vec2 p, vec2 p0, vec2 p1, vec2 p2) {
  float dX = p.x - p2.x;
  float dY = p.y - p2.y;
  float dX21 = p2.x - p1.x;
  float dY12 = p1.y - p2.y;
  float D = dY12 * (p0.x - p2.x) + dX21 * (p0.y - p2.y);
  float s = dY12 * dX + dX21 * dY;
  float t = (p2.y - p0.y) * dX + (p0.x - p2.x) * dY;
  if (D < 0.0) return s <= 0.0 && t <= 0.0 && s + t >= D;
  return s >= 0.0 && t >= 0.0 && s + t <= D;
}

// Function to draw a polygon using triangles
void drawPolygon(inout vec3 color, vec2 uv, vec2 vertices[7], int numVertices) {
  for (int i = 1; i < 6; i++) { // Fixed loop bounds
    if (i >= numVertices - 1) break;
    if (pointInTriangle(uv, vertices[0], vertices[i], vertices[i + 1])) {
      color = vec3(0.98, 0.26, 0.0); // normalised scapino orange color for shapes
    }
  }
}

void main() {
  vec2 uv = pos;
  
  // create a sine wave to distort our texture coords
  float sineWave = sin(uv.y * frequency + time) * amplitude;
  
  // create a vec2 with our sine
  vec2 distort = vec2(sineWave, 0.0);
  
  // add the distortion to our texture coordinates and taking color from image
  vec4 col = texture2D(filter_background, uv + distort);
  
  // Convert to grayscale 
  float gray = dot(col.rgb, vec3(0.299, 0.587, 0.114)); // this is grey color
  
  float contrastFactor = 1.2; // Added contrast to fit branding more
  float contrastedGray = (gray - 0.5) * contrastFactor + 0.5;
  
  // Invert the grayscale color
  float invertedGray = 1.0 - contrastedGray;
  vec3 color = vec3(invertedGray);
  
  // Slow down the update rate of shapes
  float slowTime = floor(time*3.0); 
  
  // Draw 10 random polygons each second
  for (int i = 0; i < 10; i++) {
    int numVertices = 5 + int(mod(random(vec2(float(i) + 8.0, slowTime)) * 3.0, 3.0)); // Random number of vertices between 5 and 7
    vec2 vertices[7];
    vec2 center = vec2(random(vec2(float(i), slowTime)), random(vec2(float(i) + 1.0, slowTime + 1.0)));
    for (int j = 0; j < 7; j++) { // Fixed loop bounds
      if (j >= numVertices) break;
      float angle = 6.28318530718 * float(j) / float(numVertices); // 2 * PI * j / numVertices
      float radius = random(vec2(float(i) + 2.0 * float(j), slowTime)) * 0.02; // Smaller radius
      vertices[j] = center + vec2(cos(angle), sin(angle)) * radius;
    }
    drawPolygon(color, uv, vertices, numVertices);
  }
  
  // Output the final color
  gl_FragColor = vec4(color, 1.0);
}
