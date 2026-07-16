"use client";

import {useState} from "react";
import {urlFor} from "@/sanity/lib/image";


export default function ImageCarousel({
  images,
  title,
}:{
  images:any[];
  title:string;
}) {


  const [current,setCurrent] = useState(0);



  if(!images || images.length === 0){
    return null;
  }



  function nextImage(){

    setCurrent((prev)=>
      prev === images.length - 1
      ? 0
      : prev + 1
    );

  }



  function prevImage(){

    setCurrent((prev)=>
      prev === 0
      ? images.length - 1
      : prev - 1
    );

  }




  return (

    <div className="
      relative
      w-full
    ">


      <img

        src={
          urlFor(images[current])
          .width(1200)
          .url()
        }

        alt={title}

        className="
          w-full
          rounded-3xl
          object-cover
        "

      />



      {images.length > 1 && (

        <>


          <button

            onClick={prevImage}

            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              bg-black/50
              rounded-full
              px-4
              py-2
              text-2xl
            "

          >

            ←

          </button>




          <button

            onClick={nextImage}

            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              bg-black/50
              rounded-full
              px-4
              py-2
              text-2xl
            "

          >

            →

          </button>



          <div className="
            absolute
            bottom-4
            left-1/2
            -translate-x-1/2
            bg-black/60
            px-4
            py-1
            rounded-full
          ">

            {current + 1} / {images.length}

          </div>


        </>

      )}



    </div>

  );

}