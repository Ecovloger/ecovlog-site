import "./globals.css";

import { Oswald } from "next/font/google";
import PageBackground from "@/components/PageBackground";


const oswald = Oswald({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});


export const metadata = {

metadataBase: new URL("https://ecovloger.ru"),

title: {
default: "EcoVlog — экологические новости России",
template: "%s — EcoVlog"
},

description:
"Экологические расследования, новости природы, научные материалы и карта экологических нарушений.",

keywords: [
"экология",
"экологические новости",
"экологические нарушения",
"природа России",
"экологические расследования",
"Зелёный Фронт",
"EcoVlog"
],

authors: [
{
name: "EcoVlog"
}
],

openGraph: {

title:
"EcoVlog — экологические новости России",

description:
"Экологические расследования, новости природы и мониторинг экологических нарушений.",

type:
"website",

locale:
"ru_RU",

url:
"https://ecovloger.ru",

siteName:
"EcoVlog",

images: [
{
url: "/images/ecovlog-logo.png",
width: 800,
height: 800,
alt: "EcoVlog"
}
]

},

twitter: {

card: "summary_large_image",

title: "EcoVlog — экологические новости России",

description:
"Экологические расследования, новости природы и мониторинг экологических нарушений.",

images: ["/images/ecovlog-logo.png"]

},

};



export default function RootLayout({

children,

}:{

children: React.ReactNode

}){


return (

<html lang="ru">

<body className={oswald.variable}>

<PageBackground>

{children}

</PageBackground>


</body>

</html>

)

}