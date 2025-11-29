export function useAISectionEditor(
  setShowAIColumn: (show: boolean) => void,
  setEditingSection: (section: any | null) => void
) {
  const handleSectionSendToAI = (
    sectionId: string,
    sectionType: string,
    sectionContent: any
  ) => {
    // Set the section being edited
    setEditingSection({
      id: sectionId,
      type: sectionType,
      content: sectionContent,
    });

    // Open the AI column
    setShowAIColumn(true);
  };

  return { handleSectionSendToAI };
}
