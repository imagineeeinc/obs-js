const still = "still"
const update = "update"

const mesh = "mesh"
const canvasShape = mesh
const sprite = "sprite"
const texture = "texture"

const rect = "rect"
const circle = "circle"
const paths = "paths"

const hitbox = "hitbox"
var curImg = new Image()

const error = {
  noSupport: "Your browser dose not support canvas"
}

class CaveRenderEngine {
  constructor(opts) {
    this.bgColor = opts.bgColor
    this.canvasId = opts.canvasId
    this._drawers = this._theDrawers()
  }
  setUpImageCacher() {
    let store = document.createElement("div")
    store.style.display = "none"
    store.id = "caveImageCache" + Math.round(Math.floor(Math.random() * 9999) + 1000)
    document.body.append(store)
    return store.id
  }
  zeroToCenter(is){
    let canvas = document.getElementById(this.canvasId)
    //let ctx = canvas.getContext('2d')
    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
    } else {
      return [false, error.noSupport]
    }
    if (is === true) {
      ctx.translate(canvas.width/2, canvas.height/2)
    } else if (is === false) {
      ctx.translate(0,0)
    } else {return [false, "no given boolen"]}
  }
  //TODO: draw scene function
  draw(scene) {
    this.scene = scene.vScene
    let canvas = document.getElementById(this.canvasId)
    //let ctx = canvas.getContext('2d')
    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
    } else {
      return [false, error.noSupport]
    }
    //defaults
    ctx.font = "30px Arial";
    //background render code
    ctx.fillStyle = this.bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //draw objects
    for (var i=0;i<this.scene.length;i++) {
      let obj = this.scene[i]
      if (obj.scripts != null) {
        let sc = obj.scripts
        let res
        for (var j=0;j<sc.length;j++) {
          let importing = sc[j].importScript || function() {return null}
          let s = sc[j].script
          importing = importing()
          res = s(obj, importing)
          obj = res
        }
      }
      if (obj.type == mesh) {
        if (obj.drawType == rect) {
          let response = this._drawers.rect(ctx, [obj.x-(obj.width/2), obj.y-(obj.height/2), obj.width * obj.scale, obj.height * obj.scale, obj.color])
        } else if (obj.drawType == circle) {
          let response = this._drawers.circle(ctx, [obj.x-(obj.width/2), obj.y-(obj.height/2), obj.width*obj.scale, obj.color])
        }
      } else if (obj.type == sprite) {
        if (obj.drawType == texture) {
          curImg.src = obj.texture
          let response = this._drawers.texture(ctx, [obj.x-(obj.width/2), obj.y-(obj.height/2), obj.width * obj.scale, obj.height * obj.scale, obj.texture])
        }
      }
    }
    return [true]
  }
  _theDrawers() {
    let drawers = {
      rect: (function(ctx, opts){
        ctx.fillStyle = opts[4]
        ctx.fillRect(opts[0], opts[1], opts[2], opts[3]);
        return true
      }),
      circle: (function(ctx, opts){
        ctx.beginPath();
        ctx.arc(opts[0], opts[1], opts[2], 0, 2*Math.PI)
        ctx.fillStyle = opts[3]
        ctx.fill()
        ctx.closePath()
        //ctx.clearRect(opts[0]-opts[2], opts[1]-opts[2], opts[2]*2, opts[2]*2);
        return true
      }),
      texture: (function(ctx, opts){
        ctx.drawImage(curImg,opts[0], opts[1], opts[2], opts[3])
        return true
      })
    }
    return drawers
  }
}
class newOrbsScene {
  constructor() {
    this.vScene = []
  }//TODO: orb scene system
  add(obj) {
    this.vScene.push(obj)
  }
  scene() {return this.vScene}
}
//TODO: scripting system
class newOrbsRenderer {
  constructor(opts) {
    if (opts.canvas) {
      this.canvas = opts.canvas
    } else {
      this.canvas = newCanvas()
    }
    this.canvasId = this.canvas.id
    this.bgColor = opts.bgColor || "#ffffff"
    this.fps = opts.fps || 30
    this.renderState = opts.renderState || still
    if (this.renderState == still) {
      this.updater = false
    } else if (this.renderState == update) {
      this.updater = true
    } else {
      console.error("no proper given renderState.\noptions:( update | still )");
    }
    this.scene = opts.scene || new newOrbsScene()
    
    this.cave = new CaveRenderEngine({bgColor: this.bgColor, canvasId: this.canvasId})
    if (opts.disableImageCache == true) {} else {this.storeId = this.cave.setUpImageCacher()}
    function newCanvas() {
      let can = document.createElement("canvas")
      can.id = "orbsCanvas" + Math.round(Math.floor(Math.random() * 9999) + 1000)
      can.innerHTML = "Hmm, Looks like your browser does not support Canvas"
      return can
    }
  }
  startRenderCycle() {
    let cave = this.cave
    setInterval(() => updateScript(cave, this.scene, this.updater), 1000/this.fps)
    function updateScript(cave, scene, update) {
      if (update === true) {
        let response = requestAnimationFrame(cave.draw(scene))
        if (response[0] === false) {
          alert(response[1])
          console.alert(response[1])
        }
      }
    }
  }
  zeroToCenter(is){this.cave.zeroToCenter(is)}
  attachCanvas(can) {
    this.canvas = can
    this.canvasId = this.canvas.id
  }
  addToImgCache(img, name) {
    let store = document.getElementById(this.storeId)
    let image = document.createElement("img")
    image.src = img
    image.className = name
    store.append(image)
  }
  setRenderState(state) {
    this.renderState = state || still
    if (this.renderState == still) {
      this.updater = false
    } else if (this.renderState == update) {
      this.updater = true
    } else {
      console.error("no proper given renderState.\noptions:( update | still )");
    }
  }
  setSize(x, y) {
    this.canvas.width = x
    this.canvas.height = y
  }
  setBgColor(c){
    this.bgColor = c
  }
  setScene(scene) {
    this.scene = scene
  }
  draw(scene) {
    this.tempScene = scene
  }
}

//TODO: do orbs object system and texture system
class newOrbsObj {
  constructor(opts) {
    this.type = opts.type || mesh
    if (this.type == mesh) {
      this.drawType = opts.drawType
    }
    if (this.drawType) {
      this.drawType = opts.drawType || texture
    } else {
      this.drawType = texture
    }
    this.scripts = []
    this.x = opts.x || 0
    this.y = opts.y || 0
    this.width = opts.width || 0
    this.height = opts.height || 0
    this.color = opts.color || "#000"
    this.scale = opts.scale || 1
    this.rotation = opts.rotation || 0
    this.texture = null
  }
  _giveCodec() {
    return {type: this.type, drawType: this.drawType, x: this.x, y: this.y, width: this.width, height: this.height, color: this.color}
  }
  attachScript(s) {
    this.scripts.push(s)
  }
  setVars(name, value) {
    this[name] = value
  }
  drawFunc(opts) {
    if (this.type == mesh) {
      if (this.drawType == rect) {
        this.x = opts[0]
        this.y = opts[1]
        this.width = opts[2]
        this.height = opts[3]
        this.color = opts[4]
        this.scale = opts[5] || 1
      } else if (this.drawType == circle) {
        this.x = opts[0]
        this.y = opts[1]
        this.width = opts[2]
        this.color = opts[3]
        this.scale = opts[4] || 1
      }
    } else if (this.type == sprite) {
      if (this.drawType == texture) {
        this.x = opts[0]
        this.y = opts[1]
        this.width = opts[2]
        this.height = opts[3]
        this.texture = opts[4]
        this.scale = opts[5] || 1
      }
    }
  }
  move(v) {
    let vect = v._giveVector()
    this.x = this.x + vect[0] || this.x
    this.y = this.y + vect[1] || this.y
    this.scale = this.scale + vect[2] || this.scale
    this.rotation = this.rotation + vect[3] || this.rotation
  }
  setPos(v) {
    let vect = v._giveVector()
    this.x = vect[0] || this.x
    this.y = vect[1] || this.y
    this.scale = vect[2] || this.scale
    this.rotation = vect[3] || this.rotation
  }
}

class newOrbsScriptComponent {
  constructor() {this.script = function() {return null}}
  attachScript(s) {this.script = s}
  imports(im) {this.importScript = im}
}
class Vector {
  constructor(x, y, scale, rotation) {
    this.x = x || null
    this.y = y || null
    this.scale = scale || null
    this.rot = rotation || null
  }
  _giveVector(){return [this.x, this.y, this.scale, this.rot]}
}

function Vect(x, y, s, r) {
  return new Vector(x, y, s, r)
}

class primitiveGravity {
  constructor(maxVelo) {
    console.log("gravity is not yet implemented")
  }
}

const ORBS = {
  setFullScreenGameCss: (function() {
    document.body.setAttribute("style", `padding: 0;
    margin: 0;
    height: 100vh`)
  }),
  _: (function() {
    return [
      new newOrbsRenderer(),
      new newOrbsScene()
    ]
  }),
  renderer: newOrbsRenderer,
  scene: newOrbsScene,
  obj: newOrbsObj,
  scripComponent: newOrbsScriptComponent,
  Vector: Vector,
  components: {
    primitiveGravity: primitiveGravity
  }
}

function echo(txt, ln) {
  return console.log(txt + `[ln: ${ln}]`)
}
