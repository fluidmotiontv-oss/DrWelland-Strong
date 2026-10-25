/**
 * WebGL-powered Video Processor for real-time cinematic grading.
 * Implements a modular shader architecture for "Fluid Motion" aesthetic.
 */

export const GRADING_SHADERS = {
  vertex: `
    attribute vec2 position;
    attribute vec2 texCoord;
    varying vec2 vTexCoord;
    void main() {
      gl_Position = vec4(position, 0, 1);
      vTexCoord = texCoord;
    }
  `,
  fragment: `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D u_image;
    uniform float u_exposure;
    uniform float u_contrast;
    uniform float u_saturation;
    uniform vec3 u_tint; // Cinematic Teal/Orange or Sovereign Dark

    void main() {
      vec4 color = texture2D(u_image, vTexCoord);
      
      // Exposure
      color.rgb *= pow(2.0, u_exposure);
      
      // Contrast
      color.rgb = (color.rgb - 0.5) * u_contrast + 0.5;
      
      // Saturation
      float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
      color.rgb = mix(vec3(luminance), color.rgb, u_saturation);
      
      // Cinematic Tinting (Simplified LUT)
      // Boost oranges in highlights, teals in shadows
      float weight = clamp(luminance, 0.0, 1.0);
      vec3 teal = vec3(0.0, 0.5, 0.5);
      vec3 orange = vec3(1.0, 0.6, 0.3);
      vec3 tint = mix(teal, orange, weight);
      
      color.rgb *= mix(vec3(1.0), tint, 0.15); // Subtle blend
      
      gl_FragColor = color;
    }
  `
};

export class VideoProcessor {
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl');
    if (!this.gl) return;
    this.init();
  }

  private init() {
    const gl = this.gl!;
    const vs = this.createShader(gl.VERTEX_SHADER, GRADING_SHADERS.vertex);
    const fs = this.createShader(gl.FRAGMENT_SHADER, GRADING_SHADERS.fragment);
    
    this.program = gl.createProgram();
    gl.attachShader(this.program!, vs!);
    gl.attachShader(this.program!, fs!);
    gl.linkProgram(this.program!);
    
    gl.useProgram(this.program);

    // Set up geometry
    const positions = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    const texCoords = new Float32Array([0,1, 1,1, 0,0, 0,0, 1,1, 1,0]);

    this.createBuffer(gl.ARRAY_BUFFER, positions, 'position', 2);
    this.createBuffer(gl.ARRAY_BUFFER, texCoords, 'texCoord', 2);

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  private createShader(type: number, source: string) {
    const gl = this.gl!;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  private createBuffer(type: number, data: Float32Array, attr: string, size: number) {
    const gl = this.gl!;
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(this.program!, attr);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  }

  render(video: HTMLVideoElement, settings: { exposure: number; contrast: number; saturation: number }) {
    if (!this.gl || !this.program) return;
    const gl = this.gl;
    
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    
    const uExposure = gl.getUniformLocation(this.program, 'u_exposure');
    const uContrast = gl.getUniformLocation(this.program, 'u_contrast');
    const uSaturation = gl.getUniformLocation(this.program, 'u_saturation');
    
    gl.uniform1f(uExposure, settings.exposure);
    gl.uniform1f(uContrast, settings.contrast);
    gl.uniform1f(uSaturation, settings.saturation);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
