import MMKVStorage from 'react-native-mmkv-storage';

export const MMKV = new MMKVStorage.Loader()
  .withInstanceID('easyInstance')
  .setProcessingMode(MMKVStorage.MODES.SINGLE_PROCESS)
  .withEncryption()
  .initialize();

export const dataStore = new MMKVStorage.Loader()
  .withInstanceID('dataStore')
  .setProcessingMode(MMKVStorage.MODES.MULTI_PROCESS)
  .initialize();
