const hasStorageApi = !!window.localStorage;

const key = 'DING_MENU_VISIBLE';

export const getCachedMenuVisible = () => {
  if (!hasStorageApi) {
    return true;
  }

  const visible = localStorage.getItem(key);

  try {
    return JSON.parse(visible);
  } catch (e) {
    return true;
  }
};

export const setCachedMenuVisible = visible => {
  if (!hasStorageApi) {
    return;
  }

  localStorage.setItem(key, visible);
};
