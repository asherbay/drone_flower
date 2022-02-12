import * as Tone from 'tone'
import React, {useState, useEffect, useContext} from 'react'

import {DroneContext} from '../providers/DroneProvider'
// import Visual from './Visual'
/*TO ADD:
    - chord options:
        - behavior when numvoices exceeds notes in chord (repeat notes, in either same or next octave up
        - 
    - would it be possible to make a slider that gradually sets each param to the average of all the other voice's corresponding params
    - maybe need to connect lfo to obnoxious lfo's depth too. not just rate. of course
    )

fmLfoLfoLvl: fmLfoLfo.amplitude,
        fmLfoLfoRate: fmLfoLfo.frequency,
        fmLfoDepthLfoLvl: fmLfoDepthLfoLvl.amplitude,
        fmLfoDepthLfoRate
*/
const Ensemble = () => {
    const drones = useContext(DroneContext)
    const [numVoices, setNumVoices] = useState(0)
    const [voices, setVoices] = useState([])
    const [playing, setPlaying] = useState(false)
    const [chord, setChord] = useState([])
    const chords = [
        ['G2', 'B2', 'C3', 'F#3'],
        ['E2', 'B2', 'C#3', 'F#3'],
        ['A2', 'E3', 'B3'],
        ['D3', 'E3',],
        ['D3', 'F#3', 'G#3',],
        ['G3', 'Bb3', 'E4',],
        ['A3', 'Bb3', 'C4',],
        ['F2', 'F3', 'F4',],
        ['F2', 'Bb2', 'Eb3',],
    ]
    const harmonicities = [1., 1., 1., 1., 1.25, 1.3333, 1.5, 2., 2., 2., 4., 0.666, 3., 2.5, 0.5, 0.5, 0.75]
    const [modLoopId, setModLoopId] = useState(null)
    // const [chordLoopId, setChordLoopId] = useState(null)
    
    // let modLoop
    
    useEffect(()=>{
        resetContext()
        console.log("ensemble mounted")
        
        // console.log("lookahead " + Tone.context.lookAhead)
    }, [])

    useEffect(()=>{
        console.log("useEffect playing " + playing)
        if(playing){resetContext()}
        voices.forEach((v)=>v.playing = playing)
        
        toggleVoices()
    }, [playing])   

    useEffect(()=>{
        console.log("useEffect voices " + voices.length)
        if(voices.length===0){
            setNumVoices(Math.floor(Math.random() * 3 + 2))
        } else {
            drones.setDrones(voices)
        }

        
       
    }, [voices])  

    useEffect(()=>{
        // console.log(chord)
            if(voices.length>0){
                voices.forEach((v)=>{
                    let freq = Tone.Frequency(chord[voices.indexOf(v)]).valueOf()
                    let duration = Math.random() * 4. + 0.5
                    let delay = Math.random() * 3. + 0.5

                    let glide = (Math.random()<0.00)
                    // console.log("glide? " + duration)
                    if(glide){
                        v.freq.exponentialRampTo(freq, duration, "+" + delay)
                        v.currentNote = freq
                    } else {
                        if(v.synth.envelope.value>0){
                            v.synth.triggerRelease("+" + delay/1.5)
                            console.log("releasd!")
                            
                            if(v.envStatusTimeout){
                                clearTimeout(v.envStatusTimeout)
                            }
                            
                                v.envStatus = "rel"
                                console.log(v.id + " rel!")
                                
                    
                            
                            
                        }
                        
                        v.freq.exponentialRampTo(freq, duration/2, "+" + v.synth.envelope.release)
                        // console.log("ATK TIME: " + "+" + (duration + delay))
                        
                        // console.log("master vol on attack: " + v.masterMeter.getValue())
                        // if(v.meter.getValue()<=0.2){
                        //     v.synth.triggerAttack(freq) 
                        //     console.log("first one!") //FIX THIS SO IT STARTS INSTANTLY
                        // }
                        // else { 
                        //     console.log("normal attack")
                            v.synth.envelope.cancel("+" + (duration + delay*0.9))
                            // v.synth.triggerAttack(freq, "+" + (duration + delay)) 
                            v.synth.triggerAttack(freq, "+" + (duration + delay)) 
                        // }

                        // if(v.envStatusTimeout){
                        //     clearTimeout(v.envStatusTimeout)
                        // }

                        // v.envStatusTimeout = setTimeout(()=>{ 
                        //     v.envStatus = "atk"
                        //     // console.log(v.id + " atk!")
                        // }, (duration + delay)*1000)
                        
                        // // console.log(v.id + " atk!")
                        
                        // v.envStatusTimeout = setTimeout(()=>{ 
                        //     v.envStatus = "sus"
                        //     // console.log(v.id + " sus!")
                        // }, (duration + delay + v.synth.envelope.attack)*1000)

                        v.currentNote = freq
                        
                        
                    }
                    
                })
            }
    }, [chord])

    useEffect(()=>{
        // if(playing){
        //     clearInterval(modLoopId)
        // }
        setPlaying(false)
        console.log("useEffect numVoices " + numVoices)
        clearNodes()
        resetContext()
        generateVoices()
    }, [numVoices])

    const resetContext = () => {
        Tone.getContext().dispose()
        Tone.setContext(new AudioContext({ sampleRate: 24000, lookAhead: 3.0}))
        Tone.start()
    }
    const newEnsemble = () => {
        // clearNodes()
        resetContext()
        setPlaying(false)
        setNumVoices(Math.floor(Math.random() * 3 + 2))
        // window.location.reload(true)
        console.log("new ens!")
    }

    const randomMod = (voice=null, param=null, duration=null) => {
        if(voices.length>0 && playing){
            if(!voice){
                voice = voices[Math.floor(Math.random() * voices.length)]
            }
            // let numModVoices = Math.floor(Math.random() * voices.length)
            // let modVoices = INTEGRATE WITH MULTIPLE VOICES LATER
            if(!param){
                param = Object.keys(voice.params)[Math.floor(Math.random() * Object.keys(voice.params).length)]
            }
            if(!duration){
                duration = Math.random() * 4. + 0.5 //replace with duration range state later (maybe 1 range for long gestures, one for short)
            }
       
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
            val = Math.random() * 6.
        } else if(param==="phaserDepth"){
            voice.params[param] = Math.floor(Math.random() * 6.)
            return
        } else if(param==="phaserRes"){
            val = Math.random() * 5. + 0.001
        }  

        else if(param==="chorusRate"){
            val = Math.random() * 5.
        }
        else if(param==="chorusDepth"){
            voice.params[param] = Math.random()
            return
        }

        else if(param==="allpassCutoff"){
           val = Math.random() * 5000. + 100
           console.log("allpass cutoff! " + val)   
        } else if(param==="allpassRes"){
           val = Math.random() * 5. + 0.001
           console.log("allpass res! " + val)   
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
        // console.log("VOICE: " + voice.id + " PARAM: " + param + " TO: " + val + " OVER: " + duration + " secs")
        voice.params[param].linearRampTo(val, duration)
        }
        
    }

    

    const clearNodes = () => {
        if(voices.length>0){
            voices.forEach((v)=>{
                [v.synth, v.filter, v.trem].forEach((node)=>{
                    node.dispose()
                })
            })
        } //disconnect previous nodes, if an
        Tone.context.dispose()
        // Tone.dispose()
    }

    const generateVoices = () => {
        let masterMeter = new Tone.Meter({normalRange: true}).toDestination()
        let verb = new Tone.Reverb({
            decay: Math.random() * 5.5,
            wet: Math.random() * 0.6
        }).connect(masterMeter)
        console.log("WET " + verb.wet.value)
        let hipass = new Tone.Filter({
                type: "highpass",
                Q: 0.2, 
                rolloff: -12,
                frequency: 350.0
            }).connect(verb)
        let allpass = new Tone.Filter({
                type: "allpass",
                Q: Math.random() * 4. + 0.001,
                rolloff: -12,
                frequency: Math.random() * 5000. + 100
            }).connect(hipass)
        // let comb = new Tone.LowpassCombFilter({
        //     delayTime: 0.1,
        //     resonance: 0.6,//Math.random() * 0.9,
        //     dampening: 4000// Math.floor(Math.random() * 17000. + 100.)
        // }).connect(hipass)

        let masterTrem = new Tone.Tremolo(Math.random()*0.7, Math.random()).connect(allpass)//hipass)
        masterTrem.wet.value = 0.9
        let mono = new Tone.StereoWidener(0.5).connect(masterTrem)
        let phaser = new Tone.Phaser({
                frequency: Math.random() * 4.,
                octaves: Math.floor(Math.random() * 6),
                baseFrequency: Math.random() * 5000. + 100,
                Q: Math.random() * 6. + 0.001,
                wet: 0.7
            }).connect(mono)
        let chorus = new Tone.Chorus(Math.random() * 4., Math.random() * 100., Math.random()).connect(phaser)
        let outputGain = new Tone.Gain(0.75).connect(chorus)
        
        let newVoices = []
         for (let i=0; i<numVoices; i++){
            // let chorus = new Tone.Chorus(Math.random() * 4., Math.random() * 10., Math.random()).connect(outputGain)
            // 
            let meter = new Tone.Meter({normalRange: true}).connect(outputGain)
            let fastTrem = Math.floor(Math.random() * 2)
            let tremRate
            if(fastTrem){
                tremRate = Math.random() * 10. + 2.
            } else {
                tremRate = Math.random() * 3.
            }
            let trem = new Tone.Tremolo(tremRate, Math.random()).connect(meter)//.connect(mono)
            let del = new Tone.FeedbackDelay({
                delayTime: Math.random(), 
                feedback: Math.random() * 0.79,
                wet: Math.random() * 0.59
            }).connect(trem)
            
            
            // let phaser = new Tone.Phaser({
            //     frequency: Math.random() * 4.,
            //     octaves: Math.floor(Math.random() * 6),
            //     baseFrequency: Math.random() * 5000. + 100,
            //     Q: Math.random() * 4. + 0.001
            // }).connect(del)
            let filter = new Tone.Filter({
                type: "bandpass",
                Q: Math.random() * 3. + 0.001, 
                rolloff: [-48, -24, -12][Math.floor(Math.random() * 3)],
                frequency: 0.0
            }).connect(del)    

            

            let harm = harmonicities[Math.floor(Math.random() * harmonicities.length)]


            // let vib = new Tone.Vibrato(Math.random() * 6., Math.random() * 0.4).connect(filter)
            //synth
            let numPartials = Math.floor(Math.random() * 7)
            let rndPartials = new Array(numPartials).fill(0).map(() => {
                if(Math.floor(Math.random() * 2.)){
                    return Math.random() * 0.8
                } else {
                    return 0
                }
            })
            
            let oscType = ["fmtriangle", "fmsine", "fmtriangle", "fmsine", "fmsawtooth"][Math.floor(Math.random()*5)]
            let vol
            if(oscType==="fmsawtooth"){
                vol = -5.5
            } else if(oscType==="fmtriangle"){
                vol = -1.5
            }
            let synth = new Tone.Synth({
                volume: vol,
                oscillator: {
                    type: oscType,
                    harmonicity: harm,
                    modulationType: "sine",
                    modulationIndex: Math.random() / 2.
                },
                envelope: {
                    attack: 4,
                    sustain: 1.0,
                    releaseCurve: [1, 0.9, 0.75, 0.5, 0.25, 0.],
                    release: 4
                }
            }).connect(filter)
            if(synth.oscillator.type==="fmsine"){
                synth.oscillator.partials = rndPartials
            }
            let freq = new Tone.Signal({
                units: "frequency",
                value: 0
            }).connect(synth.frequency)

            let modLvl = new Tone.Signal(Math.random() / 2.).connect(synth.oscillator.modulationIndex)
            let cutoff2 = new Tone.Signal({
                value: 0, //Math.random() * 7000. + 400.,
            }).connect(filter.frequency)
            let cutoff = new Tone.Signal({
                value: 0, //Math.random() * 7000. + 400.,
                units: "frequency"
            }).connect(filter.frequency)


  
            let fmLfo = new Tone.LFO({
                frequency: Math.random() * 4.,
                min: 0., 
                max: 275.,
                amplitude: Math.random()
            }).start().connect(modLvl)

            let fmLfoDepth = new Tone.Signal(Math.random()).connect(fmLfo.amplitude)
            let fmLfoRate = new Tone.Signal(Math.random() * 2.5).connect(fmLfo.frequency)
            let fmLfoLfo = new Tone.LFO({
                frequency: Math.random() * 2.,
                min: -2., 
                max: 2.,
                amplitude: Math.random()
            }).connect(fmLfo.frequency).start()
            let fmLfoDepthLfo = new Tone.LFO({
                frequency: Math.random() * 2.,
                min: -0.5, 
                max: 0.5,
                amplitude: Math.random()
            }).connect(fmLfo.amplitude).start()

            let filterLfoMeter = new Tone.Meter({normalRange: true}).connect(cutoff)
            let filterLfo = new Tone.LFO({
                frequency: Math.random() * 4.,
                min: 0., 
                max: 750.,
                amplitude: Math.random()
            }).connect(filterLfoMeter).start()

            let filterLfoDepth = new Tone.Signal(Math.random()).connect(filterLfo.amplitude)
            let filterLfoRate = new Tone.Signal(Math.random() * 2.5).connect(filterLfo.frequency)
            let filterLfoLfo = new Tone.LFO({
                frequency: Math.random() * 2.,
                min: -2., 
                max: 2.,
                amplitude: Math.random()
            })

            
            let params = {
                cutoff: cutoff2,
                res: filter.Q,
                allpassCutoff: allpass.frequency,
                allpassRes: allpass.Q,
                
                // combTime: comb.delayTime,
                // combFb: comb.resonance,
                // combDamp: comb.dampening,
                fmModLvl: synth.oscillator.modulationIndex,
                fmLfoLvl: fmLfoDepth,
                fmLfoRate: fmLfoRate,
                fmLfoLfoLvl: fmLfoLfo.amplitude,
                fmLfoLfoRate: fmLfoLfo.frequency,
                fmLfoDepthLfoLvl: fmLfoDepthLfo.amplitude,
                fmLfoDepthLfoRate: fmLfoDepthLfo.frequency,
                filterLfoLvl: filterLfoDepth,
                filterLfoRate: filterLfoRate,
                filterLfoLfoLvl: filterLfoLfo.amplitude,
                filterLfoLfoRate: filterLfoLfo.frequency,
                tremRate: trem.frequency,
                tremDepth: trem.depth,
                masterTremRate: masterTrem.frequency,
                masterTremDepth: masterTrem.depth,
                harm: synth.oscillator.harmonicity,
                phaserRate: phaser.frequency,
                phaserDepth: phaser.octaves,
                phaserRes: phaser.Q,
                delayFb: del.feedback,
                delayWet: del.wet,
                delayTime: del.delayTime,
                
                chorusRate: chorus.frequency,
                chorusTime: chorus.delayTime,
                chorusDepth: chorus.depth,
                // vibDepth: vib.depth,
                // vibRate: vib.frequency,
            
            }
            newVoices.push({
                id: i, 
                synth: synth,
                filter: filter,
                // comb: comb,
                modLvl: modLvl,
                freq: freq,
                fmLfo: fmLfo,
                filterLfo: filterLfo,
                trem: trem,
                meter: meter,
                filterLfoMeter: filterLfoMeter,
                currentNote: null,
                // nodes: [synth, filter, freq, fmLfo, filterLfo, filterLfoLfo, fmLfoLfo]
                params: params,
                envStatus: "off",
                envStatusTimeout: null,
                masterMeter: masterMeter,
                setPlaying: setPlaying,
                playing: false,
                randomMod: randomMod,
                newEnsemble: newEnsemble
            })
         }
        
        setVoices(newVoices)
    }

   

    const voiceStep = () => {
        let id = Math.floor(Math.random() * numVoices)
        let voice = voices.find((v)=>v.id===id)
        voice.synth.setNote(Tone.Frequency(voice.synth.oscillator.frequency).transpose(1), "+" + (Math.random() * 4.0))
        // console.log(Tone.Frequency(voice.synth.oscillator.frequency))
    }

    const toggleVoices = () => {
        
        if(voices.length>0){
            if(playing){
                clearInterval(modLoopId)
                // modLoop = setInterval(randomMod, 500)
                setModLoopId(setInterval(randomMod, 750))
                newChord()
                voices.forEach((v)=>{
                    v.synth.envelope.cancel()
                    v.synth.triggerAttack(v.freq.value, "+0.1")
                })
                // setTimeout(newChord, 500)
                // console.log("attack?")
                // voices.forEach((v)=>{
                //     // let freq = Tone.Frequency(chord[voices.indexOf(v)]).valueOf()
                //     // // console.log("freq: " + freq)
                //     // //      v.synth.triggerAttack("C1")
                //     // //arbitrary 1 sec glide for now
                //     // // v.synth.triggerAttack(freq)
                //     // v.freq.linearRampTo(freq, 1.0)
                //     // v.synth.setNote("C4")
                //     // v.synth.envelope.triggerAttack()
                //     // console.log("currentfreq: " + v.synth.frequency.value)
                    
                // })
                
                
            } else {
                // console.log("release?")
                voices.forEach((v)=>{
                    v.synth.envelope.triggerRelease()
                })
                // clearNodes()
                clearInterval(modLoopId)
            
                // clearNodes()

            }
        }
    }

    // const togglePlay = () => {
    //     setPlaying(!playing)
    // }

    const scheduleNewChord = (rate) => {
        setTimeout(newChord, rate)
    }
    const newChord = () => {
        let newChord = chords[Math.floor(Math.random() * chords.length)]
        let rate = Math.random() * 12000.0 + 5000
        // console.log("NEW CHORD: " + newChord + " FOR " + rate)
        fitChordToVoices(newChord)
        if(Math.random() < 0.4){
            voiceStep()
        }
        if(playing){
            scheduleNewChord(rate)
        }   
        
    }

    // const modulateParam = (voiceId, param, value, rate) => {
    //     let voice = voices.find((v)=>v.id===voiceId)
    //     if(param==="cutoff"){
    //         let expVal = value - value*0.2
    //         voice.params.cutoff.rampTo(expVal, rate)

    //         // console.log("cutoff freq: ", + expVal)
    //     }
    //     else{
    //         voice.params[param].rampTo(value, rate)
    //     }
    // }

    const fitChordToVoices = (ogChord) => {
        let fittedChord = []
        let transpose = Math.floor(Math.random() * 3. -1)
        let transposeDist = Math.floor(Math.random() * 8.)
        if(transpose){
            // let ogOgchord = ogChord
           ogChord = ogChord.map((note)=>Tone.Frequency(note).transpose(transposeDist * transpose))
        //    console.log("transp " + transposeDist * transpose + ": " + ogOgchord + " -> " + ogChord)
        } 
        for (let i=0; i<numVoices; i++){
            if(i<ogChord.length){
                fittedChord.push(ogChord[i])
            } else {
                let octTranspose = Math.floor(Math.random() * 3. -1)
                // let chordPos = i + 1 % ogChord.length
                let freq
                if(typeof fittedChord[i-ogChord.length] === "string"){
                    freq = Tone.Frequency(fittedChord[i-ogChord.length]).valueOf()
                } else {
                    freq = fittedChord[i-ogChord.length]
                }
                if(octTranspose===1){
                    fittedChord.push(freq * 2.) // this doest work yet
                } else if(octTranspose===-1){
                    fittedChord.push(freq / 2.) // this doest work yet
                }else{
                    fittedChord.push(freq)
                }
            }    
        }
        setChord(fittedChord)
    }


    
    // const getVoice = (voiceId) => {
    //     return voices.find((v)=>v.id===voiceId)
    // }
    



    // let width = 500
    // let height = 500
    // let drones = []

    // function sketch(p5) {
    //     class Drone {
    //     constructor(x, y, r, id) {
    //         this.position = [x, y];
    //         this.r = r;
    //         this.id = id
    //     }
    //     display() {
    //         p5.noStroke();
    //         p5.fill(204);
    //         let outputLvl = getVoice(this.id).meter.getValue()//.filter.frequency.value
    //         let filterLfoPos = getVoice(this.id).filterLfoMeter.getValue()
    //         let filterLfoLvl = getVoice(this.id).params.filterLfoLvl.value
    //         console.log(filterLfoLvl)
    //         p5.ellipse(this.position[0], this.position[1], (outputLvl * 10 * outputLvl*10) * 100. + 20, filterLfoPos / 100 * filterLfoLvl + 20.);
    //     }
    // }

                
    //     p5.setup = () => {
    //         p5.frameRate(20)
    //        for(let i=0; i<numVoices; i++){
    //            drones.push(new Drone(Math.random() * width, Math.random() * height, Math.random()*20+20, i))
    //        }   
        
           
    //         return p5.createCanvas(500, 500, /*p5.WEBGL*/)
    //     };

    //     p5.draw = () => {
    //         p5.background(150);
            
    //         p5.fill(250)
            
    //         drones.forEach((d)=>{d.display()})
            
    //         // p5.push();
    //         // p5.rotateZ(p5.frameCount * 0.01);
    //         // p5.rotateX(p5.frameCount * 0.01);
    //         // p5.rotateY(p5.frameCount * 0.01);
    //         // p5.plane(100);
    //         // p5.pop();
            
    //     };
    // }
        
            // return <ReactP5Wrapper sketch={sketch} />;
    

    return (
        <div>
            {/* <button onClick={may}>{playing ? "stop" : "start"}</button>
            <input type="number" min="0" step="1" onChange={(e)=>{setNumVoices(e.target.value)}}/> */}
            {/* <select onChange={(e)=>{fitChordToVoices(e.target.value.split(', '))}}>
                {chords.map((c)=>
                    <option value={c.join(', ')}>{c.join(', ')}</option>
                )}
            </select>
            <p>mod lvl</p>
            <input type="range" onChange={(e)=>{
                voices.forEach((v)=>{modulateParam(v.id, "fmModLvl", e.target.value/100., 0.2)})
            }}/>
            <p>mod lfo lvl</p>
            <input type="range" onChange={(e)=>{
                voices.forEach((v)=>{modulateParam(v.id, "fmLfoLvl", e.target.value/100., 0.2)})
            }}/>
            <p>cutoff</p>
            <input type="range" onChange={(e)=>{
                voices.forEach((v)=>{modulateParam(v.id, "cutoff", e.target.value*50-1450, 0.2)})
            }}/>
            <p>cutoff lfo lvl</p>
            <input type="range" onChange={(e)=>{
                
                 voices.forEach((v)=>{modulateParam(v.id, "filterLfoLvl", e.target.value/100., 0.2)})
            }}/>
            <br/>
            {/* <Visual numVoices={numVoices} getVoice={getVoice}/> */}
            {/* <ReactP5Wrapper sketch={sketch} /> */}
            {/* <button onClick={twiddleCombs}>twiddle combs</button> */} 
            
            {/* {numVoices>0 && renderVoices()} */}
        </div>

    )
}
export default Ensemble