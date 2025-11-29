import { 
  Type, 
  AlignLeft, 
  Image as ImageIcon, 
  Video, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Code, 
  HelpCircle,
  Table,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SectionPaletteProps {
  onSelect: (type: string) => void;
  children: React.ReactNode;
}

const sectionTypes = [
  { type: "rich-text", label: "Rich Text", icon: FileText },
  { type: "heading", label: "Heading", icon: Type },
  { type: "subheading", label: "Sub-heading", icon: Type },
  { type: "paragraph", label: "Paragraph", icon: AlignLeft },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "video", label: "Video", icon: Video },
  { type: "link", label: "Link", icon: LinkIcon },
  { type: "list", label: "List", icon: List },
  { type: "code", label: "Code", icon: Code },
  { type: "table", label: "Table", icon: Table },
  { type: "qna", label: "Q&A", icon: HelpCircle },
];

export function SectionPalette({ onSelect, children }: SectionPaletteProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end" side="top">
        <div className="grid grid-cols-2 gap-2">
          {sectionTypes.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant="ghost"
              className="flex h-auto flex-col items-center justify-center py-4 hover:bg-gray-50"
              onClick={() => onSelect(type)}
            >
              <Icon className="mb-2 h-5 w-5 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">{label}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
