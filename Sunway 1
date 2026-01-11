// THREE.js CORE (simplified for racing game)
window.THREE = (function() {
    var THREE = { REVISION: '128' };
    
    // Math
    THREE.MathUtils = {
        DEG2RAD: Math.PI / 180,
        RAD2DEG: 180 / Math.PI,
        clamp: function(value, min, max) {
            return Math.max(min, Math.min(max, value));
        },
        lerp: function(x, y, t) {
            return (1 - t) * x + t * y;
        }
    };
    
    // Vector3
    function Vector3(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
    Vector3.prototype = {
        set: function(x, y, z) {
            this.x = x; this.y = y; this.z = z;
            return this;
        },
        copy: function(v) {
            this.x = v.x; this.y = v.y; this.z = v.z;
            return this;
        },
        add: function(v) {
            this.x += v.x; this.y += v.y; this.z += v.z;
            return this;
        },
        sub: function(v) {
            this.x -= v.x; this.y -= v.y; this.z -= v.z;
            return this;
        },
        subVectors: function(a, b) {
            this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z;
            return this;
        },
        multiplyScalar: function(s) {
            this.x *= s; this.y *= s; this.z *= s;
            return this;
        },
        normalize: function() {
            var len = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
            if (len > 0) {
                this.x /= len; this.y /= len; this.z /= len;
            }
            return this;
        },
        lerp: function(v, alpha) {
            this.x += (v.x - this.x) * alpha;
            this.y += (v.y - this.y) * alpha;
            this.z += (v.z - this.z) * alpha;
            return this;
        }
    };
    THREE.Vector3 = Vector3;
    
    // Color
    function Color(r, g, b) {
        if (g === undefined && b === undefined) {
            this.setHex(r);
        } else {
            this.setRGB(r, g, b);
        }
    }
    Color.prototype = {
        setHex: function(hex) {
            hex = Math.floor(hex);
            this.r = (hex >> 16 & 255) / 255;
            this.g = (hex >> 8 & 255) / 255;
            this.b = (hex & 255) / 255;
            return this;
        },
        setRGB: function(r, g, b) {
            this.r = r; this.g = g; this.b = b;
            return this;
        }
    };
    THREE.Color = Color;
    
    // BufferGeometry
    function BufferGeometry() {
        this.attributes = {};
    }
    BufferGeometry.prototype = {
        setFromPoints: function(points) {
            var positions = new Float32Array(points.length * 3);
            for (var i = 0; i < points.length; i++) {
                positions[i*3] = points[i].x;
                positions[i*3+1] = points[i].y;
                positions[i*3+2] = points[i].z;
            }
            this.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            return this;
        },
        setAttribute: function(name, attribute) {
            this.attributes[name] = attribute;
            return this;
        }
    };
    THREE.BufferGeometry = BufferGeometry;
    
    // BufferAttribute
    function BufferAttribute(array, itemSize) {
        this.array = array;
        this.itemSize = itemSize;
    }
    THREE.BufferAttribute = BufferAttribute;
    
    // Geometry constructors
    THREE.BoxGeometry = function(width, height, depth) {
        this.type = 'BoxGeometry';
        this.parameters = { width: width, height: height, depth: depth };
    };
    
    THREE.PlaneGeometry = function(width, height) {
        this.type = 'PlaneGeometry';
        this.parameters = { width: width, height: height };
    };
    
    THREE.SphereGeometry = function(radius, widthSegments, heightSegments) {
        this.type = 'SphereGeometry';
        this.parameters = { radius: radius };
    };
    
    THREE.CylinderGeometry = function(radiusTop, radiusBottom, height, radialSegments) {
        this.type = 'CylinderGeometry';
        this.parameters = { radiusTop: radiusTop, radiusBottom: radiusBottom, height: height };
    };
    
    THREE.ConeGeometry = function(radius, height, radialSegments) {
        this.type = 'ConeGeometry';
        this.parameters = { radius: radius, height: height };
    };
    
    // Materials
    function Material() {
        this.type = 'Material';
    }
    THREE.Material = Material;
    
    function MeshBasicMaterial(parameters) {
        this.type = 'MeshBasicMaterial';
        this.color = new THREE.Color(parameters && parameters.color !== undefined ? parameters.color : 0xffffff);
        this.transparent = parameters && parameters.transparent || false;
        this.opacity = parameters && parameters.opacity !== undefined ? parameters.opacity : 1;
        this.side = parameters && parameters.side || THREE.FrontSide;
    }
    MeshBasicMaterial.prototype = new Material();
    THREE.MeshBasicMaterial = MeshBasicMaterial;
    
    function MeshLambertMaterial(parameters) {
        this.type = 'MeshLambertMaterial';
        this.color = new THREE.Color(parameters && parameters.color !== undefined ? parameters.color : 0xffffff);
        this.roughness = parameters && parameters.roughness !== undefined ? parameters.roughness : 1;
    }
    MeshLambertMaterial.prototype = new Material();
    THREE.MeshLambertMaterial = MeshLambertMaterial;
    
    function LineBasicMaterial(parameters) {
        this.type = 'LineBasicMaterial';
        this.color = new THREE.Color(parameters && parameters.color !== undefined ? parameters.color : 0xffffff);
    }
    THREE.LineBasicMaterial = LineBasicMaterial;
    
    // Lights
    function Light(color, intensity) {
        this.type = 'Light';
        this.color = new THREE.Color(color);
        this.intensity = intensity !== undefined ? intensity : 1;
    }
    THREE.Light = Light;
    
    function AmbientLight(color, intensity) {
        Light.call(this, color, intensity);
        this.type = 'AmbientLight';
    }
    AmbientLight.prototype = new Light();
    THREE.AmbientLight = AmbientLight;
    
    function DirectionalLight(color, intensity) {
        Light.call(this, color, intensity);
        this.type = 'DirectionalLight';
        this.position = new THREE.Vector3(0, 1, 0);
        this.target = new THREE.Object3D();
        this.shadow = { mapSize: { width: 512, height: 512 } };
    }
    DirectionalLight.prototype = new Light();
    THREE.DirectionalLight = DirectionalLight;
    
    function HemisphereLight(skyColor, groundColor, intensity) {
        Light.call(this, skyColor, intensity);
        this.type = 'HemisphereLight';
        this.groundColor = new THREE.Color(groundColor);
    }
    HemisphereLight.prototype = new Light();
    THREE.HemisphereLight = HemisphereLight;
    
    // Fog
    function Fog(color, near, far) {
        this.name = '';
        this.color = new THREE.Color(color);
        this.near = near || 1;
        this.far = far || 1000;
    }
    THREE.Fog = Fog;
    
    // Objects
    function Object3D() {
        this.type = 'Object3D';
        this.position = new THREE.Vector3();
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = new THREE.Vector3(1, 1, 1);
        this.children = [];
        this.parent = null;
    }
    Object3D.prototype = {
        add: function(object) {
            this.children.push(object);
            object.parent = this;
            return this;
        },
        remove: function(object) {
            var index = this.children.indexOf(object);
            if (index !== -1) {
                this.children.splice(index, 1);
                object.parent = null;
            }
            return this;
        },
        lookAt: function(x, y, z) {
            // Simplified lookAt
            if (x.isVector3) {
                this.rotation.y = Math.atan2(x.x - this.position.x, x.z - this.position.z);
            } else {
                this.rotation.y = Math.atan2(x - this.position.x, z - this.position.z);
            }
            return this;
        }
    };
    THREE.Object3D = Object3D;
    
    function Mesh(geometry, material) {
        Object3D.call(this);
        this.type = 'Mesh';
        this.geometry = geometry;
        this.material = material;
        this.castShadow = false;
        this.receiveShadow = false;
    }
    Mesh.prototype = new Object3D();
    THREE.Mesh = Mesh;
    
    function Line(geometry, material) {
        Object3D.call(this);
        this.type = 'Line';
        this.geometry = geometry;
        this.material = material;
    }
    Line.prototype = new Object3D();
    THREE.Line = Line;
    
    // Scene
    function Scene() {
        Object3D.call(this);
        this.type = 'Scene';
        this.background = null;
        this.fog = null;
    }
    Scene.prototype = new Object3D();
    THREE.Scene = Scene;
    
    // Camera
    function PerspectiveCamera(fov, aspect, near, far) {
        Object3D.call(this);
        this.type = 'PerspectiveCamera';
        this.fov = fov || 50;
        this.aspect = aspect || 1;
        this.near = near || 0.1;
        this.far = far || 2000;
        this.updateProjectionMatrix = function() {
            // Simplified projection matrix update
        };
    }
    PerspectiveCamera.prototype = new Object3D();
    THREE.PerspectiveCamera = PerspectiveCamera;
    
    // Renderer
    function WebGLRenderer(parameters) {
        this.domElement = document.createElement('canvas');
        this.context = this.domElement.getContext('webgl') || this.domElement.getContext('experimental-webgl');
        this.pixelRatio = parameters && parameters.pixelRatio || window.devicePixelRatio || 1;
        this.antialias = parameters && parameters.antialias || false;
        this.alpha = parameters && parameters.alpha || false;
        this.shadowMap = { enabled: false, type: 0 };
        
        this.setSize = function(width, height) {
            this.domElement.width = width * this.pixelRatio;
            this.domElement.height = height * this.pixelRatio;
            this.domElement.style.width = width + 'px';
            this.domElement.style.height = height + 'px';
            if (this.context) {
                this.context.viewport(0, 0, width * this.pixelRatio, height * this.pixelRatio);
            }
        };
        
        this.setPixelRatio = function(value) {
            this.pixelRatio = value;
        };
        
        this.setClearColor = function(color, alpha) {
            // Would set clear color in full implementation
        };
        
        this.render = function(scene, camera) {
            // Simplified render - just clear the canvas
            var ctx = this.domElement.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, this.domElement.width, this.domElement.height);
            }
        };
    }
    THREE.WebGLRenderer = WebGLRenderer;
    
    // Constants
    THREE.FrontSide = 0;
    THREE.BackSide = 1;
    THREE.DoubleSide = 2;
    
    return THREE;
})();
