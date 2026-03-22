import type { ReactNode } from "react";

interface SectionBlockProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  countLabel: string;
  emptyState: string;
  children: ReactNode;
  isEmpty: boolean;
}

const SectionBlock: React.FC<SectionBlockProps> = ({
  id,
  eyebrow,
  title,
  description,
  countLabel,
  emptyState,
  children,
  isEmpty,
}) => (
  <section className="space-y-5" aria-labelledby={id}>
    <div
      id={id}
      className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-cyan-100/70">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300/[0.8] sm:text-base">
          {description}
        </p>
      </div>

      <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100">
        {countLabel}
      </div>
    </div>

    {isEmpty ? (
      <div className="rounded-[1.85rem] border border-dashed border-white/[0.12] bg-white/[0.025] px-5 py-10 text-center text-sm leading-7 text-slate-300/[0.78] sm:px-8">
        {emptyState}
      </div>
    ) : (
      children
    )}
  </section>
);

export default SectionBlock;
