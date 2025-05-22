import type { $Enums } from '@prisma/client';

export function formatPhantomJobName(job: $Enums.Jobs) {
	return job.replaceAll(/(?<capital>[A-Z])/g, ' $<capital>').trim();
}
