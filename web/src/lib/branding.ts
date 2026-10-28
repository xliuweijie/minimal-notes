export const APP_NAME = "最简笔记";
export const APP_DESCRIPTION = "只管写下来。简单记录，轻松回看。";
export const APP_LOGO = "/note-logo.svg";

export const getAppTitle = (customTitle?: string): string => {
  const title = customTitle?.trim();
  return !title || title === "Memos" ? APP_NAME : title;
};

export const getAppLogo = (customLogo?: string): string => {
  const logo = customLogo?.trim();
  return !logo || logo === "/logo.webp" || logo === "/full-logo.webp" ? APP_LOGO : logo;
};
