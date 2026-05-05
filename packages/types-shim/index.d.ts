// This is an empty type definition file to satisfy legacy peer dependencies.
// React Native 0.83+ provides its own types.
//
// Monorepo convention:
// We allow `className` on core React Native primitives to support web + tailwind-style
// styling (e.g. via `react-native-web`, `react-native-css-interop`, etc.). The runtime
// integration varies by app, but the prop is intentionally tolerated at the type level.

declare module "react-native" {
	interface ViewProps {
		className?: string | undefined;
	}

	interface TextProps {
		className?: string | undefined;
	}

	interface TextInputProps {
		className?: string | undefined;
		accessibilityDescribedBy?: string | undefined;
	}

	interface PressableProps {
		className?: string | undefined;
	}

	interface ImageProps {
		className?: string | undefined;
	}

	interface ImageBackgroundProps {
		className?: string | undefined;
	}

	interface ScrollViewProps {
		className?: string | undefined;
		contentContainerClassName?: string | undefined;
	}

	interface FlatListProps<ItemT> {
		className?: string | undefined;
		contentContainerClassName?: string | undefined;
	}
}

declare module "react-native-gifted-charts" {
	import * as React from "react";

	export const BarChart: React.ComponentType<any>;
	export const PieChart: React.ComponentType<any>;
}

declare module "react-native-gesture-handler" {
	export const Gesture: any;
	export const GestureDetector: any;
	export const GestureHandlerRootView: any;
	export const PanGestureHandler: any;
	export const PinchGestureHandler: any;
	export const State: any;
}

// PowerSync is an optional dependency. In CI/dev environments where it is not
// installed, these shims allow `tsc --noEmit` to run so we can keep the rest of
// the monorepo type-safe.
declare module "@powersync/react-native" {
	export const column: {
		text: any;
		integer: any;
	};

	export class Table {
		constructor(definition: Record<string, any>);
	}

	export class Schema {
		constructor(tables: Record<string, any>);
		types: any;
	}

	export type CrudEntry = {
		id: string;
		table: string;
		op: "PUT" | "PATCH" | "DELETE";
		opData?: Record<string, any> | null;
	};

	export type PowerSyncCredentials = { endpoint: string; token: string };

	export interface AbstractPowerSyncDatabase {
		getCrudBatch(limit: number): Promise<{
			crud: CrudEntry[];
			complete(): Promise<void>;
		}>;
	}

	export interface PowerSyncBackendConnector {
		fetchCredentials(): Promise<PowerSyncCredentials>;
		uploadData(database: AbstractPowerSyncDatabase): Promise<void>;
	}

	export class PowerSyncDatabase implements AbstractPowerSyncDatabase {
		constructor(options: any);
		connect(connector: PowerSyncBackendConnector): Promise<void>;
		disconnect(): Promise<void>;
		getCrudBatch(limit: number): Promise<{
			crud: CrudEntry[];
			complete(): Promise<void>;
		}>;
	}
}

declare module "@powersync/react" {
	import * as React from "react";
	import type { PowerSyncDatabase } from "@powersync/react-native";

	export const PowerSyncContext: React.Context<PowerSyncDatabase>;
	export function useQuery<T = Record<string, unknown>>(
		sql: string,
		parameters?: unknown[],
	): { data: T[] };
	export function useStatus(): any;
}

export {};
