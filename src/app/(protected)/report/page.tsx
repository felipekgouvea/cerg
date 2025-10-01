import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/app/components/page-container";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ReportBuilder from "./components/report-builder";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Relatórios</PageTitle>
          <PageDescription>
            Exporte relatórios com filtros (Turma, Serviço, Status, Pagamento) e
            campos selecionáveis.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <ReportBuilder />
      </PageContent>
    </PageContainer>
  );
}
