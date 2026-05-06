declare module "expo-task-manager" {
	export function defineTask(
		taskName: string,
		task: (...args: any[]) => any,
	): void;
	export function isTaskRegisteredAsync(taskName: string): Promise<boolean>;
}

declare module "expo-background-task" {
	export const BackgroundTaskResult: {
		NewData: number;
		NoData: number;
		Failed: number;
	};
	export const BackgroundTaskStatus: {
		Available: number;
		Denied: number;
		Restricted: number;
	};
	export type BackgroundTaskOptions = {
		minimumInterval?: number;
		stopOnTerminate?: boolean;
		startOnBoot?: boolean;
	};

	export function getStatusAsync(): Promise<number>;
	export function registerTaskAsync(
		taskName: string,
		options?: BackgroundTaskOptions,
	): Promise<void>;
	export function unregisterTaskAsync(taskName: string): Promise<void>;
	export function triggerTaskWorkerForTestingAsync(taskName: string): Promise<void>;
}

