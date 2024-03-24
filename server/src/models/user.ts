import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
    userId: String,
    accessToken: String,
});

const user = model('User', userSchema);
export default user;