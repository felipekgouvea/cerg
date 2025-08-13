import { Calendar, CreditCard, FileText, GraduationCap } from "lucide-react";
import Footer from "./components/footer";
import Fundamental from "./components/fundamental";
import { Header } from "./components/header";
import { Hero } from "./components/hero";
import Infantil from "./components/infantil";
import Integral from "./components/integral";
import MeioPeriodo from "./components/meio-periodo";
import Matricula from "./components/matricula";
import MateriaisUniformes from "./components/materiais-uniformes";
import DocumentosMatricula from "./components/documentos-matricula";
import Faq from "./components/faq";
import { About } from "./components/about";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50">
      <Header />
      <Hero />
      <About />
      <Infantil />
      <Fundamental />
      <Integral />
      <MeioPeriodo />
      <Matricula />
      <MateriaisUniformes />
      <DocumentosMatricula />
      <Faq />
      <Footer />
    </div>
  );
};

export default HomePage;
