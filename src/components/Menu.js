import React, {useState, useEffect, useRef}  from 'react'
import { CSSTransition } from 'react-transition-group'
import barsIcon from '../images/menu.png'
import xIcon from '../images/x.png'
import styled from 'styled-components'
import {isMobile} from 'react-device-detect'
const Menu = (props) => {
  const [openIn, setOpenIn] = useState(false);
  const [open, setOpen] = useState(false)
  const [iconImg, setIconImg] = useState(barsIcon)
  const [selItem, setSelItem] = useState(null)
  
    useEffect(()=>{}, [openIn])

//props: itemFontSize, contentFontSize, color

 //if an item's content is a string, make it a menu item. if it's an array, make it a nested itemgroup 
 /*
    {name: 'ℹ️', content: 'beep beep beep'}
    {name: 'show more', content: [
            {name: 'other item', content: 'zippy zeep',}, 
        ],
    }
 */ 

    const select = () => {
        setSelItem()
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
        <ItemGroup show={open} itemFontSize={props.itemFontSize} contentFontSize={props.contentFontSize}>
            {props.children.map((c, i)=>{
                console.log("CHILD TYPE: ", c)
                //FIX THIS MENU IT'S VERY CLOSE
                return <Item key={i} index={i} name={c.props.name} select={setSelItem} selItem={selItem} parentOpen={openIn} style={{display: "inline", position: "absolute", top: i * 50+"px", }}>{c.props.children} </Item>
            })}
        </ItemGroup>
      </CSSTransition>
    </Container>
  )
}
export default Menu


export const Item = (props) => {
    const [sel, setSel] = useState(false)
    const [open, setOpen] = useState(false)
    const contents = useRef(null)
    
    //close when sibling item opens
    useEffect(()=>{
        
        if(open && props.selItem!==props.index){
            console.log("non sel items closed")
            setOpen(false)
        }
    }, [props.selItem])

    // close when parent menu closes
    useEffect(()=>{
        console.log("PARENT STATUS: ", props.parentOpen)
        if(!props.parentOpen ){
            setOpen(false)
        }
    })


    useEffect(()=>{
        if(sel){
            setOpen(true)
        } else {
            setOpen(false)
        }
    }, [sel])

    const toggleItem = () => {
        if(!sel){
            
            setSel(true)
            props.select(props.index)
            
        } else {
            setOpen(false)
        }
    }

    return (
        <div ref={contents} style={{display: "flex"}}>
            <div onClick={toggleItem} style={{display: "inline", float: "left",  padding: "7px", background: "rgba(255, 255, 255, 1)", zIndex: 1}}>
                {props.name}
            </div>
            { 
            <CSSTransition key={props.name} in={open} timeout={{ enter: 500, exit: 500 }} classNames="openSub" onExited={()=>{
                setSel(false)

            }} style={{background: "rgba(255, 255, 255, 1)", paddingLeft: "20px", paddingRight: "10px", marginLeft: "45px", position: "absolute", top: props.index * 50+"px"}}>
                <ItemGroup show={sel} id={props.name}>
                    {props.children}
                </ItemGroup>
            </CSSTransition>}
        </div>
    )
}


const ItemGroup = styled.div`
    
   
    
    display: inline;
    position: absolute;
    top: ${isMobile ? 25 : 50}px;
    flex-direction: column;
    
    visibility: ${props => props.show ? "visible" : "hidden"};
    
    
    &>*{
        font-size: ${props => props.contentFontSize ? props.contentFontSize : 16}pt;
        margin-right: 5px;
    }
`

const Icon = styled.img`
    width: ${isMobile ? 25 : 50}px;
    
`
const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    z-index: 1;
    position: absolute;
    font-size: ${props => props.itemFontSize ? props.itemFontSize : 25}pt;
    left: 0vw;
    top: -0.25vw;
    float: left;
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
        transform: translate(-15vw, 0);
        transition: transform 500ms;
    }

    .openSub-enter {
        transform: translate(-130%, 0);
    }
    .openSub-enter-active {
        transform: translate(0, 0);
        transition: transform 500ms;
    }
    .openSub-exit {
        transform: translate(0, 0);
    }
    .openSub-exit-active {
        transform: translate(-130%, 0);
        transition: transform 500ms;
    }
    
`
