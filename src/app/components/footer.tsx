import { Clock, Instagram, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";

import LogoMarca from "../../../public/logo.png";

const Footer = () => {
  return (
    <footer id="contato" className="bg-gray-900 py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <Image
                src={LogoMarca}
                alt="Centro Educacional Ribeiro Gouvêa - CERG"
                width={140}
                height={40}
                className="h-16 w-auto object-contain"
                priority
              />
            </div>
            <p className="leading-relaxed text-gray-300">
              32 anos formando gerações com amor, dedicação, qualidade e
              excelência pedagógica. Seu filho merece o melhor!
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-red-400">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-red-400" />
                <span className="text-gray-300">(27) 9.9915-1404</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-red-400" />
                <span className="text-gray-300">
                  secretaria@ceribeirogouvea.com.br
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-red-400" />
                <span className="text-gray-300">
                  Rua João Bubach, 95, Cruzeiro do Sul - Cariacica/ES
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-red-400">
              Horário de Atendimento
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-red-400" />
                <span className="text-gray-300">
                  Segunda a Sexta - 7h às 18h
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-red-400">Redes Sociais</h4>
            <div className="flex space-x-4">
              <div className="flex h-12 w-12 transform cursor-pointer items-center justify-center rounded-full bg-pink-600 shadow-lg transition-all hover:scale-110 hover:bg-pink-700">
                <a href="https://instagram.com/ribeiro.gouvea">
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Siga-nos e acompanhe o dia a dia dos nossos alunos!
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Centro Educacional Ribeiro Gouvêa.
          </p>
          <p className="text-gray-400">Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
