import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, GraduationCap, Phone, Users } from "lucide-react";

const MateriaisUniformes = () => {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Materiais e Uniformes
          </h2>
          <p className="text-gray-600">
            Tudo que seu filho precisa para um ano letivo completo
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <Card className="rounded-3xl bg-white p-8 shadow-xl transition-all hover:shadow-2xl">
            <CardContent className="space-y-6 p-0">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Material Didático
                </h3>
                <p className="mb-6 text-gray-600">
                  Utilizamos materiais da renomada Editora FTD
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 p-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex flex-auto flex-col gap-3">
                    <div>
                      <span className="font-bold text-gray-900">
                        Educação Infantil
                      </span>
                      <p className="text-sm text-gray-600">
                        Coleção Saber Mais
                      </p>
                    </div>
                    <span className="font-bold text-red-600">R$ 679,00</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 p-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex flex-auto flex-col gap-3">
                    <div>
                      <span className="font-bold text-gray-900">
                        Ensino Fundamental
                      </span>
                      <p className="text-sm text-gray-600">
                        Coleção Quero Saber Mais
                      </p>
                    </div>
                    <span className="font-bold text-blue-600">R$ 1.578,00</span>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl bg-green-50 p-2 text-center">
                  <p className="font-semibold text-green-700">
                    💳 Parcelamento em 6x no cartão
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Sem juros para facilitar o pagamento
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Entrega do material será realizada na escola
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Link para compra dos Livros
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-white p-8 shadow-xl transition-all hover:shadow-2xl">
            <CardContent className="space-y-6 p-0">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Uniformes Escolares
                </h3>
                <p className="mb-6 text-gray-600">
                  Uniformes completos e confortáveis para todas as atividades
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 p-6 text-center">
                <p className="mb-2 text-xl font-bold text-gray-900">
                  Malharia Ásia Uniformes
                </p>
                <div className="mb-3 flex items-center justify-center space-x-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">
                    (27) 99276-9000
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MateriaisUniformes;
