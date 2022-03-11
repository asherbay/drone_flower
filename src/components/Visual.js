import React, {useEffect, useState, useContext, useRef}  from "react";
import { ReactP5Wrapper } from "react-p5-wrapper";
import * as Tone from 'tone'
import {DroneContext} from '../providers/DroneProvider'
import {Vector} from "p5"
import ambience from '../audio/ambience.mp3'
import Menu, {Item} from './Menu'
import scale from './Scale'
import styled from 'styled-components'
import {isMobile} from 'react-device-detect'

//since pulse as a class hasn't been working, try pulses as an array of objects {pulseLifespan, pulseAge, magnitude, target color, id}
const Visual = () =>{
    // const {getDrone, drones, setDrones} = useContext(DroneContext)
    const {getDrone, drones, newZone} = useContext(DroneContext)
    // const [loaded, setLoaded] = useState(false)
    // const [canvasCreated, setCanvasCreated] = useState(false)
    // const [canvas, setCanvas] = useState(null)
    const harmonicities = [1., 1., 1., 1., 1.25, 1.3333, 1.5, 2., 2., 2., 4., 0.666, 3., 2.5, 0.5, 0.5, 0.75]
    
    const [volCtl, setVolCtl] = useState(30)
    const [renderNum, setRenderNum] = useState(0)
    // const [homogeneity, setHomogeneity] = useState(0)
    const infoText = `Drone Flower is an audiovisual experience generator. Watch and listen as the shapes and sounds evolve endlessly. Interact by clicking shapes or changing parameters in the 🎛️ menu.`
    const credits = `Made by Asher Bay with Tone.js (sound) and P5.js (visuals).`

    let droneNodes = []
    let volumeSlider
    let player1 
    let initTint = 20

    let volVal = useRef(75)
    let depthVal = useRef(25)
    let rateVal = useRef(25)
    useEffect(()=>{
        console.log("wrapper returned")
        // setLoaded(true)
    }, [])
   
    // let volSlider
    // let rateSlider
    // let depthSlider

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
    
    const rndColorVal = () => {return Math.floor(Math.random()*256)}
    let bgHue = [rndColorVal(), rndColorVal(), rndColorVal()]

    const sketch = (p5) =>{
        
        const blendingModes = [p5.BLEND, p5.BLEND, p5.HARD_LIGHT,] //p5.LIGHTEST, p5.HARD_LIGHT] //p5.DIFFERENCE, p5.EXCLUSION,]// p5.HARD_LIGHT,]// p5.BURN,]
        const echoBlendingModes = [p5.BLEND, p5.SOFT_LIGHT, p5.SOFT_LIGHT, p5.HARD_LIGHT, p5.BURN,]

        
        let width = p5.windowWidth
        let height = p5.windowHeight
        let bgColor = p5.color(bgHue[0], bgHue[1], bgHue[2], 255)    
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
                
                this.modInterval = Math.floor(Math.random() * frameRate * 2.5 + frameRate * 1.2)
                this.ogModInterval = this.modInterval
                

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
                this.echoBlendingMode = echoBlendingModes[Math.floor(Math.random() * echoBlendingModes.length)]
                if(this.echoBlendingMode===p5.BURN){
                    console.log("BURN MODE!")
                }

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
                        prog = prog * this.twiddleDepth * p5.map(initTint, 0, 20, 1., 0.1)
                        
                    }
                    this.newNoteTransTimer++

                    this.secondaryColor = p5.lerpColor(this.secondaryColor, this.newNoteParams.secondaryColor, prog)
                    this.color = p5.lerpColor(this.color, this.newNoteParams.color, prog/1.3)

                    this.wobbliness = p5.lerp(this.wobbliness, this.newNoteParams.wobbliness, prog * p5.map(this.width, p5.windowWidth/11, p5.windowWidth, 1, 0.05))
                    this.smoothness = p5.lerp(this.smoothness, this.newNoteParams.smoothness, prog * p5.map(this.width, p5.windowWidth/11, p5.windowWidth, 1, 0.05))
                    // this.echoRate = Math.floor(p5.lerp(this.echoRate, this.newNoteParams.echoRate, prog))
                    // this.echoTime = Math.floor(p5.lerp(this.echoTime, this.newNoteParams.echoTime, prog))
                    // if(this.echoRate>this.echoTime){
                    //     this.echoTime = this.echoRate
                    // }
                    this.reactivity = p5.lerp(this.reactivity, this.newNoteParams.reactivity, prog)
                    this.seedX = p5.lerp(this.seedX, this.newNoteParams.seedX, prog * p5.map(this.width, p5.windowWidth/11, p5.windowWidth, 1, 0.05))
                    this.seedY = p5.lerp(this.seedY, this.newNoteParams.seedY, prog * p5.map(this.width, p5.windowWidth/11, p5.windowWidth, 1, 0.05))
                   
                } else {
                    this.newNoteTransTime = 0
                    this.newNoteTransTimer = 0
                }
            }

            display() {
                p5.blendMode(this.blendingMode)
                this.age++
                if(this.age%parseInt(this.modInterval)===0){
                    let dur = Math.random() * p5.map(rateSlider.value(), 0, 100, 8, 1.5)
                    
                    this.randomMod(dur)
                    console.log(`${this.id} mod triggered over ${dur} secs`)
                } else if (Math.random()*60<(rateSlider.value()/100)){ 
                    this.droneSource.voiceStep(this.droneSource, depthSlider.value()/100)
                }
                p5.noStroke();

                

                let outputLvl = p5.lerp(this.prevLvl, this.droneSource.meter.getValue(), this.reactivity * p5.map(rateSlider.value(), 0, 100, 0.7, 1.9))
                this.outputLvl = outputLvl
                this.prevLvl = outputLvl
                // let freq = this.droneSource.freq.value
                // let filterLfoPos = this.droneSource.filterLfoMeter.getValue()
                // let filterLfoLvl = this.droneSource.params.filterLfoLvl.value
                
                
                
                this.rx = p5.map(outputLvl, 0., 1., p5.windowWidth/(8 + (this.seedX -0.75) * 8), p5.windowWidth/(3 + (this.seedY -0.75) * 3.5))
                
                
                    // let maxAlpha =  p5.map(width/(10 + (this.seedX -0.75) * 7, width/11.75, width/4, 250, 200))
                    
                    // if(this.droneSource.envStatus=="sus"){
                        this.color.setAlpha(p5.map(outputLvl, 0., 1., 100, 250))
                    // } else {
                    //     this.color.setAlpha(p5.map(outputLvl, 0., 1., 10, 250))
                    // }
                    
                
                
                

                p5.fill(this.color)
                this.wobbliness = 10 + (100 * (this.droneSource.params.filterLfoLvl.value * this.droneSource.params.fmLfoLvl.value)) + (this.rx) // /1.3)
                

                // console.log("RATE MODIFIER " + outputLvl * (rateSlider.value()/100) )
                this.wobblyCircle(this.wobbliness * p5.map(depthSlider.value(), 0, 100, 0.45, 2.5), this.rx * p5.map(initTint, 0, 20, 1., 0.6), p5.map(outputLvl * 0.8 * (rateSlider.value()/(100 + this.wobbliness * p5.map(depthSlider.value(), 0, 100, 0.45, 2.5))) * (p5.map(this.width, p5.windowWidth/11, p5.windowWidth, 1.4, 0.002)), 0, 1, 0.005, 0.035 ) * p5.map(initTint, 0, 20, 1., 0.6), outputLvl)

                
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
        else if(param==="chorusFb"){
            val = Math.random()
            console.log("chorusFb gonna be " + val)
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

        // val = val * p5.map(depthSlider.value(), 0, 100, )
    //    console.log("VOICE: " + voice.id + " PARAM: " + param + " TO: " + val + " OVER: " + duration + " secs")
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
                    this.blendMode = this.echoBlendingMode
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
                this.position = [p5.constrain(this.position[0], 0, p5.windowWidth*0.5), p5.constrain(this.position[1], 0, p5.windowHeight*0.5)]
                
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
            // console.log(" clicked!! " + p5.mouseX, p5.mouseY)
            uiPopups.forEach((pu)=> {
                // console.log("hover attr: " + typeof pu.attribute("hover"))
                if(pu.attribute("hover")=="false"){
                    // console.log("hide it!")
                    pu.hide()
                }
            })

            //if(masterLvl<=0.01 && player1.state!== "started"){

            if(initTint===20 && (player1 && player1.state==="stopped")){
                console.log("ambience triggered!")
                player1.fadeIn = 4
                p5.triggerAmbience()
            }
                

            if(Math.random()>0.83){
                p5.shuffle(droneNodes, true)
                console.log("new order")
            }


            if(droneNodes.length>0 && droneNodes[0].droneSource.playing===false){
                // FIRST CLICK
                
                droneNodes[0].droneSource.setPlaying(true)
                // droneNodes[0].droneSource.synth.triggerAttack(dn.droneSource.synth.oscillator.frequency.value)
                droneNodes[0].newNoteTransTime = Math.floor(Math.random() * 40) + 20
            }

            droneNodes.forEach((dn)=>{
                // console.log(dn.left, dn.right, dn.top, dn.bottom,)
                if(p5.mouseX>=dn.left && p5.mouseX<=dn.right && p5.mouseY>=dn.top && p5.mouseY<=dn.bottom){
                    if(dn.droneSource.playing===false){
                        // FIRST CLICK
                        
                        dn.droneSource.setPlaying(true)
                        dn.droneSource.synth.triggerAttack(dn.droneSource.synth.oscillator.frequency.value)
                        dn.newNoteTransTime = Math.floor(Math.random() * 40) + 20
                    } 
                    else {
                        console.log(dn.id + " twiddled!")
                        dn.newNoteTransTime = Math.floor(Math.random() * 40) + 20
                        let numMods = Math.floor(Math.random() * 13) + 7
                        console.log(numMods + " mods from click!")
                        for (let n = 0 ; n<numMods; n++){
                            dn.randomMod((dn.newNoteTransTime / frameRate) / (Math.random() * 5)+1)
                        }   
                        return
                    }
                    

                }
            })
            
            
        }

        let buttonSize
        let popupFontSize
        let smallestDimension
        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
            smallestDimension = Math.min(p5.windowWidth, p5.windowHeight)
            buttonSize = p5.map(smallestDimension, 500, 1500, 23, 40)
            buttonSpacing = p5.windowWidth * 0.02 + buttonSize

            popupFontSize = p5.map(smallestDimension, 500, 1500, 15, 35)
            buttons.forEach((b, i)=>{
                b.style('font-size', buttonSize + "pt")
                b.position(buttonSpacing * (i + 1) + buttonOffset)
            })
            uiPopups.forEach((pu, i)=>{
                pu.style('font-size', popupFontSize + "pt")
                pu.position(buttons[2-i].position().x)
                
                // pu.position(pu.originElement.position().x, pu.originElement.position().y + 50)
            })
            
            droneNodes.forEach((dn)=>{
                dn.position = [p5.windowWidth/2, p5.windowHeight/2]
            })
        }
        
        p5.uiButton = (xPos, text,)=>{
            let button = p5.createP(text)
            smallestDimension = Math.min(p5.windowWidth, p5.windowHeight)
            buttonSize = p5.map(smallestDimension, 500, 1500, 23, 40)

            button.style('text-align', 'justify')
            button.style('color', 'rgba(255, 255, 255, 255)')
            // button.style('background-color', 'rgba(255, 255, 255, 0)')
            

            button.position(xPos, 5)
            
            // button.size(size, size)
            button.style('font-size', buttonSize + "pt")
            button.style('padding-right', "8px")
            button.style('padding-left', "8px")
            button.style('border-radius', "8px")

            button.attribute('ogSize', buttonSize)
            button.attribute('maxScale', 1.3)
            button.attribute('status', 'normal')
            button.attribute('motionTimer', 0)
            button.attribute('motionTime', 3)
            button.mouseOver(()=>{
                button.style("background-color", "rgba(255, 255, 255, 0.)")
                
                button.attribute('status', 'focus')
                button.attribute('motionTimer', 0)
                document.body.style.cursor = "default"
            })
            button.mouseOut(()=>{
                button.style("background-color", "transparent")
                button.attribute('status', 'defocus')
                button.attribute('motionTimer', 0)
                document.body.style.cursor = "auto"
            })
            return button 
        }

        let uiPopups = []
        let popupColor = p5.color(255, 255, 255, 0)
        p5.uiPopup = (originElement, text) => {
            let popup = p5.createP(text)
            
            let textColor  = p5.color(0, 0, 0, 0)
            popupFontSize = p5.map(p5.windowHeight, 500, 1500, 15, 35)


            popup.position(originElement.position().x + 3, originElement.position().y + buttonSize/2 + 5)
            popup.class("speech")
            popup.style("font-size", popupFontSize + "pt")
            popup.style("width", "20vw")
            popup.style("padding", "17px")
            popup.style("background-color", popupColor)
            popup.style("color", textColor)
            popup.style("text-align", "left")
            popup.style("border-radius", "2%")
            popup.style("display", "flex")
            popup.style("align-items", "center")
            popup.attribute("originElement", originElement)
            popup.attribute("hover", false)
            originElement.mousePressed(()=>{
                
                popup.show()
            })
            
            popup.mouseOver(()=>{
                popup.attribute("hover", false)

            })
             popup.mouseOut(()=>{
                popup.attribute("hover", false)

            })


            originElement.mouseOver(()=>{
                popup.attribute("hover", false)
                document.body.style.cursor = "default"
                originElement.style("background-color", "rgba(255, 255, 255, 0.)")
                // console.log("hovering! " + popup.attribute("hover"))
            })
            originElement.mouseOut(()=>{
                popup.attribute("hover", false)
                document.body.style.cursor = "auto"
                originElement.style("background-color", "transparent")
                // console.log("not hovering! " + popup.attribute("hover"))
            })
            popup.hide()
            
            uiPopups.push(popup)
            return popup
        }

        p5.controlParam = (container, minText, maxText) => {
            let div = p5.createDiv()
            div.style('display', 'flex')
            
            let slider = p5.createSlider(0., 100.)
            slider.style('width', '16vw')
            slider.style('transform', 'scale(1, 1.3)')
            
            
            
            let maxLabel = p5.createP(maxText)
            let minLabel = p5.createP(minText)
            div.child(minLabel)
            div.child(slider)
            div.child(maxLabel)
            
            container.child(div)
            // div.style('position', 'relative')
            // div.position(container.style('width')/2, 50, 'inherit')
            // div.center('horizontal')
            return slider
        }

        let masterLvl
        //pre-declaring buttons for bigger scope
        let reset
        let controls
        let info 
        let buttons = []

        let infoBubble
        let controlMenu

        let volSlider
        let rateSlider
        let depthSlider
        let buttonSpacing = p5.windowWidth * 0.02 + buttonSize
        let buttonOffset = -35
        p5.setup = () => {
            p5.frameRate(frameRate)
            
            smallestDimension = Math.min(p5.windowWidth, p5.windowHeight)
            buttonSize = p5.map(smallestDimension, 500, 1500, 23, 40)
            buttonSpacing = p5.windowWidth * 0.02 + buttonSize
             
            console.log("buttonSpacing: " + buttonSize)
            reset = p5.uiButton(buttonSpacing + buttonOffset * 10, '🔄')
            controls = p5.uiButton(buttonSpacing * 2 + buttonOffset, '🎛️')
            info = p5.uiButton(buttonSpacing * 3 + buttonOffset, 'ℹ️')
            buttons.push(reset, controls, info)
            
            infoBubble = p5.uiPopup(info, infoText)
            infoBubble.style('width', '45vw')
            infoBubble.style('margin-right', '-30px')
            infoBubble.style('margin-bottom', '-30px')
            infoBubble.child(p5.createP(credits))


            controlMenu = p5.uiPopup(controls, "")
            

            volSlider = p5.controlParam(controlMenu, "🔇", "🔊")
            depthSlider = p5.controlParam(controlMenu, "💧", "🌊")
            rateSlider = p5.controlParam(controlMenu, "☁️", "💨")
            depthSlider.value(25)
            rateSlider.value(25)

            
                
            
            
            reset.mousePressed(newZone)
            if(renderNum===1){
                for(let i=0; i<drones.length; i++){
                    
                    let newNode = new DroneNode((Math.random() * p5.windowWidth/5) + p5.windowWidth/2, (Math.random() * p5.windowHeight/5) + p5.windowHeight/2, Math.random()*20+20, i)
                    droneNodes.push(newNode)
                }  

                player1 = new Tone.Player(ambience, ()=>{console.log("LOADED")}).toDestination()
                player1.fadeIn = 4
                player1.fadeOut = 4
                player1.playbackRate = p5.map(Math.random(), 0, 1, 0.6, 1.)
                player1.volume.value = p5.map(player1.playbackRate, 0.4, 1, 10, 0)
                console.log("canvas created")
                return p5.createCanvas(p5.windowWidth, p5.windowHeight)
            } else if(renderNum<2){ 
                setRenderNum(renderNum + 1)
            }

           
                
           
            
            
        };

        p5.setRateParams = (val) => {
            if(droneNodes.length>0){
                droneNodes.forEach((dn)=>{
                    dn.droneSource.rateControlParams.forEach((param)=>{
                        if(param.type==="signal"){
                            param.param.linearRampTo(p5.map(val, 0, 100, param.min, param.max), 0.25)
                        }
                    })
                })
            }
        }

        p5.setDepthParams = (val) => {
            if(droneNodes.length>0){
                droneNodes.forEach((dn)=>{
                    dn.modInterval = p5.map(val, 0, 100, dn.ogModInterval * 4, dn.ogModInterval / 2)
                    
                    dn.droneSource.depthControlParams.forEach((param)=>{
                        let targetVal = p5.map(val, 0, 100, param.min, param.max)
                        if(param.type==="signal"){
                            console.log()
                            param.param.linearRampTo(targetVal, 0.25)
                        } else {
                            param.param = targetVal
                        }
                    })
                })
            }
        }

        p5.triggerAmbience = () => {
            if(player1.loaded){
                player1.fadeIn = 4
                // player1.onstop(()=>{
                //     initTint-=1
                //     console.log("tint fadeout initiated!")
                // })
                player1.start("+0.1", p5.map(Math.random(), 0, 1, 0, player1.buffer.duration*0.6))
            }
            
        }

        let buttonColor = p5.color(255, 255, 255, 0)
        p5.draw = () => {
            

            p5.blendMode(p5.BLEND)
            if(volSlider){
                volSlider.value(volVal.current)
                setVolume(volSlider.value()/100)
            }
            if(rateSlider){
                rateSlider.value(rateVal.current)
                p5.setRateParams(rateSlider.value())
            }
            if(depthSlider){
                depthSlider.value(depthVal.current)
                p5.setDepthParams(depthSlider.value())
            }
            
            let fadeColor = bgColor
           
            let buttonTextColor = buttonColor
            let dist = p5.dist(p5.mouseX, p5.mouseY, 0, 0)
            if(uiPopups.every((pu)=>{
                    return pu.style('display')==='none'
                })){
                    buttonColor.setAlpha(p5.map(dist, 0, Math.sqrt(Math.pow(p5.windowWidth/2, 2) + Math.pow(p5.windowHeight/2, 2)), 0, 0, true))
                }


            p5.background(bgColor);
            
            let currentSize
            buttons.forEach((b)=>{
                let timer = parseInt(b.attribute('motionTimer'))
                let time = parseInt(b.attribute('motionTime'))
                let ogSize = parseInt(b.attribute('ogSize'))
                let maxScale = parseFloat(b.attribute('maxScale'))
                if(b.attribute('status')==="focus"){
                    
                    if(timer<time){
                        currentSize = p5.map(timer, 0, time, ogSize, ogSize*maxScale)
                        // b.style("font-size", currentSize+"pt")
                        b.attribute('motionTimer', timer+1)
                        console.log(maxScale)
                    } 
                } else if(b.attribute('status')==="defocus"){
                    if(timer<time){
                  
                    } else {
                        
                        b.attribute('status', 'normal')
                        // b.attribute('motionTimer', 0)
                    }
                }
                buttonTextColor.setAlpha(p5.alpha(buttonColor))
                b.style('color', buttonColor.toString())
                // b.style('background-color', buttonColor.toString())
            })  

            droneNodes.forEach((d, i)=>{
                if(i===0 && d.age%3===0){
                    masterLvl = d.droneSource.masterMeter.getValue()
                    
                    if(masterLvl>=0.001 && player1.state==="started"){
                        player1.stop("+0.3")
                        initTint-=1
                        console.log("tint fadeout initiated!")
                        console.log("ambience stopped")
                    }
                }
                d.display()
            })
            

            
            
            fadeColor.setAlpha(p5.map(masterLvl, 0., 0.1, 110, 0) + p5.map(initTint, 0, 20, 0, 70))
            p5.fill(fadeColor)
            p5.rect(0, 0, p5.windowWidth, p5.windowHeight)

            if(initTint<20 && initTint>0){ // initTint countdown starts when it becomes < 20, which is triggered by ambience stopping
                initTint-=1

            } 
        
        
        };
    }

    const setVolume = (val) => {
        if(droneNodes.length>0){
            droneNodes[0].droneSource.outputGain.gain.linearRampTo(val, 0.15)
        }
    }

    const setRateParams = (val) => {
        rateValue = val
        if(droneNodes.length>0){
            droneNodes.forEach((dn)=>{
                dn.droneSource.rateControlParams.forEach((param)=>{
                    if(param.type==="signal"){
                        param.param.linearRampTo(scale(val, 0, 100, param.min, param.max), 0.25)
                    }
                })
            })
        }
    }

    const setDepthParams = (val) => {
        depthValue = val
        console.log("DEPTH SET TO " + val)
            if(droneNodes.length>0){
                droneNodes.forEach((dn)=>{
                    dn.modInterval = scale(val, 0, 100, dn.ogModInterval * 4, dn.ogModInterval / 2)
                    
                    dn.droneSource.depthControlParams.forEach((param)=>{
                        let targetVal = scale(val, 0, 100, param.min, param.max)
                        if(param.type==="signal"){
                            console.log()
                            param.param.linearRampTo(targetVal, 0.25)
                        } else {
                            param.param = targetVal
                        }
                    })
                })
            }
        }
    

    const blendParams = () => {
        let blendTime = 3.0 //seconds since it's an audio action
        
        let avgParams = {}
       
        droneNodes.forEach((dn)=>{
            Object.keys(dn.droneSource.params).forEach((param)=>{
                if(!avgParams[param]){
                    avgParams[param] = []
                }
                if(dn.droneSource.params[param].name){
                    avgParams[param].push(dn.droneSource.params[param])
                }
                // else {
                //     avgParams[param].push(dn.droneSource.params[param])
                // }
             })
        })

        Object.keys(avgParams).forEach((paramArray)=>{
            let avg = paramArray.reduce((total, current)=>{
                return total + current.value
            })/paramArray.length
            paramArray.forEach((p)=>{
                p.linearRampTo(avg, blendTime)
            })
        })
        
    }

    const scatterParams = () => {
        let scatterTime = 3.0
        droneNodes.forEach((dn)=> {
            for (let n=0; n<25; n++){
                dn.randomMod(scatterTime)
            }
            
        })
    }

    const setParams = (e) => {
        // e.preventDefault()
        console.log("PARAM EVENT: ", e)
        let paramName = e.target.name
        setUiParams({...uiParams, paramName: e.target.value})
    }

    const getVal = (val) => {
        return val.current
    }
    

    return (
        <div>
            
            {<ReactP5Wrapper key={renderNum} sketch={sketch} />}
            <Menu color={bgHue} itemFontSize={(isMobile ? 12 : 25)+"pt"} contentFontSize={(isMobile ? 8 : 16)+"pt"}>
                <Item name="🔄" onClick={newZone}/>
                <Item name="🎛️">
                    <CtlParam><p>🔇</p><input type="range" name="vol" defaultValue={(volVal.current)} onChange={(e)=>{volVal.current = e.target.value}}/><p>🔊</p></CtlParam>
                    <CtlParam><p>💧</p><input type="range" name="depth" defaultValue={depthVal.current} onChange={(e)=>{depthVal.current = e.target.value}}/><p>🌊</p></CtlParam>
                    <CtlParam><p>☁️</p><input type="range" name="rate" defaultValue={rateVal.current} onChange={(e)=>{rateVal.current = e.target.value}}/><p>💨</p></CtlParam>
                </Item>
                <Item name="ℹ️">
                    <p style={{width: "35vw", textAlign: "left"}}>Drone Flower is an audiovisual experience generator. Watch and listen as the shapes and sounds evolve endlessly. Interact by clicking shapes or changing parameters in the 🎛️ menu.<br/> <br/> Made by Asher Bay with Tone.js (sound) and P5.js (visuals).</p>
                </Item>
            </Menu>
        </div>
    )
}
export default React.memo(Visual)

const CtlParam = styled.div`
    display: flex;
    gap: 10px;
    line-height: 5px;
`



// volSlider = p5.controlParam(controlMenu, "🔇", "🔊")
// depthSlider = p5.controlParam(controlMenu, "💧", "🌊")
// rateSlider = p5.controlParam(controlMenu, "☁️", "💨")