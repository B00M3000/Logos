let logosDiv = document.getElementById('logos-container')
let logoAmount = document.getElementById('logo-amount')

class CustomLogo {
  constructor(name, draw){
    this.name = name
    this.draw = draw
  }
}

const Logos = [
  new CustomLogo('Apple', (canvas, ctx) => {
    ctx.fillStyle = "black"
    ctx.strokeStyle = "black" //temp
    ctx.beginPath()
    ctx.moveTo(100, 75)
    ctx.arcTo(50, 100, 340 * 180 / Math.PI, 180 * 180 / Math.PI, 25);
    ctx.stroke()
  }),
  new CustomLogo('Youtube', (canvas, ctx) => {
    ctx.fillStyle = "red"
    roundedRect(ctx, 50, 60, 100, 80, 20)

    //Draw Middle Triangle
    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.moveTo(85, 85)
    ctx.lineTo(85, 115)
    ctx.lineTo(115, 100)
    ctx.fill()
  })
]

for(logo of Logos){
  let div = document.createElement('div')
  let name = document.createElement('h3')
  name.innerHTML = logo.name
  let canvas = document.createElement('canvas')
  canvas.width = 200;
  canvas.height = 200;
  let ctx = canvas.getContext('2d')

  logo.draw(canvas, ctx)

  div.append(name)
  div.append(canvas)
  logosDiv.append(div)
}

fetch('logos.json')
  .then(res => res.json())
  .then(logos => {
    logoAmount.innerHTML = `Logos: ${logos.length + Logos.length}`
    console.log(name)
    for (logo of logos) {
      let div = document.createElement('div')
      let name = document.createElement('h3')
      name.innerHTML = logo.name
      let canvas = document.createElement('canvas')
      canvas.width = 200;
      canvas.height = 200;
      let ctx = canvas.getContext('2d')
      for (step of logo.steps) {
        const { type } = step

        ctx.save()

        step.c = step.c || 'black'
        step.w = step.w || 15
        
        ctx.globalAlpha = step.a || 100
        
        if(step.rotation && type != "eclipse"){
          const x = type == "rect" && type == "round_rect" ? step.x-step.w/2 : step.x
          const y = type == "rect" && type == "round_rect" ? step.y-step.h/2 : step.y
          ctx.translate(x, y)
          ctx.rotate(step.rotation * Math.PI);
          ctx.translate(-x, -y)
        }
        
        if(step.c && step.c.startsWith('grad')){
          step.c = step.c.slice(5)
          if(step.c.startsWith('radi')){
            let params = step.c.slice(5).split(' ')
            step.c = ctx.createRadialGradient(params[0], params[1], params[2], params[3], params[4], params[5])
            params = params.slice(6)
            let size = params.length-1
            let current = 0;
            for(p of params){
              step.c.addColorStop(current/size, p)
              current++
            }
          } else if(step.c.startsWith('line')){
            let params = step.c.slice(5).split(' ')
            step.c = ctx.createLinearGradient(params[0], params[1], params[2], params[3])
            params = params.slice(4)
            let size = params.length-1
            let current = 0;
            for(p of params){
              step.c.addColorStop(current/size, p)
              current++
            }
          }
        }
        
        if (type == 'rect') {
          let { x, y, w, h, c } = step
          ctx.fillStyle = c
          x -= w/2
          y -= h/2
          ctx.fillRect(x, y, w, h)
        } else if (type == 'round_rect') {
          let { x, y, w, h, r, c } = step  
          ctx.fillStyle = c
          x -= (w/2)
          y -= (h/2)
          roundedRect(ctx, x, y, w, h, r)
        } else if (type == 'tri') {
          const { x1, y1, x2, y2, x3, y3, c } = step
          ctx.fillStyle = c
          ctx.beginPath();
          ctx.moveTo(x1, y2);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x3, y3);
          ctx.fill();
        } else if (type == 'circle') {
          const { x, y, r, c } = step
          ctx.fillStyle = c
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2, false)
          ctx.fill();
        } else if (type == 'arc') {
          const { x, y, r, s, e, c, w } = step
          ctx.beginPath();
          ctx.arc(x, y, r, s * Math.PI, e * Math.PI, false)
          ctx.lineWidth = w
          ctx.strokeStyle = c;
          ctx.stroke();
        } else if (type == 'text') {
          const { x, y, t, s, f, c } = step
          if(s && f) ctx.font = `${s}px ${f}`
          else ctx.font = `30px Arial`
          ctx.fillStyle = c
          ctx.textAlign = "center"
          ctx.fillText(t, x, y);
        } else if (type == "line") {
          const { x1, y1, x2, y2, c, w } = step
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = c
          ctx.lineWidth = w
          ctx.stroke();
        } else if (type == "eclipse") {
          const { x, y, rx, ry, c, rotation } = step
          ctx.beginPath();
          ctx.ellipse(x, y, rx, ry, rotation, 0, 2 * Math.PI);
          ctx.fillStyle = c
          ctx.fill();
        }
        
        ctx.restore()
      }
      div.append(name)
      div.append(canvas)
      logosDiv.append(div)
    }
  })

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.lineTo(x + width - radius, y + height);
  ctx.arcTo(x + width, y + height, x + width, y + height-radius, radius);
  ctx.lineTo(x + width, y + radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.lineTo(x + radius, y);
  ctx.arcTo(x, y, x, y + radius, radius);
  ctx.fill();
}