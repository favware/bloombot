import { BloomCommand } from '#lib/extensions/BloomComand';
import { BloombotEvents, ErrorIdentifiers, UpdateEmbedPayloadOrigin, type EventData } from '#lib/util/constants';
import { BloombotEmojis } from '#lib/util/emojis';
import { buildEventAttachment } from '#lib/util/functions/buildEventAttachment';
import { buildEventComponents } from '#lib/util/functions/buildEventComponents';
import { buildEventEmbed } from '#lib/util/functions/buildEventEmbed';
import { buildPhantomJobComponent } from '#lib/util/functions/buildPhantomJobComponent';
import { resolveOnErrorCodes } from '#lib/util/functions/resolveOnErrorCodes';
import { OwnerMentions, Owners } from '#root/config';
import { $Enums } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { Result, UserError, type ApplicationCommandRegistry, type Awaitable, type ChatInputCommand } from '@sapphire/framework';
import { filterNullish, isNullishOrZero } from '@sapphire/utilities';
import { format } from 'date-fns';
import {
	ApplicationIntegrationType,
	heading,
	inlineCode,
	MessageFlags,
	PermissionFlagsBits,
	roleMention,
	time,
	TimestampStyles,
	unorderedList
} from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Manage the Nightbloom events'
})
export class SlashCommand extends BloomCommand {
	private readonly timeRegex = /^(?:0\d|1\d|2[0-4]):[0-5]\d$/;

	public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
		registry.registerChatInputCommand((command) =>
			command //
				.setName(this.name)
				.setDescription(this.description)
				.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
				.addSubcommand((builder) =>
					builder
						.setName('create')
						.setDescription('Create a new event')
						.addStringOption((builder) =>
							builder //
								.setName('name')
								.setDescription('The name of the event')
								.setRequired(true)
						)
						.addStringOption((builder) =>
							builder //
								.setName('date')
								.setDescription('The date of the event, or first occurrence if interval is set. Format is DD-MM-YYYY or DD/MM/YYYY')
								.setRequired(true)
						)
						.addStringOption((builder) =>
							builder //
								.setName('time')
								.setDescription('The time of the event. Format is HH:mm (24 hour clock). Time is always Light server time (UTC)')
								.setRequired(true)
						)
						.addIntegerOption((builder) =>
							builder //
								.setName('duration')
								.setDescription('The duration of the event in hours')
								.setChoices(
									{ name: '1 hour', value: 1 },
									{ name: '2 hours', value: 2 },
									{ name: '3 hours', value: 3 },
									{ name: '4 hours', value: 4 }
								)
								.setRequired(true)
						)
						.addStringOption((builder) =>
							builder //
								.setName('description')
								.setDescription('The description of the event, for newlines type \\n')
								.setRequired(false)
						)
						.addStringOption((builder) =>
							builder //
								.setName('interval')
								.setDescription('The interval at which this event should repeat')
								.setRequired(false)
								.setChoices(
									{ name: 'Weekly', value: $Enums.EventInterval.WEEKLY },
									{ name: 'Once every other week', value: $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK },
									{ name: 'Monthly', value: $Enums.EventInterval.MONTHLY },
									{
										name: 'Every one before last friday of the month',
										value: $Enums.EventInterval.ONE_BEFORE_LAST_FRIDAY_OF_THE_MONTH
									}
								)
						)
						.addRoleOption((builder) =>
							builder //
								.setName('role-to-ping')
								.setDescription('A role to ping when the event is created')
								.setRequired(false)
						)
						.addChannelOption((builder) =>
							builder //
								.setName('channel')
								.setDescription('The channel in which the event should posted, if omitted the current channel is used.')
								.setRequired(false)
						)
						.addUserOption((builder) =>
							builder //
								.setName('leader')
								.setDescription('The event leader for this event, defaults to yourself if not provided.')
								.setRequired(false)
						)
						.addAttachmentOption((builder) =>
							builder //
								.setName('banner-image')
								.setDescription('The banner image, shown below the event embed and in the Discord server event banner.')
								.setRequired(false)
						)
						.addStringOption((builder) =>
							builder //
								.setName('variant')
								.setDescription('The event variant for this event')
								.setRequired(false)
								.setChoices(
									{ name: 'Normal', value: $Enums.EventVariant.NORMAL },
									{ name: 'Occult Crescent', value: $Enums.EventVariant.OCCULT_CRESCENT }
								)
						)
				)
				.addSubcommand((builder) =>
					builder //
						.setName('list')
						.setDescription('List all currently known events and their IDs. Future scheduled events will not be listed.')
				)
				.addSubcommand((builder) =>
					builder
						.setName('edit')
						.setDescription('Edit an existing event.')
						.addStringOption((builder) =>
							builder
								.setName('id')
								.setDescription('The command id, use /event list to get a list, or type the event name for autocomplete.')
								.setAutocomplete(true)
								.setRequired(true)
						)
						.addStringOption((builder) =>
							builder //
								.setName('name')
								.setDescription('The new name of the event')
								.setRequired(false)
						)
						.addStringOption((builder) =>
							builder //
								.setName('date')
								.setDescription('The new date of the event. Format is DD-MM-YYYY or DD/MM/YYYY')
								.setRequired(false)
						)
						.addStringOption((builder) =>
							builder //
								.setName('time')
								.setDescription('The new time of the event. Format is HH:mm (24 hour clock). Time is always Light server time (UTC)')
								.setRequired(false)
						)
						.addIntegerOption((builder) =>
							builder //
								.setName('duration')
								.setDescription('The duration of the event in hours')
								.setChoices(
									{ name: '1 hour', value: 1 },
									{ name: '2 hours', value: 2 },
									{ name: '3 hours', value: 3 },
									{ name: '4 hours', value: 4 }
								)
								.setRequired(false)
						)
						.addStringOption((builder) =>
							builder //
								.setName('description')
								.setDescription('The new description of the event, for newlines type \\n')
								.setRequired(false)
						)
						.addStringOption((builder) =>
							builder //
								.setName('interval')
								.setDescription('The new interval at which this event should repeat')
								.setRequired(false)
								.setChoices(
									{ name: 'Weekly', value: $Enums.EventInterval.WEEKLY },
									{ name: 'Once every other week', value: $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK },
									{ name: 'Monthly', value: $Enums.EventInterval.MONTHLY },
									{
										name: 'Every one before last friday of the month',
										value: $Enums.EventInterval.ONE_BEFORE_LAST_FRIDAY_OF_THE_MONTH
									}
								)
						)
						.addRoleOption((builder) =>
							builder //
								.setName('role-to-ping')
								.setDescription('The new role to ping for the event')
								.setRequired(false)
						)
						.addChannelOption((builder) =>
							builder //
								.setName('channel')
								.setDescription('The channel in which the event should posted, if omitted the current channel is used.')
								.setRequired(false)
						)
						.addUserOption((builder) =>
							builder //
								.setName('leader')
								.setDescription('The new event leader for this event.')
								.setRequired(false)
						)
						.addAttachmentOption((builder) =>
							builder //
								.setName('banner-image')
								.setDescription('The banner image, shown below the event embed and in the Discord server event banner.')
								.setRequired(false)
						)
						.addStringOption((builder) =>
							builder //
								.setName('variant')
								.setDescription('The new event variant for this event')
								.setRequired(false)
								.setChoices(
									{ name: 'Normal', value: $Enums.EventVariant.NORMAL },
									{ name: 'Occult Crescent', value: $Enums.EventVariant.OCCULT_CRESCENT }
								)
						)
				)
				.addSubcommand((builder) =>
					builder //
						.setName('delete')
						.setDescription('Deletes an existing event.')
						.addStringOption((builder) =>
							builder
								.setName('id')
								.setDescription('The command id, use /event list to get a list, or type the event name for autocomplete.')
								.setAutocomplete(true)
								.setRequired(true)
						)
				)
		);
	}

	public override async chatInputRun(interaction: ChatInputCommand.Interaction<'cached'>) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const subcommand = interaction.options.getSubcommand(true) as 'create' | 'delete' | 'edit' | 'list';

		switch (subcommand) {
			case 'create':
				return this.createEvent(interaction);
			case 'list':
				return this.listEvents(interaction);
			case 'edit':
				return this.editEvent(interaction);
			case 'delete':
				return this.deleteEvent(interaction);
		}
	}

	private async createEvent(interaction: ChatInputCommand.Interaction<'cached'>) {
		const { dateUnixTimestamp, dateIsInvalid } = this.validateStringDate(interaction.options.getString('date', true));

		if (dateIsInvalid) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} The date you provided is invalid, it has to be in the format of ${inlineCode('DD-MM-YYY')} or ${inlineCode('DD/MM/YYY')}.`
			});
		}

		const stringTime = interaction.options.getString('time', true);

		if (!this.timeRegex.test(stringTime)) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} The time you provided is invalid, it has to be in the format of ${inlineCode('HH:mm')}.`
			});
		}

		const eventDate = this.setTimeAndTimezone(dateUnixTimestamp, stringTime);

		const channel = interaction.options.getChannel('channel', false);

		const eventChannel = channel ?? interaction.channel;

		if (!eventChannel?.isSendable()) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} The channel you provided is invalid.`
			});
		}

		if (
			interaction.guild.members.me &&
			!eventChannel
				.permissionsFor(interaction.guild.members.me)
				?.has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks])
		) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} I do not have permission to send messages in the specified channel. I need at least the ${inlineCode('View Channel')}, ${inlineCode('Send Messages')}, and ${inlineCode('Embed Links')} permissions.`
			});
		}

		const name = interaction.options.getString('name', true);
		const description = interaction.options.getString('description', false);
		const interval = interaction.options.getString('interval', false);
		const roleToPing = interaction.options.getRole('role-to-ping', false);
		const eventDuration = interaction.options.getInteger('duration', true);
		const leader = interaction.options.getUser('leader', false);
		const variant = interaction.options.getString('variant', false);

		const event = await this.container.prisma.event.create({
			data: {
				name,
				description,
				duration: eventDuration,
				channelId: eventChannel.id,
				guildId: interaction.guildId,
				interval: interval as $Enums.EventInterval,
				roleToPing: roleToPing?.id,
				leader: leader?.id ?? interaction.user.id,
				bannerImage: await this.getBannerImage(interaction),
				variant: (variant as $Enums.EventVariant | null) ?? $Enums.EventVariant.NORMAL,
				instance: {
					create: {
						dateTime: eventDate
					}
				}
			},
			select: {
				id: true,
				name: true,
				description: true,
				roleToPing: true,
				leader: true,
				channelId: true,
				instance: {
					select: {
						dateTime: true,
						participants: {
							select: {
								job: true,
								role: true,
								signupOrder: true,
								discordId: true
							}
						}
					}
				}
			}
		});

		if (!event.instance) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} An unexpected fatal error occurred while creating the event. Contact ${OwnerMentions} for assistance.`,
				allowedMentions: { users: Owners }
			});
		}

		this.container.client.emit(BloombotEvents.PostEmbed, { eventId: event.id, guildId: interaction.guildId });
		this.container.client.emit(BloombotEvents.CreateServerEvent, {
			eventId: event.id,
			guildId: interaction.guildId,
			isReschedule: false,
			discordEventId: null
		});

		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Event ${inlineCode(name)} created successfully with ID ${inlineCode(event.id)}.`
		});
	}

	private async listEvents(interaction: ChatInputCommand.Interaction<'cached'>) {
		const eventInstances = await this.container.prisma.eventInstance.findMany({
			where: {
				event: {
					guildId: interaction.guildId
				}
			},
			select: {
				id: true,
				dateTime: true,
				event: {
					select: {
						name: true,
						description: true,
						roleToPing: true,
						variant: true
					}
				}
			},
			orderBy: {
				dateTime: 'desc'
			}
		});

		if (eventInstances.length === 0) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} No events found.`
			});
		}

		const eventIdHeader = heading('Event ID', 2);
		const eventListHeader = heading('Event List', 1);

		const variantMapping = {
			[$Enums.EventVariant.NORMAL]: `${BloombotEmojis.Nightbloom} Normal`,
			[$Enums.EventVariant.OCCULT_CRESCENT]: `${BloombotEmojis.PhantomJob} Occult Crescent`
		};

		const eventList = eventInstances
			.map((eventInstance) => {
				const { id, dateTime, event } = eventInstance;
				const { name, description, roleToPing, variant } = event;

				return [
					`${eventIdHeader}: ${id}`,
					unorderedList(
						[
							`**Name:** ${name}`,
							`**Description:** ${description}`,
							`**Date:** ${time(dateTime, TimestampStyles.ShortDate)}`,
							`**Time:** ${time(dateTime, TimestampStyles.ShortTime)}`,
							roleToPing ? `**Role to ping:** ${roleMention(roleToPing)}` : undefined,
							`**Variant:** ${variantMapping[variant]}`
						].filter(filterNullish)
					)
				].join('\n');
			})
			.join('\n\n');

		const messageContent = [eventListHeader, eventList].join('\n');

		if (messageContent.length > 2_000) {
			const file = Buffer.from(messageContent, 'utf8');
			const filename = `event-list-${interaction.user.id}.txt`;

			return interaction.editReply({
				content: `${BloombotEmojis.GreenTick} The event list is too long to send in a single message. Here is a file with the event list.`,
				files: [{ attachment: file, name: filename }]
			});
		}

		return interaction.editReply({
			content: messageContent
		});
	}

	private async editEvent(interaction: ChatInputCommand.Interaction<'cached'>) {
		const id = interaction.options.getString('id', true);

		const existingEvent = await this.container.prisma.event.findFirst({
			where: {
				id
			},
			select: {
				id: true,
				name: true,
				bannerImage: true,
				channelId: true,
				description: true,
				duration: true,
				interval: true,
				leader: true,
				roleToPing: true,
				variant: true,
				instance: {
					select: {
						dateTime: true,
						messageId: true,
						discordEventId: true
					}
				}
			}
		});

		if (!existingEvent?.instance) {
			throw new UserError({
				message: `${BloombotEmojis.RedCross} No event found with ID ${inlineCode(id)}.`,
				identifier: ErrorIdentifiers.EventEditIdNotFound
			});
		}

		const stringDate = interaction.options.getString('date', false);
		let dateUnixTimestamp: number | null = null;
		let dateIsInvalid = false;

		if (stringDate) {
			const validatedStringDate = this.validateStringDate(stringDate);
			dateUnixTimestamp = validatedStringDate.dateUnixTimestamp;
			dateIsInvalid = validatedStringDate.dateIsInvalid;

			if (dateIsInvalid) {
				return interaction.editReply({
					content: `${BloombotEmojis.RedCross} The date you provided is invalid, it has to be in the format of ${inlineCode('DD-MM-YYY')} or ${inlineCode('DD/MM/YYY')}.`
				});
			}
		}

		let stringTime = interaction.options.getString('time', false);

		if (stringTime && !this.timeRegex.test(stringTime)) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} The time you provided is invalid, it has to be in the format of ${inlineCode('HH:mm')}.`
			});
		}

		dateUnixTimestamp = dateUnixTimestamp ?? existingEvent.instance.dateTime.getTime();
		stringTime = stringTime ?? format(existingEvent.instance.dateTime, 'HH:mm');

		const eventDate = this.setTimeAndTimezone(dateUnixTimestamp, stringTime);

		const name = interaction.options.getString('name', false) ?? existingEvent.name;
		const description = interaction.options.getString('description', false) ?? existingEvent.description;
		const interval = interaction.options.getString('interval', false) ?? existingEvent.interval;
		const channel = interaction.options.getChannel('channel', false);
		const eventDuration = interaction.options.getInteger('duration', false);
		const roleToPing = interaction.options.getRole('role-to-ping', false);
		const leader = interaction.options.getUser('leader', false);
		const variant = interaction.options.getString('variant', false);

		const resolvedEventChannel =
			channel ?? (existingEvent.channelId ? interaction.guild.channels.cache.get(existingEvent.channelId) : null) ?? interaction.channel;

		if (!resolvedEventChannel?.isSendable()) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} The channel you provided is invalid.`
			});
		}

		const updatedEvent = await this.container.prisma.event.update({
			where: {
				id
			},
			data: {
				name,
				description,
				channelId: resolvedEventChannel.id,
				guildId: interaction.guildId,
				interval: interval as $Enums.EventInterval,
				roleToPing: roleToPing?.id ?? existingEvent.roleToPing,
				leader: leader?.id ?? existingEvent.leader,
				bannerImage: (await this.getBannerImage(interaction)) ?? existingEvent.bannerImage,
				duration: eventDuration ?? existingEvent.duration,
				variant: (variant as $Enums.EventVariant | null) ?? existingEvent.variant,
				instance: {
					update: {
						dateTime: eventDate,
						discordEventId: existingEvent.instance.discordEventId
					}
				}
			},
			select: {
				id: true,
				name: true,
				bannerImage: true,
				channelId: true,
				createdAt: true,
				description: true,
				interval: true,
				leader: true,
				roleToPing: true,
				updatedAt: true,
				variant: true,
				instance: {
					include: {
						participants: true
					}
				}
			}
		});

		this.container.client.emit(BloombotEvents.UpdateServerEvent, {
			eventId: updatedEvent.id,
			guildId: interaction.guildId
		});

		if (resolvedEventChannel.id === existingEvent.channelId) {
			this.container.client.emit(BloombotEvents.UpdateEmbed, {
				eventId: updatedEvent.id,
				guildId: interaction.guildId,
				origin: UpdateEmbedPayloadOrigin.EditEventCommand
			});
		} else {
			const existingMessageChannel = await interaction.guild.channels.fetch(existingEvent.channelId);

			if (existingMessageChannel?.isSendable() && existingEvent.instance.messageId) {
				const oldPostedMessage = await existingMessageChannel.messages.fetch(existingEvent.instance.messageId);
				await oldPostedMessage.delete();

				const postedMessage = await resolvedEventChannel.send({
					content: updatedEvent.roleToPing ? roleMention(updatedEvent.roleToPing) : undefined,
					embeds: [buildEventEmbed(updatedEvent as EventData)],
					components:
						updatedEvent.variant === $Enums.EventVariant.NORMAL
							? buildEventComponents(updatedEvent.id)
							: buildPhantomJobComponent(updatedEvent.id),
					files: buildEventAttachment(updatedEvent as EventData),
					allowedMentions: { roles: updatedEvent.roleToPing ? [updatedEvent.roleToPing] : undefined }
				});

				await this.container.prisma.event.update({
					where: { id: updatedEvent.id },
					data: { instance: { update: { messageId: postedMessage.id } } }
				});
			}
		}

		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Event ${inlineCode(name)} successfully updated.`
		});
	}

	private async deleteEvent(interaction: ChatInputCommand.Interaction<'cached'>) {
		const id = interaction.options.getString('id', true);

		const existingEvent = await this.container.prisma.event.findFirst({
			where: {
				id
			},
			select: {
				channelId: true,
				instance: {
					select: {
						messageId: true,
						discordEventId: true
					}
				}
			}
		});

		if (!existingEvent?.instance) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} No event found with ID ${inlineCode(id)}.`
			});
		}

		const resolvedEventChannel = interaction.guild.channels.cache.get(existingEvent.channelId);
		if (resolvedEventChannel?.isSendable() && existingEvent.instance.messageId) {
			try {
				const postedMessage = await resolvedEventChannel.messages.fetch(existingEvent.instance.messageId);
				await postedMessage?.delete();
			} catch {
				// do nothing
			}
		}

		try {
			await this.container.prisma.event.delete({
				where: {
					id
				}
			});

			if (existingEvent.instance.discordEventId) {
				await resolveOnErrorCodes(interaction.guild.scheduledEvents.delete(existingEvent.instance.discordEventId));
			}

			return await interaction.editReply({
				content: `${BloombotEmojis.GreenTick} Event with ID ${inlineCode(id)} successfully deleted.`
			});
		} catch {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} Failed to delete the event from the database. Contact ${OwnerMentions} for assistance.`
			});
		}
	}

	private validateStringDate(stringDate: string): { dateIsInvalid: boolean; dateUnixTimestamp: number } {
		const [day, month, year] = stringDate.includes('-') ? stringDate.split('-') : stringDate.split('/');
		const dateUnixTimestamp = Date.parse(`${year}-${month}-${day}`);
		const dateIsInvalid = Number.isNaN(dateUnixTimestamp);

		return { dateUnixTimestamp, dateIsInvalid };
	}

	private async getBannerImage(interaction: ChatInputCommand.Interaction<'cached'>): Promise<string | null> {
		const file = interaction.options.getAttachment('banner-image', false);

		if (!file || isNullishOrZero(file.width) || isNullishOrZero(file.height)) return null;

		const { width, height } = file;

		if (width <= 128 && height <= 128) return file.url;

		const url = new URL(file.url);
		if (width === height) {
			url.searchParams.append('width', '128');
			url.searchParams.append('height', '128');
		} else if (width > height) {
			url.searchParams.append('width', '128');
			url.searchParams.append('height', Math.ceil((height * 128) / width).toString());
		} else {
			url.searchParams.append('width', Math.ceil((width * 128) / height).toString());
			url.searchParams.append('height', '128');
		}

		const downloadedImage = await Result.fromAsync(fetch(url, FetchResultTypes.Buffer));

		return downloadedImage.match({
			ok: (value) => value.toString('base64'),
			err: () => null
		});
	}

	private setTimeAndTimezone(dateUnixTimestamp: number, stringTime: string): Date {
		const [hours, minutes] = stringTime.split(':').map(Number);
		const eventDate = new Date(dateUnixTimestamp);
		const isDstObserved = eventDate.getTimezoneOffset() < this.stdTimezoneOffset(eventDate);
		eventDate.setUTCHours(isDstObserved ? hours - 1 : hours, minutes, 0, 0);

		const ukTimezoneOffset = new Date().getTimezoneOffset() - eventDate.getTimezoneOffset();

		eventDate.setMinutes(eventDate.getMinutes() + ukTimezoneOffset);

		return eventDate;
	}

	private stdTimezoneOffset(today: Date) {
		const jan = new Date(today.getFullYear(), 0, 1);
		const jul = new Date(today.getFullYear(), 6, 1);
		return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
	}
}
