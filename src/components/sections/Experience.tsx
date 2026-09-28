import { experience } from '@/content/content';
import { Chapter } from '@/components/ui/Chapter';
import { ChapterTitle } from '@/components/ui/ChapterTitle';
import { BulletList } from '@/components/ui/BulletList';
import { Timeline, TimelineItem } from './Timeline';

export function Experience() {
  return (
    <Chapter id="experience" labelledBy="experience-title">
      <ChapterTitle id="experience-title">Experience</ChapterTitle>
      <Timeline>
        {experience.map((e) => (
          <TimelineItem key={e.role} title={e.role} meta={`${e.company}, ${e.period}`}>
            <BulletList items={e.points} />
          </TimelineItem>
        ))}
      </Timeline>
    </Chapter>
  );
}
