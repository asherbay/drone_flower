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
    const intervalRatios = [1/2, 5/8, 2/3, 3/4, 27/32, 8/9, 9/8, 6/5, 5/4, 4/3, 3/2, 27/16, 16/9, 243/128]
    const [modLoopId, setModLoopId] = useState(null)
    // const [chordLoopId, setChordLoopId] = useState(null)
    let chordInterval = Math.random() * 7000 + 1500
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
            setNumVoices(Math.floor(Math.random() * 3 + 3))
        } else {
            drones.setDrones(voices)
        }

        
       
    }, [voices])  

    useEffect(()=>{
        // console.log(chord)
            if(voices.length>0){
                voices.forEach((v)=>{
                    let freq = new Tone.Frequency(chord[voices.indexOf(v)]).valueOf()
                    let duration = Math.random() * 4. + 0.5
                    let delay = Math.random() * 3. + 0.5

                    // let glide = (Math.random()<0.00)
                    // console.log("glide? " + duration)
                    if(Math.random()>v.glideProbability){
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
                            v.synth.envelope.cancel("+" + (duration + delay*0.94)) //this might be one to keep if the bug shows up again
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
        Tone.setContext(new AudioContext({ sampleRate: 22000, lookAhead: 1.0}))
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

    const voiceStep = (voice=null, depth=0.25) => {
       
            // id = Math.floor(Math.random() * numVoices)
        // if(voices.length>0){
            if(!voice){
                voice = voices[Math.floor(Math.random() * numVoices)]
            }
        let targetFreq = voice.freq.value * intervalRatios[Math.floor(Math.random() * intervalRatios.length)]
        if(targetFreq>800){
            targetFreq = targetFreq/2
        }
        // console.log("TARGET FREQ " + voice.freq.value)
        //voice.synth.setNote(Tone.Frequency(voice.synth.oscillator.frequency).transpose(1), "+" + (Math.random() * 4.0))
        voice.freq.linearRampTo(targetFreq, Math.random(), "+0.2")
        console.log("step?")
        // console.log(Tone.Frequency(voice.synth.oscillator.frequency))
        // }
        
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
        else if(param==="chorusFb"){
            val = Math.min(Math.random(), 0.9)
            console.log("chorusFb gonna be " + val)
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
            decay: Math.random() * 3.7,
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
        let mono = new Tone.StereoWidener(Math.random()).connect(masterTrem)
        let phaser = new Tone.Phaser({
                frequency: Math.random() * 3.,
                octaves: Math.floor(Math.random() * 6),
                baseFrequency: Math.random() * 5000. + 100,
                Q: Math.random() * 6. + 0.001,
                wet: 0.7
            }).connect(mono)
        let chorus = new Tone.Chorus({
                frequency: Math.random() * 4., 
                delayTime: Math.random() * 100., 
                depth: Math.random(),
                feedback: Math.random()
        }).connect(phaser)
        console.log("CHORUS FB IS: " + chorus.feedback.value)
        let outputGain = new Tone.Gain(0.7).connect(chorus)
        
        let newVoices = []
         for (let i=0; i<numVoices; i++){
            // let chorus = new Tone.Chorus(Math.random() * 4., Math.random() * 10., Math.random()).connect(outputGain)
            // 
            let meter = new Tone.Meter({normalRange: true}).connect(outputGain)
            let fastTrem = Math.floor(Math.random() * 2)
            let tremRate
            if(fastTrem){
                tremRate = Math.random() * 10. + 3.
            } else {
                tremRate = Math.random() * 3.
            }
            let trem = new Tone.Tremolo(tremRate, Math.random()).connect(meter)//.connect(mono)
            let del = new Tone.FeedbackDelay({
                delayTime: Math.random(), 
                feedback: Math.random() * 0.59,
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
            let glideProbability = Math.random()
            if(oscType==="fmsawtooth"){
                vol = -2.5
            } else if(oscType==="fmtriangle"){
                vol = 1.5
            } else {
                vol = 3
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
                    attack: 2,
                    sustain: 0.7,
                    decay: 2,
                    releaseCurve: [1, 0.9, 0.75, 0.5, 0.25, 0.],
                    release: 3
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
                max: 1000.,
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
            }).connect(filterLfo.frequency).start()

            let rateControlParams = [
                
                {param: filterLfo.frequency,
                    type: "signal",
                    min: filterLfo.frequency.value / 4,
                    max: filterLfo.frequency.value * 4},
                {param: filterLfoLfo.frequency,
                    type: "signal",
                    min: filterLfoLfo.frequency.value / 4,
                    max: filterLfoLfo.frequency.value * 4},

                {param: fmLfo.frequency,
                    type: "signal",
                    min: fmLfoRate.value / 4,
                    max: fmLfoRate.value * 4},
                {param: fmLfoLfo.frequency,
                    type: "signal",
                    min: fmLfoLfo.frequency.value / 4,
                    max: fmLfoLfo.frequency.value * 4},
                {param: fmLfoDepthLfo.frequency,
                    type: "signal",
                    min: fmLfoDepthLfo.frequency.value / 4,
                    max: fmLfoDepthLfo.frequency.value * 4},
               

                {param: trem.frequency,
                    type: "signal",
                    min: trem.frequency.value / 4,
                    max: trem.frequency.value * 4},
                    
                {param: masterTrem.frequency,
                    type: "signal",
                    min: masterTrem.frequency.value / 4,
                    max: masterTrem.frequency.value * 4},
                
                {param: chorus.frequency,
                    type: "signal",
                    min: chorus.frequency.value / 4,
                    max: chorus.frequency.value * 4},

                {param: phaser.frequency,
                    type: "signal",
                    min: phaser.frequency.value / 4,
                    max: phaser.frequency.value * 4},
            ]

            let depthControlParams = [
                
                // {param: filterLfo.min,
                //     type: "number",
                //     min: filterLfo.min / 4,
                //     max: filterLfo.min * 4},
                {param: filterLfo.max,
                    type: "number",
                    min: filterLfo.min,
                    max: filterLfo.max * 2},
                {param: filterLfo.amplitude,
                    type: "signal",
                    min: filterLfo.amplitude.value / 2,
                    max: Math.min(filterLfo.amplitude.value * 2, 1)},

                // {param: filterLfoLfo.min,
                //     type: "number",
                //     min: filterLfoLfo.min / 4,
                //     max: filterLfoLfo.min * 4},
                {param: filterLfoLfo.max,
                    type: "number",
                    min: filterLfoLfo.min,
                    max: filterLfoLfo.max * 2},
                {param: filterLfoLfo.amplitude,
                    type: "signal",
                    min: filterLfoLfo.amplitude.value / 2,
                    max: Math.min(filterLfoLfo.amplitude.value * 2, 1)},
                
                // {param: fmLfo.min,
                //     type: "number",
                //     min: fmLfo.min / 4,
                //     max: fmLfo.min * 4},
                {param: fmLfo.max,
                    type: "number",
                    min: fmLfo.min ,
                    max: fmLfo.max * 2},
                {param: fmLfoDepth,
                    type: "signal",
                    min: fmLfo.amplitude.value / 2,
                    max: Math.min(fmLfo.amplitude.value * 2, 1)},

                // {param: fmLfoLfo.min,
                //     type: "number",
                //     min: fmLfoLfo.min,
                //     max: fmLfoLfo.min / 4},
                {param: fmLfoLfo.max,
                    type: "number",
                    min: fmLfoLfo.min,
                    max: fmLfoLfo.max * 2},
                {param: fmLfoLfo.amplitude,
                    type: "signal",
                    min: fmLfoLfo.amplitude.value / 2,
                    max: Math.min(fmLfoLfo.amplitude.value * 2, 1)},

                // {param: fmLfoDepthLfo.min,
                //     type: "number",
                //     min: fmLfoDepthLfo.min / 4,
                //     max: fmLfoDepthLfo.min * 4},
                {param: fmLfoDepthLfo.max,
                    type: "number",
                    min: fmLfoDepthLfo.min,
                    max: fmLfoDepthLfo.max * 2},

                {param: fmLfoDepthLfo.amplitude,
                    type: "signal",
                    min: fmLfoDepthLfo.amplitude.value / 2,
                    max: Math.min(fmLfoDepthLfo.amplitude.value * 2, 1)},
                
                {param: synth.oscillator.modulationIndex,
                    type: "signal",
                    min: synth.oscillator.modulationIndex.value / 2,
                    max: synth.oscillator.modulationIndex.value * 2},
                
               

                {param: trem.depth,
                    type: "signal",
                    min: trem.depth.value / 4,
                    max: Math.min(trem.depth.value * 4, 1)},
                    
                {param: masterTrem.depth,
                    type: "signal",
                    min: masterTrem.depth.value / 4,
                    max: Math.min(masterTrem.depth.value * 4, 1)},
                
                {param: chorus.depth,
                    type: "number",
                    min: chorus.depth / 4,
                    max: Math.min(chorus.depth * 4, 1)},
                {param: phaser.Q,
                    type: "signal",
                    min: phaser.Q.value / 4,
                    max: phaser.Q.value * 4},
                {param: allpass.Q,
                    type: "signal",
                    min: allpass.Q.value / 4,
                    max: allpass.Q.value * 4},
                {param: glideProbability,
                    type: "number",
                    min: 0,
                    max: 1},
            ]

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
                chorusFb: chorus.feedback,
                
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
                newEnsemble: newEnsemble,
                outputGain: outputGain,
                rateControlParams: rateControlParams,
                depthControlParams: depthControlParams,
                glideProbability: glideProbability,
                chordInterval: chordInterval,
                voiceStep: voiceStep 
            })
         }
        
        setVoices(newVoices)
    }

   

    

    const toggleVoices = () => {
        
        if(voices.length>0){
            if(playing){
                clearInterval(modLoopId)
                // modLoop = setInterval(randomMod, 500)
                // setModLoopId(setInterval(randomMod, 750)) //remake in Visual, assign one interval to each drone. random duration determined at setup, scaled by depth slider
                newChord()
                // setChord(chords[Math.floor(Math.random() * chords.length)])
                voices.forEach((v)=>{
                    v.synth.envelope.cancel()
                    // console.log("this should work:/")
                    v.synth.triggerAttack(v.freq.value, "+0.3")
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
            // voiceStep()
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

    

    return (
        <div>
           
        </div>

    )
}
export default Ensemble