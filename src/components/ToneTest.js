import * as Tone from 'tone'
import React, {useState, useEffect,}  from 'react'

const ToneTest = () => {
    const [audioOn, setAudioOn] = useState(false)
    const synth1 = new Tone.Synth()
    const synth2 = new Tone.Synth().toDestination();
    const signal = new Tone.Signal({
	    value: 440,
        type: "Frequency"
    })
    signal.connect(synth2.frequency)
    var LFO = new Tone.LFO(100.4, -10, 10)
    const toggleAudio = async () => {
        if(!audioOn){
            await Tone.start()
            setAudioOn(true)
        } else {
            setAudioOn(false)
        }
    }
    synth1.envelope.attack = 0.6
    synth1.envelope.decay = 1.5
    synth2.envelope.attack = 0.3
    synth2.envelope.decay = 2.5
    LFO.connect(synth2.oscillator.frequency)
    LFO.start()
    // synth1.gain = 0.8;

    
    useEffect(()=>{
        console.log("audioOn? " + audioOn)
        
    }, [audioOn])

    const setFreq = (e) => {
        signal.value = e.target.value * 10
    }
    const setLFOFreq = (e) => {
        LFO.frequency.value = e.target.value * 10
    }
    const setDepth = (e) => {
        LFO.min = 0 - (e.target.value * 10) / 2
        LFO.max = (e.target.value * 10) / 2
    }
    
    

    const note = () => {
        // synth.triggerAttackRelease("C4", "8n", Tone.now())
        synth2.triggerAttackRelease(synth2.frequency.value, "4n");
        synth1.triggerAttackRelease("G3", "8n");
    }
    return (
        <div>
            <button onClick={toggleAudio}>{audioOn ? "stop" : "start"}</button>
            {audioOn && <button onClick={note}>note</button>}
            <input type="range" onChange={setFreq}/>
            <input type="range" onChange={setDepth}/>
            <input type="range" onChange={setLFOFreq}/>
        </div>
    )
}
export default ToneTest