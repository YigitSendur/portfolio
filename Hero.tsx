import { profile } from '@/content/content';
import { Chapter } from '@/components/ui/Chapter';
import { Reveal, RevealItem } from '@/components/ui/Reveal';
import { LinkRow, TextLink } from '@/components/ui/TextLink';
import { HeroName } from './HeroName';

export function Hero() {
  return (
    <Chapter id="top" labelledBy="hero-title" className="pt-[48vh]">
      <HeroName first={profile.name[0]} last={profile.name[1]} />
      <Reveal>
        <RevealItem as="p" className="mb-3 text-lg font-semibold font-stretch-[112%]">{profile.role}</RevealItem>
        <RevealItem as="p" className="max-w-136 text-lead">{profile.intro}</RevealItem>
        <RevealItem>
          <LinkRow>
            <TextLink href="#healthcare-chatbot">See the work</TextLink>
            <TextLink href={`mailto:${profile.email}`}>Email me</TextLink>
          </LinkRow>
        </RevealItem>
      </Reveal>
      <p aria-hidden="true" className="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+1.75rem)] left-[clamp(1.25rem,6vw,5.5rem)] hidden text-sm text-muted lg:block">
        Scroll. The shape follows the story.
      </p>
    </Chapter>
  );
}
