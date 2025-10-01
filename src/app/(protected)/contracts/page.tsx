import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/app/components/page-container";
import ContractsTable from "./components/contracts-table";

export const metadata = { title: "Contratos" };

export default async function ContractsPage() {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Contratos (2026)</PageTitle>
          <PageDescription>
            Gerencie matrículas e o financeiro anual.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <ContractsTable />
      </PageContent>
    </PageContainer>
  );
}
