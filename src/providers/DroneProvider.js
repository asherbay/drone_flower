import React, { useEffect, useState } from "react";
export const DroneContext = React.createContext();
const DroneProvider = (props) => {
  const [drones, setDrones] = useState([])

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
        setDrones
      }}
      key={0}
    >
      {props.children}
    </DroneContext.Provider>
  );
};

export default DroneProvider;
