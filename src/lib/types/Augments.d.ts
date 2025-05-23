import type { prismaType } from '#lib/setup/prisma';
import type { BloombotEvents, CreateServerEventPayload, PostEmbedPayload, UpdateEmbedPayload, UpdateServerEventPayload } from '#lib/util/constants';
import type { Nullish } from '@sapphire/utilities';
import type { BooleanString, IntegerString } from '@skyra/env-utilities';
import type { Events, WebhookClient } from 'discord.js';

declare module '@sapphire/pieces' {
	interface Container {
		prisma: prismaType;
		/**
		 * The webhook to use for the error event.
		 */
		webhookError: Nullish | WebhookClient;
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		IsEventManager: never;
		VerifiedServer: never;
	}

	interface SapphireClient {
		emit(event: Events.Error, error: Error): boolean;
		emit(event: BloombotEvents.CreateServerEvent, payload: CreateServerEventPayload): boolean;
		emit(event: BloombotEvents.UpdateServerEvent, payload: UpdateServerEventPayload): boolean;
		emit(event: BloombotEvents.PostEmbed, payload: PostEmbedPayload): boolean;
		emit(event: BloombotEvents.UpdateEmbed, payload: UpdateEmbedPayload): boolean;
	}
}

declare module '@skyra/env-utilities' {
	interface Env {
		CLIENT_VERSION: string;

		DATABASE_URL: string;
		DISCORD_TOKEN: string;
		REDIS_HOST: string;
		REDIS_PASSWORD: string;

		REDIS_PORT: IntegerString;
		REDIS_TASK_DB: IntegerString;
		WEBHOOK_ERROR_ENABLED: BooleanString;

		WEBHOOK_ERROR_ID: string;

		WEBHOOK_ERROR_TOKEN: string;
	}
}
