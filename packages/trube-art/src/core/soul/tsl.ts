export type TSLType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat2';

export interface TSLExpression {
  readonly kind: string;
  readonly type: TSLType;
  render(backend: 'sksl' | 'native'): string;
}

class BinaryExpression implements TSLExpression {
  constructor(
    public readonly left: TSLExpression,
    public readonly op: '+' | '-' | '*' | '/' | 'mix',
    public readonly right: TSLExpression,
    public readonly type: TSLType,
    public readonly kind = 'binary'
  ) {}

  render(backend: 'sksl' | 'native'): string {
    const leftStr = this.left.render(backend);
    const rightStr = this.right.render(backend);
    return `(${leftStr} ${this.op} ${rightStr})`;
  }
}

class LiteralExpression implements TSLExpression {
  constructor(
    public readonly value: number | string,
    public readonly type: TSLType,
    public readonly kind = 'literal'
  ) {}

  render(): string {
    if (typeof this.value === 'number') {
      const s = this.value.toString();
      return s.includes('.') ? s : `${s}.0`;
    }
    return this.value;
  }
}

class CallExpression implements TSLExpression {
  constructor(
    public readonly name: string,
    public readonly args: TSLExpression[],
    public readonly type: TSLType,
    public readonly kind = 'call'
  ) {}

  render(backend: 'sksl' | 'native'): string {
    const argsStr = this.args.map((a) => a.render(backend)).join(', ');
    return `${this.name}(${argsStr})`;
  }
}

class MemberExpression implements TSLExpression {
  constructor(
    public readonly obj: TSLExpression,
    public readonly member: string,
    public readonly type: TSLType,
    public readonly kind = 'member'
  ) {}

  render(backend: 'sksl' | 'native'): string {
    return `${this.obj.render(backend)}.${this.member}`;
  }
}

class InputExpression implements TSLExpression {
  constructor(
    public readonly name: string,
    public readonly type: TSLType,
    public readonly kind = 'input'
  ) {}

  render(backend: 'sksl' | 'native'): string {
    if (backend === 'native') {
      return `uniforms.${this.name}`;
    }
    return `u_${this.name}`;
  }
}

export const tsl = {
  float: (v: number | string) => new LiteralExpression(v, 'float'),
  vec2: (x: TSLExpression, y: TSLExpression) => new CallExpression('vec2', [x, y], 'vec2'),
  vec3: (x: TSLExpression, y: TSLExpression, z: TSLExpression) => new CallExpression('vec3', [x, y, z], 'vec3'),
  
  add: (a: TSLExpression, b: TSLExpression) => new BinaryExpression(a, '+', b, a.type),
  sub: (a: TSLExpression, b: TSLExpression) => new BinaryExpression(a, '-', b, a.type),
  mul: (a: TSLExpression, b: TSLExpression) => new BinaryExpression(a, '*', b, a.type),
  div: (a: TSLExpression, b: TSLExpression) => new BinaryExpression(a, '/', b, a.type),
  
  abs: (a: TSLExpression) => new CallExpression('abs', [a], a.type),
  sin: (a: TSLExpression) => new CallExpression('sin', [a], a.type),
  cos: (a: TSLExpression) => new CallExpression('cos', [a], a.type),
  pow: (a: TSLExpression, b: TSLExpression) => new CallExpression('pow', [a, b], a.type),
  
  mix: (a: TSLExpression, b: TSLExpression, t: TSLExpression) => new CallExpression('mix', [a, b, t], a.type),
  smoothstep: (edge0: TSLExpression, edge1: TSLExpression, x: TSLExpression) => 
    new CallExpression('smoothstep', [edge0, edge1, x], 'float'),
    
  fbm: (p: TSLExpression, octaves: number) => 
    new CallExpression('fbm', [p, new LiteralExpression(octaves, 'float')], 'float'),

  warp: (p: TSLExpression, strength: TSLExpression) =    new CallExpression('domainWarp', [p, strength], 'vec2'),

  kelvin: (k: TSLExpression) =    new CallExpression('kelvinToRGB', [k], 'vec3'),

  length: (a: TSLExpression) => new CallExpression('length', [a], 'float'),
  normalize: (a: TSLExpression) => new CallExpression('normalize', [a], a.type),
  dot: (a: TSLExpression, b: TSLExpression) => new CallExpression('dot', [a, b], 'float'),
  clamp: (x: TSLExpression, min: TSLExpression, max: TSLExpression) => new CallExpression('clamp', [x, min, max], x.type),
  
  member: (obj: TSLExpression, member: string, type: TSLType) => new MemberExpression(obj, member, type),

  env: {
    uv: () => new LiteralExpression('uv', 'vec2'), // pos / u_res
    time: () => new InputExpression('time', 'float'),
    base: () => new InputExpression('base', 'vec3'),
    accent: () => new InputExpression('accent', 'vec3'),
    secondary: () => new InputExpression('secondary', 'vec3'),
    mist: () => new InputExpression('mist', 'vec3'),
    highlight: () => new InputExpression('highlight', 'vec3'),
    shadow: () => new InputExpression('shadow', 'vec3'),
    intensity: () => new InputExpression('intensity', 'float'),
    entropy: () => new InputExpression('entropy', 'float'),
  }
};
