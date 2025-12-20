import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X, Upload, Link, Loader2 } from 'lucide-react';

interface FileSourceEditorProps {
  label: string;
  uploadUrl: string | null;
  linkUrl: string | null;
  onUpload: (file: File) => void;
  onLinkChange: (link: string | null) => void;
  onRemoveUpload: () => void;
  isUploading: boolean;
}

type SourceType = 'none' | 'upload' | 'link';

export function FileSourceEditor({
  label,
  uploadUrl,
  linkUrl,
  onUpload,
  onLinkChange,
  onRemoveUpload,
  isUploading,
}: FileSourceEditorProps) {
  // Determine initial source type based on existing data
  const getInitialSourceType = (): SourceType => {
    if (uploadUrl) return 'upload';
    if (linkUrl) return 'link';
    return 'none';
  };

  const [sourceType, setSourceType] = useState<SourceType>(getInitialSourceType());
  const [linkInput, setLinkInput] = useState(linkUrl || '');

  const handleSourceTypeChange = (value: SourceType) => {
    setSourceType(value);
    
    // Clear the other source when switching
    if (value === 'upload') {
      onLinkChange(null);
      setLinkInput('');
    } else if (value === 'link') {
      if (uploadUrl) {
        onRemoveUpload();
      }
    } else if (value === 'none') {
      if (uploadUrl) {
        onRemoveUpload();
      }
      onLinkChange(null);
      setLinkInput('');
    }
  };

  const handleLinkInputChange = (value: string) => {
    setLinkInput(value);
    onLinkChange(value.trim() || null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      setSourceType('upload');
    }
  };

  const handleRemoveUpload = () => {
    onRemoveUpload();
    setSourceType('none');
  };

  return (
    <div className="space-y-3 p-3 border border-border rounded-lg">
      <Label className="font-medium">{label}</Label>
      
      <RadioGroup 
        value={sourceType} 
        onValueChange={(v) => handleSourceTypeChange(v as SourceType)}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="none" id={`${label}-none`} />
          <Label htmlFor={`${label}-none`} className="text-sm font-normal cursor-pointer">None</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="upload" id={`${label}-upload`} />
          <Label htmlFor={`${label}-upload`} className="text-sm font-normal cursor-pointer flex items-center gap-1">
            <Upload className="h-3 w-3" /> Upload PDF
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="link" id={`${label}-link`} />
          <Label htmlFor={`${label}-link`} className="text-sm font-normal cursor-pointer flex items-center gap-1">
            <Link className="h-3 w-3" /> External Link
          </Label>
        </div>
      </RadioGroup>

      {sourceType === 'upload' && (
        <div className="space-y-2">
          {uploadUrl ? (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <span className="text-sm text-muted-foreground flex-1 truncate">PDF uploaded</span>
              <Button size="sm" variant="ghost" onClick={handleRemoveUpload}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={isUploading}
                className="flex-1"
              />
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          )}
        </div>
      )}

      {sourceType === 'link' && (
        <Input
          type="url"
          value={linkInput}
          onChange={(e) => handleLinkInputChange(e.target.value)}
          placeholder="Enter external file URL..."
        />
      )}
    </div>
  );
}
