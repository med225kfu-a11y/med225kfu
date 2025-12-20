import { Lesson } from '@/types/database';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Download, Video, ExternalLink } from 'lucide-react';
import { useQuizLinks } from '@/hooks/useQuizLinks';
import { useVideoLinks } from '@/hooks/useVideoLinks';

interface LessonCardProps {
  lesson: Lesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  const { data: quizLinks } = useQuizLinks(lesson.id);
  const { data: videoLinks } = useVideoLinks(lesson.id);

  return (
    <div className="bg-background rounded-lg p-4 border border-border">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h4 className="text-lg font-medium text-foreground">{lesson.title}</h4>
          <StatusBadge status={lesson.status} />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {lesson.transcription_url && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2"
            >
              <a href={lesson.transcription_url} target="_blank" rel="noopener noreferrer" download>
                <Download className="h-4 w-4" />
                Transcription
              </a>
            </Button>
          )}
          
          {lesson.summary_url && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2"
            >
              <a href={lesson.summary_url} target="_blank" rel="noopener noreferrer" download>
                <Download className="h-4 w-4" />
                Summary
              </a>
            </Button>
          )}
        </div>
        
        {/* Quiz Links Section */}
        {quizLinks && quizLinks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quizLinks.map((quiz, index) => (
              <Button
                key={quiz.id}
                variant="secondary"
                size="sm"
                asChild
                className="gap-2"
              >
                <a href={quiz.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Quiz {index + 1}
                </a>
              </Button>
            ))}
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
        
        {lesson.notes && (
          <div className="mt-2 p-3 bg-card rounded-md border border-border">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <span className="text-sm font-medium">Notes</span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{lesson.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
