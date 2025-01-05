import { BloombotEvents, type CreateServerEventPayload } from '#lib/util/constants';
import { $Enums } from '@prisma/client';
import { Listener } from '@sapphire/framework';
import { addHours, getISODay } from 'date-fns';
import { GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, GuildScheduledEventRecurrenceRuleFrequency } from 'discord.js';

export class UserListener extends Listener<typeof BloombotEvents.CreateServerEvent> {
	public override async run({ eventId, guildId, isReschedule }: CreateServerEventPayload) {
		const eventData = await this.container.prisma.event.findFirstOrThrow({
			where: {
				id: eventId
			},
			include: {
				instance: {
					include: {
						participants: true
					}
				}
			}
		});

		// If we're rescheduling an event that already had a discord event, we don't want to create a new one.
		if (isReschedule && eventData.discordEventId) {
			return;
		}

		if (eventData.instance) {
			// If the provided event datetime is in the past, do not create a Discord server event as that will not be possible.
			if (eventData.instance.dateTime < new Date()) {
				return;
			}

			const guild = await this.container.client.guilds.fetch(guildId);

			if (guild) {
				const leaderUser = await guild.members.fetch(eventData.leader);

				const response = await guild.scheduledEvents.create({
					name: eventData.name,
					entityType: GuildScheduledEventEntityType.External,
					entityMetadata: { location: 'FC House' },
					privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
					scheduledStartTime: eventData.instance.dateTime,
					scheduledEndTime: addHours(eventData.instance.dateTime, eventData.duration),
					description: eventData.description ?? undefined,
					reason: `Event created by ${leaderUser.user.username}`,

					...(eventData.interval &&
					(eventData.interval === $Enums.EventInterval.WEEKLY || eventData.interval === $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK)
						? {
								recurrenceRule: {
									startAt: eventData.instance.dateTime.toISOString(),
									frequency: GuildScheduledEventRecurrenceRuleFrequency.Weekly,
									interval: eventData.interval === $Enums.EventInterval.WEEKLY ? 1 : 2,
									byWeekday: [getISODay(eventData.instance.dateTime) - 1],
									endAt: addHours(eventData.instance.dateTime, eventData.duration)
								}
							}
						: {})
				});

				if (
					eventData.interval &&
					(eventData.interval === $Enums.EventInterval.WEEKLY || eventData.interval === $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK)
				) {
					await this.container.prisma.event.update({
						where: { id: eventId },
						data: { discordEventId: response.id }
					});
				}
			}
		}
	}
}
