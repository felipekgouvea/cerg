import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, FileText, GraduationCap } from "lucide-react";
import { PreEnrollmentForm } from "../(protected)/rematricula/components/pre-enrollment-form";
import PreRegistrationFormDialog from "../(protected)/registration/components/pre-registration-form-dialog";

const Matricula = () => {
  return (
    <section
      id="como-funciona"
      className="bg-gradient-to-br from-gray-50 to-yellow-50 py-20"
    >
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Como Funciona a Matrícula
          </h2>
          <p className="text-xl text-gray-600">
            Processo simples e acolhedor em 4 passos
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {[
            {
              icon: FileText,
              title: "Realize a pré-matrícula online",
              desc: "Preencha o formulário de pré-matrícula no site de forma rápida e prática",
              color: "from-blue-500 to-blue-600",
            },
            {
              icon: Calendar,
              title: "Agende sua visita (opcional)",
              desc: "Conheça nossa estrutura, metodologia e equipe de perto",
              color: "from-red-500 to-red-600",
            },
            {
              icon: FileText,
              title: "Entregue a documentação",
              desc: "Nossa equipe orienta você sobre todos os documentos necessários",
              color: "from-purple-500 to-purple-600",
            },
            {
              icon: CreditCard,
              title: "Efetue o pagamento da matrícula",
              desc: "Oferecemos formas flexíveis e condições especiais para sua família",
              color: "from-green-500 to-green-600",
            },
          ].map((step, index) => (
            <div key={index} className="relative text-center">
              <div
                className={`h-24 w-24 bg-gradient-to-br ${step.color} mx-auto mb-6 flex transform items-center justify-center rounded-full shadow-xl transition-all hover:scale-110 hover:shadow-2xl`}
              >
                <step.icon className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -left-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-lg font-bold text-white shadow-lg">
                {index + 1}
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                {step.title}
              </h3>
              <p className="leading-relaxed text-gray-600">{step.desc}</p>
              {index < 3 && (
                <div className="absolute top-12 -right-4 hidden h-1 w-8 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 md:block"></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button
            size="lg"
            className="w-full cursor-pointer rounded-full p-8 text-[25px]"
          >
            <PreRegistrationFormDialog />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Matricula;
