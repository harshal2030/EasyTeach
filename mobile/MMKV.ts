import MMKVStorage from 'react-native-mmkv-storage';

export const MMKV = new MMKVStorage.Loader()
  .withInstanceID('easyInstance')
  .setProcessingMode(MMKVStorage.MODES.MULTI_PROCESS)
  .withEncryption()
  .initialize();
