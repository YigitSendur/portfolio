import Image from 'next/image';
import type { Project } from '@/content/content';
import { Chapter } from '@/components/ui/Chapter';
import { ChapterTitle } from '@/components/ui/ChapterTitle';
import { BulletList } from '@/components/ui/BulletList';
import { Reveal, RevealItem } from '@/components/ui/Reveal';
import { Meta } from '@/components/ui/Meta';
import { LinkRow, TextLink } from '@/components/ui/TextLink';
import { isReal } from '@/lib/links';

/** One project = one chapter. Everything it shows comes from content.ts. */
export function ProjectChapter({ project }: { project: Project }) {
  const titleId = `${project.id}-title`;
  const links = project.links.filter((l) => isReal(l.href));
  return (
    <Chapter id={project.id} labelledBy={titleId}>
      <ChapterTitle id={titleId}>{project.title}</ChapterTitle>
      <Reveal>
        <RevealItem as="p" className="mb-6 max-w-136 text-lead">{project.summary}</RevealItem>
        {project.image && (
          <RevealItem className="mb-6">
            <Image
              src={project.image}
              alt={`${project.title}: sign-in choice, sign-in form and chat screen, with the client's name blurred`}
              width={1112}
              height={555}
              sizes="(min-width: 1024px) 36rem, 100vw"
              className="h-auto w-full"
            />
          </RevealItem>
        )}
      </Reveal>
      <BulletList items={project.details} />
      <Reveal>
        <RevealItem as="p" className="mt-4 text-[0.95rem]">
          <span className="mr-1.5 text-muted">Built with</span>
          {project.stack}
        </RevealItem>
        {project.note && (
          <RevealItem>
            <Meta className="mt-2 text-[0.92rem]">{project.note}</Meta>
          </RevealItem>
        )}
        {links.length > 0 && (
          <RevealItem>
            <LinkRow>
              {links.map((l) => (
                <TextLink key={l.href} href={l.href}>{l.label}</TextLink>
              ))}
            </LinkRow>
          </RevealItem>
        )}
      </Reveal>
    </Chapter>
  );
}
