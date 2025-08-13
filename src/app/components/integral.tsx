import { CheckCircle, Sun } from "lucide-react";
import Image from "next/image";

import Aluno_01 from "../../../public/INTEGRAL.jpg";
import Aluno_02 from "../../../public/INTEGRAL_01.jpg";
import Aluno_03 from "../../../public/INTEGRAL_02.jpg";
import Aluno_04 from "../../../public/INFANTIL_02.jpg";

const Integral = () => {
  return (
    <section
      id="periodo-integral"
      className="bg-gradient-to-br from-yellow-50 to-white py-20"
    >
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
            <Sun className="h-10 w-10 text-white" />
          </div>
          <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Período Integral
          </h2>
          <p className="text-xl text-gray-600">Cuidado e educação completa</p>
          <p className="text-xl text-gray-600">das 7h às 18h30</p>
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-center text-3xl font-bold text-gray-900">
                Desenvolvimento Integral
              </h3>
              <p className="text-lg leading-relaxed text-gray-700">
                O Período Integral oferece uma rotina completa e equilibrada,
                combinando atividades pedagógicas, recreativas, esportivas e
                culturais, proporcionando o desenvolvimento pleno da criança.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-yellow-500" />
                  <span className="text-gray-700">Horário: 7h às 18h30</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-yellow-500" />
                  <span className="text-gray-700">Café da manhã e Almoço</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-yellow-500" />
                  <span className="text-gray-700">
                    Atividades extracurriculares
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-yellow-500" />
                  <span className="text-gray-700">Apoio pedagógico</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-yellow-500" />
                  <span className="text-gray-700">Robótica</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-yellow-500" />
                  <span className="text-gray-700">Recreação dirigida</span>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-yellow-100 to-yellow-200 p-6">
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
                    <div className="text-xl font-bold text-yellow-600">
                      R$ 1.300,00
                    </div>
                    <div className="text-lg text-gray-500 line-through">
                      R$ 1.410,00
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
                alt="Crianças no refeitório"
                width={200}
                height={250}
                className="w-full rounded-3xl object-cover shadow-2xl"
              />
              <Image
                src={Aluno_02}
                alt="Atividades recreativas"
                width={200}
                height={180}
                className="w-full rounded-3xl object-cover shadow-2xl"
              />
            </div>
            <div className="space-y-4 pt-8">
              <Image
                src={Aluno_03}
                alt="Aula de ballet"
                width={200}
                height={200}
                className="w-full rounded-3xl object-cover shadow-2xl"
              />
              <Image
                src={Aluno_04}
                alt="Aula de judô"
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

export default Integral;
