import { CustomIdPrefixes } from '#lib/util/constants';
import { getPresenceStateButtons } from '#lib/util/functions/getPresenceStateButtons';
import { $Enums } from '@prisma/client';
import type { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

const TankOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.Tank)
	.setValue($Enums.Roles.Tank)
	.setEmoji({ id: '1324558655202398279', name: 'Tank' })
	.setDescription('Select this option if you are a Tank.');
const MeleeDpsOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.MeleeDPS)
	.setValue($Enums.Roles.MeleeDPS)
	.setEmoji({ id: '1324558637288394869', name: 'MeleeDPS' })
	.setDescription('Select this option if you are a Melee DPS.');
const PhysRangeDpsOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.PhysRangedDPS)
	.setValue($Enums.Roles.PhysRangedDPS)
	.setEmoji({ id: '1324558644448067694', name: 'PhysRangedDPS' })
	.setDescription('Select this option if you are a Physical Range DPS.');
const MagicOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.MagicRangedDPS)
	.setValue($Enums.Roles.MagicRangedDPS)
	.setEmoji({ id: '1324558639893315625', name: 'MagicRangedDPS' })
	.setDescription('Select this option if you are a Magical Range DPS.');
const HealerOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.Healer)
	.setValue($Enums.Roles.Healer)
	.setEmoji({ id: '1324558633224114289', name: 'Healer' })
	.setDescription('Select this option if you are a Healer.');
const AllRounderOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.AllRounder)
	.setValue($Enums.Roles.AllRounder)
	.setEmoji({ id: '1324558617193746502', name: 'AllRounder' })
	.setDescription('Select this option if you are an All Rounder.');

export function buildEventComponents(eventId: string, shouldDisableEvent = false) {
	const roleSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleSelectMenu}|${eventId}`)
		.setOptions(TankOption, MeleeDpsOption, PhysRangeDpsOption, MagicOption, HealerOption, AllRounderOption);

	const firstRow = new ActionRowBuilder<StringSelectMenuBuilder>();

	if (shouldDisableEvent) {
		roleSelectMenu.setDisabled(true).setPlaceholder('This event is closed');
		firstRow.setComponents(roleSelectMenu);
		return [firstRow];
	}

	firstRow.setComponents(roleSelectMenu);
	const secondRow = new ActionRowBuilder<ButtonBuilder>().setComponents(getPresenceStateButtons(eventId));

	return [firstRow, secondRow];
}
