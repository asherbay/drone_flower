
//1
const numFunc1 = (num) => {
    return ()=>{
        return num
    }
}

//console.log(numFunc1(2)() + 1)

//2
const numFunc2 = (numFunc) => {
    return numFunc() + 1
}

//console.log(numFunc2(numFunc1(2)))

