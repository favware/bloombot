import { type BloombotEvents, ErrorIdentifiers, type EventData, type UpdateEmbedPayload } from '#lib/util/constants';
import { BloombotEmojis } from '#lib/util/emojis';
import { buildEventAttachment } from '#lib/util/functions/buildEventAttachment';
import { buildEventComponents } from '#lib/util/functions/buildEventComponents';
import { buildEventEmbed } from '#lib/util/functions/buildEventEmbed';
import { OwnerMentions } from '#root/config';
import { Listener, UserError } from '@sapphire/framework';
import { roleMention } from 'discord.js';

export class UserListener extends Listener<typeof BloombotEvents.UpdateEmbed> {
	public override async run({ eventId, guildId, shouldDisableEvent = false }: UpdateEmbedPayload) {
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
			const channelWithMessage = await guild.channels.fetch(eventData.channelId);

			if (channelWithMessage?.isSendable() && eventData.instance?.messageId) {
				try {
					const postedMessage = await channelWithMessage.messages.fetch(eventData.instance.messageId);

					if (postedMessage) {
						await postedMessage.edit({
							content: eventData.roleToPing ? roleMention(eventData.roleToPing) : undefined,
							embeds: [
								buildEventEmbed(
									{
										id: eventData.id,
										name: eventData.name,
										bannerImage: eventData.bannerImage,
										channelId: eventData.channelId,
										description: eventData.description,
										leader: eventData.leader,
										roleToPing: eventData.roleToPing,
										instance: { dateTime: eventData.instance.dateTime, participants: eventData.instance.participants }
									} as EventData,
									shouldDisableEvent
								)
							],
							components: buildEventComponents(eventData.id, shouldDisableEvent),
							files: buildEventAttachment(eventData as EventData),
							allowedMentions: { roles: eventData.roleToPing ? [eventData.roleToPing] : undefined }
						});
					} else {
						throw new UserError({
							message: `${BloombotEmojis.RedCross} I was unexpectedly unable to posted event message. Contact ${OwnerMentions} for assistance.`,
							identifier: ErrorIdentifiers.EventEditPostedMessageUndefinedError
						});
					}
				} catch {
					throw new UserError({
						message: `${BloombotEmojis.RedCross} I was unexpectedly unable to posted event message. Contact ${OwnerMentions} for assistance.`,
						identifier: ErrorIdentifiers.EventEditMessageFetchFailedError
					});
				}
			} else {
				throw new UserError({
					message: `${BloombotEmojis.RedCross} I was unexpectedly unable to find the channel the event was posted in. Contact ${OwnerMentions} for assistance.`,
					identifier: ErrorIdentifiers.EventEditMessageChannelNotFoundError
				});
			}
		}
	}
}
