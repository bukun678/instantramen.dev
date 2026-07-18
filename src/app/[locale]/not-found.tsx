import Link from 'next/link';

import { envConfigs } from '@/config';
import { InstantRamenLogoMark, SmartIcon } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <InstantRamenLogoMark
        className="text-foreground size-20"
        label={envConfigs.app_name}
      />
      <h1 className="text-2xl font-normal">Page not found</h1>
      <Button asChild>
        <Link href="/" className="mt-4">
          <SmartIcon name="ArrowLeft" />
          <span>Back to Home</span>
        </Link>
      </Button>
    </div>
  );
}
