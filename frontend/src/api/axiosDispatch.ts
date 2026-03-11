import type { AppDispatch } from "../slices/store";

let appDispatch: AppDispatch | null = null;

export const setAxiosDispatch = (dispatch: AppDispatch) => {
  appDispatch = dispatch;
};

export const getAxiosDispatch = () => appDispatch;