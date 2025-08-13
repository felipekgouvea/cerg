import { Baby, CheckCircle } from "lucide-react";
import Image from "next/image";

import Image_01 from "../../../public/INFANTIL_01.jpg";
import Image_02 from "../../../public/INFANTIL.jpg";
import Image_03 from "../../../public/INFANTIL_05.jpg";
import Image_04 from "../../../public/INFANTIL_03.jpg";

const Infantil = () => {
  return (
    <section
      id="educacao-infantil"
      className="bg-gradient-to-br from-pink-50 to-white py-20"
    >
      <h2 className="mb-14 text-center text-4xl font-bold">
        NOSSOS SERVIÇOS PARA 2026
      </h2>
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
            <Baby className="h-10 w-10 text-white" />
          </div>
          <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Educação Infantil
          </h2>
          <p className="text-gray-600">
            Desenvolvimento integral para crianças
          </p>
          <p className="text-gray-600">de 3 a 5 anos</p>
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-center text-2xl font-bold text-gray-900">
                Metodologia Lúdica e Acolhedora
              </h3>
              <p className="text-justify text-lg leading-relaxed text-gray-700">
                Nossa Educação Infantil é baseada no brincar como forma de
                aprender. Desenvolvemos atividades que estimulam a criatividade,
                coordenação motora e habilidades socioemocionais das crianças.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-pink-500" />
                  <span className="text-gray-700">Maternal II (3 anos)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-pink-500" />
                  <span className="text-gray-700">PRÉ I (4 anos)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-pink-500" />
                  <span className="text-gray-700">PRÉ II (5 anos)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-pink-500" />
                  <span className="text-gray-700">Atividades lúdicas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-pink-500" />
                  <span className="text-gray-700">Aulas de Ballet ou Judô</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-pink-500" />
                  <span className="text-gray-700">
                    Aulas de Língua Inglesa e Musicalização
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-pink-100 to-pink-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="max-w-50">
                    <h4 className="mb-2 text-2xl font-bold text-gray-900">
                      Investimento
                    </h4>
                    <p className="text-gray-600">
                      Mensalidade com desconto para pagamento até dia 05
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-pink-600">
                      R$ 530,00
                    </div>
                    <div className="text-lg text-gray-500 line-through">
                      R$ 550,00
                    </div>
                    <div className="text-sm text-gray-600">por mês</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <Image
                src={Image_01}
                alt="Crianças brincando na educação infantil"
                width={200}
                height={250}
                className="w-full rounded-3xl object-cover shadow-2xl"
              />
              <Image
                src={Image_02}
                alt="Atividades lúdicas no maternal"
                width={200}
                height={180}
                className="w-full rounded-3xl object-cover shadow-2xl"
              />
            </div>
            <div className="space-y-4 pt-8">
              <Image
                src={Image_03}
                alt="Crianças pintando e desenhando"
                width={200}
                height={200}
                className="w-full rounded-3xl object-cover shadow-2xl"
              />
              <Image
                src={Image_04}
                alt="Roda de conversa na educação infantil"
                width={200}
                height={220}
                className="w-full rounded-3xl object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Infantil;
