import { Wheat } from "lucide-react";
import Image from "next/image";

import Aluno_01 from "../../../public/aluno-01.png";
import Aluno_02 from "../../../public/aluno-02.png";

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

      <div className="relative container mx-auto px-4 pt-16 pb-16 md:pb-0">
        <article className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <h1
              className="text-3xl leading-10 font-bold md:text-4xl lg:text-5xl"
              data-aos="fade-down"
            >
              Matriculas abertas 2026 - Em Outubro
            </h1>
            <p className="lg:text-lg" data-aos="fade-right">
              Oferecemos um ensino de qualidade em um ambiente acolhedor,
              garantindo o desenvolvimento, o bem-estar e a felicidade dos
              nossos alunos.
            </p>

            <a
              data-aos="fade-up"
              data-aos-delay="500"
              target="_blank"
              href={`https://wa.me/5527999151404?text=Olá vim pelo site e gostaria de mais informações`}
              className="flex w-fit items-center justify-center gap-2 rounded-md bg-green-500 px-5 py-2 font-semibold"
            >
              <Wheat className="h-5 w-5" />
              Contato via WhatsApp
            </a>

            <div className="mt-8">
              <p>
                Garanta seu desconto especial na rematrícula, realizando sua
                pré-matrícula em setembro!
              </p>
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
