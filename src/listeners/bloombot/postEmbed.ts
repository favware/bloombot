import { BloombotEvents, type EventData, type PostEmbedPayload } from '#lib/util/constants';
import { buildEventComponents } from '#lib/util/functions/buildEventComponents';
import { buildEventEmbed } from '#lib/util/functions/buildEventEmbed';
import { Listener } from '@sapphire/framework';
import { roleMention } from 'discord.js';

export class UserListener extends Listener<typeof BloombotEvents.PostEmbed> {
	public override async run({ eventId, guildId }: PostEmbedPayload) {
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

		const guild = await this.container.client.guilds.fetch(guildId);

		if (guild) {
			const eventChannel = await guild.channels.fetch(eventData.channelId);

			if (eventChannel?.isSendable()) {
				const postedMessage = await eventChannel.send({
					content: eventData.roleToPing ? roleMention(eventData.roleToPing) : undefined,
					embeds: [buildEventEmbed(eventData as EventData)],
					components: buildEventComponents(eventId),
					allowedMentions: { roles: eventData.roleToPing ? [eventData.roleToPing] : undefined }
				});

				await this.container.prisma.event.update({
					where: { id: eventId },
					data: { instance: { update: { messageId: postedMessage.id } } }
				});
			}
		}
	}
}
