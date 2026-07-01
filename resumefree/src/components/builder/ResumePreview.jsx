// src/components/builder/ResumePreview.jsx
import { useResumeStore } from "../../store/resumeStore";
import { getTemplate } from "../templates/templateRegistry";

export default function ResumePreview() {
  const { resume, selectedTemplateId } = useResumeStore();
  const { component: TemplateComponent } = getTemplate(selectedTemplateId);

  return <TemplateComponent resume={resume} />;
}