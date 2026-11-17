import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "./store";

// The usual React Redux hooks, with this app's types filled in once.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
