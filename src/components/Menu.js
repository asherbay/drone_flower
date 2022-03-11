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

    const setAlpha = (rgbArray, alpha) => {
        return `rgba(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]}, ${alpha})`
    }
    const oppositeHue = (rgbArray) => {
        return [255-rgbArray[0], 255-rgbArray[1], 255-rgbArray[2]]
    }

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
    <Container style={{color: props.textColor}}>
        <Icon src={openIn ? xIcon : barsIcon} onClick={toggleMenu} style={{background: props.color}}/>
      <CSSTransition key={1} in={openIn} timeout={{ enter: 500, exit: 500 }} classNames="open" onExited={()=>{setOpen(false)}}>
        <ItemGroup show={open} itemFontSize={props.itemFontSize} contentFontSize={props.contentFontSize}>
            {props.children.map((c, i)=>{
                console.log("CHILD TYPE: ", c)
                //FIX THIS MENU IT'S VERY CLOSE
                return <Item key={i} index={i} name={c.props.name} function={c.props.function} select={setSelItem} selItem={selItem} parentOpen={openIn} color={props.color} style={{display: "inline", position: "absolute", top: i * 50+"px", }}>{c.props.children} </Item>
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
        console.log("PARENT STATUS: ", props.color)
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


    const setAlpha = (rgbArray, alpha) => {
        return `rgba(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]}, ${alpha})`
    }
    const oppositeHue = (rgbArray) => {
        return [255-rgbArray[0], 255-rgbArray[1], 255-rgbArray[2]]
    }

    const toggleItem = () => {
        if(props.function){
            props.function()
            return
        }
        if(!sel){
            props.select(props.index)
            setSel(true)
            
            
        } else {
            setOpen(false)
        }
    }

    return (
        <div ref={contents} style={{display: "flex"}}>
            <div className="tab" onClick={toggleItem} style={{display: "inline", float: "left",  padding: "7px", backgroundColor: props.color, zIndex: 1, }} >
                {props.name}
            </div>
            { 
            <CSSTransition key={props.name} in={open} timeout={{ enter: 500, exit: 500 }} classNames="openSub" onExited={()=>{
                setSel(false)
            }} style={{backgroundColor: props.color, paddingLeft: "20px", paddingRight: "10px", marginLeft: "45px", position: "absolute", top: props.index * 55+"px"}}>
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
    top: ${isMobile ? 47 : 47}px;
    flex-direction: column;
    visibility: ${props => props.show ? "visible" : "hidden"};

    .tab:hover{
            cursor: pointer;
        }
        
    
    
    &>*{
        font-size: ${props => props.contentFontSize ? props.contentFontSize : 16}pt;
        margin-right: 5px;
        
    }
`

const Icon = styled.img`
    width: ${isMobile ? 47 : 47}px;
    &:hover{
        cursor: pointer;
    }
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
