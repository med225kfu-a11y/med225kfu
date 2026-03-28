import { useState } from 'react';
import { Lesson } from '@/types/database';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Download, Video, ExternalLink, Link, ChevronDown, ChevronUp, HelpCircle, MessageSquare } from 'lucide-react';
import { useQuizLinks } from '@/hooks/useQuizLinks';
import { useVideoLinks } from '@/hooks/useVideoLinks';
import { useAdditionalFiles } from '@/hooks/useAdditionalFiles';
import { useHelpCenter } from '@/hooks/useHelpCenter';
import { linkifyText } from '@/lib/linkify';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface LessonCardProps {
  lesson: Lesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: quizLinks } = useQuizLinks(lesson.id);
  const { data: videoLinks } = useVideoLinks(lesson.id);
  const { data: additionalFiles } = useAdditionalFiles(lesson.id);
  const { data: helpCenterEntries } = useHelpCenter(lesson.id);

  // Determine the source for transcription (upload takes priority, but either works)
  const transcriptionSource = lesson.transcription_url || lesson.transcription_link;
  const isTranscriptionUpload = !!lesson.transcription_url;

  const hasContent = 
    transcriptionSource || 
    (additionalFiles && additionalFiles.length > 0) ||
    (quizLinks && quizLinks.length > 0) ||
    (videoLinks && videoLinks.length > 0) ||
    lesson.notes ||
    (helpCenterEntries && helpCenterEntries.length > 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors text-left">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h4 className="text-lg font-medium text-foreground truncate">{lesson.title}</h4>
              <StatusBadge status={lesson.status} />
            </div>
            {hasContent && (
              isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
            {/* File Buttons Section */}
            <div className="flex flex-wrap gap-2">
              {transcriptionSource && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a href={transcriptionSource} target="_blank" rel="noopener noreferrer" download={isTranscriptionUpload ? true : undefined}>
                    {isTranscriptionUpload ? <Download className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                    Transcription
                  </a>
                </Button>
              )}
              
              {/* Additional Files */}
              {additionalFiles && additionalFiles.map((file) => {
                const source = file.file_url || file.link_url;
                const isUpload = !!file.file_url;
                if (!source) return null;
                
                return (
                  <Button
                    key={file.id}
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <a href={source} target="_blank" rel="noopener noreferrer" download={isUpload ? true : undefined}>
                      {isUpload ? <Download className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                      {file.label}
                    </a>
                  </Button>
                );
              })}
            </div>
            
            {/* Quiz Links Section */}
            {quizLinks && quizLinks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quizLinks.map((quiz, index) => {
                  const quizUrl = /^https?:\/\//i.test(quiz.url) ? quiz.url : `https://${quiz.url}`;
                  return (
                    <Button
                      key={quiz.id}
                      variant="secondary"
                      size="sm"
                      asChild
                      className="gap-2"
                    >
                      <a href={quizUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Quiz {index + 1}
                      </a>
                    </Button>
                  );
                })}
              </div>
            )}
            
            {/* Video Links Section */}
            {videoLinks && videoLinks.length > 0 && (
              <div className="flex flex-col gap-2">
                {videoLinks.map((video) => (
                  <a
                    key={video.id}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-accent hover:underline"
                  >
                    <Video className="h-4 w-4" />
                    {video.title}
                  </a>
                ))}
              </div>
            )}
            
            {/* Notes Section */}
            {lesson.notes && (
              <div className="p-3 bg-card rounded-md border border-border">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <span className="text-sm font-medium">Notes</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{lesson.notes}</p>
              </div>
            )}
            
            {/* Help Center Section */}
            {helpCenterEntries && helpCenterEntries.length > 0 && (
              <div className="p-3 bg-card rounded-md border border-border">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <HelpCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Help Center</span>
                </div>
                <div className="space-y-3">
                  {helpCenterEntries.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="p-3 bg-muted rounded-md border border-border/50"
                    >
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        {entry.entry_type === 'text' ? (
                          <MessageSquare className="h-3 w-3" />
                        ) : (
                          <Link className="h-3 w-3" />
                        )}
                        <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{linkifyText(entry.content)}</p>
                      {entry.link_url && (
                        <a 
                          href={entry.link_url}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-2 inline-block"
                        >
                          {entry.link_url}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
