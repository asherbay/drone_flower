import React, {useState, useEffect,}  from 'react'
import { CSSTransition } from 'react-transition-group'
import barsIcon from '../images/menu.png'
import xIcon from '../images/x.png'
import styled from 'styled-components'
const Menu = (props) => {
  const [openIn, setOpenIn] = useState(false);
  const [open, setOpen] = useState(false)
  const [iconImg, setIconImg] = useState(barsIcon)
  const [selItem, setSelItem] = useState(null)

    useEffect(()=>{}, [openIn])

 //if an item's content is a string, make it a menu item. if it's an array, make it a nested itemgroup 
 /*
    {name: 'ℹ️', content: 'beep beep beep'}
    {name: 'show more', content: [
            {name: 'other item', content: 'zippy zeep',}, 
        ],
    }
 */ 


    
    const renderItems = () => {
       return props.children.map((i)=>{

            return <p>{i}</p>
        })
    }

    const toggleMenu = () => {
        setOpenIn(!openIn)
        if(!openIn){
            setOpen(true)
        }
    }

  return (
    <Container>
        <Icon src={openIn ? xIcon : barsIcon} onClick={toggleMenu}/>
      <CSSTransition key={1} in={openIn} timeout={{ enter: 500, exit: 500 }} classNames="open" onExited={()=>{setOpen(false)}}>
        <ItemGroup show={open}>
            {props.children}
        </ItemGroup>
      </CSSTransition>
 
    </Container>
  )
}
export default Menu


export const Item = (props) => {
    const [sel, setSel] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(()=>{
        if(sel){
            setOpen(true)
        }
    }, [])

    return (
        <div onClick={()=>{
            setSel(!sel)
            
        }}>
            {props.name}
            {sel && 
            <CSSTransition key={props.name} in={open} timeout={{ enter: 500, exit: 500 }} classNames="open" onExited={()=>{setOpen(false)}}>
                <ItemGroup show={true}>
                    {props.children}
                </ItemGroup>
            </CSSTransition>}
        </div>
    )
}


const ItemGroup = styled.div`
    
    align-items: start;
    background: rgba(255, 255, 255, 0.2)
    display: flex;
    flex-direction: column;
    visibility: ${props => props.show ? "visible" : "hidden"};
    
`

const Icon = styled.img`
    width: 4vw;
`
const Container = styled.div`
    display: inline;
    z-index: 1;
    position: absolute;
    left: 2vw;
    top: 2vw;

    .open-enter {
        
        transform: translate(-10vw, 0);
        
    }
    .open-enter-active {
        transform: translate(0, 0);
        transition: transform 500ms;
    }
    .open-exit {
        transform: translate(0, 0);
    }
    .open-exit-active {
        transform: translate(-10vw, 0);
        transition: transform 500ms;
    }
    
`
