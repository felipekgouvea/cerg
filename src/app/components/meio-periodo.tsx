import { CheckCircle, Moon } from "lucide-react";
import Image from "next/image";

import Aluno_01 from "../../../public/MEIO PERIODO.jpg";
import Aluno_02 from "../../../public/MEIO PERIODO_01.jpg";
import Aluno_03 from "../../../public/INFANTIL_01.jpg";
import Aluno_04 from "../../../public/INFANTIL_04.jpg";

const MeioPeriodo = () => {
  return (
    <section
      id="meio-periodo"
      className="bg-gradient-to-br from-green-50 to-white py-20"
    >
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
            <Moon className="h-10 w-10 text-white" />
          </div>
          <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Meio Período
          </h2>
          <p className="text-xl text-gray-600">
            Flexibilidade para sua família
          </p>
          <p className="text-xl text-gray-600">11h às 18h00</p>
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-center text-3xl font-bold text-gray-900">
                Horários Flexíveis
              </h3>
              <p className="text-lg leading-relaxed text-gray-700">
                O Meio Período oferece a flexibilidade que sua família precisa,
                mantendo a qualidade pedagógica e o cuidado que caracterizam o
                CERG, em horários que se adaptam à sua rotina.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-500" />
                  <span className="text-gray-700">Almoço incluso</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-500" />
                  <span className="text-gray-700">
                    Mesma qualidade pedagógica
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-500" />
                  <span className="text-gray-700">Flexibilidade familiar</span>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-green-100 to-green-200 p-6">
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
                    <div className="text-xl font-bold text-green-600">
                      R$ 900,00
                    </div>
                    <div className="text-lg text-gray-500 line-through">
                      R$ 1.020,00
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
                alt="Turma da manhã"
                width={200}
                height={250}
                className="w-full rounded-3xl object-cover shadow-2xl"
              />
              <Image
                src={Aluno_02}
                alt="Atividades da tarde"
                width={200}
                height={180}
                className="w-full rounded-3xl object-cover shadow-2xl"
              />
            </div>
            <div className="space-y-4 pt-8">
              <Image
                src={Aluno_04}
                alt="Recreio escolar"
                width={200}
                height={200}
                className="w-full rounded-3xl object-cover shadow-2xl"
              />
              <Image
                src={Aluno_03}
                alt="Saída da escola"
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

export default MeioPeriodo;
