"use client";
import { motion } from "framer-motion";
export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Фоновое изображение */}
      <img
        src="/images/hero.jpg"
        alt="EcoVlog"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Затемнение */}
      <div className="absolute inset-0 bg-black/60" />


      {/* Текст */}
<motion.div
  className="relative z-10 px-8 max-w-5xl"
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1 }}
>
        <h1 className="text-6xl md:text-8xl font-bold leading-tight">
          Исследуем природу.
          <br />
          Объясняем науку.
        </h1>


        <p className="mt-8 text-xl md:text-2xl text-gray-200 max-w-2xl">
          Экологические расследования,
          научные открытия и удивительный мир животных.
        </p>


        <button className="mt-10 px-8 py-4 rounded-full bg-white text-black text-lg font-medium hover:scale-105 transition">
          Смотреть видео
        </button>

      </motion.div>

    </section>
  );
}