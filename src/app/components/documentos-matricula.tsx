import { CheckCircle } from "lucide-react";

const DocumentosMatricula = () => {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-5xl">
            Documentos Necessários para Matrícula
          </h2>
          <p className="text-gray-600">
            Prepare estes documentos para agilizar
          </p>
          <p className="text-gray-600">a matrícula do seu(sua) filho(a)</p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { doc: "Foto 3x4", icon: "📷" },
            { doc: "Certidão de nascimento do aluno(a)", icon: "📄" },
            { doc: "RG e CPF do responsável", icon: "🆔" },
            { doc: "Declaração Escolar 2025", icon: "📋" },
            { doc: "Histórico Escolar (2º ao 5º ano)", icon: "📚" },
            { doc: "Declaração de Vacina", icon: "💉" },
            { doc: "Comprovante de residência", icon: "🏠" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white p-6 shadow-lg transition-all hover:shadow-xl"
            >
              <div className="text-3xl">{item.icon}</div>
              <div className="flex flex-1 items-center space-x-3">
                <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-500" />
                <span className="font-medium text-gray-700">{item.doc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-3xl bg-gradient-to-r from-blue-50 to-blue-100 p-8 text-center">
          <p className="text-lg font-semibold text-blue-800">
            💡 Nossa equipe está pronta para te ajudar com qualquer dúvida sobre
            a documentação!
          </p>
        </div>
      </div>
    </section>
  );
};

export default DocumentosMatricula;
