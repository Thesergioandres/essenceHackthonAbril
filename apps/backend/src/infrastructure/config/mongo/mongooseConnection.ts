import mongoose from "mongoose";

const CONNECTED_READY_STATE = 1;

export const connectMongoDb = async (uri: string): Promise<void> => {
  await mongoose.connect(uri);
};

export const isMongoDbConnected = (): boolean => {
  return mongoose.connection.readyState === CONNECTED_READY_STATE;
};