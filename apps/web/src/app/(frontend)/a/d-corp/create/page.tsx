import { CreationWizard } from "./_components/creation-wizard";

export const metadata = {
  title: "Create D-Corp",
  description: "Launch a new Distributed Corporation with custom profit distribution",
};

export default function CreateDCorpPage() {
  return <CreationWizard />;
}