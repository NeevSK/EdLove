import React from 'react';

type RuntimeMetadata = {
  platform: string;
};

export type RuntimePort = {
  device: {
    getMetadata: () => RuntimeMetadata;
  };
};

export type StoragePort = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
};

export type StorageKeysPort = {
  DRAFT_FORM: string;
};

export type ApiPort = {
  identity: {
    getMyInternalId: () => Promise<string | null>;
  };
  forms: {
    create: (payload: {
      owner_id: string | null;
      title: string;
      description: string;
      config: unknown;
      is_published: boolean;
      slug?: string;
    }) => Promise<{ id: string }>;
    update: (
      id: string,
      payload: {
        owner_id: string | null;
        title: string;
        description: string;
        config: unknown;
        is_published: boolean;
        slug?: string;
      },
    ) => Promise<{ id: string }>;
    getResponses: (id: string) => Promise<any[]>;
  };
};

export type FeatureGuardPort = React.ComponentType<{
  feature: string;
  children: React.ReactNode;
}>;

export type QRCodeGeneratorPort = React.ComponentType<{
  value: string;
  size: number;
  backgroundColor?: string;
  color?: string;
}>;

export interface FormBuilderServices {
  runtime: RuntimePort;
  storage: StoragePort;
  storageKeys: StorageKeysPort;
  api: ApiPort;
  featureGuard: FeatureGuardPort;
  qrCodeGenerator: QRCodeGeneratorPort;
  getPublicFormUrl?: (id: string) => string;
}

const memoryStorage = new Map<string, string>();

const runtime: RuntimePort = {
  device: {
    getMetadata: () => ({
      platform: typeof window !== 'undefined' ? 'web' : 'native',
    }),
  },
};

const storage: StoragePort = {
  getString: (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key) ?? undefined;
    }

    return memoryStorage.get(key);
  },
  set: (key, value) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }

    memoryStorage.set(key, value);
  },
};

const storageKeys: StorageKeysPort = {
  DRAFT_FORM: 'form-builder:draft-form',
};

const api = {
  identity: {
    getMyInternalId: async () => null,
  },
  forms: {
    create: async () => {
      throw new Error('FormBuilder host API is not configured.');
    },
    update: async () => {
      throw new Error('FormBuilder host API is not configured.');
    },
    getResponses: async () => [],
  },
} satisfies ApiPort;

const FeatureGuard: FeatureGuardPort = ({ children }) =>
  React.createElement(React.Fragment, null, children);

const QRCodeGenerator: QRCodeGeneratorPort = ({ value }) =>
  React.createElement('code', { className: 'break-all text-xs' }, value);

export const defaultFormBuilderServices: FormBuilderServices = {
  runtime,
  storage,
  storageKeys,
  api,
  featureGuard: FeatureGuard,
  qrCodeGenerator: QRCodeGenerator,
  getPublicFormUrl: (id) =>
    `${typeof window !== 'undefined' ? window.location.origin : 'https://gurudevi.app'}/f/${id}`,
};
