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



if(!images || images.length===0){

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



if(position > length/2){

position -= length;

}



return position;



};






return (



<div

className="
relative
w-full
h-[520px]
flex
items-center
justify-center
overflow-hidden
"

>




<div

className="
relative
w-[330px]
h-[430px]
"

>




<AnimatePresence>


{

images.map((image,index)=>{


const position = getPosition(index);



const isActive = position===0;



if(Math.abs(position)>3){

return null;

}





return (



<motion.div

key={index}

onClick={()=>{

if(!isActive){

setActive(index);

}else{

next();

}

}}

drag={isActive ? "x":false}

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
position===0
?
0
:
position>0
?
position*75
:
position*-75,


scale:
position===0
?
1
:
0.88 - Math.abs(position)*0.04,


rotate:
position===0
?
0
:
position>0
?
8
:
-8,


opacity:
position===0
?
1
:
Math.max(
0.25,
1-Math.abs(position)*0.25
),


zIndex:
100-Math.abs(position)



}}



transition={{

type:"spring",

stiffness:180,

damping:22

}}



className="

absolute
inset-0
cursor-pointer

"

>



<div

className="

w-full
h-full

rounded-[32px]

overflow-hidden

border
border-white/20

bg-white/10

backdrop-blur-2xl

shadow-[0_30px_80px_rgba(0,0,0,0.5)]

"

>


<img


src={

urlFor(image)
.width(900)
.height(900)
.fit("crop")
.url()

}


alt={title}


className="

w-full
h-full

object-cover

"




/>



<div

className="

absolute
inset-0

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
left-5
top-1/2
-translate-y-1/2

w-14
h-14

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
right-5
top-1/2
-translate-y-1/2

w-14
h-14

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