const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Precisamos do seu email!"],
        trim: true,
        index: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, "Onde está seu nome?"]
    },
    familyName: {
        type: String,
        required: false
    },
    givenName: {
        type: String,
        required: false
    },
    googleId: {
        type: String,
        required: false
    },
    imageUrl: {
        type: String,
        required: false
    },
    cpf: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: false
    },
    passResetExpires: {
        type: Date
    },
    passResetToken: {
        type: String
    },
    accountTokenValidate: {
        type: String
    },
    type: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    status: {
        type: String,
        enum: ["active", "deactive"],
        default: "deactive"
    },
    plan: {
        type: String,
        enum: ["basic", "pro"],
        default: "basic"
    },
    role: {
        type: String,
        enum: ["common", "manager", "admin"],
        default: "common"
    },
}, { timestamps: true });
module.exports = mongoose.model("User", UserSchema);
