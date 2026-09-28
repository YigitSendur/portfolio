import { extras, profile } from '@/content/content';
import { Chapter } from '@/components/ui/Chapter';
import { ChapterTitle } from '@/components/ui/ChapterTitle';
import { Reveal, RevealItem } from '@/components/ui/Reveal';
import { LinkRow, TextLink } from '@/components/ui/TextLink';
import { isReal } from '@/lib/links';

export function Also() {
  return (
    <Chapter id="also" labelledBy="also-title">
      <ChapterTitle id="also-title">Also</ChapterTitle>
      <Reveal as="dl" className="mb-9 grid gap-3">
        {extras.skills.map(([k, v]) => (
          <RevealItem key={k} className="grid gap-0.5 border-t border-rule pt-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="font-bold">{k}</dt>
            <dd>{v}</dd>
          </RevealItem>
        ))}
      </Reveal>
      <div className="mb-6">
        <h3 className="text-lg font-bold font-stretch-[105%]">{extras.talk.name}</h3>
        <p>
          {extras.talk.text}{' '}
          {isReal(extras.talk.href) && <TextLink href={extras.talk.href}>Open the slides</TextLink>}
        </p>
      </div>

      <div className="mt-14">
        <ChapterTitle id="contact-title">Get in touch</ChapterTitle>
        <p className="max-w-136 text-lead">I&apos;m looking for a frontend role where the interface sits on top of something real.</p>
        <LinkRow>
          <TextLink href={`mailto:${profile.email}`}>{profile.email}</TextLink>
          <TextLink href={profile.linkedin}>LinkedIn</TextLink>
          <TextLink href={profile.github}>GitHub</TextLink>
        </LinkRow>
      </div>
    </Chapter>
  );
}
