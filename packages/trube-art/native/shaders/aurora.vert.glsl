#version 450

layout(location = 0) out vec2 v_uv;

void main() {
    // Generate a fullscreen triangle:
    // (-1, -1), (3, -1), (-1, 3)
    // uv: (0, 0), (2, 0), (0, 2)
    float x = -1.0 + float((gl_VertexIndex & 1) << 2);
    float y = -1.0 + float((gl_VertexIndex & 2) << 1);
    
    v_uv.x = (x + 1.0) * 0.5;
    v_uv.y = (y + 1.0) * 0.5;
    
    gl_Position = vec4(x, y, 0.0, 1.0);
}
