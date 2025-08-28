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
import RegistrationTable from "./components/registration-table";
import PreRegistrationFormDialog from "./components/pre-registration-form-dialog";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PreRegistrationsPage() {
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
          <PageTitle>PRÉ-MATRÍCULAS</PageTitle>
          <PageDescription>Gerencie as PRÉ-MATRÍCULAS do CERG</PageDescription>
        </PageHeaderContent>
        <PageActions>
          {/* Botão/Modal para criar nova pré-matrícula */}
          {/* <PreRegistrationFormDialog /> */}
          <Button className="cursor-pointer" variant="default">
            Exportar
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        <RegistrationTable />
      </PageContent>
    </PageContainer>
  );
}
