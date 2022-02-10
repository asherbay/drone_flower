import React, {useEffect, useState, useContext}  from "react";
import { ReactP5Wrapper } from "react-p5-wrapper";
// import * as Tone from 'tone'
import {DroneContext} from '../providers/DroneProvider'
import {Vector} from "p5"

//since pulse as a class hasn't been working, try pulses as an array of objects {pulseLifespan, pulseAge, magnitude, target color, id}
const Visual = () =>{
    // const {getDrone, drones, setDrones} = useContext(DroneContext)
    const {getDrone, drones} = useContext(DroneContext)
    // const [loaded, setLoaded] = useState(false)
    // const [canvasCreated, setCanvasCreated] = useState(false)
    // const [canvas, setCanvas] = useState(null)
    const harmonicities = [1., 1., 1., 1., 1.25, 1.3333, 1.5, 2., 2., 2., 4., 0.666, 3., 2.5, 0.5, 0.5, 0.75]
    
    const [renderNum, setRenderNum] = useState(0)
    
    let droneNodes = []


    useEffect(()=>{
        console.log("wrapper returned")
        // setLoaded(true)
    }, [])

    // useEffect(()=>{
    //     console.log("canvas: " + canvas)
        
    // }, [canvas])

    // function shuffle (arr) {
    //     var j, x, index;
    //     for (index = arr.length - 1; index > 0; index--) {
    //         j = Math.floor(Math.random() * (index + 1));
    //         x = arr[index];
    //         arr[index] = arr[j];
    //         arr[j] = x;
    //     }
    //     return arr;
    // }
    
    const sketch = (p5) =>{
        const rndColorVal = () => {return Math.floor(Math.random()*256)}
        const blendingModes = [p5.BLEND,]//p5.HARD_LIGHT,] //p5.LIGHTEST, p5.HARD_LIGHT] //p5.DIFFERENCE, p5.EXCLUSION,]// p5.HARD_LIGHT,]// p5.BURN,]
        let width = p5.windowWidth
        let height = p5.windowHeight
        let bgColor = p5.color(rndColorVal(), rndColorVal(), rndColorVal(), 255)    
        let age = 0        

        const frameRate = 25
        class DroneNode {
            constructor(x, y, r, id) {
                this.position = [x, y];
                this.posVect = p5.createVector(this.position[0], this.position[1]);
                this.rx = r;
                this.ry = r;
                this.id = id
                this.color = p5.color(rndColorVal(), rndColorVal(), rndColorVal(), 255)
                this.secondaryColor = p5.color(rndColorVal(), rndColorVal(), rndColorVal(), 255)
                
                this.droneSource = getDrone(this.id)
                this.shapeVar = []
                this.shapeBuild = []
                this.shapeVar2 = []
                this.oscType = this.droneSource.synth.oscillator.type

                this.seedX = Math.random()
                this.seedY = Math.random()
                this.age = 0
                
                this.left = 0
                this.right = 0
                this.top = 0
                this.bottom = 0

                this.width = 0
                this.height = 0

                this.angle = Math.floor(Math.random() * 360 + 1)
                this.rotation = 0.5 //(Math.random()>0.5 ? 0. : (Math.random() - 0.5) * 2)

                this.speed = 15
                this.moveX = 0
                this.moveY = 0
                
                this.prevLvl = 0.
                this.reactivity = Math.random() * 0.7 + 0.085

                this.blendingMode = blendingModes[Math.floor(Math.random() * blendingModes.length)]

                this.wobbliness = 20
                this.smoothness = 9
                
                if (this.oscType==="fmsawtooth"){
                    this.smoothness = Math.floor(Math.random() * 30 + 1)
                    this.wobbliness = this.wobbliness +  Math.floor(Math.random() * 55 + 7)
                } else if (this.oscType==="fmtriangle"){
                    this.smoothness = Math.floor(Math.random() * 40 + 3)
                    this.wobbliness = this.wobbliness +  Math.floor(Math.random() * 20 + 2)
                
                } else if (this.oscType==="fmsine"){
                    this.smoothness = Math.floor(Math.random() * 50 + 3)
                } else {
                    this.smoothness = Math.floor(Math.random() * 42 + 2)
                }

                
               

                this.prevNote = 0
                this.newNoteTransTime = 0
                this.newNoteTransTimer = 0
                this.newNoteParams = {

                }

                this.echoes = []
                
                this.echoRate = Math.floor(Math.random() * 3) + 1
                this.echoTimer = 0
                this.echoTime = Math.floor(Math.random() * 6) + 5

                this.echoShape = (this.seedX > 0.5 ? this.shapeVar : this.shapeVar2)
            }

            

            newNote(){
                if(this.newNoteTransTime != 0 && this.newNoteTransTimer === 0){
                    console.log("newNote! " + this.droneSource.currentNote)
                    

                    this.newNoteParams.wobbliness = Math.random() * 20 + (100 * (this.droneSource.params.filterLfoLvl.value * this.droneSource.params.fmLfoLvl.value)) + (this.rx /1.3)
                    this.newNoteParams.echoRate = Math.floor(Math.random() * 8)
                    this.newNoteParams.echoTime = Math.floor(Math.random() * 13)
                    this.newNoteParams.reactivity = Math.random() * 0.8 + 0.035
                    this.newNoteParams.seedX = p5.lerp(this.seedX, Math.random(), 0.05)
                    this.newNoteParams.seedY = p5.lerp(this.seedY, Math.random(), 0.05)
                    this.newNoteParams.secondaryColor = p5.color(rndColorVal(), rndColorVal(), rndColorVal(), p5.alpha(this.secondaryColor))
                    this.newNoteParams.color = p5.color(rndColorVal(), rndColorVal(), rndColorVal(), p5.alpha(this.color))

                    if (this.oscType==="fmsawtooth"){
                        this.newNoteParams.smoothness = p5.lerp(this.smoothness, Math.floor(Math.random() * 30 + 1), 0.15)
                        this.newNoteParams.wobbliness = p5.lerp(this.wobbliness, Math.floor(Math.random() * 55 + 7), 0.15)
                    } else if (this.oscType==="fmtriangle"){
                        this.newNoteParams.smoothness = p5.lerp(this.smoothness, Math.floor(Math.random() * 40 + 3), 0.15)
                        this.newNoteParams.wobbliness = p5.lerp(this.wobbliness, Math.floor(Math.random() * 30 + 2), 0.15)
                    } else if (this.oscType==="fmsine"){
                        this.newNoteParams.smoothness = p5.lerp(this.smoothness, Math.floor(Math.random() * 48 + 7), 0.15)
                    } else {
                        this.newNoteParams.smoothness = p5.lerp(this.smoothness, Math.floor(Math.random() * 38 + 7), 0.15)
                    }

                    
                    this.twiddleDepth = Math.random() * 0.25 + 0.05
                    console.log("twiddle depth: " + this.twiddleDepth)

                } 
                if(this.newNoteTransTimer<this.newNoteTransTime){
                    let prog = (this.newNoteTransTimer / this.newNoteTransTime)

                    if(this.twiddleDepth){
                        prog = prog * this.twiddleDepth
                        
                    }
                    this.newNoteTransTimer++

                    this.secondaryColor = p5.lerpColor(this.secondaryColor, this.newNoteParams.secondaryColor, prog)
                    this.color = p5.lerpColor(this.color, this.newNoteParams.color, prog/1.3)

                    this.wobbliness = p5.lerp(this.wobbliness, this.newNoteParams.wobbliness, prog)
                    this.smoothness = p5.lerp(this.smoothness, this.newNoteParams.smoothness, prog)
                    // this.echoRate = Math.floor(p5.lerp(this.echoRate, this.newNoteParams.echoRate, prog))
                    // this.echoTime = Math.floor(p5.lerp(this.echoTime, this.newNoteParams.echoTime, prog))
                    // if(this.echoRate>this.echoTime){
                    //     this.echoTime = this.echoRate
                    // }
                    this.reactivity = p5.lerp(this.reactivity, this.newNoteParams.reactivity, prog)
                    this.seedX = p5.lerp(this.seedX, this.newNoteParams.seedX, prog)
                    this.seedY = p5.lerp(this.seedY, this.newNoteParams.seedY, prog)
                   
                } else {
                    this.newNoteTransTime = 0
                    this.newNoteTransTimer = 0
                }
            }

            display() {
                p5.blendMode(this.blendingMode)
                this.age++
                p5.noStroke();
                
                if(Math.random()>0.998){
                    p5.shuffle(droneNodes, true)
                    console.log("new order")
                }

                let outputLvl = p5.lerp(this.prevLvl, this.droneSource.meter.getValue(), this.reactivity)
                this.outputLvl = outputLvl
                this.prevLvl = outputLvl
                // let freq = this.droneSource.freq.value
                // let filterLfoPos = this.droneSource.filterLfoMeter.getValue()
                // let filterLfoLvl = this.droneSource.params.filterLfoLvl.value
                
                // if(this.pulseInterval<=0){
                //     this.pulseInterval = p5.map(freq, 35, 500, 25, 1)
                //     new Pulse(outputLvl * 5 + 1.3, p5.map(freq, 35, 2300, 30, 5), this.id)
                //     // console.log("pulse interval: " + this.pulseInterval + " " + outputLvl * 4)
                // } else if(this.pulseInterval>0){
                //     this.pulseInterval--
                // }

               // this.rx = (outputLvl * 70 ) * 20. + 20 // outputLvl->width
                
                 this.rx = p5.map(outputLvl, 0., 1., width/(10 + (this.seedX -0.75) * 10), width/(3 + (this.seedY -0.75) * 3.5))
                
                
                    // let maxAlpha =  p5.map(width/(10 + (this.seedX -0.75) * 7, width/11.75, width/4, 250, 200))
                    
                    // if(this.droneSource.envStatus=="sus"){
                        this.color.setAlpha(p5.map(outputLvl, 0., 1., 100, 250))
                    // } else {
                    //     this.color.setAlpha(p5.map(outputLvl, 0., 1., 10, 250))
                    // }
                    
                
                
                

                p5.fill(this.color)
                this.wobbliness =  Math.random() * 20 + (100 * (this.droneSource.params.filterLfoLvl.value * this.droneSource.params.fmLfoLvl.value)) + (this.rx) // /1.3)
                
                this.wobblyCircle(this.wobbliness, this.rx, p5.lerp(0.005, 0.035, outputLvl*this.droneSource.modLvl.value * 1.5), outputLvl)

                
                    this.newNote()
                
                this.prevNote = this.droneSource.currentNote
            }

            echo(){
                if(this.echoTimer>=this.echoRate){
                    this.echoTimer = 0
                    this.echoes.push({ 
                        shape: this.shapeVar,
                        lifeSpan: this.echoTime, 
                        age: 0, 
                        targetMagnitude: 1., 
                        ogColor: p5.color(p5.red(this.color), p5.green(this.color), p5.blue(this.color), p5.map(this.outputLvl, 0., 1., 100, 200)),
                        targetColor: p5.color(p5.red(bgColor), p5.green(bgColor), p5.blue(bgColor), 0), //p5.color(255, 255, 255, 0), 
                        id: this.age 
                    })
                    // console.log("newEch")
                } else {
                    this.echoTimer++
                }
                this.echoes.forEach((e)=>{
                    let progress = e.age / e.lifeSpan
                    e.targetColor.setAlpha(0)
                    if(e.age<e.lifeSpan){
                        e.age++
                        
                        p5.fill(p5.lerpColor(e.ogColor, e.targetColor, progress))

                        // let currentMagnitude = p5.lerp(1., e.targetMagnitude, progress)
                        // let xMax = p5.max(e.shape.map((i)=>i[0]))
                        // let xMin = p5.min(e.shape.map((i)=>i[0]))
                        // let yMax = p5.max(e.shape.map((i)=>i[1]))
                        // let yMin = p5.min(e.shape.map((i)=>i[1]))
                        // let w = xMax - xMin
                        // let h = yMax - yMin
                        // let center = [w/2 + xMin, h/2 + yMin]
                        
                        
                        p5.beginShape()
                            
                            e.shape.forEach((v, ind)=>{
                            //    let magV = v.copy().mult(currentMagnitude).sub(w/2, h/2)
                            //    let magVx = (v.x * currentMagnitude) - w/2
                            //    let magVy = (v.y * currentMagnitude) - h/2
                                if (this.oscType==="fmsine" || this.oscType==="fmcustom"){
                                    p5.curveVertex(v.x, v.y)
                                } else if(this.oscType==="fmtriangle"){
                                    if(Math.floor(this.seedX*10000)%ind===0){
                                        p5.curveVertex(v.x, v.y)
                                        // console.log("curve on a tri!")
                                    } else {
                                        p5.vertex(v.x, v.y)
                                    }
                                }
                                else { 
                                    p5.vertex(v.x, v.y)
                                }
                            })
                        p5.endShape(p5.CLOSE)
                    }
                    else {
                        this.echoes = this.echoes.filter((ec)=>ec.id!=e.id)
                    }
                })
            }

        randomMod = (duration) => {
       
            let voice = this.droneSource
            // let numModVoices = Math.floor(Math.random() * voices.length)
            // let modVoices = INTEGRATE WITH MULTIPLE VOICES LATER
        let param = Object.keys(voice.params)[Math.floor(Math.random() * Object.keys(voice.params).length)]
        //replace with duration range state later (maybe 1 range for long gestures, one for short)
        let val 
        
        if(param==="cutoff"){
            val = Math.floor(Math.random() * 3700. - 800.)
        } else if(param==="res"){
            val = Math.random() * 3. + 0.001
        } /*else if(param==="combTime"){
            val = Math.random() * 0.15
        }*/ /*else if(param==="combDamp"){
            val = Math.floor(Math.random() * 12000. + 100.)
        }*/ else if(param==="fmModLvl"){
            val = Math.random()
        } else if(param==="fmLfoLvl"){
            val = Math.random()
        } else if(param==="fmLfoRate"){
            val = Math.random() * 4.
        } else if(param==="filterLfoLvl"){
            val = Math.random() * 0.8 
        } else if(param==="filterLfoRate"){
            val = Math.random() * 4.
        } else if(param==="tremRate"){
            let fastTrem = Math.floor(Math.random() * 2.)
            let tremRate
            if(fastTrem){
                tremRate = Math.random() * 20. + 2.
            } else {
                tremRate = Math.random() * 3.
            }
            val = tremRate
            // console.log("tremRate! " + tremRate)
        } else if(param==="tremDepth"){
            val = 1.//Math.random()
        } else if(param==="masterTremDepth"){
            val = Math.random()
        } else if(param==="masterTremRate"){
            val = Math.random() * 0.7
        }
        else if(param==="harm"){
            val = harmonicities[Math.floor(Math.random() * harmonicities.length)]
        } else if(param==="filterLfoLfoLvl"){
            val =  Math.random() // (voice.freq /
        } else if(param==="filterLfoLfoRate"){
            val = Math.random() * 4.
        } else if(param==="fmLfoLfoLvl"){
            val = Math.random()
        } else if(param==="fmLfoLfoRate"){
            val = Math.random() * 4.
        } else if(param==="fmLfoDepthLfoLvl"){
            val = Math.random()
        } else if(param==="fmLfoDepthLfoRate"){
            val = Math.random() * 4.
        }
        // } else if(param==="vibDepth"){
        //     val = Math.random() * 0.2
        //     // console.log("vibDepth: " + val)
        // } else if(param==="vibRate"){
        //     val = Math.random() * 5.
        // }
        else if(param==="phaserRate"){
            val = Math.random() * 4.
        } else if(param==="phaserDepth"){
            voice.params[param] = Math.floor(Math.random() * 6.)
            return
        } else if(param==="phaserRes"){
            val = Math.random() * 5. + 0.001
        }  
        else if(param==="allpassCutoff"){
           val = Math.random() * 5000. + 100
           console.log("allpass cutoff! " + val)   
        } else if(param==="allpassRes"){
           val = Math.random() * 5. + 0.001
           console.log("allpass res! " + val)   
        }
        else if(param==="chorusRate"){
            val = Math.random() * 4.
        }
        else if(param==="chorusDepth"){
            voice.params[param] = Math.random()
            return
        }

        else if(param==="delayWet"){
            val = Math.random() * 0.8
        } else if(param==="delayFb"){
            val = Math.random() * 0.5
        }  else if(param==="delayTime"){
            val = Math.random()
        } 
        else {
            return
        }
       console.log("VOICE: " + voice.id + " PARAM: " + param + " TO: " + val + " OVER: " + duration + " secs")
        voice.params[param].linearRampTo(val, duration)
        
        
    }


            wobblyCircle(wobbliness, magnitude, rate, outputLvl){//keep improving
                this.shapeBuild = []
                // let wobbliness =  Math.random() * 20 + (100 * (this.droneSource.params.filterLfoLvl.value * this.droneSource.params.fmLfoLvl.value))
                
                // let cutoff = this.droneSource.params.cutoff.value
                // console.log("osctype & cutoff! " + this.oscType + " " + cutoff)
                
                
                for (let angle = 0; angle < 360; angle += this.smoothness) {
                    let xOff = (p5.noise(this.age * rate, angle * this.seedX)-0.5) * wobbliness
                    let yOff = (p5.noise(this.age * rate, angle * this.seedY)-0.5) * wobbliness
                    let v = Vector.fromAngle(p5.radians(angle-135));
                    v.mult(magnitude);
                    v.add(this.position[0] + xOff, this.position[1] + yOff)
                    this.shapeBuild.push(v);
                }
                  
                this.shapeVar = this.shapeBuild
                
                if(this.echoRate>0 && this.echoTime>0 && (this.droneSource.envStatus!="off")){
                    this.echo()
                }

                p5.push()
                    // instead of scaling x&y based on freq, copy the vector array and mutate those. 
                    // p5.scale(p5.map(this.droneSource.freq.value, 35, 700, 2., 0.25), p5.map(this.droneSource.freq.value, 35, 500, 0.45, 3.0))
                    
                    // p5.rotate(this.rotation)
                    p5.fill(this.color)
                    p5.beginShape()
                    this.shapeVar.forEach((v, ind)=>{
                        if (this.oscType==="fmsine" || this.oscType==="fmcustom"){
                                p5.curveVertex(v.x, v.y)
                        } else if (this.oscType==="fmtriangle"){
                            if(Math.floor(this.seedX*10000)%ind===0 ){
                                p5.curveVertex(v.x, v.y)
                                // console.log("curve on a tri!")
                            } else {
                                p5.vertex(v.x, v.y)
                            }
                        }
                        else {
                                p5.vertex(v.x, v.y)
                        }
                    })
                        
                    p5.endShape(p5.CLOSE)


                    //XTRA WOBBLER!
                    this.blendMode = p5.SOFT_LIGHT
                    this.shapeVar2 = []
                    let xOff1
                    let yOff1
                    let modLvl = this.droneSource.params.fmModLvl.value
                    // console.log("modLvl: " + p5.map(modLvl * outputLvl, 0., 0.5, 50, 255))
                    let color2 = p5.lerpColor(bgColor, this.secondaryColor, p5.constrain(modLvl*1.5, 0., 1.))
                    color2.setAlpha(p5.constrain(p5.map(modLvl * outputLvl, 0., 0.4, 25, 255), 30, 255))
                    p5.fill(color2)
                    
                    p5.beginShape()
                        this.shapeVar.forEach((v, i)=>{
                            if(i%2===0){
                                xOff1 = (p5.noise((this.age-5) * rate * this.seedX * 2 + 0.5, i * 1-this.seedX)-0.5) * wobbliness/1.3
                                yOff1 = (p5.noise((this.age-5) * rate * this.seedY * 2 + 0.5, i * 1-this.seedY)-0.5) * wobbliness/1.2
                                this.shapeVar2.push(v.add(xOff1, yOff1))
                                if (this.oscType==="fmsine" || this.oscType==="fmcustom"){
                                    p5.curveVertex(v.x + xOff1, v.y + yOff1)
                                } else {
                                    p5.vertex(v.x + xOff1, v.y + yOff1)
                                }
                                    
                            }
                            
                        })
                    p5.endShape(p5.CLOSE)

                    
                p5.pop()
                this.position = [p5.constrain(this.position[0], 0, width*0.5), p5.constrain(this.position[1], 0, height*0.5)]
                
                this.left = p5.min(this.shapeVar.concat(this.shapeVar2).map((sv)=>sv.x))
                this.right = p5.max(this.shapeVar.concat(this.shapeVar2).map((sv)=>sv.x))
                this.top = p5.min(this.shapeVar.concat(this.shapeVar2).map((sv)=>sv.y))
                this.bottom = p5.max(this.shapeVar.concat(this.shapeVar2).map((sv)=>sv.y))
                this.width = this.right - this.left
                this.height = this.top - this.bottom
            }
        }

        class Pulse {
            constructor(shape, magnitude, duration, targetColor, droneId) {
                this.shape = shape
                this.drone = droneNodes.find((d)=>d.id===droneId)
                this.magnitude = magnitude
                this.id = this.drone.pulseTally
                this.key = this.id
                this.ogColor = p5.color(p5.red(this.drone.color), p5.green(this.drone.color), p5.blue(this.drone.color), 25)
                // this.ogColor.setAlpha(200)
                this.targetColor = targetColor
                this.targetColor.setAlpha(0)
                this.currentColor = this.ogColor
                // this.drone.pulses.push(this)
                console.log("pulse count! " + this.drone.pulses.length)
                this.lifeSpan = duration * 1.0
                this.age = 0.0
            }
            fadeToWhite(index, rate){
                return p5.lerp(this.ogColor.levels[index], 255, this.progress * rate)
            }
            show() {
                this.age++
                console.log("SHOULD NOT BE TRIGGERING")
                this.progress = this.age/this.lifeSpan
                if(this.drone.pulses.find((p)=>p.id===this.id)){
                    
                    if(this.age<this.lifeSpan){
                        this.currentColor = p5.lerpColor(this.ogColor, this.targetColor, this.progress)
                       
                        // p5.fill(this.currentColor)
                        // p5.beginShape()
                        //     if (this.drone.oscType=="fmsine" || this.drone.oscType=="fmcustom"){
                        //         this.shape.forEach((v)=>{
                        //             let pulseV = p5.createVector(v.x, v.y)
                        //             pulseV.mult(p5.lerp(1, this.magnitude, this.progress))
                        //             p5.curveVertex(v.x, v.y)
                        //         })
                        //     } else {
                        //         this.shape.forEach((v)=>{
                        //             let pulseV = p5.createVector(v.x, v.y)
                        //             pulseV.mult(p5.lerp(1, this.magnitude, this.progress))
                        //             p5.vertex(v.x, v.y)
                        //         })
                        //     }
                                
                        // p5.endShape(p5.CLOSE)

                    
                        
                    } else {
                        this.currentColor.setAlpha(0)
                        this.drone.pulses = this.drone.pulses.filter((p)=>p.id!==this.id)
                        console.log("pulse dead")
                    }
                } 
                
            }
            
        }

        p5.mouseClicked = () => {
            console.log(" clicked!! " + p5.mouseX, p5.mouseY)
            droneNodes.forEach((dn)=>{
                console.log(dn.left, dn.right, dn.top, dn.bottom,)
                if(p5.mouseX>=dn.left && p5.mouseX<=dn.right && p5.mouseY>=dn.top && p5.mouseY<=dn.bottom){
                    if(dn.droneSource.playing===false){
                        console.log("started!")
                        dn.droneSource.setPlaying(true)
                        dn.newNoteTransTime = Math.floor(Math.random() * 40) + 20
                    } else {
                        console.log(dn.id + " twiddled!")
                        dn.newNoteTransTime = Math.floor(Math.random() * 40) + 20
                        let numMods = Math.floor(Math.random() * 10) + 9
                        console.log(numMods + " mods from click!")
                        for (let n = 0 ; n<numMods; n++){
                            dn.randomMod((dn.newNoteTransTime / frameRate) / (Math.random() * 5)+1)
                        }
                        return
                        }
                    

                }
            })
        }

        p5.setup = () => {
            p5.frameRate(frameRate)
            if(renderNum===1){
                for(let i=0; i<drones.length; i++){
                    let newNode = new DroneNode((Math.random() * width/5) + width/2, (Math.random() * height/5) + height/2, Math.random()*20+20, i)
                    droneNodes.push(newNode)
                }  
                console.log("canvas created")
                return p5.createCanvas(width, height)
            } else if(renderNum<2){ 
                setRenderNum(renderNum + 1)
            }
        };

        p5.draw = () => {
            // p5.blendMode(p5.SUBTRACT)
            let masterLvl
            let fadeColor = bgColor
            p5.background(bgColor);
            droneNodes.forEach((d)=>{
                d.display()
            masterLvl = d.droneSource.masterMeter.getValue()
            })
            fadeColor.setAlpha(p5.map(masterLvl, 0., 0.2, 150, 0))
            p5.fill(fadeColor)
            p5.rect(0, 0, width, height)

            // p5.keyPressed = () => {
            //     if (p5.keyCode === p5.LEFT_ARROW) {
            //         // droneNodes.forEach((d)=>{
            //         //     d.pulses.push(new Pulse(Math.random()*4+1, Math.floor(Math.random() * 40 + 5), d.id))
            //         // })
            //         droneNodes.forEach((d)=>{d.wobblyCircle()})
            //     }
            // }
            
        };
    }
            return (
                <div>
                    {<ReactP5Wrapper key={renderNum} sketch={sketch} />}
                </div>
            )
    }
export default React.memo(Visual)

