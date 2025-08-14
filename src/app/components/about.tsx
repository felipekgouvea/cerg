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
                A Escola Infantil Brilho de Lua foi fundada em 1994, tendo como
                fundadoras as educadoras Marasilva Falcão de Gouvêa, Maria
                Aparecida Gouvêa Altoé e Rosa Maria de Oliveira que sempre
                contribuíram com os aspectos educacionais e sociais de
                Cariacica.
              </p>

              <p className="text-justify text-lg leading-relaxed text-gray-700">
                Sendo assim o nosso intuito foi de junto com sua família formar
                uma Escola de Futuro, com metodologia própria, promovendo o seu
                crescimento integral, através de um relacionamento de confiança
                e respeito mútuo, entre aluno – professor – família.
              </p>

              <p className="text-justify text-lg leading-relaxed text-gray-700">
                No ano de 2011, a escola passou a se chamar CENTRO EDUCACIONAL
                RIBEIRO GOUVÊA. Essa mudança mostra o crescimento da instituição
                e o desejo de suas mantenedoras em homenagear seus pais.
              </p>

              <p className="text-justify text-lg leading-relaxed text-gray-700">
                No ano de 2015 Lacilda Reinoso Kinupes Gouvêa e Felipe Kinupes
                Gouvêa, assumiram a administração da instituição e procuraram
                manter a qualidade do ensino e modernizar alguns processos
                pedagógicos e operacionais. Ofertar uma educação de qualidade
                apoiada por princípios inovadores e com uma relação de confiança
                e respeito com as famílias, continua sendo o principal
                compromisso da instituição.{" "}
              </p>

              <p className="text-justify text-lg leading-relaxed text-gray-700">
                <strong className="text-red-600">Há 31 anos</strong>, nossa
                instituição tem se dedicado à formação integral de nossos
                alunos.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-red-500" />
                  <span className="font-medium text-gray-700">
                    Fundada em 1994 com tradição em educação
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
