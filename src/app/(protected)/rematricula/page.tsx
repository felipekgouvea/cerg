import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/app/components/page-container";
import { Button } from "@/components/ui/button";
import EnrollmentTable from "./components/enrollment-table";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PreEnrollmentsPage() {
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
          <PageTitle>PRÉ-REMATRÍCULAS</PageTitle>
          <PageDescription>
            Gerencie as PRÉ-REMATRÍCULAS do CERG
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          {/* Coloque seu ExportButton aqui se quiser exportar os dados da tabela */}
          {/* <ExportButton data={...} /> */}
          <Button className="cursor-pointer" variant="default">
            Adicionar Aluno
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <EnrollmentTable />
      </PageContent>
    </PageContainer>
  );
}
