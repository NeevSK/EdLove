/**
 * Web shim for expo-application
 */
export const nativeApplicationVersion = '1.0.0';
export const nativeBuildVersion = '1';
export const applicationName = 'Gurudevi';
export const applicationId = 'com.neevsk.gurudevi';

export async function getInstallationTimeAsync() {
    return Date.now();
}

export default {
    nativeApplicationVersion,
    nativeBuildVersion,
    applicationName,
    applicationId,
    getInstallationTimeAsync,
};
