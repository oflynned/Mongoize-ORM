export type Config = {
  debug: boolean;
};

export const defaultConfig: Config = {
  debug: false
};

export const buildConfig = (config: Partial<Config>): Config => {
  return { ...defaultConfig, ...config };
};
