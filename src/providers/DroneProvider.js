import React, { useEffect, useState } from "react";
import Visual from '../components/Visual'
import Ensemble from '../components/Ensemble'
import ReactDOM from 'react-dom'

export const DroneContext = React.createContext();

const DroneProvider = (props) => {
  const [drones, setDrones] = useState([])
  const [zoneCount, setZoneCount] = useState(0)

  const newZone = () => {
    console.log("new zone !")
    // setZoneCount(zoneCount+1)
    // drones[0].newEnsemble()
    window.location.reload(true)

    // drones.forEach((d)=>{
      
    //    d.synth.envelope.cancel()
    // })
    // if(typeof window !== undefined){
    //   ReactDOM.render(<Ensemble/>, document.getElementById("app"))
    //   // ReactDOM.render(<Visual/>, document.getElementById("app"))
    // }
    
    
  }

    const getDrone = (id) => {
        return drones.find((d)=>d.id===id)
    }
    // const newNote = (id) => {
      
    // }

    useEffect(()=>{console.log("useEffect provider")}, [])

  return (
    
    <DroneContext.Provider
      value={{
        getDrone,
        drones,
        setDrones,
        newZone,
        zoneCount
      }}
      key={0}
      id="provider"
    >
      {props.children}
    </DroneContext.Provider>
  );
};

export default DroneProvider;
