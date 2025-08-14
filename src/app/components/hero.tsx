import { Wheat } from "lucide-react";
import Image from "next/image";

import Aluno_01 from "../../../public/aluno-01.png";
import Aluno_02 from "../../../public/aluno-02.png";
import PreEnrollmentDialog from "./pre-enrollment-form";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#E84C3D] text-white">
      <div>
        <Image
          src={Aluno_01}
          alt="Foto da Aluna"
          fill
          sizes="100vw"
          priority
          quality={100}
          className="object-cover opacity-60 lg:hidden"
        />
        <div className="absolute inset-0 bg-black opacity-40 md:hidden"></div>
      </div>

      <div className="relative container mx-auto px-4 pt-16 pb-6 md:pb-0">
        <article className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <h1
              className="text-center text-3xl leading-10 font-bold md:text-4xl lg:text-5xl"
              data-aos="fade-down"
            >
              PRÉ-REMATRÍCULAS EM SETEMBRO
            </h1>
            <p className="lg:text-lg" data-aos="fade-right">
              Oferecemos um ensino de qualidade em um ambiente acolhedor,
              garantindo o desenvolvimento, o bem-estar e a felicidade dos
              nossos alunos.
            </p>

            <PreEnrollmentDialog />

            <div className="mt-8">
              <p>
                Garanta seu desconto especial na rematrícula, realizando sua
                pré-rematrícula em setembro!
              </p>
            </div>
            <div className="mt-8 text-center text-[40px]">
              <h1
                className="text-center text-2xl leading-10 font-bold md:text-4xl lg:text-5xl"
                data-aos="fade-down"
              >
                PRÉ-MATRÍCULAS EM OUTUBRO
              </h1>
            </div>
          </div>

          <div className="relative hidden h-full md:block">
            <Image
              src={Aluno_02}
              alt="Foto do dog"
              className="object-contain"
              fill
              sizes="(max-width: 768px) 0vw, 50vw"
              quality={100}
              priority
            />
          </div>
        </article>
      </div>
    </section>
  );
}
