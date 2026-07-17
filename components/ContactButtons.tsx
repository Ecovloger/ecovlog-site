"use client";


import {useState} from "react";



export default function ContactButtons({

youtube,
instagram,
tiktok,
telegram,
email,
phone

}:{

youtube?:string;
instagram?:string;
tiktok?:string;
telegram?:string;
email?:string;
phone?:string;

}){


const [showEmail,setShowEmail] = useState(false);

const [copied,setCopied] = useState(false);




async function handleEmail(){


if(!email) return;



if(!showEmail){

setShowEmail(true);

return;

}



await navigator.clipboard.writeText(email);


setCopied(true);


setTimeout(()=>{

setCopied(false);

},2000);



}





const socials=[

{
name:"YouTube",
link:youtube,
icon:"/icons/youtube.svg"
},

{
name:"Instagram",
link:instagram,
icon:"/icons/instagram.svg"
},

{
name:"TikTok",
link:tiktok,
icon:"/icons/tiktok.svg"
},

{
name:"Telegram",
link:telegram,
icon:"/icons/telegram.svg"
},

];





return (

<div
className="
mt-8
space-y-4
"
>



{

socials.map((item)=>(


item.link && (

<a

key={item.name}

href={item.link}

target="_blank"

rel="noopener noreferrer"

className="
flex
items-center
gap-4
rounded-2xl
bg-white/10
border
border-white/20
px-6
py-4
backdrop-blur-xl
hover:bg-white/20
transition
"

>


<img

src={item.icon}

alt={item.name}

className="
w-6
h-6
object-contain
"

/>



<span>

{item.name}

</span>


</a>

)


))


}




{


email && (


<button

onClick={handleEmail}

className="
flex
items-center
gap-4
w-full
rounded-2xl
bg-white/10
border
border-white/20
px-6
py-4
backdrop-blur-xl
hover:bg-white/20
transition
text-left
"

>


<img

src="/icons/email.svg"

alt="Email"

className="
w-6
h-6
object-contain
"

/>



<span>

{

copied

?

"Скопировано"

:

showEmail

?

email

:

"Email"

}

</span>



</button>


)

}





{


phone && (


<div

className="
flex
items-center
gap-4
rounded-2xl
bg-white/10
border
border-white/20
px-6
py-4
backdrop-blur-xl
"

>


<span>

☎

</span>



<span>

{phone}

</span>


</div>


)

}



</div>

)

}