"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { urlFor } from "@/sanity/lib/image";


export default function ImageCarousel({

images,
title

}:{

images:any[];
title:string;

}){


const [active,setActive] = useState(0);



if(!images || images.length === 0){

return null;

}



const next = ()=>{

setActive(
(active + 1) % images.length
);

};



const previous = ()=>{

setActive(
(active - 1 + images.length) % images.length
);

};




const getPosition = (index:number)=>{


const length = images.length;


let position =
(index - active + length) % length;



if(position > length / 2){

position -= length;

}



return position;

};





return (


<div

className="
relative
w-full
h-[560px]
md:h-[650px]
flex
items-center
justify-center
"

>



<div

className="
relative
w-[300px]
h-[470px]
md:w-[400px]
md:h-[580px]
"

>


<AnimatePresence>



{


images.map((image,index)=>{


const position =
getPosition(index);



if(Math.abs(position)>3){

return null;

}



const isActive =
position === 0;



return (



<motion.div

key={index}


onClick={()=>{

if(isActive){

next();

}else{

setActive(index);

}

}}



drag={isActive ? "x" : false}



dragConstraints={{
left:0,
right:0
}}



onDragEnd={(e,info)=>{


if(info.offset.x < -80){

next();

}


if(info.offset.x > 80){

previous();

}


}}



animate={{

x:
position === 0
?
0
:
position > 0
?
position * 100
:
position * 100,


scale:
position === 0
?
1
:
0.88 - Math.abs(position)*0.05,


rotate:
position === 0
?
0
:
position > 0
?
8
:
-8,


opacity:
position === 0
?
1
:
Math.max(
0.3,
1 - Math.abs(position)*0.25
),


zIndex:
100-Math.abs(position)

}}



transition={{

type:"spring",

stiffness:170,

damping:24

}}



className="
absolute
inset-0
flex
items-center
justify-center
"

>



<div

className="
relative
w-full
h-full
rounded-[32px]
border
border-white/20
bg-white/10
backdrop-blur-2xl
shadow-[0_30px_80px_rgba(0,0,0,0.5)]
flex
items-center
justify-center
p-4
"

>


<img


src={

urlFor(image)
.width(1200)
.fit("max")
.url()

}


alt={title}



className="
max-w-full
max-h-full
object-contain
rounded-2xl
"

 />



<div

className="
absolute
inset-0
rounded-[32px]
bg-gradient-to-br
from-white/20
via-transparent
to-transparent
pointer-events-none
"

/>



</div>



</motion.div>


)


})


}



</AnimatePresence>


</div>








<button

onClick={previous}

className="
absolute
left-3
md:left-5
top-1/2
-translate-y-1/2
w-12
h-12
rounded-full
bg-white/10
border
border-white/20
backdrop-blur-xl
text-2xl
hover:bg-white/20
transition
"

>

‹

</button>





<button

onClick={next}

className="
absolute
right-3
md:right-5
top-1/2
-translate-y-1/2
w-12
h-12
rounded-full
bg-white/10
border
border-white/20
backdrop-blur-xl
text-2xl
hover:bg-white/20
transition
"

>

›

</button>



</div>


)

}