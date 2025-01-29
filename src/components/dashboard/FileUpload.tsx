import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validTypes = [
      'text/csv',
      'application/json',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const validFiles = files.filter(file => validTypes.includes(file.type));
    
    if (validFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload CSV, JSON, or Excel files only.",
        variant: "destructive"
      });
      return;
    }

    // Here we would handle file processing
    toast({
      title: "Files received",
      description: `Successfully received ${validFiles.length} file(s) for processing.`
    });

    console.log('Files to process:', validFiles);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-6">Upload Data Sources</h2>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop your files here, or
        </p>
        <label className="mt-4 inline-block">
          <input
            type="file"
            className="hidden"
            multiple
            accept=".csv,.json,.xlsx,.xls"
            onChange={handleFileInput}
          />
          <Button variant="outline" type="button">
            Select Files
          </Button>
        </label>
        <p className="mt-2 text-xs text-gray-500">
          Supported formats: CSV, JSON, Excel
        </p>
      </div>
    </div>
  );
};

export default FileUpload;