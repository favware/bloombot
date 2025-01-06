import { CustomIdPrefixes, ErrorIdentifiers } from '#lib/util/constants';
import { BloombotEmojis } from '#lib/util/emojis';
import { getFullEventData } from '#lib/util/functions/getFullEventData';
import { getHealerJobButtons } from '#lib/util/job-buttons/healer';
import { getMagicDpsJobButtons } from '#lib/util/job-buttons/magicdps';
import { getMeleeDpsJobButtons } from '#lib/util/job-buttons/meleedps';
import { getPhysRangedDpsJobButtons } from '#lib/util/job-buttons/physrangeddps';
import { getTankJobButtons } from '#lib/util/job-buttons/tank';
import { OwnerMentions } from '#root/config';
import { $Enums } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, UserError } from '@sapphire/framework';
import { inlineCode, MessageFlags, type ActionRowBuilder, type ButtonBuilder, type StringSelectMenuInteraction } from 'discord.js';

export type RoleParseResult = InteractionHandler.ParseResult<StringSelectMenuHandler>;

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class StringSelectMenuHandler extends InteractionHandler {
	public override run(interaction: StringSelectMenuInteraction, result: InteractionHandler.ParseResult<this>) {
		let components: ActionRowBuilder<ButtonBuilder>[];

		switch (result.selectedRole) {
			case $Enums.Roles.Tank:
				components = getTankJobButtons(result);
				break;
			case $Enums.Roles.MeleeDPS:
				components = getMeleeDpsJobButtons(result);
				break;
			case $Enums.Roles.PhysRangedDPS:
				components = getPhysRangedDpsJobButtons(result);
				break;
			case $Enums.Roles.MagicRangedDPS:
				components = getMagicDpsJobButtons(result);
				break;
			case $Enums.Roles.Healer:
				components = getHealerJobButtons(result);
				break;
			default:
				throw new UserError({
					message: `${BloombotEmojis.RedCross} I received an unexpected role from the select menu of selecting your role. Contact ${OwnerMentions} for assistance.`,
					identifier: ErrorIdentifiers.UnexpectedRoleSelectMenuChoiceError
				});
		}

		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Successfully updated your role to ${inlineCode(result.selectedRole)}. Next, select which job you will be playing from these options:`,
			components
		});
	}

	public override async parse(interaction: StringSelectMenuInteraction) {
		if (!interaction.customId.startsWith(CustomIdPrefixes.RoleSelectMenu)) return this.none();

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [, eventId] = interaction.customId.split('|');

		const eventData = await getFullEventData(eventId);

		if (!eventData?.instance?.id) {
			throw new UserError({
				message: `${BloombotEmojis.RedCross} I was unexpectedly unable to find the event matching the selection of that option. Contact ${OwnerMentions} for assistance.`,
				identifier: ErrorIdentifiers.UnableToFindEventForSelectMenuChoiceError
			});
		}

		const result: { max_signup_order: number | null }[] = await this.container.prisma.$queryRaw/* sql */ `
				SELECT MAX(participants.signup_order) AS max_signup_order
				FROM participants
				WHERE event_instance_id = ${eventData.instance.id}
		`;

		const selectedRole = interaction.values[0] as $Enums.Roles;

		await this.container.prisma.participant.upsert({
			where: {
				eventInstanceId_discordId: {
					eventInstanceId: eventData.instance.id,
					discordId: interaction.user.id
				}
			},
			create: {
				eventInstanceId: eventData.instance.id,
				discordId: interaction.user.id,
				job: null,
				role: selectedRole,
				signupOrder: (result.at(0)?.max_signup_order ?? 0) + 1
			},
			update: {
				job: null,
				role: selectedRole
			}
		});

		return this.some({ selectedRole, eventId });
	}
}
