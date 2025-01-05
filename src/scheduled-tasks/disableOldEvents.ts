import { BloombotEvents } from '#lib/util/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { subHours } from 'date-fns';
import { Status } from 'discord.js';

@ApplyOptions<ScheduledTask.Options>({
	pattern: '*/10 * * * *',
	customJobOptions: {
		removeOnComplete: true
	}
})
export class DisableOldEvents extends ScheduledTask {
	public override async run() {
		// If the websocket isn't ready, skip for now
		if (this.container.client.ws.status !== Status.Ready) {
			return;
		}

		// Fetch all events
		const events = await this.container.prisma.event.findMany({
			include: {
				instance: true
			}
		});

		const twoHoursAgo = subHours(new Date(), 2);

		for (const event of events) {
			if (event.instance?.dateTime) {
				const eventInstanceDateTime = event.instance.dateTime;

				if (eventInstanceDateTime <= twoHoursAgo) {
					this.container.client.emit(BloombotEvents.UpdateEmbed, {
						eventId: event.id,
						userId: null,
						guildId: event.guildId,
						shouldDisableEvent: true
					});
				}
			}
		}
	}
}
