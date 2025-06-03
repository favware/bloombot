import type { BloombotEvents, EventData, PostEmbedPayload } from '#lib/util/constants';
import { buildEventAttachment } from '#lib/util/functions/buildEventAttachment';
import { buildEventComponents } from '#lib/util/functions/buildEventComponents';
import { buildEventEmbed } from '#lib/util/functions/buildEventEmbed';
import { buildPhantomJobComponent } from '#lib/util/functions/buildPhantomJobComponent';
import { resolveOnErrorCodes } from '#lib/util/functions/resolveOnErrorCodes';
import { $Enums } from '@prisma/client';
import { Listener } from '@sapphire/framework';
import { RESTJSONErrorCodes, roleMention } from 'discord.js';

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

		const guild = await resolveOnErrorCodes(this.container.client.guilds.fetch(guildId), RESTJSONErrorCodes.UnknownGuild);

		if (guild) {
			const eventChannel = await resolveOnErrorCodes(guild.channels.fetch(eventData.channelId), RESTJSONErrorCodes.UnknownChannel);

			if (eventChannel?.isSendable()) {
				const postedMessage = await eventChannel.send({
					content: eventData.roleToPing ? roleMention(eventData.roleToPing) : undefined,
					embeds: [buildEventEmbed(eventData as EventData)],
					components: eventData.variant === $Enums.EventVariant.NORMAL ? buildEventComponents(eventId) : buildPhantomJobComponent(eventId),
					files: buildEventAttachment(eventData as EventData),
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
