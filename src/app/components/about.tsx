import { Check, CheckCircle, MapPin, Phone, Wheat } from "lucide-react";
import Image from "next/image";

import Image_01 from "../../../public/17.png";
import Image_02 from "../../../public/18.png";
import Image_03 from "../../../public/20.png";
import Image_04 from "../../../public/38.png";
import Image_05 from "../../../public/22.png";
import Image_06 from "../../../public/23.png";
import Image_07 from "../../../public/26.png";
import Image_08 from "../../../public/5.png";
import { Button } from "@/components/ui/button";

export function About() {
  return (
    <section className="bg-gradient-to-br from-yellow-50 to-orange-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="mb-6 text-4xl font-bold text-gray-900 lg:text-5xl">
                SOBRE A ESCOLA
              </h2>

              <p className="text-justify text-lg leading-relaxed text-gray-700">
                O Centro Educacional Ribeiro Gouvêa foi fundado com o propósito
                de oferecer uma educação de excelência, baseada em valores
                sólidos e metodologia inovadora. Ao longo de{" "}
                <strong className="text-red-600">32 anos</strong>, nossa
                instituição tem se dedicado à formação integral de crianças e
                jovens.
              </p>

              <p className="text-justify text-lg leading-relaxed text-gray-700">
                Nosso compromisso é formar cidadãos conscientes, críticos e
                preparados para os desafios do futuro. Trabalhamos em parceria
                com as famílias, criando um ambiente acolhedor onde cada aluno
                pode desenvolver seu potencial máximo através de um
                relacionamento de confiança e respeito mútuo.
              </p>

              <p className="text-justify text-lg leading-relaxed text-gray-700">
                Com uma equipe pedagógica altamente qualificada e infraestrutura
                moderna, o CERG oferece desde a Educação Infantil até o Ensino
                Fundamental I, sempre priorizando a qualidade do ensino e o
                desenvolvimento socioemocional dos nossos alunos.
              </p>

              <p className="text-justify text-lg leading-relaxed text-gray-700">
                Nossa metodologia combina tradição e inovação, proporcionando
                experiências educativas significativas que preparam nossos
                alunos para serem protagonistas de suas próprias histórias.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-red-500" />
                  <span className="font-medium text-gray-700">
                    Fundada há 32 anos com tradição em educação
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-red-500" />
                  <span className="font-medium text-gray-700">
                    Equipe pedagógica qualificada e experiente
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-red-500" />
                  <span className="font-medium text-gray-700">
                    Parceria sólida com as famílias
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <Image
                src={Image_01}
                alt="Crianças estudando na sala de aula"
                width={220}
                height={280}
                className="w-full rounded-3xl object-cover shadow-2xl transition-transform duration-300 hover:scale-105"
              />
              <Image
                src={Image_02}
                alt="Atividades recreativas no pátio"
                width={220}
                height={200}
                className="w-full rounded-3xl object-cover shadow-2xl transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="space-y-4 pt-8">
              <Image
                src={Image_03}
                alt="Professora ensinando matemática"
                width={220}
                height={220}
                className="w-full rounded-3xl object-cover shadow-2xl transition-transform duration-300 hover:scale-105"
              />
              <Image
                src={Image_04}
                alt="Crianças no laboratório de ciências"
                width={220}
                height={240}
                className="w-full rounded-3xl object-cover shadow-2xl transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:hidden">
            <div className="space-y-4">
              <Image
                src={Image_05}
                alt="Crianças estudando na sala de aula"
                width={220}
                height={280}
                className="w-full rounded-3xl object-cover shadow-2xl transition-transform duration-300 hover:scale-105"
              />
              <Image
                src={Image_06}
                alt="Atividades recreativas no pátio"
                width={220}
                height={200}
                className="w-full rounded-3xl object-cover shadow-2xl transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="space-y-4 pt-8">
              <Image
                src={Image_07}
                alt="Professora ensinando matemática"
                width={220}
                height={220}
                className="w-full rounded-3xl object-cover shadow-2xl transition-transform duration-300 hover:scale-105"
              />
              <Image
                src={Image_08}
                alt="Crianças no laboratório de ciências"
                width={220}
                height={240}
                className="w-full rounded-3xl object-cover shadow-2xl transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
