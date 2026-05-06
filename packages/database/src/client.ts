import { schema } from "@repo/schema";
import { ZenStackClient } from "@zenstackhq/orm";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";

type AuthUser = {
	id: string;
};

let sharedPool: Pool | null = null;

const getPool = () => {
	if (!process.env['DATABASE_URL']) {
		throw new Error(
			"DATABASE_URL is required to initialize the ZenStack client",
		);
	}

	if (!sharedPool) {
		sharedPool = new Pool({
			connectionString: process.env['DATABASE_URL'],
		});
	}

	return sharedPool;
};


export const createZenStackDb = (user: AuthUser) => {
	const dialect = new PostgresDialect({
		pool: getPool(),
	});

	return new ZenStackClient(schema, {
		dialect,
		user: {
			id: user.id,
		},
	});
};

export const canUseZenStackDb = () => Boolean(process.env['DATABASE_URL']);
