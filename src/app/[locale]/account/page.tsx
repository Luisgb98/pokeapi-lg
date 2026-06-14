import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SavedTeamsSection } from '@/presentation/components/organisms/SavedTeamsSection';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('account');
  return { title: t('title') };
}

export default async function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <SavedTeamsSection />
    </div>
  );
}
