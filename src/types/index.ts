export interface FileConversion {
  status: string;
  selectedType: string;
  downloadUrl?: string;
  error?: string;
}

export interface FileItem {
  id: number;
  file: File;
  conversion: FileConversion;
}
