import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import footer_logo from "../public/footer_logo.png"
import landing_left from "../public/landing_left.gif";
import landing_right from "../public/landing_right.gif";

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/intro-bg.png')",
        }}
      />

      {/* Content Overlay - centered */}
      <div className="relative z-20 min-h-screen flex  flex-col items-center justify-center xl:justify-start xl:mt-[60px] px-4 text-center">
        <div className="mb-[15px]">
          <Image src={footer_logo} alt="Logo" height={200} width={200} className="w-[100px] h-[100px] md:w-[200px] md:h-[200px]" />
        </div>

        <h1 className="text-sm md:text-5xl lg:text-3xl font-light text-black mb-1 max-w-4xl leading-tight">
          {"TRAIN LIKE A WARRIOR, CONQUER LIKE A CHAMPION."}
        </h1>

        <p className="text-[14px] md:text-xl font-semibold text-black mb-5 max-w-3xl leading-tight">
          {"STRENGTH OF THE BODY, DISCIPLINE OF THE MIND, SPIRIT OF A WARRIOR."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-normal text-lg px-12 py-6 rounded-lg  min-w-[160px]">
              SIGN IN
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gray-800 hover:bg-gray-900 text-white font-normal text-lg px-12 py-6 rounded-lg min-w-[160px]">
              REGISTER
            </Button>
          </Link>
        </div>
      </div>

      {/* GIFs as bottom overlay */}
      <div className="absolute bottom-30  md:bottom-0 left-0 right-0 flex justify-between items-end z-10 pointer-events-none mt-[100px]">
        <Image
          src={landing_left}
          alt="left"
          className="w-[50%] h-auto object-contain transform scale-x-[-1]"
        />
        <Image
          src={landing_right}
          alt="right"
          className="w-[50%] h-auto object-contain"
        />
      </div>
    </div>
  )
}
