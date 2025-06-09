import { CustomIdPrefixes } from '#lib/util/constants';
import { XIVEventBuddyEmojis } from '#lib/util/emojis';
import { formatJobUpdateMessage } from '#lib/util/functions/formatJobUpdateMessage';
import { handleJobOrRoleButtonClick } from '#lib/util/functions/handleJobOrRoleButtonClick';
import { $Enums } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>) {
		return interaction.editReply({
			content: await formatJobUpdateMessage(interaction, XIVEventBuddyEmojis.Dragoon, $Enums.Jobs.Dragoon)
		});
	}

	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!interaction.customId.startsWith(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Dragoon}`)) return this.none();

		await handleJobOrRoleButtonClick(interaction, $Enums.Roles.MeleeDPS, $Enums.Jobs.Dragoon);

		return this.some();
	}
}
