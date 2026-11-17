import { configureStore } from "@reduxjs/toolkit";

import { jobsReducer, type ThunkExtra } from "./jobsSlice";

/**
 * Creates the Redux store. The app creates one in StoreProvider; each test
 * creates its own with a fake storage and a fixed date.
 */
export function makeStore(extra: ThunkExtra) {
  return configureStore({
    reducer: { jobs: jobsReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: { extraArgument: extra } }),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
