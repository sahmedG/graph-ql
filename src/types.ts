/**
 * NavItem type used with the Navbar component
 */
export type NavItem = {
  title: string; // the title of the nav item
  slug: string; // the slug of the nav item i.e '/about'
};

export type JWTToken = {
  userId: number;
};

// https://dev.to/mustapha/how-to-create-an-interactive-svg-donut-chart-using-angular-19eo
export interface DonutSlice {
  id: number;
  percent: number;
  color: string;
  label?: string;
  onClickCb?: () => void;
}

export interface Audit {
  grade: number | null;
  endAt: string;
  group: {
    captainLogin: string;
    path: string;
  };
  resultId: string | null;
  xpGained: number;
}
