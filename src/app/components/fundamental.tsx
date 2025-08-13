import { CheckCircle, School } from "lucide-react";
import Image from "next/image";

import Aluno_01 from "../../../public/ENSINO FUNDAMENTAL.jpg";
import Aluno_02 from "../../../public/FUNDAMENTAL_01.jpg";
import Aluno_03 from "../../../public/FUNDAMENTAL_02.jpg";
import Aluno_04 from "../../../public/JUDO.jpg";

const Fundamental = () => {
  return (
    <section
      id="ensino-fundamental"
      className="bg-gradient-to-br from-blue-50 to-white py-20"
    >
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <School className="h-10 w-10 text-white" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-5xl">
            Ensino Fundamental I
          </h2>
          <p className="text-gray-600">
            Formação sólida e preparação para o futuro
          </p>
          <p className="text-gray-600">1º ao 5º ano</p>
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-center text-2xl font-bold text-gray-900">
                Metodologia Ativa e Interdisciplinar
              </h3>
              <p className="text-lg leading-relaxed text-gray-700">
                No Ensino Fundamental I, focamos no desenvolvimento das
                competências essenciais para a formação acadêmica e cidadã,
                preparando os alunos para os desafios futuros com uma base
                sólida de conhecimento.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-blue-500" />
                  <span className="text-gray-700">1º ao 5º ano</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-blue-500" />
                  <span className="text-gray-700">
                    Projetos interdisciplinares
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-blue-500" />
                  <span className="text-gray-700">Aulas de Musicalização</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-blue-500" />
                  <span className="text-gray-700">Aulas de Ballet ou Judô</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-blue-500" />
                  <span className="text-gray-700">Aulas de Língua Inglesa</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-blue-500" />
                  <span className="text-gray-700">
                    Acompanhamento individual
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-blue-100 to-blue-200 p-6">
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
                    <div className="text-xl font-bold text-blue-600">
                      R$ 630,00
                    </div>
                    <div className="text-lg text-gray-500 line-through">
                      R$ 650,00
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
                src={Aluno_01}
                alt="Alunos estudando no ensino fundamental"
                width={200}
                height={250}
                className="w-full rounded-3xl object-cover shadow-2xl"
              />
              <Image
                src={Aluno_02}
                alt="Aula de matemática interativa"
                width={200}
                height={180}
                className="w-full rounded-3xl object-cover shadow-2xl"
              />
            </div>
            <div className="space-y-4 pt-8">
              <Image
                src={Aluno_03}
                alt="Laboratório de ciências"
                width={200}
                height={200}
                className="w-full rounded-3xl object-cover shadow-2xl"
              />
              <Image
                src={Aluno_04}
                alt="Biblioteca escolar"
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

export default Fundamental;
