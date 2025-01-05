import { BloombotEmojis } from '#lib/util/emojis';
import { handleJobOrRoleButtonClick } from '#lib/util/functions/handleJobOrRoleButtonClick';
import { $Enums, CustomIdPrefixes } from '#lib/util/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { inlineCode, type ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override run(interaction: ButtonInteraction) {
		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Successfully updated your job to ${inlineCode($Enums.Jobs.Sage)}.`
		});
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Sage}`)) return this.none();

		await handleJobOrRoleButtonClick(interaction, $Enums.Roles.Healer, $Enums.Jobs.Sage);

		return this.some();
	}
}
