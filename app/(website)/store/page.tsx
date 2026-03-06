"use client"

import { useState } from "react"

const categories = [
  { id: "all", label: "All" },
  { id: "uniforms", label: "Uniforms" },
  { id: "sparring-gear", label: "Sparring Gear" },
  { id: "boxing", label: "Boxing" },
  { id: "belts", label: "Belts" },
  { id: "weapons", label: "Training Weapons" },
  { id: "accessories", label: "Accessories" },
]

const products = [
  { name: "Karate uniform", price: "₹ 2500", category: "uniforms", img: "/assets/img/store/img1.png" },
  { name: "Square Blade Kama", price: "₹ 2500", category: "weapons", img: "/assets/img/store/img7.png" },
  { name: "Power Tilt Free Standing Bag", price: "₹ 2500", category: "accessories", img: "/assets/img/store/img10.png" },
  { name: "TKD uniform", price: "₹ 2500", category: "uniforms", img: "/assets/img/store/img3.png" },
  { name: "Kung fu uniform", price: "₹ 2500", category: "uniforms", img: "/assets/img/store/img4.png" },
  { name: "Rattan Bo II Tiger", price: "₹ 2500", category: "weapons", img: "/assets/img/store/img5.png" },
  { name: "Ultra Lite Chest Guard", price: "₹ 2500", category: "accessories", img: "/assets/img/store/img13.png" },
  { name: "Determination Kickboxing Punches", price: "₹ 2500", category: "weapons", img: "/assets/img/store/img6.png" },
  { name: "Course Available Locations", price: "₹ 2500", category: "uniforms", img: "/assets/img/store/img2.png" },
  { name: "Square Blade Kama", price: "₹ 2500", category: "accessories", img: "/assets/img/store/img11.png" },
  { name: "Determination Kickboxing Punches", price: "₹ 2500", category: "boxing", img: "/assets/img/store/img14.png" },
  { name: "Double Wrap Solid Karate Belt", price: "₹ 2500", category: "accessories", img: "/assets/img/store/img15.png" },
  { name: "Uppercut Heavy Bag", price: "₹ 2500", category: "accessories", img: "/assets/img/store/img12.png" },
  { name: "Kick-short", price: "₹ 2500", category: "sparring-gear", img: "/assets/img/store/img16.png" },
  { name: "Practice Speedchuck", price: "₹ 2500", category: "weapons", img: "/assets/img/store/img8.png" },
  { name: "Dragon Samurai Sword", price: "₹ 2500", category: "weapons", img: "/assets/img/store/img9.png" },
]

export default function StorePage() {
  const [filter, setFilter] = useState("all")

  const filteredProducts =
    filter === "all"
      ? products
      : products.filter((p) => p.category === filter)

  return (
    <main className="min-h-screen bg-[#171A26]">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <img
          src="/assets/img/store/slider_img.png"
          alt="Store"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 mx-auto px-4 max-w-7xl">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white uppercase mb-2">Store</h1>
            <h2 className="text-3xl md:text-4xl font-bold text-[#F73322] mb-4">Gear for the Way.</h2>
            <p className="text-gray-200 text-lg">
              Quality training gear and equipment hand-picked by Rock Martial Arts
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-16 md:py-20 bg-[#171A26]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-wrap gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                  filter === cat.id
                    ? "bg-[#FFB70F] text-black"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product, i) => (
              <div
                key={`${product.name}-${i}`}
                className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800 hover:border-[#FFB70F]/50 transition-colors"
              >
                <div className="aspect-square flex items-center justify-center p-4 bg-gray-900">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white capitalize mb-1">{product.name}</h4>
                  <p className="text-[#FFB70F] font-medium">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
