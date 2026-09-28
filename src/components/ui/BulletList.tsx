import { Reveal, RevealItem } from './Reveal';

/** Dash-marked list whose items stagger in. */
export function BulletList({ items }: { items: string[] }) {
  return (
    <Reveal as="ul" className="m-0 list-none p-0">
      {items.map((text) => (
        <RevealItem
          as="li"
          key={text}
          className="relative mb-2 pl-4 before:absolute before:left-0 before:top-[0.78em] before:h-px before:w-[0.45rem] before:bg-muted"
        >
          {text}
        </RevealItem>
      ))}
    </Reveal>
  );
}
