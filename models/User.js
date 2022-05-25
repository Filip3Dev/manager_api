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
    cpf: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
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
}, { timestamps: true });
module.exports = mongoose.model("User", UserSchema);
