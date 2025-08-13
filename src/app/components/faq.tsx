import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Phone } from "lucide-react";
import Link from "next/link";
import { faqList } from "../helpers/faq";

const Faq = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Perguntas Frequentes
          </h2>
          <p className="text-gray-600">Esclarecemos as principais dúvidas</p>
          <p className="text-gray-600">dos pais sobre o CERG</p>
        </div>

        <div className="mx-auto max-w-4xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqList.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="overflow-hidden rounded-2xl border-0 bg-white shadow-lg"
              >
                <AccordionTrigger className="px-8 py-6 text-left transition-colors hover:bg-red-50 hover:no-underline">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-600">
                      <span className="text-sm font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {faq.pergunta}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6">
                  <div className="pl-12">
                    <p className="leading-relaxed text-gray-700">
                      {faq.resposta}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <p className="mb-6 text-lg text-gray-600">
            Ainda tem dúvidas? Nossa equipe está pronta para ajudar!
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="https://wa.me/5527999151404?text=Olá, Gostaria de informações sobre o processo de matrícula."
              className="flex items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-8 py-3 font-semibold text-white hover:from-red-700 hover:to-red-800"
            >
              <Phone className="mr-2 h-5 w-5" />
              Falar no WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;
