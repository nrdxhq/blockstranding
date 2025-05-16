export type MenuItem = {
  label: string
  page?: MenuPage
  disabled?: boolean
  onClick?: () => void
};

export enum MenuPage {
  START_GAME = 'START_GAME',
  SETTINGS = 'SETTINGS',
  ABOUT_GAME = 'ABOUT_GAME',
  CONTROLS = 'CONTROLS',
}
