export type ContentPageType =
  | "text"
  | "requirements"
  | "timeline"
  | "investment"
  | "fees"
  | "notes"
  | "agreement"
  | "process"
  | "custom";

export interface ProposalContentPage {
  id: string;
  type: ContentPageType;
  title: string;
  content: string; // HTML or structured text
  is_visible: boolean;
  isVisible?: boolean; // For backward compatibility
  order: number;
  created_at?: string;
}

export interface StaticSlide {
  id?: number;
  slide_number: number;
  image_url: string;
  title: string;
  description: string;
  order: number;
}

export interface Proposal {
  id: string;
  created_by?: number;
  created_by_name?: string;
  created_at?: string;
  last_modified: number;
  lastModified?: number; // For backward compatibility
  
  // Cover Details (flattened from backend)
  prepared_for: string;
  prepared_by: string;
  project_type: string;
  date: string;
  
  // Backward compatibility
  title?: string;
  clientName?: string;
  cover?: {
    preparedFor: string;
    preparedBy: string;
    projectType: string;
    subHeading?: string;
    date: string;
  };

  // Static Showcase
  includeShowcase?: boolean; // If true, includes slides 2-13
  static_slides?: StaticSlide[];

  // Dynamic Pages
  pages: ProposalContentPage[];
}
