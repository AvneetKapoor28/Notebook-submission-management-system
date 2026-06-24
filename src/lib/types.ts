export type ActionResult<T = void> = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
};

export type NavLink = {
  href: string;
  label: string;
};
